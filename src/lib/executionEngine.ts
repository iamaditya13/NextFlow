import { tasks } from '@trigger.dev/sdk/v3'
import { prisma } from '@/lib/prisma'

interface WorkflowNode {
  id: string
  type: string
  data: any
}

interface WorkflowEdge {
  id: string
  source: string
  sourceHandle: string
  target: string
  targetHandle: string
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
  const nodesToRun =
    scope === 'full' ? nodes : nodes.filter((n) => selectedNodeIds?.includes(n.id))

  let run: any

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
      nodeName: node.data?.label || node.type,
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
  const nodeOutputs = new Map<string, any>()

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
      readyNodes.map((node) => executeNode(node, run.id, edges, nodeOutputs))
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

        await markDownstreamFailed(node.id, nodesToRun, edges, failed, run.id)
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

async function executeNode(
  node: WorkflowNode,
  runId: string,
  edges: WorkflowEdge[],
  nodeOutputs: Map<string, any>
): Promise<any> {
  const getInput = (handleId: string): any => {
    const edge = edges.find((e) => e.target === node.id && e.targetHandle === handleId)
    if (!edge) return null
    return nodeOutputs.get(edge.source) || null
  }

  const getImageUrls = (): string[] => {
    return edges
      .filter((e) => e.target === node.id && e.targetHandle === 'images')
      .map((e) => {
        const output = nodeOutputs.get(e.source)
        return output?.url || output?.fileUrl
      })
      .filter(Boolean)
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
      const url = node.data.fileUrl || node.data.url || ''
      const success = !!url

      await prisma.nodeResult.updateMany({
        where: { runId, nodeId: node.id },
        data: {
          status: success ? 'SUCCESS' : 'FAILED',
          outputs: success ? { url } : undefined,
          error: success ? null : 'No file uploaded',
          startedAt: new Date(),
          completedAt: new Date(),
          duration: 0,
        },
      })

      if (!success) {
        throw new Error(`No file uploaded in ${node.type} node`)
      }

      return { url }
    }

    case 'llm': {
      const systemPromptInput = getInput('system_prompt')
      const userMessageInput = getInput('user_message')
      const imageUrls = getImageUrls()

      const systemPrompt = systemPromptInput?.text || node.data.systemPrompt || undefined
      const userMessage = userMessageInput?.text || node.data.userMessage || ''

      if (!userMessage) {
        throw new Error('LLM node: no user message provided')
      }

      const result = await tasks.triggerAndWait('llm-execution', {
        model: node.data.model || 'gemini-1.5-flash',
        systemPrompt,
        userMessage,
        imageUrls,
        runId,
        nodeId: node.id,
      })

      if (!result.ok) {
        const errorMessage =
          typeof result.error === 'string'
            ? result.error
            : result.error &&
                typeof result.error === 'object' &&
                'message' in result.error
              ? String((result.error as { message?: unknown }).message ?? 'LLM task failed')
              : 'LLM task failed'

        throw new Error(errorMessage)
      }

      return result.output
    }

    case 'cropImage': {
      const imageInput = getInput('image_url')
      const xInput = getInput('x_percent')
      const yInput = getInput('y_percent')
      const wInput = getInput('width_percent')
      const hInput = getInput('height_percent')

      const imageUrl = imageInput?.url || imageInput?.fileUrl || node.data.fileUrl

      if (!imageUrl) {
        throw new Error('Crop node: no image URL provided')
      }

      const result = await tasks.triggerAndWait('crop-image', {
        imageUrl,
        xPercent: xInput?.value ?? node.data.xPercent ?? 0,
        yPercent: yInput?.value ?? node.data.yPercent ?? 0,
        widthPercent: wInput?.value ?? node.data.widthPercent ?? 100,
        heightPercent: hInput?.value ?? node.data.heightPercent ?? 100,
        runId,
        nodeId: node.id,
      })

      if (!result.ok) {
        throw new Error('Crop image task failed')
      }

      return result.output
    }

    case 'extractFrame': {
      const videoInput = getInput('video_url')
      const timestampInput = getInput('timestamp')

      const videoUrl = videoInput?.url || videoInput?.fileUrl || node.data.fileUrl

      if (!videoUrl) {
        throw new Error('Extract Frame: no video URL provided')
      }

      const result = await tasks.triggerAndWait('extract-frame', {
        videoUrl,
        timestamp: timestampInput?.value ?? node.data.timestamp ?? '0',
        runId,
        nodeId: node.id,
      })

      if (!result.ok) {
        throw new Error('Extract frame task failed')
      }

      return result.output
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
  runId: string
) {
  const downstream = nodes.filter((n) =>
    edges.some((e) => e.source === failedNodeId && e.target === n.id)
  )

  for (const node of downstream) {
    if (!failed.has(node.id)) {
      failed.add(node.id)
      await prisma.nodeResult.updateMany({
        where: { runId, nodeId: node.id },
        data: {
          status: 'FAILED',
          error: `Upstream node failed: ${failedNodeId}`,
          startedAt: new Date(),
          completedAt: new Date(),
          duration: 0,
        },
      })

      await markDownstreamFailed(node.id, nodes, edges, failed, runId)
    }
  }
}
