import React, { useMemo } from 'react'
import { CardRenderer } from '@/components/card/CardRenderer'
import { rarityMap } from '@/lib/rarity'

const PACKS: Array<'BASE'|'APEX'|'NEO'> = ['BASE','APEX','NEO']
const RARITIES: Array<'D1'|'D2'|'D3'|'D4'|'D5'|'S1'|'S2'|'S3'|'S4'> = ['D1','D2','D3','D4','D5','S1','S2','S3','S4']

export default function Showcase(){
  const R = useMemo(()=> rarityMap(), [])
  return (
    <div className="px-6">
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-sm opacity-70">Showcase</div>
            <div className="mt-1 text-xl font-bold">Packs × Rarities</div>
          </div>
        </div>

        {/* Grid header */}
        <div className="mt-4 grid grid-cols-[120px,repeat(3,1fr)] gap-3 items-center">
          <div />
          {PACKS.map(p=> (
            <div key={p} className="text-sm opacity-80 text-center set-pill inline-flex">{p}</div>
          ))}
        </div>

        {/* Matrix rows */}
        <div className="mt-2">
          {RARITIES.map((rar)=> (
            <div key={rar} className="grid grid-cols-[120px,repeat(3,1fr)] gap-3 items-center py-2 border-b border-neutral-800/60">
              <div className="text-sm opacity-80 text-center">{R[rar]?.symbol || rar}</div>
              {PACKS.map(setId=> (
                <div key={`${setId}-${rar}`} className="flex items-start gap-3 justify-center">
                  {/* HOLO */}
                  <div className="relative w-[180px] h-[252px]">
                    <CardRenderer card={{ id: `${setId}-${rar}-H`, set: setId, number: 1, name: `${setId} ${rar}`, rarity: rar, shiny: false }} fxOn={true} onClick={()=>{}} topActive={true} />
                  </div>
                  {/* MATTE */}
                  <div className="relative w-[180px] h-[252px]">
                    <CardRenderer card={{ id: `${setId}-${rar}-M`, set: setId, number: 2, name: `${setId} ${rar}`, rarity: rar, shiny: false }} fxOn={false} onClick={()=>{}} topActive={false} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
