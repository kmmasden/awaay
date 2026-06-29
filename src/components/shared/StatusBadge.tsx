import type { MemberStatus } from '../../types'

interface StatusBadgeProps {
  status: MemberStatus
  size?: 'sm' | 'md'
}

const STATUS_STYLES: Record<MemberStatus, string> = {
  'Active': 'bg-green-50 text-green-800 border border-green-300',
  'Outstanding Dues': 'bg-amber-50 text-amber-800 border border-amber-300',
  'Former': 'bg-gray-100 text-gray-700 border border-gray-300',
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClass = size === 'sm'
    ? 'text-sm px-2 py-0.5'
    : 'text-[15px] px-3 py-1'

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full whitespace-nowrap ${STATUS_STYLES[status]} ${sizeClass}`}
      aria-label={`Member status: ${status}`}
    >
      {status}
    </span>
  )
}
