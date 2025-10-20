import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        rarity: {
          common: '#9aa0a6',
          rare: '#ffd54f',
          ultra: '#e6c300',
          secret: '#b388ff'
        }
      },
      boxShadow: {
        card: '0 10px 30px rgba(0,0,0,0.5)'
      }
    },
  },
  plugins: [],
} satisfies Config
