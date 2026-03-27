'use client'

import { useSettingsStore, LoginMethods } from '@/stores/settingsStore'
import { Mail, Shield } from 'lucide-react'

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      onClick={onChange}
      className="relative flex-shrink-0 transition-colors duration-200 rounded-full"
      style={{
        width: '40px',
        height: '22px',
        backgroundColor: checked ? '#3b82f6' : '#d1d5db',
      }}
    >
      <span
        className="absolute top-[2px] block rounded-full bg-white transition-transform duration-200"
        style={{
          width: '18px',
          height: '18px',
          transform: checked ? 'translateX(20px)' : 'translateX(2px)',
        }}
      />
    </button>
  )
}

function GoogleIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" className="text-gray-900">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

const loginProviders: {
  key: keyof LoginMethods
  label: string
  icon: React.ReactNode
}[] = [
  { key: 'emailPassword', label: 'Email / Password', icon: <Mail size={16} className="text-gray-600" /> },
  { key: 'google', label: 'Google', icon: <GoogleIcon /> },
  { key: 'apple', label: 'Apple', icon: <AppleIcon /> },
  { key: 'sso', label: 'SSO', icon: <Shield size={16} className="text-gray-600" /> },
]

export default function AccountPage() {
  const profile = useSettingsStore((s) => s.profile)
  const loginMethods = useSettingsStore((s) => s.loginMethods)
  const toggleLoginMethod = useSettingsStore((s) => s.toggleLoginMethod)

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action is permanent and cannot be undone.')) {
      // Handle deletion
    }
  }

  return (
    <div className="space-y-6">
      {/* Account */}
      <div>
        <div
          className="mb-3 font-semibold text-gray-400"
          style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          ACCOUNT
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Email Address</label>
          <span className="inline-block bg-gray-100 rounded-md px-3 py-1 text-sm text-gray-900">
            {profile.email}
          </span>
        </div>
      </div>

      {/* Login Methods */}
      <div>
        <div
          className="mb-3 font-semibold text-gray-400"
          style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          LOGIN METHODS
        </div>
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
          {loginProviders.map((provider) => (
            <div key={provider.key} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                {provider.icon}
                <span className="text-sm text-gray-900">{provider.label}</span>
              </div>
              <Toggle
                checked={loginMethods[provider.key]}
                onChange={() => toggleLoginMethod(provider.key)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div>
        <div
          className="mb-3 font-semibold text-gray-400"
          style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          DANGER ZONE
        </div>
        <div className="border border-red-200 rounded-lg p-4 bg-red-50/50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Delete Account</h4>
              <p className="text-sm text-gray-500">Permanently remove all data</p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="bg-red-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-red-600 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
