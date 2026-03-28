'use client'

import { useRef, useState } from 'react'
import { Plus, MousePointer2, Hand, Scissors, LayoutGrid } from 'lucide-react'

type CanvasMode = 'select' | 'pan' | 'scissor' | 'connect'

interface ToolDef {
  icon: React.ElementType
  label: string
  shortcut: string
  mode: CanvasMode | 'new' | 'presets'
}

const TOOLS: ToolDef[] = [
  { icon: Plus,          label: 'New Node',        shortcut: 'N',      mode: 'new' },
  { icon: MousePointer2, label: 'Select',          shortcut: 'Drag',   mode: 'select' },
  { icon: Hand,          label: 'Pan',             shortcut: '⌘ Drag', mode: 'pan' },
  { icon: Scissors,      label: 'Cut Connections', shortcut: 'X Drag', mode: 'scissor' },
  { icon: LayoutGrid,    label: 'Presets',         shortcut: '',       mode: 'presets' },
]

interface CanvasBottomToolbarProps {
  onAddNode?: () => void
  onPresets?: () => void
  canvasMode?: CanvasMode
  onModeChange?: (mode: CanvasMode) => void
}

export function CanvasBottomToolbar({
  onAddNode,
  onPresets,
  canvasMode = 'select',
  onModeChange,
}: CanvasBottomToolbarProps) {
  const [tooltip, setTooltip] = useState<{
    label: string
    shortcut: string
    rect: DOMRect
  } | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleMouseEnter(
    e: React.MouseEvent<HTMLButtonElement>,
    label: string,
    shortcut: string
  ) {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    const rect = e.currentTarget.getBoundingClientRect()
    showTimer.current = setTimeout(() => {
      setTooltip({ label, shortcut, rect })
    }, 200)
  }

  function handleMouseLeave() {
    if (showTimer.current) clearTimeout(showTimer.current)
    hideTimer.current = setTimeout(() => setTooltip(null), 80)
  }

  function handleToolClick(tool: ToolDef) {
    if (tool.mode === 'new') {
      onAddNode?.()
    } else if (tool.mode === 'presets') {
      onPresets?.()
    } else {
      onModeChange?.(tool.mode as CanvasMode)
    }
  }

  return (
    <>
      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltip.rect.left + tooltip.rect.width / 2,
            top: tooltip.rect.top - 8,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px]
                        bg-[#1a1a1a] text-white border border-white/10
                        shadow-lg whitespace-nowrap"
          >
            <span>{tooltip.label}</span>
            {tooltip.shortcut && (
              <span className="px-1 py-0.5 rounded bg-white/10 text-[10px] font-mono">
                {tooltip.shortcut}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Bottom-center toolbar */}
      <div className="nf-canvas-toolbar">
        {TOOLS.map((tool) => {
          const Icon = tool.icon
          const isActive =
            tool.mode !== 'new' &&
            tool.mode !== 'presets' &&
            canvasMode === tool.mode
          return (
            <button
              key={tool.label}
              type="button"
              className={`nf-canvas-toolbar__item ${isActive ? 'nf-canvas-toolbar__item--active' : ''}`}
              onClick={() => handleToolClick(tool)}
              onMouseEnter={(e) => handleMouseEnter(e, tool.label, tool.shortcut)}
              onMouseLeave={handleMouseLeave}
            >
              <Icon size={20} />
            </button>
          )
        })}
      </div>
    </>
  )
}
