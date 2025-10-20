// APEX Set (Cosmic) Artwork - Space, orbital, aurora themes
// Visual identity: Violet/purple palette, floating elements, ethereal glow

import type { Rarity } from '@/lib/types'

type ArtProps = { w: number; h: number; seed: number; stable: any; accent: string; secondary: string }

// D1: Orbital foundation - floating orbs in space
export function ApexD1({ w, h, seed, stable, accent }: ArtProps) {
  const {x1, y1, x2, y2} = stable
  return (
    <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
      <defs>
        <radialGradient id={`d1-${seed}`} cx="50%" cy="40%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.10"/>
          <stop offset="100%" stopColor="#000000" stopOpacity="0.00"/>
        </radialGradient>
      </defs>
      <ellipse cx={w/2} cy={h*0.4} rx="85" ry="70" fill={`url(#d1-${seed})`}/>
      <circle cx={x1} cy={y1} r="34" fill={accent} fillOpacity="0.05"/>
      <circle cx={x2} cy={y2} r="26" fill={accent} fillOpacity="0.04"/>
      <circle cx={w/2} cy={h/2} r="18" fill={accent} fillOpacity="0.06"/>
      {/* Tiny stars */}
      <circle cx={x1-20} cy={y1-15} r="1.5" fill="#ffffff" fillOpacity="0.60"/>
      <circle cx={x2+25} cy={y2+20} r="1.5" fill="#ffffff" fillOpacity="0.55"/>
      <circle cx={w/2-35} cy={h/2-40} r="1.2" fill="#ffffff" fillOpacity="0.50"/>
    </svg>
  )
}

// D2: Orbital rings - expanding halos with stellar depth
export function ApexD2({ w, h, seed, accent }: ArtProps) {
  return (
    <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
      <defs>
        <radialGradient id={`d2-${seed}`} cx="50%" cy="45%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#000000" stopOpacity="0.00"/>
        </radialGradient>
      </defs>
      <ellipse cx={w/2} cy={h*0.45} rx="95" ry="80" fill={`url(#d2-${seed})`}/>
      <circle cx={w/2} cy={h*0.45} r="38" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.16"/>
      <circle cx={w/2} cy={h*0.45} r="58" stroke={accent} strokeWidth="1" fill="none" opacity="0.12"/>
      <circle cx={w/2} cy={h*0.45} r="78" stroke="#ffffff" strokeWidth="0.5" fill="none" opacity="0.08"/>
      {/* Orbital nodes */}
      <circle cx={w/2+38} cy={h*0.45} r="2.5" fill={accent} fillOpacity="0.50"/>
      <circle cx={w/2-38} cy={h*0.45} r="2.5" fill={accent} fillOpacity="0.50"/>
      <circle cx={w/2} cy={h*0.45-58} r="2" fill="#ffffff" fillOpacity="0.45"/>
      <circle cx={w/2} cy={h*0.45+58} r="2" fill="#ffffff" fillOpacity="0.45"/>
    </svg>
  )
}

// S1: Stellar constellation - connected star map with cosmic glow
export function ApexS1({ w, h, seed, stable, accent, secondary }: ArtProps) {
  const stars = stable.brushes.map((b: any, i: number) =>
    <circle key={`star-${i}`} cx={b.x+25} cy={b.y+25} r={2.5+b.opacity*10} fill={accent} fillOpacity={b.opacity+0.12}/>
  )
  const connections = stable.brushes.slice(0, 6).map((b: any, i: number) => {
    const next = stable.brushes[(i+1) % 6]
    return <line key={`line-${i}`} x1={b.x+25} y1={b.y+25} x2={next.x+25} y2={next.y+25} stroke={accent} strokeWidth="0.8" opacity="0.18"/>
  })
  return (
    <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
      <defs>
        <radialGradient id={`s1-${seed}`} cx="50%" cy="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.20"/>
          <stop offset="100%" stopColor={secondary} stopOpacity="0.00"/>
        </radialGradient>
        <filter id={`s1-glow-${seed}`}>
          <feGaussianBlur stdDeviation="2"/>
        </filter>
      </defs>
      <ellipse cx={w/2} cy={h/2} rx="90" ry="100" fill={`url(#s1-${seed})`}/>
      {connections}
      {stars}
      {/* Nebula wisps */}
      <ellipse cx={w*0.3} cy={h*0.35} rx="25" ry="35" fill={secondary} fillOpacity="0.08" filter={`url(#s1-glow-${seed})`}/>
      <ellipse cx={w*0.7} cy={h*0.65} rx="30" ry="40" fill={accent} fillOpacity="0.08" filter={`url(#s1-glow-${seed})`}/>
    </svg>
  )
}

// S2: Aurora layers - flowing cosmic curtains with depth
export function ApexS2({ w, h, seed, accent, secondary }: ArtProps) {
  const layers = [
    {x: 30, y: 50, w: 120, h: 150, op: 0.06, rx: 15},
    {x: 50, y: 70, w: 80, h: 110, op: 0.10, rx: 12},
    {x: 70, y: 90, w: 40, h: 70, op: 0.14, rx: 10}
  ]
  return (
    <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
      <defs>
        <linearGradient id={`s2-${seed}`} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.24"/>
          <stop offset="50%" stopColor={secondary} stopOpacity="0.16"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.00"/>
        </linearGradient>
        <filter id={`s2-depth-${seed}`}>
          <feGaussianBlur stdDeviation="5"/>
        </filter>
      </defs>
      <rect width={w} height={h} fill={`url(#s2-${seed})`}/>
      {layers.map((l,i)=><ellipse key={i} cx={l.x+l.w/2} cy={l.y+l.h/2} rx={l.w/2} ry={l.h/2} fill="#ffffff" fillOpacity={l.op} filter={i<2?`url(#s2-depth-${seed})`:undefined}/>)}
      <ellipse cx={w*0.7} cy={h*0.3} r="70" fill={accent} fillOpacity="0.14" filter={`url(#s2-depth-${seed})`}/>
      {/* Aurora streamers */}
      <path d={`M20,${h*0.3} Q${w/2},${h*0.2} ${w-20},${h*0.35}`} stroke={accent} strokeWidth="1.5" fill="none" opacity="0.20"/>
      <path d={`M25,${h*0.6} Q${w/2},${h*0.7} ${w-25},${h*0.65}`} stroke={secondary} strokeWidth="1.5" fill="none" opacity="0.18"/>
    </svg>
  )
}

// S3: Supernova burst - explosive cosmic energy
export function ApexS3({ w, h, seed, stable, accent, secondary }: ArtProps) {
  const shards = stable.shardLengths.map((len: number, i: number) => {
    const angle = (i/12)*360
    const x1 = w/2 + Math.cos(angle*Math.PI/180)*30
    const y1 = h/2 + Math.sin(angle*Math.PI/180)*30
    const x2 = x1 + Math.cos(angle*Math.PI/180)*len
    const y2 = y1 + Math.sin(angle*Math.PI/180)*len
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth="2.5" opacity={stable.shardOpacities[i]}/>
  })
  return (
    <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
      <defs>
        <radialGradient id={`s3-${seed}`} cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22"/>
          <stop offset="15%" stopColor={accent} stopOpacity="0.32"/>
          <stop offset="40%" stopColor={secondary} stopOpacity="0.20"/>
          <stop offset="100%" stopColor="#000000" stopOpacity="0.00"/>
        </radialGradient>
        <filter id={`s3-glow-${seed}`}>
          <feGaussianBlur stdDeviation="2.5"/>
          <feComponentTransfer><feFuncA type="linear" slope="1.6"/></feComponentTransfer>
        </filter>
      </defs>
      <ellipse cx={w/2} cy={h/2} rx="90" ry="80" fill={`url(#s3-${seed})`}/>
      {shards}
      <circle cx={w/2} cy={h/2} r="18" fill={accent} fillOpacity="0.55" filter={`url(#s3-glow-${seed})`}/>
      <circle cx={w/2} cy={h/2} r="38" fill="none" stroke={accent} strokeWidth="2" opacity="0.32"/>
      <circle cx={w/2} cy={h/2} r="58" fill="none" stroke={secondary} strokeWidth="1.5" opacity="0.22"/>
      {/* Energy rings */}
      <circle cx={w/2} cy={h/2} r="48" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.18" strokeDasharray="4,8"/>
    </svg>
  )
}

// S4: Cosmic waves - fluid aurora refraction
export function ApexS4({ w, h, seed, accent, secondary }: ArtProps) {
  const bands = Array.from({length:7}).map((_,i)=>{
    const y = 20 + i*36
    const waveOffset = Math.sin(i*0.9 + 0.5)*15
    const color = i%2===0 ? accent : secondary
    return (
      <g key={i}>
        <path d={`M${waveOffset},${y} Q${w/2},${y+12} ${w-waveOffset},${y} L${w-waveOffset},${y+14} Q${w/2},${y+26} ${waveOffset},${y+14} Z`} 
              fill={color} fillOpacity={0.14} />
      </g>
    )
  })
  return (
    <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
      <defs>
        <linearGradient id={`s4-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.24"/>
          <stop offset="33%" stopColor={secondary} stopOpacity="0.20"/>
          <stop offset="66%" stopColor={accent} stopOpacity="0.16"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.00"/>
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#s4-${seed})`}/>
      {bands}
      <ellipse cx={w/2} cy={h/2} rx="55" ry="48" fill="none" stroke={accent} strokeWidth="2" opacity="0.30" strokeDasharray="8,4"/>
      <ellipse cx={w/2} cy={h/2} rx="70" ry="62" fill="none" stroke={secondary} strokeWidth="1.5" opacity="0.22" strokeDasharray="6,3"/>
    </svg>
  )
}

// CROWN: Celestial majesty - cosmic throne with stellar radiance
export function ApexCROWN({ w, h, seed, stable, accent, secondary }: ArtProps) {
  const particles = stable.particles.map((p: any, i: number) => {
    const x = w/2 + Math.cos(p.angle*Math.PI/180)*p.dist
    const y = h/2 + Math.sin(p.angle*Math.PI/180)*p.dist
    return <circle key={i} cx={x} cy={y} r={p.size} fill={accent} fillOpacity={p.opacity}/>
  })
  return (
    <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
      <defs>
        <radialGradient id={`crown-${seed}`} cx="50%" cy="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.40"/>
          <stop offset="40%" stopColor={secondary} stopOpacity="0.24"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.00"/>
        </radialGradient>
        <filter id={`crown-lux-${seed}`}>
          <feGaussianBlur stdDeviation="3.5"/>
          <feComponentTransfer><feFuncA type="linear" slope="1.8"/></feComponentTransfer>
        </filter>
      </defs>
      <ellipse cx={w/2} cy={h/2} rx="92" ry="82" fill={`url(#crown-${seed})`}/>
      {particles}
      {/* Cosmic crown */}
      <path d={`M${w/2},${h/2-30} L${w/2+14},${h/2-14} L${w/2+24},${h/2-18} L${w/2+16},${h/2} L${w/2+22},${h/2+18} L${w/2},${h/2+8} L${w/2-22},${h/2+18} L${w/2-16},${h/2} L${w/2-24},${h/2-18} L${w/2-14},${h/2-14} Z`} 
            fill={accent} fillOpacity="0.55" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.70" filter={`url(#crown-lux-${seed})`}/>
      <circle cx={w/2} cy={h/2} r="60" fill="none" stroke={accent} strokeWidth="2" opacity="0.40"/>
      <circle cx={w/2} cy={h/2} r="76" fill="none" stroke={secondary} strokeWidth="1.5" opacity="0.30"/>
      {/* Orbital rings */}
      <ellipse cx={w/2} cy={h/2} rx="88" ry="15" fill="none" stroke={accent} strokeWidth="1" opacity="0.18" transform={`rotate(15 ${w/2} ${h/2})`}/>
      <ellipse cx={w/2} cy={h/2} rx="88" ry="15" fill="none" stroke={secondary} strokeWidth="0.8" opacity="0.14" transform={`rotate(-15 ${w/2} ${h/2})`}/>
    </svg>
  )
}
