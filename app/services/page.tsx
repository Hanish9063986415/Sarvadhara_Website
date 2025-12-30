'use client'

import { motion } from 'framer-motion'
import { Code, Smartphone, Globe, Building2, Database, Cloud, Shield, Zap, Monitor, Server } from 'lucide-react'
import { useState } from 'react'

const services = [
  {
    icon: Globe,
    title: 'Website Development',
    description: 'Premium, responsive websites that combine stunning design with cutting-edge functionality and optimal performance.',
  },
  {
    icon: Smartphone,
    title: 'Mobile App Development',
    description: 'Native and cross-platform mobile applications that deliver exceptional user experiences across iOS and Android.',
  },
  {
    icon: Code,
    title: 'Custom Software Solutions',
    description: 'Tailored software systems designed to meet your unique business requirements and drive operational efficiency.',
  },
  {
    icon: Building2,
    title: 'Enterprise Systems',
    description: 'Scalable enterprise-grade solutions that power large organizations with robust architecture and security.',
  },
  {
    icon: Database,
    title: 'Database Management',
    description: 'Advanced database solutions with optimized performance, security, and scalability for your critical data.',
  },
  {
    icon: Cloud,
    title: 'Cloud Solutions',
    description: 'Comprehensive cloud infrastructure and migration services to modernize your technology stack.',
  },
  {
    icon: Shield,
    title: 'Security & Compliance',
    description: 'Enterprise-grade security solutions ensuring your systems meet the highest standards of protection.',
  },
  {
    icon: Zap,
    title: 'Performance Optimization',
    description: 'Expert optimization services to enhance speed, efficiency, and user experience of your applications.',
  },
]

const portfolioItems = [
  {
    title: 'Enterprise Platform',
    category: 'Web Application',
    description: 'Comprehensive enterprise management system',
  },
  {
    title: 'E-Commerce Solution',
    category: 'Website',
    description: 'Premium online retail platform with advanced features',
  },
  {
    title: 'Mobile Banking App',
    category: 'Mobile Application',
    description: 'Secure and intuitive financial services application',
  },
  {
    title: 'Analytics Dashboard',
    category: 'Web Application',
    description: 'Real-time data visualization and insights platform',
  },
  {
    title: 'Healthcare Management',
    category: 'Enterprise System',
    description: 'Complete healthcare administration solution',
  },
  {
    title: 'Logistics Platform',
    category: 'Web Application',
    description: 'End-to-end supply chain management system',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  return (
    <main className="min-h-screen bg-luxury-black pt-20">
      {/* Hero Section */}
      <section className="py-32 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-7xl font-luxury text-platinum-metallic mb-6">
            Services & Client Works
          </h1>
          <div className="w-24 h-0.5 bg-platinum-metallic mx-auto mb-8" />
          <p className="text-xl text-platinum-200 max-w-2xl mx-auto">
            Premium technology solutions crafted with precision and excellence
          </p>
        </motion.div>
      </section>

      {/* Software Services */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-luxury text-platinum-metallic mb-6">
            Software Services
          </h2>
          <div className="w-24 h-0.5 bg-platinum-metallic mx-auto" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="glass-morphism rounded-xl overflow-hidden premium-hover group"
            >
              <div className="h-48 bg-gradient-to-br from-platinum-900/20 to-luxury-black flex items-center justify-center">
                <Monitor className="w-16 h-16 text-platinum-metallic/30" />
              </div>
              <div className="p-6">
                <span className="text-xs text-platinum-500 uppercase tracking-wider mb-2 block">
                  {item.category}
                </span>
                <h3 className="text-2xl font-luxury text-platinum-metallic mb-2">
                  {item.title}
                </h3>
                <p className="text-platinum-200 text-sm">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
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

      {/* Service Requirement Form */}
      <section className="py-20 px-6 max-w-3xl mx-auto">
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

