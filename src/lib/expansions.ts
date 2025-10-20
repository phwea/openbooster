export type ExpansionId = 'base' | 'apex' | 'neo'

export interface ExpansionCopy {
  title: string
  subtitle: string
  tag: string
}

export const expansions: Record<ExpansionId, ExpansionCopy> = {
  base: { title: 'Base Set', subtitle: 'The original 150, reborn.', tag: 'Classic • Straight odds' },
  apex: { title: 'Galactic Apex', subtitle: 'Orbit legends. Defy gravity.', tag: 'Cosmic • Scene arts' },
  neo:  { title: 'Neo Flash', subtitle: 'New forms. Faster strikes.', tag: 'Speed • Technique' },
}
