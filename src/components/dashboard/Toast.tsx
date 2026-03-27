'use client'
import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: string
  type: ToastType
  title: string
  message?: string
}

let listeners: ((t: ToastItem[]) => void)[] = []
let toasts: ToastItem[] = []

const notify = () => listeners.forEach(l => l([...toasts]))

const addToast = (type: ToastType, title: string, message?: string) => {
  const id = Math.random().toString(36).slice(2)
  toasts = [...toasts, { id, type, title, message }]
  notify()
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id)
    notify()
  }, 3500)
}

export const toast = {
  success: (title: string, message?: string) => addToast('success', title, message),
  error: (title: string, message?: string) => addToast('error', title, message),
  info: (title: string, message?: string) => addToast('info', title, message),
  warning: (title: string, message?: string) => addToast('warning', title, message),
}

const COLORS: Record<ToastType, string> = {
  success: '#22c55e',
  error: '#ef4444',
  info: '#8b5cf6',
  warning: '#eab308',
}

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    listeners.push(setItems)
    return () => { listeners = listeners.filter(l => l !== setItems) }
  }, [])

  return (
    <div style={{
      position: 'fixed', top: 16, right: 16,
      zIndex: 9999, display: 'flex',
      flexDirection: 'column', gap: 8,
      pointerEvents: 'none',
    }}>
      {items.map(item => {
        const Icon = ICONS[item.type]
        const color = COLORS[item.type]
        return (
          <div key={item.id} style={{
            minWidth: 300, maxWidth: 380,
            background: '#1a1a1a', border: '1px solid #2a2a2a',
            borderLeft: `3px solid ${color}`, borderRadius: 10,
            padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'flex-start', gap: 10,
            pointerEvents: 'all', animation: 'slideInRight 0.3s ease',
          }}>
            <Icon size={16} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'white', fontWeight: 500 }}>{item.title}</div>
              {item.message && <div style={{ fontSize: 12, color: '#888888', marginTop: 2 }}>{item.message}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
