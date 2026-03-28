'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, Clock, Loader2, PanelRightClose, XCircle } from 'lucide-react'

interface NodeResult {
  id: string
  nodeId: string
  nodeType: string
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED'
  outputs?: Record<string, unknown> | null
  error?: string | null
  duration?: number | null
  startedAt: string
}

interface Run {
  id: string
  status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL'
  scope: 'FULL' | 'PARTIAL' | 'SINGLE'
  duration?: number | null
  startedAt: string
  completedAt?: string | null
  nodeResults: NodeResult[]
}

interface HistorySidebarProps {
  workflowId: string | null
  isOpen: boolean
  onToggle: () => void
  activeRunId: string | null
}

const STATUS_META: Record<string, { Icon: React.ComponentType<{ size?: number; color?: string }>, color: string }> = {
  SUCCESS: { Icon: CheckCircle2, color: '#22c55e' },
  FAILED: { Icon: XCircle, color: '#ef4444' },
  RUNNING: { Icon: Loader2, color: '#eab308' },
  PARTIAL: { Icon: AlertTriangle, color: '#f97316' },
  PENDING: { Icon: Loader2, color: '#6b7280' },
}

function formatDuration(ms: number | null | undefined): string {
  if (!ms) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function scopeLabel(scope: string, nodeResults: NodeResult[]): string {
  if (scope === 'FULL') return 'Full Workflow'
  if (scope === 'SINGLE') return 'Single Node'
  return `${nodeResults.length} nodes selected`
}

export function HistorySidebar({
  workflowId,
  isOpen,
  onToggle,
  activeRunId,
}: HistorySidebarProps) {
  const [runs, setRuns] = useState<Run[]>([])
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const fetchRuns = useCallback(async (withLoading = false) => {
    if (!workflowId) return
    if (withLoading) setLoading(true)
    try {
      const res = await fetch(`/api/workflows/${workflowId}/runs`)
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setRuns(json.data)
      }
    } catch {
      // silent
    } finally {
      if (withLoading) setLoading(false)
    }
  }, [workflowId])

  // Fetch on mount and when workflowId changes
  useEffect(() => {
    if (isOpen) {
      void fetchRuns(true)
    }
  }, [isOpen, workflowId, fetchRuns])

  // Poll active run
  useEffect(() => {
    if (activeRunId && isOpen) {
      pollRef.current = setInterval(() => {
        void fetchRuns()
      }, 1500)
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [activeRunId, isOpen, fetchRuns])

  if (!isOpen) return null

  return (
    <aside className="nf-right-panel" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
      {/* Header */}
      <div
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          flexShrink: 0,
          borderBottom: '1px solid var(--nf-border-inner)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={14} color="var(--nf-text-icon)" />
          <span style={{ fontSize: 'var(--nf-font-size-base)', fontWeight: 500, color: 'var(--nf-text-primary)', fontFamily: 'var(--nf-font)' }}>
            Run History
          </span>
        </div>
        <button
          onClick={onToggle}
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--nf-radius-md)',
            border: 'none',
            background: 'transparent',
            color: 'var(--nf-text-icon)',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
          }}
          title="Close"
        >
          <PanelRightClose size={15} />
        </button>
      </div>

      {/* Run list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {loading && runs.length === 0 && (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--nf-text-muted)', fontSize: 12 }}>
            Loading...
          </div>
        )}

        {!loading && runs.length === 0 && (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--nf-text-muted)', fontSize: 12 }}>
            No runs yet
          </div>
        )}

        {runs.map((run, idx) => {
          const meta = STATUS_META[run.status] || STATUS_META.PENDING
          const RunIcon = meta.Icon
          const isExpanded = expandedRunId === run.id

          return (
            <div key={run.id} style={{ borderBottom: '1px solid var(--nf-border-inner)' }}>
              {/* Run header */}
              <button
                onClick={() => setExpandedRunId(isExpanded ? null : run.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '10px 12px',
                  background: isExpanded ? 'var(--nf-bg-node-inner)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ marginTop: 2 }}>
                  {isExpanded ? (
                    <ChevronDown size={12} color="var(--nf-text-muted)" />
                  ) : (
                    <ChevronRight size={12} color="var(--nf-text-muted)" />
                  )}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--nf-text-primary)' }}>
                      Run #{runs.length - idx}
                    </span>
                    <RunIcon size={12} color={meta.color} />
                    <span
                      style={{
                        fontSize: 10,
                        color: meta.color,
                        fontWeight: 500,
                        marginLeft: 'auto',
                      }}
                    >
                      {formatDuration(run.duration)}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--nf-text-muted)', marginTop: 2 }}>
                    {formatDate(run.startedAt)} · ({scopeLabel(run.scope, run.nodeResults)})
                  </div>
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div style={{ padding: '4px 12px 10px 32px' }}>
                  {run.nodeResults.map((nr, nrIdx) => {
                    const nrMeta = STATUS_META[nr.status] || STATUS_META.PENDING
                    const NrIcon = nrMeta.Icon
                    const isLast = nrIdx === run.nodeResults.length - 1

                    return (
                      <div key={nr.id} style={{ position: 'relative', paddingLeft: 12 }}>
                        {/* Tree line */}
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: isLast ? '50%' : 0,
                            width: 1,
                            background: 'var(--nf-border-inner)',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            width: 8,
                            height: 1,
                            background: 'var(--nf-border-inner)',
                          }}
                        />

                        <div style={{ paddingLeft: 6, paddingBottom: 6 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                            }}
                          >
                            <span style={{ color: 'var(--nf-text-secondary)', fontWeight: 500 }}>
                              {nr.nodeType}
                            </span>
                            <span style={{ color: 'var(--nf-text-muted)', fontSize: 10 }}>
                              ({nr.nodeId})
                            </span>
                            <span style={{ marginLeft: 'auto' }}>
                              <NrIcon size={11} color={nrMeta.color} />
                            </span>
                            <span style={{ color: 'var(--nf-text-muted)', fontSize: 10 }}>
                              {formatDuration(nr.duration)}
                            </span>
                          </div>

                          {nr.status === 'SUCCESS' && nr.outputs && (
                            <div
                              style={{
                                fontSize: 10,
                                color: 'var(--nf-text-muted)',
                                marginTop: 2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: 180,
                              }}
                            >
                              Output:{' '}
                              {typeof (nr.outputs as Record<string, unknown>).text === 'string'
                                ? ((nr.outputs as Record<string, string>).text || '').slice(0, 60)
                                : typeof (nr.outputs as Record<string, unknown>).url === 'string'
                                  ? (nr.outputs as Record<string, string>).url
                                  : JSON.stringify(nr.outputs).slice(0, 60)}
                            </div>
                          )}

                          {nr.status === 'FAILED' && nr.error && (
                            <div
                              style={{
                                fontSize: 10,
                                color: '#ef4444',
                                marginTop: 2,
                              }}
                            >
                              Error: {nr.error}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
