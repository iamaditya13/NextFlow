'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Background,
  BackgroundVariant,
  type Edge,
  type Node,
  type NodeTypes,
  type Connection,
  type EdgeTypes,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useViewport,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useTheme } from '@/components/theme/theme-provider'
import {
  AppWindow,
  ArrowLeft,
  Bot,
  ChevronDown,
  Download,
  Folders,
  Hand,
  History,
  Keyboard,
  LayoutGrid,
  MousePointer2,
  Pause,
  Play,
  Plus,
  Scissors,
  Share2,
  Undo2,
  Redo2,
  Upload,
  X,
  Layers,
} from 'lucide-react'
import { StudioShell } from './StudioShell'
import { ThemeToggle } from './ThemeToggle'
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal'
import { NodePickerPopup } from './NodePickerPopup'
import { HistorySidebar } from './HistorySidebar'
import { PresetsOverlay } from './PresetsOverlay'
import { AssetsPanel } from './AssetsPanel'
import { PRESET_WORKFLOWS } from './presetDefinitions'
import { isConnectionTypeValid } from '@/lib/nodeTypes'
import { FlowingEdge } from './FlowingEdge'
import { runWorkflow } from '@/lib/workflowExecutor'

import { TextNode } from './nodes/TextNode'
import { UploadImageNode } from './nodes/UploadImageNode'
import { UploadVideoNode } from './nodes/UploadVideoNode'
import { LLMNode } from './nodes/LLMNode'
import { CropImageNode } from './nodes/CropImageNode'
import { ExtractFrameNode } from './nodes/ExtractFrameNode'
import { KreaImageNode } from './nodes/KreaImageNode'

type NodeEditorCanvasProps = {
  flowId?: string
}

const nodeTypes: NodeTypes = {
  text: TextNode,
  uploadImage: UploadImageNode,
  uploadVideo: UploadVideoNode,
  llm: LLMNode,
  cropImage: CropImageNode,
  extractFrame: ExtractFrameNode,
  kreaImage: KreaImageNode,
}

const edgeTypes: EdgeTypes = {
  flowing: FlowingEdge,
}

type CanvasMode = 'select' | 'pan' | 'scissor' | 'connect'

type ScreenPoint = { x: number; y: number }

function pointToSegmentDistance(point: ScreenPoint, segmentStart: ScreenPoint, segmentEnd: ScreenPoint) {
  const dx = segmentEnd.x - segmentStart.x
  const dy = segmentEnd.y - segmentStart.y
  if (dx === 0 && dy === 0) return Math.hypot(point.x - segmentStart.x, point.y - segmentStart.y)
  const t =
    ((point.x - segmentStart.x) * dx + (point.y - segmentStart.y) * dy) /
    (dx * dx + dy * dy)
  const clampedT = Math.max(0, Math.min(1, t))
  const projectedX = segmentStart.x + clampedT * dx
  const projectedY = segmentStart.y + clampedT * dy
  return Math.hypot(point.x - projectedX, point.y - projectedY)
}

function doesSegmentIntersectRect(
  segmentStart: ScreenPoint,
  segmentEnd: ScreenPoint,
  rect: DOMRect,
  padding: number
) {
  const minX = Math.min(segmentStart.x, segmentEnd.x) - padding
  const maxX = Math.max(segmentStart.x, segmentEnd.x) + padding
  const minY = Math.min(segmentStart.y, segmentEnd.y) - padding
  const maxY = Math.max(segmentStart.y, segmentEnd.y) + padding

  return !(maxX < rect.left || minX > rect.right || maxY < rect.top || minY > rect.bottom)
}

function doesScissorSegmentHitEdgePath(
  edgePath: SVGPathElement,
  segmentStart: ScreenPoint,
  segmentEnd: ScreenPoint,
  threshold = 10
) {
  try {
    const bbox = edgePath.getBoundingClientRect()
    if (!doesSegmentIntersectRect(segmentStart, segmentEnd, bbox, threshold)) return false

    const ctm = edgePath.getScreenCTM()
    if (!ctm) return false

    const pathLength = edgePath.getTotalLength()
    if (!Number.isFinite(pathLength) || pathLength <= 0) return false

    const step = Math.max(6, Math.min(18, pathLength / 28))
    for (let distance = 0; distance <= pathLength; distance += step) {
      const localPoint = edgePath.getPointAtLength(distance)
      const screenPoint = {
        x: ctm.a * localPoint.x + ctm.c * localPoint.y + ctm.e,
        y: ctm.b * localPoint.x + ctm.d * localPoint.y + ctm.f,
      }
      if (pointToSegmentDistance(screenPoint, segmentStart, segmentEnd) <= threshold) return true
    }

    const endLocalPoint = edgePath.getPointAtLength(pathLength)
    const endScreenPoint = {
      x: ctm.a * endLocalPoint.x + ctm.c * endLocalPoint.y + ctm.e,
      y: ctm.b * endLocalPoint.x + ctm.d * endLocalPoint.y + ctm.f,
    }
    return pointToSegmentDistance(endScreenPoint, segmentStart, segmentEnd) <= threshold
  } catch {
    return false
  }
}

// Detect if adding newEdge would create a cycle
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

// ── Inner canvas component (needs useReactFlow, which requires ReactFlowProvider above) ──
function NodeEditorCanvasInner({ flowId }: NodeEditorCanvasProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { screenToFlowPosition, zoomIn, zoomOut, flowToScreenPosition } = useReactFlow()
  useViewport() // re-render on pan/zoom so the node toolbar tracks correctly

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  // Local undo/redo history
  const historyRef = useRef<Array<{ nodes: Node[]; edges: Edge[] }>>([])
  const historyIdxRef = useRef(-1)
  const [historyLen, setHistoryLen] = useState(0)

  const pushHistory = useCallback((ns: Node[], es: Edge[]) => {
    const next = historyRef.current.slice(0, historyIdxRef.current + 1)
    next.push({ nodes: ns, edges: es })
    if (next.length > 50) next.shift()
    historyRef.current = next
    historyIdxRef.current = next.length - 1
    setHistoryLen(next.length)
  }, [])

  const canUndo = historyIdxRef.current > 0
  const canRedo = historyIdxRef.current < historyRef.current.length - 1

  const undo = useCallback(() => {
    if (historyIdxRef.current <= 0) return
    historyIdxRef.current--
    const entry = historyRef.current[historyIdxRef.current]
    setNodes(entry.nodes)
    setEdges(entry.edges)
    setHistoryLen(historyRef.current.length)
  }, [setNodes, setEdges])

  const redo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return
    historyIdxRef.current++
    const entry = historyRef.current[historyIdxRef.current]
    setNodes(entry.nodes)
    setEdges(entry.edges)
    setHistoryLen(historyRef.current.length)
  }, [setNodes, setEdges])

  const [flowName, setFlowName] = useState('Untitled')
  const [logoMenuOpen, setLogoMenuOpen] = useState(false)
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('select')
  const [isRunning, setIsRunning] = useState(false)
  const [activeRunId, setActiveRunId] = useState<string | null>(null)
  const [presetsOpen, setPresetsOpen] = useState(false)

  // Modals / panels
  const [keyboardShortcutsOpen, setKeyboardShortcutsOpen] = useState(false)
  const [nodePickerOpen, setNodePickerOpen] = useState(false)
  const [nodePickerPos, setNodePickerPos] = useState({ x: 400, y: 300 })
  const [historySidebarOpen, setHistorySidebarOpen] = useState(false)
  const [assetsPanelOpen, setAssetsPanelOpen] = useState(false)
  const [rightDropdownOpen, setRightDropdownOpen] = useState(false)
  const [spacePanning, setSpacePanning] = useState(false)
  const clipboardRef = useRef<{ nodes: Node[]; edges: Edge[] } | null>(null)
  const canvasSurfaceRef = useRef<HTMLDivElement | null>(null)
  const nodesRef = useRef<Node[]>([])
  const edgesRef = useRef<Edge[]>([])
  const scissorDraggingRef = useRef(false)
  const scissorLastPointRef = useRef<ScreenPoint | null>(null)
  const cutEdgeIdsRef = useRef<Set<string>>(new Set())
  // Debugged: browser setTimeout returns a numeric timer ID.
  const hideHoveredNodeToolbarRef = useRef<number | null>(null)
  const [scissorCursorPos, setScissorCursorPos] = useState<ScreenPoint | null>(null)
  const [scissorTrailPoints, setScissorTrailPoints] = useState<ScreenPoint[]>([])

  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  useEffect(() => {
    edgesRef.current = edges
  }, [edges])

  /** Run the full workflow via the client-side DAG executor. */
  const handleRunWorkflow = useCallback(
    async (scope: 'full' | 'single' | 'partial' = 'full', selectedNodeIds?: string[]) => {
      if (isRunning || nodes.length === 0) return
      setIsRunning(true)
      setHistorySidebarOpen(true)

      // Snapshot the current workflow to the API so history is persisted
      let workflowId = flowId ?? null
      try {
        if (workflowId) {
          await fetch(`/api/workflows/${workflowId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: flowName,
              nodes: nodes.map((n) => ({
                id: n.id,
                type: n.type,
                position: n.position,
                data: { ...n.data, onDelete: undefined, onUpdateData: undefined, onRun: undefined },
              })),
              edges,
            }),
          })
        } else {
          // Create new workflow in DB
          const res = await fetch('/api/workflows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: flowName }),
          })
          const json = await res.json() as { success: boolean; data?: { id: string } }
          if (json.success && json.data?.id) {
            workflowId = json.data.id
            // Save nodes/edges to the new workflow
            await fetch(`/api/workflows/${workflowId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: flowName,
                nodes: nodes.map((n) => ({
                  id: n.id,
                  type: n.type,
                  position: n.position,
                  data: { ...n.data, onDelete: undefined, onUpdateData: undefined, onRun: undefined },
                })),
                edges,
              }),
            })
          }
        }

        // Trigger server-side run to create a history entry
        if (workflowId) {
          const runRes = await fetch(`/api/workflows/${workflowId}/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scope: scope.toUpperCase(),
              nodeIds: selectedNodeIds,
            }),
          })
          const runJson = await runRes.json() as { success: boolean; data?: { runId: string } }
          if (runJson.success && runJson.data?.runId) {
            setActiveRunId(runJson.data.runId)
          }
        }
      } catch {
        // Non-critical — continue with client-side execution even if DB save fails
      }

      const executorNodes = nodes.map((n) => ({
        id: n.id,
        type: n.type ?? '',
        data: n.data as Record<string, unknown>,
      }))
      const executorEdges = edges.map((e) => ({
        id: e.id,
        source: e.source,
        sourceHandle: e.sourceHandle ?? '',
        target: e.target,
        targetHandle: e.targetHandle ?? '',
      }))

      // For single/partial scope, include selected nodes AND all upstream dependencies
      // so connected inputs are available when the target node executes.
      let nodesToRun = executorNodes
      if (scope !== 'full' && selectedNodeIds && selectedNodeIds.length > 0) {
        const nodeMap = new Map(executorNodes.map((n) => [n.id, n]))
        const toRunIds = new Set<string>(selectedNodeIds)
        const bfsQueue = [...selectedNodeIds]
        while (bfsQueue.length > 0) {
          const current = bfsQueue.shift()!
          for (const edge of executorEdges) {
            if (edge.target === current && nodeMap.has(edge.source) && !toRunIds.has(edge.source)) {
              toRunIds.add(edge.source)
              bfsQueue.push(edge.source)
            }
          }
        }
        nodesToRun = executorNodes.filter((n) => toRunIds.has(n.id))
      }

      await runWorkflow(nodesToRun, executorEdges, {
        onNodeStatus: (nodeId, status) => {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === nodeId
                ? { ...n, data: { ...n.data, executionStatus: status } }
                : n
            )
          )
        },
        onNodeOutput: (nodeId, output) => {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === nodeId
                ? { ...n, data: { ...n.data, nodeOutput: output } }
                : n
            )
          )
        },
        onComplete: () => {
          setIsRunning(false)
        },
      })

      setIsRunning(false)
    },
    [isRunning, nodes, edges, flowName, flowId, setNodes]
  )

  // Enhance nodes with callbacks at render time
  const enhancedNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onDelete: () => {
            setNodes((nds) => nds.filter((n) => n.id !== node.id))
            setEdges((eds) =>
              eds.filter((e) => e.source !== node.id && e.target !== node.id)
            )
          },
          onUpdateData: (updates: Record<string, unknown>) =>
            setNodes((nds) =>
              nds.map((n) =>
                n.id === node.id ? { ...n, data: { ...n.data, ...updates } } : n
              )
            ),
          onRun: () => void handleRunWorkflow('single', [node.id]),
        },
      })),
    [nodes, setNodes, setEdges, handleRunWorkflow]
  )

  const clearHoveredToolbarHide = useCallback(() => {
    if (hideHoveredNodeToolbarRef.current !== null) {
      window.clearTimeout(hideHoveredNodeToolbarRef.current)
      hideHoveredNodeToolbarRef.current = null
    }
  }, [])

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)

  const scheduleHoveredToolbarHide = useCallback(
    (nodeId: string) => {
      clearHoveredToolbarHide()
      hideHoveredNodeToolbarRef.current = window.setTimeout(() => {
        setHoveredNodeId((current) => (current === nodeId ? null : current))
        hideHoveredNodeToolbarRef.current = null
      }, 100)
    },
    [clearHoveredToolbarHide]
  )

  useEffect(
    () => () => {
      clearHoveredToolbarHide()
    },
    [clearHoveredToolbarHide]
  )

  // Hovered / selected node for context toolbar
  const selectedNodes = nodes.filter((n) => n.selected)
  const singleSelectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null
  const hoveredNode = hoveredNodeId ? nodes.find((n) => n.id === hoveredNodeId) ?? null : null
  const toolbarNode = hoveredNode ?? singleSelectedNode

  const nodeToolbarPos = useMemo(() => {
    if (!toolbarNode) return null
    const screen = flowToScreenPosition({
      x: toolbarNode.position.x,
      y: toolbarNode.position.y,
    })
    return { x: screen.x, y: screen.y - 42 }
  }, [toolbarNode, flowToScreenPosition])

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return

      const sourceNode = nodes.find((n) => n.id === connection.source)
      if (
        sourceNode &&
        connection.targetHandle &&
        !isConnectionTypeValid(sourceNode.type || '', connection.targetHandle)
      ) {
        return
      }

      if (
        wouldCreateCycle(nodes, edges, {
          source: connection.source,
          target: connection.target,
        })
      ) {
        return
      }

      const newEdge = {
        ...connection,
        type: 'flowing',
        data: { sourceType: sourceNode?.type || 'uploadImage' },
      }
      setEdges((eds) => {
        const updated = addEdge(newEdge, eds)
        pushHistory(nodes, updated)
        return updated
      })
    },
    [nodes, edges, setEdges, pushHistory]
  )

  const NODE_LABELS: Record<string, string> = {
    text: 'Text',
    uploadImage: 'Upload Image',
    uploadVideo: 'Upload Video',
    llm: 'LLM',
    cropImage: 'Crop Image',
    extractFrame: 'Extract Frame',
    kreaImage: 'Image Generator',
  }

  const addNodeToCanvas = useCallback(
    (type: string) => {
      const id = `${type}-${Date.now()}`
      const position = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      })
      const newNode: Node = {
        id,
        type,
        position,
        data: { label: NODE_LABELS[type] ?? type },
      }
      setNodes((nds) => {
        const updated = [...nds, newNode]
        pushHistory(updated, edges)
        return updated
      })
    },
    [screenToFlowPosition, edges, setNodes, pushHistory]
  )

  const loadPreset = useCallback(
    (presetTitle: string) => {
      const preset = PRESET_WORKFLOWS[presetTitle]
      if (!preset) return
      setNodes(preset.nodes)
      setEdges(preset.edges)
      pushHistory(preset.nodes, preset.edges)
      setPresetsOpen(false)
    },
    [setNodes, setEdges, pushHistory]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      // Handle node type drops from sidebar
      const nodeType = e.dataTransfer.getData('application/reactflow')
      if (nodeType) {
        const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
        const id = `${nodeType}-${Date.now()}`
        const newNode: Node = { id, type: nodeType, position, data: { label: NODE_LABELS[nodeType] ?? nodeType } }
        setNodes((nds) => {
          const updated = [...nds, newNode]
          pushHistory(updated, edges)
          return updated
        })
        return
      }
      // Handle asset drops from the assets panel — create an uploadImage node
      const assetSrc = e.dataTransfer.getData('application/asset-src')
      if (assetSrc) {
        const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
        const id = `uploadImage-${Date.now()}`
        const newNode: Node = {
          id,
          type: 'uploadImage',
          position,
          data: { label: 'uploadImage', fileUrl: assetSrc },
        }
        setNodes((nds) => {
          const updated = [...nds, newNode]
          pushHistory(updated, edges)
          return updated
        })
      }
    },
    [screenToFlowPosition, edges, setNodes, pushHistory]
  )

  const saveCanvasDraft = useCallback(() => {
    try {
      window.localStorage.setItem(
        'nextflow:canvas-draft',
        JSON.stringify({
          flowName,
          nodes,
          edges,
          savedAt: new Date().toISOString(),
        })
      )
    } catch {
      // Ignore localStorage failures
    }
  }, [flowName, nodes, edges])

  const importInputRef = useRef<HTMLInputElement | null>(null)

  const exportWorkflow = useCallback(() => {
    const payload = {
      name: flowName,
      exportedAt: new Date().toISOString(),
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: { ...n.data, onDelete: undefined, onUpdateData: undefined, onRun: undefined },
      })),
      edges,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${flowName.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setLogoMenuOpen(false)
  }, [flowName, nodes, edges])

  const importWorkflow = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string) as {
          name?: string
          nodes?: Node[]
          edges?: Edge[]
        }
        if (json.name) setFlowName(json.name)
        const importedNodes = (json.nodes ?? []) as Node[]
        const importedEdges = (json.edges ?? []) as Edge[]
        setNodes(importedNodes)
        setEdges(importedEdges)
        pushHistory(importedNodes, importedEdges)
      } catch {
        // Invalid JSON — ignore silently
      }
    }
    reader.readAsText(file)
    setLogoMenuOpen(false)
  }, [setNodes, setEdges, pushHistory])

  const deselectAllNodes = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => (node.selected ? { ...node, selected: false } : node))
    )
  }, [setNodes])

  const selectAllNodes = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => (!node.selected ? { ...node, selected: true } : node))
    )
  }, [setNodes])

  const deleteSelectedNodes = useCallback(() => {
    const selectedIds = new Set(nodes.filter((n) => n.selected).map((n) => n.id))
    if (selectedIds.size === 0) return

    const updatedNodes = nodes.filter((n) => !selectedIds.has(n.id))
    const updatedEdges = edges.filter(
      (e) => !selectedIds.has(e.source) && !selectedIds.has(e.target)
    )

    setNodes(updatedNodes)
    setEdges(updatedEdges)
    pushHistory(updatedNodes, updatedEdges)
  }, [nodes, edges, setNodes, setEdges, pushHistory])

  const copySelectedNodes = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected)
    if (selectedNodes.length === 0) return

    const selectedIds = new Set(selectedNodes.map((n) => n.id))
    const selectedEdges = edges.filter(
      (e) => selectedIds.has(e.source) && selectedIds.has(e.target)
    )

    clipboardRef.current = {
      nodes: selectedNodes.map((n) => structuredClone(n)),
      edges: selectedEdges.map((e) => structuredClone(e)),
    }
  }, [nodes, edges])

  const pasteCopiedNodes = useCallback(() => {
    const clipboard = clipboardRef.current
    if (!clipboard || clipboard.nodes.length === 0) return

    const idMap = new Map<string, string>()
    const stamp = Date.now()

    const pastedNodes: Node[] = clipboard.nodes.map((node, idx) => {
      const nextId = `${node.type || 'node'}-${stamp}-${idx}`
      idMap.set(node.id, nextId)
      return {
        ...structuredClone(node),
        id: nextId,
        selected: true,
        position: {
          x: node.position.x + 40,
          y: node.position.y + 40,
        },
      }
    })

    const pastedEdges: Edge[] = clipboard.edges
      .filter((edge) => idMap.has(edge.source) && idMap.has(edge.target))
      .map((edge, idx) => ({
        ...structuredClone(edge),
        id: `edge-${stamp}-${idx}`,
        source: idMap.get(edge.source)!,
        target: idMap.get(edge.target)!,
        selected: false,
      }))

    const updatedNodes = [
      ...nodes.map((n) => (n.selected ? { ...n, selected: false } : n)),
      ...pastedNodes,
    ]
    const updatedEdges = [...edges, ...pastedEdges]

    setNodes(updatedNodes)
    setEdges(updatedEdges)
    pushHistory(updatedNodes, updatedEdges)
  }, [nodes, edges, setNodes, setEdges, pushHistory])

  const duplicateSelectedNodes = useCallback(() => {
    copySelectedNodes()
    pasteCopiedNodes()
  }, [copySelectedNodes, pasteCopiedNodes])

  const groupSelectedNodes = useCallback(() => {
    const selectedCount = nodes.filter((n) => n.selected).length
    if (selectedCount < 2) return

    const groupId = `group-${Date.now()}`
    const updatedNodes = nodes.map((node) =>
      node.selected
        ? { ...node, data: { ...node.data, groupId } }
        : node
    )
    setNodes(updatedNodes)
    pushHistory(updatedNodes, edges)
  }, [nodes, edges, setNodes, pushHistory])

  const ungroupSelectedNodes = useCallback(() => {
    const updatedNodes = nodes.map((node) => {
      if (!node.selected) return node
      const data = { ...(node.data as Record<string, unknown>) }
      delete data.groupId
      return { ...node, data }
    })
    setNodes(updatedNodes)
    pushHistory(updatedNodes, edges)
  }, [nodes, edges, setNodes, pushHistory])

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return

      const ctrl = e.ctrlKey || e.metaKey
      const alt = e.altKey
      const key = e.key.toLowerCase()

      if (e.code === 'Space') {
        e.preventDefault()
        setSpacePanning(true)
        return
      }

      if (ctrl && key === 's') {
        e.preventDefault()
        saveCanvasDraft()
        return
      }

      if (ctrl && key === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
        return
      }

      if (ctrl && key === 'y') {
        e.preventDefault()
        redo()
        return
      }

      if (ctrl && key === 'a') {
        e.preventDefault()
        selectAllNodes()
        return
      }

      // Ctrl+Alt+A → Assets panel
      if (ctrl && alt && key === 'a') {
        e.preventDefault()
        setAssetsPanelOpen((o) => !o)
        return
      }

      // Ctrl+Alt+S → Run History sidebar
      if (ctrl && alt && key === 's') {
        e.preventDefault()
        setHistorySidebarOpen((o) => !o)
        return
      }

      if (ctrl && key === 'c') {
        e.preventDefault()
        if (e.shiftKey) {
          setHistorySidebarOpen((open) => !open)
          return
        }
        copySelectedNodes()
        return
      }

      if (ctrl && key === 'v') {
        e.preventDefault()
        pasteCopiedNodes()
        return
      }

      if (ctrl && key === 'd') {
        e.preventDefault()
        duplicateSelectedNodes()
        return
      }

      if (ctrl && key === 'g') {
        e.preventDefault()
        if (e.shiftKey) {
          ungroupSelectedNodes()
        } else {
          groupSelectedNodes()
        }
        return
      }

      if (ctrl && key === 'enter') {
        e.preventDefault()
        void handleRunWorkflow('full')
        return
      }

      switch (key) {
        case 'i':
          addNodeToCanvas('uploadImage')
          break
        case 'v':
          addNodeToCanvas('uploadVideo')
          break
        case 'l':
          addNodeToCanvas('llm')
          break
        case 'e':
          addNodeToCanvas('cropImage')
          break
        case 'x':
        case 'y':
          setCanvasMode('scissor')
          break
        case '=':
        case '+':
          e.preventDefault()
          zoomIn({ duration: 120 })
          break
        case '-':
          e.preventDefault()
          zoomOut({ duration: 120 })
          break
        case 'n':
          setNodePickerPos({ x: window.innerWidth / 2 - 120, y: window.innerHeight / 2 - 200 })
          setNodePickerOpen(true)
          break
        case 'escape':
          deselectAllNodes()
          setNodePickerOpen(false)
          setKeyboardShortcutsOpen(false)
          setRightDropdownOpen(false)
          setPresetsOpen(false)
          setAssetsPanelOpen(false)
          break
        case 'delete':
        case 'backspace':
          deleteSelectedNodes()
          break
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePanning(false)
      }
    }

    const onWindowBlur = () => setSpacePanning(false)

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onWindowBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onWindowBlur)
    }
  }, [
    undo,
    redo,
    addNodeToCanvas,
    copySelectedNodes,
    pasteCopiedNodes,
    duplicateSelectedNodes,
    groupSelectedNodes,
    ungroupSelectedNodes,
    deleteSelectedNodes,
    deselectAllNodes,
    selectAllNodes,
    saveCanvasDraft,
    handleRunWorkflow,
    zoomIn,
    zoomOut,
  ])

  const toolbarItems = [
    { id: 'add' as const, icon: Plus, label: 'New Node', shortcut: 'N' },
    { id: 'select' as const, icon: MousePointer2, label: 'Select' },
    { id: 'pan' as const, icon: Hand, label: 'Pan' },
    { id: 'scissor' as const, icon: Scissors, label: 'Cut edges' },
    { id: 'presets' as const, icon: LayoutGrid, label: 'Presets' },
  ]

  const findEdgesCrossedByScissorSegment = useCallback(
    (segmentStart: ScreenPoint, segmentEnd: ScreenPoint) => {
      const canvasSurface = canvasSurfaceRef.current
      if (!canvasSurface) return []
      const edgeElements = canvasSurface.querySelectorAll<SVGGElement>('.react-flow__edge[data-id]')
      const crossedEdgeIds: string[] = []

      edgeElements.forEach((edgeElement) => {
        const edgeId = edgeElement.dataset.id
        if (!edgeId || cutEdgeIdsRef.current.has(edgeId)) return
        const edgePath = edgeElement.querySelector<SVGPathElement>('path')
        if (!edgePath) return
        if (doesScissorSegmentHitEdgePath(edgePath, segmentStart, segmentEnd)) {
          crossedEdgeIds.push(edgeId)
        }
      })

      return crossedEdgeIds
    },
    []
  )

  const finishScissorDrag = useCallback(() => {
    if (!scissorDraggingRef.current) return
    scissorDraggingRef.current = false
    scissorLastPointRef.current = null
    setScissorTrailPoints([])
    if (cutEdgeIdsRef.current.size > 0) {
      pushHistory(nodesRef.current, edgesRef.current)
      cutEdgeIdsRef.current = new Set()
    }
  }, [pushHistory])

  const handleGlobalScissorMouseMove = useCallback(
    (event: MouseEvent) => {
      if (canvasMode !== 'scissor') return
      const canvasSurface = canvasSurfaceRef.current
      if (!canvasSurface) return
      const bounds = canvasSurface.getBoundingClientRect()

      const isInsideCanvas =
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom
      if (isInsideCanvas) {
        setScissorCursorPos({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        })
      } else if (!scissorDraggingRef.current) {
        setScissorCursorPos(null)
      }

      if (!scissorDraggingRef.current || !scissorLastPointRef.current) return

      const currentPoint = { x: event.clientX, y: event.clientY }
      const previousPoint = scissorLastPointRef.current
      scissorLastPointRef.current = currentPoint

      setScissorTrailPoints((points) => {
        const nextPoint = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
        if (points.length === 0) return [nextPoint]
        const lastPoint = points[points.length - 1]
        if (Math.hypot(nextPoint.x - lastPoint.x, nextPoint.y - lastPoint.y) < 1.5) return points
        const trimmedPoints = points.length > 80 ? points.slice(points.length - 80) : points
        return [...trimmedPoints, nextPoint]
      })

      const crossedEdgeIds = findEdgesCrossedByScissorSegment(previousPoint, currentPoint)
      if (crossedEdgeIds.length === 0) return

      setEdges((currentEdges) => {
        let hasNewCuts = false
        for (const edgeId of crossedEdgeIds) {
          if (cutEdgeIdsRef.current.has(edgeId)) continue
          cutEdgeIdsRef.current.add(edgeId)
          hasNewCuts = true
        }
        if (!hasNewCuts) return currentEdges
        const nextEdges = currentEdges.filter((edge) => !cutEdgeIdsRef.current.has(edge.id))
        edgesRef.current = nextEdges
        return nextEdges
      })
    },
    [canvasMode, findEdgesCrossedByScissorSegment, setEdges]
  )

  const beginScissorDrag = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (canvasMode !== 'scissor' || event.button !== 0) return

      const target = event.target as HTMLElement
      if (!target.closest('.react-flow')) return
      if (target.closest('button, input, textarea, select, a, [contenteditable="true"]')) return

      const canvasSurface = canvasSurfaceRef.current
      if (!canvasSurface) return
      const bounds = canvasSurface.getBoundingClientRect()

      scissorDraggingRef.current = true
      scissorLastPointRef.current = { x: event.clientX, y: event.clientY }
      cutEdgeIdsRef.current = new Set()
      setScissorCursorPos({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      })
      setScissorTrailPoints([
        {
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        },
      ])

      event.preventDefault()
      event.stopPropagation()
    },
    [canvasMode]
  )

  useEffect(() => {
    window.addEventListener('mousemove', handleGlobalScissorMouseMove)
    window.addEventListener('mouseup', finishScissorDrag)
    return () => {
      window.removeEventListener('mousemove', handleGlobalScissorMouseMove)
      window.removeEventListener('mouseup', finishScissorDrag)
    }
  }, [handleGlobalScissorMouseMove, finishScissorDrag])

  useEffect(() => {
    if (canvasMode === 'scissor') return
    scissorDraggingRef.current = false
    scissorLastPointRef.current = null
    cutEdgeIdsRef.current = new Set()
    setScissorTrailPoints([])
    setScissorCursorPos(null)
  }, [canvasMode])

  void historyLen

  return (
    <StudioShell contentPadding="0" initialSidebarExpanded={false} onAddNode={addNodeToCanvas}>
      <div className="h-screen relative flex" style={{ background: 'var(--nf-bg-canvas)' }}>
        {/* Canvas */}
        <div
          ref={canvasSurfaceRef}
          className="flex-1 relative"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onMouseDown={beginScissorDrag}
          onMouseLeave={() => {
            if (!scissorDraggingRef.current) setScissorCursorPos(null)
          }}
          style={{ cursor: canvasMode === 'scissor' ? 'crosshair' : undefined }}
        >
          <ReactFlow
            nodes={enhancedNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onNodeMouseEnter={(_, node) => {
              clearHoveredToolbarHide()
              setHoveredNodeId(node.id)
            }}
            onNodeMouseLeave={(event, node) => {
              const relatedTarget = event.relatedTarget as HTMLElement | null
              if (relatedTarget?.closest('[data-node-context-toolbar="true"]')) return
              scheduleHoveredToolbarHide(node.id)
            }}
            isValidConnection={(connection) => {
              if (!connection.source || !connection.target) return false
              const sourceNode = nodes.find((n) => n.id === connection.source)
              if (
                sourceNode &&
                connection.targetHandle &&
                !isConnectionTypeValid(sourceNode.type || '', connection.targetHandle)
              ) {
                return false
              }
              return !wouldCreateCycle(nodes, edges, {
                source: connection.source,
                target: connection.target,
              })
            }}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            deleteKeyCode={['Backspace', 'Delete']}
            fitView
            panOnDrag={canvasMode === 'pan' || spacePanning}
            selectionOnDrag={canvasMode === 'select'}
            nodesDraggable={canvasMode !== 'scissor'}
            nodesConnectable={canvasMode !== 'scissor'}
            elementsSelectable={canvasMode !== 'scissor'}
            style={{ background: 'var(--nf-bg-canvas)' }}
            defaultEdgeOptions={{
              type: 'flowing',
              data: { sourceType: 'uploadImage' },
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              color={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.12)'}
              gap={20}
              size={1.5}
            />
            <MiniMap
              position="bottom-right"
              style={{
                background: isDark ? '#1c1c1c' : '#f5f5f5',
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                borderRadius: 8,
              }}
              nodeColor={isDark ? '#404040' : '#d4d4d4'}
              maskColor={isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)'}
            />
          </ReactFlow>

          {canvasMode === 'scissor' && scissorTrailPoints.length > 1 && (
            <svg className="absolute inset-0 z-[15] pointer-events-none">
              <polyline
                fill="none"
                stroke="#0080ff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="5 5"
                points={scissorTrailPoints.map((point) => `${point.x},${point.y}`).join(' ')}
              />
            </svg>
          )}

          {canvasMode === 'scissor' && scissorCursorPos && (
            <div
              className="absolute z-[16] pointer-events-none"
              style={{
                left: scissorCursorPos.x + 12,
                top: scissorCursorPos.y + 10,
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center
                           bg-white/95 dark:bg-[#1c1c1c]/95 border border-black/10 dark:border-white/10 shadow-md"
              >
                <Scissors className="w-3.5 h-3.5 text-[#0080ff]" />
              </div>
            </div>
          )}

          {/* === OVERLAY LAYER === */}
          <div className="absolute inset-0 pointer-events-none" data-scissor-ignore="true">
            {/* Top-left: Title bar */}
            <div className="absolute top-4 left-4 pointer-events-auto">
              <div
                className="relative flex items-center
                           dark:bg-[#1c1c1c] bg-white
                           dark:border-white/[0.12] border-black/[0.08] border
                           rounded-2xl shadow-md px-2 py-2"
              >
                {/* Logo + chevron dropdown trigger */}
                <div
                  className="flex items-center gap-1 pr-2 mr-1
                             border-r dark:border-white/10 border-black/10"
                >
                  <button
                    type="button"
                    onClick={() => setLogoMenuOpen((o) => !o)}
                    className="flex items-center gap-1 hover:opacity-80"
                  >
                    <div
                      className="w-[18px] h-[18px] rounded flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ background: 'linear-gradient(135deg, #0080ff, #6c2bd9)' }}
                    >
                      N
                    </div>
                    <ChevronDown className="w-3 h-3 dark:text-white/60 text-gray-500" />
                  </button>
                </div>

                <input
                  value={flowName}
                  onChange={(e) => setFlowName(e.target.value)}
                  className="bg-transparent text-[13.5px] font-medium px-2
                             dark:text-white text-gray-900 outline-none
                             min-w-[60px] max-w-[200px]"
                />

                {/* Logo dropdown menu */}
                {logoMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setLogoMenuOpen(false)}
                    />
                    <div
                      className="absolute top-full left-0 mt-2 z-50 w-52 py-1
                                 dark:bg-[#1c1c1c] bg-white
                                 dark:border-white/10 border-black/10 border
                                 rounded-xl shadow-xl overflow-hidden"
                    >
                      {([
                        { Icon: ArrowLeft, label: 'Back', action: () => { setLogoMenuOpen(false); router.push('/nodes') } },
                        { Icon: AppWindow, label: 'Turn Into App', action: () => setLogoMenuOpen(false) },
                        { Icon: Upload, label: 'Import', action: () => { importInputRef.current?.click() } },
                        { Icon: Download, label: 'Export', action: exportWorkflow },
                        { Icon: Folders, label: 'Workspaces', action: () => setLogoMenuOpen(false) },
                      ] as const).map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={item.action}
                          className="w-full flex items-center gap-3 px-4 py-2.5
                                     dark:hover:bg-white/5 hover:bg-black/5
                                     dark:text-white text-gray-900 text-[13px]"
                        >
                          <item.Icon className="w-4 h-4 dark:text-white/50 text-gray-400" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Top-right: Action buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto">
              <ThemeToggle />

              {/* Share */}
              <button
                type="button"
                className="flex items-center gap-2 h-9 px-3 rounded-xl text-[12px]
                           dark:bg-[#1c1c1c] dark:text-white bg-white text-gray-900
                           dark:border-white/10 border-black/10 border
                           shadow-sm hover:opacity-80"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>

              {/* Turn workflow into app */}
              <button
                type="button"
                className="flex items-center gap-2 h-9 px-3 rounded-xl text-[12px]
                           dark:bg-[#1c1c1c] dark:text-[#d4d4d4] bg-white text-gray-700
                           dark:border-white/10 border-black/10 border
                           shadow-sm hover:opacity-80"
              >
                <AppWindow className="w-[15px] h-[15px]" />
                Turn workflow into app
              </button>

              {/* Run + dropdown */}
              <div className="relative">
                <div
                  className="flex items-center
                             dark:bg-[#1c1c1c] bg-white
                             dark:border-white/10 border-black/10 border
                             rounded-xl shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    className="flex items-center justify-center w-9 h-9
                               dark:hover:bg-white/5 hover:bg-black/5"
                    onClick={() => void handleRunWorkflow('full')}
                    disabled={isRunning}
                    title="Run full workflow"
                  >
                    <Play className="w-4 h-4 dark:text-white text-gray-900" />
                  </button>
                  <div className="w-px h-5 dark:bg-white/10 bg-black/10" />
                  <button
                    type="button"
                    className="flex items-center justify-center w-6 h-9
                               dark:hover:bg-white/5 hover:bg-black/5"
                    onClick={() => setRightDropdownOpen(!rightDropdownOpen)}
                  >
                    <ChevronDown className="w-3 h-3 dark:text-white/60 text-gray-500" />
                  </button>
                </div>

                {/* Dropdown */}
                {rightDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setRightDropdownOpen(false)}
                    />
                    <div
                      className="absolute top-full right-0 mt-2 z-50 w-52
                                 dark:bg-[#1c1c1c] bg-white
                                 dark:border-white/10 border-black/10 border
                                 rounded-xl shadow-xl overflow-hidden py-1"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setHistorySidebarOpen(!historySidebarOpen)
                          setRightDropdownOpen(false)
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5
                                   dark:hover:bg-white/5 hover:bg-black/5"
                      >
                        <div className="flex items-center gap-3">
                          <History className="w-4 h-4 dark:text-white/60 text-gray-500" />
                          <span className="text-[13px] dark:text-white text-gray-900">
                            Run History
                          </span>
                        </div>
                        <span className="text-[10px] dark:text-white/30 text-gray-400 font-mono">
                          ⌃⌥S
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAssetsPanelOpen(!assetsPanelOpen)
                          setRightDropdownOpen(false)
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5
                                   dark:hover:bg-white/5 hover:bg-black/5"
                      >
                        <div className="flex items-center gap-3">
                          <Layers className="w-4 h-4 dark:text-white/60 text-gray-500" />
                          <span className="text-[13px] dark:text-white text-gray-900">
                            Assets
                          </span>
                        </div>
                        <span className="text-[10px] dark:text-white/30 text-gray-400 font-mono">
                          ⌃⌥A
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Running state overlay */}
            {isRunning && nodes.length > 0 && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-auto z-10">
                <button
                  type="button"
                  onClick={() => setIsRunning(false)}
                  className="flex items-center gap-2 h-8 px-3 rounded-lg
                             bg-[#3b5bdb] text-white text-[12px] font-medium
                             hover:bg-[#2f4ac4]"
                >
                  <Pause className="w-3.5 h-3.5" />
                  Stop workflow
                </button>
              </div>
            )}

            {/* Node context toolbar — shown for hovered node or single selected node */}
            {nodeToolbarPos && (
              <div
                data-node-context-toolbar="true"
                className="absolute z-20 pointer-events-auto flex flex-col items-start gap-1"
                style={{
                  left: nodeToolbarPos.x,
                  top: nodeToolbarPos.y,
                }}
                onMouseEnter={clearHoveredToolbarHide}
                onMouseLeave={() => {
                  if (toolbarNode) scheduleHoveredToolbarHide(toolbarNode.id)
                }}
              >
                <button
                  type="button"
                  onClick={() => void handleRunWorkflow('full')}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[12px] font-medium
                             bg-[#0080ff] text-white shadow-md hover:bg-[#006edb] transition-colors
                             disabled:opacity-50"
                >
                  <Play className="w-3 h-3 fill-white" />
                  Run workflow
                </button>
                <button
                  type="button"
                  onClick={() =>
                    toolbarNode &&
                    void handleRunWorkflow('single', [toolbarNode.id])
                  }
                  disabled={isRunning}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[12px] font-medium
                             dark:bg-[#1c1c1c] dark:border dark:border-white/10 dark:text-white
                             bg-white border border-black/10 text-gray-900
                             shadow-md hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  <Play className="w-3 h-3 dark:fill-white fill-gray-900" />
                  Run node
                </button>
              </div>
            )}

            {/* Empty canvas hint */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <p className="text-[15px] font-semibold dark:text-white/25 text-gray-400 mb-1">
                  Add a node
                </p>
                <p className="text-[12px] dark:text-white/15 text-gray-400/70 flex items-center gap-1.5">
                  Double click, right click, or press
                  <kbd
                    className="inline-flex items-center justify-center w-5 h-5 rounded
                               dark:bg-[#2a2a2a] dark:border dark:border-white/10
                               bg-white border border-black/10
                               text-[10px] font-semibold dark:text-white/60 text-gray-600
                               shadow-sm"
                  >
                    N
                  </kbd>
                </p>
              </div>
            )}

            {/* Bottom center: Toolbar */}
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-auto"
            >
              <div
                className="flex items-center gap-1 p-1.5 rounded-2xl shadow-lg
                           dark:bg-[#1c1c1c] dark:border dark:border-white/10
                           bg-white border border-black/10"
              >
                {toolbarItems.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    item.id !== 'add' && item.id !== 'presets' && canvasMode === item.id
                  return (
                    <div key={item.id} className="relative group">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.id === 'add') {
                            setNodePickerPos({ x: window.innerWidth / 2 - 120, y: window.innerHeight / 2 - 200 })
                            setNodePickerOpen(true)
                          } else if (item.id === 'presets') {
                            setPresetsOpen(true)
                          } else {
                            setCanvasMode(item.id as CanvasMode)
                          }
                        }}
                        className={`w-11 h-11 flex items-center justify-center rounded-[10px] transition-colors
                          ${
                            isActive
                              ? 'dark:bg-[#404040] bg-gray-100'
                              : 'dark:hover:bg-white/5 hover:bg-black/5'
                          }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            isActive
                              ? 'dark:text-white text-gray-900'
                              : 'dark:text-white/60 text-gray-500'
                          }`}
                        />
                      </button>
                      {/* Tooltip */}
                      <div
                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                                   px-2 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap
                                   pointer-events-none
                                   dark:bg-[#1c1c1c] dark:text-white dark:border dark:border-white/10
                                   bg-white text-gray-900 border border-black/10
                                   shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {item.label}
                        {item.shortcut && (
                          <kbd className="ml-1 px-1 rounded dark:bg-[#333] bg-gray-100 text-[10px]">
                            {item.shortcut}
                          </kbd>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bottom left: Undo / Redo / Keyboard shortcuts (icon-only) */}
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                title="Undo (Ctrl+Z)"
                onClick={undo}
                disabled={!canUndo}
                className="w-9 h-9 flex items-center justify-center rounded-[10px] shadow-sm
                           dark:bg-[#1c1c1c] dark:border dark:border-white/10
                           bg-white border border-black/10
                           hover:opacity-80 disabled:opacity-30"
              >
                <Undo2 className="w-4 h-4 dark:text-white text-gray-900" />
              </button>

              <button
                type="button"
                title="Redo (Ctrl+Y)"
                onClick={redo}
                disabled={!canRedo}
                className="w-9 h-9 flex items-center justify-center rounded-[10px] shadow-sm
                           dark:bg-[#1c1c1c] dark:border dark:border-white/10
                           bg-white border border-black/10
                           hover:opacity-80 disabled:opacity-30"
              >
                <Redo2 className="w-4 h-4 dark:text-white text-gray-900" />
              </button>

              {/* Keyboard shortcuts — icon-only, matching undo/redo style */}
              <button
                type="button"
                title="Keyboard shortcuts"
                onClick={() => setKeyboardShortcutsOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-[10px] shadow-sm
                           dark:bg-[#1c1c1c] dark:border dark:border-white/10
                           bg-white border border-black/10
                           hover:opacity-80"
              >
                <Keyboard className="w-4 h-4 dark:text-white text-gray-900" />
              </button>
            </div>

            {/* Bottom right: Canvas Agent */}
            <button
              type="button"
              className={`absolute bottom-4 z-10 pointer-events-auto
                         w-14 h-14 rounded-full shadow-xl hover:opacity-80 transition-opacity
                         dark:bg-[#171717] dark:border dark:border-white/10
                         bg-white border border-black/10
                         flex items-center justify-center
                         ${historySidebarOpen || assetsPanelOpen ? 'right-[272px]' : 'right-4'}`}
            >
              <Bot className="w-[30px] h-[30px] dark:text-white text-gray-900" />
            </button>
          </div>

          {/* Node picker popup */}
          <NodePickerPopup
            open={nodePickerOpen}
            position={nodePickerPos}
            onClose={() => setNodePickerOpen(false)}
            onSelectNode={(type) => {
              addNodeToCanvas(type)
              setNodePickerOpen(false)
            }}
          />

          {/* Presets modal */}
          {presetsOpen && (
            <PresetsOverlay
              onDismiss={() => setPresetsOpen(false)}
              onSelectPreset={(tmpl) => loadPreset(tmpl.title)}
            />
          )}

          {/* Hidden import file input */}
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) importWorkflow(file)
              e.target.value = ''
            }}
          />
        </div>

        {/* Right panel: Run History */}
        <HistorySidebar
          workflowId={flowId ?? null}
          isOpen={historySidebarOpen}
          onToggle={() => setHistorySidebarOpen((o) => !o)}
          activeRunId={activeRunId}
        />

        {/* Right panel: Assets */}
        <AssetsPanel
          open={assetsPanelOpen}
          onClose={() => setAssetsPanelOpen(false)}
          onDropAsset={(src, type) => {
            const position = screenToFlowPosition({
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
            })
            const id = `uploadImage-${Date.now()}`
            const newNode: Node = {
              id,
              type: 'uploadImage',
              position,
              data: { label: 'Upload Image', fileUrl: src },
            }
            setNodes((nds) => {
              const updated = [...nds, newNode]
              pushHistory(updated, edges)
              return updated
            })
          }}
        />

        {/* Keyboard shortcuts modal */}
        <KeyboardShortcutsModal
          open={keyboardShortcutsOpen}
          onClose={() => setKeyboardShortcutsOpen(false)}
        />
      </div>
    </StudioShell>
  )
}

// Outer wrapper provides ReactFlowProvider so useReactFlow() works inside
export function NodeEditorCanvas({ flowId }: NodeEditorCanvasProps) {
  return (
    <ReactFlowProvider>
      <NodeEditorCanvasInner flowId={flowId} />
    </ReactFlowProvider>
  )
}
