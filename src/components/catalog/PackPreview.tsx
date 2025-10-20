import { useEffect, useMemo, useRef, useState } from 'react'
import { tokens } from '@/lib/tokens'
import { ProgrammaticCard } from '@/components/card/ProgrammaticCard'
import { rarityRegistry, rarityMap } from '@/lib/rarity'
import { useReducedMotion } from '@/lib/settings'
import { useTransition } from '@/lib/transition'
import { SETS as REGISTRY, type RarityId } from '@/sets/registry'

export function PackPreview({ setId, onClose, onOpen }: { setId: string; onClose: ()=>void; onOpen: ()=>void }){
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({rx:0, ry:0})
  const [hovering, setHovering] = useState(false)
  const [idx, setIdx] = useState(0)
  const accent = useMemo(()=>{
    switch(setId){
      case 'BASE': return tokens.colors.accent.base
      case 'APEX': return tokens.colors.accent.apex
      default: return tokens.colors.accent.neo
    }
  }, [setId])
  const def = REGISTRY[setId]
  const reduced = useReducedMotion()
  const t = useTransition()
  const playing = t.phase === 'playing'

  const odds = useMemo(()=>{
    const w = def?.rarityWeights || {}
    const total = Object.values(w).reduce((a,b)=> a + (b||0), 0)
    const map = rarityMap()
    const order: Array<[RarityId, string]> = [['1D','D1'],['2D','D2'],['3D','D3'],['4D','D4'],['5D','D5'],['1S','S1'],['2S','S2'],['3S','S3'],['4S','S4'],['CR','CROWN']]
    return order.map(([rid, ui])=>{
      const meta = map[ui as keyof typeof map]
      return {
        id: ui,
        symbol: meta?.symbol || ui,
        color: meta?.border || '#888',
        pct: total>0 ? (w[rid]||0)/total : 0,
      }
    })
  }, [def])
  const shinyChance = rarityRegistry.overlay.chance
  const fmtPct = (v: number) => v < 0.01 ? `${(v*100).toFixed(2)}%` : `${(v*100).toFixed(1)}%`

  const onMove = (e: React.MouseEvent) => {
    if(reduced) return
    const el = ref.current
    if(!el) return
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width/2
    const cy = r.top + r.height/2
    const dx = (e.clientX - cx) / r.width
    const dy = (e.clientY - cy) / r.height
    const max = 2 // keep subtle
    setTilt({ rx: Math.max(-max, Math.min(max, -dy*max)), ry: Math.max(-max, Math.min(max, dx*max)) })
  }

  const onLeave = () => setTilt({rx:0, ry:0})

  function mapRarity(rid: RarityId): 'D1'|'D2'|'D3'|'D4'|'D5'|'S1'|'S2'|'S3'|'S4'|'CROWN' {
    switch(rid){
      case '1D': return 'D1'; case '2D': return 'D2'; case '3D': return 'D3'; case '4D': return 'D4'; case '5D': return 'D5'
      case '1S': return 'S1'; case '2S': return 'S2'; case '3S': return 'S3'; case '4S': return 'S4'; case 'CR': return 'CROWN'
    }
  }
  const samples = useMemo(()=>{
    const pool = [...(def?.pool || [])]
    const out: any[] = []
    const n = Math.min(10, pool.length)
    for(let i=0;i<n;i++){
      const j = Math.floor(Math.random()*pool.length)
      const c = pool.splice(j,1)[0]
      if(!c) continue
      const numMatch = c.cid.match(/-(\d+)$/)
      const number = numMatch ? parseInt(numMatch[1],10) : i+1
      out.push({ id: c.cid, set: setId, number, name: c.name, rarity: mapRarity(c.rarity), shiny: false })
    }
    return out
  }, [setId, def])

  // Active card is derived from the center highlight region; no timer-based stepping

  useEffect(()=>{
    const onKey = (e: KeyboardEvent)=>{ if(e.key === 'Escape'){ onClose() } }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  }, [onClose])

  const looped = useMemo(()=> samples.concat(samples), [samples])
  const trackRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const lastTsRef = useRef<number | null>(null)
  const activeRef = useRef<number>(0)

  useEffect(()=>{
    let raf: number | null = null
    const ITEM_W = 134
    const CARD_W = 120
    const step = (ts: number) => {
      if(lastTsRef.current===null) lastTsRef.current = ts
      const dt = ts - (lastTsRef.current||ts)
      lastTsRef.current = ts
      const speed = -0.045
      let next = offset + speed * dt
      const half = (trackRef.current?.scrollWidth||0) / 2
      if(half>0){
        if(next <= -half) next += half
        if(next > 0) next -= half
      }
      if(next !== offset) setOffset(next)
      const center = (railRef.current?.clientWidth||0) / 2
      const trackCenter = center - next
      const iFloat = (trackCenter - (CARD_W/2)) / ITEM_W
      let nearest = Math.round(iFloat)
      const L = looped.length
      if(L>0){
        while(nearest < 0) nearest += L
        while(nearest >= L) nearest -= L
        const sampleIdx = nearest % (samples.length||1)
        if(sampleIdx !== activeRef.current){ activeRef.current = sampleIdx; setIdx(sampleIdx) }
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return ()=> { if(raf) cancelAnimationFrame(raf) }
  }, [offset, looped.length, samples.length])

  return (
    <div className="fixed inset-0 z-50 no-focus-outline" role="dialog" aria-modal="true" aria-label="Pack Preview">
      <div className="absolute inset-0 bg-black/90 backdrop-blur" onClick={onClose} />
      <div className={`relative max-w-4xl mx-auto mt-16 rounded-2xl glass-panel p-6 modal-panel overflow-hidden ${playing? 'preview-playing':''}`} data-theme={setId}>
        {/* Themed panel background and depth layers */}
        <div className="preview-bg" aria-hidden="true" />
        {/* Header glass pill */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="glass-pill" style={{ ['--frame-a' as any]: accent }}>
            <span className="text-[11px] tracking-wide uppercase">{def?.name || setId}</span>
          </div>
        </div>

        {/* Top grid: details + booster pack */}
        <div className="grid lg:grid-cols-[1fr,280px] gap-6 items-start preview-fadein">
          {/* Left: details */}
          <div>
            <div className="text-[13px] uppercase tracking-wide opacity-70">Preview</div>
            <div className="text-[19px] font-semibold preview-title">{def?.name || setId} <span className="text-xs opacity-60">({setId})</span></div>
            <div className="mt-2 text-sm opacity-80">Contains {def?.size || 0} cards across multiple rarity tiers. Pure odds opening.</div>
            <div className="mt-3">
              <div className="text-xs opacity-70 mb-2">Odds</div>
              <div className="flex flex-wrap gap-2 items-center preview-odds">
                {odds.map(o => (
                  <div key={o.id} className="odd-chip inline-flex items-center gap-2" data-tier={(o.id.startsWith('S')||o.id==='CROWN')? (o.id==='CROWN'?'crown':'secret') : (o.id==='D4'||o.id==='D5'?'rare':'common')}>
                    <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: o.color }} />
                    <span>{o.symbol}</span>
                    <span className="opacity-70">{fmtPct(o.pct)}</span>
                  </div>
                ))}
                <div className="odd-chip inline-flex items-center gap-2" data-tier="secret">
                  <span className="inline-block w-2.5 h-2.5 rounded-full" />
                  <span>✨</span>
                  <span className="opacity-70">{fmtPct(shinyChance)}</span>
                </div>
              </div>
            </div>
            <div className="preview-divider" aria-hidden="true" />
          </div>

          {/* Right: booster pack 3D frame */}
          <div className="preview-card-wrap">
            <div
              ref={ref}
              onMouseMove={onMove}
              onMouseLeave={onLeave}
              className="relative w-[240px] h-[340px] rounded-2xl overflow-hidden glass-frame foil-sheen preview-card-frame"
              style={{ transform: `perspective(1000px) rotateX(${reduced?0:tilt.rx}deg) rotateY(${reduced?0:tilt.ry}deg)` }}
            >
              <div className="inner absolute inset-[2px] rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-900"/>
              <div className="preview-halo" aria-hidden="true" />
              <div className="absolute inset-0 grid place-items-center z-10">
                <div className="scale-[.90]">
                  <ProgrammaticCard card={samples[idx]} onClick={()=>{}} topActive={true} fxOn={true} />
                </div>
              </div>
              <div className="sheen"/>
            </div>
          </div>
        </div>

        {/* Spinning carousel rail */}
        <div className="mt-6 glass-rail preview-rail" ref={railRef} style={{ ['--frame-a' as any]: accent }}>
          <div className="carousel" aria-label="Sample cards carousel">
            <div className="carousel-track" ref={trackRef} style={{ transform: `translateX(${offset}px)` }}>
              {looped.map((c,i)=> (
                <button key={`${c.id}-${i}`} className={`carousel-item ${i%samples.length===idx?'is-active':''}`} aria-label={`Sample ${i % samples.length + 1}`} tabIndex={-1} onMouseDown={(e)=> e.preventDefault()}>
                  <div className="scale-[.62] origin-top-left">
                    <ProgrammaticCard card={c} onClick={()=>{}} topActive={i%samples.length===idx} fxOn={true} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex items-center justify-end gap-6 preview-actions">
          <button className="cta-secondary" onClick={onClose}>Close</button>
          <button className="cta-primary" onClick={onOpen}>Open Pack</button>
        </div>
      </div>
    </div>
  )
}
