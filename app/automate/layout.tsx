import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Automate',
  description: 'Sarvadhara Automate — internal CRM workspace',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default function AutomateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070708] text-platinum-light font-sans antialiased">
      {children}
    </div>
  )
}
