import { getDuesLabel, getDuesStatus } from '../../utils/dates'

interface DuesLabelProps {
  duesRenewalDate?: string
}

export function DuesLabel({ duesRenewalDate }: DuesLabelProps) {
  const label = getDuesLabel(duesRenewalDate)
  const status = getDuesStatus(duesRenewalDate)

  const styles = {
    'Current': 'text-green-700',
    'Due Soon': 'text-amber-700 font-semibold',
    'Overdue': 'text-red-700 font-semibold',
    'Unknown': 'text-gray-500',
  }[status]

  return (
    <span className={`text-[15px] ${styles}`} aria-label={`Dues status: ${label}`}>
      {label}
    </span>
  )
}
