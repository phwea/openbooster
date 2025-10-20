// NEO Set (Speed) Artwork - Tech, circuitry, motion themes
// Visual identity: Cyan/magenta palette, angular lines, energy flow

import type { Rarity } from '@/lib/types'

type ArtProps = { w: number; h: number; seed: number; stable: any; accent: string; secondary: string }

// D1: Circuit foundation - tech lines with energy nodes
export function NeoD1({ w, h, seed, stable, accent }: ArtProps) {
  const {x1, y1, x2, y2} = stable
  return (
    <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
      <defs>
        <linearGradient id={`d1-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.08"/>
          <stop offset="100%" stopColor="#000000" stopOpacity="0.00"/>
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#d1-${seed})`}/>
      <line x1="20" y1={y1} x2="160" y2={y1} stroke={accent} strokeWidth="2" opacity="0.14"/>
      <line x1="20" y1={y2} x2="160" y2={y2} stroke={accent} strokeWidth="2" opacity="0.12"/>
      <circle cx="30" cy={y1} r="4" fill={accent} fillOpacity="0.30"/>
      <circle cx="150" cy={y2} r="4" fill={accent} fillOpacity="0.25"/>
      <circle cx={w/2} cy={h/2} r="3" fill={accent} fillOpacity="0.35"/>
      {/* Connection traces */}
      <line x1="30" y1={y1} x2={w/2} y2={h/2} stroke={accent} strokeWidth="0.8" opacity="0.08"/>
      <line x1="150" y1={y2} x2={w/2} y2={h/2} stroke={accent} strokeWidth="0.8" opacity="0.08"/>
    </svg>
  )
}

// D2: Circuit mesh - layered tech grid with power rails
export function NeoD2({ w, h, seed, accent }: ArtProps) {
  const lines = Array.from({length:5}).map((_,i)=>{
    const y = 50 + i*40
    return <line key={i} x1="15" y1={y} x2="165" y2={y} stroke={accent} strokeWidth="2.5" opacity={0.10 - i*0.015}/>
  })
  return (
    <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
      <defs>
        <linearGradient id={`d2-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.10"/>
          <stop offset="80%" stopColor="#000000" stopOpacity="0.00"/>
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#d2-${seed})`}/>
      {lines}
      <rect x="22" y="60" width="8" height="130" rx="2" fill={accent} fillOpacity="0.12"/>
      <rect x="150" y="60" width="8" height="130" rx="2" fill={accent} fillOpacity="0.12"/>
      {/* Data nodes */}
      <circle cx="26" cy="75" r="3" fill={accent} fillOpacity="0.40"/>
      <circle cx="154" cy="165" r="3" fill={accent} fillOpacity="0.40"/>
      <rect x="24" y="120" width="4" height="10" rx="1" fill={accent} fillOpacity="0.35"/>
      <rect x="152" y="100" width="4" height="10" rx="1" fill={accent} fillOpacity="0.35"/>
    </svg>
  )
}

// S1: Hologram scan - tech grid with scanning beams
export function NeoS1({ w, h, seed, stable, accent, secondary }: ArtProps) {
  const scanLines = stable.brushes.map((b: any, i: number) =>
    <line key={i} x1="20" y1={b.y+25} x2="160" y2={b.y+25} stroke={accent} strokeWidth="2" opacity={b.opacity*0.9}/>
  )
  return (
    <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
      <defs>
        <linearGradient id={`s1-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={secondary} stopOpacity="0.00"/>
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#s1-${seed})`}/>
      {scanLines}
      {/* Hologram frame */}
      <rect x="32" y="65" width="116" height="120" rx="6" fill="none" stroke={accent} strokeWidth="3" opacity="0.32"/>
      <circle cx="38" cy="71" r="3" fill={accent} fillOpacity="0.65"/>
      <circle cx="142" cy="71" r="3" fill={accent} fillOpacity="0.65"/>
      <circle cx="38" cy="179" r="3" fill={accent} fillOpacity="0.65"/>
      <circle cx="142" cy="179" r="3" fill={accent} fillOpacity="0.65"/>
      {/* Energy indicators */}
      <rect x="36" y="90" width="6" height="14" rx="1" fill={secondary} fillOpacity="0.40"/>
      <rect x="138" y="145" width="6" height="14" rx="1" fill={secondary} fillOpacity="0.40"/>
    </svg>
  )
}

// S2: Data stream - flowing information layers
export function NeoS2({ w, h, seed, accent, secondary }: ArtProps) {
  const streams = Array.from({length:6}).map((_,i)=>{
    const y = 45 + i*35
    const offset = i*15
    return (
      <g key={i}>
        <rect x={20+offset} y={y} width="60" height="4" rx="2" fill={accent} fillOpacity={0.14-i*0.015}/>
        <rect x={25+offset} y={y+8} width="80" height="3" rx="1.5" fill={secondary} fillOpacity={0.10-i*0.012}/>
      </g>
    )
  })
  return (
    <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
      <defs>
        <linearGradient id={`s2-${seed}`} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.22"/>
          <stop offset="50%" stopColor={secondary} stopOpacity="0.16"/>
          <stop offset="100%" stopColor="#000000" stopOpacity="0.00"/>
        </linearGradient>
        <filter id={`s2-glow-${seed}`}>
          <feGaussianBlur stdDeviation="3"/>
        </filter>
      </defs>
      <rect width={w} height={h} fill={`url(#s2-${seed})`}/>
      {streams}
      {/* Data packets */}
      <circle cx={w*0.7} cy={h*0.3} r="45" fill={accent} fillOpacity="0.12" filter={`url(#s2-glow-${seed})`}/>
      <rect x={w*0.7-20} y={h*0.3-8} width="40" height="4" rx="2" fill={accent} fillOpacity="0.30"/>
      <rect x={w*0.7-15} y={h*0.3+4} width="30" height="3" rx="1.5" fill={secondary} fillOpacity="0.25"/>
    </svg>
  )
}

// S3: Energy surge - tech overload with pulsing power
export function NeoS3({ w, h, seed, stable, accent, secondary }: ArtProps) {
  const shards = stable.shardLengths.map((len: number, i: number) => {
    const angle = (i/12)*360
    const x1 = w/2 + Math.cos(angle*Math.PI/180)*28
    const y1 = h/2 + Math.sin(angle*Math.PI/180)*28
    const x2 = x1 + Math.cos(angle*Math.PI/180)*(len+5)
    const y2 = y1 + Math.sin(angle*Math.PI/180)*(len+5)
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth="3" opacity={stable.shardOpacities[i]}/>
  })
  return (
    <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
      <defs>
        <radialGradient id={`s3-${seed}`} cx="50%" cy="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.34"/>
          <stop offset="30%" stopColor={secondary} stopOpacity="0.22"/>
          <stop offset="100%" stopColor="#000000" stopOpacity="0.00"/>
        </radialGradient>
        <filter id={`s3-glow-${seed}`}>
          <feGaussianBlur stdDeviation="2"/>
          <feComponentTransfer><feFuncA type="linear" slope="1.5"/></feComponentTransfer>
        </filter>
      </defs>
      <ellipse cx={w/2} cy={h/2} rx="80" ry="70" fill={`url(#s3-${seed})`}/>
      {shards}
      {/* Energy core */}
      <rect x={w/2-10} y={h/2-10} width="20" height="20" rx="3" fill={accent} fillOpacity="0.45" filter={`url(#s3-glow-${seed})`}/>
      <rect x={w/2-16} y={h/2-16} width="32" height="32" rx="4" fill="none" stroke={accent} strokeWidth="2" opacity="0.35"/>
      <rect x={w/2-24} y={h/2-24} width="48" height="48" rx="6" fill="none" stroke={secondary} strokeWidth="1.5" opacity="0.25"/>
      {/* Power conduits */}
      <line x1={w/2-35} y1={h/2} x2={w/2-24} y2={h/2} stroke={accent} strokeWidth="2" opacity="0.30"/>
      <line x1={w/2+24} y1={h/2} x2={w/2+35} y2={h/2} stroke={accent} strokeWidth="2" opacity="0.30"/>
    </svg>
  )
}

// S4: Speed flux - racing light trails with motion blur
export function NeoS4({ w, h, seed, accent, secondary }: ArtProps) {
  const trails = Array.from({length:8}).map((_,i)=>{
    const y = 15 + i*32
    const len1 = 80 + i*8
    const len2 = 60 + i*6
    const color = i%2===0 ? accent : secondary
    return (
      <g key={i}>
        <rect x={w-len1-10} y={y} width={len1} height="3" rx="1.5" fill={color} fillOpacity={0.18-i*0.015}/>
        <rect x={w-len2-15} y={y+6} width={len2} height="2" rx="1" fill={color} fillOpacity={0.12-i*0.01}/>
      </g>
    )
  })
  return (
    <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
      <defs>
        <linearGradient id={`s4-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.24"/>
          <stop offset="33%" stopColor={secondary} stopOpacity="0.20"/>
          <stop offset="66%" stopColor={accent} stopOpacity="0.14"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.00"/>
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#s4-${seed})`}/>
      {trails}
      {/* Speed indicators */}
      <polygon points={`${w-20},${h/2-15} ${w-20},${h/2+15} ${w-8},${h/2}`} fill={accent} fillOpacity="0.35"/>
      <rect x={w-40} y={h/2-3} width="16" height="6" rx="1" fill={accent} fillOpacity="0.28"/>
      <rect x={w-58} y={h/2-2} width="12" height="4" rx="1" fill={secondary} fillOpacity="0.22"/>
    </svg>
  )
}

// CROWN: Velocity apex - ultimate tech convergence
export function NeoCROWN({ w, h, seed, stable, accent, secondary }: ArtProps) {
  const particles = stable.particles.map((p: any, i: number) => {
    const x = w/2 + Math.cos(p.angle*Math.PI/180)*p.dist
    const y = h/2 + Math.sin(p.angle*Math.PI/180)*p.dist
    // Angular particles for tech feel
    return <rect key={i} x={x-p.size/2} y={y-p.size/2} width={p.size} height={p.size} rx="0.5" fill={accent} fillOpacity={p.opacity} transform={`rotate(${p.angle} ${x} ${y})`}/>
  })
  return (
    <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
      <defs>
        <radialGradient id={`crown-${seed}`} cx="50%" cy="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.42"/>
          <stop offset="40%" stopColor={secondary} stopOpacity="0.26"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.00"/>
        </radialGradient>
        <filter id={`crown-lux-${seed}`}>
          <feGaussianBlur stdDeviation="3"/>
          <feComponentTransfer><feFuncA type="linear" slope="1.7"/></feComponentTransfer>
        </filter>
      </defs>
      <ellipse cx={w/2} cy={h/2} rx="90" ry="80" fill={`url(#crown-${seed})`}/>
      {particles}
      {/* Tech crown */}
      <path d={`M${w/2},${h/2-32} L${w/2+16},${h/2-16} L${w/2+26},${h/2-20} L${w/2+18},${h/2} L${w/2+24},${h/2+20} L${w/2},${h/2+10} L${w/2-24},${h/2+20} L${w/2-18},${h/2} L${w/2-26},${h/2-20} L${w/2-16},${h/2-16} Z`} 
            fill={accent} fillOpacity="0.58" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.75" filter={`url(#crown-lux-${seed})`}/>
      {/* Circuit rings */}
      <rect x={w/2-48} y={h/2-48} width="96" height="96" rx="12" fill="none" stroke={accent} strokeWidth="2.5" opacity="0.42"/>
      <rect x={w/2-62} y={h/2-62} width="124" height="124" rx="16" fill="none" stroke={secondary} strokeWidth="2" opacity="0.32"/>
      {/* Data flow lines */}
      <line x1={w/2-48} y1={h/2-30} x2={w/2-62} y2={h/2-40} stroke={accent} strokeWidth="1.5" opacity="0.35"/>
      <line x1={w/2+48} y1={h/2+30} x2={w/2+62} y2={h/2+40} stroke={accent} strokeWidth="1.5" opacity="0.35"/>
      <line x1={w/2-30} y1={h/2-48} x2={w/2-40} y2={h/2-62} stroke={secondary} strokeWidth="1.5" opacity="0.30"/>
      <line x1={w/2+30} y1={h/2+48} x2={w/2+40} y2={h/2+62} stroke={secondary} strokeWidth="1.5" opacity="0.30"/>
    </svg>
  )
}
