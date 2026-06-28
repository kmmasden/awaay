import { useState, useRef, useEffect } from 'react'
import { Eye, MoreVertical, Pencil, DollarSign, Bell, UserX, Trash2 } from 'lucide-react'
import type { Member } from '../../types'
import { StatusBadge } from '../shared/StatusBadge'
import { DuesLabel } from '../shared/DuesLabel'
import { ConfirmDialog } from '../shared/ConfirmDialog'
import { formatDateShort } from '../../utils/dates'

interface MemberRowProps {
  member: Member
  isSelected: boolean
  isEven: boolean
  onSelect: (id: string, checked: boolean) => void
  onView: (id: string) => void
  onEdit: (id: string) => void
  onRecordPayment: (id: string) => void
  onSendReminder: (id: string) => void
  onMarkFormer: (id: string) => void
  onDelete: (id: string) => void
}

export function MemberRow({
  member,
  isSelected,
  isEven,
  onSelect,
  onView,
  onEdit,
  onRecordPayment,
  onSendReminder,
  onMarkFormer,
  onDelete,
}: MemberRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fullName = `${member.firstName} ${member.lastName}`
  const rowBg = isSelected
    ? 'bg-[#eef2f7]'
    : isEven
    ? 'bg-white'
    : 'bg-gray-50'

  return (
    <>
      <tr className={`${rowBg} hover:bg-[#f5f8fc] border-b border-gray-100`}>
        <td className="px-4 py-4 w-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={e => onSelect(member.id, e.target.checked)}
            aria-label={`Select ${fullName}`}
            className="w-5 h-5 rounded border-gray-400 text-[#1e3a5f] cursor-pointer"
          />
        </td>
        <td className="px-4 py-4">
          <button
            onClick={() => onView(member.id)}
            className="text-[#1e3a5f] font-semibold text-[17px] hover:underline text-left"
            aria-label={`View ${fullName}'s profile`}
          >
            {fullName}
          </button>
          <div className="text-sm text-gray-500 mt-0.5">{member.city}, {member.state}</div>
        </td>
        <td className="px-4 py-4 text-[16px] text-gray-800">
          <a href={`tel:${member.phone}`} className="hover:underline hover:text-[#1e3a5f]">
            {member.phone || '—'}
          </a>
        </td>
        <td className="px-4 py-4 text-[16px] text-gray-800 max-w-[200px]">
          <a href={`mailto:${member.email}`} className="hover:underline hover:text-[#1e3a5f] break-all">
            {member.email || '—'}
          </a>
        </td>
        <td className="px-4 py-4">
          <StatusBadge status={member.memberStatus} />
        </td>
        <td className="px-4 py-4 text-[16px]">
          <div>
            <DuesLabel duesRenewalDate={member.duesRenewalDate} />
          </div>
          {member.duesRenewalDate && (
            <div className="text-sm text-gray-400 mt-0.5">{formatDateShort(member.duesRenewalDate)}</div>
          )}
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onView(member.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#1e3a5f] text-[#1e3a5f] text-[15px] font-medium hover:bg-[#eef2f7] min-h-[36px]"
              aria-label={`View ${fullName}`}
            >
              <Eye size={15} aria-hidden="true" />
              View
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                aria-haspopup="true"
                aria-expanded={menuOpen}
                aria-label={`More actions for ${fullName}`}
                className="p-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <MoreVertical size={18} aria-hidden="true" />
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]"
                  role="menu"
                  aria-label={`Actions for ${fullName}`}
                >
                  <ActionItem icon={<Pencil size={16} />} label="Edit Member" onClick={() => { setMenuOpen(false); onEdit(member.id) }} />
                  <ActionItem icon={<DollarSign size={16} />} label="Record Dues Payment" onClick={() => { setMenuOpen(false); onRecordPayment(member.id) }} />
                  <ActionItem icon={<Bell size={16} />} label="Send Dues Reminder" onClick={() => { setMenuOpen(false); onSendReminder(member.id) }} />
                  <ActionItem icon={<UserX size={16} />} label="Mark as Former" onClick={() => { setMenuOpen(false); onMarkFormer(member.id) }} />
                  <div className="border-t border-gray-100 my-1" />
                  <ActionItem
                    icon={<Trash2 size={16} />}
                    label="Delete Member"
                    onClick={() => { setMenuOpen(false); setShowDelete(true) }}
                    danger
                  />
                </div>
              )}
            </div>
          </div>
        </td>
      </tr>

      {showDelete && (
        <ConfirmDialog
          title={`Delete ${fullName}?`}
          message={`This permanently removes ${fullName}'s membership record. This action cannot be undone. Consider marking them as "Former" instead.`}
          confirmLabel="Delete Member"
          onConfirm={() => { setShowDelete(false); onDelete(member.id) }}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </>
  )
}

function ActionItem({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-[16px] hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
        danger ? 'text-red-600' : 'text-gray-700'
      }`}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </button>
  )
}
