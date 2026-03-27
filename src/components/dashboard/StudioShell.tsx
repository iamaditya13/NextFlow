'use client'

import { ReactNode } from 'react'
import { GlobalSidebar } from './GlobalSidebar'
import SettingsModal from '@/components/settings/SettingsModal'

interface StudioShellProps {
  children: ReactNode
  rightPanel?: ReactNode
  contentPadding?: string
  initialSidebarExpanded?: boolean
}

export function StudioShell({
  children,
  rightPanel,
  contentPadding = '22px 28px',
  initialSidebarExpanded = false,
}: StudioShellProps) {
  return (
    <div className="flex h-full dark:bg-[#101010] bg-[#f5f5f5] dark:text-white text-gray-900">
      <GlobalSidebar initialExpanded={initialSidebarExpanded} />

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
