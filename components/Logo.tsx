'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface LogoProps {
  className?: string
  size?: number
  animated?: boolean
  src?: string
  alt?: string
}

export default function Logo({ 
  className = '', 
  size = 80, 
  animated = false,
  src = '/images/logo.png', // Default logo path
  alt = 'STI Logo - Sarvadhara Tech Innovations'
}: LogoProps) {
  const logoContent = (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`} 
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="object-contain w-full h-full"
        priority
        quality={95}
        style={{
          filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.4))',
          maxWidth: '100%',
          height: 'auto',
        }}
        unoptimized={src.endsWith('.svg')} // SVG files don't need optimization
      />
    </div>
  )

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="inline-flex items-center justify-center"
      >
        {logoContent}
      </motion.div>
    )
  }

  return logoContent
}
