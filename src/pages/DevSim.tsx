import { useState } from 'react'
import { SETS as REGISTRY, type RarityId } from '@/sets/registry'
import { buildPack, toUiCard } from '@/packs/generate'
import { ProgrammaticCard } from '@/components/card/ProgrammaticCard'

function mapRarity(rid: RarityId): 'D1'|'D2'|'D3'|'D4'|'D5'|'S1'|'S2'|'S3'|'S4'|'CROWN' {
  switch(rid){
    case '1D': return 'D1'; case '2D': return 'D2'; case '3D': return 'D3'; case '4D': return 'D4'; case '5D': return 'D5'
    case '1S': return 'S1'; case '2S': return 'S2'; case '3S': return 'S3'; case '4S': return 'S4'; case 'CR': return 'CROWN'
  }
}

export default function DevSim(){
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<Record<string, any>>({})
  const [sheet, setSheet] = useState<Record<string, any[]>>({})

  const run = async () => {
    if(running) return
    setRunning(true)
    const out: Record<string, any> = {}
    const contact: Record<string, any[]> = {}
    const N = 10000

    for(const key of Object.keys(REGISTRY)){
      const def = REGISTRY[key]
      const counts: Record<string, number> = {}
      let dupViolations = 0
      for(let i=0;i<N;i++){
        const pack = buildPack(key)
        const seen = new Set<string>()
        for(const c of pack.cards){
          if(seen.has(c.cid)) dupViolations++
          seen.add(c.cid)
          counts[c.rarityId] = (counts[c.rarityId]||0) + 1
        }
      }
      out[key] = { counts, dupViolations }
      // contact sheet of 20
      const sample: any[] = []
      const pool = def.pool
      for(let i=0;i<20 && i<pool.length;i++){
        const c = pool[Math.floor(Math.random()*pool.length)]
        const numMatch = c.cid.match(/-(\d+)$/)
        const number = numMatch ? parseInt(numMatch[1],10) : i+1
        sample.push({ id: c.cid, set: key, number, name: c.name, rarity: mapRarity(c.rarity), shiny: false })
      }
      contact[key] = sample
    }

    setResult(out)
    setSheet(contact)
    setRunning(false)
  }

  return (
    <div className="px-6">
      <div className="max-w-6xl mx-auto py-6">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">Dev Sim</div>
          <button className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-sm" onClick={run} disabled={running}>{running? 'Running...' : 'Run 10k Packs per Set'}</button>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {Object.keys(REGISTRY).map((key)=> (
            <div key={key} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
              <div className="text-sm opacity-70">{key}</div>
              <div className="mt-2 text-xs">
                {result[key]? (
                  <div className="space-y-1">
                    {(Object.entries(result[key].counts) as Array<[string, number]>).map(([rid, cnt])=> (
                      <div key={rid} className="flex items-center justify-between"><span>{rid}</span><span className="opacity-80">{cnt}</span></div>
                    ))}
                    <div className="mt-2 text-[11px] opacity-70">Dup violations: {result[key].dupViolations}</div>
                  </div>
                ) : <div className="opacity-60">No data yet.</div>}
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {(sheet[key]||[]).map((c,i)=> (
                  <div key={`${c.id}-${i}`} className="relative w-[100%]" style={{ aspectRatio: '180/252' }}>
                    <div className="absolute inset-0 scale-[.48] origin-top-left">
                      <ProgrammaticCard card={c} onClick={()=>{}} topActive={false} fxOn={false} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
