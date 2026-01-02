'use client'

import { motion } from 'framer-motion'
import { Zap, Target, TrendingUp, Award, Rocket, CheckCircle, Play, Building2, GraduationCap, Users, Star } from 'lucide-react'
import Shrimp from '@/components/Shrimp'
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
    icon: Building2,
    title: 'Vishva TBI Partnership',
    description: 'Incubated and partnered with Vishva TBI',
  },
  {
    icon: GraduationCap,
    title: 'IIT Hyderabad & Greenko',
    description: 'Partnered with IIT Hyderabad and Greenko through BUILD program',
  },
  {
    icon: Rocket,
    title: 'IIT Ropar Partnership',
    description: 'Partnered with IIT Ropar through Sprint South edition',
  },
  {
    icon: Users,
    title: 'Physics Wallah Partnership',
    description: 'Partnered with Physics Wallah School of Startups with Aarambh cohort',
  },
  {
    icon: Award,
    title: 'IIT Mandi & IIT Madras',
    description: 'Associated with IIT Mandi and IIT Madras for prototype development and mentorship',
  },
  {
    icon: Star,
    title: 'TOP 75 Startups in India',
    description: 'One of the TOP 75 startups in India for BUILD Program designed by IIT Hyderabad',
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
            <Shrimp size={80} className="text-platinum-metallic mx-auto" />
          </motion.div>
          <h1 className="text-6xl md:text-7xl font-luxury text-platinum-metallic mb-6">
            SAAMRAS
          </h1>
          <div className="w-24 h-0.5 bg-platinum-metallic mx-auto mb-8" />
          <p className="text-xl text-platinum-200 max-w-3xl mx-auto">
            Automated Quality Assessment and Grading Solution for Shrimp Farming
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
              In aquaculture, especially in shrimp culture, quality assessment and grading are considered crucial processes. Currently, these processes are done manually by engaging 20-30 members in each task. As it is a manual process, errors occur frequently and accuracy is very less, leading to significant business losses for seafood processing units and aqua farmers.
            </p>
            <ul className="space-y-3 text-platinum-200">
              <li className="flex items-start">
                <span className="text-platinum-metallic mr-3">•</span>
                <span>Manual quality assessment requires 20-30 workers per task</span>
              </li>
              <li className="flex items-start">
                <span className="text-platinum-metallic mr-3">•</span>
                <span>High error rates and low accuracy in manual grading</span>
              </li>
              <li className="flex items-start">
                <span className="text-platinum-metallic mr-3">•</span>
                <span>Significant labor costs and operational inefficiencies</span>
              </li>
              <li className="flex items-start">
                <span className="text-platinum-metallic mr-3">•</span>
                <span>Business losses due to inconsistent quality and grading errors</span>
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
              SAAMRAS is a revolutionary product introduced to automate shrimp farming, specifically designed for aquaculture and shrimp culture. Quality assessment and grading are considered crucial processes in the industry, traditionally done manually by engaging 20-30 members in each task. As a manual process, errors occur frequently and accuracy is very low.
            </p>
            <p className="text-platinum-300 text-lg leading-relaxed mb-4">
              Our product automates the process of quality assessment and grading by producing the best accuracy at an affordable cost, completely avoiding human intervention from the process. SAAMRAS perfectly targets seafood processing units and aqua farmers, helping them avoid losses in their business.
            </p>
            <p className="text-platinum-300 text-lg leading-relaxed">
              By eliminating manual labor and human error, SAAMRAS delivers consistent, high-quality results that transform shrimp farming operations, ensuring better profitability and operational efficiency for seafood processing units and aqua farmers.
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            Discover how SAAMRAS can transform your shrimp farming and aquaculture operations
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

