import React, { useMemo, useRef, useEffect } from 'react'
import type { Rarity } from '@/lib/types'
import { rarityMap } from '@/lib/rarity'
import { SETS as REGISTRY } from '@/sets/registry'
import { useReducedMotion } from '@/lib/settings'
import { CardArt, seedFromId } from '@/lib/cardArt'

function hash(s:string){ let h=2166136261>>>0; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i); h=Math.imul(h,16777619)} return h>>>0 }
function rng(seed:number){ let t=seed>>>0; return ()=>{ t+=0x6D2B79F5; let r=Math.imul(t^(t>>>15),1|t); r^=r+Math.imul(r^(r>>>7),61|t); return ((r^(r>>>14))>>>0)/4294967296 } }

// Hover3D_TiltParallaxGlare_V1 tokens
const MAX_TILT = 12 // degrees
const MAX_PARALLAX = 6 // px
const HOVER_SCALE = 1.01
const EXIT_DEBOUNCE_MS = 50
const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)'

// Single active hover lock
let ACTIVE_HOVER: { el: HTMLElement | null; cleanup: (()=>void) | null; raf: number | null } = { el: null, cleanup: null, raf: null }

const RARITY_BORDER: Record<Rarity, { color: string; width: number; bgColor?: string; fullArt?: boolean; holo?: string; animated?: boolean }>= {
  D1:{ color:'#3A4450', width:1, bgColor:'#0B0D0F' },
  D2:{ color:'#4A9B62', width:1, bgColor:'#0B0D0F' },
  D3:{ color:'#5B8FD9', width:2, bgColor:'#0F1218', holo:'subtle' },
  D4:{ color:'#A855F7', width:2, bgColor:'#11101A', holo:'shimmer', animated:true },
  D5:{ color:'#EC4899', width:2, bgColor:'#1A0F1A', holo:'wave', animated:true },
  S1:{ color:'#F59E0B', width:3, bgColor:'#0B0D0F', fullArt:true, holo:'radial', animated:true },
  S2:{ color:'#06B6D4', width:3, bgColor:'#0B0D0F', fullArt:true, holo:'prismatic', animated:true },
  S3:{ color:'#F43F5E', width:3, bgColor:'#1A0A14', holo:'rainbow', animated:true },
  S4:{ color:'#8B5CF6', width:4, bgColor:'#14101C', holo:'cosmic', animated:true },
  CROWN:{ color:'#FCD34D', width:4, bgColor:'#1A1410', holo:'legendary', animated:true }
}

export function ProgrammaticCard({ card, onClick, topActive, fxOn, onSetClick, hover3D }: { card: any; onClick: ()=>void; topActive: boolean; fxOn: boolean; onSetClick?: (setId: string)=>void; hover3D?: boolean }){
  const theme = useMemo(()=> REGISTRY[card.set]?.theme as ('classic'|'cosmic'|'speed'|undefined), [card.set])
  const meta = rarityMap()[card.rarity as Rarity]
  const reduced = useReducedMotion()
  const seed = useMemo(()=> seedFromId(card.id), [card.id])
  const r = useMemo(()=> rng(seed), [seed])

  // Dimensions: enforce 63x88 aspect with 14px corner radius
  const ratio = 88/63
  const w = 200
  const h = Math.round(w * ratio)
  const borderStyle = RARITY_BORDER[card.rarity as Rarity]
  const isFullArt = borderStyle.fullArt || false

  // Seeded angles & phases
  const gradientAngle = useMemo(()=> Math.round(r()*360), [r])
  const foilAngle = useMemo(()=> Math.round(r()*360), [r])
  const glossAngle = useMemo(()=> 20 + Math.round(r()*30), [r])

  const rarePlus = useMemo(()=> ['D3','D4','D5','S1','S2','S3','S4','CROWN'].includes(card.rarity as any), [card.rarity])
  const isCrown = card.rarity === 'CROWN'

  // Refs for hover 3D layers
  const rootRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const artRef = useRef<HTMLDivElement>(null)
  const fullBgRef = useRef<HTMLDivElement>(null)
  const holoRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)

  const prefersFinePointer = typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('(pointer: fine)').matches : false
  const enable3D = (hover3D ?? true) && !reduced && prefersFinePointer

  useEffect(()=>{
    if(!enable3D) return
    const root = rootRef.current
    const inner = innerRef.current
    const artLayer = (isFullArt ? fullBgRef.current : artRef.current) as HTMLDivElement | null
    const fxLayer = holoRef.current
    const glare = glareRef.current
    if(!root || !inner) return

    let rect: DOMRect | null = null
    let rafId = 0
    let over = false
    let leaveTO: number | undefined
    let rx = 0, ry = 0, px = 0, py = 0
    let trx = 0, try_ = 0, tpx = 0, tpy = 0

    const setTransition = (ms: number)=>{
      const t = `transform ${ms}ms ${EASE}`
      root.style.transition = t
      inner.style.transition = t
      if(artLayer) artLayer.style.transition = t
      if(fxLayer) fxLayer.style.transition = t
      if(glare) glare.style.transition = `opacity ${ms}ms ${EASE}`
    }
    const clearTransition = ()=>{
      root.style.transition = 'transform 0s'
      inner.style.transition = 'transform 0s'
      if(artLayer) artLayer.style.transition = 'transform 0s'
      if(fxLayer) fxLayer.style.transition = 'transform 0s'
    }
    const apply = ()=>{
      root.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${over? HOVER_SCALE : 1})`
      if(artLayer) artLayer.style.transform = `translate3d(${px}px, ${py}px, 0)`
      if(fxLayer) fxLayer.style.transform = `translate3d(${px*0.6}px, ${py*0.6}px, 0)`
      const mag = Math.min(1, Math.hypot(rx, ry) / MAX_TILT)
      const y = 10 + mag*4
      const blur = 28 + mag*12
      root.style.boxShadow = `0 ${Math.round(y)}px ${Math.round(blur)}px rgba(0,0,0,.35)`
    }
    const animate = ()=>{
      rx += (trx - rx) * 0.18
      ry += (try_ - ry) * 0.18
      px += (tpx - px) * 0.20
      py += (tpy - py) * 0.20
      apply()
      rafId = requestAnimationFrame(animate)
    }
    const updateTargets = (clientX:number, clientY:number)=>{
      if(!rect) rect = root.getBoundingClientRect()
      const dx = (clientX - (rect.left + rect.width/2)) / rect.width
      const dy = (clientY - (rect.top + rect.height/2)) / rect.height
      const clamp = (v:number, m:number)=> Math.max(-m, Math.min(m, v))
      trx = clamp(-dy * MAX_TILT, MAX_TILT)
      try_ = clamp(dx * MAX_TILT, MAX_TILT)
      tpx = clamp(dx * MAX_PARALLAX, MAX_PARALLAX)
      tpy = clamp(dy * MAX_PARALLAX, MAX_PARALLAX)
      if(glare && rect){
        const nx = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
        const ny = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
        glare.style.setProperty('--gx', `${(nx*100).toFixed(2)}%`)
        glare.style.setProperty('--gy', `${(ny*100).toFixed(2)}%`)
        glare.style.setProperty('--gopacity', '0.12')
        glare.style.opacity = '1'
      }
    }
    const onEnter = (e: PointerEvent)=>{
      if(e.pointerType !== 'mouse') return
      rect = root.getBoundingClientRect()
      if(rect.width < 120) return
      if(ACTIVE_HOVER.el && ACTIVE_HOVER.el !== root){ ACTIVE_HOVER.cleanup?.() }
      over = true
      setTransition(160)
      updateTargets(e.clientX, e.clientY)
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(animate)
      ACTIVE_HOVER = { el: root, cleanup, raf: rafId }
    }
    const onMove = (e: PointerEvent)=>{
      if(e.pointerType !== 'mouse') return
      if(!over) onEnter(e)
      clearTransition()
      updateTargets(e.clientX, e.clientY)
    }
    function cleanup(){
      cancelAnimationFrame(rafId)
      over = false
      setTransition(160)
      rx = 0; ry = 0; px = 0; py = 0; trx = 0; try_ = 0; tpx = 0; tpy = 0
      apply()
      if(glare){ glare.style.setProperty('--gopacity','0'); glare.style.opacity = '0' }
      window.clearTimeout(leaveTO)
      leaveTO = window.setTimeout(()=>{ if(ACTIVE_HOVER.el === root){ ACTIVE_HOVER = { el: null, cleanup: null, raf: null } } }, EXIT_DEBOUNCE_MS)
    }
    const onLeave = ()=>{ cleanup() }

    root.addEventListener('pointerenter', onEnter)
    root.addEventListener('pointermove', onMove)
    root.addEventListener('pointerleave', onLeave)
    root.style.willChange = 'transform, box-shadow'
    inner.style.willChange = 'transform'
    if(artLayer) artLayer.style.willChange = 'transform'
    if(fxLayer) fxLayer.style.willChange = 'transform'

    return ()=>{
      root.removeEventListener('pointerenter', onEnter)
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
      if(ACTIVE_HOVER.el === root){ ACTIVE_HOVER = { el: null, cleanup: null, raf: null } }
      cancelAnimationFrame(rafId)
      root.style.transform = ''
      root.style.boxShadow = ''
      inner.style.transform = ''
      if(artLayer) artLayer.style.transform = ''
      if(fxLayer) fxLayer.style.transform = ''
    }
  }, [enable3D, isFullArt])

  return (
    <div
      ref={rootRef}
      className={`skin-card skin-shadow skin-dark ${isCrown? 'skin-crown':''} ${topActive && rarePlus? 'skin-rare-active':''} ${isFullArt? 'skin-fullart':''} ${borderStyle.holo? `skin-holo-${borderStyle.holo}`:''} ${borderStyle.animated && topActive && !reduced? 'skin-animated':''}`}
      style={{ width: w, height: h, borderRadius: 12, ['--accent' as any]: borderStyle.color, ['--border-color' as any]: borderStyle.color, ['--border-width' as any]: `${borderStyle.width}px`, ['--bg-color' as any]: borderStyle.bgColor }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); onClick() } }}
    >
      <div className="skin-frame-dark" aria-hidden="true"/>
      {borderStyle.holo && topActive && fxOn ? <div className="skin-holo-layer" ref={holoRef} aria-hidden="true"/> : null}
      <div className="skin-glare" ref={glareRef} aria-hidden="true"/>
      <div className="skin-inner" ref={innerRef}>
        <div className="skin-header">
          <div className="skin-title" title={card.name}>{card.name}</div>
          <div className="skin-tags">
            {onSetClick ? (
              <button className="skin-tag" onClick={(e)=>{ e.stopPropagation(); onSetClick(card.set) }}>{String(card.set).toUpperCase()}</button>
            ) : (
              <span className="skin-tag">{String(card.set).toUpperCase()}</span>
            )}
          </div>
        </div>
        {!isFullArt ? (
          <div className="skin-art">
            <div className="skin-art-clip">
              <div className="skin-art-underlay" aria-hidden="true">
                <CardArt seed={seed} rarity={card.rarity as Rarity} theme={theme} />
              </div>
              <div className="skin-art-layer" ref={artRef}>
                <CardArt seed={seed} rarity={card.rarity as Rarity} theme={theme} />
              </div>
            </div>
            {rarePlus ? <div className="skin-art-gloss" aria-hidden="true"/> : null}
          </div>
        ) : null}
        {isFullArt ? (
          <div className="skin-fullart-bg" ref={fullBgRef}>
            <CardArt seed={seed} rarity={card.rarity as Rarity} theme={theme} />
            <div className="skin-fullart-overlay"/>
          </div>
        ) : (
          <div className="skin-info">
            <div className="skin-paper"/>
            <div className="skin-textlines">
              <span className="skin-line"/>
              <span className="skin-line"/>
              <span className="skin-line short"/>
            </div>
          </div>
        )}
        <div className="skin-footer" style={{ zIndex: 10, position: 'relative' }}>
          <span className="skin-pill" title={meta?.label}><span className="skin-dot" style={{ background: borderStyle.color }}/> {meta?.symbol || card.rarity}</span>
          <span className="skin-number">#{card.number}</span>
        </div>
      </div>
    </div>
  )
}
