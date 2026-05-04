import type { Config } from 'tailwindcss';

/**
 * Aura Educacional — design tokens
 * Paleta institucional: navy + gold + ivory.
 * Inspirada no logo (navy #0F1E47, gold #C9A961).
 */
export default {
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        md: '2rem',
        lg: '2.5rem',
      },
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        navy: {
          50: '#F2F4F9',
          100: '#E5E9F2',
          200: '#C5CDE0',
          300: '#94A1C5',
          400: '#5C6FA0',
          500: '#1F3478',
          600: '#152659',
          700: '#0F1E47', // primary do logo
          800: '#0A1432',
          900: '#060B1F',
        },
        gold: {
          50: '#FBF7EC',
          100: '#F5EDD9',
          200: '#EBDDB3',
          300: '#DEC78D',
          400: '#D4B97A',
          500: '#C9A961', // accent do logo
          600: '#A88845',
          700: '#7E6633',
          800: '#544322',
          900: '#2A2211',
        },
        ivory: '#FAF8F3',
        paper: '#FFFFFF',
        ink: {
          900: '#1A1A1A',
          800: '#2A2A2A',
          700: '#3A3A3A',
          600: '#4A4A4A',
          500: '#6A6A6A',
          400: '#7A7A7A',
          300: '#9A9A9A',
          200: '#C0C0C0',
          100: '#E0E0E0',
        },
        border: {
          DEFAULT: '#E8E4DA',
          strong: '#C9C2B0',
        },
        success: { DEFAULT: '#1F8A4C', light: '#E0F4E9' },
        warning: { DEFAULT: '#B8801F', light: '#FBEFD4' },
        danger: { DEFAULT: '#B82A2A', light: '#FBE0E0' },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Fraunces', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['clamp(3rem, 6vw, 5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-xl': ['clamp(2.25rem, 4.5vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(1.75rem, 3.5vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.625rem',
        lg: '0.875rem',
        xl: '1.25rem',
        '2xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 30, 71, 0.04), 0 1px 3px rgba(15, 30, 71, 0.06)',
        card: '0 4px 16px rgba(15, 30, 71, 0.06), 0 1px 4px rgba(15, 30, 71, 0.04)',
        'card-hover': '0 12px 32px rgba(15, 30, 71, 0.10), 0 4px 12px rgba(15, 30, 71, 0.06)',
        'gold-glow': '0 0 0 4px rgba(201, 169, 97, 0.15)',
        'navy-glow': '0 0 0 4px rgba(15, 30, 71, 0.12)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 4s ease-in-out infinite',
        'count-up': 'count-up 800ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      backgroundImage: {
        'gold-shimmer':
          'linear-gradient(90deg, transparent 0%, rgba(245, 237, 217, 0.5) 50%, transparent 100%)',
        'navy-gradient': 'linear-gradient(135deg, #0F1E47 0%, #1F3478 100%)',
        'gold-gradient': 'linear-gradient(135deg, #D4B97A 0%, #C9A961 50%, #A88845 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
