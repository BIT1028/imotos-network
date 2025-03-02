import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'neon-blue': '#00a0e9',
        'cyber-black': '#0a0a12',
        'hologram-purple': '#9d00ff'
      },
      clipPath: {
        'low-poly': 'polygon(0 25%, 16% 0, 84% 0, 100% 25%, 100% 75%, 84% 100%, 16% 100%, 0 75%)'
      }
    },
  },
  plugins: [
    require('tailwind-clip-path'),
    require('tailwindcss-animate')
  ]
} satisfies Config
