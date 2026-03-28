'use client'

import { Handle, Position } from '@xyflow/react'
import { Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { uploadFileToTransloadit } from './uploadToTransloaditClient'

interface UploadVideoNodeData {
  label?: string
  fileUrl?: string
  fileName?: string
  uploadError?: string
  executionStatus?: string
  onDelete?: () => void
  onUpdateData?: (updates: Record<string, unknown>) => void
}

function getStatusClass(status: string) {
  if (status === 'running') return 'nf-node--running'
  if (status === 'success') return 'nf-node--success'
  if (status === 'failed') return 'nf-node--failed'
  return ''
}

export function UploadVideoNode({ data, selected }: { data: UploadVideoNodeData; selected?: boolean }) {
  const status = (data.executionStatus || 'idle').toLowerCase()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const onSelectFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      setIsUploading(true)
      const url = await uploadFileToTransloadit(file, 'video')
      data.onUpdateData?.({ fileUrl: url, fileName: file.name })
    } catch (error: any) {
      data.onUpdateData?.({ uploadError: error.message || 'Upload failed' })
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  return (
    <div className={`nf-node ${selected ? 'nf-node--selected-video' : ''} ${getStatusClass(status)}`}>
      <div className="nf-node__header">
        <span className="nf-node__title">{data.label || 'Upload Video'}</span>
        <span className={`nf-node__status-dot nf-node__status-dot--${status}`} />
        <button className="nf-node__delete" onClick={data.onDelete} title="Delete node">
          <X size={12} />
        </button>
      </div>

      <div className="nf-node__body">
        <input ref={fileInputRef} type="file" accept=".mp4,.mov,.webm,.m4v" onChange={onSelectFile} style={{ display: 'none' }} />

        {data.fileUrl ? (
          <video src={data.fileUrl} controls className="nf-node__preview" style={{ objectFit: 'cover', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()} />
        ) : (
          <button
            className="nf-node__upload-zone"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{ opacity: isUploading ? 0.7 : 1 }}
          >
            <Upload size={14} color="var(--nf-text-label)" />
            <span className="nf-node__upload-text">{isUploading ? 'Uploading...' : 'Upload video'}</span>
            <span className="nf-node__upload-hint">MP4, MOV, WEBM, M4V</span>
          </button>
        )}

        {data.uploadError && <div className="nf-node__result nf-node__result--error">{data.uploadError}</div>}
      </div>

      <div className="nf-node__field" style={{ justifyContent: 'flex-end' }}>
        <span className="nf-node__label">Video</span>
      </div>

      <Handle type="source" position={Position.Right} id="output" className="nf-handle nf-handle--video" style={{ top: '50%' }} />
    </div>
  )
}
