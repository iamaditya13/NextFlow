'use client'

import { useState } from 'react'
import { Handle, Position, useNodeConnections } from '@xyflow/react'
import { ChevronRight, Crop, Loader2, X } from 'lucide-react'

function getStatusClass(status: string) {
  if (status === 'running') return 'nf-node--running'
  if (status === 'success') return 'nf-node--success'
  if (status === 'failed') return 'nf-node--failed'
  return ''
}

export function CropImageNode({ data, selected }: any) {
  const status = (data.executionStatus || 'idle').toLowerCase()
  const isRunning = status === 'running'
  const [showSettings, setShowSettings] = useState(false)

  const xConn = useNodeConnections({ handleType: 'target', handleId: 'x_percent' })
  const yConn = useNodeConnections({ handleType: 'target', handleId: 'y_percent' })
  const wConn = useNodeConnections({ handleType: 'target', handleId: 'width_percent' })
  const hConn = useNodeConnections({ handleType: 'target', handleId: 'height_percent' })

  const isXC = xConn.length > 0
  const isYC = yConn.length > 0
  const isWC = wConn.length > 0
  const isHC = hConn.length > 0

  return (
    <div className={`nf-node ${selected ? 'nf-node--selected' : ''} ${getStatusClass(status)}`}>
      <Handle type="target" position={Position.Left} id="image_url" className="nf-handle nf-handle--image" style={{ top: '20%' }} />
      <Handle type="target" position={Position.Left} id="x_percent" className="nf-handle nf-handle--number" style={{ top: '36%' }} />
      <Handle type="target" position={Position.Left} id="y_percent" className="nf-handle nf-handle--number" style={{ top: '52%' }} />
      <Handle type="target" position={Position.Left} id="width_percent" className="nf-handle nf-handle--number" style={{ top: '68%' }} />
      <Handle type="target" position={Position.Left} id="height_percent" className="nf-handle nf-handle--number" style={{ top: '84%' }} />

      <div className="nf-node__header">
        <span className="nf-node__title">{data.label || 'Crop Image'}</span>
        <span className={`nf-node__status-dot nf-node__status-dot--${status}`} />
        <button className="nf-node__delete" onClick={data.onDelete} title="Delete node">
          <X size={12} />
        </button>
      </div>

      <div className="nf-node__body">
        {/* Preview */}
        {data.nodeOutput?.url ? (
          <img src={data.nodeOutput.url} alt="Cropped" className="nf-node__preview" />
        ) : (
          <div className="nf-node__preview-area">
            <p>Results will appear here</p>
          </div>
        )}

        {/* Output type */}
        <div className="nf-node__field" style={{ justifyContent: 'flex-end' }}>
          <span className="nf-node__label">Image</span>
        </div>

        {/* Image input handle label */}
        <div className="nf-node__field">
          <span className="nf-node__label">Image</span>
        </div>

        {/* Settings */}
        <button className="nf-node__settings-toggle" onClick={() => setShowSettings(!showSettings)} type="button">
          <ChevronRight size={12} style={{ transform: showSettings ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
          <span>Settings</span>
        </button>

        {showSettings && (
          <>
            <div className="nf-node__crop-grid">
              <div className="nf-node__crop-cell">
                <label className="nf-node__label">X %</label>
                <input type="number" className={`nf-node__number ${isXC ? 'nf-node__number--connected' : ''}`} value={isXC ? '' : data.xPercent ?? 0} onChange={(e) => !isXC && data.onUpdateData?.({ xPercent: Number(e.target.value) })} disabled={isXC} />
              </div>
              <div className="nf-node__crop-cell">
                <label className="nf-node__label">Y %</label>
                <input type="number" className={`nf-node__number ${isYC ? 'nf-node__number--connected' : ''}`} value={isYC ? '' : data.yPercent ?? 0} onChange={(e) => !isYC && data.onUpdateData?.({ yPercent: Number(e.target.value) })} disabled={isYC} />
              </div>
              <div className="nf-node__crop-cell">
                <label className="nf-node__label">W %</label>
                <input type="number" className={`nf-node__number ${isWC ? 'nf-node__number--connected' : ''}`} value={isWC ? '' : data.widthPercent ?? 100} onChange={(e) => !isWC && data.onUpdateData?.({ widthPercent: Number(e.target.value) })} disabled={isWC} />
              </div>
              <div className="nf-node__crop-cell">
                <label className="nf-node__label">H %</label>
                <input type="number" className={`nf-node__number ${isHC ? 'nf-node__number--connected' : ''}`} value={isHC ? '' : data.heightPercent ?? 100} onChange={(e) => !isHC && data.onUpdateData?.({ heightPercent: Number(e.target.value) })} disabled={isHC} />
              </div>
            </div>

            <div className="nf-node__field">
              <span className="nf-node__label">Upscale</span>
              <input className="nf-node__input" value={data.upscale ?? ''} onChange={(e) => data.onUpdateData?.({ upscale: e.target.value })} placeholder="Optional" style={{ flex: 1 }} />
            </div>
          </>
        )}

        <button
          className={`nf-node__btn ${isRunning ? 'nf-node__btn--loading' : ''}`}
          onClick={data.onRun}
          disabled={isRunning}
        >
          {isRunning ? (
            <><Loader2 size={14} className="nf-spin" /> Cropping...</>
          ) : (
            <><Crop size={14} /> Crop</>
          )}
        </button>

        {data.nodeOutput?.error && (
          <div className="nf-node__result nf-node__result--error">{data.nodeOutput.error}</div>
        )}
      </div>

      <Handle type="source" position={Position.Right} id="output" className="nf-handle nf-handle--image" style={{ top: '50%' }} />
    </div>
  )
}
