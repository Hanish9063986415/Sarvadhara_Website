'use client'

import { motion } from 'framer-motion'
import { Code, Smartphone, Globe, Building2, Monitor, Sprout, Trophy, GraduationCap, Briefcase, Heart, Palette, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

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

const portfolioItems = [
  {
    title: 'Plant Darbar',
    category: 'E-Commerce Website',
    description: 'Beautiful plant e-commerce platform featuring sustainable indoor and balcony plants in upcycled containers. Complete online shopping experience with product catalog, services, and plant care information.',
    icon: Sprout,
    image: '/Our works/Plant Darbur.jpeg',
    link: 'https://www.plantdarbar.com/',
    featured: true,
  },
  {
    title: 'SportTribe',
    category: 'Sports Management Web App',
    description: 'End-to-end sports management platform with comprehensive features for team management, scheduling, player tracking, and analytics.',
    icon: Trophy,
    image: '/Our works/Sports Tribe.jpeg',
    link: 'https://sportstribenew.vercel.app/',
    featured: false,
  },
  {
    title: 'My Career Technology',
    category: 'Learning Management System',
    description: 'Enterprise-level learning management system designed for comprehensive educational management, course delivery, and student tracking.',
    icon: GraduationCap,
    image: '/Our works/My career Technologies.jpeg',
    link: null,
    featured: false,
  },
  {
    title: 'Political Analyst Portfolio',
    category: 'Professional Portfolio',
    description: 'Elegant and professional portfolio website showcasing political analysis work, research, publications, and expertise in a sophisticated design.',
    icon: Briefcase,
    image: '/Our works/Political Analyst.jpeg',
    link: 'https://personal-portfolio-alpha-eight-59.vercel.app/',
    featured: false,
  },
  {
    title: 'NGO Platform',
    category: 'NGO Website & Management System',
    description: 'Comprehensive NGO website featuring management system, donation portal, project exploration, and complete organizational transparency.',
    icon: Heart,
    image: '/Our works/sandhanika.jpeg',
    link: null,
    featured: false,
  },
  {
    title: 'Mithunam Wall Art',
    category: 'Creative Portfolio Website',
    description: 'Stunning portfolio website for an interior designer specializing in wall art, showcasing creative works and design services.',
    icon: Palette,
    image: '/Our works/Mithunam.jpeg',
    link: 'https://mithunam-sample.vercel.app/',
    featured: false,
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
    <main className="min-h-screen bg-luxury-black pt-20">
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

      {/* Portfolio */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-luxury text-platinum-metallic mb-6">
            Our Works
          </h2>
          <div className="w-24 h-0.5 bg-platinum-metallic mx-auto mb-8" />
          <p className="text-platinum-200 text-lg max-w-2xl mx-auto">
            Showcasing excellence across industries and platforms
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item, index) => {
            const IconComponent = item.icon || Monitor
            const isFeatured = item.featured
            
            const cardContent = (
              <>
                <div className={`h-48 md:h-56 bg-gradient-to-br ${isFeatured ? 'from-green-900/30 via-platinum-900/20 to-luxury-black' : 'from-platinum-900/20 to-luxury-black'} relative overflow-hidden ${isFeatured ? 'group-hover:from-green-900/40' : 'group-hover:from-platinum-900/30'} transition-all duration-300`}>
                  {item.image ? (
                    <>
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Overlay gradient for better visual integration */}
                      <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/10 via-transparent to-luxury-black/30 pointer-events-none" />
                    </>
                  ) : (
                    <IconComponent className={`w-12 h-12 md:w-14 md:h-14 text-platinum-metallic/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-300`} />
                  )}
                  {/* Featured Badge */}
                  {isFeatured && (
                    <div className="absolute top-4 right-4 bg-green-500/20 border border-green-400/40 px-3 py-1 rounded-full backdrop-blur-sm z-10">
                      <span className="text-green-300 text-xs font-medium">Featured</span>
                    </div>
                  )}
                </div>
                <div className="p-4 md:p-5">
                  <span className="text-xs text-platinum-500 uppercase tracking-wider mb-1.5 block">
                    {item.category}
                  </span>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-xl md:text-2xl font-luxury text-platinum-metallic">
                      {item.title}
                    </h3>
                    {item.link && (
                      <ExternalLink className="w-4 h-4 text-platinum-metallic/50 group-hover:text-platinum-metallic transition-colors" />
                    )}
                  </div>
                  <p className="text-platinum-200 text-xs md:text-sm leading-relaxed">
                    {item.description}
                  </p>
                  {item.link && (
                    <div className="mt-4 pt-4 border-t border-platinum-300/20">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-platinum-metallic text-sm font-medium hover:text-platinum-200 transition-colors inline-flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Visit Website
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              </>
            )

            if (item.link) {
              return (
                <motion.a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className={`glass-morphism rounded-xl overflow-hidden premium-hover group block ${isFeatured ? 'ring-2 ring-green-400/30' : ''}`}
                >
                  {cardContent}
                </motion.a>
              )
            }

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`glass-morphism rounded-xl overflow-hidden premium-hover group ${isFeatured ? 'ring-2 ring-green-400/30' : ''}`}
              >
                {cardContent}
              </motion.div>
            )
          })}
        </div>
      </section>

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

