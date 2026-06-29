import { ArrowLeft, Pencil } from 'lucide-react'
import type { Member } from '../../types'
import { formatDate, computeMemberStatus } from '../../utils/dates'
import { StatusBadge } from '../shared/StatusBadge'
import { DuesSection } from './DuesSection'
import { ActivityHistory } from './ActivityHistory'

interface MemberDetailProps {
  member: Member
  onBack: () => void
  onEdit: (id: string) => void
  onRecordPayment: (id: string) => void
  onSendReminder: (id: string) => void
}

export function MemberDetail({
  member,
  onBack,
  onEdit,
  onRecordPayment,
  onSendReminder,
}: MemberDetailProps) {
  const fullName = `${member.firstName} ${member.lastName}`

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back + actions bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#1e3a5f] font-medium text-[17px] hover:underline"
          aria-label="Back to member list"
        >
          <ArrowLeft size={20} aria-hidden="true" />
          Back to Members
        </button>
        <button
          onClick={() => onEdit(member.id)}
          className="flex items-center gap-2 px-4 py-2.5 rounded bg-[#1e3a5f] text-white font-semibold text-[16px] hover:bg-[#162d4a] min-h-[44px]"
        >
          <Pencil size={17} aria-hidden="true" />
          Edit Member
        </button>
      </div>

      {/* Profile header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-5">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0" aria-hidden="true">
            {member.firstName[0]}{member.lastName[0]}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">{fullName}</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={computeMemberStatus(member)} />
              <span className="text-[16px] text-gray-500">Member since {formatDate(member.dateJoined)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <Section title="Personal Information">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First Name">{member.firstName}</Field>
          <Field label="Last Name">{member.lastName}</Field>
          <Field label="Birthdate">{formatDate(member.birthdate)}</Field>
          <Field label="Date Joined">{formatDate(member.dateJoined)}</Field>
        </dl>
      </Section>

      {/* Contact Information */}
      <Section title="Contact Information">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Address" span>{member.address || '—'}</Field>
          <Field label="City">{member.city || '—'}</Field>
          <Field label="State">{member.state || '—'}</Field>
          <Field label="ZIP Code">{member.zip || '—'}</Field>
          <Field label="Phone">
            {member.phone
              ? <a href={`tel:${member.phone}`} className="text-[#1e3a5f] hover:underline">{member.phone}</a>
              : '—'}
          </Field>
          <Field label="Email">
            {member.email
              ? <a href={`mailto:${member.email}`} className="text-[#1e3a5f] hover:underline break-all">{member.email}</a>
              : '—'}
          </Field>
        </dl>
      </Section>

      {/* Dues */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-5">
        <DuesSection
          member={member}
          onRecordPayment={onRecordPayment}
          onSendReminder={onSendReminder}
        />
      </div>

      {/* Notes */}
      <Section title="Member Notes">
        {member.notes ? (
          <p className="text-[17px] text-gray-800 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded p-4 border border-gray-100">
            {member.notes}
          </p>
        ) : (
          <p className="text-gray-400 text-[16px] italic">No notes for this member.</p>
        )}
      </Section>

      {/* Activity History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-5">
        <ActivityHistory activity={member.activity} />
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-5">
      <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, children, span }: { label: string; children: React.ReactNode; span?: boolean }) {
  return (
    <div className={span ? 'sm:col-span-2' : ''}>
      <dt className="text-[14px] font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</dt>
      <dd className="text-[17px] text-gray-900">{children}</dd>
    </div>
  )
}
