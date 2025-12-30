import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        platinum: {
          50: '#ffffff',
          100: '#f8f9fa',
          200: '#f5f5f5',
          300: '#e5e7eb',
          400: '#d1d5db',
          500: '#9ca3af',
          600: '#6b7280',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          DEFAULT: '#ffffff',
          light: '#ffffff',
          metallic: '#e5e7eb',
          glow: '#ffffff',
        },
        luxury: {
          black: '#000000',
          platinum: '#ffffff',
          silver: '#e5e7eb',
          gold: '#d4af37',
        }
      },
      backgroundImage: {
        'platinum-gradient': 'linear-gradient(135deg, #ffffff 0%, #e5e7eb 50%, #ffffff 100%)',
        'metallic-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(229,231,235,0.4) 50%, rgba(255,255,255,0.2) 100%)',
        'chrome-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(229,231,235,0.3) 50%, rgba(0,0,0,0.1) 100%)',
      },
      fontFamily: {
        luxury: ['var(--font-luxury)', 'serif'],
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      boxShadow: {
        'platinum': '0 0 30px rgba(255, 255, 255, 0.2), 0 0 50px rgba(229, 231, 235, 0.15)',
        'platinum-glow': '0 0 40px rgba(255, 255, 255, 0.3), 0 0 80px rgba(229, 231, 235, 0.2)',
        'metallic': 'inset 0 1px 0 rgba(255,255,255,0.3), 0 0 30px rgba(255,255,255,0.2)',
      },
      animation: {
        'light-sweep': 'light-sweep 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'light-sweep': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config

