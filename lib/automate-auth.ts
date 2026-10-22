export const AUTOMATE_SESSION_COOKIE = 'automate_session'

const encoder = new TextEncoder()

function bytesToBase64Url(bytes: ArrayBuffer): string {
  const u8 = new Uint8Array(bytes)
  let binary = ''
  for (let i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i]!)
  const b64 =
    typeof btoa === 'function'
      ? btoa(binary)
      : typeof Buffer !== 'undefined'
        ? Buffer.from(u8).toString('base64')
        : ''
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function hmacSign(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  return bytesToBase64Url(signature)
}

/** Returns a short admin-facing reason when Automate auth env is incomplete. */
export function getAutomateAuthSetupError(): string | null {
  if (!process.env.AUTOMATE_USERNAME?.trim()) return 'AUTOMATE_USERNAME is not set'
  if (!process.env.AUTOMATE_PASSWORD) return 'AUTOMATE_PASSWORD is not set'
  if (!process.env.AUTOMATE_SESSION_SECRET?.trim()) return 'AUTOMATE_SESSION_SECRET is not set'
  return null
}

export const AUTOMATE_AUTH_SETUP_USER_MESSAGE =
  'Automate sign-in is not configured on the server. In your hosting dashboard (e.g. Vercel), set AUTOMATE_USERNAME, AUTOMATE_PASSWORD, and AUTOMATE_SESSION_SECRET, then redeploy.'

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export async function createSessionToken(): Promise<string> {
  const secret = process.env.AUTOMATE_SESSION_SECRET
  if (!secret) {
    throw new Error('AUTOMATE_SESSION_SECRET is not configured')
  }
  const issuedAt = Date.now().toString()
  const nonce = crypto.randomUUID()
  const payload = `${issuedAt}.${nonce}`
  const signature = await hmacSign(payload, secret)
  return `${payload}.${signature}`
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  const secret = process.env.AUTOMATE_SESSION_SECRET
  if (!token || !secret) return false

  const parts = token.split('.')
  if (parts.length !== 3) return false

  const [issuedAt, nonce, signature] = parts
  if (!issuedAt || !nonce || !signature) return false

  const maxAgeMs = 7 * 24 * 60 * 60 * 1000
  const issued = Number(issuedAt)
  if (!Number.isFinite(issued) || Date.now() - issued > maxAgeMs) return false

  const payload = `${issuedAt}.${nonce}`
  const expected = await hmacSign(payload, secret)
  return timingSafeEqualString(signature, expected)
}

export async function validateAutomateCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const expectedUsername = process.env.AUTOMATE_USERNAME
  const expectedPassword = process.env.AUTOMATE_PASSWORD

  if (!expectedUsername || !expectedPassword) return false

  const normalizedInput = username.trim().toLowerCase()
  const normalizedExpected = expectedUsername.trim().toLowerCase()
  const userOk = timingSafeEqualString(normalizedInput, normalizedExpected)
  const passOk = timingSafeEqualString(password, expectedPassword)
  return userOk && passOk
}
