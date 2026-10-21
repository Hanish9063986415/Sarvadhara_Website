/** Absolute site URL for share links (WhatsApp invoice URLs). */
export function appBaseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.VERCEL_URL?.trim()
  if (!fromEnv) return 'http://localhost:3000'
  return fromEnv.startsWith('http') ? fromEnv.replace(/\/$/, '') : `https://${fromEnv}`
}

export function maintenanceInvoicePublicUrl(shareId: string): string {
  return `${appBaseUrl()}/maintenance-invoice/${encodeURIComponent(shareId)}`
}
