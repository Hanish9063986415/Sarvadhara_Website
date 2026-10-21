'use client'

import { Mail, MapPin, Phone, User } from 'lucide-react'

type ContactValues = {
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
}

export default function ClientContactFields({
  values,
  onChange,
  idPrefix,
}: {
  values: ContactValues
  onChange: (patch: Partial<ContactValues>) => void
  idPrefix: string
}) {
  return (
    <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.16em] text-platinum-500">Client details</p>
        <p className="mt-1 text-xs text-platinum-600">Phone, email, and address stay with this project record.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="crm-label flex items-center gap-1.5" htmlFor={`${idPrefix}-client-name`}>
            <User className="h-3.5 w-3.5 text-platinum-600" />
            Client / company
          </label>
          <input
            id={`${idPrefix}-client-name`}
            className="crm-input"
            value={values.clientName}
            onChange={(e) => onChange({ clientName: e.target.value })}
            placeholder="Client or organization"
          />
        </div>
        <div>
          <label className="crm-label flex items-center gap-1.5" htmlFor={`${idPrefix}-client-phone`}>
            <Phone className="h-3.5 w-3.5 text-platinum-600" />
            Phone
          </label>
          <input
            id={`${idPrefix}-client-phone`}
            type="tel"
            className="crm-input"
            value={values.clientPhone}
            onChange={(e) => onChange({ clientPhone: e.target.value })}
            placeholder="+91 …"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="crm-label flex items-center gap-1.5" htmlFor={`${idPrefix}-client-email`}>
            <Mail className="h-3.5 w-3.5 text-platinum-600" />
            Email
          </label>
          <input
            id={`${idPrefix}-client-email`}
            type="email"
            className="crm-input"
            value={values.clientEmail}
            onChange={(e) => onChange({ clientEmail: e.target.value })}
            placeholder="client@company.com"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="crm-label flex items-center gap-1.5" htmlFor={`${idPrefix}-client-address`}>
            <MapPin className="h-3.5 w-3.5 text-platinum-600" />
            Address
          </label>
          <textarea
            id={`${idPrefix}-client-address`}
            rows={3}
            className="crm-input resize-y whitespace-pre-wrap leading-relaxed"
            value={values.clientAddress}
            onChange={(e) => onChange({ clientAddress: e.target.value })}
            placeholder="Street, city, state, PIN — paste full address"
          />
        </div>
      </div>
    </div>
  )
}
