import type { Rarity } from './types'

export type ShapeSpec = { count: number; size?: [number, number]; opacity?: number; type?: 'hero' | 'rings' | 'stars' | 'rails' | 'crown' }

export type RarityMeta = {
  id: Rarity
  symbol: string
  label: string
  weight: number
  border: string
  text: string
  fx: 'matte' | 'metal_edge' | 'holo_shimmer' | 'texture_shine' | 'foil_streak' | 'parallax_glow' | 'scene_shimmer' | 'aura_pulse' | 'gold_sweep' | 'legendary_reveal'
  bg: 'plain' | 'linear' | 'radial' | 'diagonal' | 'prism' | 'gallery' | 'orbits' | 'starfield' | 'rail' | 'radiant'
  shapes: ShapeSpec
  // compatibility alias
  color?: string
}

export type OverlayMeta = { id: 'SHINY'; symbol: string; label?: string; chance: number; fx: 'sparkle_overlay' }

export const rarityRegistry: { rarities: RarityMeta[]; overlay: OverlayMeta } = {
  rarities: [
    { id: 'D1', label: 'Common',             symbol: '♢',     weight: 6400, border: '#555555', text: '#E7E7E7', fx: 'matte',            bg: 'plain',    shapes: { count: 0 },                    color: '#555555' },
    { id: 'D2', label: 'Uncommon',           symbol: '♢♢',    weight: 2200, border: '#6B7280', text: '#E7E7E7', fx: 'metal_edge',       bg: 'linear',   shapes: { count: 6,  size:[6,16], opacity:.12 }, color: '#6B7280' },
    { id: 'D3', label: 'Rare',               symbol: '♢♢♢',     weight: 800,  border: '#8EA6FF', text: '#F4F4F5', fx: 'holo_shimmer',     bg: 'radial',   shapes: { count: 18, size:[8,24], opacity:.16 }, color: '#8EA6FF' },
    { id: 'D4', label: 'Double Rare',        symbol: '♢♢♢♢',    weight: 350,  border: '#BA87FF', text: '#F8FAFC', fx: 'texture_shine',    bg: 'diagonal', shapes: { count: 28, size:[10,28],opacity:.20 }, color: '#BA87FF' },
    { id: 'D5', label: 'Elite Rare',         symbol: '♢x5',    weight: 150,  border: '#D6A9FF', text: '#FFFFFF', fx: 'foil_streak',      bg: 'prism',    shapes: { count: 36, size:[12,32],opacity:.24 }, color: '#D6A9FF' },
    { id: 'S1', label: 'Illustration Rare',  symbol: '★',     weight: 100,  border: '#FFD36B', text: '#FAFAFA', fx: 'parallax_glow',    bg: 'gallery',  shapes: { count: 1,  type:'hero',  size:[120,200],opacity:.9 }, color: '#FFD36B' },
    { id: 'S2', label: 'Special Illus. Rare',symbol: '★★',    weight: 70,   border: '#FFB34A', text: '#FAFAFA', fx: 'scene_shimmer',    bg: 'orbits',   shapes: { count: 8,  type:'rings', size:[40,160],opacity:.6 }, color: '#FFB34A' },
    { id: 'S3', label: 'Mythic / EX',        symbol: '★★★',     weight: 40,   border: '#FF7F50', text: '#FAFAFA', fx: 'aura_pulse',       bg: 'starfield',shapes: { count: 80, type:'stars', size:[1,3],  opacity:.8 }, color: '#FF7F50' },
    { id: 'S4', label: 'Hyper Rare',         symbol: '★★★★',    weight: 20,   border: '#FFD700', text: '#FAFAFA', fx: 'gold_sweep',       bg: 'rail',     shapes: { count: 12, type:'rails', size:[2,6], opacity:.55 }, color: '#FFD700' },
    { id: 'CROWN', label: 'Crown Rare',      symbol: '👑',     weight: 4,    border: '#FFF7BF', text: '#0A0A0A', fx: 'legendary_reveal', bg: 'radiant',  shapes: { count: 1,  type:'crown', size:[220,220],opacity:1 }, color: '#FFF7BF' },
  ],
  overlay: { id: 'SHINY', symbol: '✦', chance: 0.02, fx: 'sparkle_overlay' },
}

export function rarityMap(): Record<Rarity, RarityMeta> {
  const map = {} as Record<Rarity, RarityMeta>
  for(const r of rarityRegistry.rarities){ map[r.id] = r }
  return map
}
