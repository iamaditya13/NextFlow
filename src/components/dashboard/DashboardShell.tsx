'use client'

import { ReactNode, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { X } from 'lucide-react'
import { GlobalSidebar } from '@/components/dashboard/GlobalSidebar'
import SettingsModal from '@/components/settings/SettingsModal'

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { isSignedIn, isLoaded } = useAuth()
  const [ghostModalOpen, setGhostModalOpen] = useState(false)

  const isCanvasPage = /^\/dashboard\/node-editor\/[^/]+$/.test(pathname)
  const handleAddNode = (type: string) => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent('nf:add-node', { detail: { type } }))
  }

  // When unauthenticated, intercept any click on an interactive element
  const handleClickCapture = useCallback(
    (e: React.MouseEvent) => {
      if (!isLoaded || isSignedIn || ghostModalOpen) return
      const target = e.target as HTMLElement
      if (target.closest('button, a, input, textarea, select, [role="button"], [role="link"]')) {
        e.preventDefault()
        e.stopPropagation()
        setGhostModalOpen(true)
      }
    },
    [isLoaded, isSignedIn, ghostModalOpen],
  )

  return (
    <div
      onClickCapture={handleClickCapture}
      style={{
        display: 'flex',
        height: '100vh',
        background: 'var(--nf-bg-canvas)',
        color: 'var(--nf-text-primary)',
        fontFamily: 'var(--nf-font)',
        overflow: 'hidden',
      }}
    >
      <GlobalSidebar initialExpanded={!isCanvasPage} onAddNode={handleAddNode} />
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

      {/* Ghost-mode auth modal — shown when unauthenticated users click anything */}
      {ghostModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={() => setGhostModalOpen(false)}
          />
          {/* Modal */}
          <div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={() => setGhostModalOpen(false)}
          >
            <div
              className="relative w-full max-w-sm rounded-2xl p-8
                         dark:bg-[#1a1a1a] dark:border dark:border-white/10
                         bg-white border border-black/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setGhostModalOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:opacity-60 transition-opacity
                           dark:text-white/40 text-gray-400"
              >
                <X size={16} />
              </button>

              <div className="text-center mb-6">
                <div
                  className="w-10 h-10 rounded-xl mx-auto mb-4 flex items-center justify-center
                             text-white text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg, #0080ff, #6c2bd9)' }}
                >
                  N
                </div>
                <h2 className="text-lg font-semibold dark:text-white text-gray-900 mb-1">
                  Sign in to continue
                </h2>
                <p className="text-sm dark:text-white/50 text-gray-500">
                  Create a free account or sign in to use Nextflow.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href="/sign-up?redirect_url=/dashboard"
                  className="flex items-center justify-center h-10 rounded-xl text-sm font-semibold
                             bg-[#0080ff] text-white hover:bg-[#006edb] transition-colors"
                >
                  Create free account
                </Link>
                <Link
                  href="/sign-in"
                  className="flex items-center justify-center h-10 rounded-xl text-sm font-semibold
                             dark:bg-white/5 dark:border dark:border-white/10 dark:text-white
                             bg-gray-50 border border-black/10 text-gray-900
                             hover:opacity-80 transition-opacity"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
