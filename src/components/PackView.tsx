import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { buildPack, toUiCard } from '@/packs/generate'
import { SETS as REGISTRY } from '@/sets/registry'
import { useInventory } from '@/lib/store'
import { CardView } from './card/CardView'
import { CardRenderer } from './card/CardRenderer'
import { Howl } from 'howler'
import tearSfx from '@/sfx/pack-tear.mp3'
import shuffleSfx from '@/sfx/shuffle.mp3'
import { Link, useNavigate } from 'react-router-dom'
import { rarityMap } from '@/lib/rarity'
import type { Rarity } from '@/lib/types'
import { tokens } from '@/lib/tokens'
import { expansions } from '@/lib/expansions'
import { usePackManager } from '@/lib/packManager'
import { useReducedMotion } from '@/lib/settings'

export function PackView(){
  const [cards, setCards] = useState<any[]>([])
  const [opened, setOpened] = useState(false)
  const [ready, setReady] = useState(true)
  const [packId, setPackId] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState<number | null>(null)
  const [dragStartY, setDragStartY] = useState<number | null>(null)
  const [dragStartT, setDragStartT] = useState<number | null>(null)
  const [dragDx, setDragDx] = useState(0)
  const [snapping, setSnapping] = useState(false)
  const [ctaTap, setCtaTap] = useState(false)
  const [tearTarget, setTearTarget] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [gainedExp, setGainedExp] = useState(0)
  const pm = usePackManager()
  const inv = useInventory()
  const currentSetId = inv.currentSetId // 'BASE' | 'APEX' | 'NEO'
  const def = REGISTRY[currentSetId]
  const expansionKey = currentSetId==='BASE' ? 'base' : currentSetId==='APEX' ? 'apex' : 'neo'
  const packRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({rx:0, ry:0})
  const [sheenOnce, setSheenOnce] = useState(false)
  const devLog = useMemo(()=> (typeof window !== 'undefined') && (((window as any).__DEV_LOG__) || localStorage.getItem('dev_log')==='1'), [])
  const [shake, setShake] = useState(false)
  const [dust, setDust] = useState<Array<{id:number, dx:number, dy:number, hue:number}>>([])
  const prefersReduced = useReducedMotion()
  const [dragWidth, setDragWidth] = useState(280)
  const [vNow, setVNow] = useState(0)
  const [dyNow, setDyNow] = useState(0)
  const [vyNow, setVyNow] = useState(0)
  const [debug, setDebug] = useState(false)

  const tear = useMemo(()=> new Howl({ src: [tearSfx], volume: 0.7 }), [])
  const shuffle = useMemo(()=> new Howl({ src: [shuffleSfx], volume: 0.4 }), [])
  const nav = useNavigate()

  useEffect(()=>{
    gsap.to('.pack', { y: -6, repeat: -1, yoyo: true, duration: 1.6, ease: 'sine.inOut' })
    // opacity policy: do not animate opacity idly
  },[])

  useEffect(()=>{
    const onKey = (e: KeyboardEvent)=>{
      if(e.key === '?') setDebug((d)=>!d)
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  },[])

  // Reset opener on mount/when set changes so multiple sequential opens work without reload
  useEffect(()=>{
    pm.reset()
    setOpened(false)
    setPackId(null)
    setDragging(false)
    setDragDx(0)
    setSnapping(false)
    setShowSummary(false)
    setGainedExp(0)
    setCards([])
  }, [currentSetId])

  const onOpen = () => {
    if(opened) return
    if(!ready) return
    if(!(pm.state==='idle' || pm.state==='tearing' || pm.state==='burst')) return
    const pack = buildPack(currentSetId)
    setPackId(pack.id)
    const normalized = pack.cards.map(toUiCard)
    setCards(normalized as any[])
    // add to inventory immediately upon open
    try{ inv.addCards(normalized as any) }catch{}
    setOpened(true)
    pm.setState('reveal')
    setTimeout(()=> shuffle.play(), 250)
    try{ if(devLog) console.log('drawnIds:', normalized.map(c=>c.id)) }catch{}
  }

  const skipAll = () => {
    if(!ready) return
    const pack = buildPack(currentSetId)
    setPackId(pack.id)
    const normalized = pack.cards.map(toUiCard)
    setCards(normalized as any[])
    // add to inventory immediately when skipping directly to summary
    try{ inv.addCards(normalized as any) }catch{}
    setOpened(true)
    pm.setState('summary')
    const gained = inv.awardPackExp(normalized as any)
    setGainedExp(gained)
    if(pack.id){ nav(`/summary/${pack.id}`, { state: { packId: pack.id, setName: `${def?.name || currentSetId} (${currentSetId})`, cards: normalized, gainedExp: gained } }) }
  }

  const onFinish = () => {
    // handled on Summary page CTA
    setOpened(false)
    setCards([])
  }

  return (
    <div className="px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-3">
            <div className="text-sm opacity-70">Current Set</div>
            <div className="text-lg font-semibold">{def?.name || currentSetId} <span className="text-xs opacity-60">({currentSetId})</span></div>
          </div>
          <Link to="/catalog" className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-sm">Change</Link>
        </div>

        {/* ready by default; no pre-CTA button */}

        {ready && !opened && (
          <div className="relative h-[420px] grid place-items-center select-none">
            <div className="absolute inset-0 pack-glow bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.14),transparent_60%)] blur-2xl opacity-60"/>
            <div
              ref={packRef}
              className={`pack pack-wrapper pack-tilt ${shake? 'pack-shake':''} relative w-[280px] h-[400px] rounded-2xl overflow-hidden gradient-border card-3d foil-sheen foil-prism cursor-grab active:cursor-grabbing touch-none`}
              tabIndex={0}
              onKeyDown={(e)=>{ if(e.key==='Escape'){ e.preventDefault(); skipAll() } }}
              onPointerDown={(e)=>{
                const el = packRef.current
                if(!el) return
                if(!pm.canOpen) return
                try{ (e.currentTarget as any).setPointerCapture(e.pointerId) }catch{}
                const r = el.getBoundingClientRect()
                setDragWidth(r.width)
                setTearTarget(Math.max(120, (r.width - 4)))
                setDragging(true); setDragStartX(e.clientX); setDragStartY(e.clientY); setDragStartT(performance.now()); setDragDx(0)
                if(!prefersReduced){ setSheenOnce(true); setTimeout(()=> setSheenOnce(false), 900) }
                if(!prefersReduced) shuffle.play()
                // boost foil intensity on grab
                try{ el.style.setProperty('--foil-intensity', '0.6') }catch{}
                pm.setState('tearing')
              }}
              onPointerMove={(e)=>{
                const el = packRef.current
                if(el && !dragging && !prefersReduced){
                  const r = el.getBoundingClientRect()
                  const cx = r.left + r.width/2
                  const cy = r.top + r.height/2
                  const dx = (e.clientX - cx)/r.width
                  const dy = (e.clientY - cy)/r.height
                  const max = 6
                  setTilt({ rx: Math.max(-max, Math.min(max, -dy*max)), ry: Math.max(-max, Math.min(max, dx*max)) })
                  // hover foil prism follows cursor
                  const px = Math.max(0, Math.min(100, ((e.clientX - r.left)/r.width)*100))
                  const py = Math.max(0, Math.min(100, ((e.clientY - r.top)/r.height)*100))
                  const angle = Math.atan2(dy, dx) * 180 / Math.PI + 90
                  try{
                    el.style.setProperty('--foil-x', `${px}%`)
                    el.style.setProperty('--foil-y', `${py}%`)
                    el.style.setProperty('--foil-angle', `${angle}deg`)
                    el.style.setProperty('--foil-intensity', '0.42')
                  }catch{}
                }
                if(!dragging || dragStartX===null || dragStartY===null) return
                const dx = e.clientX - dragStartX
                const dy = e.clientY - dragStartY
                const el2 = packRef.current
                const strayLimit = el2 ? Math.max(60, el2.getBoundingClientRect().height * 0.25) : 80
                if(Math.abs(dy) > strayLimit){ // cancel if vertical stray too large
                  setDragging(false); setDragStartX(null); setDragStartY(null); setDragStartT(null); setDragDx(0); pm.setState('idle'); return
                }
                setDragDx(Math.max(0, dx))
                const now = performance.now()
                if(dragStartT){ const dt = Math.max(1, now - dragStartT); setVNow((dx)/dt); setVyNow((dy)/dt); setDyNow(dy) }
                // drive foil with drag progress
                if(el2){
                  const r = el2.getBoundingClientRect()
                  const w = Math.max(200, dragWidth)
                  const p = Math.max(0, Math.min(1, dx / (w*0.85)))
                  const px = Math.max(0, Math.min(100, ((e.clientX - r.left)/r.width)*100))
                  const py = Math.max(0, Math.min(100, ((e.clientY - r.top)/r.height)*100))
                  const angle = 30 + 60*p
                  const intensity = 0.38 + 0.36*p
                  try{
                    el2.style.setProperty('--foil-x', `${px}%`)
                    el2.style.setProperty('--foil-y', `${py}%`)
                    el2.style.setProperty('--foil-angle', `${angle}deg`)
                    el2.style.setProperty('--foil-intensity', intensity.toFixed(2))
                  }catch{}
                }
              }}
              onPointerUp={() => {
                const now = performance.now()
                const dx = dragDx
                const dt = dragStartT? (now - dragStartT) : 1
                const v = dx / Math.max(1, dt) // px/ms
                const target = Math.max(tearTarget || 0, Math.max(200, dragWidth) - 4)
                const flickCommit = v >= 0.80 && dx >= target*0.25
                const fullCommit = dx >= target*0.98
                const commit = fullCommit || flickCommit
                setDragging(false); setDragStartX(null); setDragStartY(null); setDragStartT(null)
                // restore foil intensity
                try{ const el = packRef.current; if(el) el.style.setProperty('--foil-intensity', '0.40') }catch{}
                if(commit){
                  if(prefersReduced){ onOpen(); return }
                  setSnapping(true)
                  const start = performance.now()
                  const from = dx
                  const to = target
                  const step = (t:number)=>{
                    const p = Math.min(1, (t-start)/120)
                    setDragDx(from + (to-from)*p)
                    if(p<1){ requestAnimationFrame(step) } else {
                      // VFX/SFX
                      setShake(true); setTimeout(()=> setShake(false), 240)
                      const hue = expansionKey==='apex'? 265 : expansionKey==='neo'? 190 : 220
                      const n = Math.floor(8 + Math.random()*8)
                      const arr = Array.from({length:n}).map((_,i)=>({ id:i, dx: (40+Math.random()*120)*(Math.random()>0.5?1:1), dy: (-20+Math.random()*60), hue }))
                      setDust(arr)
                      setTimeout(()=> setDust([]), 650)
                      pm.setState('burst')
                      tear.play()
                      onOpen()
                      setSnapping(false); setDragDx(0)
                    }
                  }
                  requestAnimationFrame(step)
                } else {
                  // Quick tap fallback: allow simple click to open pack
                  const quickTap = Math.abs(dx) < 12 && dt < 250
                  if(quickTap){
                    pm.setState('burst')
                    try{ tear.play() }catch{}
                    onOpen()
                  } else {
                    setDragDx(0)
                    pm.setState('idle')
                  }
                }
              }}
              onPointerCancel={(e)=>{ try{ (e.currentTarget as any).releasePointerCapture(e.pointerId) }catch{}; setDragging(false); setDragStartX(null); setDragDx(0); pm.setState('idle') }}
              style={{ transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`, ['--frame-a' as any]: tokens.colors.accent[expansionKey], ['--frame-b' as any]: '#777' }}
            >
              <div className="inner absolute inset-[2px] rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-900"/>
              {/* tear progress & strip */}
              <div className="absolute left-[2px] top-[74px] h-10 rounded-l bg-neutral-800/70 border border-neutral-700/60 z-20 tear-strip" style={{ width: `${Math.min(tearTarget || (Math.max(200, dragWidth)-4), dragDx)}px` }}>
                <div className="tear-foil" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                <div className="text-sm opacity-70">{currentSetId}</div>
                <div className="mt-1 text-xl font-bold tracking-wide">{expansions[expansionKey as keyof typeof expansions]?.title || def?.name}</div>
                <div className="mt-1 text-xs opacity-80">{expansions[expansionKey as keyof typeof expansions]?.subtitle}</div>
                <div className="mt-1 text-[11px] opacity-70">{expansions[expansionKey as keyof typeof expansions]?.tag}</div>
              </div>
              <div className={`sheen ${sheenOnce? 'sheen-once':''}`}/>
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm opacity-80 z-10">Tap or drag to open</span>
              <div className="absolute bottom-3 right-3 z-10">
                <button className="capsule-btn" onClick={()=> skipAll()}>Skip</button>
              </div>
              {debug && (
                <div className="absolute top-2 left-2 text-[11px] bg-black/60 text-white px-2 py-1 rounded z-20">
                  <div>state: {pm.state}</div>
                  <div>dx: {dragDx.toFixed(1)}</div>
                  <div>dx,dy: {dragDx.toFixed(1)}, {dyNow.toFixed(1)}</div>
                  <div>vx,vy: {vNow.toFixed(3)}, {vyNow.toFixed(3)} px/ms</div>
                  <div>progress: {Math.min(1, dragDx/Math.max(1, dragWidth*0.85)).toFixed(2)}</div>
                </div>
              )}
              {/* dust particles */}
              {dust.map(p=> (
                <div key={p.id} className="dust" style={{ top: 70, left: 20, background: `hsl(${p.hue} 90% 60% / 0.35)`, animation: 'dust-burst 600ms ease-out forwards', ['--dx' as any]: `${p.dx}px`, ['--dy' as any]: `${p.dy}px` }} />
              ))}
            </div>
            {/* no auto CTA; optional skip remains available via Escape or explicit UI elsewhere */}
          </div>
        )}

        {ready && opened && (
          <div className="relative">
            <RevealArea 
              cards={cards} 
              setName={def?.name || currentSetId}
              setKey={currentSetId}
              onFinish={onFinish} 
              onSummary={()=>{ const gained = inv.awardPackExp(cards as any); setGainedExp(gained); if(packId){ nav(`/summary/${packId}`, { state: { packId, setName: `${def?.name || currentSetId} (${currentSetId})`, cards, gainedExp: gained } }) } else { nav('/summary/pack', { state: { setName: `${def?.name || currentSetId} (${currentSetId})`, cards, gainedExp: gained } }) } }} 
            />
          </div>
        )}

        {/* Summary is now a route: /summary */}
      </div>
    </div>
  )
}

type Phase = 'awaiting' | 'discarding' | 'promoting' | 'done'

function RevealArea({ cards, setName, setKey, onFinish, onSummary }: { cards: any[]; setName: string; setKey: string; onFinish: ()=>void; onSummary: ()=>void }){
  const pm = usePackManager()
  const [flipped, setFlipped] = useState<boolean[]>(()=> cards.map(()=>true))
  const [removed, setRemoved] = useState<boolean[]>(()=> cards.map(()=>false))
  const [summaryTriggered, setSummaryTriggered] = useState(false)
  const [discarding, setDiscarding] = useState<number | null>(null)
  const devLog = useMemo(()=> (typeof window !== 'undefined') && (((window as any).__DEV_LOG__) || localStorage.getItem('dev_log')==='1'), [])
  const expectedTopRef = useRef(0)
  const [promoteIndex, setPromoteIndex] = useState<number | null>(null)
  const [phase, setPhase] = useState<Phase>('awaiting')
  const phaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prePromoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showAmbientPulse, setShowAmbientPulse] = useState(false)
  // Stack 3D transform state
  const [sx, setSx] = useState(0)
  const [sy, setSy] = useState(0)
  const [srx, setSrx] = useState(0)
  const [sry, setSry] = useState(0)
  const vxRef = useRef(0)
  const vyRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const draggingRef = useRef(false)
  const startRef = useRef<{x:number;y:number;ts:number}>({x:0,y:0,ts:0})
  const stackRef = useRef<HTMLDivElement | null>(null)

  // motion settings
  const prefersReduced = useReducedMotion()
  const DISCARD_MS = 360 // fast swipe discard to the right
  const PROMOTE_MS = 220 // quick settle for next card
  const DISCARD_MS_REDUCED = 400 // reduced motion variant
  const PROMOTE_MS_REDUCED = 280 // reduced motion variant

  // central timer manager
  const clearPhaseTimer = () => { if(phaseTimer.current){ clearTimeout(phaseTimer.current); phaseTimer.current = null } }
  const enterPhase = (next: Phase, ms?: number, cont?: ()=>void) => {
    clearPhaseTimer()
    setPhase(next)
    if(ms && cont){
      const duration = Number.isFinite(ms) && ms! > 0 ? ms! : (next==='discarding'? DISCARD_MS : next==='promoting'? PROMOTE_MS : 350)
      phaseTimer.current = setTimeout(()=>{
        try{ cont() }catch{ safeAdvance() }
      }, duration)
    }
  }
  useEffect(()=>()=> clearPhaseTimer(), [])

  // focus the stack so Space/Enter works immediately
  useEffect(()=>{ try{ stackRef.current?.focus() }catch{} }, [])
  useEffect(()=>{ if(phase==='awaiting'){ setTimeout(()=>{ try{ stackRef.current?.focus() }catch{} }, 0) } }, [phase])

  // interaction entry points
  const safeAdvance = () => {
    // fallback path to ensure no freeze
    try{
      if(phase==='discarding'){ finishDiscard() }
      else if(phase==='promoting'){ finalizePromote() }
      else if(phase==='awaiting'){ /* nothing */ }
    }catch{}
  }

  useEffect(()=>{
    const remaining = cards.reduce((acc, _c, i)=> acc + (removed[i]?0:1), 0)
    if(remaining===0 && !summaryTriggered){
      setSummaryTriggered(true)
      setPhase('done')
      clearPhaseTimer()
      const fadeMs = 240
      phaseTimer.current = setTimeout(()=>{ try{ onSummary() }catch{} }, fadeMs)
    }
  }, [removed, cards, summaryTriggered])

  const activeIndices = cards.map((_,i)=>i).filter(i=>!removed[i])
  const topIndex = activeIndices.length ? activeIndices[0] : -1

  const rank = (r: string) => {
    switch(r){
      case 'D1': return 1
      case 'D2': return 2
      case 'D3': return 3
      case 'D4': return 4
      case 'D5': return 5
      case 'S1': return 6
      case 'S2': return 7
      case 'S3': return 8
      case 'S4': return 9
      case 'CROWN': return 10
      default: return 0
    }
  }
  const bestIndex = useMemo(()=>{
    let best = 0, bi = 0
    for(let i=0;i<cards.length;i++){ const v = rank(cards[i].rarity); if(v>best){ best=v; bi=i } }
    return bi
  }, [cards])

  // Dev: orientation check (upright=true, rotation=0)
  useEffect(()=>{ try{ if(devLog) console.log('stackOrientation:', { upright: true, rotation: 0 }) }catch{} }, [])

  // Dev: top index change logging
  useEffect(()=>{ if(topIndex>=0){ try{ if(devLog) console.log('top:', cards[topIndex].id) }catch{} } }, [topIndex, cards, devLog])

  useEffect(()=>{ try{ if(devLog) console.log('drawn:', cards.map(c=>c.id)) }catch{}; expectedTopRef.current = 0 }, [])

  const startDiscard = () => {
    if(topIndex<0) { safeAdvance(); return }
    if(discarding!==null) return
    const idx = topIndex
    if(devLog && idx !== expectedTopRef.current){ try{ console.warn('order violation: expected', cards[expectedTopRef.current].id, 'got', cards[idx].id) }catch{} }
    setDiscarding(idx)
    try{ if(devLog) console.log('discard:', cards[idx].id) }catch{}
    
    // Trigger ambient pulse for high-rarity cards
    const cardRarity = rank(cards[idx].rarity)
    if(cardRarity >= 8 && !prefersReduced) {
      setShowAmbientPulse(true)
      setTimeout(()=> setShowAmbientPulse(false), 800)
    }

    // Pre-start next card promote during the swipe to reduce perceived latency
    if(!prefersReduced){
      const nextIdx = cards.map((_,i)=> i).filter(i=> !removed[i] && i!==idx)[0]
      if(Number.isInteger(nextIdx)){
        if(prePromoteTimer.current){ clearTimeout(prePromoteTimer.current); prePromoteTimer.current = null }
        prePromoteTimer.current = setTimeout(()=>{ setPromoteIndex(nextIdx as number) }, 120)
      }
    }
    
    // Sound effect hook: Play a subtle whoosh/swipe sound here
    // Example: cardDiscardSound?.play()
    // Rarity-based chime could also trigger here based on cardRarity
    
    const ms = prefersReduced ? DISCARD_MS_REDUCED : DISCARD_MS
    enterPhase('discarding', ms, finishDiscard)
  }

  const finishDiscard = () => {
    const idx = discarding
    setDiscarding(null)
    if(idx===null) { finalizePromote(); return }
    const r = [...removed]; r[idx] = true; setRemoved(r)
    expectedTopRef.current = expectedTopRef.current + 1
    const nextIdx = cards.findIndex((_,i)=> !r[i])
    // assert top index change
    const activeNow = cards.map((_,i)=>i).filter(i=>!r[i])
    const newTop = activeNow.length ? activeNow[0] : -1
    if(newTop === idx){ try{ console.warn('topIndex did not advance; forcing next') }catch{} }
    if(nextIdx>=0){
      setPromoteIndex(nextIdx)
      const ms = prefersReduced ? PROMOTE_MS_REDUCED : PROMOTE_MS
      enterPhase('promoting', ms, finalizePromote)
    } else {
      enterPhase('done')
    }
  }

  const finalizePromote = () => {
    if(prePromoteTimer.current){ clearTimeout(prePromoteTimer.current); prePromoteTimer.current = null }
    setPromoteIndex(null)
    const remaining = cards.reduce((acc, _c, i)=> acc + (removed[i]?0:1), 0)
    if(remaining>0){ setPhase('awaiting') } else { setPhase('done') }
  }

  // Fan stage timing: enter fan then switch to reveal
  // fan stage removed; enter reveal directly
  useEffect(()=>{}, [pm.state])

  // Physics animation (micro camera settle)
  useEffect(()=>{
    const step = ()=>{
      rafRef.current = requestAnimationFrame(step)
      if(draggingRef.current) return
      // spring back to center
      const k = 0.015, d = 0.92
      vxRef.current += (-k * sx)
      vyRef.current += (-k * sy)
      vxRef.current *= d
      vyRef.current *= d
      const nx = sx + vxRef.current
      const ny = sy + vyRef.current
      if(Math.abs(nx - sx) < 0.05 && Math.abs(ny - sy) < 0.05 && Math.abs(vxRef.current) < 0.01 && Math.abs(vyRef.current) < 0.01){ return }
      setSx(nx); setSy(ny)
      // idle settle mapping aligned with on-drag
      setSrx(Math.max(-12, Math.min(12, -ny/45)))
      setSry(Math.max(-18, Math.min(18, nx/30)))
    }
    rafRef.current = requestAnimationFrame(step)
    return ()=>{ if(rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [sx, sy])

  const topCard = topIndex >= 0 ? cards[topIndex] : null
  const topRarityRank = topCard ? rank(topCard.rarity) : 0
  const total = cards.length
  const revealed = removed.reduce((a, x)=> a + (x?1:0), 0)
  const revealedUi = revealed + (discarding!==null ? 1 : 0)
  const remaining = Math.max(0, total - revealedUi)
  const ctaDotIndex = Math.min(4, Math.floor((revealedUi / Math.max(1, total)) * 5))

  return (
    <section id="open-stage">
      <div className="stage-panel intro-scale">
        {/* Stage Header (split) */}
        <div className="stage-header header-split">
          <div className="h-left">
            <div className="label">Current Set</div>
            <div className="name">{setName} <span className="muted">({setKey})</span></div>
          </div>
          <div className="h-right">
            <div className="remaining">{remaining} {remaining===1 ? 'card' : 'cards'} remaining</div>
            <div className="progress-dots" aria-hidden="true">
              {Array.from({length: total}).map((_,i)=> (
                <span key={i} className={`dot ${i < revealed ? 'on' : ''}`}/>
              ))}
            </div>
          </div>
        </div>
        {/* Stage Canvas - All visuals and effects contained here */}
        <div className="stage-canvas" data-phase={phase} data-motion={prefersReduced ? 'reduce' : 'full'}>
          <div className="stage-ambient" aria-hidden="true"/>
          
          {/* Ambient light pulse for high-rarity reveals */}
          {showAmbientPulse && !prefersReduced && topCard && (
            <div 
              className="stage-ambient-pulse" 
              aria-hidden="true"
              style={{
                ['--ambient-color' as any]: 
                  topRarityRank === 10 ? 'rgba(255, 215, 0, 0.15)' :
                  topRarityRank >= 8 ? 'rgba(255, 100, 255, 0.12)' :
                  'rgba(100, 200, 255, 0.10)'
              }}
            />
          )}
          {/* Rarity-specific background glow - contained within canvas */}
          {topCard && topRarityRank >= 6 && (
            <div className="stage-glow" data-rarity={topRarityRank}>
              <div 
                className="glow-radial"
                style={{
                  background: topRarityRank === 10 ? 'radial-gradient(circle at center, rgba(255,215,0,0.4), transparent 65%)' :
                             topRarityRank >= 8 ? 'radial-gradient(circle at center, rgba(255,100,255,0.35), transparent 65%)' :
                             'radial-gradient(circle at center, rgba(100,200,255,0.3), transparent 65%)'
                }}
              />
            </div>
          )}

          {/* 3D Card Stack */}
          <div className="stack-anchor">
          <div
            className="card-stack-3d"
            tabIndex={0}
            ref={stackRef}
            onKeyDown={(e)=>{ if(e.key===' '|| e.key==='Enter'){ e.preventDefault(); if(topIndex>=0 && phase==='awaiting') startDiscard() } }}
            onClick={()=>{ if(topIndex>=0 && phase==='awaiting') startDiscard() }}
          >
            <div className="card-stack-inner stack-rise">
              {/* Entry light sweep effect */}
              {!prefersReduced && <div className="stack-entry-sweep" aria-hidden="true" />}
              {activeIndices.map((i, stackPos)=> {
                const isTop = i === topIndex
                const depthIdx = (activeIndices.length - 1) - stackPos
                // Larger offsets for visible stack
                const tZ = depthIdx * 20  // More depth
                const tY = stackPos * -12  // More vertical offset
                const tX = stackPos * 3   // Slight horizontal offset for depth
                const cardRarity = rank(cards[i].rarity)
                const isRare = cardRarity >= 6
                const isDiscarding = discarding === i
                
                // Determine VFX tier based on rarity
                const showBurst = isDiscarding && cardRarity >= 6 // S1+ gets energy burst
                const showFoilShimmer = isDiscarding && (cardRarity === 4 || cardRarity === 5) // D4-D5 gets foil
                const showIridescent = isDiscarding && (cardRarity === 9 || cardRarity === 10) // S4/CROWN gets flare
                
                return (
                  <div
                    key={i}
                    className={`card-stack-item
                      ${isDiscarding ? 'card-discarding' : ''} 
                      ${promoteIndex===i ? 'card-promoting' : ''}
                      ${flipped[i] && isTop ? 'card-revealed' : ''}
                      ${isTop ? 'top-active' : ''}
                    `}
                    style={{ 
                      transform: `translateZ(${tZ}px) translateY(${tY}px) translateX(${tX}px)`, 
                      zIndex: 1000 - stackPos, 
                      pointerEvents: isTop && !isDiscarding && phase==='awaiting' ? 'auto' : 'none',
                      filter: (!isTop ? 'blur(1.2px) brightness(0.88)' : 'none') + (isTop && isRare && flipped[i] ? ' drop-shadow(0 0 24px rgba(255,200,100,0.7))' : ''),
                      opacity: isDiscarding ? 1 : (isTop ? 1 : 0.7),  // Dim cards behind
                      willChange: isTop ? ('transform, opacity, filter' as any) : undefined
                    }}
                    onClick={()=>{
                      if(!isTop) return
                      if(phase!=='awaiting') return
                      startDiscard()
                    }}
                  >
                    {/* VFX: Energy burst for rare+ cards */}
                    {showBurst && !prefersReduced && (
                      <div className="vfx-burst" data-rank={cardRarity} aria-hidden="true" />
                    )}
                    
                    {/* VFX: Foil shimmer for D4/D5 */}
                    {showFoilShimmer && !prefersReduced && (
                      <div className="vfx-foil-shimmer" aria-hidden="true" />
                    )}
                    
                    {/* VFX: Iridescent flare for S4/CROWN */}
                    {showIridescent && !prefersReduced && (
                      <div className="vfx-iridescent-flare" aria-hidden="true" />
                    )}
                    {/* Rarity particles - clipped within canvas */}
                    {isTop && isRare && !isDiscarding && !prefersReduced && (
                      <div className="particle-container" aria-hidden="true">
                        {Array.from({length: cardRarity >= 8 ? 12 : 8}).map((_,pi)=>(
                          <div 
                            key={pi}
                            className="particle"
                            style={{
                              background: cardRarity === 10 ? '#ffd700' : cardRarity >= 8 ? '#ff66ff' : '#66ccff',
                              animation: `particle-burst 1.2s ease-out forwards`,
                              animationDelay: `${pi * 0.05}s`,
                              ['--angle' as any]: `${(pi / (cardRarity >= 8 ? 12 : 8)) * 360}deg`,
                              ['--distance' as any]: `${100 + deterministicDistance(cards[i]?.id || '0', pi) * 50}px`
                            }}
                          />
                        ))}
                      </div>
                    )}
                    
                    <div className="card-scale">
                      <CardRenderer
                        card={cards[i]}
                        fxOn={true}
                        onClick={()=>{
                          if(!isTop) return
                          if(phase!=='awaiting') return
                          startDiscard()
                        }}
                        topActive={isTop}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        </div>

        {/* Stage CTA */}
        <div className="stage-cta">
          <div className="cta-instruction">
            {remaining>0 ? (
              phase==='awaiting' ? 'Tap to discard · Space/Enter' : (phase==='discarding' ? 'Discarding…' : 'Continuing…')
            ) : 'Pack complete'}
          </div>
          <div className="cta-dots" aria-hidden="true">
            {Array.from({length: 5}).map((_,i)=> (
              <span key={i} className={`tiny-dot ${ctaDotIndex===i ? 'active' : ''}`}/>
            ))}
          </div>
        </div>

        {/* Action bar */}
        <div className="stage-actions">
          {remaining>0 ? (
            <>
              <button className="capsule-btn" onClick={()=> onSummary?.()}>Skip</button>
              <Link to="/catalog" className="capsule-btn" aria-label="Change set">Change set</Link>
            </>
          ) : (
            <Link to="/catalog" className="capsule-btn">Open another</Link>
          )}
        </div>
      </div>
    </section>
  )
}

// Deterministic pseudo-random in [0,1) from id + index (no re-render variance)
function deterministicDistance(id: string, idx: number){
  let h = 2166136261 >>> 0
  for(let i=0;i<id.length;i++){ h ^= id.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0 }
  h ^= (idx + 31) * 2654435761 >>> 0
  // Xorshift32
  h ^= h << 13; h ^= h >>> 17; h ^= h << 5
  return ((h >>> 0) % 1000) / 1000
}

function SummaryOverlay({ setName, cards, gainedExp, onClose, onFinish }: { setName: string; cards: any[]; gainedExp: number; onClose: ()=>void; onFinish: ()=>void }){
  const inv = useInventory()
  const lvl = inv.getLevel()
  const next = inv.getNextLevelExp()
  const exp = inv.exp
  const prev = 200 * (Math.max(1, lvl-1)) * (Math.max(1, lvl-1))
  const denom = Math.max(1, next - prev)
  const progress = Math.min(1, Math.max(0, (exp - prev)/denom))

  const byRarity: Record<string, number> = {}
  for(const c of cards){
    byRarity[c.rarity] = (byRarity[c.rarity]||0) + 1
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70 backdrop-blur" onClick={onClose}/>
      <div className="relative max-w-2xl mx-auto mt-24 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
        <div className="text-sm opacity-70">Pack Summary</div>
        <div className="mt-1 text-xl font-bold">{setName}</div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {Object.entries(byRarity).sort().map(([r,count])=> {
            const meta = rarityMap()[r as Rarity]
            return (
            <div key={r} className="flex items-center justify-between text-sm">
              <span>{meta?.symbol || r}</span>
              <span className="opacity-80">{count}</span>
            </div>
          )})}
        </div>

        <div className="mt-5">
          <div className="text-sm">EXP +{gainedExp}</div>
          <div className="mt-1 text-xs opacity-70">Level {lvl} · {Math.floor(progress*100)}% to Level {lvl+1}</div>
          <div className="h-2 rounded bg-neutral-800 overflow-hidden mt-1">
            <div className="h-full bg-cyan-500" style={{ width: `${progress*100}%` }} />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700" onClick={onClose}>Close</button>
          <button className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500" onClick={onFinish}>Add to Inventory</button>
        </div>
      </div>
    </div>
  )
}
