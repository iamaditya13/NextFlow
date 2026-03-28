'use client'

import { ReactNode } from 'react'
import { GlobalSidebar } from './GlobalSidebar'
import SettingsModal from '@/components/settings/SettingsModal'

interface StudioShellProps {
  children: ReactNode
  rightPanel?: ReactNode
  contentPadding?: string
  initialSidebarExpanded?: boolean
  onAddNode?: (type: string) => void
}

export function StudioShell({
  children,
  rightPanel,
  contentPadding = '22px 28px',
  initialSidebarExpanded = false,
  onAddNode,
}: StudioShellProps) {
  return (
    <div className="flex h-full" style={{ background: 'var(--nf-bg-outer)', color: 'var(--nf-text-primary)' }}>
      <GlobalSidebar initialExpanded={initialSidebarExpanded} onAddNode={onAddNode} />

      <div style={{ flex: 1, minWidth: 0, display: 'flex' }}>
        <main
          className="nf-scroll"
          style={{
            flex: 1,
            minWidth: 0,
            overflowY: 'auto',
            padding: contentPadding,
          }}
        >
          {children}
        </main>
        {rightPanel}
      </div>
      <SettingsModal />
    </div>
  )
}
