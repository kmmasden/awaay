import { useState, useRef, useEffect } from 'react'
import { UserPlus, Upload, Download, ChevronDown } from 'lucide-react'
import type { Member } from '../../types'
import { exportToExcel } from '../../utils/export'

interface PageHeaderProps {
  onAddMember: () => void
  onImport: () => void
  allMembers: Member[]
  filteredMembers: Member[]
  selectedMembers: Member[]
}

export function PageHeader({
  onAddMember,
  onImport,
  allMembers,
  filteredMembers,
  selectedMembers,
}: PageHeaderProps) {
  const [exportOpen, setExportOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExportOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleExport = (type: 'all' | 'filtered' | 'selected') => {
    setExportOpen(false)
    const map = {
      all: { members: allMembers, name: 'awyw-all-members.xlsx' },
      filtered: { members: filteredMembers, name: 'awyw-filtered-members.xlsx' },
      selected: { members: selectedMembers, name: 'awyw-selected-members.xlsx' },
    }
    const { members, name } = map[type]
    if (members.length === 0) return
    exportToExcel(members, name)
  }

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Membership Management</h1>
          <p className="text-gray-600 text-[17px]">View, update, and manage All Wool & A Yard Wide members.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Import */}
          <button
            onClick={onImport}
            className="flex items-center gap-2 px-4 py-2.5 rounded border border-gray-300 text-gray-700 font-medium text-[16px] hover:bg-gray-50 bg-white min-h-[44px]"
          >
            <Upload size={18} aria-hidden="true" />
            Import Spreadsheet
          </button>

          {/* Export */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setExportOpen(v => !v)}
              aria-haspopup="true"
              aria-expanded={exportOpen}
              className="flex items-center gap-2 px-4 py-2.5 rounded border border-gray-300 text-gray-700 font-medium text-[16px] hover:bg-gray-50 bg-white min-h-[44px]"
            >
              <Download size={18} aria-hidden="true" />
              Export to Excel
              <ChevronDown size={16} aria-hidden="true" className={`transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
            </button>
            {exportOpen && (
              <div
                className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[220px]"
                role="menu"
              >
                <button
                  onClick={() => handleExport('all')}
                  className="w-full text-left px-4 py-3 text-[16px] text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  role="menuitem"
                >
                  Export All Members ({allMembers.length})
                </button>
                <button
                  onClick={() => handleExport('filtered')}
                  className="w-full text-left px-4 py-3 text-[16px] text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                  role="menuitem"
                >
                  Export Filtered Results ({filteredMembers.length})
                </button>
                <button
                  onClick={() => handleExport('selected')}
                  disabled={selectedMembers.length === 0}
                  className="w-full text-left px-4 py-3 text-[16px] text-gray-700 hover:bg-gray-50 rounded-b-lg border-t border-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  role="menuitem"
                >
                  Export Selected ({selectedMembers.length})
                </button>
              </div>
            )}
          </div>

          {/* Add New Member */}
          <button
            onClick={onAddMember}
            className="flex items-center gap-2 px-5 py-2.5 rounded bg-[#1e3a5f] text-white font-semibold text-[16px] hover:bg-[#162d4a] min-h-[44px]"
          >
            <UserPlus size={18} aria-hidden="true" />
            Add New Member
          </button>
        </div>
      </div>
    </div>
  )
}
