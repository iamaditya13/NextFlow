'use client'

import { useSettingsStore, Theme, SidebarIconStyle, SessionsDisplay } from '@/stores/settingsStore'
import { useTheme } from '@/components/theme/theme-provider'

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
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

function RadioCircle({ selected }: { selected: boolean }) {
  return (
    <div
      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
        selected ? 'border-blue-500' : 'border-gray-300'
      }`}
    >
      {selected && <div className="w-2 h-2 rounded-full bg-blue-500" />}
    </div>
  )
}

const themeOptions: { value: Theme; label: string; previewBg: string }[] = [
  { value: 'system', label: 'System', previewBg: '#e5e5e5' },
  { value: 'light', label: 'Light', previewBg: '#ffffff' },
  { value: 'dark', label: 'Dark', previewBg: '#1a1a1a' },
]

const iconStyleOptions: { value: SidebarIconStyle; label: string }[] = [
  { value: 'colored', label: 'Colored' },
  { value: 'simple', label: 'Simple' },
  { value: 'minimal', label: 'Minimal' },
]

const sessionsOptions: { value: SessionsDisplay; label: string }[] = [
  { value: 'all', label: 'Always show all sessions for all tools' },
  { value: 'current', label: 'Only show sessions for currently opened tool' },
]

export default function AppearancePage() {
  const theme = useSettingsStore((s) => s.theme)
  const setStoreTheme = useSettingsStore((s) => s.setTheme)
  const { setTheme: setProviderTheme } = useTheme()

  function setTheme(val: Theme) {
    setStoreTheme(val)
    if (val !== 'system') setProviderTheme(val)
    else setProviderTheme('dark') // fallback for system
  }
  const sidebarIconStyle = useSettingsStore((s) => s.sidebarIconStyle)
  const setSidebarIconStyle = useSettingsStore((s) => s.setSidebarIconStyle)
  const sessionsDisplay = useSettingsStore((s) => s.sessionsDisplay)
  const setSessionsDisplay = useSettingsStore((s) => s.setSessionsDisplay)
  const collapseSidebar = useSettingsStore((s) => s.collapseSidebarForImmersive)
  const setCollapseSidebar = useSettingsStore((s) => s.setCollapseSidebarForImmersive)

  return (
    <div className="space-y-6">
      {/* Theme */}
      <div>
        <div
          className="mb-3 font-semibold text-gray-400"
          style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          THEME
        </div>
        <div className="flex gap-3">
          {themeOptions.map((opt) => {
            const selected = theme === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex-1 border rounded-lg p-3 cursor-pointer transition-all text-left ${
                  selected
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className="h-20 rounded-md mb-3"
                  style={{
                    backgroundColor: opt.previewBg,
                    border: opt.value === 'light' ? '1px solid #e5e5e5' : undefined,
                  }}
                />
                <div className="flex items-center gap-2">
                  <RadioCircle selected={selected} />
                  <span className="text-sm text-gray-900">{opt.label}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Sidebar Icons */}
      <div>
        <div
          className="mb-3 font-semibold text-gray-400"
          style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          SIDEBAR ICONS
        </div>
        <div className="flex gap-3">
          {iconStyleOptions.map((opt) => {
            const selected = sidebarIconStyle === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setSidebarIconStyle(opt.value)}
                className={`flex-1 border rounded-lg p-3 cursor-pointer transition-all text-left ${
                  selected
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="h-20 rounded-md mb-3 bg-gray-50 flex items-center justify-center gap-2">
                  {opt.value === 'colored' && (
                    <>
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-blue-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    </>
                  )}
                  {opt.value === 'simple' && (
                    <>
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                    </>
                  )}
                  {opt.value === 'minimal' && (
                    <div className="flex flex-col gap-1 text-[10px] text-gray-500 font-medium">
                      <span>Tool A</span>
                      <span>Tool B</span>
                      <span>Tool C</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <RadioCircle selected={selected} />
                  <span className="text-sm text-gray-900">{opt.label}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Collapse sidebar toggle */}
      <div className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
        <span className="text-sm text-gray-900">Collapse sidebar for immersive tools</span>
        <Toggle checked={collapseSidebar} onChange={setCollapseSidebar} />
      </div>

      {/* Sidebar Sessions */}
      <div>
        <div
          className="mb-3 font-semibold text-gray-400"
          style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          SIDEBAR SESSIONS
        </div>
        <div className="flex flex-col gap-3">
          {sessionsOptions.map((opt) => {
            const selected = sessionsDisplay === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setSessionsDisplay(opt.value)}
                className={`border rounded-lg p-4 cursor-pointer transition-all text-left flex items-center gap-3 ${
                  selected
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RadioCircle selected={selected} />
                <span className="text-sm text-gray-900">{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
