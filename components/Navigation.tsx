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
  { name: 'Contact Us', path: '/services#contact' },
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
        <div className="relative flex items-center h-24 md:h-28">
          {/* Logo - Left Aligned */}
          <Link href="/" className="flex items-center group z-10 h-full -ml-2 md:-ml-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <Logo 
                size={600} 
                className="text-platinum-metallic w-auto h-28 md:h-32 max-h-32" 
                src="/images/logo.png"
                alt="Sarvadhara Tech Innovations Logo"
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center space-x-8 absolute left-1/2 transform -translate-x-1/2 w-full">
            {navItems.map((item) => {
              const isActive = pathname === item.path || (item.path.includes('#') && pathname === item.path.split('#')[0])
              const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                if (item.path.includes('#')) {
                  e.preventDefault()
                  const [path, hash] = item.path.split('#')
                  if (pathname === path) {
                    // If already on the page, scroll to the section
                    const element = document.getElementById(hash)
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  } else {
                    // Navigate to the page first, then scroll
                    window.location.href = item.path
                  }
                }
              }
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={handleClick}
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
            className="md:hidden text-platinum-200 hover:text-platinum-metallic transition-colors z-10 ml-auto"
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
              const isActive = pathname === item.path || (item.path.includes('#') && pathname === item.path.split('#')[0])
              const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                setMobileMenuOpen(false)
                if (item.path.includes('#')) {
                  e.preventDefault()
                  const [path, hash] = item.path.split('#')
                  if (pathname === path) {
                    // If already on the page, scroll to the section
                    setTimeout(() => {
                      const element = document.getElementById(hash)
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }, 100)
                  } else {
                    // Navigate to the page first, then scroll
                    window.location.href = item.path
                  }
                }
              }
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={handleClick}
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

