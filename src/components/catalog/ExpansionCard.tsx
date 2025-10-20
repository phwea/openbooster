import { useEffect, useMemo, useRef, useState } from 'react'
import { tokens, ExpansionTheme } from '@/lib/tokens'

export type ExpansionCardProps = {
  id: string
  title: string
  subtitle?: string
  tag?: string
  count: number
  tagline?: string
  theme: ExpansionTheme
  delayMs?: number
  onSelect: () => void
}

export function ExpansionCard({ id, title, subtitle, tag, count, tagline, theme, delayMs=0, onSelect }: ExpansionCardProps){
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [tilt, setTilt] = useState({rx:0, ry:0})

  const accent = useMemo(()=>{
    switch(theme){
      case 'base': return tokens.colors.accent.base
      case 'apex': return tokens.colors.accent.apex
      case 'neo': return tokens.colors.accent.neo
    }
  }, [theme])

  useEffect(()=>{ setMounted(true) }, [])

  useEffect(()=>{
    const el = ref.current
    if(!el) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if(prefersReduced) return

    let raf = 0
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width/2
      const cy = rect.top + rect.height/2
      const dx = (e.clientX - cx) / rect.width
      const dy = (e.clientY - cy) / rect.height
      const max = 3
      const next = { rx: Math.max(-max, Math.min(max, -dy*max)), ry: Math.max(-max, Math.min(max, dx*max)) }
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(()=> setTilt(next))
    }
    const onLeave = () => setTilt({rx:0, ry:0})
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); cancelAnimationFrame(raf) }
  }, [])

  const onKey = (e: React.KeyboardEvent) => {
    if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() }
  }

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onKeyDown={onKey}
      onClick={onSelect}
      className={`group relative rounded-xl overflow-hidden border text-left hover-sweep elevate-hover fade-up focus:outline-none focus-visible:ring-2`}
      style={{
        borderColor: 'rgba(120,120,120,0.25)',
        animationDelay: `${delayMs}ms`,
        transform: `perspective(800px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        ['--frame-a' as any]: accent,
        ['--frame-b' as any]: '#777',
      }}
      aria-label={`${title}, ${count} cards`}
    >
      <div className="absolute inset-0 bg-neutral-900/40"/>
      <div className="absolute inset-0 foil-texture opacity-70"/>
      <div className="p-5 relative">
        <div className="relative h-40 grid place-items-center">
          <div className="absolute inset-0 starfield-overlay"/>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_60%)]"/>
          <div className="pack-wrapper gradient-border foil-sheen transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-1" style={{ width: 140, height: 200, ['--frame-a' as any]: accent, ['--frame-b' as any]: '#777' }}>
            <div className="inner absolute inset-[2px] rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-900"/>
            <div className="absolute inset-0 grid place-items-center z-10">
              <div className="text-xs opacity-90 px-1.5 py-0.5 rounded border border-neutral-700/60 bg-neutral-900/60" style={{ color: accent, borderColor: accent }}>{id.toUpperCase()}</div>
            </div>
            <div className="sheen"/>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {tag ? <span className="text-neutral-400">{tag}</span> : null}
          <span className="opacity-70">{count} cards</span>
        </div>
        <div className="mt-1 text-lg font-semibold group-hover:-translate-y-0.5 transition-transform" style={{color: 'white'}}>{title}</div>
        {tagline ? <div className="mt-1 text-xs text-neutral-300 tracking-wide">{tagline}</div> : null}
      </div>
    </div>
  )
}
