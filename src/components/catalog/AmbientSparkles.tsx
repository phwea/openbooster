import { useEffect, useMemo } from 'react'

export function AmbientSparkles(){
  const prefersReduced = useMemo(()=> typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const particles = useMemo(()=> Array.from({length: 8}).map((_,i)=>({
    key: i,
    size: 6 + Math.random()*6,
    top: Math.random()*80 + 10,
    left: Math.random()*80 + 10,
    hue: [180, 270, 200][i%3],
    dur: 8000 + Math.random()*6000,
    delay: Math.random()*2000,
    path: Math.random()>0.5 ? 1 : -1,
  })),[])

  useEffect(()=>{ /* nothing, CSS-driven */ }, [])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{zIndex:0}}>
      {particles.map(p=> (
        <div key={p.key} className={`absolute rounded-full blur-[3px] opacity-80`} style={{
          width: p.size,
          height: p.size,
          top: `${p.top}%`,
          left: `${p.left}%`,
          background: `hsl(${p.hue} 90% 60% / 0.10)`,
          animation: prefersReduced ? undefined : `spark-float ${p.dur}ms ease-in-out ${p.delay}ms infinite alternate`,
          transform: `translate3d(0,0,0)`
        }}/>
      ))}
      <style>{`
        @keyframes spark-float {
          from { transform: translate3d(0,0,0); }
          to { transform: translate3d(0, -12px, 0) rotate(0.01turn); }
        }
      `}</style>
    </div>
  )
}
