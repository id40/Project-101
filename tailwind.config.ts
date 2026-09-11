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
        brand: {
          primary: '#635BFF',
          dark: '#4338CA',
          accent: '#06B6D4',
          bg: '#F8FAFC',
          darkBg: '#0F172A',
          surface: '#FFFFFF',
          textPrimary: '#0F172A',
          textSecondary: '#64748B',
          border: '#E2E8F0',
          emerald: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Space Grotesk', 'sans-serif'],
        sans: ['var(--font-sans)', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
      },
    },
  },
  plugins: [],
};

export default config;
