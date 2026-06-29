import * as XLSX from 'xlsx'
import type { Member, ImportRow, MemberStatus } from '../types'
import { addOneYear } from './dates'

export const APP_FIELDS: { key: keyof Member | ''; label: string; required?: boolean }[] = [
  { key: 'firstName', label: 'First Name', required: true },
  { key: 'lastName', label: 'Last Name', required: true },
  { key: 'address', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'zip', label: 'ZIP Code' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'dateJoined', label: 'Date Joined' },
  { key: 'lastDuesPaidDate', label: 'Dues Paid Date' },
  { key: 'duesRenewalDate', label: 'Dues Renewal Date' },
  { key: 'duesReminderSentDate', label: 'Dues Reminder Sent Date' },
  { key: 'birthdate', label: 'Birthdate' },
  { key: 'memberStatus', label: 'Member Status' },
  { key: 'notes', label: 'Member Notes' },
  { key: '', label: '(Skip this column)' },
]

const HEADER_ALIASES: Record<string, keyof Member> = {
  'first name': 'firstName',
  'firstname': 'firstName',
  'first': 'firstName',
  'last name': 'lastName',
  'lastname': 'lastName',
  'last': 'lastName',
  'address': 'address',
  'city': 'city',
  'state': 'state',
  'zip': 'zip',
  'zip code': 'zip',
  'zipcode': 'zip',
  'postal code': 'zip',
  'phone': 'phone',
  'phone number': 'phone',
  'telephone': 'phone',
  'email': 'email',
  'email address': 'email',
  'date joined': 'dateJoined',
  'joined': 'dateJoined',
  'member since': 'dateJoined',
  'dues paid date': 'lastDuesPaidDate',
  'last dues paid': 'lastDuesPaidDate',
  'dues paid': 'lastDuesPaidDate',
  'dues renewal date': 'duesRenewalDate',
  'renewal date': 'duesRenewalDate',
  'dues renewal': 'duesRenewalDate',
  'dues reminder sent date': 'duesReminderSentDate',
  'reminder sent': 'duesReminderSentDate',
  'birthdate': 'birthdate',
  'birth date': 'birthdate',
  'dob': 'birthdate',
  'date of birth': 'birthdate',
  'member status': 'memberStatus',
  'status': 'memberStatus',
  'member notes': 'notes',
  'notes': 'notes',
  'comments': 'notes',
}

export function parseFile(file: File): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '', raw: false })

        if (jsonData.length === 0) {
          resolve({ headers: [], rows: [] })
          return
        }

        const headers = Object.keys(jsonData[0])
        const rows = jsonData.map(row =>
          Object.fromEntries(headers.map(h => [h, String(row[h] ?? '')]))
        )
        resolve({ headers, rows })
      } catch (err) {
        reject(new Error('Could not read the file. Please make sure it is a valid Excel or CSV file.'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

export function autoMapHeaders(headers: string[]): Record<string, keyof Member | ''> {
  const mapping: Record<string, keyof Member | ''> = {}
  for (const h of headers) {
    const lower = h.toLowerCase().trim()
    mapping[h] = HEADER_ALIASES[lower] ?? ''
  }
  return mapping
}

function parseDate(val: string): string | undefined {
  if (!val || val.trim() === '') return undefined
  // Try various date formats
  const cleaned = val.trim()
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned
  // MM/DD/YYYY
  const m = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`
  // Try native Date parse
  const d = new Date(cleaned)
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
  return undefined
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidStatus(status: string): status is MemberStatus {
  return ['Active', 'Outstanding Dues', 'Former'].includes(status)
}

export function processRows(
  rawRows: Record<string, string>[],
  mapping: Record<string, keyof Member | ''>,
  existingMembers: Member[]
): ImportRow[] {
  return rawRows.map((raw): ImportRow => {
    const mapped: Partial<Member> = {}
    const errors: string[] = []
    const warnings: string[] = []

    // Apply mapping
    for (const [col, field] of Object.entries(mapping)) {
      if (!field) continue
      const val = raw[col]?.trim() ?? ''
      if (!val) continue

      if (field === 'memberStatus') {
        const normalized = val.trim()
        if (isValidStatus(normalized)) {
          mapped.memberStatus = normalized
        } else {
          warnings.push(`"${val}" is not a valid Member Status. Valid values are: Active, Outstanding Dues, Former.`)
          mapped.memberStatus = 'Active'
        }
      } else if (['dateJoined', 'lastDuesPaidDate', 'duesRenewalDate', 'duesReminderSentDate', 'birthdate'].includes(field)) {
        const parsed = parseDate(val)
        if (val && !parsed) {
          errors.push(`Could not read date "${val}" for ${field}`)
        } else {
          (mapped as Record<string, unknown>)[field] = parsed
        }
      } else if (field === 'email' && val) {
        if (!isValidEmail(val)) {
          warnings.push(`"${val}" may not be a valid email address.`)
        }
        mapped.email = val
      } else {
        (mapped as Record<string, unknown>)[field] = val
      }
    }

    // Required field checks
    if (!mapped.firstName) errors.push('First Name is required')
    if (!mapped.lastName) errors.push('Last Name is required')

    // Auto-calculate renewal date
    if (mapped.lastDuesPaidDate && !mapped.duesRenewalDate) {
      mapped.duesRenewalDate = addOneYear(mapped.lastDuesPaidDate)
    }

    // Default status
    if (!mapped.memberStatus) mapped.memberStatus = 'Active'

    // Duplicate detection
    let duplicateOf: string | undefined
    const firstName = (mapped.firstName ?? '').toLowerCase()
    const lastName = (mapped.lastName ?? '').toLowerCase()
    const email = (mapped.email ?? '').toLowerCase()
    const phone = (mapped.phone ?? '').replace(/\D/g, '')
    const address = (mapped.address ?? '').toLowerCase()

    for (const m of existingMembers) {
      const nameMatch =
        m.firstName.toLowerCase() === firstName &&
        m.lastName.toLowerCase() === lastName
      const emailMatch = email && m.email.toLowerCase() === email
      const phoneMatch = phone && m.phone.replace(/\D/g, '') === phone
      const addressMatch = address && m.address.toLowerCase() === address

      if (nameMatch || emailMatch || (phoneMatch && nameMatch) || (addressMatch && nameMatch)) {
        duplicateOf = m.id
        break
      }
    }

    return {
      raw,
      mapped,
      errors,
      warnings,
      duplicateOf,
      action: duplicateOf ? 'review' : errors.length > 0 ? 'skip' : 'add',
    }
  })
}
