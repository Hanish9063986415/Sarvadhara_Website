'use client'

import { motion } from 'framer-motion'
import { ArrowDown, Code, Fish, Users } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-luxury-black">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-black via-luxury-black to-luxury-black" />
        
        {/* Classic Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,1)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Elegant Corner Accents */}
        <div className="absolute top-0 left-0 w-64 h-64 border-t-2 border-l-2 border-platinum-metallic/10" />
        <div className="absolute top-0 right-0 w-64 h-64 border-t-2 border-r-2 border-platinum-metallic/10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 border-b-2 border-l-2 border-platinum-metallic/10" />
        <div className="absolute bottom-0 right-0 w-64 h-64 border-b-2 border-r-2 border-platinum-metallic/10" />

        {/* Classic Geometric Circles */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.08, scale: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border border-platinum-metallic/20"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.08, scale: 1 }}
          transition={{ duration: 2, delay: 0.7 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full border border-platinum-metallic/20"
        />

        {/* Elegant Diagonal Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="0" x2="100%" y2="100%" stroke="rgba(255,255,255,1)" strokeWidth="1" />
          <line x1="100%" y1="0" x2="0" y2="100%" stroke="rgba(255,255,255,1)" strokeWidth="1" />
        </svg>

        {/* Subtle Floating Particles */}
        {[...Array(12)].map((_, i) => {
          const positions = [
            { left: '10%', top: '20%' },
            { left: '85%', top: '25%' },
            { left: '15%', top: '75%' },
            { left: '80%', top: '70%' },
            { left: '5%', top: '50%' },
            { left: '95%', top: '45%' },
            { left: '25%', top: '10%' },
            { left: '75%', top: '15%' },
            { left: '30%', top: '85%' },
            { left: '70%', top: '80%' },
            { left: '50%', top: '5%' },
            { left: '50%', top: '95%' },
          ];
          return (
            <motion.div
              key={`particle-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.3, 0.2, 0.3, 0],
                scale: [0, 1, 0.8, 1, 0],
              }}
              transition={{
                duration: 8 + (i % 3) * 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeInOut',
              }}
              className="absolute rounded-full bg-platinum-metallic/20"
              style={{
                width: '4px',
                height: '4px',
                left: positions[i].left,
                top: positions[i].top,
                boxShadow: '0 0 8px rgba(255,255,255,0.3)',
              }}
            />
          );
        })}

        {/* Classic Ornamental Lines */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-platinum-metallic/10 to-transparent" />
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-platinum-metallic/10 to-transparent" />

        {/* Elegant Side Accents */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '200px' }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="absolute left-0 top-1/2 h-px bg-platinum-metallic/15"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '200px' }}
          transition={{ duration: 1.5, delay: 1 }}
          className="absolute right-0 top-1/2 h-px bg-platinum-metallic/15"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-20 text-center px-6 max-w-5xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-display font-light mb-8 text-platinum-metallic text-hero-premium-regular leading-[1.1]"
          >
            Sarvadhara
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-xl md:text-2xl text-platinum-200 mb-12 font-light tracking-wide"
          >
            Shaping the Future with Technological Excellence
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/services"
              className="px-8 py-4 bg-platinum-metallic/15 border-2 border-platinum-300/60 text-platinum-metallic font-medium rounded-lg hover:bg-platinum-metallic/25 hover:border-platinum-200 transition-all duration-300 premium-hover"
            >
              Explore Services
            </Link>
            <Link
              href="/product"
              className="px-8 py-4 bg-platinum-metallic/15 border-2 border-platinum-300/60 text-platinum-metallic font-medium rounded-lg hover:bg-platinum-metallic/25 hover:border-platinum-200 transition-all duration-300 premium-hover"
            >
              Discover SAAMRAS
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, repeat: Infinity, repeatType: 'reverse', duration: 2 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30"
        >
          <ArrowDown className="w-6 h-6 text-platinum-200" />
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
                <Fish className="w-8 h-8 text-platinum-metallic" />
              </div>
              <h3 className="text-4xl font-luxury text-platinum-metallic">Product Division</h3>
            </div>
            
            <div className="mb-6">
              <h4 className="text-2xl font-luxury text-platinum-metallic mb-4">SAAMRAS</h4>
              <p className="text-platinum-300 text-lg leading-relaxed mb-6">
                Revolutionary seafood processing and automation product that transforms the industry through innovation, efficiency, and scalability.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-platinum-metallic" />
                <span className="text-platinum-200">Advanced Automation Technology</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-platinum-metallic" />
                <span className="text-platinum-300">Unmatched Processing Efficiency</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-platinum-metallic" />
                <span className="text-platinum-300">Scalable Enterprise Solutions</span>
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="glass-morphism rounded-xl p-8 text-center premium-hover"
            >
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-platinum-metallic/15 border-2 border-platinum-300/60 flex items-center justify-center overflow-hidden">
                <Users className="w-16 h-16 text-platinum-metallic/50" />
              </div>
              <h3 className="text-2xl font-luxury text-platinum-metallic mb-2">Founder Name</h3>
              <p className="text-platinum-200 text-sm mb-4">Director / Co-Founder</p>
              <p className="text-platinum-300 text-sm leading-relaxed">
                Visionary leader with expertise in technology and innovation
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  )
}

