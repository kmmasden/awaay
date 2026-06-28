import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
}

export function FormField({ label, htmlFor, required, error, hint, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-[16px] font-semibold text-gray-800">
        {label}
        {required && <span className="text-red-600 ml-1" aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {hint && <p className="text-sm text-gray-500 -mt-0.5">{hint}</p>}
      {children}
      {error && (
        <p className="text-red-600 text-[15px] mt-0.5" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  )
}

export const inputClass =
  'w-full rounded border border-gray-300 px-3 py-2.5 text-[17px] text-gray-900 focus:outline-2 focus:outline-[#1e3a5f] focus:outline-offset-2 min-h-[46px] bg-white'

export const selectClass =
  'w-full rounded border border-gray-300 px-3 py-2.5 text-[17px] text-gray-900 focus:outline-2 focus:outline-[#1e3a5f] focus:outline-offset-2 min-h-[46px] bg-white'
