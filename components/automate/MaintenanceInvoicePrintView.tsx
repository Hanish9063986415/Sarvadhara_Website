'use client'

import Image from 'next/image'
import { SARVADHARA_INVOICE_FROM } from '@/lib/sarvadhara-invoice-from'
import { formatInrDecimal } from '@/lib/format-currency'
import {
  formatBillPhone,
  formatInvoiceDate,
  lineGstPercent,
  lineTaxableAmount,
  lineTotalInclGst,
} from '@/lib/maintenance-invoice-math'
import type { MaintenanceInvoicePrintProps } from '@/types/maintenance-invoice-print'

export type { MaintenanceInvoicePrintProps }

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-neutral-200 last:border-0">
      <td className="py-2.5 pr-4 text-sm text-neutral-600 whitespace-nowrap">{label}</td>
      <td className="py-2.5 text-sm font-medium text-neutral-900">{value}</td>
    </tr>
  )
}

export default function MaintenanceInvoicePrintView({
  elementId = 'maintenance-invoice-print',
  ...props
}: MaintenanceInvoicePrintProps & { elementId?: string }) {
  const {
    invoiceNumber,
    invoiceDate,
    dueDate,
    servicePeriodLabel,
    gstPercent,
    subtotal,
    gstAmount,
    grandTotal,
    lines,
    issuerGstin,
    clientName,
    clientAddress,
    clientPhone,
    notes,
  } = props

  const visibleLines = lines.filter(
    (line) => line.description.trim() || lineTaxableAmount(line) > 0
  )

  return (
    <article
      id={elementId}
      className="invoice-print-sheet mx-auto w-full max-w-[794px] bg-white px-4 py-8 text-neutral-900 shadow-2xl shadow-black/40 xs:px-6 sm:px-12 sm:py-12 print:max-w-none print:px-10 print:py-8 print:shadow-none"
    >
      <header className="border-b border-neutral-200 pb-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="invoice-logo-wrap relative shrink-0">
              <Image
                src={SARVADHARA_INVOICE_FROM.logoPath}
                alt="Sarvadhara logo"
                width={96}
                height={96}
                className="h-[88px] w-[88px] object-contain sm:h-[96px] sm:w-[96px]"
                priority
                unoptimized
              />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-sans text-2xl font-semibold tracking-tight text-neutral-900 sm:text-[1.75rem]">
                {SARVADHARA_INVOICE_FROM.displayName}
              </p>
              <p className="mt-1 font-sans text-sm font-medium text-neutral-600">{SARVADHARA_INVOICE_FROM.legalName}</p>
              <p className="mt-1 text-xs tracking-wide text-neutral-500">Technology · Software · Digital Services</p>
            </div>
          </div>
          <div className="text-center sm:text-right sm:pl-4">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Tax document</p>
            <p className="mt-1 font-sans text-2xl font-semibold text-neutral-900">Invoice</p>
          </div>
        </div>
      </header>

      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-neutral-900">Billed By</p>
          <div className="mt-3 space-y-1 text-sm leading-relaxed text-neutral-800">
            <p className="font-medium">{SARVADHARA_INVOICE_FROM.legalName}</p>
            {SARVADHARA_INVOICE_FROM.addressBlock.split('\n').map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p>{formatBillPhone(SARVADHARA_INVOICE_FROM.phone)}</p>
            {issuerGstin.trim() && (
              <p className="pt-1 font-sans text-xs tabular-nums">GSTIN: {issuerGstin.trim()}</p>
            )}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">Billed To</p>
          <div className="mt-3 space-y-1 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
            {clientName.trim() ? (
              <p className="font-medium">{clientName.trim()}</p>
            ) : (
              <p className="italic text-neutral-500">Client name not set</p>
            )}
            {clientAddress.trim() ? (
              clientAddress
                .trim()
                .split(/\n/)
                .map((line) => <p key={line}>{line}</p>)
            ) : (
              <p className="italic text-neutral-500">Add address on the project record</p>
            )}
            {clientPhone.trim() && <p>{formatBillPhone(clientPhone.trim())}</p>}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <p className="text-sm font-semibold text-neutral-900">Invoice Details</p>
        <table className="mt-3 w-full max-w-md border-collapse">
          <tbody>
            <DetailRow label="Invoice No #" value={invoiceNumber.trim() || '—'} />
            <DetailRow label="Invoice Date" value={formatInvoiceDate(invoiceDate)} />
            <DetailRow label="Due Date" value={formatInvoiceDate(dueDate)} />
            <DetailRow label="Billing period" value={servicePeriodLabel} />
          </tbody>
        </table>
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-y border-neutral-300 bg-neutral-50">
              <th className="py-3 pr-4 text-left font-semibold text-neutral-800">Service Name</th>
              <th className="py-3 px-3 text-right font-semibold text-neutral-800 w-24">GST Rate</th>
              <th className="py-3 px-3 text-right font-semibold text-neutral-800 w-28">Rate</th>
              <th className="py-3 pl-3 text-right font-semibold text-neutral-800 w-32">Total</th>
            </tr>
          </thead>
          <tbody>
            {visibleLines.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-neutral-500">
                  Add at least one service line in the builder.
                </td>
              </tr>
            ) : (
              visibleLines.map((line, index) => {
                const taxable = lineTaxableAmount(line)
                const lineGst = lineGstPercent(line, gstPercent)
                const total = lineTotalInclGst(line, gstPercent)
                return (
                  <tr key={line.id} className="border-b border-neutral-200 align-top">
                    <td className="py-4 pr-4 text-neutral-900">
                      <span className="font-sans tabular-nums text-neutral-600">{index + 1}. </span>
                      {line.description.trim() || '—'}
                    </td>
                    <td className="py-4 px-3 text-right font-sans tabular-nums text-neutral-800">{lineGst}%</td>
                    <td className="py-4 px-3 text-right font-sans tabular-nums text-neutral-900">
                      {formatInrDecimal(taxable)}
                    </td>
                    <td className="py-4 pl-3 text-right font-sans font-medium tabular-nums text-neutral-900">
                      {formatInrDecimal(total)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex justify-end">
        <table className="w-full max-w-xs border-collapse text-sm">
          <tbody>
            <tr className="border-b border-neutral-200">
              <td className="py-2.5 pr-6 text-neutral-700">Amount</td>
              <td className="py-2.5 text-right font-sans font-medium tabular-nums text-neutral-900">
                {formatInrDecimal(subtotal)}
              </td>
            </tr>
            <tr className="border-b border-neutral-200">
              <td className="py-2.5 pr-6 text-neutral-700">IGST</td>
              <td className="py-2.5 text-right font-sans font-medium tabular-nums text-neutral-900">
                {formatInrDecimal(gstAmount)}
              </td>
            </tr>
            <tr>
              <td className="py-3 pr-6 font-semibold text-neutral-900">Total (INR)</td>
              <td className="py-3 text-right font-sans text-base font-semibold tabular-nums text-neutral-900">
                {formatInrDecimal(grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {notes.trim() && (
        <div className="mt-8 border-t border-neutral-200 pt-6">
          <p className="text-sm font-semibold text-neutral-800">Notes</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">{notes.trim()}</p>
        </div>
      )}

      <p className="mt-10 border-t border-neutral-200 pt-6 text-center text-xs leading-relaxed text-neutral-600">
        {SARVADHARA_INVOICE_FROM.enquiryFooter}
      </p>
    </article>
  )
}
