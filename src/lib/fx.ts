import { Rarity } from '@/lib/types'
import { rarityRegistry, rarityMap } from './rarity'

export function rarityToFx(rarity: Rarity, shiny: boolean, suspense: boolean){
  const base = rarityTint(rarity)
  const glowColor = shiny ? 'rgba(255,255,255,0.22)' : base
  const shadowAlpha = shiny ? 0.45 : 0.28
  return {
    tint: base,
    shadow: `0 0 22px ${rgba(base, shadowAlpha)}`,
    glow: suspense
      ? `radial-gradient(circle at 50% 10%, ${rgba(glowColor, 0.22)}, transparent 40%)`
      : `linear-gradient(120deg, ${rgba(glowColor, 0.10)}, transparent 50%)`,
  }
}

export function rarityOverlay(rarity: Rarity, shiny: boolean): string | undefined {
  // Premium iridescent overlays with rich color depth
  const intensity = shiny ? 0.35 : 0.18
  const shimmer = shiny ? 0.22 : 0.12
  switch(rarity){
    case 'D3':
      // Structured rainbow with soft lens flare
      return `radial-gradient(circle at 50% 30%, rgba(255,255,255,${shimmer*0.6}), transparent 45%), conic-gradient(from 0deg at 50% 50%, rgba(136,147,255,${intensity*0.8}), rgba(255,100,200,${intensity*0.65}), rgba(255,215,100,${intensity*0.7}), rgba(100,255,200,${intensity*0.75}), rgba(136,147,255,${intensity*0.8}))`
    case 'D4':
      // Angled prismatic sweep
      return `linear-gradient(135deg, rgba(255,255,255,${shimmer*0.4}), transparent 50%), conic-gradient(from 45deg at 50% 50%, rgba(255,0,150,${intensity}), rgba(255,200,0,${intensity*0.85}), rgba(0,220,255,${intensity*0.9}), rgba(180,100,255,${intensity*0.95}), rgba(255,0,150,${intensity}))`
    case 'D5':
      // Ornamental metallic sheen
      return `linear-gradient(160deg, rgba(255,255,255,${shimmer*0.5}) 0%, transparent 30%, rgba(255,255,255,${shimmer*0.3}) 70%), conic-gradient(from 0deg at 50% 50%, rgba(255,100,200,${intensity}), rgba(255,220,100,${intensity*0.9}), rgba(100,200,255,${intensity*0.95}), rgba(200,100,255,${intensity*0.9}), rgba(255,100,200,${intensity}))`
    case 'S1':
      // Painterly iridescence with radial burst
      return `radial-gradient(circle at 50% 40%, rgba(255,255,255,${shimmer*0.5}), transparent 55%), conic-gradient(from 0deg at 50% 50%, rgba(255,180,100,${intensity}), rgba(255,100,180,${intensity*0.9}), rgba(180,100,255,${intensity}), rgba(100,180,255,${intensity*0.9}), rgba(100,255,180,${intensity}), rgba(255,180,100,${intensity}))`
    case 'S2':
      // Cinematic gradient with depth layers
      return `radial-gradient(ellipse at 30% 20%, rgba(255,255,255,${shimmer*0.6}), transparent 40%), linear-gradient(145deg, rgba(255,150,200,${intensity*0.8}) 0%, rgba(150,200,255,${intensity*0.9}) 40%, rgba(200,150,255,${intensity*0.85}) 70%, transparent 100%), conic-gradient(from 0deg at 50% 50%, rgba(255,100,200,${intensity*0.7}), rgba(255,200,100,${intensity*0.75}), rgba(100,255,200,${intensity*0.7}), rgba(200,100,255,${intensity*0.75}), rgba(255,100,200,${intensity*0.7}))`
    case 'S3':
      // Crystalline full-spectrum burst
      return `radial-gradient(circle at 50% 50%, rgba(255,255,255,${shimmer*0.7}), transparent 50%), conic-gradient(from 0deg at 50% 50%, rgba(255,50,50,${intensity}), rgba(255,150,0,${intensity*0.95}), rgba(255,255,50,${intensity*0.9}), rgba(50,255,150,${intensity*0.95}), rgba(50,150,255,${intensity}), rgba(150,50,255,${intensity*0.95}), rgba(255,50,150,${intensity*0.9}), rgba(255,50,50,${intensity}))`
    case 'S4':
      // Holographic fluid refraction
      return `linear-gradient(120deg, rgba(255,255,255,${shimmer*0.6}) 0%, transparent 25%, rgba(255,255,255,${shimmer*0.5}) 50%, transparent 75%), conic-gradient(from 0deg at 50% 50%, rgba(255,220,100,${intensity}), rgba(255,100,220,${intensity*0.9}), rgba(100,220,255,${intensity}), rgba(220,100,255,${intensity*0.9}), rgba(255,220,100,${intensity}))`
    case 'CROWN':
      // Golden iridescent royalty
      return `radial-gradient(circle at 50% 20%, rgba(255,255,255,${shimmer*0.8}), transparent 50%), radial-gradient(circle at 50% 50%, rgba(255,215,0,${intensity*0.6}), transparent 65%), conic-gradient(from 0deg at 50% 50%, rgba(255,215,0,${intensity}), rgba(255,255,200,${shimmer}), rgba(255,180,100,${intensity*0.9}), rgba(255,255,200,${shimmer}), rgba(255,215,0,${intensity}))`
    default:
      return undefined
  }
}

export function rarityTint(rarity: Rarity): string {
  const meta = rarityMap()[rarity]
  return meta?.color || '#c0c0c0'
}

export function rarityLabel(rarity: Rarity): string {
  const meta = rarityMap()[rarity]
  return meta?.symbol || ''
}

export function rarityFrameColors(rarity: Rarity): { a: string; b: string } {
  const base = rarityTint(rarity)
  const lighter = shade(base, 0.35)
  const darker = shade(base, -0.25)
  return { a: lighter, b: darker }
}

export function rarityUsesGradientFrame(rarity: Rarity): boolean {
  // Gradient for D3+ and all S tiers and Crown
  return rarity === 'D3' || rarity === 'D4' || rarity === 'D5' || rarity === 'S1' || rarity === 'S2' || rarity === 'S3' || rarity === 'S4' || rarity === 'CROWN'
}

export function raritySparklesOnReveal(rarity: Rarity): boolean {
  return rarity === 'D2' || rarity === 'D3' || rarity === 'S1'
}

export function rgba(hex: string | undefined, alpha: number){
  if(!hex) return `rgba(255,255,255,${alpha})`
  const { r,g,b } = hexToRgb(hex)
  return `rgba(${r},${g},${b},${alpha})`
}

function hexToRgb(hex: string){
  const h = hex.replace('#','')
  const bigint = parseInt(h, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return { r,g,b }
}

function rgbToHex(r:number,g:number,b:number){
  const to = (n:number)=> n.toString(16).padStart(2,'0')
  return `#${to(Math.max(0,Math.min(255,r)))}${to(Math.max(0,Math.min(255,g)))}${to(Math.max(0,Math.min(255,b)))}`
}

function shade(hex: string, amount: number){
  const {r,g,b} = hexToRgb(hex)
  const t = amount >= 0 ? 255 : 0
  const p = Math.abs(amount)
  const R = Math.round((t - r)*p + r)
  const G = Math.round((t - g)*p + g)
  const B = Math.round((t - b)*p + b)
  return rgbToHex(R,G,B)
}
