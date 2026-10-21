'use client'

import { motion } from 'framer-motion'
import { ArrowDown, Code, Users, ArrowRight, User, Scale, Wrench } from 'lucide-react'
import Shrimp from '@/components/Shrimp'
import PortfolioWorksGrid from '@/components/PortfolioWorksGrid'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

function CountUpNumber({ end, suffix = '', prefix = '' }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 1800
          const steps = 60
          const increment = end / steps
          let current = 0
          const interval = setInterval(() => {
            current += increment
            if (current >= end) {
              setCount(end)
              clearInterval(interval)
            } else {
              setCount(Math.floor(current))
            }
          }, duration / steps)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end])

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-luxury-black">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-black via-luxury-black to-luxury-black" />

        {/* Elegant Corner Accents */}
        <div className="absolute top-0 left-0 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 border-l-2 border-platinum-metallic/10" />
        <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 border-r-2 border-platinum-metallic/10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 border-l-2 border-platinum-metallic/10" />
        <div className="absolute bottom-0 right-0 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 border-r-2 border-platinum-metallic/10" />

        {/* Content Layout */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-center min-h-screen py-24 sm:py-28 md:py-32">
            
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col items-center text-center max-w-5xl space-y-4 sm:space-y-6 md:space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-1 sm:space-y-2 md:space-y-3 px-2"
              >
                <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-platinum-metallic uppercase leading-[0.95] tracking-tight">
                  WE BUILD WHAT
                </h1>
                <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-display font-bold text-platinum-metallic uppercase leading-[0.95] tracking-tight">
                  THE FUTURE RUNS ON
                </h1>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="text-sm sm:text-base md:text-lg lg:text-xl text-platinum-200 font-light tracking-normal leading-relaxed max-w-2xl md:max-w-3xl px-4 md:px-0"
              >
                Sarvadhara Tech Innovations was founded under the belief that a future where businesses are empowered with cutting-edge, high-tech solutions is fundamentally more exciting than one where they are not.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center items-stretch sm:items-center pt-6 md:pt-8 w-full sm:w-auto px-4 sm:px-0"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link
                    href="/services"
                    className="group relative inline-flex items-center justify-center px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 w-full sm:w-auto min-w-[120px] sm:min-w-[130px] rounded-full overflow-hidden backdrop-blur-md"
                  >
                    {/* Elegant gradient background */}
                    <span className="absolute inset-0 bg-gradient-to-br from-platinum-metallic/5 via-platinum-metallic/10 to-platinum-metallic/5 rounded-full group-hover:from-platinum-metallic/15 group-hover:via-platinum-metallic/20 group-hover:to-platinum-metallic/15 transition-all duration-500" />
                    
                    {/* Subtle border with rounded corners */}
                    <span className="absolute inset-0 rounded-full border border-platinum-metallic/30 group-hover:border-platinum-metallic/70 transition-all duration-300" />
                    
                    {/* Outer glow effect */}
                    <span className="absolute inset-0 rounded-full border border-platinum-metallic/10 group-hover:border-platinum-metallic/30 blur-xl transition-all duration-300 -z-10" />
                    
                    {/* Inner shadow for depth */}
                    <span className="absolute inset-0 rounded-full shadow-inner shadow-black/20 group-hover:shadow-black/30 transition-all duration-300" />
                    
                    {/* Text with elegant styling */}
                    <span className="relative z-10 text-platinum-metallic font-medium text-xs sm:text-xs md:text-sm uppercase tracking-wider group-hover:tracking-widest transition-all duration-300">
                      EXPLORE
                    </span>
                    
                    {/* Arrow icon with smooth animation */}
                    <ArrowRight className="relative z-10 ml-1.5 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-platinum-metallic group-hover:translate-x-1.5 transition-transform duration-300" />
                    
                    {/* Elegant shine sweep */}
                    <span className="absolute inset-0 rounded-full -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link
                    href="/product"
                    className="group relative inline-flex items-center justify-center px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 w-full sm:w-auto min-w-[150px] sm:min-w-[160px] rounded-full overflow-hidden backdrop-blur-md"
                  >
                    {/* Rich gradient background for primary button */}
                    <span className="absolute inset-0 bg-gradient-to-br from-platinum-metallic/15 via-platinum-metallic/25 to-platinum-metallic/15 rounded-full group-hover:from-platinum-metallic/25 group-hover:via-platinum-metallic/35 group-hover:to-platinum-metallic/25 transition-all duration-500" />
                    
                    {/* Prominent border with glow */}
                    <span className="absolute inset-0 rounded-full border-2 border-platinum-metallic/50 group-hover:border-platinum-metallic shadow-[0_0_25px_rgba(255,255,255,0.15)] group-hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] transition-all duration-300" />
                    
                    {/* Enhanced outer glow */}
                    <span className="absolute inset-0 rounded-full border border-platinum-metallic/20 group-hover:border-platinum-metallic/40 blur-2xl transition-all duration-300 -z-10" />
                    
                    {/* Inner highlight for premium feel */}
                    <span className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Text with premium styling */}
                    <span className="relative z-10 text-platinum-metallic font-semibold text-xs sm:text-xs md:text-sm uppercase tracking-wider group-hover:tracking-widest transition-all duration-300">
                      DISCOVER SAAMRAS
                    </span>
                    
                    {/* Arrow icon with enhanced animation */}
                    <ArrowRight className="relative z-10 ml-1.5 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-platinum-metallic group-hover:translate-x-1.5 transition-transform duration-300" />
                    
                    {/* Premium shine sweep */}
                    <span className="absolute inset-0 rounded-full -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, repeat: Infinity, repeatType: 'reverse', duration: 2 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30"
        >
          <ArrowDown className="w-6 h-6 text-platinum-200" />
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="py-0 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative glass-morphism rounded-2xl border border-platinum-metallic/20 overflow-hidden"
        >
          {/* Subtle top glow line */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-platinum-metallic/40 to-transparent" />

          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-platinum-metallic/15">
            {[
              { value: 16, suffix: '+', label: 'Projects Delivered', sub: 'Across diverse industries' },
              { value: 11, suffix: '+', label: 'Happy Clients', sub: 'Businesses empowered' },
              { value: 5,  suffix: '',  label: 'IIT Partnerships', sub: 'Madras · Ropar · Hyderabad' },
              { value: 75, suffix: '',  prefix: 'TOP ', label: 'Startups in India', sub: 'BUILD Programme by IIT-H' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="group flex flex-col items-center justify-center text-center py-10 px-6 hover:bg-platinum-metallic/5 transition-colors duration-300 relative"
              >
                {/* Hover accent dot */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-platinum-metallic/0 group-hover:bg-platinum-metallic/60 transition-all duration-500" />

                <p className="text-4xl sm:text-5xl font-display font-bold text-platinum-metallic tracking-tight mb-1 tabular-nums">
                  <CountUpNumber end={stat.value} suffix={stat.suffix} prefix={stat.prefix ?? ''} />
                </p>
                <p className="text-sm sm:text-base font-medium text-platinum-200 uppercase tracking-widest mb-1">
                  {stat.label}
                </p>
                <p className="text-xs text-platinum-500 tracking-wide">
                  {stat.sub}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Subtle bottom glow line */}
          <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-platinum-metallic/20 to-transparent" />
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-32 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-luxury text-platinum-metallic mb-6">
            About the Company
          </h2>
          <div className="w-24 h-0.5 bg-platinum-metallic mx-auto mb-8" />
        </motion.div>

        <div className="space-y-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-morphism rounded-lg p-8"
          >
            <h3 className="text-3xl font-luxury text-platinum-metallic mb-4">Innovation</h3>
            <p className="text-platinum-200 text-lg leading-relaxed">
              At Sarvadhara Tech Innovations, we don't just follow trends—we create them. Our commitment to innovation drives us to explore uncharted territories in technology, delivering solutions that transform industries and redefine possibilities.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-morphism rounded-lg p-8"
          >
            <h3 className="text-3xl font-luxury text-platinum-metallic mb-4">Technology Excellence</h3>
            <p className="text-platinum-200 text-lg leading-relaxed">
              Excellence is not an option—it's our standard. Every line of code, every system architecture, and every product we deliver is crafted with meticulous attention to detail, ensuring unparalleled quality and performance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-morphism rounded-lg p-8"
          >
            <h3 className="text-3xl font-luxury text-platinum-metallic mb-4">Real-World Impact</h3>
            <p className="text-platinum-200 text-lg leading-relaxed">
              Our solutions don't exist in isolation—they solve real problems for real businesses. From streamlining operations to automating complex processes, we create technology that makes a tangible difference in the world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Two Operating Wings */}
      <section className="py-32 px-6 bg-gradient-to-b from-luxury-black to-luxury-black">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 max-w-6xl mx-auto"
        >
          <h2 className="text-5xl md:text-6xl font-luxury text-platinum-metallic mb-6">
            Our Two Operating Wings
          </h2>
          <div className="w-24 h-0.5 bg-platinum-metallic mx-auto" />
        </motion.div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Wing 1 - Software Development */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-morphism rounded-xl p-10 premium-hover group"
          >
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-lg bg-platinum-metallic/15 border-2 border-platinum-300/60 flex items-center justify-center mr-4 group-hover:bg-platinum-metallic/25 transition-colors">
                <Code className="w-8 h-8 text-platinum-metallic" />
              </div>
              <h3 className="text-4xl font-luxury text-platinum-metallic">Software Development</h3>
            </div>
            
            <div className="space-y-6 mt-8">
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 rounded-full bg-platinum-metallic mt-2 flex-shrink-0" />
                <div>
                  <h4 className="text-xl font-medium text-platinum-300 mb-2">Website Development</h4>
                  <p className="text-platinum-200">Premium, responsive websites that combine stunning design with cutting-edge functionality.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 rounded-full bg-platinum-metallic mt-2 flex-shrink-0" />
                <div>
                  <h4 className="text-xl font-medium text-platinum-300 mb-2">Mobile App Development</h4>
                  <p className="text-platinum-200">Native and cross-platform mobile applications that deliver exceptional user experiences.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 rounded-full bg-platinum-metallic mt-2 flex-shrink-0" />
                <div>
                  <h4 className="text-xl font-medium text-platinum-300 mb-2">Custom Software Solutions</h4>
                  <p className="text-platinum-200">Tailored software systems designed to meet your unique business requirements.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 rounded-full bg-platinum-metallic mt-2 flex-shrink-0" />
                <div>
                  <h4 className="text-xl font-medium text-platinum-300 mb-2">Enterprise Systems</h4>
                  <p className="text-platinum-200">Scalable enterprise-grade solutions that power large organizations.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Wing 2 - SAAMRAS Product Division */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-morphism rounded-xl p-10 premium-hover group"
          >
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-lg bg-platinum-metallic/15 border-2 border-platinum-300/60 flex items-center justify-center mr-4 group-hover:bg-platinum-metallic/25 transition-colors">
                <Shrimp size={32} className="text-platinum-metallic" />
              </div>
              <h3 className="text-4xl font-luxury text-platinum-metallic">Product Division</h3>
            </div>
            
            <div className="mb-6">
              <h4 className="text-2xl font-luxury text-platinum-metallic mb-4">SAAMRAS</h4>
              <p className="text-platinum-300 text-lg leading-relaxed mb-6">
                Automated quality assessment and grading solution for shrimp farming in aquaculture. Eliminates manual processes, reduces errors, and delivers the best accuracy at an affordable cost.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-platinum-metallic" />
                <span className="text-platinum-200">Automated Quality Assessment & Grading</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-platinum-metallic" />
                <span className="text-platinum-300">Eliminates 20-30 Manual Workers Per Task</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-platinum-metallic" />
                <span className="text-platinum-300">Best Accuracy at Affordable Cost</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-platinum-metallic" />
                <span className="text-platinum-300">Zero Human Intervention</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-platinum-metallic" />
                <span className="text-platinum-300">Helps Avoid Business Losses</span>
              </div>
            </div>
            
            <Link
              href="/product"
              className="mt-8 inline-block px-6 py-3 border-2 border-platinum-300/60 text-platinum-metallic rounded-lg hover:border-platinum-200 transition-all duration-300 premium-hover"
            >
              Learn More →
            </Link>
          </motion.div>
        </div>
      </section>

      <PortfolioWorksGrid
        title="Our Recent Works"
        subtitle="Sixteen live products across e-commerce, education, sports, finance, and social impact"
      />

      {/* Founders & Directors */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-luxury text-platinum-metallic mb-6">
            Founders & Directors
          </h2>
          <div className="w-24 h-0.5 bg-platinum-metallic mx-auto mb-8" />
          <p className="text-platinum-200 text-lg max-w-2xl mx-auto">
            Visionary leaders driving innovation and excellence
          </p>
        </motion.div>

        <div className="space-y-16 md:space-y-20">
          {/* Directors Row - Centered */}
          <div className="flex justify-center gap-12 md:gap-16">
            {[
              { name: 'Sundarapalli Sateesh', role: 'Director', image: '/images/team/director-1.jpeg' },
              { name: 'Sundarapalli Suneetha', role: 'Director', image: '/images/team/Director-2.jpeg' },
            ].map((member, i) => {
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="text-center w-full max-w-xs"
                >
                  <div className="w-40 h-40 md:w-48 md:h-48 mx-auto mb-6 rounded-full overflow-hidden relative ring-2 ring-platinum-metallic/20 hover:ring-platinum-metallic/40 transition-all duration-300">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={192}
                      height={192}
                      className="w-full h-full object-cover"
                      style={i === 1 ? { objectPosition: '50% 20%' } : undefined}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon')
                        if (fallback) fallback.classList.remove('hidden')
                      }}
                    />
                    <User className="w-20 h-20 text-platinum-metallic/50 fallback-icon hidden absolute inset-0 m-auto" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-luxury text-platinum-metallic mb-2">{member.name}</h3>
                  <p className="text-platinum-200 text-sm md:text-base mb-3">{member.role}</p>
                  <p className="text-platinum-300 text-sm md:text-base leading-relaxed">
                    Strategic leadership and vision for company growth
                  </p>
                </motion.div>
              )
            })}
          </div>

          {/* Founder, Legal Advisor, Head of Product Development Row */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
            {[
              { name: 'Hanish Venkat', role: 'Founder and CEO', image: '/images/team/founder-ceo.jpeg', icon: Users },
              { name: 'Tarun', role: 'Legal Advisor', image: '/images/team/legal-advisor.jpeg', icon: Scale },
              { name: 'Gandham Prakash', role: 'Head of Product Development', image: '/images/team/Prakash.png', icon: Wrench },
            ].map((member, i) => {
              const Icon = member.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: (i + 2) * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="w-40 h-40 md:w-48 md:h-48 mx-auto mb-6 rounded-full overflow-hidden relative ring-2 ring-platinum-metallic/20 hover:ring-platinum-metallic/40 transition-all duration-300 bg-platinum-metallic/5">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={192}
                      height={192}
                      className="w-full h-full object-cover"
                      style={
                        member.role === 'Head of Product Development' 
                          ? { objectPosition: '90% 40%' } 
                          : member.role === 'Legal Advisor'
                          ? { objectPosition: '50% 25%' }
                          : { objectPosition: '50% 30%' }
                      }
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon')
                        if (fallback) fallback.classList.remove('hidden')
                      }}
                    />
                    <Icon className="w-20 h-20 text-platinum-metallic/50 fallback-icon hidden absolute inset-0 m-auto" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-luxury text-platinum-metallic mb-2">{member.name}</h3>
                  <p className="text-platinum-200 text-sm md:text-base mb-3">{member.role}</p>
                  <p className="text-platinum-300 text-sm md:text-base leading-relaxed">
                    {member.role === 'Founder and CEO' && 'Visionary leader driving innovation and excellence'}
                    {member.role === 'Legal Advisor' && 'Expert legal guidance and compliance management'}
                    {member.role === 'Head of Product Development' && 'Leading product innovation and development'}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}

