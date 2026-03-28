'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

const COMPLETE_MS = 320
const FADE_MS = 220
const MIN_VISIBLE_MS = 220

type LoaderState = 'idle' | 'loading' | 'finishing'

export function TopLoadingBar() {
  const pathname = usePathname()
  const routeKey = pathname

  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)
  const [progress, setProgress] = useState(0)

  const stateRef = useRef<LoaderState>('idle')
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef(0)
  const lastFrameRef = useRef(0)
  const completeTimeoutRef = useRef<number | null>(null)
  const fadeTimeoutRef = useRef<number | null>(null)
  const hideTimeoutRef = useRef<number | null>(null)
  const prevRouteKeyRef = useRef(routeKey)

  const clearTimeouts = useCallback(() => {
    if (completeTimeoutRef.current) window.clearTimeout(completeTimeoutRef.current)
    if (fadeTimeoutRef.current) window.clearTimeout(fadeTimeoutRef.current)
    if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current)
    completeTimeoutRef.current = null
    fadeTimeoutRef.current = null
    hideTimeoutRef.current = null
  }, [])

  const stopLoop = useCallback(() => {
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const step = useCallback((timestamp: number) => {
    if (stateRef.current !== 'loading') return

    if (lastFrameRef.current === 0) {
      lastFrameRef.current = timestamp
    }

    const delta = timestamp - lastFrameRef.current
    lastFrameRef.current = timestamp

    setProgress((prev) => {
      const speed =
        prev < 0.3 ? 0.0023 : prev < 0.8 ? 0.00065 : 0.0002
      const dynamic = 0.95 + Math.sin(timestamp / 160) * 0.08
      const next = prev + delta * speed * dynamic
      return Math.min(next, 0.88)
    })

    rafRef.current = window.requestAnimationFrame(step)
  }, [])

  const start = useCallback(() => {
    if (stateRef.current === 'loading') return

    clearTimeouts()
    stopLoop()

    stateRef.current = 'loading'
    startTimeRef.current = performance.now()
    lastFrameRef.current = 0

    setVisible(true)
    setFading(false)
    setProgress(0.04)

    rafRef.current = window.requestAnimationFrame(step)
  }, [clearTimeouts, step, stopLoop])

  const finish = useCallback(() => {
    if (stateRef.current === 'idle') return

    stateRef.current = 'finishing'
    stopLoop()

    const elapsed = performance.now() - startTimeRef.current
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed)

    completeTimeoutRef.current = window.setTimeout(() => {
      setProgress(1)

      fadeTimeoutRef.current = window.setTimeout(() => {
        setFading(true)

        hideTimeoutRef.current = window.setTimeout(() => {
          setVisible(false)
          setFading(false)
          setProgress(0)
          stateRef.current = 'idle'
        }, FADE_MS)
      }, COMPLETE_MS + 40)
    }, wait)
  }, [stopLoop])

  useEffect(() => {
    if (document.readyState === 'complete') return

    start()
    const onLoad = () => {
      window.setTimeout(() => finish(), 280)
    }

    window.addEventListener('load', onLoad, { once: true })
    return () => window.removeEventListener('load', onLoad)
  }, [finish, start])

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return
      if (event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const target = event.target as Element | null
      const anchor = target?.closest('a') as HTMLAnchorElement | null
      if (!anchor) return
      if (anchor.target && anchor.target !== '_self') return
      if (!anchor.href) return

      try {
        const url = new URL(anchor.href, window.location.href)
        if (url.origin !== window.location.origin) return
        if (url.pathname === window.location.pathname && url.search === window.location.search) return
        start()
      } catch {
        // ignore malformed URL
      }
    }

    const onPopState = () => start()
    const onCustomStart = () => start()
    const onCustomEnd = () => finish()

    document.addEventListener('click', onDocumentClick, true)
    window.addEventListener('popstate', onPopState)
    window.addEventListener('nf:loading-start', onCustomStart as EventListener)
    window.addEventListener('nf:loading-end', onCustomEnd as EventListener)

    return () => {
      document.removeEventListener('click', onDocumentClick, true)
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('nf:loading-start', onCustomStart as EventListener)
      window.removeEventListener('nf:loading-end', onCustomEnd as EventListener)
    }
  }, [finish, start])

  useEffect(() => {
    if (prevRouteKeyRef.current !== routeKey) {
      prevRouteKeyRef.current = routeKey
      finish()
    }
  }, [finish, routeKey])

  useEffect(() => {
    return () => {
      clearTimeouts()
      stopLoop()
    }
  }, [clearTimeouts, stopLoop])

  if (!visible) return null

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: 3,
        zIndex: 10000,
        pointerEvents: 'none',
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scaleX(${progress})`,
          transformOrigin: 'left center',
          transition:
            stateRef.current === 'finishing'
              ? `transform ${COMPLETE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
              : 'transform 120ms linear',
          background:
            'linear-gradient(90deg, var(--nf-loader-start), var(--nf-loader-end))',
          boxShadow:
            '0 0 10px var(--nf-loader-glow), 0 0 16px color-mix(in srgb, var(--nf-loader-end) 34%, transparent)',
          willChange: 'transform, opacity',
          filter: 'saturate(1.08)',
        }}
      />
    </div>
  )
}
