import { useEffect, useRef, useState } from 'react'
import { Howl } from 'howler'
import { useReducedMotion } from '@/lib/settings'

export type RipState = 'idle' | 'dragging' | 'ripping' | 'revealing' | 'done'

export function PackRip({ theme, onComplete }: { theme: 'BASE'|'APEX'|'NEO'; onComplete: ()=>void }){
  const reduced = useReducedMotion()
  const [state, setState] = useState<RipState>('idle')
  const [rip, setRip] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const startX = useRef<number | null>(null)
  const [pieces, setPieces] = useState(0)
  const sfxTearRef = useRef<Howl | null>(null)
  const sfxWhooshRef = useRef<Howl | null>(null)

  useEffect(()=>{
    try{
      sfxTearRef.current = new Howl({ src: ['/sfx/tear.mp3'], volume: 0.7 })
      sfxWhooshRef.current = new Howl({ src: ['/sfx/whoosh.mp3'], volume: 0.5 })
    }catch{}
  }, [])

  useEffect(()=>{
    const onKey = (e: KeyboardEvent)=>{
      if(e.key===' ' || e.key==='Enter'){
        e.preventDefault()
        triggerRip()
      }
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(()=>{
    const el = rootRef.current
    if(!el) return
    el.style.setProperty('--rip', rip.toFixed(3))
  }, [rip])

  const onPointerDown = (e: React.PointerEvent) => {
    if(reduced){ triggerRip(); return }
    if(state==='ripping' || state==='revealing' || state==='done') return
    try{ (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId) }catch{}
    const rect = wrapRef.current?.getBoundingClientRect()
    startX.current = e.clientX
    setState('dragging')
    try{ (navigator as any)?.vibrate?.(15) }catch{}
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if(state!=='dragging') return
    const rect = wrapRef.current?.getBoundingClientRect()
    if(!rect || startX.current===null) return
    const dx = e.clientX - startX.current
    const w = rect.width
    const p = Math.max(0, Math.min(1, Math.abs(dx) / (w*0.9)))
    setRip(p)
  }

  const onPointerUp = () => {
    if(state!=='dragging') return
    if(rip >= 0.98){ triggerRip() }
    else {
      // ease back
      setRip(0)
      setState('idle')
    }
    startX.current = null
  }

  const triggerRip = () => {
    if(state==='ripping' || state==='revealing' || state==='done') return
    if(reduced){
      try{ sfxTearRef.current?.play() }catch{}
      try{ const stage = rootRef.current?.closest('.stage-canvas') as HTMLElement | null; stage?.classList.add('rip-boost'); setTimeout(()=> stage?.classList.remove('rip-boost'), 150) }catch{}
      setState('revealing')
      setTimeout(()=> { try{ sfxWhooshRef.current?.play() }catch{} }, 120)
      setTimeout(()=>{ setState('done'); onComplete() }, 380)
      return
    }
    setState('ripping')
    setRip(1)
    setPieces(24)
    try{ sfxTearRef.current?.play() }catch{}
    // Stage glow spike
    try{ const stage = rootRef.current?.closest('.stage-canvas') as HTMLElement | null; stage?.classList.add('rip-boost'); setTimeout(()=> stage?.classList.remove('rip-boost'), 180) }catch{}
    // Start overlap reveal
    setTimeout(()=> { try{ sfxWhooshRef.current?.play() }catch{}; setState('revealing') }, 300)
    setTimeout(()=>{ setState('done'); onComplete() }, 650)
    setTimeout(()=> setPieces(0), 820)
  }

  return (
    <div ref={rootRef} className={`pack-rip ${state}`} data-theme={theme}>
      <div
        ref={wrapRef}
        className="pack-wrap"
        role="button"
        aria-label={reduced? 'Tap to open' : 'Drag to rip open'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="pack-foil">
          <div className="pack-logo"/>
          <div className="foil-shimmer"/>
        </div>
        {!reduced && (
          <>
            <div className="pack-half left" aria-hidden="true"/>
            <div className="pack-half right" aria-hidden="true"/>
            <div className="rip-seam" aria-hidden="true"/>
            <div className="rip-burst" aria-hidden="true"/>
            {pieces>0 && (
              <div className="rip-particles" aria-hidden="true">
                {Array.from({length: pieces}).map((_,i)=>{
                  const angle = (i / pieces) * Math.PI * 2
                  const speed = 60 + (i%5)*10
                  const delay = (i%8) * 10
                  const hue = theme==='BASE' ? 48 : theme==='APEX' ? 265 : 182
                  const size = 3 + (i%3)
                  return (
                    <span key={i} className="foil-piece" style={{ 
                      ['--vx' as any]: `${Math.cos(angle)*speed}px`,
                      ['--vy' as any]: `${-40 - Math.abs(Math.sin(angle))*speed}px`,
                      ['--delay' as any]: `${delay}ms`,
                      ['--hue' as any]: `${hue}`,
                      width: `${size}px`, height: `${size+1}px`
                    }} />
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
      <div className="pack-cta">{reduced? 'Tap to open' : 'Drag to rip open'}</div>
    </div>
  )
}
