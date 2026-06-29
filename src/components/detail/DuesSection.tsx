import { useState } from 'react'
import { DollarSign, Bell } from 'lucide-react'
import type { Member } from '../../types'
import { formatDate, getDuesLabel, getDuesStatus, addOneYear, todayISO, computeMemberStatus } from '../../utils/dates'
import { StatusBadge } from '../shared/StatusBadge'
import { ConfirmDialog } from '../shared/ConfirmDialog'

interface DuesSectionProps {
  member: Member
  onRecordPayment: (memberId: string) => void
  onSendReminder: (memberId: string) => void
}

export function DuesSection({ member, onRecordPayment, onSendReminder }: DuesSectionProps) {
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false)
  const duesStatus = getDuesStatus(member.duesRenewalDate)
  const duesLabel = getDuesLabel(member.duesRenewalDate)
  const today = todayISO()
  const newRenewal = addOneYear(today)

  const duesStatusColor = {
    Current: 'text-green-700 bg-green-50 border border-green-200',
    'Due Soon': 'text-amber-700 bg-amber-50 border border-amber-200',
    Overdue: 'text-red-700 bg-red-50 border border-red-200',
    Unknown: 'text-gray-600 bg-gray-50 border border-gray-200',
  }[duesStatus]

  return (
    <section aria-labelledby="dues-heading">
      <h3 id="dues-heading" className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
        Dues Information
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <Field label="Current Dues Status">
          <span className={`inline-block px-3 py-1 rounded-full text-[15px] font-semibold ${duesStatusColor}`}>
            {duesLabel}
          </span>
        </Field>
        <Field label="Member Status">
          <StatusBadge status={computeMemberStatus(member)} />
        </Field>
        <Field label="Last Dues Paid Date">
          {formatDate(member.lastDuesPaidDate)}
        </Field>
        <Field label="Dues Renewal Date">
          {formatDate(member.duesRenewalDate)}
        </Field>
        <Field label="Dues Reminder Sent Date">
          {formatDate(member.duesReminderSentDate)}
        </Field>
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setShowPaymentConfirm(true)}
          className="flex items-center gap-2 px-5 py-3 rounded bg-[#1e3a5f] text-white font-semibold text-[17px] hover:bg-[#162d4a] min-h-[48px]"
        >
          <DollarSign size={20} aria-hidden="true" />
          Record Dues Payment
        </button>
        <button
          onClick={() => onSendReminder(member.id)}
          className="flex items-center gap-2 px-5 py-3 rounded border border-gray-300 text-gray-700 font-medium text-[17px] hover:bg-gray-50 min-h-[48px]"
        >
          <Bell size={20} aria-hidden="true" />
          Send Dues Reminder
        </button>
      </div>

      {showPaymentConfirm && (
        <ConfirmDialog
          title="Record Dues Payment"
          message={`Record a dues payment for ${member.firstName} ${member.lastName}? This will update the dues paid date to today (${formatDate(today)}) and set the renewal date to ${formatDate(newRenewal)}.`}
          confirmLabel="Record Payment"
          cancelLabel="Cancel"
          onConfirm={() => { setShowPaymentConfirm(false); onRecordPayment(member.id) }}
          onCancel={() => setShowPaymentConfirm(false)}
          danger={false}
        />
      )}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[14px] font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</dt>
      <dd className="text-[17px] text-gray-900">{children}</dd>
    </div>
  )
}
