import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Card, Rarity } from './types'
import { SETS as REGISTRY } from '@/sets/registry'

interface InvState {
  cards: Card[]
  setMeta: { totalUnique: number }
  addCards: (cards: Card[]) => void
  currentSetId: string
  setCurrentSetId: (id: string) => void
  exp: number
  addExp: (amount: number) => void
  getLevel: () => number
  getNextLevelExp: () => number
  awardPackExp: (cards: Card[]) => number
}

export const useInventory = create<InvState>()(persist((set, get)=>({
  cards: [],
  setMeta: { totalUnique: Object.values(REGISTRY).reduce((sum, s)=> sum + s.size, 0) },
  addCards: (cards) => set({ cards: [...get().cards, ...cards] }),
  currentSetId: 'BASE',
  setCurrentSetId: (id) => set({ currentSetId: id }),
  exp: 0,
  addExp: (amount) => set({ exp: Math.max(0, get().exp + amount) }),
  getLevel: () => {
    const exp = get().exp
    // Level curve: next threshold grows quadratically; L1 at 0, L2 at 200, L3 at 800, etc.
    // level n threshold ~= 200 * (n-1)^2
    let level = 1
    while(exp >= 200 * (level) * (level)) level++
    return level
  },
  getNextLevelExp: () => {
    const lvl = get().getLevel()
    return 200 * (lvl) * (lvl)
  },
  awardPackExp: (cards: Card[]) => {
    const base = 50
    const rarityBonus = (r: Rarity) => {
      switch(r){
        case 'D1': return 1
        case 'D2': return 2
        case 'D3': return 5
        case 'D4': return 8
        case 'D5': return 12
        case 'S1': return 15
        case 'S2': return 25
        case 'S3': return 40
        case 'S4': return 55
        case 'CROWN': return 100
      }
    }
    const shinyBonus = (c: Card) => c.shiny ? 10 : 0
    const bonus = cards.reduce((sum, c)=> sum + rarityBonus(c.rarity) + shinyBonus(c), 0)
    const total = base + bonus
    get().addExp(total)
    return total
  }
}), { name: 'inventory' }))
