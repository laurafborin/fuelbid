'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

const ToastContext = createContext<{
  show: (message: string, type?: 'success' | 'error' | 'info') => void
}>({ show: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

function ToastMessage({ toast, onRemove }: { toast: ToastItem; onRemove: () => void }) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const duration = 3000
    const interval = 30
    const step = (interval / duration) * 100
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(timer)
          onRemove()
          return 0
        }
        return prev - step
      })
    }, interval)
    return () => clearInterval(timer)
  }, [onRemove])

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  const icons = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
  }

  const barColors = {
    success: 'bg-green-400',
    error: 'bg-red-400',
    info: 'bg-blue-400',
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border px-4 py-3 text-sm shadow-lg animate-[slideIn_0.3s_ease-out] ${styles[toast.type]}`}>
      <div className="flex items-center gap-2">
        <span className="font-bold">{icons[toast.type]}</span>
        <span>{toast.message}</span>
      </div>
      <div className="absolute bottom-0 left-0 h-0.5 transition-all" style={{ width: `${progress}%` }}>
        <div className={`h-full ${barColors[toast.type]}`} />
      </div>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  let counter = 0

  const show = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = ++counter
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map(toast => (
          <ToastMessage key={toast.id} toast={toast} onRemove={() => remove(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
