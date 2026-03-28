'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'
type ThemeAttribute = 'class' | `data-${string}`

type ThemeProviderProps = {
  children: ReactNode
  attribute?: ThemeAttribute
  defaultTheme?: Theme
  enableSystem?: boolean
  storageKey?: string
  value?: Partial<Record<'light' | 'dark', string>>
}

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)
const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)'

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(SYSTEM_DARK_QUERY).matches ? 'dark' : 'light'
}

function resolveTheme(theme: Theme, enableSystem: boolean): ResolvedTheme {
  if (theme === 'system' && enableSystem) {
    return getSystemTheme()
  }
  return theme === 'light' ? 'light' : 'dark'
}

function applyTheme(
  attribute: ThemeAttribute,
  theme: ResolvedTheme,
  value?: Partial<Record<'light' | 'dark', string>>
) {
  const root = document.documentElement
  const mappedTheme = value?.[theme] ?? theme

  if (attribute === 'class') {
    const allClasses = [value?.light ?? 'light', value?.dark ?? 'dark']
    root.classList.remove(...allClasses)
    root.classList.add(mappedTheme)
    root.style.colorScheme = theme
    return
  }

  root.setAttribute(attribute, mappedTheme)
  root.style.colorScheme = theme
}

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'dark',
  enableSystem = true,
  storageKey = 'theme',
  value,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const storedTheme = window.localStorage.getItem(storageKey)
      if (isTheme(storedTheme)) {
        setThemeState(storedTheme)
      }
    } catch {
      // Ignore localStorage failures
    } finally {
      setMounted(true)
    }
  }, [storageKey])

  const resolvedTheme = useMemo(
    () => resolveTheme(theme, enableSystem),
    [theme, enableSystem]
  )

  useEffect(() => {
    if (!mounted) return
    applyTheme(attribute, resolvedTheme, value)
  }, [mounted, attribute, resolvedTheme, value])

  useEffect(() => {
    if (!enableSystem || theme !== 'system') return

    const mediaQuery = window.matchMedia(SYSTEM_DARK_QUERY)
    const onChange = () => applyTheme(attribute, getSystemTheme(), value)

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', onChange)
      return () => mediaQuery.removeEventListener('change', onChange)
    }

    mediaQuery.addListener(onChange)
    return () => mediaQuery.removeListener(onChange)
  }, [attribute, enableSystem, theme, value])

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme)
      try {
        window.localStorage.setItem(storageKey, nextTheme)
      } catch {
        // Ignore localStorage failures
      }
    },
    [storageKey]
  )

  const contextValue = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme]
  )

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
