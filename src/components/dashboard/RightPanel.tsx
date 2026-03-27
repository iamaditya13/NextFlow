'use client'

import type { Edge, Node } from '@xyflow/react'

interface VersionEntry {
  timeAgo: string
  nodeCount: number
  edgeCount: number
  thumbnail?: string
}

interface RightPanelProps {
  open: boolean
  nodes: Node[]
  edges: Edge[]
  versionHistory: VersionEntry[]
}

export function RightPanel({ open, nodes, edges, versionHistory }: RightPanelProps) {
  if (!open) return null

  // Always show at least a "current" entry
  const entries: VersionEntry[] =
    versionHistory.length > 0
      ? versionHistory
      : [{ timeAgo: 'Just now', nodeCount: nodes.length, edgeCount: edges.length }]

  return (
    <div
      className="fixed right-0 top-0 bottom-0 w-64 z-10
                 dark:bg-black bg-white
                 border-l dark:border-white/[0.08] border-black/[0.08]
                 flex flex-col"
    >
      <div className="flex-1 overflow-y-auto p-3">
        {entries.map((version, i) => (
          <button
            key={i}
            type="button"
            className="w-full mb-2 rounded-xl p-2
                       dark:bg-[#262626] bg-gray-100
                       hover:opacity-80 transition-opacity text-left"
          >
            {/* Thumbnail area */}
            <div
              className="w-full rounded-lg overflow-hidden
                         dark:bg-[#1a1a1a] bg-white mb-2 relative"
              style={{ aspectRatio: '4/3' }}
            >
              {version.thumbnail ? (
                <img
                  src={version.thumbnail}
                  className="w-full h-full object-cover"
                  alt="Version thumbnail"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  }}
                />
              )}

              {/* Time badge */}
              <div
                className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded
                           bg-black/50 backdrop-blur-sm
                           text-[9.5px] font-medium dark:text-[#d4d4d4] text-gray-300"
              >
                {version.timeAgo}
              </div>

              {/* Current badge */}
              {i === 0 && (
                <div
                  className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded
                             dark:bg-[#404040] bg-gray-200
                             text-[7.9px] font-semibold uppercase tracking-wide
                             dark:text-[#d4d4d4] text-gray-600"
                >
                  Current
                </div>
              )}

              {/* Stats */}
              <div
                className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded
                           bg-black/50 backdrop-blur-sm
                           text-[9.5px] font-medium dark:text-[#737373] text-gray-400"
              >
                {version.nodeCount} node{version.nodeCount !== 1 ? 's' : ''} ·{' '}
                {version.edgeCount} edge{version.edgeCount !== 1 ? 's' : ''}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
