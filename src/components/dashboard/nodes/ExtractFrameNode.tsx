'use client'

import { useState } from 'react'
import { Handle, Position, useNodeConnections } from '@xyflow/react'
import { ChevronRight, Film, Loader2, X } from 'lucide-react'

function getStatusClass(status: string) {
  if (status === 'running') return 'nf-node--running'
  if (status === 'success') return 'nf-node--success'
  if (status === 'failed') return 'nf-node--failed'
  return ''
}

export function ExtractFrameNode({ data, selected }: any) {
  const status = (data.executionStatus || 'idle').toLowerCase()
  const isRunning = status === 'running'
  const [showSettings, setShowSettings] = useState(false)

  const timestampConnections = useNodeConnections({ handleType: 'target', handleId: 'timestamp' })
  const isTimestampConnected = timestampConnections.length > 0

  return (
    <div className={`nf-node ${selected ? 'nf-node--selected-extract' : ''} ${getStatusClass(status)}`}>
      <Handle type="target" position={Position.Left} id="video_url" className="nf-handle nf-handle--video" style={{ top: '35%' }} />
      <Handle type="target" position={Position.Left} id="timestamp" className="nf-handle nf-handle--number" style={{ top: '65%' }} />

      <div className="nf-node__header">
        <span className="nf-node__title">{data.label || 'Extract Frame'}</span>
        <span className={`nf-node__status-dot nf-node__status-dot--${status}`} />
        <button className="nf-node__delete" onClick={data.onDelete} title="Delete node">
          <X size={12} />
        </button>
      </div>

      <div className="nf-node__body">
        {/* Preview */}
        {data.nodeOutput?.url ? (
          <img src={data.nodeOutput.url} alt="Extracted frame" className="nf-node__preview" />
        ) : (
          <div className="nf-node__preview-area">
            <p>Results will appear here</p>
          </div>
        )}

        {/* Output type */}
        <div className="nf-node__field" style={{ justifyContent: 'flex-end' }}>
          <span className="nf-node__label">Image</span>
        </div>

        {/* Settings */}
        <button className="nf-node__settings-toggle" onClick={() => setShowSettings(!showSettings)} type="button">
          <ChevronRight size={12} style={{ transform: showSettings ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
          <span>Settings</span>
        </button>

        {showSettings && (
          <div className="nf-node__field">
            <span className="nf-node__label">Timestamp</span>
            <input
              className={`nf-node__input ${isTimestampConnected ? 'nf-node__input--connected' : ''}`}
              value={isTimestampConnected ? 'Connected' : data.timestamp || '50%'}
              onChange={(e) => !isTimestampConnected && data.onUpdateData?.({ timestamp: e.target.value })}
              disabled={isTimestampConnected}
              readOnly={isTimestampConnected}
              placeholder="e.g. 5 or 50%"
              style={{ flex: 1 }}
            />
          </div>
        )}

        <button
          className={`nf-node__btn ${isRunning ? 'nf-node__btn--loading' : ''}`}
          onClick={data.onRun}
          disabled={isRunning}
        >
          {isRunning ? (
            <><Loader2 size={14} className="nf-spin" /> Extracting...</>
          ) : (
            <><Film size={14} /> Extract</>
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
