'use client'

import { formatInr } from '@/lib/format-currency'
import { maintenanceGstBreakdown } from '@/lib/maintenance-gst'

/** Primary amount with ex-GST + IGST sublines (billing table). */
export function MaintenanceTaxableWithGst({
  taxable,
  primaryClassName = 'crm-stat-sm',
  emphasizeTotalWhenDue,
}: {
  taxable: number
  primaryClassName?: string
  /** When true, show incl-GST total as the main line (for due/balance). */
  emphasizeTotalWhenDue?: boolean
}) {
  const { gstAmount, totalInclGst, gstPercent } = maintenanceGstBreakdown(taxable)

  if (taxable <= 0) {
    return <p className={primaryClassName}>₹0</p>
  }

  if (emphasizeTotalWhenDue) {
    return (
      <div>
        <p className={`${primaryClassName} text-platinum-100`}>{formatInr(totalInclGst)}</p>
        <p className="mt-0.5 text-[9px] leading-snug text-platinum-600">
          {formatInr(taxable)} + {gstPercent}% IGST {formatInr(gstAmount)}
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className={primaryClassName}>{formatInr(taxable)}</p>
      <p className="mt-0.5 text-[9px] leading-snug text-violet-200/75">
        Incl. {gstPercent}% GST · {formatInr(totalInclGst)}
      </p>
    </div>
  )
}
