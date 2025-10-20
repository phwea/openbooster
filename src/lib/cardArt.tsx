import React from 'react'
import type { Rarity } from '@/lib/types'
import { rarityMap } from '@/lib/rarity'
import * as Base from './artwork/baseArt'
import * as Apex from './artwork/apexArt'
import * as Neo from './artwork/neoArt'

function hash(s:string){ let h=2166136261>>>0; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i); h=Math.imul(h,16777619)} return h>>>0 }
function rng(seed:number){ let t=seed>>>0; return ()=>{ t+=0x6D2B79F5; let r=Math.imul(t^(t>>>15),1|t); r^=r+Math.imul(r^(r>>>7),61|r); return ((r^(r>>>14))>>>0)/4294967296 } }

export function seedFromId(id: string | number){ return typeof id==='number'? id : hash(String(id)) }

type ThemeName = 'classic'|'cosmic'|'speed' | undefined

export function CardArt({ seed, rarity, theme }: { seed: number; rarity: Rarity; theme?: ThemeName }){
  const meta = rarityMap()[rarity]
  const w = 180, h = 252
  
  // Theme colors
  const themeAccent = theme==='cosmic' ? '#8893ff' : theme==='speed' ? '#8df2ff' : '#eac27c'
  const themeSecondary = theme==='cosmic' ? '#b388ff' : theme==='speed' ? '#ff8dce' : '#ffb347'

  // STABILITY FIX: Pre-generate ALL random values in a single memoized object
  // This ensures cards NEVER change on hover/re-render
  const stable = React.useMemo(()=>{
    const r = rng(seed)
    return {
      // D1 positions
      x1: 30 + r()*40,
      y1: 40 + r()*60,
      x2: 100 + r()*40,
      y2: 120 + r()*80,
      // S1 brushstrokes (pre-generate all 8)
      brushes: Array.from({length:8}, (_,i)=>({
        x: 20 + r()*140,
        y: 30 + i*28,
        width: 40 + r()*80,
        angle: -15 + r()*30,
        opacity: 0.12 + r()*0.08
      })),
      // S3 shard lengths (pre-generate all 12)
      shardLengths: Array.from({length:12}, ()=> 30 + r()*25),
      shardOpacities: Array.from({length:12}, ()=> 0.25 + r()*0.15),
      // S4 wave offset
      wavePhase: r(),
      // Crown particles (pre-generate all 24)
      particles: Array.from({length:24}, ()=>({
        angle: r()*360 + r()*15,
        dist: 65 + r()*20,
        size: 1.2 + r()*1.8,
        opacity: 0.6 + r()*0.3
      }))
    }
  }, [seed])

  // Common (D1): Set-specific foundations
  if(rarity==='D1'){
    const props = { w, h, seed, stable, accent: themeAccent, secondary: themeSecondary }
    if(theme==='classic') return <Base.BaseD1 {...props} />
    if(theme==='cosmic') return <Apex.ApexD1 {...props} />
    if(theme==='speed') return <Neo.NeoD1 {...props} />
    // Fallback
    return <Base.BaseD1 {...props} />
  }

  // Uncommon (D2): Set-specific elevation
  if(rarity==='D2'){
    const props = { w, h, seed, stable, accent: themeAccent, secondary: themeSecondary }
    if(theme==='classic') return <Base.BaseD2 {...props} />
    if(theme==='cosmic') return <Apex.ApexD2 {...props} />
    if(theme==='speed') return <Neo.NeoD2 {...props} />
    // Fallback
    return <Base.BaseD2 {...props} />
  }

  // Rare (D3): Brighter gradients, structured symmetry, soft lens flares
  if(rarity==='D3'){
    const cx = w/2, cy = h*0.42
    return (
      <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
        <defs>
          <radialGradient id={`d3-flare-${seed}`} cx="50%" cy="40%">
            <stop offset="0%" stopColor={themeAccent} stopOpacity="0.18"/>
            <stop offset="40%" stopColor={themeAccent} stopOpacity="0.08"/>
            <stop offset="100%" stopColor={themeAccent} stopOpacity="0.00"/>
          </radialGradient>
          <filter id={`d3-glow-${seed}`}>
            <feGaussianBlur stdDeviation="3"/>
          </filter>
        </defs>
        <ellipse cx={cx} cy={cy} rx="70" ry="50" fill={`url(#d3-flare-${seed})`} filter={`url(#d3-glow-${seed})`}/>
        <circle cx={cx} cy={cy} r="28" stroke={themeAccent} strokeWidth="1.5" fill="none" opacity="0.25"/>
        <circle cx={cx} cy={cy} r="42" stroke={themeAccent} strokeWidth="1" fill="none" opacity="0.16"/>
        <circle cx={cx} cy={cy} r="58" stroke="#ffffff" strokeWidth="0.5" fill="none" opacity="0.10"/>
      </svg>
    )
  }

  // Double Rare (D4): Angled sweep, structured color shift
  if(rarity==='D4'){
    return (
      <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
        <defs>
          <linearGradient id={`d4-sweep-${seed}`} x1="0%" y1="20%" x2="100%" y2="90%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.00"/>
            <stop offset="35%" stopColor={themeAccent} stopOpacity="0.14"/>
            <stop offset="50%" stopColor={themeSecondary} stopOpacity="0.18"/>
            <stop offset="80%" stopColor="#ffffff" stopOpacity="0.00"/>
          </linearGradient>
        </defs>
        <polygon points={`0,${h*0.2} ${w},${h*0.4} ${w},${h} 0,${h}`} fill={`url(#d4-sweep-${seed})`}/>
        <line x1="0" y1={h*0.35} x2={w} y2={h*0.55} stroke={themeAccent} strokeWidth="1" opacity="0.22"/>
      </svg>
    )
  }

  // Elite Rare (D5): Ornamental frame etching, depth bevels, brushed reflections
  if(rarity==='D5'){
    const corner = 16
    return (
      <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
        <defs>
          <linearGradient id={`d5-brush-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={themeAccent} stopOpacity="0.12"/>
            <stop offset="100%" stopColor={themeSecondary} stopOpacity="0.06"/>
          </linearGradient>
          <filter id={`d5-emboss-${seed}`}>
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="1" dy="1" result="offsetblur"/>
            <feComponentTransfer><feFuncA type="linear" slope="0.4"/></feComponentTransfer>
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <rect width={w} height={h} fill={`url(#d5-brush-${seed})`}/>
        {/* Ornamental corner accents */}
        <path d={`M${corner},${corner} L${corner+18},${corner} M${corner},${corner} L${corner},${corner+18}`} stroke={themeAccent} strokeWidth="2" opacity="0.35" strokeLinecap="round"/>
        <path d={`M${w-corner},${corner} L${w-corner-18},${corner} M${w-corner},${corner} L${w-corner},${corner+18}`} stroke={themeAccent} strokeWidth="2" opacity="0.35" strokeLinecap="round"/>
        <path d={`M${corner},${h-corner} L${corner+18},${h-corner} M${corner},${h-corner} L${corner},${h-corner-18}`} stroke={themeAccent} strokeWidth="2" opacity="0.35" strokeLinecap="round"/>
        <path d={`M${w-corner},${h-corner} L${w-corner-18},${h-corner} M${w-corner},${h-corner} L${w-corner},${h-corner-18}`} stroke={themeAccent} strokeWidth="2" opacity="0.35" strokeLinecap="round"/>
        <circle cx={w/2} cy={h/2} r="42" stroke={themeAccent} strokeWidth="1.5" fill="none" opacity="0.18" filter={`url(#d5-emboss-${seed})`}/>
      </svg>
    )
  }

  // Illustration Rare (S1): Set-specific artistic expression
  if(rarity==='S1'){
    const props = { w, h, seed, stable, accent: themeAccent, secondary: themeSecondary }
    if(theme==='classic') return <Base.BaseS1 {...props} />
    if(theme==='cosmic') return <Apex.ApexS1 {...props} />
    if(theme==='speed') return <Neo.NeoS1 {...props} />
    // Fallback
    return <Base.BaseS1 {...props} />
  }

  // Special Illustration Rare (S2): Set-specific cinematic depth
  if(rarity==='S2'){
    const props = { w, h, seed, stable, accent: themeAccent, secondary: themeSecondary }
    if(theme==='classic') return <Base.BaseS2 {...props} />
    if(theme==='cosmic') return <Apex.ApexS2 {...props} />
    if(theme==='speed') return <Neo.NeoS2 {...props} />
    // Fallback
    return <Base.BaseS2 {...props} />
  }

  // Mythic/EX (S3): Set-specific mythic power
  if(rarity==='S3'){
    const props = { w, h, seed, stable, accent: themeAccent, secondary: themeSecondary }
    if(theme==='classic') return <Base.BaseS3 {...props} />
    if(theme==='cosmic') return <Apex.ApexS3 {...props} />
    if(theme==='speed') return <Neo.NeoS3 {...props} />
    // Fallback
    return <Base.BaseS3 {...props} />
  }

  // Hyper Rare (S4): Set-specific ultimate visual
  if(rarity==='S4'){
    const props = { w, h, seed, stable, accent: themeAccent, secondary: themeSecondary }
    if(theme==='classic') return <Base.BaseS4 {...props} />
    if(theme==='cosmic') return <Apex.ApexS4 {...props} />
    if(theme==='speed') return <Neo.NeoS4 {...props} />
    // Fallback
    return <Base.BaseS4 {...props} />
  }

  // Crown Rare: Set-specific legendary apex
  if(rarity==='CROWN'){
    const props = { w, h, seed, stable, accent: themeAccent, secondary: themeSecondary }
    if(theme==='classic') return <Base.BaseCROWN {...props} />
    if(theme==='cosmic') return <Apex.ApexCROWN {...props} />
    if(theme==='speed') return <Neo.NeoCROWN {...props} />
    // Fallback
    return <Base.BaseCROWN {...props} />
  }

  // Fallback
  return <div className="absolute inset-[6px] rounded-[8px] bg-neutral-900" />
}
