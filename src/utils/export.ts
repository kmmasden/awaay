import * as XLSX from 'xlsx'
import type { Member } from '../types'
import { formatDate } from './dates'

export function exportToExcel(members: Member[], filename = 'dads-club-members.xlsx') {
  const rows = members.map(m => ({
    'First Name': m.firstName,
    'Last Name': m.lastName,
    'Address': m.address,
    'City': m.city,
    'State': m.state,
    'ZIP Code': m.zip,
    'Phone': m.phone,
    'Email': m.email,
    'Date Joined': formatDate(m.dateJoined),
    'Dues Paid Date': formatDate(m.lastDuesPaidDate),
    'Dues Renewal Date': formatDate(m.duesRenewalDate),
    'Dues Reminder Sent Date': formatDate(m.duesReminderSentDate),
    'Birthdate': formatDate(m.birthdate),
    'Member Status': m.memberStatus,
    'Member Notes': m.notes,
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()

  // Set column widths
  ws['!cols'] = [
    { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 18 }, { wch: 8 },
    { wch: 10 }, { wch: 16 }, { wch: 28 }, { wch: 14 }, { wch: 14 },
    { wch: 16 }, { wch: 22 }, { wch: 14 }, { wch: 18 }, { wch: 50 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Members')
  XLSX.writeFile(wb, filename)
}
