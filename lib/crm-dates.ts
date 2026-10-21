/** Parse/store calendar dates without UTC day-shift (YYYY-MM-DD). */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function dateFromIso(iso: string): Date {
  return new Date(`${iso}T12:00:00`)
}

export function isoFromLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Today's date in local timezone as YYYY-MM-DD. */
export function todayIso(reference: Date = new Date()): string {
  return isoFromLocalDate(reference)
}

export function parseIsoDate(iso: string): Date | null {
  if (!ISO_DATE.test(iso)) return null
  const d = dateFromIso(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Calendar date for display (en-IN). */
export function formatCrmDate(iso: string): string {
  if (!iso) return '—'
  const d = ISO_DATE.test(iso) ? dateFromIso(iso) : new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

export function formatCrmDateTime(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

export function formatCrmMonthYear(year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(
    new Date(year, monthIndex, 1)
  )
}

export function formatCrmMonthShort(year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat('en-IN', { month: 'short', year: '2-digit' }).format(
    new Date(year, monthIndex, 1)
  )
}

export function formatCrmDayMonth(date: Date): { monthShort: string; day: number } {
  return {
    monthShort: date.toLocaleString('en-IN', { month: 'short' }),
    day: date.getDate(),
  }
}

/** Header / sidebar: weekday, day month year (en-IN). */
export function formatCrmTodayLong(reference: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(reference)
}

/** Live examples for date inputs (no hardcoded mock years). */
export function crmDateInputPlaceholder(reference: Date = new Date()): string {
  const iso = todayIso(reference)
  const d = dateFromIso(iso)
  const styled = formatCrmDate(iso)
  const dmy = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
  return `${styled} or ${dmy}`
}

export function crmDateInvalidHint(reference: Date = new Date()): string {
  return formatCrmDate(todayIso(reference))
}
