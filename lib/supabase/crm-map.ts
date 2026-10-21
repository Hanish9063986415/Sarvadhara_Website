/** Map DB snake_case rows ↔ app TypeScript types */

export function isoFromDate(value: string | null | undefined): string {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  return value.slice(0, 10)
}

export function isoFromTimestamptz(value: string | null | undefined): string {
  if (!value) return new Date().toISOString()
  return value
}

export function dateOrNull(iso: string): string | null {
  if (typeof iso === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  return null
}
