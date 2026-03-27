'use client'

import { ReactNode } from 'react'
import { GlobalSidebar } from '@/components/dashboard/GlobalSidebar'
import SettingsModal from '@/components/settings/SettingsModal'

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: 'var(--nf-bg-canvas)',
        color: 'var(--nf-text-primary)',
        fontFamily: 'var(--nf-font)',
        overflow: 'hidden',
      }}
    >
      <GlobalSidebar initialExpanded />
      <main
        className="nf-scroll"
        style={{
          flex: 1,
          minWidth: 0,
          overflow: 'auto',
          background: 'var(--nf-bg-canvas)',
        }}
      >
        {children}
      </main>
      <SettingsModal />
    </div>
  )
}
