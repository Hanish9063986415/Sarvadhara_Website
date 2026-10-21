'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Sparkles, Terminal } from 'lucide-react'
import Link from 'next/link'
import { AUTOMATE_BASE_PATH } from '@/lib/automate-routes'

export default function AutomateError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Automate]', error)
  }, [error])

  const isChunkError =
    error.message.includes('948.js') ||
    error.message.includes('Loading chunk') ||
    error.message.includes('Cannot find module') ||
    error.message.includes('main-app.js')

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-1/3 h-80 w-80 rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-8 shadow-2xl shadow-black/60 backdrop-blur-xl"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-400/30 bg-red-500/10">
            <AlertTriangle className="h-6 w-6 text-red-200" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.22em] text-platinum-500">Automate workspace</p>
            <h1 className="mt-1 text-2xl font-luxury text-platinum-metallic">Something went wrong</h1>
            <p className="mt-2 text-sm text-platinum-400 leading-relaxed">
              {isChunkError
                ? 'The dev build cache is out of date. This usually fixes itself after a clean restart.'
                : 'An unexpected error occurred while loading this page.'}
            </p>
          </div>
        </div>

        {isChunkError && (
          <div className="mt-6 rounded-xl border border-white/10 bg-black/40 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-platinum-500">
              <Terminal className="h-3.5 w-3.5" />
              Quick fix (terminal)
            </div>
            <code className="block text-xs text-emerald-200/90 leading-relaxed whitespace-pre-wrap">
              {`npm run dev:clean\n# then hard-refresh the browser (Ctrl+Shift+R)`}
            </code>
            <p className="mt-2 text-[11px] text-platinum-500">
              Do not run `npm run build` or `npm run start` while `npm run dev` is open — that breaks static chunks.
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-xl border border-platinum-300/30 bg-platinum-metallic/10 px-4 py-2.5 text-xs uppercase tracking-wider text-platinum-metallic hover:bg-platinum-metallic/15 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href={AUTOMATE_BASE_PATH}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs uppercase tracking-wider text-platinum-400 hover:text-platinum-metallic transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Overview
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && error.message && (
          <p className="mt-6 truncate rounded-lg border border-white/5 bg-black/30 px-3 py-2 text-[10px] text-platinum-600 font-mono">
            {error.message}
          </p>
        )}
      </motion.div>
    </div>
  )
}
