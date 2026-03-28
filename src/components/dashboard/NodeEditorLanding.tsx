'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Check, ChevronDown, EyeOff, Plus, Search } from 'lucide-react'

type Workflow = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

type SortBy = 'lastViewed' | 'dateCreated' | 'alphabetical'
type OrderBy = 'newest' | 'oldest'

const tabs = ['Projects', 'Apps', 'Examples', 'Templates'] as const

const SORT_BY_OPTIONS: Array<{ label: string; value: SortBy }> = [
  { label: 'Last viewed', value: 'lastViewed' },
  { label: 'Date created', value: 'dateCreated' },
  { label: 'Alphabetical', value: 'alphabetical' },
]

const ORDER_BY_OPTIONS: Array<{ label: string; value: OrderBy }> = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
]

const WORKFLOW_PREVIEWS = [
  '/assets/node-editor-hero-bg.png',
  '/assets/image-editor.webp',
  '/assets/asset-manager.webp',
]

function formatRelativeTime(input: string) {
  const time = new Date(input).getTime()
  if (Number.isNaN(time)) return 'just now'

  const diffMs = Date.now() - time
  const minutes = Math.max(1, Math.floor(diffMs / 60000))
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`

  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

export default function NodeEditorLanding() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Projects')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('lastViewed')
  const [orderBy, setOrderBy] = useState<OrderBy>('newest')
  const [sortOpen, setSortOpen] = useState(false)
  const sortMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    fetch('/api/workflows')
      .then((res) => res.json())
      .then((json) => {
        setWorkflows(json.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!sortMenuRef.current) return
      if (!sortMenuRef.current.contains(event.target as Node)) {
        setSortOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const visibleWorkflows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    let next = workflows.filter((wf) =>
      wf.name.toLowerCase().includes(query),
    )

    next.sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name)
      }

      const aDate = new Date(
        sortBy === 'dateCreated' ? a.createdAt : a.updatedAt,
      ).getTime()
      const bDate = new Date(
        sortBy === 'dateCreated' ? b.createdAt : b.updatedAt,
      ).getTime()

      return bDate - aDate
    })

    if (sortBy === 'alphabetical' && orderBy === 'oldest') {
      next.reverse()
    } else if (sortBy !== 'alphabetical' && orderBy === 'oldest') {
      next.reverse()
    }

    return next
  }, [workflows, searchQuery, sortBy, orderBy])

  const selectedSortLabel =
    SORT_BY_OPTIONS.find((option) => option.value === sortBy)?.label ??
    'Last viewed'

  const handleNewWorkflow = async () => {
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Untitled Workflow',
          data: { nodes: [], edges: [] },
        }),
      })
      const json = await res.json()
      if (json.data?.id) {
        window.location.href = `/dashboard/node-editor/${json.data.id}`
      }
    } catch {
      // noop
    }
  }

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        overflow: 'auto',
        background: '#ececec',
      }}
    >
      {/* Hero banner with background image */}
      <section
        style={{
          position: 'relative',
          minHeight: 300,
          overflow: 'hidden',
          borderBottom: '1px solid #d8d8d8',
        }}
      >
        {/* Background image */}
        <img
          src="/assets/node-editor-hero-bg.png"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: 0.75,
          }}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(16,16,16,0.56) 0%, rgba(20,20,20,0.22) 42%, rgba(20,20,20,0.44) 100%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '74px 48px',
            maxWidth: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            {/* Node Editor icon */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'linear-gradient(145deg, #4a7dff 0%, #3452ff 100%)',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 8px 18px rgba(53, 95, 255, 0.4)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="6" height="6" rx="1" />
                <rect x="16" y="2" width="6" height="6" rx="1" />
                <rect x="9" y="16" width="6" height="6" rx="1" />
                <path d="M5 8v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
                <line x1="12" y1="13" x2="12" y2="16" />
              </svg>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 32,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: '#ffffff',
                fontWeight: 700,
              }}
            >
              Node Editor
            </h1>
          </div>
          <p
            style={{
              margin: 0,
              color: 'rgba(255,255,255,0.94)',
              fontSize: 15,
              lineHeight: 1.5,
              maxWidth: 540,
            }}
          >
            Nodes is the most powerful way to operate NextFlow. Connect every tool and model into complex automated pipelines.
          </p>
          <button
            onClick={handleNewWorkflow}
            style={{
              marginTop: 22,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 9999,
              background: '#ffffff',
              color: '#0f0f0f',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              padding: '10px 22px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            New Workflow <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Tabs + controls */}
      <div
        style={{
          borderBottom: '1px solid #d0d0d0',
          padding: '18px 48px 14px',
          background: '#ececec',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  borderRadius: 10,
                  border: '1px solid transparent',
                  background: activeTab === tab ? '#dfdfdf' : 'transparent',
                  color: '#111111',
                  fontSize: 14,
                  fontWeight: 550,
                  padding: '9px 14px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative', width: 280 }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#8c8c8c',
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                aria-label="Search projects"
                style={{
                  width: '100%',
                  height: 36,
                  borderRadius: 9,
                  border: '1px solid #cccccc',
                  background: '#ededed',
                  color: '#111111',
                  padding: '0 12px 0 34px',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <div ref={sortMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setSortOpen((prev) => !prev)}
                aria-label="Sort projects"
                style={{
                  height: 36,
                  minWidth: 136,
                  borderRadius: 9,
                  border: '1px solid #cccccc',
                  background: '#ededed',
                  color: '#111111',
                  fontSize: 14,
                  fontWeight: 520,
                  padding: '0 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  cursor: 'pointer',
                }}
              >
                {selectedSortLabel}
                <ChevronDown size={16} color="#9a9a9a" />
              </button>

              {sortOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 170,
                    borderRadius: 10,
                    border: '1px solid #cccccc',
                    background: '#efefef',
                    boxShadow: '0 10px 28px rgba(0,0,0,0.16)',
                    padding: 10,
                    zIndex: 40,
                  }}
                >
                  <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 6 }}>Sort by</div>
                  {SORT_BY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSortBy(option.value)
                        setSortOpen(false)
                      }}
                      style={{
                        width: '100%',
                        height: 32,
                        border: 'none',
                        borderRadius: 6,
                        background: 'transparent',
                        color: '#111111',
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 4px',
                        cursor: 'pointer',
                      }}
                    >
                      <span>{option.label}</span>
                      {sortBy === option.value ? <Check size={15} /> : null}
                    </button>
                  ))}

                  <div style={{ borderTop: '1px solid #d8d8d8', margin: '8px 0' }} />
                  <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 6 }}>Order by</div>
                  {ORDER_BY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setOrderBy(option.value)
                        setSortOpen(false)
                      }}
                      style={{
                        width: '100%',
                        height: 32,
                        border: 'none',
                        borderRadius: 6,
                        background: 'transparent',
                        color: '#111111',
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 4px',
                        cursor: 'pointer',
                      }}
                    >
                      <span>{option.label}</span>
                      {orderBy === option.value ? <Check size={15} /> : null}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              aria-label="Toggle hidden items"
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                border: '1px solid #cccccc',
                background: '#ededed',
                color: '#7a7a7a',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              }}
            >
              <EyeOff size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content area */}
      {!loading && activeTab !== 'Projects' ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '70px 24px',
            minHeight: 300,
          }}
        >
          <h2
            style={{
              margin: 0,
              color: '#242424',
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '-0.02em',
            }}
          >
            {activeTab} coming soon
          </h2>
          <p
            style={{
              margin: '8px 0 0',
              color: '#717171',
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            Switch back to Projects to see and manage your workflows.
          </p>
        </div>
      ) : (
        <div style={{ padding: '26px 48px 56px' }}>
          {loading ? (
            <div style={{ color: '#787878', fontSize: 14 }}>Loading projects...</div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 22,
              }}
            >
              <button
                onClick={handleNewWorkflow}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div
                    style={{
                      height: 160,
                      borderRadius: 10,
                      border: '1px solid #d4d4d4',
                      background: '#dfdfdf',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 999,
                        border: '1px solid #c9c9c9',
                        background: '#ededed',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#444',
                      }}
                    >
                      <Plus size={18} />
                    </span>
                  </div>
                  <div style={{ marginTop: 12, color: '#161616', fontSize: 14, fontWeight: 560 }}>
                    New Workflow
                  </div>
                </div>
              </button>

              {visibleWorkflows.map((wf, index) => (
                <Link
                  key={wf.id}
                  href={`/dashboard/node-editor/${wf.id}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <div
                    style={{
                      height: 160,
                      borderRadius: 10,
                      border: '1px solid #d4d4d4',
                      overflow: 'hidden',
                      background: '#dedede',
                    }}
                  >
                    <img
                      src={WORKFLOW_PREVIEWS[index % WORKFLOW_PREVIEWS.length]}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                      }}
                    />
                  </div>

                  <div style={{ marginTop: 12, color: '#161616', fontSize: 14, fontWeight: 560 }}>
                    {wf.name || 'Untitled'}
                  </div>
                  <div style={{ marginTop: 5, color: '#8a8a8a', fontSize: 13 }}>
                    Edited {formatRelativeTime(wf.updatedAt)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
