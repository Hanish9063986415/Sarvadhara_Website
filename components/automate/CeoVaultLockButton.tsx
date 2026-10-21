'use client'

import { Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AUTOMATE_PROJECTS_LOGIN_PATH } from '@/lib/automate-routes'

export default function CeoVaultLockButton() {
  const router = useRouter()
  const [lockingVault, setLockingVault] = useState(false)

  async function lockProjectsVault() {
    setLockingVault(true)
    try {
      await fetch('/api/automate/projects-auth/logout', { method: 'POST' })
      router.push(AUTOMATE_PROJECTS_LOGIN_PATH)
      router.refresh()
    } finally {
      setLockingVault(false)
    }
  }

  return (
    <button
      type="button"
      onClick={lockProjectsVault}
      disabled={lockingVault}
      className="inline-flex items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-2.5 text-xs uppercase tracking-wider text-amber-100 hover:bg-amber-500/15 disabled:opacity-50 transition-colors"
    >
      <Lock className="w-4 h-4" />
      {lockingVault ? 'Locking…' : 'End admin session'}
    </button>
  )
}
