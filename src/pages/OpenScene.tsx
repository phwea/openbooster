import { useEffect, useMemo, useRef, useState } from 'react'
import { buildPack, toUiCard } from '@/packs/generate'
import { SETS as REGISTRY } from '@/sets/registry'
import { useInventory } from '@/lib/store'
import { CardRenderer } from '@/components/card/CardRenderer'
import { PackRip } from '@/components/PackRip'
import { Link, useNavigate } from 'react-router-dom'
import { useReducedMotion } from '@/lib/settings'
import { useRenderer } from '@/lib/renderer'
import type { Rarity } from '@/lib/types'

// State machine states: ready -> discarding -> promoting -> ready ... -> done
type Phase = 'ready' | 'discarding' | 'promoting' | 'done'

export default function OpenScene(){
  const inv = useInventory()
  const nav = useNavigate()
  const current = inv.currentSetId
  const def = REGISTRY[current]
  const { effective, ready } = useRenderer()

  const [cards, setCards] = useState<any[]>([])
  const [packId, setPackId] = useState<string | null>(null)
  const [removedCount, setRemovedCount] = useState(0)

  useEffect(()=>{
    // Build pack immediately and present face-up stack
    const pack = buildPack(current)
    setPackId(pack.id)
    const normalized = pack.cards.map(toUiCard)
    setCards(normalized as any[])
    try{ inv.addCards(normalized as any) }catch{}
  }, [current])

  const onSkip = () => {
    try{ /* clear any timers in child via event or rely on unmount */ }catch{}
    const gained = inv.awardPackExp(cards as any)
    if(packId){ nav(`/summary/${packId}`, { state: { packId, setName: `${def?.name || current} (${current})`, cards, gainedExp: gained } }) }
    else { nav('/summary/pack', { state: { setName: `${def?.name || current} (${current})`, cards, gainedExp: gained } }) }
  }

  return (
    <section id="booster-stage">
      <div className="stage-panel intro-scale">
        <div className="stage-header header-split">
          <div className="h-left">
            <div className="label">Current Set</div>
            <div className="name">{def?.name || current} <span className="muted">({current})</span></div>
          </div>
          <HeaderProgress total={cards.length} removed={removedCount} />
        </div>
        <RevealStage 
          cards={cards}
          setName={def?.name || current}
          setKey={current}
          onSkip={onSkip}
          onProgress={(removed, total)=> setRemovedCount(removed)}
          onComplete={onSkip}
        />
      </div>
      {(()=>{ try{ return localStorage.getItem('debug_renderer')==='1' }catch{ return false } })() && (
        <div className="debug-hud">
          <div>mode: {effective}</div>
          <div>ready: {ready?'true':'false'}</div>
          <div>removed: {removedCount}</div>
        </div>
      )}
    </section>
  )
}

function HeaderProgress({ total, removed }: { total: number; removed: number }){
  const remaining = Math.max(0, total - removed)
  return (
    <div className="h-right">
      <div className="remaining">{remaining} {remaining===1 ? 'card' : 'cards'} remaining</div>
      <div className="progress-dots" aria-hidden="true">
        {Array.from({length: total}).map((_,i)=> (
          <span key={i} className={`dot ${i < removed ? 'on' : ''}`}/>
        ))}
      </div>
    </div>
  )
}

function RevealStage({ cards, setName, setKey, onSkip, onProgress, onComplete }: { cards: any[]; setName: string; setKey: string; onSkip: ()=>void; onProgress?: (removed:number, total:number)=>void; onComplete?: ()=>void }){
  const [removed, setRemoved] = useState<boolean[]>(()=> cards.map(()=> false))
  const [ripDone, setRipDone] = useState(false)
  const [phase, setPhase] = useState<Phase>('ready')
  const [discarding, setDiscarding] = useState<number | null>(null)
  const [promoteIndex, setPromoteIndex] = useState<number | null>(null)
  const phaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reduced = useReducedMotion()
  const lockRef = useRef(false)
  const discardingRef = useRef<number | null>(null)
  const removedRef = useRef<boolean[]>([])
  const [stackScale, setStackScale] = useState(1)

  const DISCARD_MS = reduced ? 280 : 600
  const PROMOTE_MS = reduced ? 260 : 400

  // Focus stack for Space/Enter
  const stackRef = useRef<HTMLDivElement | null>(null)
  useEffect(()=>{ try{ stackRef.current?.focus() }catch{} }, [])
  useEffect(()=>{ if(phase==='ready'){ setTimeout(()=>{ try{ stackRef.current?.focus() }catch{} }, 0) } }, [phase])
  useEffect(()=>{ if(ripDone){ try{ stackRef.current?.focus() }catch{} } }, [ripDone])
  useEffect(()=>{ removedRef.current = removed }, [removed])

  // Responsive scale: aim for ~30% of container width (16:9 desktop), keep 63:88 aspect
  useEffect(()=>{
    const el = stackRef.current?.parentElement as HTMLElement | null
    if(!el) return
    const baseW = 200
    const ro = new ResizeObserver(([entry])=>{
      const w = entry.contentRect.width
      const target = Math.max(160, Math.min(360, w * 0.30))
      setStackScale(target / baseW)
    })
    ro.observe(el)
    return ()=> ro.disconnect()
  }, [])

  // When a new pack loads, align removal flags to card count
  useEffect(()=>{
    if(!cards || cards.length===0) return
    if(removed.length !== cards.length){
      setRemoved(cards.map(()=> false))
      setPhase('ready')
      setRipDone(false)
    }
  }, [cards, removed.length])

  // Cleanup timers on unmount
  useEffect(()=>()=>{ if(phaseTimer.current){ clearTimeout(phaseTimer.current) } }, [])

  const clearTimer = ()=>{ if(phaseTimer.current){ clearTimeout(phaseTimer.current); phaseTimer.current = null } }
  const setPhaseWithTimer = (next: Phase, ms?: number, cont?: ()=>void)=>{
    clearTimer()
    setPhase(next)
    if(ms && cont){
      const duration = Number.isFinite(ms) && ms! > 0 ? ms! : (next==='discarding'? DISCARD_MS : next==='promoting'? PROMOTE_MS : 350)
      phaseTimer.current = setTimeout(()=>{ try{ cont() }catch{ safeAdvance() } }, duration)
    }
  }

  const activeIndices = cards.map((_,i)=>i).filter(i=>!removed[i])
  const topIndex = activeIndices.length ? activeIndices[0] : -1
  const total = cards.length
  const revealed = removed.reduce((a, x)=> a + (x?1:0), 0)
  const remaining = Math.max(0, total - revealed)

  useEffect(()=>{ onProgress?.(revealed, total) }, [revealed, total, onProgress])
  useEffect(()=>{
    if(remaining===0){
      if(phase!=='done') setPhase('done')
      const t = setTimeout(()=>{ try{ onComplete?.() }catch{} }, reduced ? 200 : 240)
      return ()=> clearTimeout(t)
    }
  }, [remaining, phase, reduced, onComplete])

  // force-advance safety
  const safeAdvance = () => {
    try{
      if(phase==='discarding') finishDiscard()
      else if(phase==='promoting') finalizePromote()
    }catch{}
  }

  const onDiscard = () => {
    if(!ripDone) return
    if(topIndex<0) return
    if(phase!=='ready') return
    if(lockRef.current) return
    lockRef.current = true
    // Pre-select the next card so it's visible underneath while the top swipes away
    const nextIdx = cards.findIndex((_,i)=> !removed[i] && i!==topIndex)
    if(nextIdx>=0) setPromoteIndex(nextIdx)
    setDiscarding(topIndex)
    discardingRef.current = topIndex
    setPhaseWithTimer('discarding', DISCARD_MS, ()=> finishDiscard(topIndex))
  }

  const finishDiscard = (idxParam?: number) => {
    const idx = (typeof idxParam==='number' ? idxParam : discardingRef.current)
    setDiscarding(null)
    discardingRef.current = null
    if(idx===null || idx===undefined){ finalizePromote(); return }
    setRemoved(prev=>{
      const r = [...prev]
      r[idx] = true
      const nextIdx = cards.findIndex((_,i)=> !r[i])
      if(nextIdx>=0){
        setPromoteIndex(nextIdx)
        setPhaseWithTimer('promoting', PROMOTE_MS, finalizePromote)
      } else {
        setPhase('done')
        clearTimer()
        setTimeout(()=>{ try{ onComplete?.() }catch{} }, reduced ? 200 : 240)
      }
      return r
    })
  }

  const finalizePromote = () => {
    setPromoteIndex(null)
    const r = removedRef.current
    const still = r.reduce((acc,v)=> acc + (v?0:1), 0)
    if(still>0){
      setPhase('ready'); lockRef.current = false
    } else {
      setPhase('done'); lockRef.current = false; clearTimer();
      setTimeout(()=>{ try{ onComplete?.() }catch{} }, reduced ? 200 : 240)
    }
  }

  // Keyboard controls
  const onKeyDown = (e: React.KeyboardEvent)=>{
    if(e.key===' ' || e.key==='Enter'){ e.preventDefault(); onDiscard() }
  }

  // Stage glow based on top rarity (optional polish)
  const topCard = topIndex >= 0 ? cards[topIndex] : null
  const topRank = topCard ? rank(topCard.rarity) : 0

  return (
    <>
      {/* Header progress mirrors below */}
      <div className="stage-canvas" data-phase={phase}>
        <div className="stage-ambient" aria-hidden="true"/>
        {topCard && topRank >= 6 && (
          <div className="stage-glow" data-rarity={topRank}>
            <div 
              className="glow-radial"
              style={{
                background: topRank === 10 ? 'radial-gradient(circle at center, rgba(255,215,0,0.4), transparent 65%)' :
                           topRank >= 8 ? 'radial-gradient(circle at center, rgba(255,100,255,0.35), transparent 65%)' :
                           'radial-gradient(circle at center, rgba(100,200,255,0.3), transparent 65%)'
              }}
            />
          </div>
        )}

        <div className="stack-anchor">
          {!ripDone && (
            <PackRip theme={setKey as any} onComplete={()=> setRipDone(true)} />
          )}
          <div
            className={`card-stack-3d ${!ripDone ? 'stack-pre': ''}`}
            tabIndex={0}
            ref={stackRef}
            onKeyDown={onKeyDown}
            onClick={onDiscard}
            style={{ ['--stack-delay' as any]: reduced ? '200ms' : '350ms', pointerEvents: ripDone ? 'auto' : 'none', ['--card-scale' as any]: stackScale }}
          >
            <div className={`card-stack-inner stack-rise ${phase==='discarding' ? 'stack-compress' : ''}`}>
              {(() => {
                const renderSet = new Set<number>()
                if(discarding !== null) renderSet.add(discarding)
                if(promoteIndex !== null) renderSet.add(promoteIndex)
                if(discarding === null && topIndex >= 0) renderSet.add(topIndex)
                const render = Array.from(renderSet)
                return render.map((i)=>{
                  const isTop = i === topIndex && discarding === null
                  const isDiscarding = discarding === i
                  const isPromoting = promoteIndex === i
                  const cardRarityRank = rank(cards[i].rarity)
                  const isRare = cardRarityRank >= 6
                  return (
                    <div
                      key={i}
                      className={`card-stack-item ${isDiscarding ? 'card-discarding' : ''} ${(isPromoting && phase==='promoting') ? 'card-promoting' : ''} ${isTop? 'top-active card-revealed' : ''}`}
                      data-rank={cardRarityRank}
                      style={{
                        transform: `translateZ(0px) translateY(0px) translateX(0px)`,
                        zIndex: isDiscarding ? 1002 : isPromoting ? 1001 : 1000,
                        pointerEvents: isTop && !isDiscarding && phase==='ready' ? 'auto' : 'none',
                        filter: (isTop && isRare ? 'drop-shadow(0 0 24px rgba(255,200,100,0.7))' : 'none'),
                        opacity: 1,
                        willChange: (isTop || isPromoting || isDiscarding) ? ('transform, opacity, filter' as any) : undefined,
                      }}
                    >
                      {isDiscarding && <div className="vfx-burst" data-rank={cardRarityRank} aria-hidden="true" />}
                      {isTop && isRare && !isDiscarding && (
                        <div className="particle-container">
                          {Array.from({length: cardRarityRank >= 8 ? 12 : 8}).map((_,pi)=> (
                            <div
                              key={pi}
                              className="particle"
                              style={{
                                background: cardRarityRank === 10 ? '#ffd700' : cardRarityRank >= 8 ? '#ff66ff' : '#66ccff',
                                animation: `particle-burst 1.2s ease-out forwards`,
                                animationDelay: `${pi * 0.05}s`,
                                ['--angle' as any]: `${(pi / (cardRarityRank >= 8 ? 12 : 8)) * 360}deg`,
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
                          onClick={()=>{ if(isTop && phase==='ready') onDiscard() }} 
                          topActive={isTop} 
                        />
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          </div>
        </div>
      </div>

      {ripDone && (
      <div className="stage-cta">
        <div className="cta-instruction">
          {remaining>0 ? (phase==='ready' ? 'Tap to discard · Space/Enter' : (phase==='discarding' ? 'Discarding…' : 'Continuing…')) : 'Pack complete'}
        </div>
        <div className="cta-dots" aria-hidden="true">
          {Array.from({length: total}).map((_,i)=> {
            const isDone = i < revealed
            const isCurrent = i === revealed && (phase==='discarding' || phase==='promoting')
            return <span key={i} className={`tiny-dot ${isDone ? 'active' : ''} ${isCurrent ? 'current' : ''}`} />
          })}
        </div>
      </div>
      )}

      <div className="stage-actions">
        {remaining>0 ? (
          <>
            <button className="capsule-btn" onClick={onSkip}>Skip</button>
            <Link to="/catalog" className="capsule-btn" aria-label="Change set">Change set</Link>
          </>
        ) : (
          <Link to="/catalog" className="capsule-btn">Open another</Link>
        )}
      </div>
    </>
  )
}

// Deterministic numeric rank for rarity label
function rank(r: string){
  switch(r as Rarity){
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

// Deterministic pseudo-random in [0,1) from id + index
function deterministicDistance(id: string, idx: number){
  let h = 2166136261 >>> 0
  for(let i=0;i<id.length;i++){ h ^= id.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0 }
  h ^= (idx + 31) * 2654435761 >>> 0
  h ^= h << 13; h ^= h >>> 17; h ^= h << 5
  return ((h >>> 0) % 1000) / 1000
}
