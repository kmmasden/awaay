import { Users, UserCheck, AlertCircle, UserX, HelpCircle } from 'lucide-react'
import type { Member, MemberStatus } from '../../types'
import { computeMemberStatus } from '../../utils/dates'

interface SummaryCardsProps {
  members: Member[]
  activeFilter: MemberStatus | 'All'
  onFilter: (status: MemberStatus | 'All') => void
}

export function SummaryCards({ members, activeFilter, onFilter }: SummaryCardsProps) {
  const total = members.filter(m => computeMemberStatus(m) !== 'Former').length
  const active = members.filter(m => computeMemberStatus(m) === 'Current').length
  const outstanding = members.filter(m => computeMemberStatus(m) === 'Delinquent').length
  const missingDues = members.filter(m => computeMemberStatus(m) === 'Missing dues info').length
  const former = members.filter(m => computeMemberStatus(m) === 'Former').length

  const cards = [
    {
      label: 'Total Members',
      value: total,
      icon: <Users size={24} className="text-[#1e3a5f]" />,
      filter: 'All' as const,
      activeColor: 'ring-2 ring-[#1e3a5f]',
      bg: 'bg-white',
    },
    {
      label: 'Current Members',
      value: active,
      icon: <UserCheck size={24} className="text-green-600" />,
      filter: 'Current' as const,
      activeColor: 'ring-2 ring-green-600',
      bg: 'bg-white',
    },
    {
      label: 'Delinquent',
      value: outstanding,
      icon: <AlertCircle size={24} className="text-amber-600" />,
      filter: 'Delinquent' as const,
      activeColor: 'ring-2 ring-amber-600',
      bg: 'bg-white',
    },
    {
      label: 'Missing Dues Info',
      value: missingDues,
      icon: <HelpCircle size={24} className="text-blue-500" />,
      filter: 'Missing dues info' as const,
      activeColor: 'ring-2 ring-blue-500',
      bg: 'bg-white',
    },
    {
      label: 'Former Members',
      value: former,
      icon: <UserX size={24} className="text-gray-500" />,
      filter: 'Former' as const,
      activeColor: 'ring-2 ring-gray-500',
      bg: 'bg-white',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map(card => {
        const isActive = activeFilter === card.filter
        return (
          <button
            key={card.label}
            onClick={() => onFilter(card.filter)}
            className={`${card.bg} rounded-lg border p-5 text-left hover:shadow-md transition-shadow cursor-pointer ${
              isActive ? card.activeColor : 'border-gray-200'
            }`}
            aria-pressed={isActive}
            aria-label={`Filter by ${card.label}: ${card.value} members`}
          >
            <div className="flex items-center justify-between mb-3">
              <span aria-hidden="true">{card.icon}</span>
              {isActive && (
                <span className="text-xs font-semibold text-[#1e3a5f] bg-[#eef2f7] px-2 py-0.5 rounded-full">
                  Filtered
                </span>
              )}
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{card.value}</div>
            <div className="text-[16px] text-gray-600 font-medium">{card.label}</div>
          </button>
        )
      })}
    </div>
  )
}
