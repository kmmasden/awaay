import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Member, MemberStatus } from '../../types'
import { MemberRow } from './MemberRow'
import { BulkActionBar } from './BulkActionBar'

const PAGE_SIZE = 10

interface MemberTableProps {
  members: Member[]
  onView: (id: string) => void
  onEdit: (id: string) => void
  onRecordPayment: (id: string) => void
  onSendReminder: (ids: string[]) => void
  onMarkFormer: (id: string) => void
  onDelete: (ids: string[]) => void
  onChangeStatus: (ids: string[], status: MemberStatus) => void
}

export function MemberTable({
  members,
  onView,
  onEdit,
  onRecordPayment,
  onSendReminder,
  onMarkFormer,
  onDelete,
  onChangeStatus,
}: MemberTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(members.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageMembers = members.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const allPageSelected = pageMembers.length > 0 && pageMembers.every(m => selectedIds.has(m.id))
  const someSelected = pageMembers.some(m => selectedIds.has(m.id))
  const selectedMembers = members.filter(m => selectedIds.has(m.id))

  const toggleRow = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      checked ? next.add(id) : next.delete(id)
      return next
    })
  }

  const toggleAll = (checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      pageMembers.forEach(m => checked ? next.add(m.id) : next.delete(m.id))
      return next
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  const handleDelete = (ids: string[]) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      ids.forEach(id => next.delete(id))
      return next
    })
    onDelete(ids)
  }

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 py-16 text-center">
        <p className="text-gray-500 text-[18px]">No members match your search or filters.</p>
        <p className="text-gray-400 text-[16px] mt-2">Try clearing the filters or searching for something else.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {selectedIds.size > 0 && (
        <BulkActionBar
          selected={selectedMembers}
          onClearSelection={clearSelection}
          onChangeStatus={(ids, status) => { clearSelection(); onChangeStatus(ids, status) }}
          onSendReminder={(ids) => { onSendReminder(ids); clearSelection() }}
          onDelete={(ids) => handleDelete(ids)}
        />
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" aria-label="Members list">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="px-4 py-3 w-10 text-left">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    ref={el => { if (el) el.indeterminate = someSelected && !allPageSelected }}
                    onChange={e => toggleAll(e.target.checked)}
                    aria-label="Select all members on this page"
                    className="w-5 h-5 rounded border-gray-400 text-[#1e3a5f] cursor-pointer"
                  />
                </th>
                <Th>Member Name</Th>
                <Th>Phone</Th>
                <Th>Email</Th>
                <Th>Status</Th>
                <Th>Dues Renewal</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {pageMembers.map((m, i) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  isSelected={selectedIds.has(m.id)}
                  isEven={i % 2 === 0}
                  onSelect={toggleRow}
                  onView={onView}
                  onEdit={onEdit}
                  onRecordPayment={onRecordPayment}
                  onSendReminder={id => onSendReminder([id])}
                  onMarkFormer={onMarkFormer}
                  onDelete={id => handleDelete([id])}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-[15px] text-gray-600">
              Page {safePage} of {totalPages} &mdash; {members.length} total members
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex items-center gap-1 px-3 py-2 rounded border border-gray-300 text-gray-700 text-[15px] font-medium hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed min-h-[40px]"
                aria-label="Previous page"
              >
                <ChevronLeft size={18} aria-hidden="true" />
                Previous
              </button>

              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum = i + 1
                  if (totalPages > 5) {
                    if (safePage <= 3) pageNum = i + 1
                    else if (safePage >= totalPages - 2) pageNum = totalPages - 4 + i
                    else pageNum = safePage - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded text-[15px] font-medium ${
                        pageNum === safePage
                          ? 'bg-[#1e3a5f] text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                      aria-label={`Page ${pageNum}`}
                      aria-current={pageNum === safePage ? 'page' : undefined}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded border border-gray-300 text-gray-700 text-[15px] font-medium hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed min-h-[40px]"
                aria-label="Next page"
              >
                Next
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th scope="col" className="px-4 py-3 text-left text-[15px] font-semibold text-gray-700 uppercase tracking-wide">
      {children}
    </th>
  )
}
