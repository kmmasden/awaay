import type { Member } from '../../types'
import { APP_FIELDS } from '../../utils/import'

interface ColumnMapperProps {
  headers: string[]
  mapping: Record<string, keyof Member | ''>
  onChange: (m: Record<string, keyof Member | ''>) => void
  onBack: () => void
  onConfirm: () => void
  rowCount: number
  fileName: string
}

export function ColumnMapper({ headers, mapping, onChange, onBack, onConfirm, rowCount, fileName }: ColumnMapperProps) {
  const setField = (header: string, field: keyof Member | '') => {
    onChange({ ...mapping, [header]: field })
  }

  const mappedFields = new Set(Object.values(mapping).filter(Boolean))
  const missingRequired = APP_FIELDS
    .filter(f => f.required && !mappedFields.has(f.key as keyof Member))
    .map(f => f.label)

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-1">Match Columns to Fields</h3>
      <p className="text-gray-600 text-[16px] mb-1">
        File: <strong>{fileName}</strong> — {rowCount} rows detected
      </p>
      <p className="text-gray-600 text-[16px] mb-5">
        We've matched your column names automatically. Please review and adjust if needed.
      </p>

      {missingRequired.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded p-3 mb-4 text-amber-800 text-[15px]">
          <strong>Required fields not yet matched:</strong> {missingRequired.join(', ')}
        </div>
      )}

      <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
        <table className="w-full" aria-label="Column mapping">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th scope="col" className="px-4 py-3 text-left text-[15px] font-semibold text-gray-700">Your Column</th>
              <th scope="col" className="px-4 py-3 text-left text-[15px] font-semibold text-gray-700">Maps To</th>
            </tr>
          </thead>
          <tbody>
            {headers.map((h, i) => (
              <tr key={h} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-[16px] text-gray-800 font-medium">{h}</td>
                <td className="px-4 py-3">
                  <select
                    value={mapping[h] ?? ''}
                    onChange={e => setField(h, e.target.value as keyof Member | '')}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-[16px] bg-white focus:outline-2 focus:outline-[#1e3a5f] focus:outline-offset-2"
                    aria-label={`Map column "${h}" to application field`}
                  >
                    {APP_FIELDS.map(f => (
                      <option key={String(f.key)} value={String(f.key)}>{f.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded border border-gray-300 text-gray-700 font-medium text-[16px] hover:bg-gray-50 min-h-[44px]"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={missingRequired.length > 0}
          className="px-6 py-2.5 rounded bg-[#1e3a5f] text-white font-semibold text-[16px] hover:bg-[#162d4a] min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Preview
        </button>
      </div>
    </div>
  )
}
