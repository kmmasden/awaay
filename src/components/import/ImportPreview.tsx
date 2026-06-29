import { useState } from 'react'
import { AlertTriangle, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ImportRow } from '../../types'

const PAGE_SIZE = 50

type ActiveFilter = 'add' | 'warn' | 'skip' | 'duplicate' | 'update' | null

interface ImportPreviewProps {
  rows: ImportRow[]
  onBack: () => void
  onConfirm: () => void
  onOverrideRow: (index: number) => void
}

export function ImportPreview({ rows, onBack, onConfirm, onOverrideRow }: ImportPreviewProps) {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null)
  const [page, setPage] = useState(0)

  const addCount = rows.filter(r => r.action === 'add').length
  const updateCount = rows.filter(r => r.action === 'update').length
  const errorSkipCount = rows.filter(r => r.action === 'skip' && !r.duplicateOf).length
  const dupSkipCount = rows.filter(r => r.action === 'skip' && r.duplicateOf).length
  const warnCount = rows.filter(r => r.warnings.length > 0 && r.action === 'add').length

  const filteredIndexed: { row: ImportRow; originalIndex: number }[] = rows
    .map((row, i) => ({ row, originalIndex: i }))
    .filter(({ row }) => {
      if (activeFilter === 'add') return row.action === 'add'
      if (activeFilter === 'warn') return row.action === 'add' && row.warnings.length > 0
      if (activeFilter === 'skip') return row.action === 'skip' && !row.duplicateOf
      if (activeFilter === 'duplicate') return row.action === 'skip' && !!row.duplicateOf
      if (activeFilter === 'update') return row.action === 'update'
      return true
    })

  const totalPages = Math.max(1, Math.ceil(filteredIndexed.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageSlice = filteredIndexed.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  const toggleFilter = (f: ActiveFilter) => {
    setActiveFilter(prev => prev === f ? null : f)
    setPage(0)
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Review Your Data</h3>
      <p className="text-gray-600 text-[16px] mb-4">
        {rows.length} row{rows.length !== 1 ? 's' : ''} found. Review the data and any issues below.
        {activeFilter && <span className="ml-1 text-[#1e3a5f] font-medium">Showing filtered results — click a button again to clear.</span>}
      </p>

      {/* Summary pills */}
      <div className="flex gap-3 flex-wrap mb-5">
        <FilterPill
          color="green"
          icon={<CheckCircle size={16} />}
          label={`${addCount} to add`}
          active={activeFilter === 'add'}
          onClick={() => toggleFilter('add')}
        />
        {updateCount > 0 && (
          <FilterPill
            color="blue"
            icon={<CheckCircle size={16} />}
            label={`${updateCount} to update`}
            active={activeFilter === 'update'}
            onClick={() => toggleFilter('update')}
          />
        )}
        {errorSkipCount > 0 && (
          <FilterPill
            color="red"
            icon={<XCircle size={16} />}
            label={`${errorSkipCount} skip due to errors`}
            active={activeFilter === 'skip'}
            onClick={() => toggleFilter('skip')}
          />
        )}
        {dupSkipCount > 0 && (
          <FilterPill
            color="gray"
            icon={<XCircle size={16} />}
            label={`${dupSkipCount} with existing info`}
            active={activeFilter === 'duplicate'}
            onClick={() => toggleFilter('duplicate')}
          />
        )}
        {warnCount > 0 && (
          <FilterPill
            color="amber"
            icon={<AlertTriangle size={16} />}
            label={`${warnCount} add with warnings`}
            active={activeFilter === 'warn'}
            onClick={() => toggleFilter('warn')}
          />
        )}
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
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
              {pageSlice.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-gray-500">No rows match this filter.</td>
                </tr>
              ) : (
                pageSlice.map(({ row, originalIndex }, i) => (
                  <tr key={originalIndex} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-1.5 items-start">
                        <ActionBadge action={row.action} isDuplicate={!!row.duplicateOf} />
                        {row.action === 'skip' && (
                          <button
                            onClick={() => onOverrideRow(originalIndex)}
                            className="text-[12px] font-medium text-[#1e3a5f] underline hover:text-[#162d4a] whitespace-nowrap"
                          >
                            Add anyway
                          </button>
                        )}
                      </div>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mb-5">
          <span className="text-[14px] text-gray-600">
            Showing {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filteredIndexed.length)} of {filteredIndexed.length} rows
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="p-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[14px] text-gray-700 font-medium">
              Page {safePage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={safePage === totalPages - 1}
              className="p-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded border border-gray-300 text-gray-700 font-medium text-[16px] hover:bg-gray-50 min-h-[44px]"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={rows.filter(r => r.action === 'add' || r.action === 'update').length === 0}
          className="px-6 py-2.5 rounded bg-[#1e3a5f] text-white font-semibold text-[16px] hover:bg-[#162d4a] min-h-[44px] disabled:opacity-50"
        >
          Continue to Confirm
        </button>
      </div>
    </div>
  )
}

function ActionBadge({ action, isDuplicate }: { action: ImportRow['action']; isDuplicate?: boolean }) {
  if (action === 'skip' && isDuplicate) {
    return (
      <span className="inline-block px-2 py-0.5 rounded text-[13px] font-semibold bg-gray-100 text-gray-600 border border-gray-300">
        Existing
      </span>
    )
  }
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

function FilterPill({
  color, icon, label, active, onClick,
}: {
  color: string
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  const base = {
    green: 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100',
    blue: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100',
    red: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
    amber: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
    gray: 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200',
  }[color] ?? ''
  const activeRing = {
    green: 'ring-2 ring-green-500',
    blue: 'ring-2 ring-blue-500',
    red: 'ring-2 ring-red-500',
    amber: 'ring-2 ring-amber-500',
    gray: 'ring-2 ring-gray-400',
  }[color] ?? ''
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[15px] font-medium transition-all ${base} ${active ? activeRing : ''}`}
      aria-pressed={active}
    >
      {icon} {label}
    </button>
  )
}
