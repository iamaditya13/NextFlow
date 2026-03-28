'use client'

import { type EdgeProps, EdgeLabelRenderer, getBezierPath, useReactFlow } from '@xyflow/react'
import { X } from 'lucide-react'
import { useState } from 'react'

const NODE_TYPE_COLORS: Record<string, string> = {
  text: 'var(--nf-edge-text)',
  uploadImage: 'var(--nf-edge-upload-image)',
  uploadVideo: 'var(--nf-edge-upload-video)',
  llm: 'var(--nf-edge-llm)',
  extractFrame: 'var(--nf-edge-extract-frame)',
  cropImage: 'var(--nf-edge-crop-image)',
  kreaImage: 'var(--nf-edge-krea-image)',
}

export function FlowingEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { setEdges } = useReactFlow()

  const sourceType = (data?.sourceType as string) || 'uploadImage'
  const color = NODE_TYPE_COLORS[sourceType] || 'var(--nf-text-label)'

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  const handleDelete = () => {
    setEdges((eds) => eds.filter((e) => e.id !== id))
  }

  return (
    <>
      {/* Wide transparent hit area for reliable hover detection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ cursor: 'pointer' }}
      />

      {/* Soft glow layer */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeOpacity={0.2}
        strokeLinecap="round"
        style={{ pointerEvents: 'none', filter: `drop-shadow(0 0 6px ${color})` }}
      />

      {/* Main dotted animated line */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeOpacity={0.95}
        strokeLinecap="round"
        strokeDasharray="2 8"
        style={{ pointerEvents: 'none' }}
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;-36"
          dur="1.2s"
          repeatCount="indefinite"
        />
      </path>

      {/* Colored × delete button at midpoint, visible on hover */}
      {isHovered && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              zIndex: 10,
            }}
            className="nodrag nopan"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button
              type="button"
              onClick={handleDelete}
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: color,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow:
                  '0 2px 8px color-mix(in srgb, var(--nf-bg-canvas) 58%, transparent), 0 0 0 2px color-mix(in srgb, var(--color-text-white) 18%, transparent)',
              }}
            >
              <X size={10} color="var(--nf-bg-canvas)" />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
