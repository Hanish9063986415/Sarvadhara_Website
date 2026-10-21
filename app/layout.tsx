import type { Metadata } from 'next'
import { Playfair_Display, Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import ConditionalSiteChrome from '@/components/ConditionalSiteChrome'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-luxury',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sarvadhara Tech Innovations | Shaping the Future with Technological Excellence',
  description: 'Premium technology solutions and innovative products. Software development, enterprise systems, and SAAMRAS automation solutions.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${playfair.variable} ${cormorant.variable} ${inter.variable} font-sans bg-luxury-black text-platinum-light antialiased`}>
        <ConditionalSiteChrome>{children}</ConditionalSiteChrome>
      </body>
    </html>
  )
}

