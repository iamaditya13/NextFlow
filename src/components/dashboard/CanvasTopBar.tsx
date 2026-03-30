'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AppWindow,
  ArrowLeft,
  ChevronDown,
  Download,
  Folders,
  History,
  Keyboard,
  Loader2,
  Package,
  Play,
  Redo2,
  Share2,
  Undo2,
  Upload,
} from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { toast } from './Toast'
import { useSettingsStore } from '@/stores/settingsStore'

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
  onToggleShortcuts?: () => void
  onLoadSample?: () => void
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
  onToggleShortcuts,
  onLoadSample,
}: CanvasTopBarProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [logoMenuOpen, setLogoMenuOpen] = useState(false)
  const logoMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!logoMenuOpen) return
    const onDown = (event: MouseEvent) => {
      if (!logoMenuRef.current?.contains(event.target as Node)) {
        setLogoMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [logoMenuOpen])

  const saveLabel =
    saveStatus === 'saving' ? 'Saving...'
    : saveStatus === 'saved' ? 'Saved'
    : saveStatus === 'error' ? 'Save failed'
    : null

  const onTurnIntoApp = () => {
    toast.info('Turn into App is coming soon')
  }

  const runMenuAction = (action: () => void) => {
    setLogoMenuOpen(false)
    action()
  }

  return (
    <>
      {/* Top-left: Logo + Workflow name */}
      <div className="nf-top-name">
        <div ref={logoMenuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="nf-top-name__logo"
            onClick={() => setLogoMenuOpen((prev) => !prev)}
            aria-label="Open canvas menu"
          >
            <div
              style={{
                width: 18,
                height: 18,
                display: 'grid',
                placeItems: 'center',
                color: 'var(--nf-text-primary)',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'var(--nf-font)',
                lineHeight: 1,
              }}
            >
              N
            </div>
            <ChevronDown size={11} color="var(--nf-text-label)" />
          </button>

          {logoMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                width: 220,
                background: 'var(--nf-bg-node)',
                border: '1px solid var(--nf-border-inner)',
                borderRadius: 12,
                boxShadow: '0 14px 36px rgba(0,0,0,0.45)',
                overflow: 'hidden',
                zIndex: 30,
                padding: '4px 0',
              }}
            >
              {([
                {
                  key: 'Back',
                  Icon: ArrowLeft,
                  action: () => router.push('/nodes'),
                },
                {
                  key: 'Turn into App',
                  Icon: AppWindow,
                  action: onTurnIntoApp,
                },
                {
                  key: 'Import',
                  Icon: Upload,
                  action: () => {
                    if (onImport) onImport()
                    else toast.info('Import is not available here')
                  },
                },
                {
                  key: 'Export',
                  Icon: Download,
                  action: () => {
                    if (onExport) onExport()
                    else toast.info('Export is not available here')
                  },
                },
                {
                  key: 'Workspaces',
                  Icon: Folders,
                  action: () => useSettingsStore.getState().openSettings('settings'),
                },
              ] as const).map(({ key, Icon, action }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => runMenuAction(action)}
                  className="nf-hover-item"
                  style={{
                    width: '100%',
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '0 12px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--nf-text-primary)',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'var(--nf-font)',
                    textAlign: 'left',
                  }}
                >
                  <Icon size={14} style={{ color: 'var(--nf-text-muted)' }} />
                  {key}
                </button>
              ))}
            </div>
          )}
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
              background: 'var(--nf-bg-node-inner)',
              border: '1px solid var(--nf-border-inner)',
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
              color: saveStatus === 'error' ? '#ef4444' : 'var(--nf-text-muted)',
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
          title="Version History"
        >
          <History size={16} />
        </button>

        <ThemeToggle />

        <button className="nf-top-actions__btn nf-top-actions__btn--icon" title="Share">
          <Share2 size={16} />
        </button>

        <button
          className="nf-top-actions__btn"
          onClick={onTurnIntoApp}
          title="Turn workflow into app"
        >
          <AppWindow size={14} />
          <span>Turn workflow into app</span>
        </button>

        {onLoadSample && (
          <button
            className="nf-top-actions__btn"
            onClick={onLoadSample}
            title="Load the Product Marketing Kit sample workflow"
          >
            <Package size={14} />
            <span>Load Sample</span>
          </button>
        )}

        <button
          className="nf-top-actions__btn"
          onClick={onRun}
          disabled={isExecuting}
          style={{
            background: isExecuting ? '#dc2626' : '#0080ff',
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
        <button
          className="nf-undo-toolbar__shortcut"
          onClick={onToggleShortcuts}
          title="Keyboard shortcuts (?)"
          type="button"
        >
          <Keyboard size={14} />
          <span>Keyboard shortcuts</span>
        </button>
      </div>

    </>
  )
}
