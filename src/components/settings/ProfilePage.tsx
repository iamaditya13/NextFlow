'use client'

import { useRef } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'

export default function ProfilePage() {
  const profile = useSettingsStore((s) => s.profile)
  const updateProfile = useSettingsStore((s) => s.updateProfile)
  const updateSocial = useSettingsStore((s) => s.updateSocial)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const inputClass =
    'border border-gray-200 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white text-gray-900'

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 hover:opacity-80 transition-opacity"
          style={{ backgroundColor: profile.avatarColor }}
        >
          {profile.avatarLetter}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
        <span className="text-sm text-gray-500">Click to upload a new photo</span>
      </div>

      {/* Profile fields */}
      <div>
        <div
          className="mb-3 font-semibold text-gray-400"
          style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          PROFILE
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Your name"
              value={profile.displayName}
              onChange={(e) => updateProfile({ displayName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Handle</label>
            <input
              type="text"
              className={inputClass}
              value={profile.handle}
              onChange={(e) => updateProfile({ handle: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Bio</label>
            <textarea
              className={`${inputClass} min-h-[80px] resize-y`}
              placeholder="About you"
              value={profile.bio}
              onChange={(e) => updateProfile({ bio: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Social */}
      <div>
        <div
          className="mb-3 font-semibold text-gray-400"
          style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          SOCIAL
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">X / Twitter</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-200 rounded-l-md">
                x.com/
              </span>
              <input
                type="text"
                className="flex-1 border border-gray-200 rounded-r-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white text-gray-900"
                value={profile.social.twitter}
                onChange={(e) => updateSocial({ twitter: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Instagram</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-200 rounded-l-md">
                instagram.com/
              </span>
              <input
                type="text"
                className="flex-1 border border-gray-200 rounded-r-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white text-gray-900"
                value={profile.social.instagram}
                onChange={(e) => updateSocial({ instagram: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">YouTube</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-200 rounded-l-md">
                youtube.com/
              </span>
              <input
                type="text"
                className="flex-1 border border-gray-200 rounded-r-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white text-gray-900"
                value={profile.social.youtube}
                onChange={(e) => updateSocial({ youtube: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Session */}
      <div>
        <div
          className="mb-3 font-semibold text-gray-400"
          style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          SESSION
        </div>
        <div className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
          <span className="text-sm text-gray-900">Sign Out</span>
          <button className="flex items-center gap-1 text-red-500 hover:bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm transition-colors">
            &rarr; Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
