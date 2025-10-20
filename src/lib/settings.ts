import { useEffect, useMemo, useState } from 'react'

export type RendererMode = 'auto' | 'css' | 'webgl'
export type MotionMode = 'auto' | 'reduce' | 'full'

const LS_KEY = 'renderer_mode'
const LS_MOTION_KEY = 'motion_mode'
export const RENDERER_EVENT = 'renderermodechange'
export const MOTION_EVENT = 'motionmodechange'

export function getRendererMode(): RendererMode {
  try { const v = localStorage.getItem(LS_KEY) as RendererMode | null; if(v==='css' || v==='webgl' || v==='auto') return v; } catch {}
  return 'auto'
}

export function setRendererMode(mode: RendererMode){
  try { 
    localStorage.setItem(LS_KEY, mode)
    if(typeof window!=='undefined'){
      try{ window.dispatchEvent(new CustomEvent(RENDERER_EVENT, { detail: mode })) }catch{}
    }
  } catch {}
}

export function useRendererMode(): [RendererMode, (m: RendererMode)=>void] {
  const [mode, setMode] = useState<RendererMode>(()=> getRendererMode())
  useEffect(()=>{ setRendererMode(mode) }, [mode])
  useEffect(()=>{
    const onChange = ()=> setMode(getRendererMode())
    const onStorage = (e: StorageEvent)=>{ if(e.key===LS_KEY) onChange() }
    if(typeof window!=='undefined'){
      window.addEventListener(RENDERER_EVENT, onChange as any)
      window.addEventListener('storage', onStorage)
    }
    return ()=>{
      if(typeof window!=='undefined'){
        window.removeEventListener(RENDERER_EVENT, onChange as any)
        window.removeEventListener('storage', onStorage)
      }
    }
  }, [])
  return [mode, setMode]
}

export function prefersReducedMotion(): boolean {
  if(typeof window==='undefined') return false
  try{ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches }catch{ return false }
}

export function isMobileUA(){
  if(typeof navigator==='undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

export function detectWebGL2Capable(): boolean {
  if(typeof document==='undefined') return false
  try{
    const canvas = document.createElement('canvas')
    // Prefer WebGL2, but accept WebGL1 fallback
    const gl2 = canvas.getContext('webgl2', { antialias: true }) as WebGL2RenderingContext | null
    if(gl2) return true
    const gl1 = canvas.getContext('webgl', { antialias: true }) || canvas.getContext('experimental-webgl')
    return !!gl1
  }catch{ return false }
}

export function shouldUseWebGL(active3D: boolean){
  if(!active3D) return false
  // Manual motion overrides OS
  try{
    const mm = getMotionMode()
    if(mm === 'reduce') return false
    if(mm === 'full'){
      // allow even if OS prefers reduced
    } else {
      if(prefersReducedMotion()) return false
    }
  }catch{
    if(prefersReducedMotion()) return false
  }
  const mode = getRendererMode()
  if(mode==='css') return false
  if(mode==='webgl') return detectWebGL2Capable()
  // auto
  if(isMobileUA()) return false
  return detectWebGL2Capable()
}

// Dev helpers
;(window as any).setRendererMode = setRendererMode
;(window as any).getRendererMode = getRendererMode

export function getMotionMode(): MotionMode {
  try { 
    const v = localStorage.getItem(LS_MOTION_KEY) as MotionMode | null; 
    if(v==='auto' || v==='reduce' || v==='full') return v 
    // default to FULL motion if not set
    localStorage.setItem(LS_MOTION_KEY, 'full')
    return 'full'
  } catch {}
  return 'full'
}

export function setMotionMode(mode: MotionMode){
  try { 
    localStorage.setItem(LS_MOTION_KEY, mode) 
    if(typeof window!=='undefined'){
      try{ window.dispatchEvent(new CustomEvent(MOTION_EVENT, { detail: mode })) }catch{}
    }
  } catch {}
}

export function useMotionMode(): [MotionMode, (m: MotionMode)=>void] {
  const [mode, setMode] = useState<MotionMode>(()=> getMotionMode())
  useEffect(()=>{ setMotionMode(mode) }, [mode])
  useEffect(()=>{
    const onChange = ()=>{ try{ setMode(getMotionMode()) }catch{} }
    const onStorage = (e: StorageEvent)=>{ if(e.key===LS_MOTION_KEY){ setMode(getMotionMode()) } }
    if(typeof window!=='undefined'){
      window.addEventListener(MOTION_EVENT, onChange as any)
      window.addEventListener('storage', onStorage)
    }
    return ()=>{
      if(typeof window!=='undefined'){
        window.removeEventListener(MOTION_EVENT, onChange as any)
        window.removeEventListener('storage', onStorage)
      }
    }
  }, [])
  return [mode, setMode]
}

export function useReducedMotion(): boolean {
  const [mode] = useMotionMode()
  const os = prefersReducedMotion()
  return mode==='reduce' || (mode==='auto' && os)
}
