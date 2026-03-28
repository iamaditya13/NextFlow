'use client'

import {
  Check,
  ChevronDown,
  Clapperboard,
  ImageUp,
  Monitor,
  MoveRight,
  Palette,
  Send,
  Smartphone,
  Sparkles,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { StudioShell } from '@/components/dashboard/StudioShell'

const optionBtnBase = {
  height: 36,
  borderRadius: 10,
  border: '1px solid var(--nf-border-inner)',
  background: 'var(--nf-bg-node-inner)',
  color: 'var(--nf-text-secondary)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '0 10px',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
} as const

export default function VideoPage() {
  const [prompt, setPrompt] = useState('')
  const [resolution, setResolution] = useState<'720p' | '480p'>('720p')
  const [aspectRatio, setAspectRatio] = useState<'landscape' | 'portrait'>('landscape')
  const [showResDropdown, setShowResDropdown] = useState(false)
  const [showAspectDropdown, setShowAspectDropdown] = useState(false)
  const resBtnRef = useRef<HTMLButtonElement>(null)
  const aspectBtnRef = useRef<HTMLButtonElement>(null)

  return (
    <StudioShell contentPadding="0" initialSidebarExpanded>
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--nf-bg-canvas)',
          color: 'var(--nf-text-primary)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Model selector — top-left */}
        <div style={{ position: 'absolute', left: 14, top: 14, zIndex: 10 }}>
          <button
            type="button"
            style={{
              width: 166,
              height: 36,
              borderRadius: 10,
              border: '1px solid var(--nf-border-inner)',
              background: 'var(--nf-bg-node-inner)',
              color: 'var(--nf-text-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 10px',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <span style={{ color: 'var(--nf-text-label)' }}>Model</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span>Wan 2.1</span>
              <ChevronDown size={14} style={{ color: 'var(--nf-text-label)' }} />
            </span>
          </button>
        </div>

        {/* Central area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: 180,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Clapperboard size={40} style={{ color: 'var(--nf-text-muted)' }} />
            <h1
              style={{
                margin: 0,
                fontSize: 36,
                fontWeight: 500,
                lineHeight: '48px',
                letterSpacing: '-0.02em',
              }}
            >
              Wan 2.1
            </h1>
          </div>
        </div>

        {/* Bottom prompt bar */}
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
              width: 620,
              maxWidth: '100%',
              minHeight: 110,
              borderRadius: 14,
              border: '1px solid var(--nf-border-inner)',
              background: 'var(--nf-bg-node-inner)',
              padding: '13px 13px 0',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {/* Textarea */}
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={1}
              placeholder="Describe a video and click generate..."
              style={{
                width: '100%',
                minHeight: 36,
                resize: 'none',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: 'var(--nf-text-primary)',
                fontSize: 14,
                lineHeight: '20px',
                padding: '6px 10px',
                fontFamily: 'inherit',
              }}
            />

            {/* Bottom toolbar */}
            <div
              style={{
                marginTop: 4,
                padding: '0 0 13px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                position: 'relative',
              }}
            >
              <button type="button" style={{ ...optionBtnBase, width: 94 }}>
                <Sparkles size={14} /> Wan 2.1
              </button>
              <button type="button" style={{ ...optionBtnBase, width: 117 }}>
                <ImageUp size={14} /> Start frame
              </button>
              <button type="button" style={{ ...optionBtnBase, width: 112 }}>
                <MoveRight size={14} /> End frame
              </button>
              <button type="button" style={{ ...optionBtnBase, width: 87 }}>
                <Palette size={14} /> Style
              </button>

              {/* Resolution picker */}
              <div style={{ position: 'relative' }}>
                <button
                  ref={resBtnRef}
                  type="button"
                  onClick={() => { setShowResDropdown(!showResDropdown); setShowAspectDropdown(false) }}
                  style={{ ...optionBtnBase, width: 62 }}
                >
                  {resolution}
                </button>

                {showResDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 8px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 128,
                      borderRadius: 10,
                      border: '1px solid var(--nf-border-inner)',
                      background: 'var(--nf-bg-node-inner)',
                      padding: 4,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      zIndex: 50,
                    }}
                  >
                    <div style={{ textAlign: 'center', padding: '8px 0 6px', fontSize: 12, color: 'var(--nf-text-label)', fontWeight: 500 }}>
                      Resolution
                    </div>
                    {(['720p', '480p'] as const).map((res) => (
                      <button
                        key={res}
                        type="button"
                        onClick={() => { setResolution(res); setShowResDropdown(false) }}
                        style={{
                          width: '100%',
                          height: 42,
                          borderRadius: 8,
                          border: 'none',
                          background:
                            resolution === res
                              ? 'color-mix(in srgb, var(--nf-accent-blue) 20%, var(--nf-bg-node-inner))'
                              : 'transparent',
                          color: resolution === res ? 'var(--nf-text-primary)' : 'var(--nf-text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0 10px',
                          fontSize: 13,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {res}
                        {resolution === res && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Aspect ratio picker */}
              <div style={{ position: 'relative' }}>
                <button
                  ref={aspectBtnRef}
                  type="button"
                  onClick={() => { setShowAspectDropdown(!showAspectDropdown); setShowResDropdown(false) }}
                  style={{ ...optionBtnBase, width: 40, padding: 0, justifyContent: 'center' }}
                >
                  {aspectRatio === 'landscape' ? <Monitor size={14} /> : <Smartphone size={14} />}
                </button>

                {showAspectDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 8px)',
                      right: 0,
                      width: 212,
                      borderRadius: 10,
                      border: '1px solid var(--nf-border-inner)',
                      background: 'var(--nf-bg-node-inner)',
                      padding: 8,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      zIndex: 50,
                    }}
                  >
                    <div style={{ textAlign: 'center', padding: '4px 0 8px', fontSize: 12, color: 'var(--nf-text-label)', fontWeight: 500 }}>
                      Aspect Ratio
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                      {(['landscape', 'portrait'] as const).map((ar) => (
                        <button
                          key={ar}
                          type="button"
                          onClick={() => { setAspectRatio(ar); setShowAspectDropdown(false) }}
                          style={{
                            height: 100,
                            borderRadius: 10,
                            border:
                              aspectRatio === ar
                                ? '1px solid color-mix(in srgb, var(--nf-accent-blue) 45%, transparent)'
                                : '1px solid var(--nf-border-inner)',
                            background:
                              aspectRatio === ar
                                ? 'color-mix(in srgb, var(--nf-accent-blue) 16%, var(--nf-bg-node-inner))'
                                : 'var(--nf-bg-node-inner)',
                            color: aspectRatio === ar ? 'var(--nf-text-primary)' : 'var(--nf-text-muted)',
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            fontFamily: 'inherit',
                          }}
                        >
                          {ar === 'landscape' ? <Monitor size={20} /> : <Smartphone size={20} />}
                          {ar.charAt(0).toUpperCase() + ar.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Generate button */}
              <button
                type="button"
                style={{
                  marginLeft: 'auto',
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: 'none',
                  background: 'var(--nf-text-primary)',
                  color: 'var(--nf-bg-canvas)',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                }}
                aria-label="Generate video"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Click-away handler for dropdowns */}
        {(showResDropdown || showAspectDropdown) && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            onClick={() => { setShowResDropdown(false); setShowAspectDropdown(false) }}
          />
        )}
      </div>
    </StudioShell>
  )
}
