/**
 * Client-side DAG workflow executor.
 *
 * Executes nodes in dependency order with parallel execution of independent branches.
 * Calls the existing API routes for LLM, crop-image, and extract-frame processing.
 * Handles fan-in (convergence) nodes — e.g. a final LLM node that waits for both
 * a product-image branch AND a video-frame branch to complete before running.
 */
import { DEFAULT_GEMINI_MODEL } from '@/lib/models/geminiModels'

export type NodeExecutionStatus = 'idle' | 'waiting' | 'running' | 'success' | 'failed'

export interface ExecutorNode {
  id: string
  type: string
  data: Record<string, unknown>
}

export interface ExecutorEdge {
  id: string
  source: string
  sourceHandle: string
  target: string
  targetHandle: string
}

export interface ExecutorCallbacks {
  /** Called whenever a node's execution status changes. */
  onNodeStatus: (nodeId: string, status: NodeExecutionStatus) => void
  /** Called when a node produces output (or an error object). */
  onNodeOutput: (nodeId: string, output: Record<string, unknown>) => void
  /** Called once all nodes have either completed or failed. */
  onComplete: (summary: { completed: string[]; failed: string[] }) => void
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getInputForHandle(
  nodeId: string,
  handleId: string,
  edges: ExecutorEdge[],
  outputs: Map<string, Record<string, unknown>>
): Record<string, unknown> | null {
  const edge = [...edges].reverse().find(
    (e) => e.target === nodeId && e.targetHandle === handleId
  )
  if (!edge) return null
  return outputs.get(edge.source) ?? null
}

function getInputString(input: Record<string, unknown> | null): string | undefined {
  if (!input) return undefined

  const candidates = [input.text, input.value, input.url, input.fileUrl]
  for (const candidate of candidates) {
    if (typeof candidate === 'string') return candidate
  }

  return undefined
}

function getInputNumber(input: Record<string, unknown> | null): number | undefined {
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

function getInputUrl(input: Record<string, unknown> | null): string | undefined {
  if (!input) return undefined

  const candidates = [input.url, input.fileUrl, input.text, input.value]
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.length > 0) return candidate
  }

  return undefined
}

/** Collect all image URLs wired to the `images` target handle of a node. */
function getImageUrlsForNode(
  nodeId: string,
  edges: ExecutorEdge[],
  outputs: Map<string, Record<string, unknown>>
): string[] {
  return edges
    .filter((e) => e.target === nodeId && e.targetHandle === 'images')
    .map((e) => {
      const out = outputs.get(e.source)
      return getInputUrl(out ?? null)
    })
    .filter((u): u is string => typeof u === 'string' && u.length > 0)
}

// ── Timeout-aware fetch ──────────────────────────────────────────────────────

const NODE_FETCH_TIMEOUT_MS = 120_000 // 2 minutes — matches API route maxDuration
const NODE_EXEC_RETRY_ATTEMPTS = 2
const NODE_EXEC_RETRY_BASE_DELAY_MS = 1_000
const NODE_TRIGGER_RUN_POLL_INTERVAL_MS = 1_000
const TERMINAL_TRIGGER_RUN_FAILURE_STATUSES = new Set([
  'FAILED',
  'CANCELED',
  'CANCELLED',
  'TIMED_OUT',
  'SYSTEM_FAILURE',
  'CRASHED',
  'INTERRUPTED',
])
const RETRYABLE_NODE_ERROR_PATTERNS = [
  'timed out',
  'timeout',
  'networkerror',
  'failed to fetch',
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

function getRunErrorMessage(runError: unknown): string {
  if (!runError) return 'Unknown Trigger run error'
  if (runError instanceof Error) return runError.message
  if (typeof runError === 'string') return runError
  if (
    typeof runError === 'object' &&
    runError &&
    'message' in runError &&
    typeof (runError as { message?: unknown }).message === 'string'
  ) {
    return (runError as { message: string }).message
  }
  return JSON.stringify(runError)
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = NODE_FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after ${timeoutMs / 1000}s`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

async function waitForTriggerRunOutput(
  runId: string,
  label: string,
  timeoutMs: number = NODE_FETCH_TIMEOUT_MS
): Promise<Record<string, unknown>> {
  const startedAt = Date.now()
  let lastStatus = ''

  while (Date.now() - startedAt < timeoutMs) {
    const encodedRunId = encodeURIComponent(runId)
    const res = await fetchWithTimeout(
      `/api/trigger-runs/${encodedRunId}`,
      { method: 'GET' },
      timeoutMs
    )
    const json = await res.json()

    if (!json?.success) {
      throw new Error(json?.error || `${label} run lookup failed`)
    }

    const status = String(json.data?.status || 'UNKNOWN')
    if (status !== lastStatus) {
      lastStatus = status
      console.log('[workflowExecutor] trigger run status', { label, runId, status })
    }

    if (status === 'COMPLETED') {
      const output = json.data?.output
      if (!output || typeof output !== 'object') {
        throw new Error(`${label} completed without output`)
      }
      return output as Record<string, unknown>
    }

    if (TERMINAL_TRIGGER_RUN_FAILURE_STATUSES.has(status)) {
      const runError = getRunErrorMessage(json.data?.error)
      throw new Error(`${label} failed (${status}): ${runError}`)
    }

    await sleep(NODE_TRIGGER_RUN_POLL_INTERVAL_MS)
  }

  throw new Error(`${label} did not complete within ${timeoutMs / 1000}s`)
}

// ── Per-node execution ────────────────────────────────────────────────────────

async function executeNode(
  node: ExecutorNode,
  edges: ExecutorEdge[],
  outputs: Map<string, Record<string, unknown>>
): Promise<Record<string, unknown>> {
  switch (node.type) {
    // Text node — instantly resolves with its static content
    case 'text': {
      return { text: (node.data.text as string) || '' }
    }

    // Upload nodes — validate that a file was already provided
    case 'uploadImage':
    case 'uploadVideo': {
      const url = (node.data.fileUrl as string) || ''
      if (!url) {
        throw new Error(`No file uploaded for "${node.data.label || node.type}"`)
      }
      return { url }
    }

    // Crop Image — POST to server route which uses the Trigger.dev crop task
    case 'cropImage': {
      const imageInput = getInputForHandle(node.id, 'image_url', edges, outputs)
      const imageUrl = (getInputUrl(imageInput) ?? node.data.fileUrl) as
        | string
        | undefined
      if (!imageUrl) {
        throw new Error(`Crop Image "${node.data.label}": no image provided`)
      }

      const xPercent = getInputNumber(getInputForHandle(node.id, 'x_percent', edges, outputs))
      const yPercent = getInputNumber(getInputForHandle(node.id, 'y_percent', edges, outputs))
      const widthPercent = getInputNumber(
        getInputForHandle(node.id, 'width_percent', edges, outputs)
      )
      const heightPercent = getInputNumber(
        getInputForHandle(node.id, 'height_percent', edges, outputs)
      )

      const res = await fetchWithTimeout('/api/nodes/crop-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          xPercent: xPercent ?? (node.data.xPercent as number) ?? 0,
          yPercent: yPercent ?? (node.data.yPercent as number) ?? 0,
          widthPercent: widthPercent ?? (node.data.widthPercent as number) ?? 100,
          heightPercent: heightPercent ?? (node.data.heightPercent as number) ?? 100,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Crop image trigger failed')

      const runId = json?.data?.runId
      if (typeof runId !== 'string' || runId.length === 0) {
        throw new Error('Crop image trigger did not return runId')
      }

      const output = await waitForTriggerRunOutput(runId, 'Crop image task')
      const outputUrl = output.url
      if (typeof outputUrl !== 'string' || outputUrl.length === 0) {
        throw new Error('Crop image task returned no URL')
      }
      return { url: outputUrl }
    }

    // Extract Frame — POST to server route which uses the Trigger.dev extract-frame task
    case 'extractFrame': {
      const videoInput = getInputForHandle(node.id, 'video_url', edges, outputs)
      const videoUrl = (getInputUrl(videoInput) ?? node.data.fileUrl) as
        | string
        | undefined
      if (!videoUrl) {
        throw new Error(`Extract Frame "${node.data.label}": no video provided`)
      }

      const timestampInput = getInputForHandle(node.id, 'timestamp', edges, outputs)
      const timestamp = getInputString(timestampInput)

      const res = await fetchWithTimeout('/api/nodes/extract-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl,
          timestamp: timestamp || (node.data.timestamp as string) || '50%',
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Extract frame trigger failed')

      const runId = json?.data?.runId
      if (typeof runId !== 'string' || runId.length === 0) {
        throw new Error('Extract frame trigger did not return runId')
      }

      const output = await waitForTriggerRunOutput(runId, 'Extract frame task')
      const outputUrl = output.url
      if (typeof outputUrl !== 'string' || outputUrl.length === 0) {
        throw new Error('Extract frame task returned no URL')
      }
      return { url: outputUrl }
    }

    // LLM — POST to server route which calls Gemini via Trigger.dev
    case 'llm': {
      const systemPromptInput = getInputForHandle(node.id, 'system_prompt', edges, outputs)
      const userMessageInput = getInputForHandle(node.id, 'user_message', edges, outputs)
      const imageUrls = getImageUrlsForNode(node.id, edges, outputs)

      const systemPrompt =
        getInputString(systemPromptInput) ||
        (node.data.systemPrompt as string | undefined) ||
        undefined

      const userMessage =
        getInputString(userMessageInput) ||
        (node.data.userMessage as string | undefined) ||
        ''

      // If there's no text message but images are present, use a fallback prompt
      const effectiveMessage =
        userMessage || (imageUrls.length > 0 ? 'Analyze the provided images.' : '')

      if (!effectiveMessage) {
        throw new Error(`LLM "${node.data.label}": no user message or images provided`)
      }

      const res = await fetchWithTimeout('/api/nodes/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: (node.data.model as string) || DEFAULT_GEMINI_MODEL,
          systemPrompt,
          userMessage: effectiveMessage,
          imageUrls,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'LLM execution failed')
      return { text: json.data.output }
    }

    default:
      throw new Error(`Unknown node type: ${node.type}`)
  }
}

async function executeNodeWithRetry(
  node: ExecutorNode,
  edges: ExecutorEdge[],
  outputs: Map<string, Record<string, unknown>>,
  maxAttempts: number
): Promise<Record<string, unknown>> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await executeNode(node, edges, outputs)
    } catch (err: unknown) {
      lastError = err
      const retryable = attempt < maxAttempts && isRetryableNodeError(err)
      console.error('[workflowExecutor] node execution failed', {
        nodeId: node.id,
        nodeType: node.type,
        attempt,
        retryable,
        error: getErrorMessage(err),
      })

      if (!retryable) {
        break
      }

      await sleep(NODE_EXEC_RETRY_BASE_DELAY_MS * attempt)
    }
  }

  throw lastError instanceof Error ? lastError : new Error(getErrorMessage(lastError))
}

// ── Main executor ─────────────────────────────────────────────────────────────

/**
 * Run a workflow as a directed acyclic graph.
 *
 * Phase model:
 *   1. Build a dependency map from edges.
 *   2. Mark nodes with no dependencies as "idle", all others as "waiting".
 *   3. In each wave, collect all ready nodes (deps fully satisfied) and execute
 *      them in parallel via Promise.allSettled.
 *   4. After each wave, update statuses, propagate failures downstream, and
 *      emit convergence-progress hints to partially-satisfied fan-in nodes.
 *   5. Repeat until every node is either complete or failed.
 */
export async function runWorkflow(
  nodes: ExecutorNode[],
  edges: ExecutorEdge[],
  callbacks: ExecutorCallbacks
): Promise<void> {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const outputs = new Map<string, Record<string, unknown>>()
  const completed = new Set<string>()
  const failed = new Set<string>()

  // Build dep map: nodeId → Set of dependency nodeIds
  const depMap = new Map<string, Set<string>>()
  for (const node of nodes) depMap.set(node.id, new Set())
  for (const edge of edges) {
    if (nodeMap.has(edge.source) && nodeMap.has(edge.target)) {
      depMap.get(edge.target)!.add(edge.source)
    }
  }

  // Initialise statuses
  for (const node of nodes) {
    const deps = depMap.get(node.id)!
    callbacks.onNodeStatus(node.id, deps.size === 0 ? 'idle' : 'waiting')
  }

  // Recursively mark downstream nodes as failed
  const markDownstreamFailed = (failedId: string) => {
    const upstreamError = outputs.get(failedId)?.error
    const upstreamMessage =
      typeof upstreamError === 'string' && upstreamError.trim().length > 0
        ? upstreamError
        : null

    for (const node of nodes) {
      if (failed.has(node.id) || completed.has(node.id)) continue
      if (edges.some((e) => e.source === failedId && e.target === node.id)) {
        failed.add(node.id)
        const failureMessage = upstreamMessage
          ? `Upstream node "${failedId}" failed: ${upstreamMessage}`
          : `Upstream node "${failedId}" failed`
        outputs.set(node.id, { error: failureMessage })
        callbacks.onNodeStatus(node.id, 'failed')
        callbacks.onNodeOutput(node.id, {
          error: failureMessage,
        })
        markDownstreamFailed(node.id)
      }
    }
  }

  const getReadyNodes = (): ExecutorNode[] =>
    nodes.filter((node) => {
      if (completed.has(node.id) || failed.has(node.id)) return false
      const deps = depMap.get(node.id)!
      return [...deps].every((dep) => completed.has(dep))
    })

  // ── Execution waves ───────────────────────────────────────────────────────
  while (completed.size + failed.size < nodes.length) {
    const readyNodes = getReadyNodes()
    if (readyNodes.length === 0) break // cycle or unreachable nodes — stop

    // Mark all ready nodes as running simultaneously (parallel branches)
    for (const node of readyNodes) {
      callbacks.onNodeStatus(node.id, 'running')
    }

    // Execute the entire wave in parallel
    const results = await Promise.allSettled(
      readyNodes.map((node) =>
        executeNodeWithRetry(node, edges, outputs, NODE_EXEC_RETRY_ATTEMPTS)
      )
    )

    for (let i = 0; i < results.length; i++) {
      const node = readyNodes[i]
      const result = results[i]

      if (result.status === 'fulfilled') {
        completed.add(node.id)
        outputs.set(node.id, result.value)
        callbacks.onNodeOutput(node.id, result.value)
        callbacks.onNodeStatus(node.id, 'success')
      } else {
        failed.add(node.id)
        const errorMsg = (result.reason as Error)?.message ?? 'Unknown error'
        callbacks.onNodeOutput(node.id, { error: errorMsg })
        callbacks.onNodeStatus(node.id, 'failed')
        markDownstreamFailed(node.id)
      }
    }

    // Emit convergence-progress hints for fan-in nodes that are still waiting
    // e.g. the final LLM node that needs both Branch A and Branch B
    for (const node of nodes) {
      if (completed.has(node.id) || failed.has(node.id)) continue
      const deps = depMap.get(node.id)!
      if (deps.size < 2) continue // only meaningful for fan-in nodes

      const completedDeps = [...deps].filter((d) => completed.has(d)).length
      if (completedDeps > 0 && completedDeps < deps.size) {
        callbacks.onNodeOutput(node.id, {
          waitingText: `Waiting for ${deps.size - completedDeps} more upstream node(s) \u2014 ${completedDeps}/${deps.size} complete`,
        })
      }
    }
  }

  callbacks.onComplete({
    completed: [...completed],
    failed: [...failed],
  })
}
