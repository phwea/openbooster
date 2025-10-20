import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { getRendererMode, useRendererMode, RENDERER_EVENT, shouldUseWebGL } from '@/lib/settings'

export type Effective = 'css' | 'webgl'
export type RendererState = {
  mode: 'auto'|'css'|'webgl'
  effective: Effective
  ready: boolean
  setMode: (m: 'auto'|'css'|'webgl')=>void
}

const Ctx = createContext<RendererState | null>(null)

function probeEffective(mode: 'auto'|'css'|'webgl'): Effective{
  if(mode==='css') return 'css'
  if(mode==='webgl') return shouldUseWebGL(true) ? 'webgl' : 'css'
  // auto
  return shouldUseWebGL(true) ? 'webgl' : 'css'
}

function prewarmWebGL(): Promise<void>{
  return new Promise((resolve)=>{
    try{
      const canvas = document.createElement('canvas')
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
      renderer.setSize(4, 4, false)
      const scene = new THREE.Scene()
      const cam = new THREE.PerspectiveCamera(30, 1, 0.01, 10)
      cam.position.z = 1
      const geo = new THREE.BufferGeometry()
      const vertices = new Float32Array([ -0.1,-0.1,0, 0.1,-0.1,0, 0.0,0.1,0 ])
      geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
      const mat = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const mesh = new THREE.Mesh(geo, mat)
      scene.add(mesh)
      renderer.render(scene, cam)
      setTimeout(()=>{
        try{ mat.dispose(); geo.dispose(); renderer.dispose() }catch{}
        resolve()
      }, 16)
    }catch{ resolve() }
  })
}

export function RendererProvider({ children }: { children: React.ReactNode }){
  const [mode, setMode] = useRendererMode()
  const [ready, setReady] = useState(false)
  const [effective, setEffective] = useState<Effective>(()=> probeEffective(mode))

  useEffect(()=>{
    const onChange = ()=>{
      const m = getRendererMode()
      const eff = probeEffective(m)
      setReady(false)
      setEffective(eff)
    }
    window.addEventListener(RENDERER_EVENT, onChange as any)
    return ()=> window.removeEventListener(RENDERER_EVENT, onChange as any)
  }, [])

  useEffect(()=>{
    const eff = probeEffective(mode)
    setReady(false)
    setEffective(eff)
  }, [mode])

  useEffect(()=>{
    let mounted = true
    const run = async()=>{
      if(effective === 'webgl'){
        await prewarmWebGL()
      }
      if(mounted){
        setReady(true)
        try{ window.dispatchEvent(new CustomEvent('rendererready', { detail: { effective } })) }catch{}
      }
    }
    run()
    return ()=>{ mounted = false }
  }, [effective])

  const value = useMemo<RendererState>(()=> ({ mode, effective, ready, setMode }), [mode, effective, ready, setMode])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useRenderer(){
  const ctx = useContext(Ctx)
  if(!ctx) throw new Error('useRenderer must be used within RendererProvider')
  return ctx
}
