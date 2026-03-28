'use client'

import { useTheme } from '@/components/theme/theme-provider'
import { useSettingsStore } from '@/stores/settingsStore'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const setStoreTheme = useSettingsStore((s) => s.setTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Keep settingsStore in sync with the resolved theme from ThemeProvider
  useEffect(() => {
    if (mounted) setStoreTheme(resolvedTheme)
  }, [mounted, resolvedTheme, setStoreTheme])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setStoreTheme(next)
  }

  if (!mounted) {
    return (
      <button
        type="button"
        className="w-9 h-9 flex items-center justify-center rounded-[10px]
                   bg-[#1c1c1c] border border-white/10 shadow-sm"
      >
        <Moon className="w-[18px] h-[18px] text-white" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="w-9 h-9 flex items-center justify-center rounded-[10px]
                 dark:bg-[#1c1c1c] bg-white
                 dark:border-white/10 border-black/10 border
                 shadow-sm hover:opacity-80 transition-opacity"
    >
      {theme === 'dark' ? (
        <Moon className="w-[18px] h-[18px] text-white" />
      ) : (
        <Sun className="w-[18px] h-[18px] text-gray-800" />
      )}
    </button>
  )
}
