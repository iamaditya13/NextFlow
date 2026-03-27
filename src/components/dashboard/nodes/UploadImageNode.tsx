'use client'

import { Handle, Position } from '@xyflow/react'
import { Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { uploadFileToTransloadit } from './uploadToTransloaditClient'

function getStatusClass(status: string) {
  if (status === 'running') return 'nf-node--running'
  if (status === 'success') return 'nf-node--success'
  if (status === 'failed') return 'nf-node--failed'
  return ''
}

export function UploadImageNode({ data, selected }: any) {
  const status = (data.executionStatus || 'idle').toLowerCase()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const onSelectFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      setIsUploading(true)
      const url = await uploadFileToTransloadit(file, 'image')
      data.onUpdateData?.({ fileUrl: url, fileName: file.name })
    } catch (error: any) {
      data.onUpdateData?.({ uploadError: error.message || 'Upload failed' })
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  return (
    <div className={`nf-node ${selected ? 'nf-node--selected' : ''} ${getStatusClass(status)}`}>
      <div className="nf-node__header">
        <span className="nf-node__title">{data.label || 'Upload Image'}</span>
        <span className={`nf-node__status-dot nf-node__status-dot--${status}`} />
        <button className="nf-node__delete" onClick={data.onDelete} title="Delete node">
          <X size={12} />
        </button>
      </div>

      <div className="nf-node__body">
        <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.gif" onChange={onSelectFile} style={{ display: 'none' }} />

        {data.fileUrl ? (
          <img src={data.fileUrl} className="nf-node__preview" alt="Uploaded" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }} />
        ) : (
          <button
            className="nf-node__upload-zone"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{ opacity: isUploading ? 0.7 : 1 }}
          >
            <Upload size={14} color="var(--nf-text-label)" />
            <span className="nf-node__upload-text">
              {isUploading ? 'Uploading...' : 'Upload image'}
            </span>
            <span className="nf-node__upload-hint">JPG, PNG, WEBP, GIF</span>
          </button>
        )}

        {data.uploadError && <div className="nf-node__result nf-node__result--error">{data.uploadError}</div>}
      </div>

      {/* Output type label — Figma: "Image" at bottom-right */}
      <div className="nf-node__field" style={{ justifyContent: 'flex-end' }}>
        <span className="nf-node__label">Image</span>
      </div>

      <Handle type="source" position={Position.Right} id="output" className="nf-handle nf-handle--image" style={{ top: '50%' }} />
    </div>
  )
}
