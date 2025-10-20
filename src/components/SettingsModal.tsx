import { useEffect, useMemo } from 'react'
import { useRendererMode, RendererMode, prefersReducedMotion, useMotionMode } from '@/lib/settings'
import { useRenderer } from '@/lib/renderer'

export function SettingsModal({ open, onClose }:{ open:boolean; onClose: ()=>void }){
  const [mode, setMode] = useRendererMode()
  const [motion, setMotion] = useMotionMode()
  const { effective, ready } = useRenderer()
  const effectiveRenderer = (effective === 'webgl' ? 'WebGL' : 'CSS') + (ready ? '' : ' (warming)')
  const reducedDetected = prefersReducedMotion()
  const effectiveReduced = motion==='reduce' || (motion==='auto' && reducedDetected)

  useEffect(()=>{
    if(!open) return
    const onKey = (e: KeyboardEvent)=>{ if(e.key==='Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if(!open) return null
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Settings">
      <div className="absolute inset-0 bg-black/70 backdrop-blur" onClick={onClose} />
      <div className="relative max-w-md mx-auto mt-24 rounded-xl border border-neutral-800 bg-neutral-900 p-6 modal-panel">
        <div className="text-lg font-semibold">Settings</div>

        <div className="mt-4" role="region" aria-labelledby="renderer-label">
          <div id="renderer-label" className="text-sm opacity-80">Renderer</div>
          <div className="mt-2 flex items-center gap-2" role="radiogroup" aria-label="Renderer">
            <button title="Changes visual rendering mode (restart not required)." role="radio" aria-checked={mode==='auto'} tabIndex={0} className={`capsule-btn ${mode==='auto'?'is-active':''}`} onClick={()=> setMode('auto')}>Auto</button>
            <button title="Use CSS-based effects only." role="radio" aria-checked={mode==='css'} tabIndex={0} className={`capsule-btn ${mode==='css'?'is-active':''}`} onClick={()=> setMode('css')}>CSS</button>
            <button title="Use WebGL shaders and particles when available." role="radio" aria-checked={mode==='webgl'} tabIndex={0} className={`capsule-btn ${mode==='webgl'?'is-active':''}`} onClick={()=> setMode('webgl')}>WebGL</button>
          </div>
        </div>

        <div className="mt-4" role="region" aria-labelledby="motion-label">
          <div id="motion-label" className="text-sm opacity-80">Motion</div>
          <div className="mt-2 flex items-center gap-2" role="radiogroup" aria-label="Motion">
            <button role="radio" aria-checked={motion==='auto'} tabIndex={0} className={`capsule-btn ${motion==='auto'?'is-active':''}`} onClick={()=> setMotion('auto')}>Auto</button>
            <button role="radio" aria-checked={motion==='reduce'} tabIndex={0} className={`capsule-btn ${motion==='reduce'?'is-active':''}`} onClick={()=> setMotion('reduce')}>On (Reduce)</button>
            <button role="radio" aria-checked={motion==='full'} tabIndex={0} className={`capsule-btn ${motion==='full'?'is-active':''}`} onClick={()=> setMotion('full')}>Off (Full)</button>
            <button className="capsule-btn ml-2" aria-pressed={effectiveReduced} onClick={()=> setMotion(effectiveReduced ? 'full' : 'reduce')} title="Quick toggle Reduced Motion">{effectiveReduced ? 'Reduced: On' : 'Reduced: Off'}</button>
          </div>
        </div>

        <div className="mt-4 text-xs opacity-70 font-mono">
          <div>Renderer: {effectiveRenderer} (active)</div>
          <div>Motion: Effective reduced motion: {effectiveReduced ? 'Yes' : 'No'} · OS detected: {reducedDetected ? 'Yes' : 'No'}</div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="capsule-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
