import { create } from 'zustand'
import type { Node, Edge } from '@xyflow/react'

type RunStatus = 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL'
type NodeStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED'

interface HistoryEntry {
  nodes: Node[]
  edges: Edge[]
}

export interface HistoryRun {
  id: string
  status: RunStatus
  scope: 'FULL' | 'PARTIAL' | 'SINGLE'
  duration?: number | null
  startedAt: string
  completedAt?: string | null
  nodeResults: Array<{
    nodeId: string
    nodeName: string
    nodeType: string
    status: string
    outputs?: Record<string, unknown> | null
    error?: string | null
    duration?: number | null
  }>
}

interface WorkflowStore {
  // -- Canvas state --
  nodes: Node[]
  edges: Edge[]
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void

  // -- Node mutations --
  addNode: (node: Node) => void
  removeNode: (nodeId: string) => void
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void

  // -- Active workflow --
  workflowId: string | null
  workflowName: string
  setWorkflowId: (id: string | null) => void
  setWorkflowName: (name: string) => void

  // -- Save state --
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  setSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void

  // -- Run state --
  activeRunId: string | null
  runStatus: RunStatus | null
  nodeStatuses: Record<string, NodeStatus>
  nodeOutputs: Record<string, unknown>
  setNodeStatus: (nodeId: string, status: NodeStatus) => void
  setNodeOutput: (nodeId: string, output: unknown) => void
  setActiveRun: (runId: string) => void
  clearRun: () => void
  setRunStatus: (status: RunStatus | null) => void
  updateRunFromPoll: (run: {
    status: RunStatus
    nodeResults: Array<{
      nodeId: string
      status: NodeStatus
      output?: unknown
      error?: string | null
    }>
  }) => void

  // -- Workflow history runs --
  historyRuns: HistoryRun[]
  addHistoryRun: (run: HistoryRun) => void
  updateHistoryRun: (runId: string, updates: Partial<HistoryRun>) => void
  setHistoryRuns: (runs: HistoryRun[]) => void

  // -- History (undo/redo) --
  history: HistoryEntry[]
  historyIndex: number
  pushHistory: (entry: HistoryEntry) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // -- UI state --
  rightSidebarOpen: boolean
  toggleRightSidebar: () => void
  setRightSidebarOpen: (open: boolean) => void

  // -- Canvas mode --
  canvasMode: 'select' | 'pan' | 'scissor' | 'connect'
  setCanvasMode: (mode: 'select' | 'pan' | 'scissor' | 'connect') => void
}

const MAX_HISTORY = 50

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  // Canvas state
  nodes: [],
  edges: [],
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  // Node mutations
  addNode: (node) =>
    set((state) => ({ nodes: [...state.nodes, node] })),
  removeNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
    })),
  updateNodeData: (nodeId, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      ),
    })),

  // Active workflow
  workflowId: null,
  workflowName: 'Untitled Workflow',
  setWorkflowId: (id) => set({ workflowId: id }),
  setWorkflowName: (name) => set({ workflowName: name }),

  // Save state
  saveStatus: 'idle',
  setSaveStatus: (status) => set({ saveStatus: status }),

  // Run state
  activeRunId: null,
  runStatus: null,
  nodeStatuses: {},
  nodeOutputs: {},
  setNodeStatus: (nodeId, status) =>
    set((state) => ({
      nodeStatuses: { ...state.nodeStatuses, [nodeId]: status },
    })),
  setNodeOutput: (nodeId, output) =>
    set((state) => ({
      nodeOutputs: { ...state.nodeOutputs, [nodeId]: output },
    })),
  setActiveRun: (runId) =>
    set({
      activeRunId: runId,
      runStatus: 'RUNNING',
      nodeStatuses: {},
      nodeOutputs: {},
    }),
  clearRun: () =>
    set({
      activeRunId: null,
      runStatus: null,
      nodeStatuses: {},
      nodeOutputs: {},
    }),
  setRunStatus: (status) => set({ runStatus: status }),
  updateRunFromPoll: (run) =>
    set(() => {
      const nodeStatuses: Record<string, NodeStatus> = {}
      const nodeOutputs: Record<string, unknown> = {}
      for (const nr of run.nodeResults) {
        nodeStatuses[nr.nodeId] = nr.status
        if (nr.output) nodeOutputs[nr.nodeId] = nr.output
        if (nr.error) nodeOutputs[nr.nodeId] = { error: nr.error }
      }
      return {
        runStatus: run.status,
        nodeStatuses,
        nodeOutputs,
        activeRunId:
          run.status === 'RUNNING' ? get().activeRunId : null,
      }
    }),

  // Workflow history runs
  historyRuns: [],
  addHistoryRun: (run) =>
    set((state) => ({
      historyRuns: [run, ...state.historyRuns],
    })),
  updateHistoryRun: (runId, updates) =>
    set((state) => ({
      historyRuns: state.historyRuns.map((r) =>
        r.id === runId ? { ...r, ...updates } : r
      ),
    })),
  setHistoryRuns: (runs) => set({ historyRuns: runs }),

  // History
  history: [],
  historyIndex: -1,
  pushHistory: (entry) =>
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(entry)
      if (newHistory.length > MAX_HISTORY) newHistory.shift()
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      }
    }),
  undo: () =>
    set((state) => {
      if (state.historyIndex <= 0) return state
      const newIndex = state.historyIndex - 1
      const entry = state.history[newIndex]
      return {
        historyIndex: newIndex,
        nodes: entry.nodes,
        edges: entry.edges,
      }
    }),
  redo: () =>
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state
      const newIndex = state.historyIndex + 1
      const entry = state.history[newIndex]
      return {
        historyIndex: newIndex,
        nodes: entry.nodes,
        edges: entry.edges,
      }
    }),
  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // UI state
  rightSidebarOpen: false,
  toggleRightSidebar: () =>
    set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),
  setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),

  // Canvas mode
  canvasMode: 'select',
  setCanvasMode: (mode) => set({ canvasMode: mode }),
}))
