import { useRef, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = true,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // Focus Cancel by default (not the destructive action)
    cancelRef.current?.focus()
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
    >
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl p-6">
        <div className="flex items-start gap-4 mb-4">
          {danger && (
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
          )}
          <div>
            <h2 id="confirm-title" className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
            <p id="confirm-desc" className="text-gray-700 text-[17px] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="px-6 py-2.5 rounded border border-gray-300 text-gray-700 font-medium text-[17px] hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-[#1e3a5f] focus-visible:outline-offset-2"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2.5 rounded font-medium text-[17px] focus-visible:outline-2 focus-visible:outline-offset-2 ${
              danger
                ? 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600'
                : 'bg-[#1e3a5f] text-white hover:bg-[#162d4a] focus-visible:outline-[#1e3a5f]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
