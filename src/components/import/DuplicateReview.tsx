import { useState, useMemo } from 'react'
import type { ImportRow, Member } from '../../types'
import { formatDate } from '../../utils/dates'

interface DuplicateReviewProps {
  rows: ImportRow[]
  existingMembers: Member[]
  onBack: () => void
  onConfirm: (updatedRows: ImportRow[]) => void
}

const COMPARABLE_FIELDS: { key: keyof Member; label: string; isDate?: boolean }[] = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'address', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'zip', label: 'ZIP' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'birthdate', label: 'Birthdate', isDate: true },
  { key: 'dateJoined', label: 'Date Joined', isDate: true },
  { key: 'lastDuesPaidDate', label: 'Dues Paid Date', isDate: true },
  { key: 'duesRenewalDate', label: 'Dues Renewal Date', isDate: true },
  { key: 'duesReminderSentDate', label: 'Reminder Sent Date', isDate: true },
  { key: 'memberStatus', label: 'Member Status' },
  { key: 'notes', label: 'Notes' },
]

function displayValue(val: unknown, isDate?: boolean): string {
  if (val === undefined || val === null || val === '') return '—'
  if (isDate) return formatDate(String(val)) || String(val)
  return String(val)
}

export function DuplicateReview({ rows, existingMembers, onBack, onConfirm }: DuplicateReviewProps) {
  const memberMap = useMemo(
    () => Object.fromEntries(existingMembers.map(m => [m.id, m])),
    [existingMembers]
  )

  // Find duplicate rows and compute their discrepant fields
  const rowsWithDiffs = useMemo(() => {
    return rows
      .map((row, rowsIndex) => {
        if (!row.duplicateOf) return null
        const existing = memberMap[row.duplicateOf]
        if (!existing) return null

        const diffs = COMPARABLE_FIELDS.filter(({ key, isDate }) => {
          const incoming = String(row.mapped[key] ?? '').trim()
          if (!incoming) return false
          const current = String(existing[key] ?? '').trim()
          // Normalize dates for comparison
          if (isDate) return formatDate(incoming) !== formatDate(current)
          return incoming.toLowerCase() !== current.toLowerCase()
        })

        if (diffs.length === 0) return null
        return { row, rowsIndex, diffs, existing }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
  }, [rows, memberMap])

  const exactDupCount = rows.filter(r => r.duplicateOf).length - rowsWithDiffs.length

  // decisions[rowsIndex][fieldKey] = 'existing' | 'incoming'
  // Default: all fields keep existing
  const [decisions, setDecisions] = useState<Record<number, Record<string, 'existing' | 'incoming'>>>(() =>
    Object.fromEntries(rowsWithDiffs.map(({ rowsIndex }) => [rowsIndex, {}]))
  )

  const setFieldDecision = (rowsIndex: number, field: string, choice: 'existing' | 'incoming') => {
    setDecisions(d => ({ ...d, [rowsIndex]: { ...d[rowsIndex], [field]: choice } }))
  }

  const setAllForRow = (rowsIndex: number, choice: 'existing' | 'incoming', fields: (keyof Member)[]) => {
    setDecisions(d => ({
      ...d,
      [rowsIndex]: Object.fromEntries(fields.map(f => [f, choice])),
    }))
  }

  const handleConfirm = () => {
    const diffIndexSet = new Set(rowsWithDiffs.map(r => r.rowsIndex))

    const updated = rows.map((row, i) => {
      if (!row.duplicateOf) return row

      // Exact duplicate — no discrepancies — auto skip
      if (!diffIndexSet.has(i)) return { ...row, action: 'skip' as const }

      const entry = rowsWithDiffs.find(r => r.rowsIndex === i)!
      const rowDecisions = decisions[i] ?? {}

      // Build merged mapped: start from incoming, overwrite with existing where chosen
      const mergedMapped = { ...row.mapped }
      let anyIncoming = false

      for (const { key } of entry.diffs) {
        const choice = rowDecisions[key as string] ?? 'existing'
        if (choice === 'existing') {
          (mergedMapped as Record<string, unknown>)[key] = entry.existing[key]
        } else {
          anyIncoming = true
        }
      }

      return {
        ...row,
        action: anyIncoming ? ('update' as const) : ('skip' as const),
        mapped: mergedMapped,
      }
    })

    onConfirm(updated)
  }

  if (rowsWithDiffs.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Review Possible Duplicates</h3>
        <p className="text-gray-600 text-[16px] mb-6">
          {exactDupCount} duplicate{exactDupCount !== 1 ? 's' : ''} found, but the spreadsheet data matches what's already on file — no discrepancies to review.
          These records will be skipped automatically.
        </p>
        <div className="flex gap-3">
          <button onClick={onBack} className="px-5 py-2.5 rounded border border-gray-300 text-gray-700 font-medium text-[16px] hover:bg-gray-50 min-h-[44px]">
            Back
          </button>
          <button onClick={handleConfirm} className="px-6 py-2.5 rounded bg-[#1e3a5f] text-white font-semibold text-[16px] hover:bg-[#162d4a] min-h-[44px]">
            Continue to Preview
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Review Discrepancies</h3>
      <p className="text-gray-600 text-[16px] mb-1">
        {rowsWithDiffs.length} record{rowsWithDiffs.length !== 1 ? 's' : ''} already exist with different information.
        For each field that differs, choose which value to keep.
      </p>
      {exactDupCount > 0 && (
        <p className="text-gray-500 text-[15px] mb-5">
          {exactDupCount} other duplicate{exactDupCount !== 1 ? 's' : ''} matched exactly and will be skipped automatically.
        </p>
      )}

      <div className="space-y-6 mb-6 max-h-[480px] overflow-y-auto pr-1">
        {rowsWithDiffs.map(({ row, rowsIndex, diffs, existing }, cardIdx) => {
          const rowDecisions = decisions[rowsIndex] ?? {}
          const allExisting = diffs.every(d => (rowDecisions[d.key as string] ?? 'existing') === 'existing')
          const allIncoming = diffs.every(d => (rowDecisions[d.key as string] ?? 'existing') === 'incoming')
          const diffKeys = diffs.map(d => d.key)

          return (
            <div key={rowsIndex} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Card header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="font-semibold text-gray-800 text-[16px]">
                    {existing.firstName} {existing.lastName}
                  </span>
                  <span className="ml-3 text-[14px] text-gray-500">
                    {diffs.length} field{diffs.length !== 1 ? 's' : ''} differ
                  </span>
                </div>
                {/* Quick-select buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setAllForRow(rowsIndex, 'existing', diffKeys)}
                    disabled={allExisting}
                    className="text-[13px] px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                  >
                    Keep all existing
                  </button>
                  <button
                    onClick={() => setAllForRow(rowsIndex, 'incoming', diffKeys)}
                    disabled={allIncoming}
                    className="text-[13px] px-3 py-1 rounded border border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#eef2f7] disabled:opacity-40"
                  >
                    Use all new
                  </button>
                </div>
              </div>

              {/* Field comparison table */}
              <div className="overflow-x-auto">
                <table className="w-full text-[14px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-2 text-left font-semibold text-gray-500 w-32">Field</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-gray-400 inline-block" />
                          Keep existing
                        </span>
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-[#1e3a5f]">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-[#1e3a5f] inline-block" />
                          Use new info
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {diffs.map(({ key, label, isDate }, fieldIdx) => {
                      const choice = rowDecisions[key as string] ?? 'existing'
                      const existingVal = displayValue(existing[key], isDate)
                      const incomingVal = displayValue(row.mapped[key], isDate)
                      const rowBg = fieldIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'

                      return (
                        <tr key={key as string} className={rowBg}>
                          <td className="px-4 py-3 font-medium text-gray-500 whitespace-nowrap">{label}</td>
                          <td className="px-4 py-3">
                            <label className="flex items-start gap-2.5 cursor-pointer">
                              <input
                                type="radio"
                                name={`field-${rowsIndex}-${key as string}`}
                                value="existing"
                                checked={choice === 'existing'}
                                onChange={() => setFieldDecision(rowsIndex, key as string, 'existing')}
                                className="mt-0.5 w-4 h-4 accent-gray-500 flex-shrink-0"
                              />
                              <span className={`text-[14px] ${choice === 'existing' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                {existingVal}
                              </span>
                            </label>
                          </td>
                          <td className="px-4 py-3">
                            <label className="flex items-start gap-2.5 cursor-pointer">
                              <input
                                type="radio"
                                name={`field-${rowsIndex}-${key as string}`}
                                value="incoming"
                                checked={choice === 'incoming'}
                                onChange={() => setFieldDecision(rowsIndex, key as string, 'incoming')}
                                className="mt-0.5 w-4 h-4 accent-[#1e3a5f] flex-shrink-0"
                              />
                              <span className={`text-[14px] ${choice === 'incoming' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                {incomingVal}
                              </span>
                            </label>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Per-card outcome indicator */}
              <div className="bg-gray-50 border-t border-gray-100 px-4 py-2 text-[13px] text-gray-500">
                {allExisting
                  ? 'No changes will be made to this record.'
                  : `This record will be updated with ${diffs.filter(d => (rowDecisions[d.key as string] ?? 'existing') === 'incoming').length} new value${diffs.filter(d => (rowDecisions[d.key as string] ?? 'existing') === 'incoming').length !== 1 ? 's' : ''}.`
                }
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
