'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronRight, Diamond, ExternalLink, Network, Plus, MoreHorizontal, Pencil, Copy, Trash2 } from 'lucide-react'
import { StudioShell } from '@/components/dashboard/StudioShell'
import { WORKFLOW_TEMPLATES, getTemplateHref } from '@/components/dashboard/workflowTemplates'
import { useEffect, useRef, useState } from 'react'

const tabs = ['projects', 'apps', 'examples', 'templates'] as const

type WorkflowSummary = {
  id: string
  name: string
  updatedAt: string
}

function ProjectCard({ workflow, onRename, onDuplicate, onDelete }: {
  workflow: WorkflowSummary
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
        onClick={() => router.push(`/nodes/${workflow.id}`)}
        className="relative overflow-hidden w-full"
        style={{
          aspectRatio: '239 / 159',
          borderRadius: 8,
          background: '#202020',
          boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.1)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Network size={24} style={{ color: '#525252' }} />
        </div>
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
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 6,
                color: '#ffffff',
                fontSize: 14,
                padding: '2px 6px',
                outline: 'none',
                width: '100%',
              }}
            />
          ) : (
            <p style={{ margin: 0, color: '#ffffff', fontSize: 15.1, fontWeight: 500, lineHeight: '24px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </p>
          )}
          <p style={{ margin: 0, color: '#737373', fontSize: 11.6, fontWeight: 500 }}>
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
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              color: '#ffffff',
            }}
          >
            <MoreHorizontal size={14} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1 z-50 py-1"
              style={{
                width: 180,
                background: '#1c1c1c',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              {[
                { icon: Network, label: 'Open', action: () => { setMenuOpen(false); router.push(`/nodes/${workflow.id}`) } },
                { icon: Pencil, label: 'Rename', action: () => { setMenuOpen(false); setRenaming(true) } },
                { icon: Copy, label: 'Duplicate', action: () => { setMenuOpen(false); onDuplicate(workflow.id) } },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-white"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <item.icon size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
                  {item.label}
                </button>
              ))}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onDelete(workflow.id) }}
                className="w-full flex items-center gap-3 px-4 py-2 text-[13px]"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
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

export default function NodesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = (searchParams.get('tab') ?? 'templates') as (typeof tabs)[number]
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([])

  useEffect(() => {
    if (activeTab !== 'projects') return
    fetch('/api/workflows?limit=50', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (json?.success && Array.isArray(json.data)) setWorkflows(json.data)
      })
      .catch(() => {})
  }, [activeTab])

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
      <div style={{ minHeight: '100vh', background: '#101010', color: '#fafafa' }}>
        {/* Hero Banner — Figma 7:795 */}
        <section
          className="relative w-full flex items-end"
          style={{
            minHeight: 400,
            padding: '88px 88px',
            background: '#101010',
          }}
        >
          {/* Blur gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(1200px 520px at 18% -8%, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 38%, transparent 100%)',
              filter: 'blur(20px)',
              opacity: 0.15,
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
                    background: '#202020',
                    border: '1px solid #262626',
                  }}
                >
                  <Network size={18} style={{ color: '#fafafa' }} />
                </div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 29.4,
                    lineHeight: '36px',
                    fontWeight: 500,
                    color: '#ffffff',
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
                  color: '#ffffff',
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
                background: '#ffffff',
                color: '#000000',
                border: 'none',
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
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            padding: '0 88px',
          }}
        >
          <div
            className="flex items-center"
            style={{ gap: 4, paddingBottom: 13 }}
          >
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
                    background: isActive ? '#262626' : 'transparent',
                    color: isActive ? '#fafafa' : '#ffffff',
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
                      background: '#202020',
                      boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.1)',
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
                            background: '#ffffff',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2), inset 0 0 0 0.5px rgba(255,255,255,0.1)',
                          }}
                        >
                          <Plus size={16} style={{ color: '#000000' }} />
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Network size={24} style={{ color: '#525252' }} />
                      </div>
                    )}

                    {/* PRO badge */}
                    {template.isPro && (
                      <div
                        className="absolute flex items-center"
                        style={{
                          top: 8,
                          right: 8,
                          background: 'rgba(0,110,255,0.9)',
                          borderRadius: 4,
                          padding: '2px 6px',
                          gap: 4,
                        }}
                      >
                        <Diamond size={10} style={{ color: '#ffffff' }} />
                        <span
                          style={{
                            color: '#ffffff',
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
                        color: '#ffffff',
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
                          color: '#737373',
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
                <Network size={40} style={{ color: '#525252' }} />
                <p style={{ margin: 0, fontSize: 15.1, fontWeight: 500, color: '#737373' }}>
                  No projects yet
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/nodes/new')}
                  className="flex items-center"
                  style={{
                    height: 40,
                    borderRadius: 9999,
                    background: '#ffffff',
                    color: '#000000',
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
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(239px, 1fr))',
                  gap: '32px 24px',
                }}
              >
                {workflows.map((workflow) => (
                  <ProjectCard
                    key={workflow.id}
                    workflow={workflow}
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
                      background: '#202020',
                      boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.1)',
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Network size={24} style={{ color: '#525252' }} />
                    </div>
                  </div>
                  <div className="flex flex-col" style={{ gap: 2 }}>
                    <p
                      style={{
                        margin: 0,
                        color: '#ffffff',
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
                        color: '#737373',
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
                      background: '#202020',
                      boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.1)',
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Network size={24} style={{ color: '#525252' }} />
                    </div>
                  </div>
                  <div className="flex flex-col" style={{ gap: 2 }}>
                    <p
                      style={{
                        margin: 0,
                        color: '#ffffff',
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
                        color: '#737373',
                        fontSize: 11.6,
                        fontWeight: 500,
                        lineHeight: '16px',
                      }}
                    >
                      {card.subtitle}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{card.author}</span>
                      <ExternalLink size={10} style={{ color: 'rgba(255,255,255,0.35)' }} />
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
