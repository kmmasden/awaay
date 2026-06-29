export type MemberStatus = 'Current' | 'Delinquent' | 'Former' | 'Missing dues info'

export type DuesStatus = 'Current' | 'Due Soon' | 'Overdue' | 'Unknown'

export interface ActivityEntry {
  id: string
  date: string // ISO
  description: string
}

export interface Member {
  id: string
  firstName: string
  lastName: string
  birthdate?: string
  memberStatus: MemberStatus
  dateJoined: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  email: string
  lastDuesPaidDate?: string
  duesRenewalDate?: string
  duesReminderSentDate?: string
  notes: string
  activity: ActivityEntry[]
  updatedAt: string
}

export interface FilterState {
  search: string
  memberStatus: MemberStatus | 'All'
  duesRenewal: 'All' | 'Due Soon' | 'Overdue' | 'Current'
  city: string
  state: string
  sortBy: SortOption
  sortDir: 'asc' | 'desc'
}

export type SortOption =
  | 'lastName'
  | 'firstName'
  | 'dateJoined'
  | 'duesRenewalDate'
  | 'memberStatus'
  | 'updatedAt'

export type AppView =
  | { type: 'members' }
  | { type: 'member-detail'; memberId: string }
  | { type: 'add-member' }
  | { type: 'edit-member'; memberId: string }

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

export interface ImportRow {
  raw: Record<string, string>
  mapped: Partial<Member>
  errors: string[]
  warnings: string[]
  duplicateOf?: string // member id
  action: 'add' | 'update' | 'skip' | 'review'
}
