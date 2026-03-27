'use client'

import { Plus } from 'lucide-react'
import { StudioShell } from './StudioShell'

type PreviewCard = {
  title: string
  image: string
}

interface ToolStudioPageProps {
  modelLabel: string
  title: string
  titleIcon: string
  placeholder: string
  chips: string[]
  previewCards?: PreviewCard[]
}

export function ToolStudioPage({
  modelLabel,
  title,
  titleIcon,
  placeholder,
  chips,
  previewCards,
}: ToolStudioPageProps) {
  return (
    <StudioShell contentPadding="20px 24px">
      <div style={{ fontSize: 34, color: '#c0c6d1', fontWeight: 500, marginBottom: 18 }}>
        Model <span style={{ color: '#ffffff' }}>{modelLabel}</span> <span style={{ fontSize: 24 }}>⌄</span>
      </div>

      <div
        style={{
          minHeight: 'calc(100vh - 180px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        {previewCards && previewCards.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0, marginBottom: 8 }}>
            {previewCards.map((card, idx) => (
              <div
                key={card.title}
                style={{
                  width: 220,
                  height: 290,
                  marginLeft: idx === 0 ? 0 : -28,
                  borderRadius: 18,
                  overflow: 'hidden',
                  border: '1px solid #222632',
                  background: '#0f1218',
                  position: 'relative',
                  boxShadow: idx === 1 ? '0 20px 40px rgba(0,0,0,0.35)' : undefined,
                  zIndex: idx === 1 ? 4 : 2,
                }}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.82) 16%, rgba(0,0,0,0.25) 58%, rgba(0,0,0,0.03) 100%)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: 10,
                    right: 10,
                    bottom: 12,
                    color: '#f6f8fc',
                    fontSize: 14,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: 600,
                  }}
                >
                  {card.title}
                </div>
              </div>
            ))}
          </div>
        )}

        <h1
          style={{
            margin: 0,
            fontSize: 62,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            color: '#f4f5f8',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <span style={{ fontSize: 52 }}>{titleIcon}</span> {title}
        </h1>

        <div
          style={{
            width: 'min(760px, 92%)',
            borderRadius: 34,
            border: '1px solid #2b2f39',
            background: 'linear-gradient(180deg, #1f2127 0%, #1a1c22 100%)',
            padding: '16px 16px 10px',
            boxShadow: '0 16px 36px rgba(0,0,0,0.4)',
          }}
        >
          <div
            style={{
              minHeight: 72,
              color: '#9ba2ae',
              fontSize: 33,
              lineHeight: 1.22,
              padding: '4px 8px',
            }}
          >
            {placeholder}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {chips.map((chip) => (
              <span
                key={chip}
                style={{
                  borderRadius: 9999,
                  border: '1px solid #3a3f4a',
                  background: '#2a2e37',
                  color: '#f1f4fa',
                  fontSize: 25,
                  padding: '8px 14px',
                  lineHeight: 1,
                  fontWeight: 500,
                }}
              >
                {chip}
              </span>
            ))}

            <button
              style={{
                marginLeft: 'auto',
                width: 54,
                height: 54,
                borderRadius: 9999,
                border: '1px solid #515660',
                background: '#d9dde5',
                color: '#111319',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              }}
              aria-label="Create"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>
    </StudioShell>
  )
}
