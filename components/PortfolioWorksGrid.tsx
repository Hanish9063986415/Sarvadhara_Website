'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import {
  portfolioProjects,
  accentHeaderClasses,
  type PortfolioProject,
  type PortfolioAccent,
} from '@/data/portfolio'

type PortfolioWorksGridProps = {
  id?: string
  title?: string
  subtitle?: string
  projects?: PortfolioProject[]
  showViewAllLink?: boolean
  className?: string
}

const accentGlow: Record<PortfolioAccent, string> = {
  green: 'from-emerald-500/20 via-transparent to-transparent',
  emerald: 'from-emerald-400/15 via-transparent to-transparent',
  blue: 'from-blue-500/20 via-transparent to-transparent',
  amber: 'from-amber-400/15 via-transparent to-transparent',
  violet: 'from-violet-500/20 via-transparent to-transparent',
  rose: 'from-rose-400/15 via-transparent to-transparent',
  platinum: 'from-white/10 via-transparent to-transparent',
}

function projectDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export default function PortfolioWorksGrid({
  id,
  title = 'Our Works',
  subtitle = 'Showcasing excellence across diverse industries and platforms',
  projects = portfolioProjects,
  showViewAllLink = false,
  className = 'py-32 px-4 sm:px-6 max-w-6xl mx-auto',
}: PortfolioWorksGridProps) {
  return (
    <section id={id} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12 md:mb-16"
      >
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-luxury text-platinum-metallic mb-6">
          {title}
        </h2>
        <div className="w-24 h-0.5 bg-platinum-metallic mx-auto mb-8" />
        <p className="text-platinum-200 text-base sm:text-lg max-w-2xl mx-auto px-2">
          {subtitle}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {projects.map((item, index) => {
          const Icon = item.icon
          const accentKey = item.accent ?? 'platinum'
          const accent = accentHeaderClasses[accentKey]
          const glow = accentGlow[accentKey]
          const isFeatured = item.featured
          const domain = projectDomain(item.link)

          return (
            <motion.a
              key={item.link}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: Math.min(index * 0.05, 0.45) }}
              whileHover={{ y: -6 }}
              className="group block h-full"
            >
              <div
                className={`relative h-full rounded-2xl p-[1px] overflow-hidden transition-shadow duration-500 ${
                  isFeatured
                    ? 'bg-gradient-to-br from-emerald-400/50 via-white/20 to-emerald-900/30 shadow-[0_0_40px_rgba(52,211,153,0.12)]'
                    : 'bg-gradient-to-br from-white/25 via-white/10 to-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.45)] group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.55)]'
                }`}
              >
                <div className="relative flex h-full flex-col rounded-2xl bg-[#0a0a0b] overflow-hidden">
                  <div
                    className={`pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br ${glow} blur-2xl opacity-80 group-hover:opacity-100 transition-opacity`}
                  />

                  <div className="px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-400/70 shadow-[0_0_6px_rgba(248,113,113,0.5)]" />
                      <span className="h-2 w-2 rounded-full bg-amber-300/70 shadow-[0_0_6px_rgba(252,211,77,0.4)]" />
                      <span className="h-2 w-2 rounded-full bg-emerald-400/70 shadow-[0_0_6px_rgba(52,211,153,0.45)]" />
                      <div className="ml-1 flex min-w-0 flex-1 items-center rounded-md border border-white/[0.08] bg-black/50 px-2.5 py-1">
                        <span className="truncate text-[10px] sm:text-[11px] text-platinum-500 tracking-wide">
                          {domain}
                        </span>
                      </div>
                      {isFeatured && (
                        <span className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-emerald-300/90">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#0c0c0e] ring-1 ring-white/[0.08] group-hover:ring-white/20 transition-all">
                      <div
                        className={`absolute inset-0 ${item.image ? 'bg-[#0c0c0e]' : `bg-gradient-to-br ${accent.base} ${accent.hover}`} transition-all duration-500`}
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            quality={92}
                            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <>
                            <Icon className="absolute -bottom-4 -right-2 h-28 w-28 text-white/[0.04] rotate-[-12deg]" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-transform duration-500 group-hover:scale-105">
                                <Icon className="h-7 w-7 text-platinum-metallic/80" />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/[0.02] opacity-70" />
                      <div className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
                    </div>
                  </div>

                  <div className="mt-auto border-t border-white/[0.06] px-4 py-4 sm:px-5 sm:py-4 bg-gradient-to-b from-white/[0.02] to-transparent">
                    <div className="flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-luxury text-lg sm:text-xl text-platinum-metallic leading-tight line-clamp-2 transition-colors group-hover:text-white">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-xs sm:text-sm text-platinum-500 font-light tracking-wide line-clamp-1">
                          {item.tagline}
                        </p>
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-platinum-400 transition-all duration-300 group-hover:border-white/25 group-hover:bg-white/[0.08] group-hover:text-platinum-metallic group-hover:scale-105">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.a>
          )
        })}
      </div>

      {showViewAllLink && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mt-12 md:mt-14"
        >
          <Link
            href="/services#our-works"
            className="inline-flex items-center px-8 py-4 border-2 border-platinum-300/60 text-platinum-metallic font-medium rounded-lg hover:border-platinum-200 hover:bg-platinum-metallic/10 transition-all duration-300"
          >
            View All Works
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </motion.div>
      )}
    </section>
  )
}
