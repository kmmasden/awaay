import { Search, X, ArrowUpDown } from 'lucide-react'
import type { FilterState, MemberStatus, SortOption } from '../../types'

interface SearchFilterBarProps {
  filters: FilterState
  onChange: (f: Partial<FilterState>) => void
  onClear: () => void
  totalCount: number
  filteredCount: number
  cities: string[]
  states: string[]
}

const STATUS_OPTIONS: (MemberStatus | 'All')[] = ['All', 'Active', 'Outstanding Dues', 'Former']
const DUES_OPTIONS = ['All', 'Current', 'Due Soon', 'Overdue'] as const
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'lastName', label: 'Last Name' },
  { value: 'firstName', label: 'First Name' },
  { value: 'dateJoined', label: 'Date Joined' },
  { value: 'duesRenewalDate', label: 'Dues Renewal Date' },
  { value: 'memberStatus', label: 'Member Status' },
  { value: 'updatedAt', label: 'Most Recently Updated' },
]

export function SearchFilterBar({
  filters,
  onChange,
  onClear,
  totalCount,
  filteredCount,
  cities,
  states,
}: SearchFilterBarProps) {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.memberStatus !== 'All' ||
    filters.duesRenewal !== 'All' ||
    filters.city !== '' ||
    filters.state !== ''

  const labelClass = 'block text-[15px] font-semibold text-gray-700 mb-1'
  const selectClass =
    'block w-full rounded border border-gray-300 px-3 py-2 text-[16px] text-gray-800 bg-white focus:outline-2 focus:outline-[#1e3a5f] focus:outline-offset-2 min-h-[42px]'

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={filters.search}
          onChange={e => onChange({ search: e.target.value })}
          placeholder="Search by name, phone, email, or address"
          className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 text-[17px] text-gray-800 placeholder-gray-400 focus:outline-2 focus:outline-[#1e3a5f] focus:outline-offset-2 min-h-[52px]"
          aria-label="Search members"
        />
      </div>

      {/* Filter row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
        {/* Member Status */}
        <div>
          <label htmlFor="filter-status" className={labelClass}>Member Status</label>
          <select
            id="filter-status"
            value={filters.memberStatus}
            onChange={e => onChange({ memberStatus: e.target.value as MemberStatus | 'All' })}
            className={selectClass}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Dues Renewal */}
        <div>
          <label htmlFor="filter-dues" className={labelClass}>Dues Renewal</label>
          <select
            id="filter-dues"
            value={filters.duesRenewal}
            onChange={e => onChange({ duesRenewal: e.target.value as FilterState['duesRenewal'] })}
            className={selectClass}
          >
            {DUES_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label htmlFor="filter-city" className={labelClass}>City</label>
          <select
            id="filter-city"
            value={filters.city}
            onChange={e => onChange({ city: e.target.value })}
            className={selectClass}
          >
            <option value="">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* State */}
        <div>
          <label htmlFor="filter-state" className={labelClass}>State</label>
          <select
            id="filter-state"
            value={filters.state}
            onChange={e => onChange({ state: e.target.value })}
            className={selectClass}
          >
            <option value="">All States</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label htmlFor="sort-by" className={labelClass}>
            <span className="flex items-center gap-1">
              <ArrowUpDown size={14} aria-hidden="true" />
              Sort By
            </span>
          </label>
          <select
            id="sort-by"
            value={filters.sortBy}
            onChange={e => onChange({ sortBy: e.target.value as SortOption })}
            className={selectClass}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Clear Button + count */}
        <div className="flex flex-col gap-1">
          <div className="text-[15px] text-gray-600 font-medium min-h-[21px]">
            {filteredCount < totalCount
              ? `Showing ${filteredCount} of ${totalCount} members`
              : `${totalCount} members`}
          </div>
          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 px-3 py-2 rounded border border-gray-300 text-gray-700 text-[15px] font-medium hover:bg-gray-50 min-h-[42px]"
            >
              <X size={16} aria-hidden="true" />
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
