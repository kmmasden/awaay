import { useState } from 'react'
import type { ImportRow, Member } from '../../types'
import { formatDate } from '../../utils/dates'

interface DuplicateReviewProps {
  rows: ImportRow[]
  existingMembers: Member[]
  onBack: () => void
  onConfirm: (updatedRows: ImportRow[]) => void
}

type DuplicateAction = 'skip' | 'update' | 'add'

export function DuplicateReview({ rows, existingMembers, onBack, onConfirm }: DuplicateReviewProps) {
  const dupRows = rows.filter(r => r.duplicateOf)
  const memberMap = Object.fromEntries(existingMembers.map(m => [m.id, m]))

  const [decisions, setDecisions] = useState<Record<number, DuplicateAction>>(
    Object.fromEntries(dupRows.map((_, i) => [i, 'skip']))
  )

  const setDecision = (idx: number, action: DuplicateAction) => {
    setDecisions(d => ({ ...d, [idx]: action }))
  }

  const handleConfirm = () => {
    let dupIdx = 0
    const updated = rows.map(row => {
      if (!row.duplicateOf) return row
      const action = decisions[dupIdx++] as DuplicateAction
      return { ...row, action: action as ImportRow['action'] }
    })
    onConfirm(updated)
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Review Possible Duplicates</h3>
      <p className="text-gray-600 text-[16px] mb-5">
        We found {dupRows.length} record{dupRows.length !== 1 ? 's' : ''} that may already exist.
        For each one, choose what to do.
      </p>

      <div className="space-y-6 mb-6 max-h-96 overflow-y-auto">
        {dupRows.map((row, i) => {
          const existing = row.duplicateOf ? memberMap[row.duplicateOf] : null
          if (!existing) return null
          return (
            <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <p className="font-semibold text-gray-700 text-[16px]">
                  Possible duplicate #{i + 1}: <strong>{row.mapped.firstName} {row.mapped.lastName}</strong>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-0">
                <div className="p-4 border-r border-gray-100">
                  <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wide mb-2">In Your Spreadsheet</p>
                  <CompareField label="Name" value={`${row.mapped.firstName ?? ''} ${row.mapped.lastName ?? ''}`} />
                  <CompareField label="Email" value={row.mapped.email} />
                  <CompareField label="Phone" value={row.mapped.phone} />
                  <CompareField label="Address" value={row.mapped.address} />
                  <CompareField label="Dues Paid" value={formatDate(row.mapped.lastDuesPaidDate)} />
                </div>
                <div className="p-4">
                  <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wide mb-2">Existing Record</p>
                  <CompareField label="Name" value={`${existing.firstName} ${existing.lastName}`} />
                  <CompareField label="Email" value={existing.email} />
                  <CompareField label="Phone" value={existing.phone} />
                  <CompareField label="Address" value={existing.address} />
                  <CompareField label="Dues Paid" value={formatDate(existing.lastDuesPaidDate)} />
                </div>
              </div>
              <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex gap-3 flex-wrap">
                <p className="text-[15px] font-semibold text-gray-700 mr-2 self-center">What would you like to do?</p>
                {(['skip', 'update', 'add'] as DuplicateAction[]).map(action => (
                  <label key={action} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`dup-${i}`}
                      value={action}
                      checked={decisions[i] === action}
                      onChange={() => setDecision(i, action)}
                      className="w-4 h-4"
                    />
                    <span className="text-[15px] font-medium text-gray-700">
                      {action === 'skip' ? 'Skip (keep existing)' : action === 'update' ? 'Update existing record' : 'Add as new member'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded border border-gray-300 text-gray-700 font-medium text-[16px] hover:bg-gray-50 min-h-[44px]"
        >
          Back
        </button>
        <button
          onClick={handleConfirm}
          className="px-6 py-2.5 rounded bg-[#1e3a5f] text-white font-semibold text-[16px] hover:bg-[#162d4a] min-h-[44px]"
        >
          Continue to Preview
        </button>
      </div>
    </div>
  )
}

function CompareField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="mb-2">
      <span className="text-[12px] text-gray-500 uppercase font-semibold">{label}: </span>
      <span className="text-[15px] text-gray-800">{value || '—'}</span>
    </div>
  )
}
