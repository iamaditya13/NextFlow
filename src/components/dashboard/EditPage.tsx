'use client'

import { Plus, Image as ImageIcon, Sparkles } from 'lucide-react'

export function EditPage() {
  return (
    <div className="flex flex-col items-center min-h-full bg-[#fafafa]">
      {/* Main card */}
      <div className="mt-20 w-full max-w-md flex flex-col items-center">
        {/* Placeholder icon */}
        <div className="w-20 h-28 rounded-xl bg-neutral-200 border-2 border-dashed border-neutral-300 flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12" y2="18.01" />
          </svg>
        </div>

        {/* Title */}
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
            A
          </span>
          <h1 className="text-2xl font-semibold text-neutral-900 m-0">Edit</h1>
          <Sparkles size={16} className="text-purple-500" />
          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[11px] font-semibold">
            New
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-sm text-neutral-500 text-center leading-relaxed max-w-sm m-0">
          Rearrange objects in your scene, blend objects from multiple images, place characters, or expand edges.
        </p>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-medium border-none cursor-pointer hover:bg-indigo-700 transition-colors">
            <Plus size={16} />
            Upload image
          </button>
          <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-200 cursor-pointer hover:bg-indigo-100 transition-colors">
            <ImageIcon size={16} />
            Select asset
          </button>
        </div>
      </div>
    </div>
  )
}
