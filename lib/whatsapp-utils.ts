/** Digits only for wa.me (India default 91 when 10-digit mobile). */
export function normalizeWhatsAppPhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, '')
  if (!digits) return null
  if (digits.length === 10) digits = `91${digits}`
  if (digits.startsWith('0')) digits = digits.replace(/^0+/, '')
  if (digits.length < 11 || digits.length > 15) return null
  return digits
}

export function whatsAppChatUrl(phoneE164Digits: string, message: string): string {
  const text = encodeURIComponent(message)
  return `https://wa.me/${phoneE164Digits}?text=${text}`
}
