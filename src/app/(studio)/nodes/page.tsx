'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, ChevronDown, ChevronRight, Diamond, ExternalLink, EyeOff, Network, Plus, MoreHorizontal, Pencil, Copy, Trash2, Search } from 'lucide-react'
import { StudioShell } from '@/components/dashboard/StudioShell'
import { WORKFLOW_TEMPLATES, getTemplateHref } from '@/components/dashboard/workflowTemplates'
import { PRESET_WORKFLOWS } from '@/components/dashboard/presetDefinitions'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'

const tabs = ['projects', 'apps', 'examples', 'templates'] as const

type SortBy = 'lastViewed' | 'dateCreated' | 'alphabetical'
type OrderBy = 'newest' | 'oldest'

const SORT_BY_OPTIONS: Array<{ label: string; value: SortBy }> = [
  { label: 'Last viewed', value: 'lastViewed' },
  { label: 'Date created', value: 'dateCreated' },
  { label: 'Alphabetical', value: 'alphabetical' },
]

const ORDER_BY_OPTIONS: Array<{ label: string; value: OrderBy }> = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
]

const PROJECT_PREVIEW_IMAGES = [
  '/assets/node-editor-hero-bg.png',
  '/assets/image-editor.webp',
  '/assets/asset-manager.webp',
]

type WorkflowSummary = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

function ProjectCard({ workflow, previewImage, onRename, onDuplicate, onDelete }: {
  workflow: WorkflowSummary
  previewImage?: string
  onRename: (id: string, name: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [nameValue, setNameValue] = useState(workflow.name)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const displayName = workflow.name || 'Untitled'

  return (
    <div className="group relative flex flex-col" style={{ gap: 12, maxWidth: 239 }}>
      {/* Thumbnail */}
      <button
        type="button"
        onClick={() => router.push(`/dashboard/node-editor/${workflow.id}`)}
        className="relative overflow-hidden w-full"
        style={{
          aspectRatio: '239 / 159',
          borderRadius: 8,
          background: 'var(--nf-bg-node)',
          boxShadow:
            'inset 0 0 0 0.5px color-mix(in srgb, var(--nf-text-primary) 14%, transparent)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {previewImage ? (
          <img
            src={previewImage}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Network size={24} style={{ color: 'var(--nf-text-placeholder)' }} />
          </div>
        )}
      </button>

      {/* Label row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col" style={{ gap: 2, minWidth: 0 }}>
          {renaming ? (
            <input
              autoFocus
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={() => { setRenaming(false); onRename(workflow.id, nameValue) }}
              onKeyDown={(e) => { if (e.key === 'Enter') { setRenaming(false); onRename(workflow.id, nameValue) } if (e.key === 'Escape') { setRenaming(false); setNameValue(displayName) } }}
              style={{
                background: 'var(--nf-bg-node)',
                border: '1px solid var(--nf-border-inner)',
                borderRadius: 6,
                color: 'var(--nf-text-primary)',
                fontSize: 14,
                padding: '2px 6px',
                outline: 'none',
                width: '100%',
              }}
            />
          ) : (
            <p style={{ margin: 0, color: 'var(--nf-text-primary)', fontSize: 15.1, fontWeight: 500, lineHeight: '24px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </p>
          )}
          <p style={{ margin: 0, color: 'var(--nf-text-label)', fontSize: 11.6, fontWeight: 500 }}>
            Edited {formatRelative(workflow.updatedAt)}
          </p>
        </div>

        {/* 3-dot menu */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o) }}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: 'var(--nf-bg-node)',
              border: '1px solid var(--nf-border-inner)',
              cursor: 'pointer',
              color: 'var(--nf-text-primary)',
            }}
          >
            <MoreHorizontal size={14} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1 z-50 py-1"
              style={{
                width: 180,
                background: 'var(--nf-bg-node)',
                border: '1px solid var(--nf-border-inner)',
                borderRadius: 10,
                boxShadow:
                  '0 8px 24px color-mix(in srgb, var(--nf-bg-canvas) 54%, transparent)',
              }}
            >
              {[
                { icon: Network, label: 'Open', action: () => { setMenuOpen(false); router.push(`/dashboard/node-editor/${workflow.id}`) } },
                { icon: Pencil, label: 'Rename', action: () => { setMenuOpen(false); setRenaming(true) } },
                { icon: Copy, label: 'Duplicate', action: () => { setMenuOpen(false); onDuplicate(workflow.id) } },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-4 py-2 text-[13px]"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--nf-text-primary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--nf-hover-bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <item.icon size={14} style={{ color: 'var(--nf-text-label)' }} />
                  {item.label}
                </button>
              ))}
              <div style={{ height: 1, background: 'var(--nf-border-inner)', margin: '4px 0' }} />
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onDelete(workflow.id) }}
                className="w-full flex items-center gap-3 px-4 py-2 text-[13px]"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--destructive)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'color-mix(in srgb, var(--destructive) 16%, transparent)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatRelative(value: string) {
  const delta = Date.now() - new Date(value).getTime()
  const minutes = Math.floor(delta / 60000)
  const hours = Math.floor(delta / 3600000)
  const days = Math.floor(delta / 86400000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const EXAMPLE_CARDS = [
  { title: 'Pet shoot', subtitle: 'AI pet photography', author: 'krea' },
  { title: 'Fantasy Soda Commercial', subtitle: 'Product video generation', author: 'krea' },
  { title: 'Chrome Player', subtitle: 'Metallic object rendering', author: 'krea' },
  { title: 'Banana Bench', subtitle: 'Furniture design concept', author: 'krea' },
  { title: 'Mythical Creature', subtitle: 'Character generation', author: 'krea' },
  { title: 'Selfie to Fine Art', subtitle: 'Style transfer pipeline', author: 'krea' },
  { title: 'Sneaker Campaign', subtitle: 'Product photography', author: 'sanchit' },
  { title: 'Have a nice day!', subtitle: 'Greeting card generator', author: 'krea' },
  { title: 'Sports Brand', subtitle: 'Athletic wear mockups', author: 'krea' },
  { title: 'Infinite Loop', subtitle: 'Seamless video loops', author: 'krea' },
  { title: 'Character Style Builder', subtitle: 'Consistent character design', author: 'krea' },
  { title: 'Nokia', subtitle: 'Retro product reimagining', author: 'sanchit' },
  { title: 'Car Product Video', subtitle: 'Automotive visualization', author: 'krea' },
  { title: 'Phone to Product Video', subtitle: 'Phone photo to video', author: 'krea' },
  { title: 'Virtual Model & Outfit', subtitle: 'Fashion try-on', author: 'krea' },
  { title: 'Cinematic Car Shots', subtitle: 'Automotive cinematography', author: 'sanchit' },
]

const APP_CARDS = [
  { title: 'CCTV Selfies', subtitle: 'Turn selfies into CCTV footage' },
  { title: 'Animorph', subtitle: 'Transform into animals' },
  { title: 'Pixel Perfect', subtitle: 'Pixel art generation' },
  { title: 'Dream Scenes', subtitle: 'Fantasy landscape generator' },
  { title: 'Style Fusion', subtitle: 'Blend art styles together' },
  { title: 'Portrait Pro', subtitle: 'Professional portrait editing' },
]

function NodesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab = (
    (tabs as readonly string[]).includes(tabParam ?? '')
      ? tabParam
      : 'projects'
  ) as (typeof tabs)[number]
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('lastViewed')
  const [orderBy, setOrderBy] = useState<OrderBy>('newest')
  const [sortMenuOpen, setSortMenuOpen] = useState(false)
  const sortMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeTab !== 'projects') return
    fetch('/api/workflows?limit=50', { cache: 'no-store' })
      .then((r) => r.json())
      .then(async (json) => {
        if (!json?.success || !Array.isArray(json.data)) return
        if (json.data.length > 0) {
          setWorkflows(json.data)
          return
        }
        // Seed the sample workflow for first-time users
        const preset = PRESET_WORKFLOWS['Product Marketing Kit Generator']
        if (!preset) return
        const res = await fetch('/api/workflows/import', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            workflowJson: JSON.stringify({
              name: 'Product Marketing Kit Generator',
              nodes: preset.nodes,
              edges: preset.edges,
            }),
          }),
        })
        const created = await res.json()
        if (created?.data) setWorkflows([created.data])
      })
      .catch(() => {})
  }, [activeTab])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!sortMenuRef.current) return
      if (!sortMenuRef.current.contains(event.target as Node)) {
        setSortMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const visibleWorkflows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const next = workflows.filter((workflow) =>
      workflow.name.toLowerCase().includes(query),
    )

    next.sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name)
      }

      const aTime = new Date(
        sortBy === 'dateCreated' ? a.createdAt : a.updatedAt,
      ).getTime()
      const bTime = new Date(
        sortBy === 'dateCreated' ? b.createdAt : b.updatedAt,
      ).getTime()
      return bTime - aTime
    })

    if (orderBy === 'oldest') next.reverse()
    return next
  }, [workflows, searchQuery, sortBy, orderBy])

  const selectedSortLabel =
    SORT_BY_OPTIONS.find((option) => option.value === sortBy)?.label ??
    'Last viewed'

  const handleRename = async (id: string, name: string) => {
    setWorkflows((prev) => prev.map((w) => (w.id === id ? { ...w, name } : w)))
    await fetch(`/api/workflows/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) }).catch(() => {})
  }

  const handleDuplicate = async (id: string) => {
    const original = workflows.find((w) => w.id === id)
    await fetch('/api/workflows', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: `${original?.name ?? 'Untitled'} (copy)` }) })
      .then((r) => r.json())
      .then((json) => { if (json?.data) setWorkflows((prev) => [json.data, ...prev]) })
      .catch(() => {})
  }

  const handleDelete = async (id: string) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== id))
    await fetch(`/api/workflows/${id}`, { method: 'DELETE' }).catch(() => {})
  }

  return (
    <StudioShell contentPadding="0" initialSidebarExpanded>
      <div style={{ minHeight: '100vh', background: 'var(--nf-bg-canvas)', color: 'var(--nf-text-primary)' }}>
        {/* Hero Banner — Figma 7:795 */}
        <section
          className="relative w-full flex items-end"
          style={{
            minHeight: 400,
            padding: '88px 88px',
            overflow: 'hidden',
            background: 'var(--nf-bg-canvas)',
          }}
        >
          <img
            src="/assets/node-editor-hero-bg.png"
            alt=""
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: 0.78,
            }}
          />

          {/* Blur gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, var(--nf-hero-overlay-start) 0%, var(--nf-hero-overlay-mid) 42%, var(--nf-hero-overlay-end) 100%)',
            }}
          />

          <div
            className="relative flex flex-col justify-between"
            style={{ minHeight: 224, gap: 16 }}
          >
            {/* Top group */}
            <div>
              {/* Icon + Title row */}
              <div className="flex items-center" style={{ gap: 12 }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'color-mix(in srgb, var(--color-text-white) 12%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--color-text-white) 30%, transparent)',
                  }}
                >
                  <Network size={18} style={{ color: 'var(--color-text-white)' }} />
                </div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 29.4,
                    lineHeight: '36px',
                    fontWeight: 500,
                    color: 'var(--nf-hero-text-on-image)',
                    textShadow: '0 1px 10px var(--nf-hero-text-shadow)',
                  }}
                >
                  Node Editor
                </h1>
              </div>

              {/* Subtitle */}
              <p
                style={{
                  margin: '12px 0 0',
                  fontSize: 15.3,
                  lineHeight: '24px',
                  fontWeight: 500,
                  color: 'var(--nf-hero-text-on-image)',
                  textShadow: '0 1px 10px var(--nf-hero-text-shadow)',
                  maxWidth: 448,
                }}
              >
                Nodes is the most powerful way to operate Krea. Connect every
                tool and model into complex automated pipelines.
              </p>
            </div>

            {/* New Workflow button */}
            <button
              type="button"
              onClick={() => router.push('/nodes/new')}
              className="flex items-center"
              style={{
                height: 40,
                borderRadius: 9999,
                background: 'var(--nf-hero-cta-bg)',
                color: 'var(--nf-hero-cta-text)',
                border: '1px solid var(--nf-hero-cta-border)',
                padding: '0 32px',
                fontSize: 13.2,
                fontWeight: 500,
                cursor: 'pointer',
                gap: 8,
                fontFamily: 'inherit',
                width: 'fit-content',
              }}
            >
              New Workflow
              <ChevronRight size={14} />
            </button>
          </div>
        </section>

        {/* Tab bar — Figma 7:830 */}
        <section
          style={{
            borderBottom: '1px solid color-mix(in srgb, var(--nf-text-primary) 10%, transparent)',
            padding: '0 88px',
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ gap: 12, paddingBottom: 13, paddingTop: 14, flexWrap: 'wrap' }}
          >
            <div className="flex items-center" style={{ gap: 4 }}>
              {tabs.map((tab) => {
                const isActive = tab === activeTab
                return (
                  <Link
                    key={tab}
                    href={`/nodes?tab=${tab}`}
                    className="capitalize"
                    style={{
                      width: 100,
                      height: 40,
                      borderRadius: 8,
                      background: isActive ? 'var(--nf-border-inner)' : 'transparent',
                      color: isActive ? 'var(--nf-text-primary)' : 'var(--nf-text-label)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13.7,
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      textDecoration: 'none',
                    }}
                  >
                    {tab}
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center" style={{ gap: 8 }}>
              <div style={{ position: 'relative', width: 280 }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--nf-text-label)',
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
                    borderRadius: 8,
                    border: '1px solid var(--nf-border-inner)',
                    background: 'var(--nf-bg-node)',
                    color: 'var(--nf-text-primary)',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    padding: '0 12px 0 36px',
                    outline: 'none',
                  }}
                />
              </div>

              <div ref={sortMenuRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setSortMenuOpen((open) => !open)}
                  aria-label="Sort projects"
                  style={{
                    height: 36,
                    minWidth: 136,
                    borderRadius: 8,
                    border: '1px solid var(--nf-border-inner)',
                    background: 'var(--nf-bg-node)',
                    color: 'var(--nf-text-primary)',
                    fontSize: 14,
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    padding: '0 12px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {selectedSortLabel}
                  <ChevronDown size={16} style={{ color: 'var(--nf-text-label)' }} />
                </button>

                {sortMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: 176,
                    borderRadius: 10,
                    background: 'var(--nf-bg-node)',
                    border: '1px solid var(--nf-border-inner)',
                    boxShadow:
                      '0 10px 24px color-mix(in srgb, var(--nf-bg-canvas) 42%, transparent)',
                    padding: 8,
                    zIndex: 50,
                  }}
                  >
                    <div style={{ padding: '4px 6px', fontSize: 12, color: 'var(--nf-text-label)' }}>
                      Sort by
                    </div>
                    {SORT_BY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSortBy(option.value)
                          setSortMenuOpen(false)
                        }}
                        style={{
                          width: '100%',
                          height: 32,
                          borderRadius: 6,
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--nf-text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: 14,
                          padding: '0 6px',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        <span>{option.label}</span>
                        {sortBy === option.value ? <Check size={14} /> : null}
                      </button>
                    ))}

                    <div style={{ height: 1, background: 'var(--nf-border-inner)', margin: '8px 0' }} />
                    <div style={{ padding: '4px 6px', fontSize: 12, color: 'var(--nf-text-label)' }}>
                      Order by
                    </div>
                    {ORDER_BY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setOrderBy(option.value)
                          setSortMenuOpen(false)
                        }}
                        style={{
                          width: '100%',
                          height: 32,
                          borderRadius: 6,
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--nf-text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: 14,
                          padding: '0 6px',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        <span>{option.label}</span>
                        {orderBy === option.value ? <Check size={14} /> : null}
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
                  borderRadius: 8,
                  border: '1px solid var(--nf-border-inner)',
                  background: 'var(--nf-bg-node)',
                  color: 'var(--nf-text-label)',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <EyeOff size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <section style={{ padding: '32px 88px 56px' }}>
          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(239px, 1fr))',
                gap: '32px 24px',
              }}
            >
              {WORKFLOW_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className="group flex flex-col items-start"
                  onClick={() => router.push(getTemplateHref(template))}
                  style={{
                    gap: 12,
                    opacity: template.opacity ?? 1,
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'inherit',
                    fontFamily: 'inherit',
                    maxWidth: 239,
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    className="relative overflow-hidden"
                    style={{
                      width: '100%',
                      aspectRatio: '239 / 159',
                      borderRadius: 8,
                      background: 'var(--nf-bg-node)',
                      boxShadow: 'inset 0 0 0 0.5px color-mix(in srgb, var(--nf-text-primary) 10%, transparent)',
                    }}
                  >
                    {template.id === 'empty-workflow' ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="flex items-center justify-center"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 9999,
                            background: 'var(--nf-text-primary)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2), inset 0 0 0 0.5px color-mix(in srgb, var(--nf-text-primary) 10%, transparent)',
                          }}
                        >
                          <Plus size={16} style={{ color: 'var(--nf-bg-canvas)' }} />
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Network size={24} style={{ color: 'var(--nf-text-placeholder)' }} />
                      </div>
                    )}

                    {/* PRO badge */}
                    {template.isPro && (
                      <div
                        className="absolute flex items-center"
                        style={{
                          top: 8,
                          right: 8,
                          background: 'color-mix(in srgb, var(--nf-accent-blue) 90%, transparent)',
                          borderRadius: 4,
                          padding: '2px 6px',
                          gap: 4,
                        }}
                      >
                        <Diamond size={10} style={{ color: 'var(--nf-text-primary)' }} />
                        <span
                          style={{
                            color: 'var(--nf-text-primary)',
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          PRO
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card label */}
                  <div className="flex flex-col" style={{ gap: 2 }}>
                    <p
                      style={{
                        margin: 0,
                        color: 'var(--nf-text-primary)',
                        fontSize: 15.1,
                        fontWeight: 500,
                        lineHeight: '24px',
                      }}
                    >
                      {template.title}
                    </p>
                    {template.subtitle && (
                      <p
                        style={{
                          margin: 0,
                          color: 'var(--nf-text-label)',
                          fontSize: 11.6,
                          fontWeight: 500,
                          lineHeight: '16px',
                        }}
                      >
                        {template.subtitle}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            workflows.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center"
                style={{ minHeight: 320, gap: 16 }}
              >
                <Network size={40} style={{ color: 'var(--nf-text-placeholder)' }} />
                <p style={{ margin: 0, fontSize: 15.1, fontWeight: 500, color: 'var(--nf-text-label)' }}>
                  No projects yet
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/nodes/new')}
                  className="flex items-center"
                  style={{
                    height: 40,
                    borderRadius: 9999,
                    background: 'var(--nf-text-primary)',
                    color: 'var(--nf-bg-canvas)',
                    border: 'none',
                    padding: '0 32px',
                    fontSize: 13.2,
                    fontWeight: 500,
                    cursor: 'pointer',
                    gap: 8,
                    fontFamily: 'inherit',
                  }}
                >
                  Create Project
                  <Plus size={14} />
                </button>
              </div>
            ) : visibleWorkflows.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center"
                style={{ minHeight: 280, gap: 10 }}
              >
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--nf-text-label)' }}>
                  No projects match "{searchQuery}"
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(239px, 1fr))',
                  gap: '32px 24px',
                }}
              >
                {visibleWorkflows.map((workflow, index) => (
                  <ProjectCard
                    key={workflow.id}
                    workflow={workflow}
                    previewImage={PROJECT_PREVIEW_IMAGES[index % PROJECT_PREVIEW_IMAGES.length]}
                    onRename={handleRename}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )
          )}

          {/* Apps Tab */}
          {activeTab === 'apps' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(239px, 1fr))',
                gap: '32px 24px',
              }}
            >
              {APP_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="flex flex-col items-start"
                  style={{ gap: 12, maxWidth: 239 }}
                >
                  <div
                    className="relative overflow-hidden"
                    style={{
                      width: '100%',
                      aspectRatio: '239 / 159',
                      borderRadius: 8,
                      background: 'var(--nf-bg-node)',
                      boxShadow: 'inset 0 0 0 0.5px color-mix(in srgb, var(--nf-text-primary) 10%, transparent)',
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Network size={24} style={{ color: 'var(--nf-text-placeholder)' }} />
                    </div>
                  </div>
                  <div className="flex flex-col" style={{ gap: 2 }}>
                    <p
                      style={{
                        margin: 0,
                        color: 'var(--nf-text-primary)',
                        fontSize: 15.1,
                        fontWeight: 500,
                        lineHeight: '24px',
                      }}
                    >
                      {card.title}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        color: 'var(--nf-text-label)',
                        fontSize: 11.6,
                        fontWeight: 500,
                        lineHeight: '16px',
                      }}
                    >
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Examples Tab */}
          {activeTab === 'examples' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(239px, 1fr))',
                gap: '32px 24px',
              }}
            >
              {EXAMPLE_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="flex flex-col items-start"
                  style={{ gap: 12, maxWidth: 239 }}
                >
                  <div
                    className="relative overflow-hidden"
                    style={{
                      width: '100%',
                      aspectRatio: '239 / 159',
                      borderRadius: 8,
                      background: 'var(--nf-bg-node)',
                      boxShadow: 'inset 0 0 0 0.5px color-mix(in srgb, var(--nf-text-primary) 10%, transparent)',
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Network size={24} style={{ color: 'var(--nf-text-placeholder)' }} />
                    </div>
                  </div>
                  <div className="flex flex-col" style={{ gap: 2 }}>
                    <p
                      style={{
                        margin: 0,
                        color: 'var(--nf-text-primary)',
                        fontSize: 15.1,
                        fontWeight: 500,
                        lineHeight: '24px',
                      }}
                    >
                      {card.title}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        color: 'var(--nf-text-label)',
                        fontSize: 11.6,
                        fontWeight: 500,
                        lineHeight: '16px',
                      }}
                    >
                      {card.subtitle}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span style={{ fontSize: 11, color: 'color-mix(in srgb, var(--nf-text-primary) 35%, transparent)' }}>{card.author}</span>
                      <ExternalLink size={10} style={{ color: 'color-mix(in srgb, var(--nf-text-primary) 35%, transparent)' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </StudioShell>
  )
}

export default function NodesPage() {
  return (
    <Suspense
      fallback={
        <StudioShell contentPadding="0" initialSidebarExpanded>
          <div
            style={{
              minHeight: '100vh',
              background: 'var(--nf-bg-canvas)',
            }}
          />
        </StudioShell>
      }
    >
      <NodesPageContent />
    </Suspense>
  )
}
