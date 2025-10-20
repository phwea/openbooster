import { Link } from 'react-router-dom'
import { useMemo, useRef, useState } from 'react'
import { CardView } from '@/components/card/CardView'
import { SETS as REGISTRY } from '@/sets/registry'
import { tokens } from '@/lib/tokens'

export function Home(){
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState<string>(()=> localStorage.getItem('bbx_user') || 'Guest')
  const heroRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })

  const sample = useMemo(()=>{
    const def = REGISTRY['BASE']
    const pool = def?.pool || []
    const c = pool[Math.min(10, pool.length-1)]
    if(!c){ return { id: 'BASE-001', set: 'BASE', number: 1, name: 'Glass Totem', rarity: 'D1', shiny: false } as any }
    const numMatch = c.cid.match(/-(\d+)$/)
    const number = numMatch ? parseInt(numMatch[1],10) : 1
    const rarity = ((): any=>{ switch(c.rarity){ case '1D': return 'D1'; case '2D': return 'D2'; case '3D': return 'D3'; case '4D': return 'D4'; case '5D': return 'D5'; case '1S': return 'S1'; case '2S': return 'S2'; case '3S': return 'S3'; case '4S': return 'S4'; case 'CR': return 'CROWN' } })()
    return { id: c.cid, set: def.id, number, name: c.name, rarity, shiny: false }
  }, [])

  const accent = useMemo(()=> tokens.colors.accent.base, [])

  const onMove = (e: React.MouseEvent) => {
    const el = heroRef.current
    if(!el) return
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width/2
    const cy = r.top + r.height/2
    const dx = (e.clientX - cx) / r.width
    const dy = (e.clientY - cy) / r.height
    const max = 6
    setTilt({ rx: Math.max(-max, Math.min(max, -dy*max)), ry: Math.max(-max, Math.min(max, dx*max)) })
  }
  const onLeave = () => setTilt({ rx: 0, ry: 0 })

  const signIn = () => {
    const n = email.trim().split('@')[0] || 'Guest'
    localStorage.setItem('bbx_user', n)
    setName(n)
    setShowLogin(false)
  }

  return (
    <main>
      <section className="relative overflow-hidden starfield-overlay">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.08),transparent_60%)]"/>
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 items-center gap-10">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800/60 bg-neutral-900/40 text-xs opacity-90 reveal-pop" style={{ animationDelay: '40ms' }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"/>
              <span>{name === 'Guest' ? 'Signed out' : `Welcome, ${name}`}</span>
              <button className="capsule-btn ml-2" onClick={()=> setShowLogin(true)}>Sign In</button>
            </div>
            <h2 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight reveal-pop" style={{ animationDelay: '120ms' }}>Feel the Pull</h2>
            <p className="mt-4 text-neutral-300 max-w-xl mx-auto md:mx-0 reveal-pop" style={{ animationDelay: '200ms' }}>
              Pure RNG. No pity. Open packs from classic and custom sets with brutal odds and gorgeous reveals.
            </p>
            <div className="mt-8 flex items-center justify-center md:justify-start gap-3 reveal-pop" style={{ animationDelay: '260ms' }}>
              <Link to="/catalog" className="capsule-btn primary">Browse Catalog</Link>
              <Link to="/open" className="capsule-btn">Open Packs</Link>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-end">
            <div
              ref={heroRef}
              onMouseMove={onMove}
              onMouseLeave={onLeave}
              className="relative w-[260px] h-[380px] rounded-2xl overflow-hidden gradient-border foil-sheen reveal-pop"
              style={{ ['--frame-a' as any]: accent, ['--frame-b' as any]: '#777', transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`, animationDelay: '180ms' }}
            >
              <div className="inner absolute inset-[2px] rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-900"/>
              <div className="absolute inset-0 grid place-items-center z-10">
                <div className="scale-[.94]">
                  <CardView card={sample} revealed={true} onClick={()=>{}} index={0} suspense={false} faceUp={true} topActive={true} stackBackOnly={false} />
                </div>
              </div>
              <div className="sheen"/>
            </div>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-6 pb-16 grid md:grid-cols-3 gap-6">
        <Feature title="True Rarity" desc="Odds modeled after real booster pulls. Ultra hits are rare, Crowns are mythical."/>
        <Feature title="Tension Built-In" desc="Stacked reveals, suspense glow, bass stings for rare flips."/>
        <Feature title="Your Collection" desc="Auto-saved inventory with filters and completion stats."/>
      </section>

      {showLogin ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Sign In">
          <div className="absolute inset-0 bg-black/70 backdrop-blur" onClick={()=> setShowLogin(false)} />
          <div className="relative max-w-sm mx-auto mt-28 rounded-xl border border-neutral-800 bg-neutral-900 p-5 modal-panel">
            <div className="text-lg font-semibold">Sign in</div>
            <div className="mt-2 text-sm opacity-80">This is a visual stub. No real account system yet.</div>
            <div className="mt-4 space-y-3">
              <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-neutral-800 px-3 py-2 rounded" placeholder="Email" />
              <input type="password" className="w-full bg-neutral-800 px-3 py-2 rounded" placeholder="Password" />
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button className="capsule-btn" onClick={()=> setShowLogin(false)}>Cancel</button>
              <button className="capsule-btn primary" onClick={signIn}>Continue</button>
              <button className="capsule-btn" onClick={()=> { localStorage.setItem('bbx_user','Guest'); setName('Guest'); setShowLogin(false) }}>Continue as Guest</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

function Feature({ title, desc }: { title: string; desc: string }){
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
      <div className="text-lg font-semibold">{title}</div>
      <p className="mt-1 text-sm text-neutral-300">{desc}</p>
    </div>
  )
}
