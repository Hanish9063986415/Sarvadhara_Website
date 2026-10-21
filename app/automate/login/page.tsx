'use client'

import { FormEvent, Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Sparkles, User } from 'lucide-react'
import Link from 'next/link'
import { AUTOMATE_BASE_PATH } from '@/lib/automate-routes'

function AutomateLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') || AUTOMATE_BASE_PATH

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/automate/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? 'Sign in failed. Please try again.')
        return
      }

      router.push(nextPath.startsWith(AUTOMATE_BASE_PATH) ? nextPath : AUTOMATE_BASE_PATH)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_40px_rgba(255,255,255,0.06)]">
            <Sparkles className="h-7 w-7 text-platinum-metallic" />
          </div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-platinum-500 mb-2">
            Sarvadhara Tech Innovations
          </p>
          <h1 className="text-3xl font-luxury text-platinum-metallic">Sarvadhara CRM</h1>
          <p className="mt-2 text-sm text-platinum-400">Automate · Secure workspace sign-in</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 sm:p-8 shadow-2xl shadow-black/50 backdrop-blur-xl"
        >
          <div className="space-y-5">
            <div>
              <label htmlFor="username" className="mb-2 block text-xs font-medium uppercase tracking-wider text-platinum-400">
                Email
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-platinum-500" />
                <input
                  id="username"
                  name="username"
                  type="email"
                  inputMode="email"
                  autoComplete="username email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-sm text-platinum-100 placeholder:text-platinum-600 focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                  placeholder="Enter your registered email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-medium uppercase tracking-wider text-platinum-400">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-platinum-500" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-sm text-platinum-100 placeholder:text-platinum-600 focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="mt-6 w-full rounded-xl border border-platinum-300/40 bg-platinum-metallic/10 py-3.5 text-sm font-medium uppercase tracking-wider text-platinum-metallic transition-colors hover:bg-platinum-metallic/20 hover:border-platinum-200/50 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Enter Automate'}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-xs text-platinum-600">
          Portal URL:{' '}
          <code className="rounded bg-white/5 px-1.5 py-0.5 text-platinum-500">/automate</code>
          {' · '}
          or add{' '}
          <code className="rounded bg-white/5 px-1.5 py-0.5 text-platinum-500">?automate</code> on any page
        </p>

        <Link
          href="/"
          className="mt-4 block text-center text-sm text-platinum-500 hover:text-platinum-metallic transition-colors"
        >
          ← Return to public website
        </Link>
      </motion.div>
    </div>
  )
}

export default function AutomateLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-platinum-500">
          Loading…
        </div>
      }
    >
      <AutomateLoginForm />
    </Suspense>
  )
}
