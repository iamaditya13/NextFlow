'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Background,
  BackgroundVariant,
  type Edge,
  type Node,
  type NodeTypes,
  type Connection,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useTheme } from 'next-themes'
import {
  AppWindow,
  ArrowLeft,
  Bot,
  ChevronDown,
  Download,
  Folders,
  Grid3X3,
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
} from 'lucide-react'
import { StudioShell } from './StudioShell'
import { WORKFLOW_TEMPLATES, getTemplateHref } from './workflowTemplates'
import { ThemeToggle } from './ThemeToggle'
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal'
import { NodePickerPopup } from './NodePickerPopup'
import { RightPanel } from './RightPanel'
import { KreaImageNode } from './nodes/KreaImageNode'

type NodeEditorCanvasProps = {
  flowId?: string
}

const nodeTypes: NodeTypes = {
  kreaImage: KreaImageNode,
}

type CanvasMode = 'select' | 'pan' | 'scissor' | 'connect'

export function NodeEditorCanvas({ flowId }: NodeEditorCanvasProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const [showPresets, setShowPresets] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const [flowName, setFlowName] = useState('Untitled')
  const [logoMenuOpen, setLogoMenuOpen] = useState(false)
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('select')
  const [isRunning, setIsRunning] = useState(false)

  // Modals / panels
  const [keyboardShortcutsOpen, setKeyboardShortcutsOpen] = useState(false)
  const [nodePickerOpen, setNodePickerOpen] = useState(false)
  const [nodePickerPos, setNodePickerPos] = useState({ x: 400, y: 300 })
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [rightDropdownOpen, setRightDropdownOpen] = useState(false)

  const emptyStateVisible = useMemo(
    () => nodes.length === 0 && showPresets && !dismissed,
    [nodes.length, showPresets, dismissed],
  )

  const emptyDismissedVisible = useMemo(
    () => nodes.length === 0 && (!showPresets || dismissed),
    [nodes.length, showPresets, dismissed],
  )

  const handleConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds))
    },
    [setEdges],
  )

  const addKreaNode = useCallback(
    (type: string) => {
      const id = `node-${Date.now()}`
      const newNode: Node = {
        id,
        type: 'kreaImage',
        position: { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 },
        data: {
          label: type,
          modelName: 'Krea 1',
          credits: '6',
          prompt: '',
        },
      }
      setNodes((nds) => [...nds, newNode])
      setShowPresets(false)
      setDismissed(true)
    },
    [setNodes],
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return

      switch (e.key.toLowerCase()) {
        case 'n':
          setNodePickerOpen(true)
          break
        case 'escape':
          setNodePickerOpen(false)
          setKeyboardShortcutsOpen(false)
          setRightDropdownOpen(false)
          break
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault()
            break
          case 'a':
            e.preventDefault()
            break
          case 'enter':
            e.preventDefault()
            break
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const toolbarItems = [
    { id: 'add' as const, icon: Plus, label: 'New Node', shortcut: 'N' },
    { id: 'select' as const, icon: MousePointer2, label: 'Select' },
    { id: 'pan' as const, icon: Hand, label: 'Pan' },
    { id: 'scissor' as const, icon: Scissors, label: 'Cut edges' },
    { id: 'presets' as const, icon: LayoutGrid, label: 'Presets' },
  ]

  return (
    <StudioShell contentPadding="0" initialSidebarExpanded={false}>
      <div className="h-screen relative flex dark:bg-[#0a0a0a] bg-[#f5f5f5]">
        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            nodeTypes={nodeTypes}
            fitView
            panOnDrag={canvasMode === 'pan'}
            style={{ background: isDark ? '#0a0a0a' : '#f5f5f5' }}
            defaultEdgeOptions={{
              style: {
                stroke: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                strokeWidth: 1.5,
              },
              type: 'smoothstep',
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              color={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
              gap={20}
              size={1}
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
                          setRightDropdownOpen(false)
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5
                                   dark:hover:bg-white/5 hover:bg-black/5"
                      >
                        <div className="flex items-center gap-3">
                          <LayoutGrid className="w-4 h-4 dark:text-white/60 text-gray-500" />
                          <span className="text-[13px] dark:text-white text-gray-900">
                            Assets
                          </span>
                        </div>
                        <kbd className="text-[11px] dark:text-white/30 text-gray-400">
                          Ctrl+Alt+A
                        </kbd>
                      </button>
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
                        <kbd className="text-[11px] dark:text-white/30 text-gray-400">
                          Ctrl+Alt+S
                        </kbd>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Empty state: presets */}
            {emptyStateVisible && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="pointer-events-auto flex flex-col items-center gap-4"
                  style={{ maxWidth: 1200 }}
                >
                  {/* Instruction text */}
                  <div className="flex items-center gap-1.5 text-[13px] dark:text-[#525252] text-gray-400">
                    <button
                      type="button"
                      onClick={() => setNodePickerOpen(true)}
                      className="px-2.5 py-0.5 rounded-md text-[12px] font-medium
                                 dark:bg-[#262626] dark:text-white dark:border-white/10
                                 bg-gray-100 text-gray-900 border-black/10 border
                                 hover:opacity-80"
                    >
                      Add a node
                    </button>
                    <span>or drag and drop media files, or select a preset</span>
                  </div>

                  {/* Preset cards */}
                  <div className="flex gap-6 flex-wrap justify-center">
                    {WORKFLOW_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => router.push(getTemplateHref(template))}
                        className="flex flex-col gap-3 items-start group"
                      >
                        <div
                          className="w-[212px] h-[141px] rounded-xl overflow-hidden
                                     dark:bg-[#1c1c1c] bg-gray-100
                                     dark:border-white/[0.08] border-black/[0.08] border
                                     flex items-center justify-center
                                     group-hover:ring-1 group-hover:ring-[#3b82f6]/50
                                     transition-all shadow-sm relative"
                        >
                          {template.id === 'empty-workflow' ? (
                            <div
                              className="w-12 h-12 rounded-full dark:bg-white bg-gray-800
                                         flex items-center justify-center shadow-md"
                            >
                              <Plus className="w-6 h-6 dark:text-black text-white" />
                            </div>
                          ) : (
                            <Grid3X3
                              size={24}
                              className="dark:text-white/[0.08] text-black/[0.08]"
                            />
                          )}
                          {template.isPro && (
                            <div
                              className="absolute top-2 right-2 flex items-center gap-1
                                         bg-[#3b5bdb] rounded-md px-1.5 py-0.5"
                            >
                              <span className="text-[10px] font-semibold text-white">
                                PRO
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-[15px] font-medium dark:text-white text-gray-900 text-left">
                            {template.title}
                          </p>
                          {template.subtitle && (
                            <p className="text-[11.5px] dark:text-[#737373] text-gray-500 text-left mt-0.5">
                              {template.subtitle}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Dismiss */}
                  <button
                    type="button"
                    onClick={() => {
                      setDismissed(true)
                      setShowPresets(false)
                    }}
                    className="flex items-center gap-2 h-9 px-4 rounded-full text-[13px]
                               dark:bg-[#1c1c1c] dark:text-white dark:border-white/10
                               bg-white text-gray-900 border-black/10 border
                               hover:opacity-80 shadow-sm"
                  >
                    <X className="w-4 h-4" />
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Empty dismissed state */}
            {emptyDismissedVisible && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-[15px] dark:text-[#525252] text-gray-400 font-medium">
                    Add a node
                  </p>
                  <p className="text-[13px] dark:text-[#404040] text-gray-300 mt-1">
                    Double click, right click, or press{' '}
                    <kbd
                      className="px-1.5 py-0.5 rounded-md text-[11px]
                                 dark:bg-[#2a2a2a] dark:border dark:border-white/15 dark:text-white
                                 bg-gray-100 border border-black/10 text-gray-900"
                    >
                      N
                    </kbd>
                  </p>
                </div>
              </div>
            )}

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
                            setShowPresets(true)
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

            {/* Bottom left: Undo / Redo / Keyboard shortcuts */}
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                title="Undo"
                className="w-9 h-9 flex items-center justify-center rounded-[10px] shadow-sm
                           dark:bg-[#1c1c1c] dark:border dark:border-white/10
                           bg-white border border-black/10
                           hover:opacity-80 disabled:opacity-30"
              >
                <Undo2 className="w-4 h-4 dark:text-white text-gray-900" />
              </button>

              <button
                type="button"
                title="Redo"
                className="w-9 h-9 flex items-center justify-center rounded-[10px] shadow-sm
                           dark:bg-[#1c1c1c] dark:border dark:border-white/10
                           bg-white border border-black/10
                           hover:opacity-80 disabled:opacity-30"
              >
                <Redo2 className="w-4 h-4 dark:text-white text-gray-900" />
              </button>

              <button
                type="button"
                onClick={() => setKeyboardShortcutsOpen(true)}
                className="flex items-center gap-2 h-9 px-3 rounded-[10px] shadow-sm text-[11.6px]
                           dark:bg-[#1c1c1c] dark:border dark:border-white/[0.15] dark:text-white
                           bg-white border border-black/10 text-gray-900
                           hover:opacity-80"
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>Keyboard shortcuts</span>
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
                         ${rightPanelOpen ? 'right-[272px]' : 'right-4'}`}
            >
              <Bot className="w-[30px] h-[30px] dark:text-white text-gray-900" />
            </button>
          </div>

          {/* Node picker popup */}
          <NodePickerPopup
            open={nodePickerOpen}
            position={nodePickerPos}
            onClose={() => setNodePickerOpen(false)}
            onSelectNode={addKreaNode}
          />
        </div>

        {/* Right panel */}
        {rightPanelOpen && (
          <div
            className="w-64 h-full shrink-0
                       dark:bg-black bg-white
                       border-l dark:border-white/[0.08] border-black/[0.08]
                       overflow-y-auto p-3"
          >
            {/* Version history card */}
            <button
              type="button"
              className="w-full rounded-xl p-2
                         dark:bg-[#262626] bg-gray-100
                         hover:opacity-80 transition-opacity text-left"
            >
              <div
                className="w-full rounded-lg overflow-hidden
                           dark:bg-[#1a1a1a] bg-white mb-2 relative"
                style={{ aspectRatio: '4/3' }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  }}
                />
                <div
                  className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded
                             bg-black/50 backdrop-blur-sm
                             text-[9.5px] font-medium dark:text-[#d4d4d4] text-gray-300"
                >
                  Just now
                </div>
                <div
                  className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded
                             dark:bg-[#404040] bg-gray-200
                             text-[7.9px] font-semibold uppercase tracking-wide
                             dark:text-[#d4d4d4] text-gray-600"
                >
                  Current
                </div>
                <div
                  className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded
                             bg-black/50 backdrop-blur-sm
                             text-[9.5px] font-medium dark:text-[#737373] text-gray-400"
                >
                  {nodes.length} node{nodes.length !== 1 ? 's' : ''} ·{' '}
                  {edges.length} edge{edges.length !== 1 ? 's' : ''}
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts modal */}
      <KeyboardShortcutsModal
        open={keyboardShortcutsOpen}
        onClose={() => setKeyboardShortcutsOpen(false)}
      />
    </StudioShell>
  )
}
