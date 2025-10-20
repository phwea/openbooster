import { useEffect, useMemo, useRef } from 'react'
import { useTransition } from '@/lib/transition'
import { useReducedMotion } from '@/lib/settings'

export function TransitionOverlay(){
  const { phase, setId, reduced, durationMs } = useTransition()
  const active = phase === 'playing'
  const rm = useReducedMotion()
  const useReduce = reduced || rm
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    const el = rootRef.current
    if(!el) return
    if(active){
      // kick animation via class toggle
      requestAnimationFrame(()=> el.classList.add('t-playing'))
    } else {
      el.classList.remove('t-playing')
    }
  }, [active])

  if(!active) return null
  return (
    <div ref={rootRef} className="t-overlay" data-theme={setId} data-reduce={useReduce? '1':'0'} style={{ ['--t-dur' as any]: `${durationMs}ms` }}>
      <div className="t-backdrop"/>
      <div className="t-card"/>
    </div>
  )
}
