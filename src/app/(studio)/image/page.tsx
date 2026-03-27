'use client'

import {
  ChevronDown,
  Image as ImageIcon,
  Layers,
  Palette,
  Ratio,
  Send,
  Sparkles,
  Square,
  Zap,
  Diamond,
  CheckCircle2,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { StudioShell } from '@/components/dashboard/StudioShell'

const optionBtnBase = {
  height: 36,
  borderRadius: 10,
  border: '1px solid #262626',
  background: '#141414',
  color: '#e5e5e5',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '0 10px',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
} as const

const EXAMPLE_IMAGES = [
  {
    gradient: 'linear-gradient(160deg, #2a1f3d 0%, #0d0d1a 60%, #0a0a14 100%)',
    prompt:
      'Dark underexposed and extremely elegant photo of a silver Porsche 911 floating out of balance in mid air on a black to orange gradient background, highly saturated high contrast background, almost glowing, product photography, extremely elegant, studio lighting, minimalist composition, simple background, shot on Canon EOS R5, extremely clear, extremely sharp, crisp, close up, 8k, gradient background, ultra crisp, high key lighting, professional color grading',
    title: 'Dark Underexp...',
  },
  {
    gradient: 'linear-gradient(160deg, #1a2e1a 0%, #0d1a0d 60%, #0a140a 100%)',
    prompt:
      'A single adventurous ancient bonsai tree with twisted gnarled branches, oil painting style, dramatic lighting, mystical atmosphere',
    title: 'A Single Adven...',
  },
  {
    gradient: 'linear-gradient(160deg, #3d2a1f 0%, #1a150d 60%, #14100a 100%)',
    prompt:
      'Photo of a Shiba Inu dog wearing a chef hat and apron, professional photography, studio lighting',
    title: 'Photo Of A Seri...',
  },
  {
    gradient: 'linear-gradient(160deg, #1f2a3d 0%, #0d1520 60%, #0a1018 100%)',
    prompt:
      'Oil painting of three peach-to-white hibiscus blossoms against a cerulean sky-blue backdrop, juicy palette-knife texture gleaming with sunlight',
    title: 'Oil Painting Of...',
  },
]

const MODELS = [
  { id: 'nano-banana-pro', name: 'Nano Banana Pro', desc: "World's most intelligent model.", speed: 2, quality: 3, credits: '~100', verified: true },
  { id: 'nano-banana-2', name: 'Nano Banana 2', desc: "World's most intelligent model, now even cheaper.", speed: 2, quality: 3, credits: '~50', verified: true },
  { id: 'krea-1', name: 'Krea 1', desc: "Most creative model with LoRA's.", speed: 3, quality: 3, credits: '6' },
  { id: 'nano-banana', name: 'Nano Banana', desc: 'Most versatile intelligent model.', speed: 3, quality: 3, credits: '~30', verified: true },
  { id: 'flux-2-klein', name: 'Flux 2 Klein', desc: 'Fast lightweight Flux 2 model with reference image support', speed: 3, quality: 2, credits: '4' },
  { id: 'seedream-5-lite', name: 'Seedream 5 Lite', desc: 'Medium quality model with reasoning and web search.', speed: 2, quality: 2, credits: '~30' },
  { id: 'recraft-v4', name: 'Recraft V4', desc: 'Sharp, detailed images from Recraft with Standard and Pro modes.', speed: 2, quality: 2, credits: '~30' },
]

export default function ImagePage() {
  const [prompt, setPrompt] = useState('')
  const [hoveredPrompt, setHoveredPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('krea-1')
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
  const [modelDialogOpen, setModelDialogOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedModelData = MODELS.find((m) => m.id === selectedModel) ?? MODELS[2]
  const displayPrompt = hoveredPrompt || prompt

  // Close dropdown on outside click
  useEffect(() => {
    if (!modelDropdownOpen) return
    const onDown = (e: MouseEvent) => {
      if (dropdownRef.current?.contains(e.target as Node)) return
      setModelDropdownOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [modelDropdownOpen])

  return (
    <StudioShell contentPadding="0" initialSidebarExpanded>
      <div
        style={{
          minHeight: '100vh',
          background: '#0a0a0a',
          color: '#f5f5f5',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Model selector — top-left, absolute */}
        <div ref={dropdownRef} style={{ position: 'absolute', left: 14, top: 14, zIndex: 10 }}>
          <button
            type="button"
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            style={{
              height: 36,
              borderRadius: 10,
              border: '1px solid #262626',
              background: '#121212',
              color: '#f5f5f5',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 10px',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
              gap: 8,
            }}
          >
            <span style={{ color: '#737373' }}>Model</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span>{selectedModelData.name}</span>
              <ChevronDown size={14} style={{ color: '#737373' }} />
            </span>
          </button>

          {/* Model dropdown */}
          {modelDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 44,
                width: 420,
                maxHeight: 700,
                overflowY: 'auto',
                background: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                padding: '4px 0',
              }}
            >
              {/* View all models */}
              <button
                type="button"
                onClick={() => {
                  setModelDropdownOpen(false)
                  setModelDialogOpen(true)
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
                className="hover:!bg-white/5"
              >
                Click to view all models
                <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.35)' }} />
              </button>

              {MODELS.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    setSelectedModel(model.id)
                    setModelDropdownOpen(false)
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '12px 16px',
                    background: model.id === selectedModel ? 'rgba(255,255,255,0.04)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    color: '#fff',
                  }}
                  className="hover:!bg-white/5"
                >
                  {/* Radio */}
                  <div style={{ marginTop: 2, flexShrink: 0 }}>
                    {model.id === selectedModel ? (
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          border: '2px solid #3b5bdb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b5bdb' }} />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          border: '1px solid rgba(255,255,255,0.18)',
                        }}
                      />
                    )}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 500 }}>{model.name}</span>
                      {model.verified && (
                        <CheckCircle2 size={14} style={{ color: 'rgba(255,255,255,0.35)' }} />
                      )}
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>
                      {model.desc}
                    </p>
                    {/* Stats */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6 }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[0, 1, 2].map((i) => (
                          <Zap
                            key={i}
                            size={12}
                            style={{ color: i < model.speed ? '#fff' : 'rgba(255,255,255,0.15)' }}
                          />
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[0, 1, 2].map((i) => (
                          <Diamond
                            key={i}
                            size={12}
                            style={{ color: i < model.quality ? '#fff' : 'rgba(255,255,255,0.15)' }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                        {model.credits} %
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Central canvas area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: 200,
          }}
        >
          {/* Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ImageIcon size={40} style={{ color: '#a3a3a3' }} />
            <h1
              style={{
                margin: 0,
                fontSize: 36,
                fontWeight: 500,
                lineHeight: '48px',
                letterSpacing: '-0.02em',
              }}
            >
              Image
            </h1>
          </div>

          {/* Fan of sample images */}
          <div
            style={{
              marginTop: 28,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 300,
              width: '100%',
            }}
          >
            {EXAMPLE_IMAGES.map((img, i) => {
              const rotation = (i - 1.5) * 6
              const translateX = (i - 1.5) * 130
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredPrompt(img.prompt)}
                  onMouseLeave={() => setHoveredPrompt('')}
                  style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    transform: `rotate(${rotation}deg) translateX(${translateX}px)`,
                    zIndex: i === 1 || i === 2 ? 2 : 1,
                  }}
                  className="hover:!scale-105 hover:!z-10"
                >
                  <div
                    style={{
                      width: 200,
                      height: 260,
                      borderRadius: 16,
                      overflow: 'hidden',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      position: 'relative',
                      background: img.gradient,
                    }}
                  >
                    {/* Gradient overlay at bottom */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                      }}
                    />
                    <p
                      style={{
                        position: 'absolute',
                        bottom: 12,
                        left: 12,
                        right: 12,
                        margin: 0,
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {img.title}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom prompt bar — fixed to bottom */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: '0 16px 16px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 768,
              maxWidth: '100%',
              borderRadius: 14,
              border: '1px solid #262626',
              background: '#121212',
              padding: '13px 13px 0',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Textarea */}
            <textarea
              id="prompt"
              value={displayPrompt}
              onChange={(e) => {
                setPrompt(e.target.value)
                setHoveredPrompt('')
              }}
              rows={2}
              placeholder="Describe an image and click generate..."
              style={{
                width: '100%',
                minHeight: 48,
                resize: 'none',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: hoveredPrompt ? 'rgba(245,245,245,0.6)' : '#f5f5f5',
                fontSize: 14,
                lineHeight: '20px',
                padding: '6px 10px',
                fontFamily: 'inherit',
                transition: 'color 0.15s',
              }}
            />

            {/* Bottom toolbar */}
            <div
              id="prompt-bottom-row"
              style={{
                marginTop: 4,
                padding: '0 0 13px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <button type="button" style={{ ...optionBtnBase, width: 87 }}>
                <Sparkles size={14} /> Krea 1
              </button>
              <button type="button" style={{ ...optionBtnBase, width: 77 }}>
                <Layers size={14} /> Lora
              </button>
              <button type="button" style={{ ...optionBtnBase, width: 139 }}>
                <ImageIcon size={14} /> Image prompt
              </button>
              <button type="button" style={{ ...optionBtnBase, width: 133 }}>
                <Palette size={14} /> Style transfer
              </button>
              <button type="button" style={{ ...optionBtnBase, width: 74 }}>
                <Ratio size={14} /> 1:1
              </button>
              <button type="button" style={{ ...optionBtnBase, width: 59 }}>
                <Square size={14} /> 1K
              </button>

              {/* Generate button */}
              <button
                type="button"
                style={{
                  marginLeft: 'auto',
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: 'none',
                  background: '#f5f5f5',
                  color: '#0a0a0a',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                }}
                aria-label="Generate image"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Full model picker dialog */}
        {modelDialogOpen && (
          <div
            onMouseDown={() => setModelDialogOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                width: 1200,
                maxWidth: 'calc(100vw - 80px)',
                maxHeight: 'calc(100vh - 120px)',
                background: '#141414',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#fff' }}>
                  Select Model
                </h2>
                <button
                  type="button"
                  onClick={() => setModelDialogOpen(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: 'none',
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Grid of model cards */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: 20,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: 16,
                  alignContent: 'start',
                }}
              >
                {MODELS.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      setSelectedModel(model.id)
                      setModelDialogOpen(false)
                    }}
                    style={{
                      borderRadius: 16,
                      overflow: 'hidden',
                      border:
                        selectedModel === model.id
                          ? '2px solid #fff'
                          : '2px solid transparent',
                      background: '#1a1a1a',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      color: '#fff',
                      padding: 0,
                      transition: 'border-color 0.15s',
                    }}
                    className="hover:!bg-[#222]"
                  >
                    {/* Image mosaic placeholder */}
                    <div style={{ display: 'flex', height: 150, gap: 1 }}>
                      {[0, 1, 2].map((j) => (
                        <div
                          key={j}
                          style={{
                            flex: 1,
                            background: `linear-gradient(${120 + j * 40}deg, #2a2a2a 0%, #1a1a1a 100%)`,
                          }}
                        />
                      ))}
                    </div>
                    {/* Info */}
                    <div style={{ padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        {selectedModel === model.id ? (
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              border: '2px solid #fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
                          </div>
                        ) : (
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              border: '1px solid rgba(255,255,255,0.25)',
                            }}
                          />
                        )}
                        <span style={{ fontSize: 15, fontWeight: 500 }}>{model.name}</span>
                      </div>
                      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                        {model.desc}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[0, 1, 2].map((i) => (
                            <Zap
                              key={i}
                              size={12}
                              style={{ color: i < model.speed ? '#fff' : 'rgba(255,255,255,0.15)' }}
                            />
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[0, 1, 2].map((i) => (
                            <Diamond
                              key={i}
                              size={12}
                              style={{ color: i < model.quality ? '#fff' : 'rgba(255,255,255,0.15)' }}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                          {model.credits} %
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </StudioShell>
  )
}
