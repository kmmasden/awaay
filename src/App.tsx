import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { PageHeader } from './components/layout/PageHeader'
import { SummaryCards } from './components/members/SummaryCards'
import { SearchFilterBar } from './components/members/SearchFilterBar'
import { MemberTable } from './components/members/MemberTable'
import { MemberDetail } from './components/detail/MemberDetail'
import { MemberForm } from './components/forms/MemberForm'
import { ImportWizard } from './components/import/ImportWizard'
import type { ImportSummary } from './components/import/ImportWizard'
import { ToastContainer } from './components/shared/Toast'
import type { Member, FilterState, SortOption, AppView, ToastMessage, MemberStatus, ImportRow } from './types'
import { getDuesStatus, addOneYear, todayISO, computeMemberStatus } from './utils/dates'
import { supabase } from './lib/supabase'

type NavItem = 'Members' | 'Dues' | 'Reminders' | 'Reports' | 'Settings'

const DEFAULT_FILTERS: FilterState = {
  search: '',
  memberStatus: 'All',
  duesRenewal: 'All',
  city: '',
  state: '',
  sortBy: 'lastName',
  sortDir: 'asc',
}

function generateId() {
  return crypto.randomUUID()
}

function generateActivityId() {
  return crypto.randomUUID()
}

export default function App() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<AppView>({ type: 'members' })
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [navItem, setNavItem] = useState<NavItem>('Members')
  const [showImport, setShowImport] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const membersRef = useRef<Member[]>([])
  useEffect(() => { membersRef.current = members }, [members])

  useEffect(() => {
    supabase
      .from('members')
      .select('*')
      .order('lastName')
      .then(({ data, error }) => {
        if (error) console.error('Failed to load members:', error)
        if (data) setMembers(data as Member[])
        setLoading(false)
      })
  }, [])

  const cities = useMemo(() => [...new Set(members.map(m => m.city).filter(Boolean))].sort(), [members])
  const states = useMemo(() => [...new Set(members.map(m => m.state).filter(Boolean))].sort(), [members])

  const filteredMembers = useMemo(() => {
    let result = members

    const s = filters.search.toLowerCase()
    if (s) {
      result = result.filter(m =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(s) ||
        m.phone.toLowerCase().includes(s) ||
        m.email.toLowerCase().includes(s) ||
        m.address.toLowerCase().includes(s) ||
        m.city.toLowerCase().includes(s)
      )
    }

    if (filters.memberStatus !== 'All') {
      result = result.filter(m => computeMemberStatus(m) === filters.memberStatus)
    } else {
      result = result.filter(m => computeMemberStatus(m) !== 'Former')
    }

    if (filters.duesRenewal !== 'All') {
      result = result.filter(m => getDuesStatus(m.duesRenewalDate) === filters.duesRenewal)
    }

    if (filters.city) {
      result = result.filter(m => m.city === filters.city)
    }

    if (filters.state) {
      result = result.filter(m => m.state === filters.state)
    }

    const sortFns: Record<SortOption, (a: Member, b: Member) => number> = {
      lastName: (a, b) => a.lastName.localeCompare(b.lastName),
      firstName: (a, b) => a.firstName.localeCompare(b.firstName),
      dateJoined: (a, b) => (a.dateJoined ?? '').localeCompare(b.dateJoined ?? ''),
      duesRenewalDate: (a, b) => (a.duesRenewalDate ?? '').localeCompare(b.duesRenewalDate ?? ''),
      memberStatus: (a, b) => computeMemberStatus(a).localeCompare(computeMemberStatus(b)),
      updatedAt: (a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''),
    }

    result = [...result].sort(sortFns[filters.sortBy])
    return result
  }, [members, filters])

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = generateActivityId()
    setToasts(t => [...t, { id, type, message }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id))
  }, [])

  const updateMember = useCallback(async (id: string, changes: Partial<Member>, activityNote?: string) => {
    const m = membersRef.current.find(x => x.id === id)
    if (!m) return

    const activity = activityNote
      ? [...m.activity, { id: generateActivityId(), date: todayISO(), description: activityNote }]
      : m.activity
    const updated: Member = { ...m, ...changes, activity, updatedAt: todayISO() }

    setMembers(prev => prev.map(x => x.id === id ? updated : x))

    const { error } = await supabase.from('members').update(updated).eq('id', id)
    if (error) {
      addToast('error', 'Failed to save changes. Please try again.')
      setMembers(prev => prev.map(x => x.id === id ? m : x))
    }
  }, [addToast])

  const handleSaveMember = useCallback(async (data: Partial<Member>) => {
    if (view.type === 'edit-member') {
      await updateMember(view.memberId, data, 'Member information updated')
      addToast('success', 'Member information saved.')
      setView({ type: 'member-detail', memberId: view.memberId })
    } else if (view.type === 'add-member') {
      const newMember: Member = {
        id: generateId(),
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        birthdate: data.birthdate,
        memberStatus: data.memberStatus ?? 'Current',
        dateJoined: data.dateJoined ?? todayISO(),
        address: data.address ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        zip: data.zip ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        lastDuesPaidDate: data.lastDuesPaidDate,
        duesRenewalDate: data.duesRenewalDate,
        duesReminderSentDate: data.duesReminderSentDate,
        notes: data.notes ?? '',
        activity: [{ id: generateActivityId(), date: todayISO(), description: 'Member created' }],
        updatedAt: todayISO(),
      }
      setMembers(prev => [...prev, newMember])
      const { error } = await supabase.from('members').insert(newMember)
      if (error) {
        addToast('error', 'Failed to add member. Please try again.')
        setMembers(prev => prev.filter(m => m.id !== newMember.id))
        return
      }
      addToast('success', `${newMember.firstName} ${newMember.lastName} has been added as a new member.`)
      setView({ type: 'member-detail', memberId: newMember.id })
    }
  }, [view, updateMember, addToast])

  const handleRecordPayment = useCallback(async (memberId: string) => {
    const today = todayISO()
    const renewal = addOneYear(today)
    await updateMember(memberId, {
      lastDuesPaidDate: today,
      duesRenewalDate: renewal,
    }, 'Dues payment recorded')
    addToast('success', 'Dues payment recorded.')
  }, [updateMember, addToast])

  const handleSendReminder = useCallback(async (memberIds: string[]) => {
    const today = todayISO()
    await Promise.all(memberIds.map(id =>
      updateMember(id, { duesReminderSentDate: today }, 'Dues reminder sent')
    ))
    addToast('success', memberIds.length === 1 ? 'Reminder marked as sent.' : `${memberIds.length} reminders marked as sent.`)
  }, [updateMember, addToast])

  const handleMarkFormer = useCallback(async (memberId: string) => {
    await updateMember(memberId, { memberStatus: 'Former' }, 'Status changed to Former')
    addToast('success', 'Member status changed to Former.')
  }, [updateMember, addToast])

  const handleDeleteMembers = useCallback(async (ids: string[]) => {
    const snapshot = membersRef.current
    setMembers(prev => prev.filter(m => !ids.includes(m.id)))
    if (view.type === 'member-detail' && ids.includes(view.memberId)) {
      setView({ type: 'members' })
    }
    const { error } = await supabase.from('members').delete().in('id', ids)
    if (error) {
      addToast('error', 'Failed to delete member(s). Please try again.')
      setMembers(snapshot)
      return
    }
    addToast('success', ids.length === 1 ? 'Member deleted.' : `${ids.length} members deleted.`)
  }, [view, addToast])

  const handleChangeStatus = useCallback(async (ids: string[], status: MemberStatus) => {
    await Promise.all(ids.map(id => updateMember(id, { memberStatus: status }, `Status changed to ${status}`)))
    addToast('success', `${ids.length} member${ids.length !== 1 ? 's' : ''} updated to "${status}".`)
  }, [updateMember, addToast])

  const handleImport = useCallback(async (rows: ImportRow[]): Promise<ImportSummary> => {
    let added = 0, updated = 0, skipped = 0

    const toAdd: Member[] = []
    const toUpdate: Array<{ id: string; mapped: Partial<Member> }> = []

    rows.forEach(row => {
      if (row.action === 'skip') { skipped++; return }
      if (row.action === 'add') {
        toAdd.push({
          id: generateId(),
          firstName: row.mapped.firstName ?? '',
          lastName: row.mapped.lastName ?? '',
          birthdate: row.mapped.birthdate,
          memberStatus: 'Current',
          dateJoined: row.mapped.dateJoined ?? todayISO(),
          address: row.mapped.address ?? '',
          city: row.mapped.city ?? '',
          state: row.mapped.state ?? '',
          zip: row.mapped.zip ?? '',
          phone: row.mapped.phone ?? '',
          email: row.mapped.email ?? '',
          lastDuesPaidDate: row.mapped.lastDuesPaidDate,
          duesRenewalDate: row.mapped.duesRenewalDate,
          duesReminderSentDate: row.mapped.duesReminderSentDate,
          notes: row.mapped.notes ?? '',
          activity: [{ id: generateActivityId(), date: todayISO(), description: 'Member imported from spreadsheet' }],
          updatedAt: todayISO(),
        })
        added++
      } else if (row.action === 'update' && row.duplicateOf) {
        toUpdate.push({ id: row.duplicateOf, mapped: row.mapped as Partial<Member> })
        updated++
      } else {
        skipped++
      }
    })

    if (toAdd.length > 0) {
      const { error } = await supabase.from('members').insert(toAdd)
      if (error) {
        addToast('error', 'Import failed. Please try again.')
        return { added: 0, updated: 0, skipped: rows.length }
      }
      setMembers(prev => [...prev, ...toAdd])
    }

    for (const { id, mapped } of toUpdate) {
      await updateMember(id, mapped, 'Member information updated via import')
    }

    addToast('success', 'Spreadsheet imported successfully.')
    return { added, updated, skipped }
  }, [updateMember, addToast])

  const updateFilters = useCallback((partial: Partial<FilterState>) => {
    setFilters(f => ({ ...f, ...partial }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const handleCardFilter = useCallback((status: MemberStatus | 'All') => {
    setFilters(f => ({
      ...f,
      memberStatus: f.memberStatus === status ? 'All' : status,
    }))
  }, [])

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center py-24 text-gray-400 text-[18px]">
          Loading members...
        </div>
      )
    }

    if (view.type === 'member-detail') {
      const member = members.find(m => m.id === view.memberId)
      if (!member) {
        return (
          <div className="text-center py-16">
            <p className="text-gray-500 text-[18px]">Member not found.</p>
            <button onClick={() => setView({ type: 'members' })} className="mt-4 text-[#1e3a5f] underline text-[17px]">
              Back to Members
            </button>
          </div>
        )
      }
      return (
        <MemberDetail
          member={member}
          onBack={() => setView({ type: 'members' })}
          onEdit={id => setView({ type: 'edit-member', memberId: id })}
          onRecordPayment={handleRecordPayment}
          onSendReminder={id => handleSendReminder([id])}
        />
      )
    }

    if (view.type === 'add-member') {
      return (
        <MemberForm
          onSave={handleSaveMember}
          onCancel={() => setView({ type: 'members' })}
        />
      )
    }

    if (view.type === 'edit-member') {
      const member = members.find(m => m.id === view.memberId)
      return (
        <MemberForm
          member={member}
          onSave={handleSaveMember}
          onCancel={() => setView(member ? { type: 'member-detail', memberId: member.id } : { type: 'members' })}
        />
      )
    }

    return (
      <div className="flex flex-col gap-5">
        <SummaryCards
          members={members}
          activeFilter={filters.memberStatus}
          onFilter={handleCardFilter}
        />
        <SearchFilterBar
          filters={filters}
          onChange={updateFilters}
          onClear={clearFilters}
          totalCount={filters.memberStatus === 'Former'
            ? members.filter(m => m.memberStatus === 'Former').length
            : members.filter(m => m.memberStatus !== 'Former').length
          }
          filteredCount={filteredMembers.length}
          cities={cities}
          states={states}
        />
        <MemberTable
          members={filteredMembers}
          onView={id => setView({ type: 'member-detail', memberId: id })}
          onEdit={id => setView({ type: 'edit-member', memberId: id })}
          onRecordPayment={handleRecordPayment}
          onSendReminder={handleSendReminder}
          onMarkFormer={handleMarkFormer}
          onDelete={handleDeleteMembers}
          onChangeStatus={handleChangeStatus}
        />
      </div>
    )
  }

  const renderPlaceholderPage = (item: NavItem) => (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
        <span className="text-4xl">📋</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{item}</h2>
      <p className="text-gray-500 text-[17px] max-w-sm">
        The {item} section is coming soon. Return to Members to manage your member records.
      </p>
      <button
        onClick={() => { setNavItem('Members'); setView({ type: 'members' }) }}
        className="mt-6 px-5 py-2.5 rounded bg-[#1e3a5f] text-white font-semibold text-[16px] hover:bg-[#162d4a]"
      >
        Go to Members
      </button>
    </div>
  )

  const showHeader = view.type === 'members' && navItem === 'Members'

  return (
    <div className="flex min-h-screen bg-gray-100 w-full">
      <Sidebar
        activeItem={navItem}
        onNavigate={item => {
          setNavItem(item)
          if (item === 'Members') setView({ type: 'members' })
        }}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {showHeader && (
          <PageHeader
            onAddMember={() => setView({ type: 'add-member' })}
            onImport={() => setShowImport(true)}
            allMembers={members}
            filteredMembers={filteredMembers}
            selectedMembers={[]}
          />
        )}

        <main className="flex-1 p-6 overflow-auto" id="main-content">
          {navItem === 'Members' ? renderContent() : renderPlaceholderPage(navItem)}
        </main>
      </div>

      {showImport && (
        <ImportWizard
          existingMembers={members}
          onClose={() => setShowImport(false)}
          onImport={rows => handleImport(rows)}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
