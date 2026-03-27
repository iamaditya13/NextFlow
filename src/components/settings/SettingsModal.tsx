'use client'

import { useEffect, useCallback } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'
import {
  X,
  Home,
  User,
  UserCircle,
  Sparkles,
  Tag,
  Users,
  Settings,
  Cpu,
  FileText,
  Key,
} from 'lucide-react'
import OverviewPage from './OverviewPage'
import ProfilePage from './ProfilePage'
import AccountPage from './AccountPage'
import AppearancePage from './AppearancePage'
import PromoPage from './PromoPage'
import MembersPage from './MembersPage'
import WorkspaceSettingsPage from './WorkspaceSettingsPage'
import ComputePacksPage from './ComputePacksPage'
import BillingPage from './BillingPage'
import ApiTokensPage from './ApiTokensPage'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'GENERAL',
    items: [
      { id: 'overview', label: 'Overview', icon: <Home size={16} /> },
      { id: 'profile', label: 'Profile', icon: <User size={16} /> },
      { id: 'account', label: 'Account', icon: <UserCircle size={16} /> },
      { id: 'appearance', label: 'Appearance', icon: <Sparkles size={16} /> },
      { id: 'promo', label: 'Promo', icon: <Tag size={16} /> },
    ],
  },
  {
    title: 'WORKSPACE',
    items: [
      { id: 'members', label: 'Members', icon: <Users size={16} /> },
      { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
    ],
  },
  {
    title: 'BILLING',
    items: [
      { id: 'compute-packs', label: 'Compute Packs', icon: <Cpu size={16} /> },
      { id: 'billing', label: 'Billing', icon: <FileText size={16} /> },
    ],
  },
  {
    title: 'DEVELOPER',
    items: [
      { id: 'api-tokens', label: 'API Tokens', icon: <Key size={16} /> },
    ],
  },
]

function SettingsContent({ path }: { path: string }) {
  switch (path) {
    case 'overview':
      return <OverviewPage />
    case 'profile':
      return <ProfilePage />
    case 'account':
      return <AccountPage />
    case 'appearance':
      return <AppearancePage />
    case 'promo':
      return <PromoPage />
    case 'members':
      return <MembersPage />
    case 'settings':
      return <WorkspaceSettingsPage />
    case 'compute-packs':
      return <ComputePacksPage />
    case 'billing':
      return <BillingPage />
    case 'api-tokens':
      return <ApiTokensPage />
    default:
      return <OverviewPage />
  }
}

export default function SettingsModal() {
  const settingsOpen = useSettingsStore((s) => s.settingsOpen)
  const settingsPath = useSettingsStore((s) => s.settingsPath)
  const closeSettings = useSettingsStore((s) => s.closeSettings)
  const openSettings = useSettingsStore((s) => s.openSettings)

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSettings()
    },
    [closeSettings]
  )

  useEffect(() => {
    if (settingsOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [settingsOpen, handleEscape])

  if (!settingsOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={closeSettings}
    >
      <div
        className="relative flex max-w-[700px] w-full max-h-[85vh] bg-white overflow-hidden"
        style={{
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left nav panel */}
        <div
          className="flex-shrink-0 flex flex-col py-4 overflow-y-auto"
          style={{ width: '200px', backgroundColor: '#fafafa', borderRight: '1px solid #e5e5e5' }}
        >
          <button
            onClick={closeSettings}
            className="ml-3 mb-2 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 w-fit transition-colors"
          >
            <X size={16} />
          </button>

          {navSections.map((section) => (
            <div key={section.title} className="mt-3 first:mt-0">
              <div
                className="px-4 pb-1.5 font-semibold text-gray-400"
                style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
              >
                {section.title}
              </div>
              {section.items.map((item) => {
                const isActive = settingsPath === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => openSettings(item.id)}
                    className={`flex items-center gap-3 w-[calc(100%-16px)] mx-2 rounded-md transition-colors text-left ${
                      isActive
                        ? 'bg-[#f0f0f0] font-semibold text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    style={{ padding: '8px 12px', fontSize: '14px' }}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Right content area */}
        <div className="flex-1 overflow-y-auto p-6">
          <SettingsContent path={settingsPath} />
        </div>
      </div>
    </div>
  )
}
