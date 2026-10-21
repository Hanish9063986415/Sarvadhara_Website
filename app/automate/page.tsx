'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import AutomateShell from '@/components/automate/AutomateShell'
import AutomateOverviewAlertsSection from '@/components/automate/AutomateOverviewAlertsSection'

export default function AutomatePage() {
  return (
    <AutomateShell title="Overview" subtitle="Live notifications and reminders across your CRM">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full min-w-0 max-w-5xl space-y-6"
      >
        <AutomateOverviewAlertsSection />

        <div className="flex justify-center pb-2 pt-2">
          <Link
            href="/"
            className="inline-flex text-sm text-platinum-500 hover:text-platinum-metallic transition-colors"
          >
            ← Back to public site
          </Link>
        </div>
      </motion.div>
    </AutomateShell>
  )
}
