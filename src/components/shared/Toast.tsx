import { useEffect } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import type { ToastMessage } from '../../types'

interface ToastProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 5000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const styles = {
    success: { bg: 'bg-green-50 border-green-300', text: 'text-green-800', icon: <CheckCircle size={20} className="text-green-600 flex-shrink-0" /> },
    error: { bg: 'bg-red-50 border-red-300', text: 'text-red-800', icon: <XCircle size={20} className="text-red-600 flex-shrink-0" /> },
    info: { bg: 'bg-blue-50 border-blue-300', text: 'text-blue-800', icon: <Info size={20} className="text-blue-600 flex-shrink-0" /> },
  }[toast.type]

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border shadow-md ${styles.bg}`} role="status">
      {styles.icon}
      <p className={`flex-1 font-medium text-[16px] leading-snug ${styles.text}`}>{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className={`flex-shrink-0 p-0.5 rounded ${styles.text} hover:opacity-75`}
        aria-label="Dismiss notification"
      >
        <X size={18} />
      </button>
    </div>
  )
}
