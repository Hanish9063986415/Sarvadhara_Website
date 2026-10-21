'use client'

import { motion } from 'framer-motion'
import { Code, Smartphone, Globe, Building2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import PortfolioWorksGrid from '@/components/PortfolioWorksGrid'

const services = [
  {
    icon: Globe,
    title: 'Website Development',
    description: 'Transform your digital presence with bespoke web solutions featuring modern frameworks, seamless user interfaces, and enterprise-level performance optimization.',
  },
  {
    icon: Smartphone,
    title: 'Mobile App Development',
    description: 'Create powerful mobile experiences with our full-stack development approach, delivering intuitive applications that engage users and drive business growth.',
  },
  {
    icon: Code,
    title: 'Custom Software Solutions',
    description: 'Build purpose-driven applications from the ground up, engineered to solve complex challenges and accelerate your organization\'s digital transformation journey.',
  },
  {
    icon: Building2,
    title: 'Enterprise Systems',
    description: 'Deploy mission-critical infrastructure with advanced integration capabilities, comprehensive security protocols, and future-ready scalability frameworks.',
  },
]

const testimonials = [
  {
    quote: 'Sarvadhara Tech Innovations transformed our business operations with their exceptional software solutions. The attention to detail and commitment to excellence is unmatched.',
    author: 'CEO, Enterprise Client',
    company: 'Fortune 500 Company',
  },
  {
    quote: 'Working with STI has been a game-changer. Their innovative approach and technical expertise delivered results that exceeded our expectations.',
    author: 'CTO, Tech Startup',
    company: 'Innovation Leader',
  },
  {
    quote: 'The team at Sarvadhara Tech Innovations combines cutting-edge technology with business acumen. They truly understand how to build solutions that drive real value.',
    author: 'Director, Manufacturing',
    company: 'Industry Leader',
  },
]

export default function Services() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: '',
    message: '',
  })

  useEffect(() => {
    // Handle hash navigation on page load
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash === '#contact') {
        setTimeout(() => {
          const element = document.getElementById('contact')
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 500)
      }
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  return (
    <main className="min-h-screen bg-luxury-black pt-16 sm:pt-20 md:pt-24">
      {/* Hero Section */}
      <section className="py-24 sm:py-28 md:py-32 px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-luxury text-platinum-metallic mb-4 sm:mb-6 px-2">
            Services & Client Works
          </h1>
          <div className="w-24 h-0.5 bg-platinum-metallic mx-auto mb-6 sm:mb-8" />
          <p className="text-base sm:text-lg md:text-xl text-platinum-200 max-w-2xl mx-auto px-4">
            Premium technology solutions crafted with precision and excellence
          </p>
        </motion.div>
      </section>

      {/* Software Services */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-luxury text-platinum-metallic mb-4 sm:mb-6 px-2">
            Software Services
          </h2>
          <div className="w-24 h-0.5 bg-platinum-metallic mx-auto" />
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="glass-morphism rounded-xl p-6 premium-hover group"
              >
                <div className="w-14 h-14 rounded-lg bg-platinum-metallic/15 border-2 border-platinum-300/60 flex items-center justify-center mb-4 group-hover:bg-platinum-metallic/25 transition-colors">
                  <Icon className="w-7 h-7 text-platinum-metallic" />
                </div>
                <h3 className="text-xl font-luxury text-platinum-metallic mb-3">
                  {service.title}
                </h3>
                <p className="text-platinum-200 text-sm leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </section>

      <PortfolioWorksGrid
        id="our-works"
        title="Our Works"
        subtitle="Every link below is a live product we designed, engineered, and shipped"
        className="py-20 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-24"
      />

      {/* Testimonials */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-luxury text-platinum-metallic mb-6">
            Client Testimonials
          </h2>
          <div className="w-24 h-0.5 bg-platinum-metallic mx-auto" />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-morphism rounded-xl p-8 premium-hover"
            >
              <div className="text-6xl font-luxury text-platinum-metallic/20 mb-4 leading-none">
                "
              </div>
              <p className="text-platinum-200 mb-6 leading-relaxed">
                {testimonial.quote}
              </p>
              <div className="border-t border-platinum-300/40 pt-4">
                <p className="text-platinum-metallic font-medium mb-1">
                  {testimonial.author}
                </p>
                <p className="text-platinum-300 text-sm">
                  {testimonial.company}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Our Clients */}
      <section className="py-20 px-6 max-w-7xl mx-auto overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-luxury text-platinum-metallic mb-6">
            Our Clients
          </h2>
          <div className="w-24 h-0.5 bg-platinum-metallic mx-auto" />
          <p className="text-platinum-300 mt-6 max-w-2xl mx-auto">
            Trusted by leading businesses across industries
          </p>
        </motion.div>

        {/* Infinite Scrolling Marquee */}
        <div className="relative">
          {/* Gradient Overlays for seamless fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-40 md:w-64 bg-gradient-to-r from-luxury-black via-luxury-black/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-40 md:w-64 bg-gradient-to-l from-luxury-black via-luxury-black/80 to-transparent z-10 pointer-events-none" />
          
          <div className="overflow-hidden py-8">
            <div className="marquee-container flex gap-8 md:gap-12 lg:gap-16">
              {/* First set of logos */}
              {[
                { name: 'BUILD', src: '/Clients/BUILD.jpeg' },
                { name: 'Greenko', src: '/Clients/greenko.jpeg' },
                { name: 'IIT Madras', src: '/Clients/iit madras.jpeg' },
                { name: 'IIT Ropar', src: '/Clients/iit roopar.jpeg' },
                { name: 'ITIC IIT Hyderabad', src: '/Clients/ITIC IIT HYDERABAD.jpeg' },
                { name: 'My Career Technologies', src: '/Clients/my carrer technologies.jpeg' },
                { name: 'Plant Darbar', src: '/Clients/Plant Darbur.jpeg' },
                { name: 'Sadhanika', src: '/Clients/Sadhanika.jpeg' },
                { name: 'School of Startups', src: '/Clients/School of Startups.jpeg' },
                { name: 'Sportstribe', src: '/Clients/Sportstribe.jpeg' },
                { name: 'Vishva', src: '/Clients/Vishva.jpeg' },
              ].map((client, index) => (
                <motion.div
                  key={`first-${index}`}
                  className="flex-shrink-0 glass-morphism rounded-xl p-6 md:p-8 premium-hover flex items-center justify-center w-48 md:w-56 lg:w-64 h-32 md:h-40 lg:h-48 group relative"
                  whileHover={{ scale: 1.08, y: -8, zIndex: 20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-platinum-metallic/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="w-full h-full flex items-center justify-center relative z-10">
                    <Image
                      src={client.src}
                      alt={client.name}
                      width={250}
                      height={180}
                      className="object-contain w-full h-full opacity-70 group-hover:opacity-100 transition-all duration-300 filter group-hover:brightness-110"
                    />
                  </div>
                </motion.div>
              ))}
              
              {/* Duplicate set for seamless infinite loop */}
              {[
                { name: 'BUILD', src: '/Clients/BUILD.jpeg' },
                { name: 'Greenko', src: '/Clients/greenko.jpeg' },
                { name: 'IIT Madras', src: '/Clients/iit madras.jpeg' },
                { name: 'IIT Ropar', src: '/Clients/iit roopar.jpeg' },
                { name: 'ITIC IIT Hyderabad', src: '/Clients/ITIC IIT HYDERABAD.jpeg' },
                { name: 'My Career Technologies', src: '/Clients/my carrer technologies.jpeg' },
                { name: 'Plant Darbar', src: '/Clients/Plant Darbur.jpeg' },
                { name: 'Sadhanika', src: '/Clients/Sadhanika.jpeg' },
                { name: 'School of Startups', src: '/Clients/School of Startups.jpeg' },
                { name: 'Sportstribe', src: '/Clients/Sportstribe.jpeg' },
                { name: 'Vishva', src: '/Clients/Vishva.jpeg' },
              ].map((client, index) => (
                <motion.div
                  key={`second-${index}`}
                  className="flex-shrink-0 glass-morphism rounded-xl p-6 md:p-8 premium-hover flex items-center justify-center w-48 md:w-56 lg:w-64 h-32 md:h-40 lg:h-48 group relative"
                  whileHover={{ scale: 1.08, y: -8, zIndex: 20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-platinum-metallic/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="w-full h-full flex items-center justify-center relative z-10">
                    <Image
                      src={client.src}
                      alt={client.name}
                      width={250}
                      height={180}
                      className="object-contain w-full h-full opacity-70 group-hover:opacity-100 transition-all duration-300 filter group-hover:brightness-110"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Service Requirement Form */}
      <section id="contact" className="py-20 px-6 max-w-3xl mx-auto scroll-mt-24">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-luxury text-platinum-metallic mb-6">
            Service Requirement Form
          </h2>
          <div className="w-24 h-0.5 bg-platinum-metallic mx-auto mb-8" />
            <p className="text-platinum-200 text-lg">
            Let's discuss how we can transform your vision into reality
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          onSubmit={handleSubmit}
          className="glass-morphism rounded-xl p-8 space-y-6"
        >
          <div>
            <label htmlFor="name" className="block text-platinum-300 mb-2 text-sm font-medium">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-luxury-black/50 border-2 border-platinum-300/60 rounded-lg text-platinum-200 focus:outline-none focus:border-platinum-200 focus:ring-2 focus:ring-platinum-200/50 transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-platinum-300 mb-2 text-sm font-medium">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-luxury-black/50 border-2 border-platinum-300/60 rounded-lg text-platinum-200 focus:outline-none focus:border-platinum-200 focus:ring-2 focus:ring-platinum-200/50 transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-platinum-300 mb-2 text-sm font-medium">
              Company Name
            </label>
            <input
              type="text"
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-4 py-3 bg-luxury-black/50 border-2 border-platinum-300/60 rounded-lg text-platinum-200 focus:outline-none focus:border-platinum-200 focus:ring-2 focus:ring-platinum-200/50 transition-all"
            />
          </div>

          <div>
            <label htmlFor="service" className="block text-platinum-300 mb-2 text-sm font-medium">
              Service Required
            </label>
            <select
              id="service"
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              className="w-full px-4 py-3 bg-luxury-black/50 border-2 border-platinum-300/60 rounded-lg text-platinum-200 focus:outline-none focus:border-platinum-200 focus:ring-2 focus:ring-platinum-200/50 transition-all"
              required
            >
              <option value="">Select a service</option>
              <option value="website">Website Development</option>
              <option value="mobile">Mobile App Development</option>
              <option value="custom">Custom Software Solutions</option>
              <option value="enterprise">Enterprise Systems</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-platinum-300 mb-2 text-sm font-medium">
              Project Details
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 bg-luxury-black/50 border border-platinum-800/50 rounded-lg text-platinum-300 focus:outline-none focus:border-platinum-600 focus:ring-1 focus:ring-platinum-600 transition-all resize-none"
              required
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full px-8 py-4 bg-platinum-metallic/15 border-2 border-platinum-300/60 text-platinum-metallic font-medium rounded-lg hover:bg-platinum-metallic/25 hover:border-platinum-200 transition-all duration-300"
          >
            Submit Request
          </motion.button>
        </motion.form>
      </section>
    </main>
  )
}

