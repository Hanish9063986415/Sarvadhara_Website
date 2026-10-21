'use client'

import { FormEvent, Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LockKeyhole, Shield, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AUTOMATE_BASE_PATH, AUTOMATE_PROJECTS_VAULT_PATH } from '@/lib/automate-routes'

function ProjectsTeamLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') || AUTOMATE_PROJECTS_VAULT_PATH
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/automate/projects-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? 'Access denied. Admin credentials only.')
        return
      }

      router.push(nextPath.startsWith('/automate/projects/vault') ? nextPath : AUTOMATE_PROJECTS_VAULT_PATH)
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
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-500/10 shadow-[0_0_40px_rgba(245,158,11,0.12)]">
            <Shield className="h-7 w-7 text-amber-200/90" />
          </div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-platinum-500 mb-2">Restricted zone</p>
          <h1 className="text-3xl font-luxury text-platinum-metallic">Admin · Delete access</h1>
          <p className="mt-2 text-sm text-platinum-400">
            Admin credentials unlock deleting projects. Adding and editing stays available with the regular Automate login.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-amber-400/15 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 sm:p-8 shadow-2xl shadow-black/50 backdrop-blur-xl"
        >
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-xs text-platinum-400 leading-relaxed">
            <LockKeyhole className="w-4 h-4 shrink-0 text-amber-300/80 mt-0.5" />
            Required only to delete a project. Everyone else can add and edit.
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="ceo-email" className="crm-label">
                Admin email
              </label>
              <input
                id="ceo-email"
                type="email"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="crm-input"
                placeholder="Enter admin email"
                required
              />
            </div>
            <div>
              <label htmlFor="ceo-password" className="crm-label">
                Password
              </label>
              <input
                id="ceo-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="crm-input"
                placeholder="Enter password"
                required
              />
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
            className="mt-6 w-full rounded-xl border border-amber-400/35 bg-amber-500/10 py-3.5 text-sm font-medium uppercase tracking-wider text-amber-100 hover:bg-amber-500/15 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Verifying…' : 'Unlock admin delete'}
          </motion.button>
        </form>

        <Link
          href={AUTOMATE_BASE_PATH}
          className="mt-6 flex items-center justify-center gap-2 text-sm text-platinum-500 hover:text-platinum-metallic transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Back to Automate overview
        </Link>
      </motion.div>
    </div>
  )
}

export default function ProjectsTeamLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070708]" />}>
      <ProjectsTeamLoginForm />
    </Suspense>
  )
}
