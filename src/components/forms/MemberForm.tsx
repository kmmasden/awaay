import { useState, useCallback } from 'react'
import { Save, X } from 'lucide-react'
import type { Member, MemberStatus } from '../../types'
import { FormField, inputClass, selectClass } from './FormField'
import { ConfirmDialog } from '../shared/ConfirmDialog'
import { addOneYear, todayISO } from '../../utils/dates'

type FormData = {
  firstName: string
  lastName: string
  birthdate: string
  memberStatus: MemberStatus
  dateJoined: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  email: string
  lastDuesPaidDate: string
  duesRenewalDate: string
  duesReminderSentDate: string
  notes: string
}

type FormErrors = Partial<Record<keyof FormData, string>>

interface MemberFormProps {
  member?: Member
  onSave: (data: Partial<Member>) => void
  onCancel: () => void
}

const US_STATES = [
  '', 'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
]

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  if (digits.length < 4) return digits
  if (digits.length < 7) return `(${digits.slice(0,3)}) ${digits.slice(3)}`
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`
}

export function MemberForm({ member, onSave, onCancel }: MemberFormProps) {
  const isEdit = !!member
  const today = todayISO()

  const initialData: FormData = {
    firstName: member?.firstName ?? '',
    lastName: member?.lastName ?? '',
    birthdate: member?.birthdate ?? '',
    memberStatus: member?.memberStatus ?? 'Active',
    dateJoined: member?.dateJoined ?? today,
    address: member?.address ?? '',
    city: member?.city ?? '',
    state: member?.state ?? '',
    zip: member?.zip ?? '',
    phone: member?.phone ?? '',
    email: member?.email ?? '',
    lastDuesPaidDate: member?.lastDuesPaidDate ?? '',
    duesRenewalDate: member?.duesRenewalDate ?? '',
    duesReminderSentDate: member?.duesReminderSentDate ?? '',
    notes: member?.notes ?? '',
  }

  const [data, setData] = useState<FormData>(initialData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isDirty, setIsDirty] = useState(false)
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)

  const set = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData(d => ({ ...d, [key]: value }))
    setIsDirty(true)
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
  }, [errors])

  const handleDuesPaidChange = (val: string) => {
    set('lastDuesPaidDate', val)
    if (val) set('duesRenewalDate', addOneYear(val))
  }

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!data.firstName.trim()) errs.firstName = 'First name is required'
    if (!data.lastName.trim()) errs.lastName = 'Last name is required'
    if (!data.dateJoined) errs.dateJoined = 'Date joined is required'
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errs.email = 'Please enter a valid email address'
    }
    if (data.zip && !/^\d{5}(-\d{4})?$/.test(data.zip)) {
      errs.zip = 'ZIP code should be 5 digits (e.g., 62701)'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const payload: Partial<Member> = {
      ...data,
      birthdate: data.birthdate || undefined,
      lastDuesPaidDate: data.lastDuesPaidDate || undefined,
      duesRenewalDate: data.duesRenewalDate || undefined,
      duesReminderSentDate: data.duesReminderSentDate || undefined,
    }
    onSave(payload)
  }

  const handleCancel = () => {
    if (isDirty) {
      setShowUnsavedWarning(true)
    } else {
      onCancel()
    }
  }

  const sectionClass = 'bg-white rounded-lg border border-gray-200 p-6 mb-5'
  const sectionTitle = 'text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100'
  const gridTwo = 'grid grid-cols-1 sm:grid-cols-2 gap-5'

  return (
    <>
      <form onSubmit={handleSubmit} noValidate aria-label={isEdit ? 'Edit member' : 'Add new member'}>
        <div className="mb-5">
          <h2 className="text-3xl font-bold text-gray-900">
            {isEdit ? `Edit: ${member.firstName} ${member.lastName}` : 'Add New Member'}
          </h2>
          <p className="text-gray-500 text-[16px] mt-1">
            Fields marked with <span className="text-red-600 font-bold">*</span> are required.
          </p>
        </div>

        {/* 1. Personal Information */}
        <div className={sectionClass}>
          <h3 className={sectionTitle}>1. Personal Information</h3>
          <div className={gridTwo}>
            <FormField label="First Name" htmlFor="firstName" required error={errors.firstName}>
              <input
                id="firstName"
                type="text"
                value={data.firstName}
                onChange={e => set('firstName', e.target.value)}
                className={inputClass}
                aria-required="true"
                aria-invalid={!!errors.firstName}
                autoComplete="given-name"
              />
            </FormField>

            <FormField label="Last Name" htmlFor="lastName" required error={errors.lastName}>
              <input
                id="lastName"
                type="text"
                value={data.lastName}
                onChange={e => set('lastName', e.target.value)}
                className={inputClass}
                aria-required="true"
                aria-invalid={!!errors.lastName}
                autoComplete="family-name"
              />
            </FormField>

            <FormField label="Birthdate" htmlFor="birthdate" hint="Format: MM/DD/YYYY">
              <input
                id="birthdate"
                type="date"
                value={data.birthdate}
                onChange={e => set('birthdate', e.target.value)}
                className={inputClass}
              />
            </FormField>

            <FormField label="Member Status" htmlFor="memberStatus" required>
              <select
                id="memberStatus"
                value={data.memberStatus}
                onChange={e => set('memberStatus', e.target.value as MemberStatus)}
                className={selectClass}
              >
                <option value="Active">Active</option>
                <option value="Outstanding Dues">Outstanding Dues</option>
                <option value="Former">Former</option>
              </select>
            </FormField>
          </div>
        </div>

        {/* 2. Contact Information */}
        <div className={sectionClass}>
          <h3 className={sectionTitle}>2. Contact Information</h3>
          <div className="grid grid-cols-1 gap-5">
            <FormField label="Address" htmlFor="address">
              <input
                id="address"
                type="text"
                value={data.address}
                onChange={e => set('address', e.target.value)}
                className={inputClass}
                autoComplete="street-address"
              />
            </FormField>
          </div>
          <div className={`${gridTwo} mt-5`}>
            <FormField label="City" htmlFor="city">
              <input
                id="city"
                type="text"
                value={data.city}
                onChange={e => set('city', e.target.value)}
                className={inputClass}
                autoComplete="address-level2"
              />
            </FormField>

            <FormField label="State" htmlFor="state">
              <select
                id="state"
                value={data.state}
                onChange={e => set('state', e.target.value)}
                className={selectClass}
                autoComplete="address-level1"
              >
                <option value="">Select state</option>
                {US_STATES.filter(Boolean).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </FormField>

            <FormField label="ZIP Code" htmlFor="zip" error={errors.zip} hint="5-digit ZIP (e.g., 62701)">
              <input
                id="zip"
                type="text"
                value={data.zip}
                onChange={e => set('zip', e.target.value.replace(/[^\d-]/g, '').slice(0, 10))}
                className={inputClass}
                inputMode="numeric"
                autoComplete="postal-code"
                aria-invalid={!!errors.zip}
              />
            </FormField>

            <FormField label="Phone" htmlFor="phone" hint="Format: (217) 555-0100">
              <input
                id="phone"
                type="tel"
                value={data.phone}
                onChange={e => set('phone', formatPhone(e.target.value))}
                className={inputClass}
                autoComplete="tel"
              />
            </FormField>

            <FormField label="Email" htmlFor="email" error={errors.email}>
              <input
                id="email"
                type="email"
                value={data.email}
                onChange={e => set('email', e.target.value)}
                className={inputClass}
                aria-invalid={!!errors.email}
                autoComplete="email"
              />
            </FormField>
          </div>
        </div>

        {/* 3. Membership Information */}
        <div className={sectionClass}>
          <h3 className={sectionTitle}>3. Membership Information</h3>
          <div className={gridTwo}>
            <FormField label="Date Joined" htmlFor="dateJoined" required error={errors.dateJoined}>
              <input
                id="dateJoined"
                type="date"
                value={data.dateJoined}
                onChange={e => set('dateJoined', e.target.value)}
                className={inputClass}
                aria-required="true"
                aria-invalid={!!errors.dateJoined}
              />
            </FormField>
          </div>
        </div>

        {/* 4. Dues Information */}
        <div className={sectionClass}>
          <h3 className={sectionTitle}>4. Dues Information</h3>
          <div className={gridTwo}>
            <FormField label="Last Dues Paid Date" htmlFor="lastDuesPaidDate">
              <input
                id="lastDuesPaidDate"
                type="date"
                value={data.lastDuesPaidDate}
                onChange={e => handleDuesPaidChange(e.target.value)}
                className={inputClass}
              />
            </FormField>

            <FormField
              label="Dues Renewal Date"
              htmlFor="duesRenewalDate"
              hint="Auto-calculated as one year after dues paid date. You may adjust it here."
            >
              <input
                id="duesRenewalDate"
                type="date"
                value={data.duesRenewalDate}
                onChange={e => set('duesRenewalDate', e.target.value)}
                className={inputClass}
              />
            </FormField>

            <FormField label="Dues Reminder Sent Date" htmlFor="duesReminderSentDate">
              <input
                id="duesReminderSentDate"
                type="date"
                value={data.duesReminderSentDate}
                onChange={e => set('duesReminderSentDate', e.target.value)}
                className={inputClass}
              />
            </FormField>
          </div>
        </div>

        {/* 5. Notes */}
        <div className={sectionClass}>
          <h3 className={sectionTitle}>5. Notes</h3>
          <FormField label="Member Notes" htmlFor="notes">
            <textarea
              id="notes"
              value={data.notes}
              onChange={e => set('notes', e.target.value)}
              rows={5}
              className="w-full rounded border border-gray-300 px-3 py-2.5 text-[17px] text-gray-900 focus:outline-2 focus:outline-[#1e3a5f] focus:outline-offset-2 resize-y"
              placeholder="Any additional notes about this member..."
            />
          </FormField>
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-4 flex-wrap pb-8">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded bg-[#1e3a5f] text-white font-semibold text-[17px] hover:bg-[#162d4a] min-h-[50px]"
          >
            <Save size={20} aria-hidden="true" />
            Save Member
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-2 px-6 py-3 rounded border border-gray-300 text-gray-700 font-medium text-[17px] hover:bg-gray-50 min-h-[50px]"
          >
            <X size={20} aria-hidden="true" />
            Cancel
          </button>
        </div>
      </form>

      {showUnsavedWarning && (
        <ConfirmDialog
          title="Leave without saving?"
          message="You have unsaved changes. If you leave now, your changes will be lost."
          confirmLabel="Leave Without Saving"
          cancelLabel="Stay and Keep Editing"
          onConfirm={onCancel}
          onCancel={() => setShowUnsavedWarning(false)}
          danger={false}
        />
      )}
    </>
  )
}
