'use client'

import { useMemo, useState } from 'react'
import { ChevronRight, RefreshCw } from 'lucide-react'

type HistoryFilter = 'all' | 'success' | 'failed' | 'running'

interface NodeResultItem {
  id: string
  nodeId: string
  nodeName: string
  nodeType: string
  status: string
  outputs?: any
  error?: string | null
  duration?: number | null
}

interface RunItem {
  id: string
  status: string
  scope: string
  startedAt: string
  duration?: number | null
  nodeResults: NodeResultItem[]
}

interface RightSidebarProps {
  collapsed: boolean
  onToggle: () => void
  runs: RunItem[]
  onRefresh: () => void
}

function getStatusColor(status: string) {
  const normalized = status.toUpperCase()
  if (normalized === 'SUCCESS') return '#22c55e'
  if (normalized === 'FAILED') return '#ef4444'
  if (normalized === 'RUNNING') return '#eab308'
  return '#f97316'
}

function getStatusIcon(status: string) {
  const normalized = status.toUpperCase()
  if (normalized === 'SUCCESS') return '✓'
  if (normalized === 'FAILED') return '✕'
  if (normalized === 'RUNNING') return '●'
  return '◐'
}

function formatDuration(duration?: number | null) {
  if (!duration && duration !== 0) return '-'
  if (duration < 1000) return `${duration}ms`
  return `${(duration / 1000).toFixed(1)}s`
}

export function RightSidebar({
  collapsed,
  onToggle,
  runs,
  onRefresh,
}: RightSidebarProps) {
  const [filter, setFilter] = useState<HistoryFilter>('all')
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null)

  const filteredRuns = useMemo(() => {
    if (filter === 'all') return runs
    return runs.filter((run) => run.status.toLowerCase() === filter)
  }, [runs, filter])

  if (collapsed) {
    return (
      <aside
        style={{
          width: 36,
          height: '100%',
          borderLeft: '1px solid #262626',
          background: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <button
          onClick={onToggle}
          title="Open run history"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            border: 'none',
            color: '#737373',
            background: 'transparent',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            transform: 'rotate(180deg)',
          }}
        >
          <ChevronRight size={16} />
        </button>
      </aside>
    )
  }

  return (
    <aside
      style={{
        width: 300,
        height: '100%',
        borderLeft: '1px solid #262626',
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          height: 48,
          borderBottom: '1px solid #262626',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 10px',
        }}
      >
        <span style={{ fontSize: 13, color: '#FAFAFA', fontWeight: 600, flex: 1 }}>
          Workflow History
        </span>
        <button
          onClick={onRefresh}
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            border: 'none',
            color: '#737373',
            background: 'transparent',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
          }}
          title="Refresh history"
        >
          <RefreshCw size={14} />
        </button>
        <button
          onClick={onToggle}
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            border: 'none',
            color: '#737373',
            background: 'transparent',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
          }}
          title="Collapse history"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #262626', flexShrink: 0 }}>
        {(['all', 'success', 'failed', 'running'] as HistoryFilter[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              flex: 1,
              height: 34,
              border: 'none',
              borderBottom: filter === tab ? '2px solid #737373' : '2px solid transparent',
              background: 'transparent',
              color: filter === tab ? '#FAFAFA' : '#737373',
              textTransform: 'capitalize',
              fontSize: 11,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="nf-scroll" style={{ overflowY: 'auto', minHeight: 0, flex: 1 }}>
        {filteredRuns.map((run, index) => {
          const expanded = expandedRunId === run.id
          const statusColor = getStatusColor(run.status)
          const statusIcon = getStatusIcon(run.status)

          return (
            <div key={run.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
              <button
                onClick={() => setExpandedRunId((current) => (current === run.id ? null : run.id))}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  color: 'white',
                  textAlign: 'left',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: '#b4b4b4' }}>#{runs.length - index}</span>
                  <span
                    style={{
                      fontSize: 11,
                      color: statusColor,
                      border: `1px solid ${statusColor}44`,
                      borderRadius: 999,
                      padding: '1px 8px',
                    }}
                  >
                    {statusIcon} {run.status.toLowerCase()}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: '#777777' }}>
                    {formatDuration(run.duration)}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: '#666666' }}>
                  {new Date(run.startedAt).toLocaleString()} · {run.scope.toLowerCase()}
                </div>
              </button>

              {expanded && (
                <div
                  style={{
                    background: '#0d0d0d',
                    borderTop: '1px solid #1a1a1a',
                    padding: '8px 12px 10px',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    fontSize: 11,
                    color: '#d4d4d8',
                  }}
                >
                  {run.nodeResults.map((node, nodeIndex) => {
                    const isLast = nodeIndex === run.nodeResults.length - 1
                    const prefix = isLast ? '└──' : '├──'
                    const nodeStatusColor = getStatusColor(node.status)
                    const outputText =
                      typeof node.outputs?.text === 'string'
                        ? node.outputs.text
                        : node.outputs?.url || node.outputs?.fileUrl || ''

                    return (
                      <div key={node.id} style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: '#52525b' }}>{prefix}</span>
                          <span style={{ color: nodeStatusColor }}>{getStatusIcon(node.status)}</span>
                          <span style={{ color: '#e4e4e7' }}>{node.nodeName}</span>
                          <span style={{ marginLeft: 'auto', color: '#71717a' }}>
                            {formatDuration(node.duration)}
                          </span>
                        </div>

                        {outputText ? (
                          <div
                            style={{
                              marginLeft: 24,
                              marginTop: 3,
                              color: '#a1a1aa',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: 245,
                            }}
                          >
                            {outputText}
                          </div>
                        ) : null}

                        {node.error ? (
                          <div style={{ marginLeft: 24, marginTop: 3, color: '#ef4444' }}>
                            {node.error}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {filteredRuns.length === 0 && (
          <div style={{ color: '#666666', fontSize: 12, padding: 16 }}>No runs yet.</div>
        )}
      </div>
    </aside>
  )
}
