import { create } from 'zustand'

export type TransitionPhase = 'idle' | 'playing'

type TransitionState = {
  phase: TransitionPhase
  setId: string | null
  reduced: boolean
  // timestamps for coordination
  startedAt: number | null
  durationMs: number
  // imperative play: shows overlay, calls onNavigate at midpoint, hides after end
  playPreviewToOpen: (opts: { setId: string; reduced: boolean; onNavigate: ()=>void }) => void
  // internal control for overlay to complete
  _end: () => void
}

export const useTransition = create<TransitionState>((set, get)=>({
  phase: 'idle',
  setId: null,
  reduced: false,
  startedAt: null,
  durationMs: 700,
  playPreviewToOpen: ({ setId, reduced, onNavigate }) => {
    const total = Math.min(800, Math.max(600, reduced ? 450 : 700))
    const midpoint = reduced ? 220 : 320
    set({ phase: 'playing', setId, reduced, startedAt: performance.now(), durationMs: total })
    // Navigate near midpoint for seamless crossfade
    window.setTimeout(()=>{ try{ onNavigate() }catch{} }, midpoint)
    // Ensure overlay ends regardless
    window.setTimeout(()=>{ get()._end() }, total)
  },
  _end: ()=> set({ phase: 'idle', setId: null, startedAt: null })
}))
