import { prisma } from '@/lib/prisma'
import { triggerTaskAndPoll } from '@/lib/triggerTaskRunner'
import { DEFAULT_GEMINI_MODEL } from '@/lib/models/geminiModels'

interface WorkflowNode {
  id: string
  type: string
  data: Record<string, unknown>
}

interface WorkflowEdge {
  id: string
  source: string
  sourceHandle: string
  target: string
  targetHandle: string
}

const NODE_RETRY_ATTEMPTS = 2
const NODE_RETRY_BASE_DELAY_MS = 1200
const RETRYABLE_NODE_ERROR_PATTERNS = [
  'timed out',
  'timeout',
  'socket hang up',
  'econnreset',
  'econnrefused',
  '429',
  '503',
]

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return 'Unknown error'
}

function isRetryableNodeError(err: unknown): boolean {
  const message = getErrorMessage(err).toLowerCase()
  return RETRYABLE_NODE_ERROR_PATTERNS.some((pattern) => message.includes(pattern))
}

export async function executeWorkflow(
  workflowId: string,
  userId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  scope: 'full' | 'partial' | 'single',
  selectedNodeIds?: string[],
  existingRunId?: string
) {
  const allNodesById = new Map(nodes.map((node) => [node.id, node]))
  const selectedIds = new Set(
    (selectedNodeIds || []).filter((nodeId) => allNodesById.has(nodeId))
  )

  const nodeIdsToRun = new Set<string>()
  if (scope === 'full') {
    for (const node of nodes) nodeIdsToRun.add(node.id)
  } else {
    // Always execute selected nodes plus all their upstream dependencies so
    // connected inputs are available for PARTIAL/SINGLE runs.
    const queue = [...selectedIds]
    for (const nodeId of selectedIds) nodeIdsToRun.add(nodeId)

    while (queue.length > 0) {
      const targetId = queue.shift()!
      const inboundEdges = edges.filter((edge) => edge.target === targetId)
      for (const edge of inboundEdges) {
        if (!allNodesById.has(edge.source) || nodeIdsToRun.has(edge.source)) continue
        nodeIdsToRun.add(edge.source)
        queue.push(edge.source)
      }
    }
  }

  const nodesToRun = nodes.filter((node) => nodeIdsToRun.has(node.id))

  let run: { id: string; startedAt: Date } | null = null

  if (existingRunId) {
    run = await prisma.workflowRun.findUnique({
      where: { id: existingRunId },
    })
  } else {
    run = await prisma.workflowRun.create({
      data: {
        workflowId,
        userId,
        status: 'RUNNING',
        scope: scope === 'full' ? 'FULL' : scope === 'single' ? 'SINGLE' : 'PARTIAL',
      },
    })
  }

  if (!run) {
    throw new Error('Unable to initialize workflow run')
  }

  await prisma.nodeResult.createMany({
    data: nodesToRun.map((node) => ({
      runId: run.id,
      nodeId: node.id,
      nodeName: (node.data?.label as string) || node.type,
      nodeType: node.type,
      status: 'PENDING' as const,
    })),
  })

  const nodeMap = new Map(nodesToRun.map((n) => [n.id, n]))

  const dependencyMap = new Map<string, Set<string>>()
  for (const node of nodesToRun) {
    dependencyMap.set(node.id, new Set())
  }

  for (const edge of edges) {
    if (nodeMap.has(edge.target) && nodeMap.has(edge.source)) {
      dependencyMap.get(edge.target)?.add(edge.source)
    }
  }

  const completed = new Set<string>()
  const failed = new Set<string>()
  const nodeOutputs = new Map<string, Record<string, unknown>>()

  const getReadyNodes = (): WorkflowNode[] => {
    return nodesToRun.filter((node) => {
      if (completed.has(node.id)) return false
      if (failed.has(node.id)) return false
      const deps = dependencyMap.get(node.id) || new Set()
      return [...deps].every((dep) => completed.has(dep))
    })
  }

  let iterations = 0
  const maxIterations = nodesToRun.length + 1

  while (completed.size + failed.size < nodesToRun.length && iterations < maxIterations) {
    iterations++
    const readyNodes = getReadyNodes()

    if (readyNodes.length === 0) {
      break
    }

    const results = await Promise.allSettled(
      readyNodes.map((node) =>
        executeNodeWithRetry(node, run.id, edges, nodeOutputs, NODE_RETRY_ATTEMPTS)
      )
    )

    for (let i = 0; i < results.length; i++) {
      const node = readyNodes[i]
      const result = results[i]

      if (result.status === 'fulfilled') {
        completed.add(node.id)
        nodeOutputs.set(node.id, result.value)
      } else {
        failed.add(node.id)
        nodeOutputs.set(node.id, {
          error: result.reason?.message || 'Unknown error',
        })

        await markDownstreamFailed(node.id, nodesToRun, edges, failed, run.id, nodeOutputs)
      }
    }
  }

  let finalStatus: 'SUCCESS' | 'FAILED' | 'PARTIAL'

  if (failed.size === 0) {
    finalStatus = 'SUCCESS'
  } else if (completed.size === 0) {
    finalStatus = 'FAILED'
  } else {
    finalStatus = 'PARTIAL'
  }

  const endTime = new Date()
  const duration = endTime.getTime() - run.startedAt.getTime()

  await prisma.workflowRun.update({
    where: { id: run.id },
    data: {
      status: finalStatus,
      completedAt: endTime,
      duration,
    },
  })

  return {
    runId: run.id,
    status: finalStatus,
    nodeOutputs: Object.fromEntries(nodeOutputs),
    completed: [...completed],
    failed: [...failed],
  }
}

async function executeNodeWithRetry(
  node: WorkflowNode,
  runId: string,
  edges: WorkflowEdge[],
  nodeOutputs: Map<string, Record<string, unknown>>,
  maxAttempts: number
): Promise<Record<string, unknown>> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await executeNode(node, runId, edges, nodeOutputs)
    } catch (err: unknown) {
      lastError = err
      const retryable = attempt < maxAttempts && isRetryableNodeError(err)
      console.error('[executionEngine] node execution failed', {
        nodeId: node.id,
        nodeType: node.type,
        attempt,
        retryable,
        error: getErrorMessage(err),
      })

      if (!retryable) {
        break
      }

      await sleep(NODE_RETRY_BASE_DELAY_MS * attempt)
    }
  }

  throw lastError instanceof Error ? lastError : new Error(getErrorMessage(lastError))
}

async function executeNode(
  node: WorkflowNode,
  runId: string,
  edges: WorkflowEdge[],
  nodeOutputs: Map<string, Record<string, unknown>>
): Promise<Record<string, unknown>> {
  const extractString = (input: Record<string, unknown> | null): string | undefined => {
    if (!input) return undefined
    const candidates = [input.text, input.value, input.url, input.fileUrl]
    for (const candidate of candidates) {
      if (typeof candidate === 'string') return candidate
    }
    return undefined
  }

  const extractNumber = (input: Record<string, unknown> | null): number | undefined => {
    if (!input) return undefined
    const candidates = [input.value, input.text]
    for (const candidate of candidates) {
      if (typeof candidate === 'number' && Number.isFinite(candidate)) return candidate
      if (typeof candidate === 'string') {
        const parsed = Number(candidate)
        if (Number.isFinite(parsed)) return parsed
      }
    }
    return undefined
  }

  const extractUrl = (input: Record<string, unknown> | null): string | undefined => {
    if (!input) return undefined
    const candidates = [input.url, input.fileUrl, input.text, input.value]
    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.length > 0) return candidate
    }
    return undefined
  }

  const getInput = (handleId: string): Record<string, unknown> | null => {
    const edge = [...edges]
      .reverse()
      .find((e) => e.target === node.id && e.targetHandle === handleId)
    if (!edge) return null
    return nodeOutputs.get(edge.source) ?? null
  }

  const getImageUrls = (): string[] => {
    return edges
      .filter((e) => e.target === node.id && e.targetHandle === 'images')
      .map((e) => {
        const output = nodeOutputs.get(e.source) ?? null
        return extractUrl(output)
      })
      .filter((url): url is string => typeof url === 'string' && url.length > 0)
  }

  switch (node.type) {
    case 'text': {
      const text = node.data.text || ''
      await prisma.nodeResult.updateMany({
        where: { runId, nodeId: node.id },
        data: {
          status: 'SUCCESS',
          outputs: { text },
          startedAt: new Date(),
          completedAt: new Date(),
          duration: 0,
        },
      })
      return { text }
    }

    case 'uploadImage':
    case 'uploadVideo': {
      const url = (node.data.fileUrl as string) || (node.data.url as string) || ''
      const hasFile = !!url

      await prisma.nodeResult.updateMany({
        where: { runId, nodeId: node.id },
        data: {
          status: hasFile ? 'SUCCESS' : 'FAILED',
          outputs: hasFile ? { url } : undefined,
          error: hasFile ? null : 'No file uploaded',
          startedAt: new Date(),
          completedAt: new Date(),
          duration: 0,
        },
      })

      if (!hasFile) {
        throw new Error(`No file uploaded in ${node.type} node`)
      }

      return { url }
    }

    case 'llm': {
      const systemPromptInput = getInput('system_prompt')
      const userMessageInput = getInput('user_message')
      const imageUrls = getImageUrls()

      const systemPrompt =
        extractString(systemPromptInput) || (node.data.systemPrompt as string | undefined) || undefined
      const userMessage = extractString(userMessageInput) || (node.data.userMessage as string) || ''

      if (!userMessage) {
        throw new Error('LLM node: no user message provided')
      }

      const { output } = await triggerTaskAndPoll(
        'llm-execution',
        {
          model: (node.data.model as string) || DEFAULT_GEMINI_MODEL,
          systemPrompt,
          userMessage,
          imageUrls,
          runId,
          nodeId: node.id,
        },
        {
          label: `LLM task (${node.id})`,
          pollIntervalMs: 500,
          timeoutMs: 120_000,
        }
      )

      const text = (output as { text?: unknown }).text
      if (typeof text !== 'string') {
        throw new Error('LLM task returned no text')
      }

      return { text }
    }

    case 'cropImage': {
      const imageInput = getInput('image_url')
      const xInput = getInput('x_percent')
      const yInput = getInput('y_percent')
      const wInput = getInput('width_percent')
      const hInput = getInput('height_percent')

      const imageUrl = extractUrl(imageInput) || (node.data.fileUrl as string | undefined)

      if (!imageUrl) {
        throw new Error('Crop node: no image URL provided')
      }

      const { output } = await triggerTaskAndPoll(
        'crop-image',
        {
          imageUrl,
          xPercent: extractNumber(xInput) ?? (node.data.xPercent as number) ?? 0,
          yPercent: extractNumber(yInput) ?? (node.data.yPercent as number) ?? 0,
          widthPercent: extractNumber(wInput) ?? (node.data.widthPercent as number) ?? 100,
          heightPercent: extractNumber(hInput) ?? (node.data.heightPercent as number) ?? 100,
          runId,
          nodeId: node.id,
        },
        {
          label: `Crop image task (${node.id})`,
          pollIntervalMs: 300,
          timeoutMs: 120_000,
        }
      )

      const url = (output as { url?: unknown }).url
      if (typeof url !== 'string' || url.length === 0) {
        throw new Error('Crop image task returned no URL')
      }

      return { url }
    }

    case 'extractFrame': {
      const videoInput = getInput('video_url')
      const timestampInput = getInput('timestamp')

      const videoUrl = extractUrl(videoInput) || (node.data.fileUrl as string | undefined)

      if (!videoUrl) {
        throw new Error('Extract Frame: no video URL provided')
      }

      const { output } = await triggerTaskAndPoll(
        'extract-frame',
        {
          videoUrl,
          timestamp: extractString(timestampInput) ?? (node.data.timestamp as string) ?? '0',
          runId,
          nodeId: node.id,
        },
        {
          label: `Extract frame task (${node.id})`,
          pollIntervalMs: 300,
          timeoutMs: 120_000,
        }
      )

      const url = (output as { url?: unknown }).url
      if (typeof url !== 'string' || url.length === 0) {
        throw new Error('Extract frame task returned no URL')
      }

      return { url }
    }

    default:
      throw new Error(`Unknown node type: ${node.type}`)
  }
}

async function markDownstreamFailed(
  failedNodeId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  failed: Set<string>,
  runId: string,
  nodeOutputs: Map<string, Record<string, unknown>>
) {
  const upstreamError = nodeOutputs.get(failedNodeId)?.error
  const upstreamMessage =
    typeof upstreamError === 'string' && upstreamError.trim().length > 0
      ? upstreamError
      : null

  const downstream = nodes.filter((n) =>
    edges.some((e) => e.source === failedNodeId && e.target === n.id)
  )

  for (const node of downstream) {
    if (!failed.has(node.id)) {
      failed.add(node.id)
      const failureMessage = upstreamMessage
        ? `Upstream node failed: ${failedNodeId}. ${upstreamMessage}`
        : `Upstream node failed: ${failedNodeId}`
      nodeOutputs.set(node.id, { error: failureMessage })

      await prisma.nodeResult.updateMany({
        where: { runId, nodeId: node.id },
        data: {
          status: 'FAILED',
          error: failureMessage,
          startedAt: new Date(),
          completedAt: new Date(),
          duration: 0,
        },
      })

      await markDownstreamFailed(node.id, nodes, edges, failed, runId, nodeOutputs)
    }
  }
}
