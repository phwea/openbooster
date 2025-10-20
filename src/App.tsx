import { useEffect, useMemo, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import OpenScene from '@/pages/OpenScene'
import { InventoryView } from '@/components/InventoryView'
import { Home } from '@/pages/Home'
import { Catalog } from '@/pages/Catalog'
import { useInventory } from '@/lib/store'
import Summary from '@/pages/Summary'
import DevSim from '@/pages/DevSim'
import { SettingsModal } from '@/components/SettingsModal'
import { useReducedMotion, useRendererMode, shouldUseWebGL } from '@/lib/settings'
import Showcase from '@/pages/Showcase'
import { TransitionOverlay } from '@/components/TransitionOverlay'
import { RendererProvider } from '@/lib/renderer'

function Routed(){
  const location = useLocation()
  const inv = useInventory()
  const lvl = inv.getLevel()
  const prevRef = useRef(location.pathname)
  const [prevPath, setPrevPath] = useState<string | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const prefersReduced = useMemo(()=> typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const [rendererMode] = useRendererMode()
  const effectiveRenderer = shouldUseWebGL(true) ? 'webgl' : 'css'
  const reducedMotion = useReducedMotion()
  const theme = (inv.currentSetId || 'BASE') as 'BASE'|'APEX'|'NEO'

  useEffect(()=>{
    const id = (inv.currentSetId || '').toString()
    if(id==='base') inv.setCurrentSetId('BASE')
    if(id==='apex') inv.setCurrentSetId('APEX')
    if(id==='neo') inv.setCurrentSetId('NEO')
  }, [inv.currentSetId])

  useEffect(()=>{
    const path = location.pathname
    const prev = prevRef.current
    if(prev !== path){
      if(!prefersReduced){
        setPrevPath(prev)
        setTransitioning(true)
        const t = setTimeout(()=>{ setTransitioning(false); setPrevPath(null) }, 170)
        window.scrollTo({ top: 0, behavior: 'auto' })
        prevRef.current = path
        return ()=> clearTimeout(t)
      } else {
        setPrevPath(null)
        setTransitioning(false)
        window.scrollTo({ top: 0, behavior: 'auto' })
        prevRef.current = path
      }
    }
  }, [location.pathname, prefersReduced])
  return (
    <div className="min-h-screen app-bg-animated" data-motion={reducedMotion ? 'reduce' : 'full'} data-renderer={effectiveRenderer} data-theme={theme}>
      <div className="bg-layers" aria-hidden="true">
        <div className="site-ambient" />
        <div className="site-particles">
          {Array.from({length: 24}).map((_,i)=> (
            <span key={i} className="speck" style={{ ['--i' as any]: i, ['--d' as any]: `${(i%10)*0.3}s` }} />
          ))}
        </div>
      </div>
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/60 bg-neutral-900/40 backdrop-blur">
        <NavLink to="/" className="text-xl font-semibold tracking-wider">Booster Box Opening</NavLink>
        <nav className="flex items-center gap-2 text-sm">
          <NavLink to="/" className={({isActive}:{isActive:boolean})=>`capsule-btn ${isActive?'is-active':''}`}>Home</NavLink>
          <NavLink to="/catalog" className={({isActive}:{isActive:boolean})=>`capsule-btn ${isActive?'is-active':''}`}>Catalog</NavLink>
          <NavLink to="/open" className={({isActive}:{isActive:boolean})=>`capsule-btn primary ${isActive?'is-active':''}`}>Open Packs</NavLink>
          <NavLink to="/inventory" className={({isActive}:{isActive:boolean})=>`capsule-btn ${isActive?'is-active':''}`}>Inventory</NavLink>
          <NavLink to="/showcase" className={({isActive}:{isActive:boolean})=>`capsule-btn ${isActive?'is-active':''}`}>Showcase</NavLink>
          <div className="ml-2 px-2 py-0.5 rounded bg-neutral-800 text-xs">Lv {lvl}</div>
          <button className="ml-2 capsule-btn" onClick={()=> setSettingsOpen(true)} aria-label="Settings">⚙</button>
        </nav>
      </header>
      <div className="relative">
        {transitioning && prevPath ? (
          <>
            <div className="route-root route-exit absolute inset-0">
              <Routes location={{ ...location, pathname: prevPath }}>
                <Route path="/" element={<Home/>} />
                <Route path="/catalog" element={<Catalog/>} />
                <Route path="/open" element={<OpenScene/>} />
                <Route path="/inventory" element={<InventoryView/>} />
                <Route path="/summary/:id" element={<Summary/>} />
                <Route path="/dev/sim" element={<DevSim/>} />
                <Route path="/showcase" element={<Showcase/>} />
              </Routes>
            </div>
            <div className="route-root route-fade">
              <Routes location={location}>
                <Route path="/" element={<Home/>} />
                <Route path="/catalog" element={<Catalog/>} />
                <Route path="/open" element={<OpenScene/>} />
                <Route path="/inventory" element={<InventoryView/>} />
                <Route path="/summary/:id" element={<Summary/>} />
                <Route path="/showcase" element={<Showcase/>} />
              </Routes>
            </div>
          </>
        ) : (
          <div key={location.pathname} className="route-root route-fade">
            <Routes>
              <Route path="/" element={<Home/>} />
              <Route path="/catalog" element={<Catalog/>} />
              <Route path="/open" element={<OpenScene/>} />
              <Route path="/inventory" element={<InventoryView/>} />
              <Route path="/summary/:id" element={<Summary/>} />
              <Route path="/dev/sim" element={<DevSim/>} />
              <Route path="/showcase" element={<Showcase/>} />
            </Routes>
          </div>
        )}
      </div>
      <SettingsModal open={settingsOpen} onClose={()=> setSettingsOpen(false)} />
      <TransitionOverlay />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <RendererProvider>
        <Routed/>
      </RendererProvider>
    </BrowserRouter>
  )
}
