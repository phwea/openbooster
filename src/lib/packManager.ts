import { create } from 'zustand'

export type PackState = 'idle' | 'tearing' | 'burst' | 'fan' | 'reveal' | 'summary'

type PM = {
  state: PackState
  canOpen: boolean
  setState: (s: PackState) => void
  reset: () => void
}

export const usePackManager = create<PM>((set, get) => ({
  state: 'idle',
  canOpen: true,
  setState: (s) => set({ state: s, canOpen: s === 'idle' }),
  reset: () => set({ state: 'idle', canOpen: true }),
}))
