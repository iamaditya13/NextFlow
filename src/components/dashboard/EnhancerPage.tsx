'use client'

import { ChevronDown, Plus, Image as ImageIcon, Sparkles } from 'lucide-react'
import { useState } from 'react'

const MODELS = ['Krea Enhance', 'Krea Enhance Pro', 'Topaz AI'] as const

export function EnhancerPage() {
  const [model, setModel] = useState<string>(MODELS[0])
  const [showModelSelect, setShowModelSelect] = useState(false)

  return (
    <div className="flex flex-col items-center min-h-full bg-[#fafafa]">
      {/* Model selector */}
      <div className="mt-6 relative">
        <button
          onClick={() => setShowModelSelect(!showModelSelect)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 cursor-pointer transition-colors"
        >
          Model: {model}
          <ChevronDown size={14} className="text-neutral-400" />
        </button>
        {showModelSelect && (
          <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 overflow-hidden">
            {MODELS.map((m) => (
              <button
                key={m}
                onClick={() => { setModel(m); setShowModelSelect(false) }}
                className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer border-none transition-colors ${
                  m === model ? 'bg-indigo-50 text-indigo-700 font-medium' : 'bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main card */}
      <div className="mt-10 w-full max-w-md flex flex-col items-center">
        {/* Image preview */}
        <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6">
          <img
            src="/assets/eye-macro.webp"
            alt="Enhancer preview"
            className="w-full h-full object-cover block"
          />
        </div>

        {/* Title */}
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={20} className="text-indigo-500" />
          <h1 className="text-2xl font-semibold text-neutral-900 m-0">Enhancer</h1>
        </div>

        {/* Subtitle */}
        <p className="text-sm text-neutral-500 text-center leading-relaxed max-w-sm m-0">
          Upscale images up to 22K or videos up to 8K resolution, and add new details.
        </p>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-medium border-none cursor-pointer hover:bg-indigo-700 transition-colors">
            <Plus size={16} />
            Upload
          </button>
          <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-200 cursor-pointer hover:bg-indigo-100 transition-colors">
            <ImageIcon size={16} />
            Select asset
          </button>
        </div>

        {/* Caption */}
        <p className="mt-4 text-xs text-neutral-400 m-0">
          Max 75MB / 15 seconds
        </p>
      </div>
    </div>
  )
}
