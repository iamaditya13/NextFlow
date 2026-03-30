# NodeEditorCanvas

This document explains how `NodeEditorCanvas.tsx` works and how to safely extend it.

## Purpose

`NodeEditorCanvas` is the main workflow editor for the dashboard. It provides:

- A React Flow canvas for node/edge editing
- Workflow execution (full or per-node)
- Undo/redo history
- Keyboard shortcuts
- Import/export and local draft save
- Auxiliary panels (history, assets, presets, shortcuts)

## Component Shape

- `NodeEditorCanvas` (outer): wraps the editor in `ReactFlowProvider`.
- `NodeEditorCanvasInner` (inner): owns all editor state and behavior.

The split exists because `useReactFlow()` requires `ReactFlowProvider`.

## Core Data and State

- `nodes`, `edges`: canvas graph state via `useNodesState` / `useEdgesState`.
- `historyRef`, `historyIdxRef`: undo/redo snapshots with max history size 50.
- `flowName`: editable workflow title.
- `canvasMode`: `'select' | 'pan' | 'scissor' | 'connect'`.
- UI panels/modals:
  - `keyboardShortcutsOpen`
  - `nodePickerOpen`
  - `historySidebarOpen`
  - `assetsPanelOpen`
  - `presetsOpen`

## Node and Edge Types

Node types are registered in `nodeTypes`:

- `text`
- `uploadImage`
- `uploadVideo`
- `llm`
- `cropImage`
- `extractFrame`
- `kreaImage`

Custom edge type:

- `flowing` (from `FlowingEdge`)

## Execution Flow

`handleRunWorkflow(scope, selectedNodeIds)` does the following:

1. Prevents duplicate runs and opens run history.
2. Persists workflow to API (`POST/PUT /api/workflows...`).
3. Triggers a server run (`POST /api/workflows/:id/run`) for history tracking.
4. Executes the client DAG (`runWorkflow`) and updates node status/output live.

Scopes:

- `full`: run everything
- `single` / `partial`: run selected nodes + upstream dependencies

## Graph Integrity Rules

- New edges are type-checked with `isConnectionTypeValid`.
- Cycles are blocked by `wouldCreateCycle(...)`.

## Editor Interactions

- Add node from toolbar or shortcuts (`addNodeToCanvas`).
- Drag/drop from node list and assets panel (`onDrop`).
- Node-level actions injected through `enhancedNodes.data`:
  - `onDelete`
  - `onUpdateData`
  - `onRun`

## Persistence / IO

- Local draft save key: `nextflow:canvas-draft` (`localStorage`).
- Export: downloads JSON snapshot of name/nodes/edges.
- Import: reads JSON and replaces graph state.

## Keyboard Shortcuts

Global shortcuts include:

- `Ctrl/Cmd + S` save draft
- `Ctrl/Cmd + Z`, `Ctrl/Cmd + Shift + Z`, `Ctrl/Cmd + Y` undo/redo
- `Ctrl/Cmd + A` select all
- `Ctrl/Cmd + C/V/D` copy/paste/duplicate
- `Ctrl/Cmd + G` group, `Ctrl/Cmd + Shift + G` ungroup
- `Ctrl/Cmd + Enter` run full workflow
- `Ctrl/Cmd + Alt + A` toggle assets panel
- `Ctrl/Cmd + Alt + S` toggle run history
- `N` open node picker
- `I`, `V`, `L`, `E` quick-add specific nodes
- `Delete/Backspace` delete selected
- `+/-` zoom
- `Space` temporary pan mode

## UI Layout (Overlay Layer)

Main overlay regions:

- Top-left: flow title + logo dropdown (import/export/workspaces)
- Top-right: theme, share, run controls
- Bottom-center: editor tool strip
- Bottom-left: undo/redo + shortcut modal trigger
- Bottom-right: canvas agent action button

Right-side panels:

- `HistorySidebar`
- `AssetsPanel`

Modal/popups:

- `NodePickerPopup`
- `PresetsOverlay`
- `KeyboardShortcutsModal`

## How to Add a New Node Type

1. Create node component under `./nodes/`.
2. Add it to `nodeTypes`.
3. Add a label in `NODE_LABELS`.
4. Add picker/shortcut wiring if needed.
5. Ensure connection validation supports its handles in `@/lib/nodeTypes`.
6. Test run behavior through `runWorkflow`.

## Maintenance Notes

- Keep all graph-mutating actions calling `pushHistory(...)`.
- Import/export strips callback functions from node `data`; preserve this behavior.
- The "Stop workflow" button currently toggles UI state (`isRunning`) and does not cancel in-flight async work at source.
