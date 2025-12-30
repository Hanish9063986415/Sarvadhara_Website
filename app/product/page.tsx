'use client'

import { motion } from 'framer-motion'
import { Fish, Zap, Target, TrendingUp, Award, Rocket, CheckCircle, Play } from 'lucide-react'
import { useState } from 'react'

const solutions = [
  {
    icon: Zap,
    title: 'Automation',
    description: 'Revolutionary automation technology that streamlines seafood processing operations, reducing manual labor and increasing throughput.',
  },
  {
    icon: Target,
    title: 'Accuracy',
    description: 'Precision-engineered systems that ensure consistent quality and accuracy in every processing cycle, eliminating human error.',
  },
  {
    icon: TrendingUp,
    title: 'Cost Optimization',
    description: 'Significant reduction in operational costs through intelligent automation, resource optimization, and waste minimization.',
  },
  {
    icon: Rocket,
    title: 'Scalability',
    description: 'Enterprise-grade scalability that grows with your business, from small operations to large-scale processing facilities.',
  },
]

const achievements = [
  {
    icon: Award,
    title: 'Industry Recognition',
    description: 'Awarded for innovation in seafood processing technology',
  },
  {
    icon: Rocket,
    title: 'Incubation Success',
    description: 'Successfully incubated and accelerated by leading tech incubators',
  },
  {
    icon: CheckCircle,
    title: 'Market Validation',
    description: 'Proven results with multiple successful deployments',
  },
  {
    icon: TrendingUp,
    title: 'Industry Leadership',
    description: 'Recognized as a leader in automation solutions',
  },
]

export default function Product() {
  const [videoPlaying, setVideoPlaying] = useState(false)

  return (
    <main className="min-h-screen bg-luxury-black pt-20">
      {/* Hero Section */}
      <section className="py-32 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1 }}
            className="inline-block mb-8"
          >
            <Fish className="w-20 h-20 text-platinum-metallic mx-auto" />
          </motion.div>
          <h1 className="text-6xl md:text-7xl font-luxury text-platinum-metallic mb-6">
            SAAMRAS
          </h1>
          <div className="w-24 h-0.5 bg-platinum-metallic mx-auto mb-8" />
          <p className="text-xl text-platinum-200 max-w-3xl mx-auto">
            Revolutionary seafood processing and automation solution
          </p>
        </motion.div>
      </section>

      {/* What is SAAMRAS */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-luxury text-platinum-metallic mb-6">
            What is SAAMRAS?
          </h2>
          <div className="w-24 h-0.5 bg-platinum-metallic mx-auto" />
        </motion.div>

        <div className="space-y-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-morphism rounded-xl p-10"
          >
            <h3 className="text-3xl font-luxury text-platinum-metallic mb-6">
              Industry Challenge
            </h3>
            <p className="text-platinum-200 text-lg leading-relaxed mb-4">
              The seafood processing industry faces significant challenges: manual labor intensity, inconsistent quality control, high operational costs, and limited scalability. Traditional methods struggle to meet modern demands for efficiency, accuracy, and throughput.
            </p>
            <ul className="space-y-3 text-platinum-200">
              <li className="flex items-start">
                <span className="text-platinum-metallic mr-3">•</span>
                <span>Time-consuming manual processing operations</span>
              </li>
              <li className="flex items-start">
                <span className="text-platinum-metallic mr-3">•</span>
                <span>Quality inconsistencies affecting product standards</span>
              </li>
              <li className="flex items-start">
                <span className="text-platinum-metallic mr-3">•</span>
                <span>Rising labor costs and workforce challenges</span>
              </li>
              <li className="flex items-start">
                <span className="text-platinum-metallic mr-3">•</span>
                <span>Limited ability to scale operations efficiently</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-morphism rounded-xl p-10"
          >
            <h3 className="text-3xl font-luxury text-platinum-metallic mb-6">
              The SAAMRAS Solution
            </h3>
            <p className="text-platinum-200 text-lg leading-relaxed mb-4">
              SAAMRAS is a cutting-edge automation solution designed specifically for seafood processing. Combining advanced robotics, intelligent systems, and precision engineering, SAAMRAS transforms how seafood is processed, ensuring unparalleled quality, efficiency, and scalability.
            </p>
            <p className="text-platinum-300 text-lg leading-relaxed">
              Our solution addresses every critical pain point in the industry, delivering measurable improvements in productivity, quality control, cost management, and operational scalability. SAAMRAS represents the future of seafood processing—intelligent, automated, and transformative.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Solutions We Offer */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-luxury text-platinum-metallic mb-6">
            Solutions We Offer
          </h2>
          <div className="w-24 h-0.5 bg-platinum-metallic mx-auto mb-8" />
          <p className="text-platinum-200 text-lg max-w-2xl mx-auto">
            Comprehensive solutions addressing every aspect of seafood processing
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {solutions.map((solution, index) => {
            const Icon = solution.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="glass-morphism rounded-xl p-8 premium-hover group text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-lg bg-platinum-metallic/15 border-2 border-platinum-300/60 flex items-center justify-center group-hover:bg-platinum-metallic/25 transition-colors">
                  <Icon className="w-10 h-10 text-platinum-metallic" />
                </div>
                <h3 className="text-2xl font-luxury text-platinum-metallic mb-4">
                  {solution.title}
                </h3>
                <p className="text-platinum-200 leading-relaxed">
                  {solution.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Product Video Showcase */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-luxury text-platinum-metallic mb-6">
            Product Showcase
          </h2>
          <div className="w-24 h-0.5 bg-platinum-metallic mx-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-xl overflow-hidden glass-morphism"
        >
          <div className="aspect-video bg-gradient-to-br from-platinum-900/20 to-luxury-black flex items-center justify-center relative">
            {!videoPlaying ? (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setVideoPlaying(true)}
                className="absolute inset-0 flex items-center justify-center group"
              >
                <div className="w-24 h-24 rounded-full bg-platinum-metallic/20 border-2 border-platinum-metallic/50 flex items-center justify-center group-hover:bg-platinum-metallic/30 transition-colors">
                  <Play className="w-12 h-12 text-platinum-metallic ml-2" fill="currentColor" />
                </div>
              </motion.button>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-platinum-200">Video Player Placeholder</p>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Achievements & Milestones */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-luxury text-platinum-metallic mb-6">
            Achievements & Milestones
          </h2>
          <div className="w-24 h-0.5 bg-platinum-metallic mx-auto mb-8" />
          <p className="text-platinum-200 text-lg max-w-2xl mx-auto">
            Recognition and validation of our innovation and excellence
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="glass-morphism rounded-xl p-8 premium-hover group text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-lg bg-platinum-metallic/15 border-2 border-platinum-300/60 flex items-center justify-center group-hover:bg-platinum-metallic/25 transition-colors">
                  <Icon className="w-8 h-8 text-platinum-metallic" />
                </div>
                <h3 className="text-xl font-luxury text-platinum-metallic mb-3">
                  {achievement.title}
                </h3>
                <p className="text-platinum-200 text-sm leading-relaxed">
                  {achievement.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-5xl md:text-6xl font-luxury text-platinum-metallic mb-6">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-xl text-platinum-200 mb-8">
            Discover how SAAMRAS can revolutionize your seafood processing operations
          </p>
          <motion.a
            href="/services"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-8 py-4 bg-platinum-metallic/15 border-2 border-platinum-300/60 text-platinum-metallic font-medium rounded-lg hover:bg-platinum-metallic/25 hover:border-platinum-200 transition-all duration-300"
          >
            Get in Touch
          </motion.a>
        </motion.div>
      </section>
    </main>
  )
}

