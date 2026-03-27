'use client'

export function CanvasEmptyState() {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <p style={{ color: 'var(--nf-text-muted)', fontSize: 'var(--nf-font-size-base)', fontWeight: 400, fontFamily: 'var(--nf-font)' }}>
        <span
          style={{
            background: 'var(--nf-bg-node)',
            border: '1px solid var(--nf-border-sidebar)',
            borderRadius: 'var(--nf-radius-md)',
            padding: '2px 8px',
            color: 'var(--nf-text-button)',
            cursor: 'default',
            pointerEvents: 'auto',
          }}
        >
          Add a node
        </span>
        {' '}or drag and drop media files, or select a preset
      </p>
    </div>
  )
}
