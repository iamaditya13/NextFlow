'use client'

import { Plus, X } from 'lucide-react'

interface PresetTemplate {
  title: string
  subtitle?: string
  image: string
  isPro?: boolean
  isNew?: boolean
}

const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    title: 'Empty Workflow',
    image: '',
  },
  {
    title: 'Image Generator',
    subtitle: 'Simple text to Image Generation with Krea 1',
    image: '/assets/c879c585174b87b2d8ab43884e8f69bb.jpg',
  },
  {
    title: 'Video Generator',
    subtitle: 'Simple Video Generation with Wan 2.1',
    image: '/assets/80afb2b863333a10da2db7491ef56cab.jpg',
  },
  {
    title: '8K Upscaling & Enhancer',
    subtitle: 'Upscaling a low resolution Image to 8K',
    image: '/assets/eye-macro.webp',
  },
  {
    title: 'LLM Image Captioning',
    subtitle: 'Generate a prompt from an Image with GPT-5',
    image: '/assets/d25a8fdbfae20e1bfd0b428f0a16f64e.jpg',
    isPro: true,
  },
  {
    title: 'Prompt to Workflow',
    subtitle: 'Generate a workflow from a prompt.',
    image: '/assets/9098912c68944c798e511f4d06b4a9b0.jpg',
    isPro: true,
    isNew: true,
  },
]

interface PresetsOverlayProps {
  onDismiss: () => void
  onSelectPreset: (template: PresetTemplate) => void
}

export function PresetsOverlay({ onDismiss, onSelectPreset }: PresetsOverlayProps) {
  return (
    /* Dark backdrop */
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 40,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onDismiss}
    >
      {/* Modal card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#161616',
          border: '1px solid #2a2a2a',
          borderRadius: 16,
          padding: '28px 32px 32px',
          width: '100%',
          maxWidth: 940,
          maxHeight: '85vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'transparent',
            border: '1px solid #333',
            borderRadius: 8,
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#888',
          }}
        >
          <X size={14} />
        </button>

        {/* Title */}
        <h2
          style={{
            color: '#fff',
            fontSize: 18,
            fontWeight: 600,
            margin: '0 0 4px',
            fontFamily: 'inherit',
          }}
        >
          Presets
        </h2>
        <p
          style={{
            color: '#737373',
            fontSize: 13,
            margin: '0 0 24px',
            fontFamily: 'inherit',
          }}
        >
          Start with a template to get up and running quickly.
        </p>

        {/* Grid: 4 per row (exclude Empty Workflow from count) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
          }}
        >
          {PRESET_TEMPLATES.filter((t) => t.title !== 'Empty Workflow').map((tmpl) => (
            <button
              key={tmpl.title}
              onClick={() => onSelectPreset(tmpl)}
              style={{
                background: '#1e1e1e',
                border: '1px solid #2a2a2a',
                borderRadius: 12,
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.borderColor = '#EAB308'
                el.style.boxShadow = '0 0 0 1px #EAB308'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.borderColor = '#2a2a2a'
                el.style.boxShadow = 'none'
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  background: '#111',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {tmpl.image ? (
                  <img
                    src={tmpl.image}
                    alt={tmpl.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: 0.7,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Plus size={24} color="#444" />
                  </div>
                )}

                {/* Badges */}
                <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
                  {tmpl.isPro && (
                    <span
                      style={{
                        background: '#3b5bdb',
                        color: '#fff',
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      PRO
                    </span>
                  )}
                  {tmpl.isNew && (
                    <span
                      style={{
                        background: '#16a34a',
                        color: '#fff',
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      NEW
                    </span>
                  )}
                </div>
              </div>

              {/* Text */}
              <div style={{ padding: '10px 12px 12px' }}>
                <div
                  style={{
                    color: '#e5e5e5',
                    fontSize: 13,
                    fontWeight: 600,
                    lineHeight: 1.3,
                    marginBottom: 3,
                    fontFamily: 'inherit',
                  }}
                >
                  {tmpl.title}
                </div>
                {tmpl.subtitle && (
                  <div
                    style={{
                      color: '#737373',
                      fontSize: 11,
                      lineHeight: 1.4,
                      fontFamily: 'inherit',
                    }}
                  >
                    {tmpl.subtitle}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
