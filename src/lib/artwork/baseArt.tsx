// BASE Set (Classic) Artwork - Geometric, traditional, elegant
// Visual identity: Gold/orange palette, clean shapes, refined symmetry

import type { Rarity } from '@/lib/types'

type ArtProps = { w: number; h: number; seed: number; stable: any; accent: string; secondary: string }

// D1: Geometric foundation - clean rectangles with subtle depth
export function BaseD1({ w, h, seed, stable, accent }: ArtProps) {
  const {x1, y1, x2, y2} = stable
  return (
    <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
      <defs>
        <linearGradient id={`d1-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.06"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.01"/>
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#d1-${seed})`}/>
      <rect x={x1} y={y1} width="70" height="70" rx="6" fill="#ffffff" fillOpacity="0.03"/>
      <rect x={x2-27} y={y2-27} width="55" height="55" rx="6" fill="#ffffff" fillOpacity="0.02"/>
      <rect x={w/2-15} y={h/2-15} width="30" height="30" rx="3" fill={accent} fillOpacity="0.04"/>
    </svg>
  )
}

// D2: Stepped elevation - layered frames with refined borders
export function BaseD2({ w, h, seed, accent }: ArtProps) {
  return (
    <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
      <defs>
        <linearGradient id={`d2-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.08"/>
          <stop offset="60%" stopColor="#000000" stopOpacity="0.00"/>
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#d2-${seed})`}/>
      <rect x="20" y="50" width="140" height="152" rx="8" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.06"/>
      <rect x="30" y="70" width="120" height="112" rx="8" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.05"/>
      <rect x="40" y="90" width="100" height="72" rx="8" fill="none" stroke={accent} strokeWidth="1" opacity="0.08"/>
    </svg>
  )
}

// D3: Already theme-aware (lens flares)
// D4: Already theme-aware (color sweep)
// D5: Already theme-aware (ornamental corners)

// S1: Gallery presentation - painterly brushstrokes with elegant frame
export function BaseS1({ w, h, seed, stable, accent, secondary }: ArtProps) {
  const brushes = stable.brushes.map((b: any, i: number) =>
    <rect key={i} x={b.x} y={b.y} width={b.width} height="6" rx="3" 
          fill={accent} fillOpacity={b.opacity} 
          transform={`rotate(${b.angle} ${b.x} ${b.y})`}/>
  )
  return (
    <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
      <defs>
        <radialGradient id={`s1-${seed}`} cx="50%" cy="45%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={secondary} stopOpacity="0.00"/>
        </radialGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#s1-${seed})`}/>
      {brushes}
      {/* Gallery frame */}
      <rect x="25" y={h/2-55} width="130" height="110" rx="12" fill="none" stroke={accent} strokeWidth="2" opacity="0.30" strokeDasharray="6,4"/>
      <circle cx="30" cy={h/2-50} r="2" fill={accent} fillOpacity="0.50"/>
      <circle cx="150" cy={h/2-50} r="2" fill={accent} fillOpacity="0.50"/>
      <circle cx="30" cy={h/2+50} r="2" fill={accent} fillOpacity="0.50"/>
      <circle cx="150" cy={h/2+50} r="2" fill={accent} fillOpacity="0.50"/>
    </svg>
  )
}

// S2: Museum depth - cinematic layering with golden highlights
export function BaseS2({ w, h, seed, accent, secondary }: ArtProps) {
  const layers = [
    {x: 35, y: 55, w: 110, h: 140, op: 0.08, rx: 12},
    {x: 50, y: 75, w: 80, h: 100, op: 0.12, rx: 10},
    {x: 65, y: 95, w: 50, h: 60, op: 0.16, rx: 8}
  ]
  return (
    <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
      <defs>
        <linearGradient id={`s2-${seed}`} x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.22"/>
          <stop offset="50%" stopColor={secondary} stopOpacity="0.16"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.00"/>
        </linearGradient>
        <filter id={`s2-depth-${seed}`}>
          <feGaussianBlur stdDeviation="4"/>
        </filter>
      </defs>
      <rect width={w} height={h} fill={`url(#s2-${seed})`}/>
      {layers.map((l,i)=><rect key={i} x={l.x} y={l.y} width={l.w} height={l.h} rx={l.rx} fill="#ffffff" fillOpacity={l.op} filter={i<2?`url(#s2-depth-${seed})`:undefined}/>)}
      <circle cx={w*0.75} cy={h*0.3} r="65" fill={accent} fillOpacity="0.14" filter={`url(#s2-depth-${seed})`}/>
      {/* Golden accent corners */}
      <rect x="30" y="50" width="3" height="20" rx="1" fill={accent} fillOpacity="0.35"/>
      <rect x="30" y="50" width="20" height="3" rx="1" fill={accent} fillOpacity="0.35"/>
    </svg>
  )
}

// S3: Prismatic power - refracted light with geometric precision
export function BaseS3({ w, h, seed, stable, accent, secondary }: ArtProps) {
  const shards = stable.shardLengths.map((len: number, i: number) => {
    const angle = (i/12)*360
    const x1 = w/2 + Math.cos(angle*Math.PI/180)*25
    const y1 = h/2 + Math.sin(angle*Math.PI/180)*25
    const x2 = x1 + Math.cos(angle*Math.PI/180)*len
    const y2 = y1 + Math.sin(angle*Math.PI/180)*len
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth="2.5" opacity={stable.shardOpacities[i]}/>
  })
  return (
    <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
      <defs>
        <radialGradient id={`s3-${seed}`} cx="50%" cy="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.30"/>
          <stop offset="30%" stopColor={secondary} stopOpacity="0.20"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.00"/>
        </radialGradient>
        <filter id={`s3-glow-${seed}`}>
          <feGaussianBlur stdDeviation="1.5"/>
          <feComponentTransfer><feFuncA type="linear" slope="1.4"/></feComponentTransfer>
        </filter>
      </defs>
      <ellipse cx={w/2} cy={h/2} rx="75" ry="65" fill={`url(#s3-${seed})`}/>
      {shards}
      <polygon points={`${w/2},${h/2-32} ${w/2+20},${h/2} ${w/2},${h/2+32} ${w/2-20},${h/2}`} 
               fill={accent} fillOpacity="0.38" filter={`url(#s3-glow-${seed})`}/>
      <circle cx={w/2} cy={h/2} r="22" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.28"/>
      <circle cx={w/2} cy={h/2} r="40" fill="none" stroke={accent} strokeWidth="1" opacity="0.20"/>
    </svg>
  )
}

// S4: Ornate prism - fluid light with classical refinement
export function BaseS4({ w, h, seed, accent, secondary }: ArtProps) {
  const bands = Array.from({length:7}).map((_,i)=>{
    const y = 20 + i*36
    const waveOffset = Math.sin(i*0.8)*12
    const color = i%2===0 ? accent : secondary
    return (
      <g key={i}>
        <path d={`M${waveOffset},${y} Q${w/2},${y+10} ${w-waveOffset},${y} L${w-waveOffset},${y+12} Q${w/2},${y+22} ${waveOffset},${y+12} Z`} 
              fill={color} fillOpacity={0.16} />
      </g>
    )
  })
  return (
    <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
      <defs>
        <linearGradient id={`s4-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.22"/>
          <stop offset="33%" stopColor={secondary} stopOpacity="0.18"/>
          <stop offset="66%" stopColor={accent} stopOpacity="0.14"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.00"/>
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#s4-${seed})`}/>
      {bands}
      <circle cx={w/2} cy={h/2} r="52" fill="none" stroke={accent} strokeWidth="2.5" opacity="0.32" strokeDasharray="10,5"/>
      <circle cx={w/2} cy={h/2} r="38" fill="none" stroke={secondary} strokeWidth="1.5" opacity="0.28" strokeDasharray="6,3"/>
    </svg>
  )
}

// CROWN: Golden majesty - royal emblem with refined elegance
export function BaseCROWN({ w, h, seed, stable }: ArtProps) {
  const particles = stable.particles.map((p: any, i: number) => {
    const x = w/2 + Math.cos(p.angle*Math.PI/180)*p.dist
    const y = h/2 + Math.sin(p.angle*Math.PI/180)*p.dist
    return <circle key={i} cx={x} cy={y} r={p.size} fill="#ffd700" fillOpacity={p.opacity}/>
  })
  return (
    <svg className="absolute inset-[6px] rounded-[8px]" viewBox={`0 0 ${w} ${h}`} style={{background:'#0a0a0a'}}>
      <defs>
        <radialGradient id={`crown-${seed}`} cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ffd700" stopOpacity="0.38"/>
          <stop offset="40%" stopColor="#ffb347" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.00"/>
        </radialGradient>
        <filter id={`crown-lux-${seed}`}>
          <feGaussianBlur stdDeviation="3"/>
          <feComponentTransfer><feFuncA type="linear" slope="1.6"/></feComponentTransfer>
        </filter>
      </defs>
      <ellipse cx={w/2} cy={h/2} rx="88" ry="78" fill={`url(#crown-${seed})`}/>
      {particles}
      {/* Refined crown shape */}
      <path d={`M${w/2},${h/2-28} L${w/2+12},${h/2-12} L${w/2+22},${h/2-16} L${w/2+14},${h/2} L${w/2+20},${h/2+16} L${w/2},${h/2+6} L${w/2-20},${h/2+16} L${w/2-14},${h/2} L${w/2-22},${h/2-16} L${w/2-12},${h/2-12} Z`} 
            fill="#ffd700" fillOpacity="0.52" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.65" filter={`url(#crown-lux-${seed})`}/>
      <circle cx={w/2} cy={h/2} r="58" fill="none" stroke="#ffd700" strokeWidth="2" opacity="0.38"/>
      <circle cx={w/2} cy={h/2} r="73" fill="none" stroke="#ffb347" strokeWidth="1.5" opacity="0.28"/>
      {/* Corner ornaments */}
      <rect x="15" y="15" width="4" height="18" rx="2" fill="#ffd700" fillOpacity="0.30"/>
      <rect x="15" y="15" width="18" height="4" rx="2" fill="#ffd700" fillOpacity="0.30"/>
    </svg>
  )
}
