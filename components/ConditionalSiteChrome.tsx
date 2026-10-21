'use client'

import { usePathname } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import SplashScreen from '@/components/SplashScreen'
import { isAutomatePath } from '@/lib/automate-routes'

export default function ConditionalSiteChrome({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const hidePublicChrome = isAutomatePath(pathname)

  return (
    <>
      {!hidePublicChrome && <SplashScreen />}
      {!hidePublicChrome && <Navigation />}
      {children}
      {!hidePublicChrome && <Footer />}
    </>
  )
}
