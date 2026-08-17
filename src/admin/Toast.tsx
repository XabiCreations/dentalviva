import { useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export interface ToastData {
  message: string
  type: 'success' | 'error'
}

interface ToastProps extends ToastData {
  onDismiss: () => void
}

export function Toast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [onDismiss])

  const isSuccess = type === 'success'

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-card',
        'border text-body-sm font-medium',
        isSuccess
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-red-50 border-red-200 text-red-800',
      ].join(' ')}
    >
      {isSuccess
        ? <CheckCircle size={17} strokeWidth={2} className="shrink-0 text-emerald-500" />
        : <XCircle    size={17} strokeWidth={2} className="shrink-0 text-red-500" />
      }
      <span>{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Cerrar notificación"
        className="ml-1 p-0.5 rounded hover:bg-black/5 transition-colors"
      >
        <X size={13} />
      </button>
    </div>
  )
}
