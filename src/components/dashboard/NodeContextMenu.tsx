'use client'

import { useEffect, useRef } from 'react'
import { Copy, Play, Trash2 } from 'lucide-react'

interface NodeContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onRun: () => void
  onDuplicate: () => void
  onDelete: () => void
}

export function NodeContextMenu({
  x,
  y,
  onClose,
  onRun,
  onDuplicate,
  onDelete,
}: NodeContextMenuProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [onClose])

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        minWidth: 170,
        borderRadius: 10,
        border: '1px solid #2a2a2a',
        background: '#161616',
        boxShadow: '0 10px 28px rgba(0,0,0,0.45)',
        padding: 4,
        zIndex: 60,
      }}
    >
      <button
        onClick={onRun}
        style={{
          width: '100%',
          height: 32,
          border: 'none',
          borderRadius: 6,
          background: 'transparent',
          color: '#c4b5fd',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          fontSize: 12,
          fontFamily: 'inherit',
          padding: '0 10px',
        }}
      >
        <Play size={13} />
        Run Node
      </button>

      <button
        onClick={onDuplicate}
        style={{
          width: '100%',
          height: 32,
          border: 'none',
          borderRadius: 6,
          background: 'transparent',
          color: '#d4d4d8',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          fontSize: 12,
          fontFamily: 'inherit',
          padding: '0 10px',
        }}
      >
        <Copy size={13} />
        Duplicate
      </button>

      <div style={{ height: 1, background: '#2a2a2a', margin: '4px 0' }} />

      <button
        onClick={onDelete}
        style={{
          width: '100%',
          height: 32,
          border: 'none',
          borderRadius: 6,
          background: 'transparent',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          fontSize: 12,
          fontFamily: 'inherit',
          padding: '0 10px',
        }}
      >
        <Trash2 size={13} />
        Delete
      </button>
    </div>
  )
}
