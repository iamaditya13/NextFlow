'use client'

import { useState } from 'react'
import {
  ChevronDown,
  Download,
  History,
  Loader2,
  Play,
  Redo2,
  Share2,
  Sparkles,
  Undo2,
  Upload,
} from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

interface CanvasTopBarProps {
  workflowName: string
  onNameChange: (name: string) => void
  onSave?: () => void
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
  onExport?: () => void
  onImport?: () => void
  onRun?: () => void
  isExecuting?: boolean
  onToggleHistory?: () => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
}

export function CanvasTopBar({
  workflowName,
  onNameChange,
  onSave,
  saveStatus = 'idle',
  onExport,
  onImport,
  onRun,
  isExecuting = false,
  onToggleHistory,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: CanvasTopBarProps) {
  const [editing, setEditing] = useState(false)

  const saveLabel =
    saveStatus === 'saving' ? 'Saving...'
    : saveStatus === 'saved' ? 'Saved'
    : saveStatus === 'error' ? 'Save failed'
    : null

  return (
    <>
      {/* Top-left: Logo + Workflow name */}
      <div className="nf-top-name">
        <div className="nf-top-name__logo">
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              background: '#333',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              fontSize: 10,
              fontWeight: 800,
              fontFamily: 'var(--nf-font)',
            }}
          >
            N
          </div>
          <ChevronDown size={11} color="#666" />
        </div>

        {editing ? (
          <input
            autoFocus
            value={workflowName}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={() => { setEditing(false); onSave?.() }}
            onKeyDown={(e) => { if (e.key === 'Enter') { setEditing(false); onSave?.() } }}
            style={{
              height: 28,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid #333',
              borderRadius: 8,
              color: 'var(--nf-text-primary)',
              fontSize: 13.5,
              fontFamily: 'var(--nf-font)',
              fontWeight: 500,
              padding: '0 8px',
              outline: 'none',
              width: 160,
            }}
          />
        ) : (
          <button onClick={() => setEditing(true)} className="nf-top-name__title">
            {workflowName}
          </button>
        )}

        {saveLabel && (
          <span
            style={{
              fontSize: 10,
              color: saveStatus === 'error' ? '#ef4444' : '#555',
              fontWeight: 500,
              marginLeft: 4,
            }}
          >
            {saveLabel}
          </span>
        )}
      </div>

      {/* Top-right: Actions */}
      <div className="nf-top-actions">
        <button
          className="nf-top-actions__btn nf-top-actions__btn--icon"
          onClick={onToggleHistory}
          title="History"
        >
          <History size={16} />
        </button>

        <ThemeToggle />

        <button
          className="nf-top-actions__btn nf-top-actions__btn--icon"
          onClick={onExport}
          title="Export"
        >
          <Download size={16} />
        </button>

        <button
          className="nf-top-actions__btn nf-top-actions__btn--icon"
          onClick={onImport}
          title="Import"
        >
          <Upload size={16} />
        </button>

        <button className="nf-top-actions__btn nf-top-actions__btn--icon" title="Share">
          <Share2 size={16} />
        </button>

        <button
          className="nf-top-actions__btn"
          onClick={onRun}
          disabled={isExecuting}
          style={{
            background: isExecuting ? '#004999' : '#0080ff',
            color: '#fff',
            opacity: isExecuting ? 0.7 : 1,
            cursor: isExecuting ? 'not-allowed' : 'pointer',
          }}
        >
          {isExecuting ? (
            <>
              <Loader2 size={14} className="nf-spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play size={14} />
              <span>Run All</span>
            </>
          )}
        </button>
      </div>

      {/* Bottom-left: Undo / Redo */}
      <div className="nf-undo-toolbar">
        <button
          className="nf-undo-toolbar__btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          className="nf-undo-toolbar__btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 size={16} />
        </button>
      </div>

      {/* Bottom-right FAB: Canvas Agent */}
      <button className="nf-canvas-agent" title="Canvas Agent">
        <Sparkles size={24} />
      </button>
    </>
  )
}
