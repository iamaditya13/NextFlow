'use client'

import { useState } from 'react'
import {
  Search,
  Home as HomeIcon,
  Heart,
  Image as ImageIcon,
  Video,
  Triangle,
  Sparkles,
  Box,
  Move,
  Upload,
  FolderPlus,
  Grid,
  LayoutGrid,
  Plus,
} from 'lucide-react'

type FilterCategory = {
  label: string
  icon: React.ReactNode
  count: number
}

const TOOL_CATEGORIES: FilterCategory[] = [
  { label: 'Image', icon: <ImageIcon size={14} />, count: 2 },
  { label: 'Video', icon: <Video size={14} />, count: 0 },
  { label: 'Edited', icon: <Triangle size={14} />, count: 0 },
  { label: 'Enhanced', icon: <Sparkles size={14} />, count: 0 },
  { label: '3D Object', icon: <Box size={14} />, count: 0 },
  { label: 'Motion Transfer', icon: <Move size={14} />, count: 0 },
  { label: 'Uploaded', icon: <Upload size={14} />, count: 0 },
]

const SAMPLE_ASSETS = [
  '/assets/09e40a3f556058ae2f57ba22bce36f12.jpg',
  '/assets/c879c585174b87b2d8ab43884e8f69bb.jpg',
]

export function AssetsPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [zoom, setZoom] = useState(50)
  const [gridView, setGridView] = useState(true)

  const colCount = zoom > 66 ? 2 : zoom > 33 ? 3 : 4

  return (
    <div className="flex h-full w-full">
      {/* Main content area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top toolbar */}
        <div className="h-12 border-b border-neutral-800 flex items-center justify-end gap-3 px-4 shrink-0">
          {/* Zoom slider */}
          <div className="flex items-center gap-2">
            <Grid size={14} className="text-neutral-500" />
            <input
              type="range"
              min={0}
              max={100}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-28 h-1 accent-neutral-400 cursor-pointer"
            />
            <LayoutGrid size={14} className="text-neutral-500" />
          </div>
          {/* Layout toggle */}
          <button
            onClick={() => setGridView(!gridView)}
            className="w-8 h-8 rounded-md border border-neutral-700 bg-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-500 grid place-items-center cursor-pointer transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
          </button>
        </div>

        {/* Image grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-neutral-200 m-0">Today</h2>
            <button className="w-5 h-5 rounded bg-neutral-800 border border-neutral-700 text-neutral-400 grid place-items-center cursor-pointer hover:text-neutral-200 transition-colors">
              <Plus size={12} />
            </button>
          </div>

          {SAMPLE_ASSETS.length > 0 ? (
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
            >
              {SAMPLE_ASSETS.map((src, i) => (
                <div
                  key={i}
                  className="group relative rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-colors cursor-pointer aspect-square"
                >
                  <img
                    src={src}
                    alt={`Asset ${i + 1}`}
                    className="w-full h-full object-cover block"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 grid place-items-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <h2 className="m-0 text-neutral-200 text-base font-semibold">No assets yet</h2>
              <p className="mt-2 text-neutral-500 text-[13px] leading-relaxed">
                Your generations will appear here.<br />Get started by generating images.
              </p>
              <button className="mt-5 h-10 rounded-full border border-neutral-700 bg-white text-black px-6 text-[13px] font-semibold cursor-pointer hover:bg-neutral-100 transition-colors">
                Generate images
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar – Filters */}
      <aside className="w-[220px] h-full border-l border-neutral-800 bg-[#0e0e0e] flex flex-col shrink-0 overflow-hidden">
        {/* Toggle button */}
        <div className="h-12 border-b border-neutral-800 flex items-center justify-end px-2.5">
          <button className="w-6 h-6 bg-transparent border-none text-neutral-500 cursor-pointer grid place-items-center hover:text-neutral-300 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-2.5 pt-2.5 pb-1.5">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-600"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
              className="w-full h-8 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 text-xs pl-8 pr-2.5 outline-none focus:border-neutral-600 transition-colors"
            />
          </div>
        </div>

        {/* All / Favorites */}
        <div className="px-2 pt-1">
          <FilterItem
            label="All"
            icon={<HomeIcon size={13} />}
            count={2}
            isActive={activeFilter === 'All'}
            onClick={() => setActiveFilter('All')}
            activeColor="#4f46e5"
          />
          <FilterItem
            label="Favorites"
            icon={<Heart size={13} />}
            count={0}
            isActive={activeFilter === 'Favorites'}
            onClick={() => setActiveFilter('Favorites')}
          />
        </div>

        {/* Tools section */}
        <div className="px-2 pt-2">
          <div className="text-[10px] text-neutral-600 uppercase tracking-wider font-semibold px-2 mb-1">
            Tools
          </div>
          {TOOL_CATEGORIES.map((cat) => (
            <FilterItem
              key={cat.label}
              label={cat.label}
              icon={cat.icon}
              count={cat.count}
              isActive={activeFilter === cat.label}
              onClick={() => setActiveFilter(cat.label)}
            />
          ))}
        </div>

        {/* Folders section */}
        <div className="px-2 pt-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] text-neutral-600 uppercase tracking-wider font-semibold">
              Folders
            </span>
            <button className="bg-transparent border-none text-neutral-500 cursor-pointer grid place-items-center w-5 h-5 hover:text-neutral-300 transition-colors">
              <FolderPlus size={13} />
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}

function FilterItem({
  label,
  icon,
  count,
  isActive,
  onClick,
  activeColor,
}: {
  label: string
  icon: React.ReactNode
  count: number
  isActive: boolean
  onClick: () => void
  activeColor?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full h-8 rounded-lg border-none flex items-center gap-2 px-2.5 cursor-pointer text-xs font-medium mb-px transition-colors ${
        isActive ? 'text-white' : 'text-neutral-400 hover:text-neutral-200 bg-transparent hover:bg-white/5'
      }`}
      style={isActive ? { background: activeColor || '#222' } : undefined}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      <span className={`text-[11px] min-w-[18px] text-right ${isActive ? 'text-white/70' : 'text-neutral-600'}`}>
        {count}
      </span>
    </button>
  )
}
