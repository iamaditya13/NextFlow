'use client'

import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const SAMPLE_ASSETS = [
  { src: '/assets/09e40a3f556058ae2f57ba22bce36f12.jpg', name: 'Image 1', type: 'image' },
  { src: '/assets/c879c585174b87b2d8ab43884e8f69bb.jpg', name: 'Image 2', type: 'image' },
]

interface AssetsPanelProps {
  open: boolean
  onClose: () => void
  onDropAsset?: (assetSrc: string, assetType: string) => void
}

export function AssetsPanel({ open, onClose, onDropAsset }: AssetsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // small delay to avoid closing immediately on the button click that opened it
    const timer = setTimeout(() => document.addEventListener('mousedown', onDown), 80)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', onDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      className="fixed right-0 top-0 bottom-0 z-20 flex flex-col
                 dark:bg-[#111111] bg-white
                 border-l dark:border-white/[0.08] border-black/[0.08]"
      style={{ width: 256 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-12 border-b dark:border-white/[0.08] border-black/[0.08] shrink-0">
        <span className="text-[13px] font-semibold dark:text-white text-gray-900">Assets</span>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg
                     dark:hover:bg-white/5 hover:bg-black/5
                     dark:text-white/50 text-gray-500 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {SAMPLE_ASSETS.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 px-4">
            <div className="w-12 h-12 rounded-xl dark:bg-[#1c1c1c] bg-gray-100
                            border dark:border-white/[0.08] border-black/[0.08]
                            flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                className="dark:text-white/30 text-gray-400">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <p className="text-[12px] dark:text-white/40 text-gray-500">No assets yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {SAMPLE_ASSETS.map((asset, i) => (
              <AssetThumbnail
                key={i}
                asset={asset}
                onDropAsset={onDropAsset}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AssetThumbnail({
  asset,
  onDropAsset,
}: {
  asset: { src: string; name: string; type: string }
  onDropAsset?: (src: string, type: string) => void
}) {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/asset-src', asset.src)
        e.dataTransfer.setData('application/asset-type', asset.type)
        e.dataTransfer.effectAllowed = 'copy'
        setIsDragging(true)
      }}
      onDragEnd={() => setIsDragging(false)}
      onClick={() => onDropAsset?.(asset.src, asset.type)}
      className="group relative rounded-xl overflow-hidden cursor-grab active:cursor-grabbing
                 dark:bg-[#1c1c1c] bg-gray-100
                 border dark:border-white/[0.06] border-black/[0.06]
                 hover:border-blue-500/50 transition-colors"
      style={{ aspectRatio: '1', opacity: isDragging ? 0.5 : 1 }}
    >
      <img
        src={asset.src}
        alt={asset.name}
        className="w-full h-full object-cover block"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5
                      bg-gradient-to-t from-black/60 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-[10px] text-white truncate">{asset.name}</p>
      </div>
    </div>
  )
}
