import { useState } from 'react'
import { Download, UserCog, Bell, Trash2, X } from 'lucide-react'
import type { Member, MemberStatus } from '../../types'
import { ConfirmDialog } from '../shared/ConfirmDialog'
import { exportToExcel } from '../../utils/export'

interface BulkActionBarProps {
  selected: Member[]
  onClearSelection: () => void
  onChangeStatus: (ids: string[], status: MemberStatus) => void
  onSendReminder: (ids: string[]) => void
  onDelete: (ids: string[]) => void
}

export function BulkActionBar({
  selected,
  onClearSelection,
  onChangeStatus,
  onSendReminder,
  onDelete,
}: BulkActionBarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  const count = selected.length

  return (
    <>
      <div className="bg-[#eef2f7] border border-[#adc1dd] rounded-lg px-5 py-3 flex items-center gap-4 flex-wrap">
        <span className="font-semibold text-[#1e3a5f] text-[17px]">
          {count} member{count !== 1 ? 's' : ''} selected
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportToExcel(selected, 'dads-club-selected.xlsx')}
            className="flex items-center gap-2 px-4 py-2 rounded border border-[#1e3a5f] text-[#1e3a5f] bg-white font-medium text-[15px] hover:bg-[#eef2f7] min-h-[40px]"
          >
            <Download size={16} aria-hidden="true" />
            Export Selected
          </button>

          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(v => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded border border-[#1e3a5f] text-[#1e3a5f] bg-white font-medium text-[15px] hover:bg-[#eef2f7] min-h-[40px]"
            >
              <UserCog size={16} aria-hidden="true" />
              Change Status
            </button>
            {showStatusMenu && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[180px]">
                {(['Active', 'Outstanding Dues', 'Former'] as MemberStatus[]).map(s => (
                  <button
                    key={s}
                    onClick={() => { onChangeStatus(selected.map(m => m.id), s); setShowStatusMenu(false) }}
                    className="w-full text-left px-4 py-3 text-[16px] text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onSendReminder(selected.map(m => m.id))}
            className="flex items-center gap-2 px-4 py-2 rounded border border-[#1e3a5f] text-[#1e3a5f] bg-white font-medium text-[15px] hover:bg-[#eef2f7] min-h-[40px]"
          >
            <Bell size={16} aria-hidden="true" />
            Send Reminder
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded border border-red-300 text-red-700 bg-white font-medium text-[15px] hover:bg-red-50 min-h-[40px]"
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete Selected
          </button>
        </div>

        <button
          onClick={onClearSelection}
          className="ml-auto p-1 text-gray-500 hover:text-gray-800 rounded"
          aria-label="Clear selection"
        >
          <X size={20} />
        </button>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title={`Delete ${count} member${count !== 1 ? 's' : ''}?`}
          message={`This will permanently remove ${count === 1 ? 'this member' : `these ${count} members`} from the records. This action cannot be undone. Consider changing their status to "Former" instead.`}
          confirmLabel={`Delete ${count} Member${count !== 1 ? 's' : ''}`}
          onConfirm={() => { setShowDeleteConfirm(false); onDelete(selected.map(m => m.id)) }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  )
}
