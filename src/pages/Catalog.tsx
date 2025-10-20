import { useNavigate } from 'react-router-dom'
import { useInventory } from '@/lib/store'
import { ExpansionCard } from '@/components/catalog/ExpansionCard'
import { AmbientSparkles } from '@/components/catalog/AmbientSparkles'
import type { ExpansionTheme } from '@/lib/tokens'
import { PackPreview } from '@/components/catalog/PackPreview'
import { useState } from 'react'
import { useTransition } from '@/lib/transition'
import { useReducedMotion } from '@/lib/settings'
import { expansions } from '@/lib/expansions'
import { SETS as REGISTRY } from '@/sets/registry'

export function Catalog(){
  const nav = useNavigate()
  const inv = useInventory()
  const [previewId, setPreviewId] = useState<string | null>(null)
  const transition = useTransition()
  const reduced = useReducedMotion()

  const choose = (id: string) => {
    inv.setCurrentSetId(id)
    nav('/open')
  }

  const themeOf = (setId: string): ExpansionTheme => {
    switch(setId){
      case 'BASE': return 'base'
      case 'APEX': return 'apex'
      case 'NEO': return 'neo'
      default: return 'base'
    }
  }

  return (
    <main className="relative max-w-6xl mx-auto px-6 py-10">
      <AmbientSparkles />
      <div className="relative">
        <h2 className="text-2xl font-bold">Choose Your Expansion</h2>
        <div className="h-[2px] w-0 bg-gradient-to-r from-cyan-400 to-violet-400 mt-1 animate-[underline_400ms_ease_forwards]" />
        <style>{`@keyframes underline { to { width: 240px } }`}</style>
        <p className="text-neutral-300 mt-2 tracking-wider" style={{opacity:0.8}}>Pick a set to open. No pity. Pure odds.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
        {Object.values(REGISTRY).map((def, idx) => {
          const expKey = def.id==='BASE'? 'base' : def.id==='APEX' ? 'apex' : 'neo'
          const copy = expansions[expKey as keyof typeof expansions]
          return (
            <ExpansionCard
              key={def.id}
              id={def.id}
              title={copy?.title || def.name}
              subtitle={copy?.subtitle}
              tag={copy?.tag}
              count={def.size}
              theme={themeOf(def.id)}
              delayMs={idx*100}
              onSelect={()=>setPreviewId(def.id)}
            />
          )
        })}
      </div>

      {previewId && (
        <PackPreview
          setId={previewId}
          onClose={()=>setPreviewId(null)}
          onOpen={()=>{
            const id = previewId
            if(!id) return
            transition.playPreviewToOpen({ setId: id, reduced, onNavigate: ()=>{ choose(id); setPreviewId(null) } })
          }}
        />
      )}
    </main>
  )
}
