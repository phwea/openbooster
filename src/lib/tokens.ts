export const tokens = {
  colors: {
    accent: {
      base: '#C7CCD1',
      apex: '#8B5CF6',
      neo: '#22D3EE',
    },
  },
  radii: {
    card: 12,
  },
  durations: {
    fast: 150,
    base: 300,
    slow: 1200,
  }
} as const

export type ExpansionTheme = 'base' | 'apex' | 'neo'
