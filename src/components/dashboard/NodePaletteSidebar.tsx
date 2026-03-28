'use client'

import { Bot, Crop, Film, Image as ImageIcon, Type, Video } from 'lucide-react'

type PaletteItem = {
  nodeType: string
  label: string
  Icon: React.ComponentType<{ size?: number }>
}

const PALETTE_ITEMS: PaletteItem[] = [
  { nodeType: 'text',         label: 'Text',          Icon: Type      },
  { nodeType: 'uploadImage',  label: 'Upload Image',  Icon: ImageIcon },
  { nodeType: 'uploadVideo',  label: 'Upload Video',  Icon: Video     },
  { nodeType: 'llm',          label: 'LLM',           Icon: Bot       },
  { nodeType: 'cropImage',    label: 'Crop Image',    Icon: Crop      },
  { nodeType: 'extractFrame', label: 'Extract Frame', Icon: Film      },
]

interface NodePaletteSidebarProps {
  onAddNode: (nodeType: string) => void
}

export function NodePaletteSidebar({ onAddNode }: NodePaletteSidebarProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 16,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: 4,
        background: 'var(--nf-bg-node)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 'var(--nf-radius-2xl)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      {PALETTE_ITEMS.map(({ nodeType, label, Icon }) => (
        <div key={nodeType} className="nf-palette-item-wrap">
          <button
            type="button"
            title={label}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/reactflow', nodeType)
              e.dataTransfer.effectAllowed = 'move'
            }}
            onClick={() => onAddNode(nodeType)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--nf-radius-lg)',
              border: 'none',
              background: 'transparent',
              color: 'var(--nf-text-icon)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'grab',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.color = 'var(--nf-text-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--nf-text-icon)'
            }}
          >
            <Icon size={16} />
          </button>
          {/* Tooltip */}
          <div className="nf-palette-tooltip">{label}</div>
        </div>
      ))}
    </div>
  )
}
