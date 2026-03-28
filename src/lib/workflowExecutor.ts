/**
 * Client-side DAG workflow executor.
 *
 * Executes nodes in dependency order with parallel execution of independent branches.
 * Calls the existing API routes for LLM, crop-image, and extract-frame processing.
 * Handles fan-in (convergence) nodes — e.g. a final LLM node that waits for both
 * a product-image branch AND a video-frame branch to complete before running.
 */

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

      const res = await fetch('/api/nodes/crop-image', {
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
      if (!json.success) throw new Error(json.error || 'Crop image failed')
      return { url: json.data.output }
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

      const res = await fetch('/api/nodes/extract-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl,
          timestamp: timestamp || (node.data.timestamp as string) || '50%',
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Frame extraction failed')
      return { url: json.data.output }
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

      const res = await fetch('/api/nodes/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: (node.data.model as string) || 'gemini-2.0-flash',
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
    for (const node of nodes) {
      if (failed.has(node.id) || completed.has(node.id)) continue
      if (edges.some((e) => e.source === failedId && e.target === node.id)) {
        failed.add(node.id)
        callbacks.onNodeStatus(node.id, 'failed')
        callbacks.onNodeOutput(node.id, {
          error: `Upstream node "${failedId}" failed`,
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
      readyNodes.map((node) => executeNode(node, edges, outputs))
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
