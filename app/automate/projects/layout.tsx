'use client'

import { usePathname } from 'next/navigation'
import { AUTOMATE_PROJECTS_LOGIN_PATH } from '@/lib/automate-routes'
import ProjectsCeoNav from '@/components/automate/ProjectsCeoNav'

export default function AutomateProjectsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === AUTOMATE_PROJECTS_LOGIN_PATH

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <>
      <ProjectsCeoNav />
      {children}
    </>
  )
}
