'use client'

import { useRef, useState } from 'react'
import {
  Download,
  Maximize2,
  Pencil,
  Play,
  PlayCircle,
  Save,
  Square,
  Upload,
} from 'lucide-react'

interface TopToolbarProps {
  workflowName: string
  onNameChange: (name: string) => void
  onSave: () => void
  onRunAll: () => void
  onRunSelected: () => void
  onStop: () => void
  onExport: () => void
  onImport: (json: string) => void
  onFitView: () => void
  isExecuting: boolean
  selectedCount: number
}

export function TopToolbar({
  workflowName,
  onNameChange,
  onSave,
  onRunAll,
  onRunSelected,
  onStop,
  onExport,
  onImport,
  onFitView,
  isExecuting,
  selectedCount,
}: TopToolbarProps) {
  const [editing, setEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const iconButtonStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1px solid #2a2a2a',
    background: '#111111',
    color: '#a1a1aa',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const handleFileRead = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        onImport(e.target.result)
      }
    }
    reader.readAsText(file)

    event.target.value = ''
  }

  return (
    <header
      style={{
        height: 48,
        borderBottom: '1px solid #1a1a1a',
        background: 'rgba(10,10,10,0.9)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: 10,
        flexShrink: 0,
        zIndex: 5,
      }}
    >
      <div style={{ minWidth: 220, maxWidth: 320, flex: '0 0 auto' }}>
        {editing ? (
          <input
            autoFocus
            value={workflowName}
            onChange={(event) => onNameChange(event.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                setEditing(false)
              }
            }}
            style={{
              width: '100%',
              height: 32,
              borderRadius: 8,
              border: '1px solid #2a2a2a',
              background: '#111111',
              color: 'white',
              fontSize: 13,
              fontFamily: 'inherit',
              padding: '0 10px',
              outline: 'none',
            }}
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            style={{
              height: 32,
              maxWidth: '100%',
              border: '1px solid #2a2a2a',
              borderRadius: 8,
              background: '#111111',
              color: 'white',
              padding: '0 10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 13,
            }}
            title="Rename workflow"
          >
            <span
              style={{
                maxWidth: 220,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {workflowName}
            </span>
            <Pencil size={12} color="#6b7280" />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto' }}>
        {isExecuting ? (
          <button
            onClick={onStop}
            style={{
              height: 32,
              borderRadius: 8,
              border: '1px solid rgba(239,68,68,0.5)',
              background: 'rgba(239,68,68,0.15)',
              color: '#ef4444',
              padding: '0 14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Square size={13} />
            Stop
          </button>
        ) : (
          <>
            <button
              onClick={onRunAll}
              style={{
                height: 32,
                borderRadius: 8,
                border: 'none',
                background: '#8b5cf6',
                color: 'white',
                padding: '0 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Play size={13} />
              Run All
            </button>

            {selectedCount > 0 && (
              <button
                onClick={onRunSelected}
                style={{
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid #8b5cf6',
                  background: 'transparent',
                  color: '#c4b5fd',
                  padding: '0 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: 'inherit',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <PlayCircle size={13} />
                Run Selected ({selectedCount})
              </button>
            )}
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={onSave} style={iconButtonStyle} title="Save (Ctrl+S)">
          <Save size={15} />
        </button>
        <button onClick={onExport} style={iconButtonStyle} title="Export JSON">
          <Download size={15} />
        </button>
        <button onClick={handleImportClick} style={iconButtonStyle} title="Import JSON">
          <Upload size={15} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileRead}
          style={{ display: 'none' }}
        />
        <button onClick={onFitView} style={iconButtonStyle} title="Fit view">
          <Maximize2 size={15} />
        </button>
      </div>
    </header>
  )
}
