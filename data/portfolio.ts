import type { LucideIcon } from 'lucide-react'
import {
  Sprout,
  BarChart3,
  GraduationCap,
  Store,
  Heart,
  Smartphone,
  Sparkles,
  ShieldAlert,
  UtensilsCrossed,
  Newspaper,
  Building,
  UserCircle,
  Shield,
  Camera,
  Trophy,
  BookOpen,
} from 'lucide-react'

export type PortfolioAccent = 'green' | 'emerald' | 'blue' | 'amber' | 'violet' | 'rose' | 'platinum'

export interface PortfolioProject {
  title: string
  tagline: string
  link: string
  icon: LucideIcon
  image?: string
  featured?: boolean
  accent?: PortfolioAccent
}

export const portfolioProjects: PortfolioProject[] = [
  {
    title: 'Plant Darbar',
    tagline: 'E-Commerce · Plants & Lifestyle',
    link: 'https://www.plantdarbar.com/',
    icon: Sprout,
    image: '/Our works/Plantdarbar.png',
    featured: true,
    accent: 'green',
  },
  {
    title: 'CAP Indic',
    tagline: 'Analytics & Market Indicators',
    link: 'https://capindic.com/',
    icon: BarChart3,
    image: '/Our works/Capindic.png',
    accent: 'violet',
  },
  {
    title: 'Yantra IAS',
    tagline: 'UPSC Coaching Platform',
    link: 'https://www.yantraias.com/',
    icon: GraduationCap,
    image: '/Our works/Yantraias.png',
    accent: 'blue',
  },
  {
    title: 'Local Baazaar',
    tagline: 'Hyperlocal Marketplace',
    link: 'https://www.localbaazaar.com/',
    icon: Store,
    image: '/Our works/Localbaazaar.png',
    accent: 'emerald',
  },
  {
    title: 'Sadhanika',
    tagline: 'NGO & Community Impact',
    link: 'https://www.sadhanika.org/',
    icon: Heart,
    image: '/Our works/Sadhanika.png',
    accent: 'rose',
  },
  {
    title: 'Banking Mobile App',
    tagline: 'Mobile Banking Experience',
    link: 'https://banking-mobile-app-six.vercel.app/',
    icon: Smartphone,
    image: '/Our works/Banking.png',
    accent: 'blue',
  },
  {
    title: 'Goud Saab',
    tagline: 'Personal Brand & Portfolio',
    link: 'https://www.goudsaab.com/',
    icon: Sparkles,
    image: '/Our works/Goudsaab.png',
    accent: 'amber',
  },
  {
    title: 'Whistle Blower',
    tagline: 'Secure Compliance Reporting',
    link: 'https://whistle-blower-three.vercel.app/',
    icon: ShieldAlert,
    image: '/Our works/Whistleblower.png',
    accent: 'violet',
  },
  {
    title: 'Daawat',
    tagline: 'Restaurant Mobile Ordering',
    link: 'https://daawat-mobile-app.vercel.app/',
    icon: UtensilsCrossed,
    image: '/Our works/Daawat.png',
    accent: 'amber',
  },
  {
    title: 'PM Times',
    tagline: 'Digital News & Media',
    link: 'https://www.pmtimes.in/',
    icon: Newspaper,
    image: '/Our works/PMtimes.png',
    accent: 'platinum',
  },
  {
    title: 'Hostelit',
    tagline: 'Hostel Discovery & Operations',
    link: 'https://www.hostelit.in/',
    icon: Building,
    image: '/Our works/hostelit.png',
    accent: 'blue',
  },
  {
    title: 'Paramesh Matta',
    tagline: 'Professional Portfolio',
    link: 'https://www.parameshmatta.com/',
    icon: UserCircle,
    image: '/Our works/Parameshmatta_portfolio.png',
    accent: 'platinum',
  },
  {
    title: 'Protect Solutions',
    tagline: 'Security & Business Solutions',
    link: 'https://www.protectsolutions.in/',
    icon: Shield,
    image: '/Our works/Protectsols.png',
    accent: 'emerald',
  },
  {
    title: 'Legacy Moments',
    tagline: 'Events & Photography',
    link: 'https://www.legacymoments.in/',
    icon: Camera,
    image: '/Our works/Legacymoments.png',
    accent: 'rose',
  },
  {
    title: 'SportTribe',
    tagline: 'Sports Management Suite',
    link: 'https://sportstribe-new.vercel.app/',
    icon: Trophy,
    image: '/Our works/Sportstribe.png',
    accent: 'platinum',
  },
  {
    title: 'My Career LMS',
    tagline: 'Enterprise Learning Platform',
    link: 'https://mycareerlms.vercel.app/',
    icon: BookOpen,
    image: '/Our works/MycareerLMS.png',
    accent: 'violet',
  },
]

export const accentHeaderClasses: Record<PortfolioAccent, { base: string; hover: string }> = {
  green: {
    base: 'from-green-900/30 via-platinum-900/20 to-luxury-black',
    hover: 'group-hover:from-green-900/40',
  },
  emerald: {
    base: 'from-emerald-900/25 via-platinum-900/15 to-luxury-black',
    hover: 'group-hover:from-emerald-900/35',
  },
  blue: {
    base: 'from-blue-900/25 via-platinum-900/15 to-luxury-black',
    hover: 'group-hover:from-blue-900/35',
  },
  amber: {
    base: 'from-amber-900/25 via-platinum-900/15 to-luxury-black',
    hover: 'group-hover:from-amber-900/35',
  },
  violet: {
    base: 'from-violet-900/25 via-platinum-900/15 to-luxury-black',
    hover: 'group-hover:from-violet-900/35',
  },
  rose: {
    base: 'from-rose-900/25 via-platinum-900/15 to-luxury-black',
    hover: 'group-hover:from-rose-900/35',
  },
  platinum: {
    base: 'from-platinum-900/20 to-luxury-black',
    hover: 'group-hover:from-platinum-900/30',
  },
}
