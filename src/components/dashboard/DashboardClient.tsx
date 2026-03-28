'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  MiniMap,
  Node,
  NodeTypes,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useWorkflowStore } from '@/stores/workflowStore'
import { useTheme } from '@/components/theme/theme-provider'
import {
  NODE_OUTPUT_TYPES,
  HANDLE_ACCEPT_TYPES,
  normalizeNodeType,
} from '@/lib/nodeTypes'
import { CanvasTopBar } from './CanvasTopBar'
import { CanvasBottomToolbar } from './CanvasBottomToolbar'
import { CanvasEmptyState } from './CanvasEmptyState'
import { PresetsOverlay } from './PresetsOverlay'
import { HistorySidebar } from './HistorySidebar'
import { NodeContextMenu } from './NodeContextMenu'
import { NodePickerPanel } from './NodePickerPanel'
import { ToastContainer, toast } from './Toast'
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal'
import { PRESET_WORKFLOWS } from './presetDefinitions'
import { runWorkflow } from '@/lib/workflowExecutor'
import { CropImageNode } from './nodes/CropImageNode'
import { ExtractFrameNode } from './nodes/ExtractFrameNode'
import { LLMNode } from './nodes/LLMNode'
import { TextNode } from './nodes/TextNode'
import { UploadImageNode } from './nodes/UploadImageNode'
import { UploadVideoNode } from './nodes/UploadVideoNode'
import { KreaImageNode } from './nodes/KreaImageNode'
import { Play } from 'lucide-react'

// ── Human-readable node labels ──
const NODE_LABELS: Record<string, string> = {
  text: 'Text',
  uploadImage: 'Upload Image',
  uploadVideo: 'Upload Video',
  llm: 'LLM',
  cropImage: 'Crop Image',
  extractFrame: 'Extract Frame',
  kreaImage: 'Image Generator',
}

// ── Node types ──
const nodeTypes: NodeTypes = {
  text: TextNode,
  uploadImage: UploadImageNode,
  uploadVideo: UploadVideoNode,
  llm: LLMNode,
  cropImage: CropImageNode,
  extractFrame: ExtractFrameNode,
  kreaImage: KreaImageNode,
}

// ── Node type → edge color map ──
const NODE_TYPE_COLORS: Record<string, string> = {
  text:         '#F97316',
  uploadImage:  '#3B82F6',
  uploadVideo:  '#22C55E',
  llm:          '#EAB308',
  extractFrame: '#EC4899',
  cropImage:    '#A855F7',
  kreaImage:    '#3B82F6',
}

// ── Cycle detection ──
function wouldCreateCycle(
  nodes: Node[],
  edges: Edge[],
  newEdge: { source: string; target: string }
): boolean {
  const adj = new Map<string, string[]>()
  for (const n of nodes) adj.set(n.id, [])
  for (const e of edges) {
    const list = adj.get(e.source) || []
    list.push(e.target)
    adj.set(e.source, list)
  }
  const source = adj.get(newEdge.source) || []
  source.push(newEdge.target)
  adj.set(newEdge.source, source)

  const visited = new Set<string>()
  const queue = [newEdge.target]
  while (queue.length > 0) {
    const current = queue.shift()!
    if (current === newEdge.source) return true
    if (visited.has(current)) continue
    visited.add(current)
    for (const neighbor of adj.get(current) || []) queue.push(neighbor)
  }
  return false
}

// ── Types ──
type WorkflowSummary = { id: string; name: string; updatedAt: string; createdAt: string }

interface DashboardClientProps {
  userId: string
  initialWorkflows: WorkflowSummary[]
  initialWorkflow: {
    id: string
    name: string
    data: { nodes?: Node[]; edges?: Edge[] }
  } | null
  initialRuns: unknown[]
}

type CanvasFlowHelpers = {
  screenToFlowPosition: (point: { x: number; y: number }) => { x: number; y: number }
  flowToScreenPosition: (point: { x: number; y: number }) => { x: number; y: number }
  zoomIn?: () => void
  zoomOut?: () => void
}

export function DashboardClient({
  userId,
  initialWorkflows,
  initialWorkflow,
  initialRuns,
}: DashboardClientProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const initialNodes = initialWorkflow?.data?.nodes ?? []
  const initialEdges = initialWorkflow?.data?.edges ?? []

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const store = useWorkflowStore()
  const [workflowName, setWorkflowName] = useState(
    initialWorkflow?.name || 'Untitled Workflow'
  )
  const currentWorkflowId = initialWorkflow?.id || null

  const [isExecuting, setIsExecuting] = useState(false)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    nodeId: string
  } | null>(null)
  const [showPresets, setShowPresets] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [reactFlowInstance, setReactFlowInstance] = useState<CanvasFlowHelpers | null>(null)
  const [nodePicker, setNodePicker] = useState<{
    screenX: number
    screenY: number
    flowX: number
    flowY: number
  } | null>(null)
  const [multiSelectHintDismissed, setMultiSelectHintDismissed] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem('nf.multiSelectHintDismissed') === '1'
  })

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedRef = useRef<string>('')
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const hideHoveredToolbarRef = useRef<NodeJS.Timeout | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)

  const isCanvasEmpty = nodes.length === 0
  const selectedNodes = nodes.filter((n) => n.selected)
  const singleSelectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null
  const hoveredNode = hoveredNodeId ? nodes.find((n) => n.id === hoveredNodeId) ?? null : null
  const actionNode = hoveredNode ?? singleSelectedNode
  const actionNodeIsStarting = useMemo(() => {
    if (!actionNode) return false
    return !edges.some((edge) => edge.target === actionNode.id)
  }, [actionNode, edges])

  const clearHideHoveredToolbar = useCallback(() => {
    if (hideHoveredToolbarRef.current !== null) {
      clearTimeout(hideHoveredToolbarRef.current)
      hideHoveredToolbarRef.current = null
    }
  }, [])

  const scheduleHideHoveredToolbar = useCallback(
    (nodeId: string) => {
      clearHideHoveredToolbar()
      hideHoveredToolbarRef.current = setTimeout(() => {
        setHoveredNodeId((current) => (current === nodeId ? null : current))
        hideHoveredToolbarRef.current = null
      }, 100)
    },
    [clearHideHoveredToolbar]
  )

  useEffect(
    () => () => {
      clearHideHoveredToolbar()
    },
    [clearHideHoveredToolbar]
  )

  const actionToolbarPos = useMemo(() => {
    if (!actionNode || !reactFlowInstance || !canvasRef.current) return null
    const screen = reactFlowInstance.flowToScreenPosition({
      x: actionNode.position.x,
      y: actionNode.position.y,
    })
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: screen.x - rect.left, y: screen.y - rect.top }
  }, [actionNode, reactFlowInstance])

  const shouldIgnoreDoubleClick = (target: HTMLElement) =>
    Boolean(
      target.closest(
        'input, textarea, select, button, a, [contenteditable="true"], .react-flow__controls, .react-flow__minimap, .react-flow__panel, .nf-node-picker-panel'
      )
    )

  // ── Sync store ──
  useEffect(() => {
    if (currentWorkflowId) {
      store.setWorkflowId(currentWorkflowId)
      store.setWorkflowName(workflowName)
    }
    store.setNodes(nodes)
    store.setEdges(edges)
    store.pushHistory({ nodes: initialNodes, edges: initialEdges })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Enhance nodes with callbacks + execution status ──
  const enhancedNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          executionStatus: store.nodeStatuses[node.id] || 'idle',
          nodeOutput: store.nodeOutputs[node.id] || null,
          onUpdateData: (updates: Record<string, unknown>) => {
            setNodes((nds) =>
              nds.map((n) =>
                n.id === node.id ? { ...n, data: { ...n.data, ...updates } } : n
              )
            )
          },
          onDelete: () => deleteNode(node.id),
          onRun: () => runSingleNode(node.id),
        },
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodes, store.nodeStatuses, store.nodeOutputs]
  )

  // ── Type-safe connection validation ──
  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      if (!connection.source || !connection.target) return false
      const sourceNode = nodes.find((n) => n.id === connection.source)
      if (!sourceNode) return false

      const sourceType = NODE_OUTPUT_TYPES[sourceNode.type || 'text'] || 'text'
      const targetHandleType = HANDLE_ACCEPT_TYPES[connection.targetHandle || '']
      if (targetHandleType && sourceType !== targetHandleType) return false

      return !wouldCreateCycle(nodes, edges, {
        source: connection.source,
        target: connection.target,
      })
    },
    [nodes, edges]
  )

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return
      if (
        wouldCreateCycle(nodes, edges, {
          source: params.source,
          target: params.target,
        })
      ) {
        toast.error('Circular connections are not allowed')
        return
      }
      const srcNode = nodes.find((n) => n.id === params.source)
      const edgeColor = NODE_TYPE_COLORS[srcNode?.type || ''] || '#737373'
      const newEdge = {
        ...params,
        animated: true,
        style: { stroke: edgeColor, strokeWidth: 2 },
      }
      setEdges((eds) => addEdge(newEdge, eds))
      debouncedSave()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodes, edges, setEdges]
  )

  // ── Auto-save (1.5 s debounce) ──
  const debouncedSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      if (!currentWorkflowId) return
      const stateKey = JSON.stringify({ nodes, edges, name: workflowName })
      if (stateKey === lastSavedRef.current) return

      store.setSaveStatus('saving')
      try {
        const res = await fetch(`/api/workflows/${currentWorkflowId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: workflowName, data: { nodes, edges } }),
        })
        if (res.ok) {
          lastSavedRef.current = stateKey
          store.setSaveStatus('saved')
          setTimeout(() => store.setSaveStatus('idle'), 2000)
        } else {
          store.setSaveStatus('error')
        }
      } catch {
        store.setSaveStatus('error')
      }
    }, 1500)
  }, [currentWorkflowId, nodes, edges, workflowName, store])

  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes)
      debouncedSave()
    },
    [onNodesChange, debouncedSave]
  )

  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChange>[0]) => {
      onEdgesChange(changes)
      debouncedSave()
    },
    [onEdgesChange, debouncedSave]
  )

  // ── Add node ──
  const addNode = useCallback(
    (type: string) => {
      const normalizedType = normalizeNodeType(type)
      const id = `${normalizedType}-${Date.now()}`
      const newNode: Node = {
        id,
        type: normalizedType,
        position: { x: Math.random() * 400 + 200, y: Math.random() * 300 + 100 },
        data: {
          text: '',
          prompt: '',
          model: normalizedType === 'kreaImage' ? 'krea-1' : 'gemini-2.0-flash',
          aspectRatio: '1:1',
          label: NODE_LABELS[normalizedType] ?? normalizedType,
        },
      }
      setNodes((nds) => [...nds, newNode])
      store.pushHistory({ nodes: [...nodes, newNode], edges })
      debouncedSave()
    },
    [setNodes, nodes, edges, store, debouncedSave]
  )

  const addNodeAtPosition = useCallback(
    (type: string, position: { x: number; y: number }) => {
      const normalizedType = normalizeNodeType(type)
      const id = `${normalizedType}-${Date.now()}`
      const newNode: Node = {
        id,
        type: normalizedType,
        position,
        data: {
          text: '',
          prompt: '',
          model: normalizedType === 'kreaImage' ? 'krea-1' : 'gemini-2.0-flash',
          aspectRatio: '1:1',
          label: NODE_LABELS[normalizedType] ?? normalizedType,
        },
      }
      setNodes((nds) => [...nds, newNode])
      store.pushHistory({ nodes: [...nodes, newNode], edges })
      debouncedSave()
    },
    [setNodes, nodes, edges, store, debouncedSave]
  )

  // Allow global sidebar tool clicks to add nodes while this canvas is active.
  useEffect(() => {
    const onSidebarAddNode = (event: Event) => {
      const customEvent = event as CustomEvent<{ type?: string }>
      const nodeType = customEvent.detail?.type
      if (!nodeType) return
      addNode(nodeType)
    }
    window.addEventListener('nf:add-node', onSidebarAddNode as EventListener)
    return () => window.removeEventListener('nf:add-node', onSidebarAddNode as EventListener)
  }, [addNode])

  const openNodePicker = useCallback(
    (screenX: number, screenY: number) => {
      if (!reactFlowInstance) return
      const flowPos = reactFlowInstance.screenToFlowPosition({ x: screenX, y: screenY })
      setNodePicker({ screenX, screenY, flowX: flowPos.x, flowY: flowPos.y })
    },
    [reactFlowInstance]
  )

  // ── Drag-and-drop ──
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const type = event.dataTransfer.getData('application/reactflow')
      if (!type || !reactFlowInstance) return
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      const normalizedType = normalizeNodeType(type)
      const newNode: Node = {
        id: `${normalizedType}-${Date.now()}`,
        type: normalizedType,
        position,
        data: {
          text: '',
          prompt: '',
          model: normalizedType === 'kreaImage' ? 'krea-1' : 'gemini-2.0-flash',
          label: NODE_LABELS[normalizedType] ?? normalizedType,
        },
      }
      setNodes((nds) => [...nds, newNode])
      store.pushHistory({ nodes: [...nodes, newNode], edges })
      debouncedSave()
    },
    [reactFlowInstance, setNodes, nodes, edges, store, debouncedSave]
  )

  // ── Delete / Duplicate ──
  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId))
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
      debouncedSave()
    },
    [setNodes, setEdges, debouncedSave]
  )

  const duplicateNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return
      const newNode: Node = {
        ...node,
        id: `${node.type}-${Date.now()}`,
        position: { x: node.position.x + 50, y: node.position.y + 50 },
        selected: false,
      }
      setNodes((nds) => [...nds, newNode])
      debouncedSave()
    },
    [nodes, setNodes, debouncedSave]
  )

  // ── Execution ──
  const runSingleNode = useCallback(
    async (nodeId: string) => {
      if (isExecuting) return

      // Collect the target node + all upstream dependencies via BFS
      const nodeMap = new Map(nodes.map((n) => [n.id, n]))
      const nodesToRunIds = new Set<string>([nodeId])
      const bfsQueue = [nodeId]
      while (bfsQueue.length > 0) {
        const current = bfsQueue.shift()!
        for (const edge of edges) {
          if (
            edge.target === current &&
            nodeMap.has(edge.source) &&
            !nodesToRunIds.has(edge.source)
          ) {
            nodesToRunIds.add(edge.source)
            bfsQueue.push(edge.source)
          }
        }
      }

      const filteredNodes = nodes.filter((n) => nodesToRunIds.has(n.id))

      setIsExecuting(true)
      for (const n of filteredNodes) store.setNodeStatus(n.id, 'PENDING')

      try {
        await runWorkflow(
          filteredNodes.map((n) => ({
            id: n.id,
            type: n.type || '',
            data: n.data as Record<string, unknown>,
          })),
          edges.map((e) => ({
            id: e.id,
            source: e.source,
            sourceHandle: e.sourceHandle || '',
            target: e.target,
            targetHandle: e.targetHandle || '',
          })),
          {
            onNodeStatus: (id, status) => {
              const mapped =
                status === 'success'
                  ? ('SUCCESS' as const)
                  : status === 'failed'
                    ? ('FAILED' as const)
                    : status === 'running'
                      ? ('RUNNING' as const)
                      : ('PENDING' as const)
              store.setNodeStatus(id, mapped)
            },
            onNodeOutput: (id, output) => {
              store.setNodeOutput(id, output)
            },
            onComplete: ({ failed }) => {
              setIsExecuting(false)
              if (failed.length === 0) {
                toast.success('Node completed successfully')
              } else {
                toast.error('Node execution failed')
              }
            },
          }
        )
      } catch {
        setIsExecuting(false)
        toast.error('Execution failed')
      }
    },
    [nodes, edges, isExecuting, store]
  )

  const startExecution = useCallback(
    async (scope: 'FULL' | 'PARTIAL' | 'SINGLE', nodeIds?: string[]) => {
      if (!currentWorkflowId || isExecuting) return
      setIsExecuting(true)
      try {
        await fetch(`/api/workflows/${currentWorkflowId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: workflowName, data: { nodes, edges } }),
        })
        const res = await fetch(`/api/workflows/${currentWorkflowId}/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scope, nodeIds }),
        })
        const json = await res.json()
        if (json.success && json.data?.runId) {
          store.setActiveRun(json.data.runId)
          const targetNodes =
            scope === 'FULL' ? nodes : nodes.filter((n) => nodeIds?.includes(n.id))
          for (const n of targetNodes) store.setNodeStatus(n.id, 'RUNNING')
          toast.success('Workflow execution started')
          pollRun(json.data.runId)
        } else {
          toast.error(json.error || 'Failed to start execution')
        }
      } catch {
        toast.error('Execution failed')
      } finally {
        setIsExecuting(false)
      }
    },
    [currentWorkflowId, isExecuting, nodes, edges, workflowName, store]
  )

  // ── Client-side DAG execution ──────────────────────────────────────────────

  /** Load the Product Marketing Kit Generator preset onto the canvas. */
  const loadSampleWorkflow = useCallback(() => {
    const preset = PRESET_WORKFLOWS['Product Marketing Kit Generator']
    if (!preset) return
    setNodes(preset.nodes)
    setEdges(preset.edges)
    store.pushHistory({ nodes: preset.nodes, edges: preset.edges })
    store.clearRun()
    setWorkflowName('Product Marketing Kit Generator')
    debouncedSave()
    toast.success('Sample workflow loaded — upload a product image and video, then click Run All')
  }, [setNodes, setEdges, store, debouncedSave, setWorkflowName])

  /**
   * Run the current canvas using the client-side DAG executor.
   * Calls /api/nodes/* routes directly — no server-side WorkflowRun record needed.
   * Updates node statuses in the Zustand store so all node cards re-render live.
   */
  const runWorkflowLocal = useCallback(async () => {
    if (isExecuting) return

    // Validate: every upload node must have a file
    const uploadNodes = nodes.filter(
      (n) => n.type === 'uploadImage' || n.type === 'uploadVideo'
    )
    const missing = uploadNodes.filter((n) => !(n.data as Record<string, unknown>).fileUrl)
    if (missing.length > 0) {
      const labels = missing
        .map((n) => (n.data as Record<string, unknown>).label || n.type)
        .join(', ')
      toast.error(`Please upload files for: ${labels}`)
      return
    }

    setIsExecuting(true)
    store.clearRun()

    // Reset every node to PENDING so the UI shows a clean slate
    for (const node of nodes) store.setNodeStatus(node.id, 'PENDING')

    try {
      await runWorkflow(
        nodes.map((n) => ({
          id: n.id,
          type: n.type || '',
          data: n.data as Record<string, unknown>,
        })),
        edges.map((e) => ({
          id: e.id,
          source: e.source,
          sourceHandle: e.sourceHandle || '',
          target: e.target,
          targetHandle: e.targetHandle || '',
        })),
        {
          onNodeStatus: (nodeId, status) => {
            const mapped =
              status === 'success'
                ? ('SUCCESS' as const)
                : status === 'failed'
                  ? ('FAILED' as const)
                  : status === 'running'
                    ? ('RUNNING' as const)
                    : ('PENDING' as const)
            store.setNodeStatus(nodeId, mapped)
          },
          onNodeOutput: (nodeId, output) => {
            store.setNodeOutput(nodeId, output)
          },
          onComplete: ({ failed }) => {
            setIsExecuting(false)
            if (failed.length === 0) {
              toast.success('Workflow completed successfully')
            } else {
              toast.error(
                failed.length === nodes.length
                  ? 'Workflow failed'
                  : 'Workflow partially completed'
              )
            }
          },
        }
      )
    } catch {
      setIsExecuting(false)
      toast.error('Workflow execution failed')
    }
  }, [nodes, edges, isExecuting, store])

  // ── Polling ──
  const pollRun = useCallback(
    (runId: string) => {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/runs/${runId}`)
          const json = await res.json()
          if (!json.success || !json.data) return
          const run = json.data
          store.updateRunFromPoll({
            status: run.status,
            nodeResults: run.nodeResults.map(
              (nr: {
                nodeId: string
                status: string
                outputs?: unknown
                error?: string | null
              }) => ({
                nodeId: nr.nodeId,
                status: nr.status as 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED',
                output: nr.outputs,
                error: nr.error,
              })
            ),
          })
          if (run.status !== 'RUNNING') {
            clearInterval(interval)
            if (run.status === 'SUCCESS') toast.success('Workflow completed')
            else if (run.status === 'FAILED') toast.error('Workflow failed')
            else if (run.status === 'PARTIAL') toast.error('Workflow partially completed')
          }
        } catch {
          clearInterval(interval)
        }
      }, 1500)
      return () => clearInterval(interval)
    },
    [store]
  )

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const ctrl = event.metaKey || event.ctrlKey
      const target = event.target as HTMLElement
      const inInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        (target as HTMLElement).isContentEditable

      const rfInstance = reactFlowInstance

      if (ctrl && event.key === 's') {
        event.preventDefault()
        debouncedSave()
        toast.success('Saved')
        return
      }
      if (ctrl && event.key === 'z' && !event.shiftKey) {
        event.preventDefault()
        if (store.canUndo()) { store.undo(); setNodes(store.nodes); setEdges(store.edges) }
        return
      }
      if (ctrl && (event.key === 'Z' || (event.key === 'z' && event.shiftKey) || event.key === 'y')) {
        event.preventDefault()
        if (store.canRedo()) { store.redo(); setNodes(store.nodes); setEdges(store.edges) }
        return
      }
      if (ctrl && event.key === 'a') {
        event.preventDefault()
        setNodes((nds) => nds.map((n) => ({ ...n, selected: true })))
        return
      }
      if (ctrl && (event.key === '=' || event.key === '+')) {
        event.preventDefault()
        rfInstance?.zoomIn?.()
        return
      }
      if (ctrl && event.key === '-') {
        event.preventDefault()
        rfInstance?.zoomOut?.()
        return
      }
      if (ctrl && event.key === 'Enter') {
        event.preventDefault()
        startExecution('FULL')
        return
      }
      if (ctrl && event.key === 'd') {
        event.preventDefault()
        const selected = nodes.find((n) => n.selected)
        if (selected) duplicateNode(selected.id)
        return
      }
      if (event.key === 'Escape') {
        setShowShortcuts(false)
        setShowPresets(false)
        setContextMenu(null)
        setNodePicker(null)
        setNodes((nds) => nds.map((n) => ({ ...n, selected: false })))
        return
      }
      if (!inInput && !ctrl) {
        if (event.key === 'n' || event.key === 'N') {
          isCanvasEmpty ? setShowPresets(true) : openNodePicker(window.innerWidth / 2, window.innerHeight / 2)
        }
        if (event.key === 'i' || event.key === 'I') addNode('uploadImage')
        if (event.key === 'v' || event.key === 'V') addNode('uploadVideo')
        if (event.key === 'l' || event.key === 'L') addNode('llm')
        if (event.key === 'e' || event.key === 'E') addNode('kreaImage')
        if (event.key === 'x' || event.key === 'X') store.setCanvasMode('scissor')
        if (event.key === 'Delete' || event.key === 'Backspace') {
          const selected = nodes.filter((n) => n.selected)
          selected.forEach((n) => deleteNode(n.id))
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [debouncedSave, store, setNodes, setEdges, isCanvasEmpty, openNodePicker, nodes, addNode, duplicateNode, deleteNode, startExecution, reactFlowInstance])

  // ── Export / Import ──
  const exportWorkflow = useCallback(async () => {
    if (!currentWorkflowId) return
    try {
      const res = await fetch(`/api/workflows/${currentWorkflowId}/export`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `workflow-${currentWorkflowId}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Workflow exported')
    } catch {
      toast.error('Export failed')
    }
  }, [currentWorkflowId])

  const importWorkflow = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      try {
        const res = await fetch('/api/workflows/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workflowJson: text }),
        })
        const json = await res.json()
        if (json.success && json.data?.id) {
          window.location.href = `/dashboard/node-editor/${json.data.id}`
        } else {
          toast.error(json.error || 'Import failed')
        }
      } catch {
        toast.error('Import failed')
      }
    }
    input.click()
  }, [])

  // ── Canvas interaction mode ──
  const canvasMode = store.canvasMode
  const panOnDrag =
    canvasMode === 'pan' ? true : canvasMode === 'select' ? [1, 2] : false
  const selectionOnDrag = canvasMode === 'select'

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: 'var(--nf-bg-canvas)',
        position: 'relative',
      }}
    >
      {/* Canvas area */}
      <div
        ref={canvasRef}
        style={{ flex: 1, position: 'relative', minWidth: 0 }}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onDoubleClick={(e) => {
          const target = e.target as HTMLElement
          if (shouldIgnoreDoubleClick(target)) return
          openNodePicker(e.clientX, e.clientY)
        }}
      >
        <ReactFlow
          nodes={enhancedNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onInit={(instance) => setReactFlowInstance(instance)}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          onNodeContextMenu={(event, node) => {
            event.preventDefault()
            setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id })
          }}
          onNodeMouseEnter={(_, node) => {
            clearHideHoveredToolbar()
            setHoveredNodeId(node.id)
          }}
          onNodeMouseLeave={(event, node) => {
            const relatedTarget = event.relatedTarget
            if (
              relatedTarget instanceof Element &&
              relatedTarget.closest('[data-node-action-toolbar="true"]')
            ) {
              return
            }
            scheduleHideHoveredToolbar(node.id)
          }}
          onPaneClick={() => {
            setContextMenu(null)
            setShowPresets(false)
            setNodePicker(null)
            setHoveredNodeId(null)
          }}
          onPaneContextMenu={(event) => {
            event.preventDefault()
            openNodePicker(event.clientX, event.clientY)
          }}
          deleteKeyCode={['Backspace', 'Delete']}
          panOnDrag={panOnDrag as boolean | number[]}
          selectionOnDrag={selectionOnDrag}
          fitView
          minZoom={0.15}
          maxZoom={2}
          snapToGrid
          snapGrid={[10, 10]}
          defaultEdgeOptions={{
            animated: false,
            style: { stroke: '#737373', strokeWidth: 1.5 },
          }}
          connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
        >
          <Background variant={BackgroundVariant.Dots} gap={18} size={1} color={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.12)'} />
          <MiniMap
            position="bottom-right"
            pannable
            zoomable
            style={{
              width: 180,
              height: 110,
              borderRadius: 10,
              border: '1px solid var(--nf-border-inner)',
              background: 'var(--nf-bg-node)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              right: 16,
              bottom: 16,
            }}
            nodeColor={() => (isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.25)')}
            maskColor={isDark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.5)'}
          />
        </ReactFlow>

        {/* Node actions toolbar — shown for hovered node or single selected node */}
        {actionToolbarPos && actionNode && (
          <div
            data-node-action-toolbar="true"
            className="nf-node-actions"
            style={{
              left: actionToolbarPos.x,
              top: actionToolbarPos.y,
            }}
            onMouseEnter={clearHideHoveredToolbar}
            onMouseLeave={() => scheduleHideHoveredToolbar(actionNode.id)}
          >
            {actionNodeIsStarting && (
              <button
                type="button"
                onClick={() => void runWorkflowLocal()}
                disabled={isExecuting}
                className="nf-node-actions__btn nf-node-actions__btn--primary"
              >
                <Play className="nf-node-actions__icon" />
                Run workflow
              </button>
            )}
            <button
              type="button"
              onClick={() => void runSingleNode(actionNode.id)}
              disabled={isExecuting}
              className="nf-node-actions__btn nf-node-actions__btn--secondary"
            >
              <Play className="nf-node-actions__icon" />
              Run node
            </button>
          </div>
        )}

        {/* Top bar */}
        <CanvasTopBar
          workflowName={workflowName}
          onNameChange={(name) => { setWorkflowName(name); debouncedSave() }}
          onSave={debouncedSave}
          saveStatus={store.saveStatus}
          onExport={exportWorkflow}
          onImport={importWorkflow}
          onRun={runWorkflowLocal}
          onLoadSample={loadSampleWorkflow}
          isExecuting={isExecuting}
          onToggleHistory={() => store.toggleRightSidebar()}
          onUndo={() => {
            if (store.canUndo()) { store.undo(); setNodes(store.nodes); setEdges(store.edges) }
          }}
          onRedo={() => {
            if (store.canRedo()) { store.redo(); setNodes(store.nodes); setEdges(store.edges) }
          }}
          canUndo={store.canUndo()}
          canRedo={store.canRedo()}
          onToggleShortcuts={() => setShowShortcuts((v) => !v)}
        />

        {/* Empty state */}
        {isCanvasEmpty && !showPresets && <CanvasEmptyState />}

        {/* Presets overlay */}
        {showPresets && (
          <PresetsOverlay
            onDismiss={() => setShowPresets(false)}
            onSelectPreset={(tmpl) => {
              setShowPresets(false)
              const preset = PRESET_WORKFLOWS[tmpl.title]
              if (preset) {
                setNodes(preset.nodes)
                setEdges(preset.edges)
                store.pushHistory({ nodes: preset.nodes, edges: preset.edges })
                store.clearRun()
                setWorkflowName(tmpl.title)
                debouncedSave()
              }
            }}
          />
        )}

        {/* Multi-select hint banner */}
        {!multiSelectHintDismissed && !isCanvasEmpty && (
          <div
            style={{
              position: 'absolute',
              bottom: 76,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '7px 12px',
              background: 'var(--nf-bg-node)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 'var(--nf-radius-xl)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              fontSize: 'var(--nf-font-size-xs)',
              color: 'var(--nf-text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            <span>To select multiple nodes, use <strong style={{ color: 'var(--nf-text-secondary)' }}>Ctrl+Drag</strong> or <strong style={{ color: 'var(--nf-text-secondary)' }}>Shift+Click</strong></span>
            <button
              type="button"
              onClick={() => {
                setMultiSelectHintDismissed(true)
                localStorage.setItem('nf.multiSelectHintDismissed', '1')
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--nf-text-placeholder)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
                lineHeight: 1,
              }}
              title="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {/* Bottom toolbar */}
        <CanvasBottomToolbar
          canvasMode={canvasMode}
          onModeChange={(mode) => store.setCanvasMode(mode)}
          onAddNode={() => (isCanvasEmpty ? setShowPresets(true) : addNode('kreaImage'))}
          onPresets={() => setShowPresets(true)}
        />

        {/* Node picker */}
        {nodePicker && (
          <NodePickerPanel
            screenX={nodePicker.screenX}
            screenY={nodePicker.screenY}
            onSelect={(type) => {
              addNodeAtPosition(type, { x: nodePicker.flowX, y: nodePicker.flowY })
              setNodePicker(null)
            }}
            onClose={() => setNodePicker(null)}
          />
        )}

        {/* Context menu */}
        {contextMenu && (
          <NodeContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            onRun={() => { runSingleNode(contextMenu.nodeId); setContextMenu(null) }}
            onDuplicate={() => { duplicateNode(contextMenu.nodeId); setContextMenu(null) }}
            onDelete={() => { deleteNode(contextMenu.nodeId); setContextMenu(null) }}
          />
        )}

        {/* Keyboard shortcuts modal */}
        <KeyboardShortcutsModal
          open={showShortcuts}
          onClose={() => setShowShortcuts(false)}
        />
      </div>

      {/* Right panel — History sidebar */}
      <HistorySidebar
        workflowId={currentWorkflowId}
        isOpen={store.rightSidebarOpen}
        onToggle={() => store.toggleRightSidebar()}
        activeRunId={store.activeRunId}
      />

      <ToastContainer />
    </div>
  )
}
