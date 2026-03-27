'use client'

import { useState } from 'react'
import {
  Search,
  Clock,
  Image as ImageIcon,
  Video,
  Box,
  ChevronRight,
  Type,
  Mic,
  Hash,
  Sparkles,
  Palette,
  Box as CubeIcon,
} from 'lucide-react'

const recentNodes = [
  { id: 'krea-image', name: 'Krea Image', icon: '🎨' },
  { id: 'enhance', name: 'Enhance Image', icon: '✨' },
]

const imageItems = ['Generate Image', 'Enhance Image', 'Edit Image', 'Image Utility']
const videoItems = ['Generate Video', 'Enhance Video', 'Motion Transfer', 'Lipsync', 'Video Utility']
const otherItems = ['Generate 3D', 'Audio', 'Assets', 'Utility']

const assetTypes = [
  { name: 'Text', icon: Type },
  { name: 'Image', icon: ImageIcon },
  { name: 'Audio', icon: Mic },
  { name: 'Video', icon: Video },
  { name: '3D Object', icon: CubeIcon },
  { name: 'Style', icon: Palette },
  { name: 'Kling Element', icon: Sparkles },
  { name: 'Number', icon: Hash },
]

interface NodePickerPopupProps {
  open: boolean
  position: { x: number; y: number }
  onClose: () => void
  onSelectNode: (type: string) => void
}

export function NodePickerPopup({ open, position, onClose, onSelectNode }: NodePickerPopupProps) {
  const [search, setSearch] = useState('')
  const [assetsSubmenu, setAssetsSubmenu] = useState(false)

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div
        className="absolute z-50 w-60
                   dark:bg-[#1a1a1a] bg-white
                   dark:border-white/10 border-black/10 border
                   rounded-xl shadow-2xl overflow-hidden"
        style={{ top: position.y, left: position.x }}
      >
        {/* Search */}
        <div className="flex items-center gap-2 px-3 h-10 border-b dark:border-white/10 border-black/10">
          <Search className="w-4 h-4 dark:text-[#525252] text-gray-400 shrink-0" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nodes or models..."
            className="flex-1 text-[12px] bg-transparent dark:text-white text-gray-900
                       dark:placeholder-[#525252] placeholder-gray-400 outline-none"
          />
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto py-1">
          {/* Recent */}
          <div className="px-3 py-1.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3 h-3 dark:text-[#525252] text-gray-400" />
              <span className="text-[10.5px] dark:text-[#525252] text-gray-400 font-medium">
                Recent
              </span>
            </div>
            {recentNodes.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => { onSelectNode(node.id); onClose() }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg
                           dark:hover:bg-white/5 hover:bg-black/5 text-left"
              >
                <span className="text-sm">{node.icon}</span>
                <span className="text-[12px] dark:text-white text-gray-900">{node.name}</span>
              </button>
            ))}
          </div>

          {/* Image */}
          <Section icon={ImageIcon} title="Image" items={imageItems} onSelect={onSelectNode} onClose={onClose} />

          {/* Video */}
          <Section icon={Video} title="Video" items={videoItems} onSelect={onSelectNode} onClose={onClose} />

          {/* Other */}
          <div className="px-3 py-1.5 border-t dark:border-white/5 border-black/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Box className="w-3 h-3 dark:text-[#525252] text-gray-400" />
              <span className="text-[10.5px] dark:text-[#525252] text-gray-400 font-medium">
                Other
              </span>
            </div>
            {otherItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  if (item === 'Assets') {
                    setAssetsSubmenu(!assetsSubmenu)
                  } else {
                    onSelectNode(item.toLowerCase().replace(/\s/g, '-'))
                    onClose()
                  }
                }}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg
                           dark:hover:bg-white/5 hover:bg-black/5"
              >
                <span className="text-[12px] dark:text-white text-gray-900">{item}</span>
                <ChevronRight className="w-3 h-3 dark:text-[#525252] text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assets submenu */}
      {assetsSubmenu && (
        <div
          className="absolute z-50 w-44
                     dark:bg-[#1a1a1a] bg-white
                     dark:border-white/10 border-black/10 border
                     rounded-xl shadow-2xl overflow-hidden py-1"
          style={{ top: position.y, left: position.x + 248 }}
        >
          {assetTypes.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.name}
                type="button"
                onClick={() => { onSelectNode(`asset-${type.name.toLowerCase()}`); onClose() }}
                className="w-full flex items-center gap-3 px-3 py-2
                           dark:hover:bg-white/5 hover:bg-black/5"
              >
                <Icon className="w-4 h-4 dark:text-[#525252] text-gray-400" />
                <span className="text-[12px] dark:text-white text-gray-900">{type.name}</span>
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}

function Section({
  icon: Icon,
  title,
  items,
  onSelect,
  onClose,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  items: string[]
  onSelect: (type: string) => void
  onClose: () => void
}) {
  return (
    <div className="px-3 py-1.5 border-t dark:border-white/5 border-black/5">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3 dark:text-[#525252] text-gray-400" />
        <span className="text-[10.5px] dark:text-[#525252] text-gray-400 font-medium">
          {title}
        </span>
      </div>
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => { onSelect(item.toLowerCase().replace(/\s/g, '-')); onClose() }}
          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg
                     dark:hover:bg-white/5 hover:bg-black/5"
        >
          <span className="text-[12px] dark:text-white text-gray-900">{item}</span>
          <ChevronRight className="w-3 h-3 dark:text-[#525252] text-gray-400" />
        </button>
      ))}
    </div>
  )
}
