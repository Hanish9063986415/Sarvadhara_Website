'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mail, Phone, MapPin, Linkedin, Instagram } from 'lucide-react'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="border-t-2 border-platinum-300/40 bg-luxury-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-12">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="inline-block mb-4">
              <Logo 
                size={400} 
                className="w-auto h-20 md:h-32 lg:h-36 max-h-36" 
                src="/logo/logo.png"
                alt="Sarvadhara Tech Innovations Logo"
              />
            </Link>
            <p className="text-platinum-500 text-sm">
              Premium technology solutions and innovative products for the modern enterprise.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-lg font-luxury text-platinum-metallic mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-platinum-200 hover:text-platinum-metallic transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-platinum-200 hover:text-platinum-metallic transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/product" className="text-platinum-200 hover:text-platinum-metallic transition-colors">
                  SAAMRAS
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-lg font-luxury text-platinum-metallic mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-platinum-metallic mt-0.5 flex-shrink-0" />
                <a 
                  href="mailto:Sarvadharatechinnovations@gmail.com" 
                  className="text-platinum-200 text-sm hover:text-platinum-metallic transition-colors break-all"
                >
                  Sarvadharatechinnovations@gmail.com
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-platinum-metallic mt-0.5 flex-shrink-0" />
                <a 
                  href="tel:+919063986415" 
                  className="text-platinum-200 text-sm hover:text-platinum-metallic transition-colors"
                >
                  +91 9063986415, +91 9392668228
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Linkedin className="w-5 h-5 text-platinum-metallic mt-0.5 flex-shrink-0" />
                <a 
                  href="https://www.linkedin.com/company/sarvadhara-tech-innovations-pvt-ltd/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-platinum-200 text-sm hover:text-platinum-metallic transition-colors"
                >
                  Sarvadhara Tech Innovations
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Instagram className="w-5 h-5 text-platinum-metallic mt-0.5 flex-shrink-0" />
                <a 
                  href="https://www.instagram.com/sarvadhara.in/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-platinum-200 text-sm hover:text-platinum-metallic transition-colors"
                >
                  Sarvadhara Tech Innovations
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-platinum-metallic mt-0.5 flex-shrink-0" />
                <div className="text-platinum-200 text-sm space-y-1">
                  <div>Vijayawada, Andhra Pradesh, India</div>
                  <div>Hyderabad, Telangana, India</div>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>

        <div className="border-t border-platinum-300/40 pt-8">
            <p className="text-center text-platinum-300 text-sm">
            © {new Date().getFullYear()} Sarvadhara Tech Innovations Private Limited. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

