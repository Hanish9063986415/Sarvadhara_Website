'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Logo from './Logo'

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Show splash for 2.5 seconds, then fade out
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] bg-luxury-black flex items-center justify-center overflow-hidden"
        >
          {/* Subtle background elements */}
          <div className="absolute inset-0 opacity-[0.02]">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="splash-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,1)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#splash-grid)" />
            </svg>
          </div>

          {/* Center accent lines */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-platinum-metallic/5 to-transparent" />
          <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-platinum-metallic/5 to-transparent" />

          {/* Logo Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              duration: 1.2, 
              ease: [0.22, 1, 0.36, 1],
              delay: 0.2
            }}
            className="text-center relative z-10"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="flex justify-center w-full"
            >
              <Logo 
                size={2400} 
                animated={true} 
                className="text-platinum-metallic w-full max-w-[75vw] h-auto" 
                src="/logo/logo.png"
                alt="Sarvadhara Tech Innovations Logo"
              />
            </motion.div>
          </motion.div>

          {/* Fade out overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 2 }}
            className="absolute inset-0 bg-luxury-black"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

