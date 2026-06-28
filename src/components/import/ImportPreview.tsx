import type { ImportRow } from '../../types'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface ImportPreviewProps {
  rows: ImportRow[]
  onBack: () => void
  onConfirm: () => void
}

export function ImportPreview({ rows, onBack, onConfirm }: ImportPreviewProps) {
  const addCount = rows.filter(r => r.action === 'add').length
  const updateCount = rows.filter(r => r.action === 'update').length
  const skipCount = rows.filter(r => r.action === 'skip').length
  const warnCount = rows.filter(r => r.warnings.length > 0).length

  const previewRows = rows.slice(0, 50)

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Review Your Data</h3>
      <p className="text-gray-600 text-[16px] mb-4">
        Showing {Math.min(rows.length, 50)} of {rows.length} rows. Review the data and any issues found below.
      </p>

      {/* Summary pills */}
      <div className="flex gap-3 flex-wrap mb-5">
        <Pill color="green" icon={<CheckCircle size={16} />} label={`${addCount} to add`} />
        {updateCount > 0 && <Pill color="blue" icon={<CheckCircle size={16} />} label={`${updateCount} to update`} />}
        {skipCount > 0 && <Pill color="red" icon={<XCircle size={16} />} label={`${skipCount} to skip (errors)`} />}
        {warnCount > 0 && <Pill color="amber" icon={<AlertTriangle size={16} />} label={`${warnCount} with warnings`} />}
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-[14px]" aria-label="Import preview">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-3 py-2 text-left font-semibold text-gray-700">Status</th>
                <th scope="col" className="px-3 py-2 text-left font-semibold text-gray-700">First Name</th>
                <th scope="col" className="px-3 py-2 text-left font-semibold text-gray-700">Last Name</th>
                <th scope="col" className="px-3 py-2 text-left font-semibold text-gray-700">Email</th>
                <th scope="col" className="px-3 py-2 text-left font-semibold text-gray-700">Issues</th>
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2">
                    <ActionBadge action={row.action} />
                  </td>
                  <td className="px-3 py-2 text-gray-800">{row.mapped.firstName ?? <span className="text-red-500">Missing</span>}</td>
                  <td className="px-3 py-2 text-gray-800">{row.mapped.lastName ?? <span className="text-red-500">Missing</span>}</td>
                  <td className="px-3 py-2 text-gray-600">{row.mapped.email ?? '—'}</td>
                  <td className="px-3 py-2">
                    {row.errors.length > 0 && (
                      <ul className="list-disc pl-4 text-red-600">
                        {row.errors.map((e, j) => <li key={j}>{e}</li>)}
                      </ul>
                    )}
                    {row.warnings.length > 0 && (
                      <ul className="list-disc pl-4 text-amber-700">
                        {row.warnings.map((w, j) => <li key={j}>{w}</li>)}
                      </ul>
                    )}
                    {row.errors.length === 0 && row.warnings.length === 0 && (
                      <span className="text-green-600">✓ OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          disabled={addCount + updateCount === 0}
          className="px-6 py-2.5 rounded bg-[#1e3a5f] text-white font-semibold text-[16px] hover:bg-[#162d4a] min-h-[44px] disabled:opacity-50"
        >
          Continue to Confirm
        </button>
      </div>
    </div>
  )
}

function ActionBadge({ action }: { action: ImportRow['action'] }) {
  const s = {
    add: 'bg-green-50 text-green-800 border border-green-200',
    update: 'bg-blue-50 text-blue-800 border border-blue-200',
    skip: 'bg-red-50 text-red-700 border border-red-200',
    review: 'bg-amber-50 text-amber-800 border border-amber-200',
  }[action]
  const labels = { add: 'Add', update: 'Update', skip: 'Skip', review: 'Review' }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[13px] font-semibold ${s}`}>
      {labels[action]}
    </span>
  )
}

function Pill({ color, icon, label }: { color: string; icon: React.ReactNode; label: string }) {
  const s = {
    green: 'bg-green-50 text-green-800 border-green-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
  }[color] ?? ''
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[15px] font-medium ${s}`}>
      {icon} {label}
    </span>
  )
}
