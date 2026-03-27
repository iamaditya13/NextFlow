'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Bot, ChevronRight, Clock3, Crop, Film, Image, Search, Type, Video } from 'lucide-react'

type NodeDef = {
  type: string
  label: string
  icon: React.ComponentType<{ size?: number }>
}

type Category = {
  label: string
  items: NodeDef[]
}

const CATEGORIES: Category[] = [
  {
    label: 'Text',
    items: [
      { type: 'text', label: 'Text Node', icon: Type },
    ],
  },
  {
    label: 'Image',
    items: [
      { type: 'uploadImage', label: 'Upload Image', icon: Image },
      { type: 'cropImage', label: 'Crop Image', icon: Crop },
    ],
  },
  {
    label: 'Video',
    items: [
      { type: 'uploadVideo', label: 'Upload Video', icon: Video },
      { type: 'extractFrame', label: 'Extract Frame', icon: Film },
    ],
  },
  {
    label: 'AI',
    items: [
      { type: 'llm', label: 'LLM Node', icon: Bot },
    ],
  },
]

const RECENT_NODES_STORAGE_KEY = 'nf.recentNodes'
const MAX_RECENT_NODES = 4

interface NodePickerPanelProps {
  screenX: number
  screenY: number
  onSelect: (nodeType: string) => void
  onClose: () => void
}

export function NodePickerPanel({ screenX, screenY, onSelect, onClose }: NodePickerPanelProps) {
  const [query, setQuery] = useState('')
  const [recentTypes, setRecentTypes] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(RECENT_NODES_STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      const safeTypes = parsed.filter((item): item is string => typeof item === 'string')
      return safeTypes.slice(0, MAX_RECENT_NODES)
    } catch {
      return []
    }
  })
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [onClose])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const allNodesByType = useMemo(() => {
    const map = new Map<string, NodeDef>()
    for (const category of CATEGORIES) {
      for (const item of category.items) {
        map.set(item.type, item)
      }
    }
    return map
  }, [])

  const addToRecent = (nodeType: string) => {
    const next = [nodeType, ...recentTypes.filter((type) => type !== nodeType)].slice(0, MAX_RECENT_NODES)
    setRecentTypes(next)
    try {
      localStorage.setItem(RECENT_NODES_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Ignore storage write errors silently.
    }
  }

  const PANEL_WIDTH = 252
  const PANEL_MAX_HEIGHT = 380
  const left = Math.min(screenX, window.innerWidth - PANEL_WIDTH - 12)
  const top = Math.min(screenY, window.innerHeight - PANEL_MAX_HEIGHT - 12)

  const q = query.trim().toLowerCase()
  const recentItems = recentTypes
    .map((type) => allNodesByType.get(type))
    .filter((item): item is NodeDef => Boolean(item))
    .filter((item) => !q || item.label.toLowerCase().includes(q))

  const filtered = CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) => !q || item.label.toLowerCase().includes(q)),
  })).filter((cat) => cat.items.length > 0)

  const renderNodeItem = (item: NodeDef) => {
    const Icon = item.icon
    return (
      <button
        key={item.type}
        onClick={() => {
          addToRecent(item.type)
          onSelect(item.type)
          onClose()
        }}
        style={{
          width: '100%',
          height: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '0 8px',
          borderRadius: 7,
          border: 'none',
          background: 'transparent',
          color: '#d4d4d8',
          fontSize: 13,
          fontFamily: 'inherit',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#222')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={14} />
          <span>{item.label}</span>
        </div>
        <ChevronRight size={13} color="#444" />
      </button>
    )
  }

  return (
    <div
      className="nf-node-picker-panel"
      ref={ref}
      style={{
        position: 'fixed',
        left,
        top,
        width: PANEL_WIDTH,
        maxHeight: PANEL_MAX_HEIGHT,
        background: 'var(--nf-bg-node)',
        border: '1px solid var(--nf-border-inner)',
        borderRadius: 'var(--nf-radius-xl)',
        boxShadow: '0 20px 48px rgba(0,0,0,0.65)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Search */}
      <div
        style={{
          padding: '10px 10px 8px',
          borderBottom: '1px solid var(--nf-border-inner)',
          flexShrink: 0,
        }}
      >
        <div style={{ position: 'relative' }}>
          <Search
            size={13}
            color="#4a4a4a"
            style={{
              position: 'absolute',
              left: 9,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nodes or models..."
            style={{
              width: '100%',
              height: 32,
              borderRadius: 8,
              border: '1px solid #2e2e2e',
              background: 'var(--nf-bg-node-inner)',
              color: 'var(--nf-text-secondary)',
              fontSize: 12,
              fontFamily: 'inherit',
              outline: 'none',
              padding: '0 10px 0 28px',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Categorized list */}
      <div
        className="nf-scroll"
        style={{ overflowY: 'auto', flex: 1, padding: '4px 6px 6px' }}
      >
        {recentItems.length === 0 && filtered.length === 0 && (
          <div
            style={{
              color: '#555',
              fontSize: 12,
              textAlign: 'center',
              padding: '20px 0',
            }}
          >
            No results
          </div>
        )}

        {recentItems.length > 0 && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: '#8a8a8a',
                fontWeight: 500,
                padding: '8px 8px 4px',
              }}
            >
              <Clock3 size={12} />
              <span>Recent</span>
            </div>
            {recentItems.map((item) => renderNodeItem(item))}
          </div>
        )}

        {filtered.map((cat) => (
          <div key={cat.label}>
            <div
              style={{
                fontSize: 10,
                color: '#4a4a4a',
                fontWeight: 600,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                padding: '8px 8px 4px',
              }}
            >
              {cat.label}
            </div>

            {cat.items.map((item) => renderNodeItem(item))}
          </div>
        ))}
      </div>
    </div>
  )
}
