'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, ExternalLink } from 'lucide-react'

export default function NodeEditorLanding() {
  const [workflows, setWorkflows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Projects')

  const tabs = ['Projects', 'Apps', 'Examples', 'Templates']

  useEffect(() => {
    fetch('/api/workflows')
      .then((res) => res.json())
      .then((json) => {
        setWorkflows(json.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

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
    <div style={{ width: '100%', height: '100%', overflow: 'auto', background: '#0a0a0a' }}>
      {/* Hero banner with background image */}
      <section
        style={{
          position: 'relative',
          minHeight: 260,
          overflow: 'hidden',
          borderBottom: '1px solid #1a1a1a',
        }}
      >
        {/* Background image */}
        <img
          src="/assets/krea1-example.png"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.45,
          }}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.5) 45%, rgba(10,10,10,0.7) 100%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '64px 48px',
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
                background: '#4f46e5',
                display: 'grid',
                placeItems: 'center',
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
                color: '#f4f7fb',
                fontWeight: 700,
              }}
            >
              Node Editor
            </h1>
          </div>
          <p
            style={{
              margin: 0,
              color: '#c8cdd8',
              fontSize: 15,
              lineHeight: 1.5,
              maxWidth: 500,
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
              color: '#0f1218',
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

      {/* Tabs */}
      <div
        style={{
          borderBottom: '1px solid #1a1a1a',
          padding: '16px 48px 0',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                borderRadius: 8,
                border: '1px solid #2a2a2a',
                background: activeTab === tab ? '#222' : 'transparent',
                color: activeTab === tab ? '#fff' : '#888',
                fontSize: 13,
                fontWeight: 600,
                padding: '8px 16px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                marginBottom: -1,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      {workflows.length === 0 ? (
        /* Empty state */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '80px 24px',
            minHeight: 300,
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#4f46e5',
              display: 'grid',
              placeItems: 'center',
              marginBottom: 18,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="6" height="6" rx="1" />
              <rect x="16" y="2" width="6" height="6" rx="1" />
              <rect x="9" y="16" width="6" height="6" rx="1" />
              <path d="M5 8v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
              <line x1="12" y1="13" x2="12" y2="16" />
            </svg>
          </div>

          <h2
            style={{
              margin: 0,
              color: '#f0f0f0',
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: '-0.02em',
            }}
          >
            No Workflows Yet
          </h2>
          <p
            style={{
              margin: '8px 0 0',
              color: '#666',
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            You haven&apos;t created any workflows yet.
            <br />
            Get started by creating your first one.
          </p>

          <button
            onClick={handleNewWorkflow}
            style={{
              marginTop: 20,
              height: 40,
              borderRadius: 9999,
              border: '1px solid #333',
              background: '#fff',
              color: '#111',
              padding: '0 24px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            New Workflow
          </button>

          <a
            href="#"
            style={{
              marginTop: 14,
              color: '#888',
              fontSize: 13,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Learn More <ExternalLink size={12} />
          </a>
        </div>
      ) : (
        /* Workflow list */
        <div style={{ padding: '24px 48px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {workflows.map((wf) => (
              <Link
                key={wf.id}
                href={`/dashboard/node-editor/${wf.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#141414',
                  border: '1px solid #1f1f1f',
                  borderRadius: 12,
                  padding: '14px 20px',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#333')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1f1f1f')}
              >
                <div>
                  <div style={{ color: '#e5e5e5', fontSize: 14, fontWeight: 500 }}>{wf.name}</div>
                  <div style={{ color: '#555', fontSize: 12, marginTop: 4 }}>
                    Updated {new Date(wf.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <ArrowRight size={16} style={{ color: '#555' }} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}