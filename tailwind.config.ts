import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f1923',
        secondary: '#1a2c38',
        tertiary: '#213743',
        accent: '#00e701',
        'accent-hover': '#00cc01',
        purple: '#6366f1',
        'purple-light': '#8b5cf6',
        gold: '#f59e0b',
        'gold-light': '#fbbf24',
        danger: '#ef4444',
        'danger-hover': '#dc2626',
        'text-primary': '#ffffff',
        'text-secondary': '#b1bad3',
        'text-muted': '#557086',
        'border-color': '#2f4553',
        'card-bg': '#1a2c38',
        'card-hover': '#243c4d',
        'input-bg': '#0f212e',
        'input-border': '#2f4553',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'ticker': 'ticker 30s linear infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 231, 1, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 231, 1, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-accent': 'linear-gradient(135deg, #00e701, #00b801)',
        'gradient-purple': 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        'gradient-gold': 'linear-gradient(135deg, #f59e0b, #fbbf24)',
        'gradient-danger': 'linear-gradient(135deg, #ef4444, #dc2626)',
        'gradient-dark': 'linear-gradient(180deg, #1a2c38, #0f1923)',
      },
      boxShadow: {
        'glow-green': '0 0 15px rgba(0, 231, 1, 0.3)',
        'glow-purple': '0 0 15px rgba(99, 102, 241, 0.3)',
        'glow-gold': '0 0 15px rgba(245, 158, 11, 0.3)',
        'glow-red': '0 0 15px rgba(239, 68, 68, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      spacing: {
        'sidebar': '240px',
        'sidebar-collapsed': '72px',
        'chat': '320px',
        'header': '60px',
        'mobile-nav': '64px',
      },
    },
  },
  plugins: [],
};

export default config;
