'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import Logo from './Logo'

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'SAAMRAS', path: '/product' },
]

export default function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 2.8, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 glass-morphism border-b-2 border-platinum-300/40"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-28 md:h-32">
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <Logo size={350} className="text-platinum-metallic w-auto h-20 max-h-20" />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className="relative group"
                >
                  <span
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isActive
                        ? 'text-platinum-metallic'
                        : 'text-platinum-200 hover:text-platinum-metallic'
                    }`}
                  >
                    {item.name}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-platinum-metallic"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-platinum-200 hover:text-platinum-metallic transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4 space-y-4"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block text-base font-medium transition-colors ${
                    isActive
                      ? 'text-platinum-metallic'
                      : 'text-platinum-200 hover:text-platinum-metallic'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}

