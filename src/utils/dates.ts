import { differenceInDays, parseISO, format, addYears } from 'date-fns'
import type { DuesStatus, MemberStatus } from '../types'

export function formatDate(iso?: string): string {
  if (!iso) return '—'
  try {
    return format(parseISO(iso), 'MMMM d, yyyy')
  } catch {
    return iso
  }
}

export function formatDateShort(iso?: string): string {
  if (!iso) return '—'
  try {
    return format(parseISO(iso), 'MM/dd/yyyy')
  } catch {
    return iso
  }
}

export function getDuesStatus(duesRenewalDate?: string): DuesStatus {
  if (!duesRenewalDate) return 'Unknown'
  try {
    const renewal = parseISO(duesRenewalDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const days = differenceInDays(renewal, today)
    if (days < 0) return 'Overdue'
    if (days <= 30) return 'Due Soon'
    return 'Current'
  } catch {
    return 'Unknown'
  }
}

export function getDuesLabel(duesRenewalDate?: string): string {
  if (!duesRenewalDate) return 'Unknown'
  try {
    const renewal = parseISO(duesRenewalDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const days = differenceInDays(renewal, today)
    if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`
    if (days === 0) return 'Due today'
    if (days <= 30) return `Due in ${days} day${days === 1 ? '' : 's'}`
    return 'Current'
  } catch {
    return 'Unknown'
  }
}

export function addOneYear(iso: string): string {
  return addYears(parseISO(iso), 1).toISOString().split('T')[0]
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function computeMemberStatus(member: {
  memberStatus: MemberStatus
  lastDuesPaidDate?: string
  duesRenewalDate?: string
}): MemberStatus {
  if (member.memberStatus === 'Former') return 'Former'
  if (!member.lastDuesPaidDate && !member.duesRenewalDate) return 'Missing dues info'
  const renewal = member.duesRenewalDate ?? addOneYear(member.lastDuesPaidDate!)
  if (renewal < todayISO()) return 'Delinquent'
  return 'Current'
}
