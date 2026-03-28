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
import { RightPanel } from './RightPanel'
import { PresetsOverlay } from './PresetsOverlay'
import { AssetsPanel } from './AssetsPanel'
import { PRESET_WORKFLOWS } from './presetDefinitions'
import { isConnectionTypeValid } from '@/lib/nodeTypes'
import { FlowingEdge } from './FlowingEdge'

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
  const [presetsOpen, setPresetsOpen] = useState(false)

  // Modals / panels
  const [keyboardShortcutsOpen, setKeyboardShortcutsOpen] = useState(false)
  const [nodePickerOpen, setNodePickerOpen] = useState(false)
  const [nodePickerPos, setNodePickerPos] = useState({ x: 400, y: 300 })
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [assetsPanelOpen, setAssetsPanelOpen] = useState(false)
  const [rightDropdownOpen, setRightDropdownOpen] = useState(false)
  const [spacePanning, setSpacePanning] = useState(false)
  const clipboardRef = useRef<{ nodes: Node[]; edges: Edge[] } | null>(null)

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
        },
      })),
    [nodes, setNodes, setEdges]
  )

  // Single selected node for context toolbar
  const selectedNodes = nodes.filter((n) => n.selected)
  const singleSelectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null

  const nodeToolbarPos = useMemo(() => {
    if (!singleSelectedNode) return null
    const nodeW = (singleSelectedNode as Node & { measured?: { width?: number } }).measured?.width ?? 200
    const screen = flowToScreenPosition({
      x: singleSelectedNode.position.x + nodeW / 2,
      y: singleSelectedNode.position.y,
    })
    return { x: screen.x, y: screen.y - 52 }
  }, [singleSelectedNode, flowToScreenPosition])

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
        data: { label: type },
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
        const newNode: Node = { id, type: nodeType, position, data: { label: nodeType } }
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

      // Ctrl+Alt+S → Version History panel
      if (ctrl && alt && key === 's') {
        e.preventDefault()
        setRightPanelOpen((o) => !o)
        return
      }

      if (ctrl && key === 'c') {
        e.preventDefault()
        if (e.shiftKey) {
          setRightPanelOpen((open) => !open)
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
        setIsRunning(true)
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

  void historyLen

  return (
    <StudioShell contentPadding="0" initialSidebarExpanded={false} onAddNode={addNodeToCanvas}>
      <div className="h-screen relative flex" style={{ background: 'var(--nf-bg-canvas)' }}>
        {/* Canvas */}
        <div
          className="flex-1 relative"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <ReactFlow
            nodes={enhancedNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            deleteKeyCode={['Backspace', 'Delete']}
            fitView
            panOnDrag={canvasMode === 'pan' || spacePanning}
            selectionOnDrag={canvasMode === 'select'}
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
          </ReactFlow>

          {/* === OVERLAY LAYER === */}
          <div className="absolute inset-0 pointer-events-none">
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
                        { Icon: Upload, label: 'Import', action: () => setLogoMenuOpen(false) },
                        { Icon: Download, label: 'Export', action: () => setLogoMenuOpen(false) },
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
                    onClick={() => setIsRunning(!isRunning)}
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
                          setRightPanelOpen(!rightPanelOpen)
                          setRightDropdownOpen(false)
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5
                                   dark:hover:bg-white/5 hover:bg-black/5"
                      >
                        <div className="flex items-center gap-3">
                          <History className="w-4 h-4 dark:text-white/60 text-gray-500" />
                          <span className="text-[13px] dark:text-white text-gray-900">
                            Version History
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

            {/* Node context toolbar — shown when a single node is selected */}
            {nodeToolbarPos && (
              <div
                className="absolute z-20 pointer-events-auto flex flex-col items-end gap-1"
                style={{
                  left: nodeToolbarPos.x,
                  top: nodeToolbarPos.y,
                  transform: 'translateX(-50%)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsRunning(true)}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[12px] font-medium
                             bg-[#0080ff] text-white shadow-md hover:bg-[#006edb] transition-colors"
                >
                  <Play className="w-3 h-3 fill-white" />
                  Run workflow
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Run only this node (stub — wire up executor when ready)
                  }}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[12px] font-medium
                             dark:bg-[#1c1c1c] dark:border dark:border-white/10 dark:text-white
                             bg-white border border-black/10 text-gray-900
                             shadow-md hover:opacity-80 transition-opacity"
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
                         ${rightPanelOpen || assetsPanelOpen ? 'right-[272px]' : 'right-4'}`}
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
        </div>

        {/* Right panel: Version History */}
        <RightPanel
          open={rightPanelOpen}
          nodes={nodes}
          edges={edges}
          versionHistory={[]}
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
              data: { label: 'uploadImage', fileUrl: src },
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
