'use client'

import { Mail, MapPin, Phone, User } from 'lucide-react'

export default function ClientContactPanel({
  clientName,
  clientEmail,
  clientPhone,
  clientAddress,
}: {
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
}) {
  const hasAny = Boolean(clientName.trim() || clientEmail.trim() || clientPhone.trim() || clientAddress.trim())

  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-5 sm:p-6">
      <h3 className="text-[10px] uppercase tracking-[0.16em] text-platinum-500">Client contact</h3>
      {!hasAny ? (
        <p className="mt-4 text-sm text-platinum-500">
          No client details yet. Add phone, email, and address from the payments vault or when creating the project.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {clientName.trim() && (
            <div className="flex gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 sm:col-span-2">
              <User className="h-5 w-5 shrink-0 text-platinum-500 mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-platinum-600">Name</p>
                <p className="text-platinum-metallic font-medium">{clientName}</p>
              </div>
            </div>
          )}
          {clientPhone.trim() && (
            <div className="flex gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <Phone className="h-5 w-5 shrink-0 text-platinum-500 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-platinum-600">Phone</p>
                <a href={`tel:${clientPhone.replace(/\s/g, '')}`} className="text-platinum-200 hover:text-platinum-metallic break-all">
                  {clientPhone}
                </a>
              </div>
            </div>
          )}
          {clientEmail.trim() && (
            <div className="flex gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <Mail className="h-5 w-5 shrink-0 text-platinum-500 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-platinum-600">Email</p>
                <a href={`mailto:${clientEmail}`} className="text-platinum-200 hover:text-platinum-metallic break-all">
                  {clientEmail}
                </a>
              </div>
            </div>
          )}
          {clientAddress.trim() && (
            <div className="flex gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 sm:col-span-2">
              <MapPin className="h-5 w-5 shrink-0 text-platinum-500 mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-platinum-600">Address</p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-platinum-200">{clientAddress}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
