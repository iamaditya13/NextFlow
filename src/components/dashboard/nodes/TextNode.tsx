'use client'

import { Handle, Position } from '@xyflow/react'
import { X } from 'lucide-react'

function getStatusClass(status: string) {
  if (status === 'running') return 'nf-node--running'
  if (status === 'success') return 'nf-node--success'
  if (status === 'failed') return 'nf-node--failed'
  return ''
}

export function TextNode({ data, selected }: any) {
  const status = (data.executionStatus || 'idle').toLowerCase()

  return (
    <div className={`nf-node ${selected ? 'nf-node--selected-text' : ''} ${getStatusClass(status)}`}>
      <div className="nf-node__header">
        <span className="nf-node__title">{data.label || 'Text'}</span>
        <span className={`nf-node__status-dot nf-node__status-dot--${status}`} />
        <button className="nf-node__delete" onClick={data.onDelete} title="Delete node">
          <X size={12} />
        </button>
      </div>

      <div className="nf-node__body">
        <div style={{ padding: '4px 16px 16px' }}>
          <textarea
            className="nf-node__textarea"
            value={data.text || ''}
            onChange={(e) => data.onUpdateData?.({ text: e.target.value })}
            placeholder="Enter text output..."
          />
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="output" className="nf-handle nf-handle--text" style={{ top: '50%' }} />
    </div>
  )
}
