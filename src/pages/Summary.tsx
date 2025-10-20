import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useInventory } from '@/lib/store'
import { rarityMap } from '@/lib/rarity'
import type { Rarity } from '@/lib/types'
import { ProgrammaticCard } from '@/components/card/ProgrammaticCard'
import { useReducedMotion } from '@/lib/settings'

export default function Summary(){
  const nav = useNavigate()
  const inv = useInventory()
  const loc = useLocation() as any
  const state = (loc && loc.state) || {}
  const cards = (state.cards || []) as any[]
  const setName = state.setName as string | undefined
  const gainedExp = state.gainedExp as number | undefined
  const devLog = useMemo(()=> (typeof window !== 'undefined') && (((window as any).__DEV_LOG__) || localStorage.getItem('dev_log')==='1'), [])
  const reduced = useReducedMotion()
  const [intro, setIntro] = useState<'opening'|'summaryIntro'|'summaryReady'>('opening')
  const theme = useMemo(()=> (cards[0]?.set || 'BASE') as ('BASE'|'APEX'|'NEO'), [cards])

  const R = rarityMap()
  const rank = (r: Rarity) => ({ D1:1,D2:2,D3:3,D4:4,D5:5,S1:6,S2:7,S3:8,S4:9,CROWN:10 } as const)[r]
  const bestIndex = cards.reduce((bi, c, i)=> rank(c.rarity)>rank(cards[bi]?.rarity) ? i : bi, 0)
  const topTwo = useMemo(()=>{
    const pairs = cards.map((c,i)=> [i, rank(c.rarity)] as const).sort((a,b)=> b[1]-a[1])
    return new Set(pairs.slice(0,2).map(p=> p[0]))
  }, [cards])

  const byRarity: Record<string, number> = {}
  for(const c of cards){ byRarity[c.rarity] = (byRarity[c.rarity]||0) + 1 }

  const stats = useMemo(()=>{
    const entries = Object.entries(byRarity).sort((a,b)=> rank(b[0] as Rarity) - rank(a[0] as Rarity))
    return entries.map(([r,cnt])=> `${cnt} ${R[r as Rarity]?.symbol || r}`).join(' · ')
  }, [byRarity])

  useEffect(()=>{
    const t1 = setTimeout(()=> setIntro('summaryIntro'), reduced ? 0 : 120)
    const t2 = setTimeout(()=> setIntro('summaryReady'), reduced ? 200 : 900)
    return ()=> { clearTimeout(t1); clearTimeout(t2) }
  }, [reduced])

  if(!cards.length){
    return (
      <section id="summary-stage">
        <div className="stage-panel">
          <div className="px-6 py-10">
            <div className="text-lg">No pack data found.</div>
            <div className="mt-4"><button className="capsule-btn primary" onClick={()=> nav('/open')}>Open a Pack</button></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="summary-stage">
      <div className={`summary-canvas ${intro}`} data-theme={theme}>
        <div className="summary-ambient" aria-hidden="true"/>
        <div className="summary-particles" aria-hidden="true">
          {Array.from({length: 16}).map((_,i)=> (
            <span key={i} className="speck" style={{ ['--i' as any]: i, ['--d' as any]: `${(i%8)*0.2}s` }} />
          ))}
        </div>
        <div className="stage-panel">
          <div className="summary-header">
            <div className="summary-eyebrow">Pack Summary</div>
            <div className="summary-title">{setName || 'Pack'}</div>
            {typeof gainedExp === 'number' ? <div className="summary-sub">EXP +{gainedExp}</div> : null}
          </div>
          <div className="summary-grid">
            {cards.map((c,i)=> (
              <div key={`${c.id}-${i}`} className={`summary-card ${topTwo.has(i)?'is-rare':''}`} style={{ animationDelay: reduced? undefined : `${i*80}ms` }}>
                <div className="scale-[.90] origin-top-left">
                  <ProgrammaticCard
                    card={c}
                    onClick={()=>{}}
                    topActive={topTwo.has(i)}
                    fxOn={true}
                    onSetClick={(sid)=>{ try{ const raw = localStorage.getItem('inv_filters'); const s = raw? JSON.parse(raw): {}; localStorage.setItem('inv_filters', JSON.stringify({ ...s, setFilter: sid })); }catch{} nav('/inventory') }}
                  />
                </div>
                {devLog ? (
                  <div className="summary-dev">{c.set}-{c.number} / {c.id} / {c.rarity}</div>
                ) : null}
              </div>
            ))}
          </div>
          <div className="summary-stats">
            <div className="summary-stats-line">{stats}</div>
          </div>
          <div className="summary-actions">
            <button className="capsule-btn primary" onClick={()=> nav('/open')}>Open Another Pack</button>
            <button className="capsule-btn" onClick={()=> nav('/catalog')}>Return to Set Preview</button>
          </div>
        </div>
      </div>
    </section>
  )
}
