import { Card, SetConfig, Rarity } from '@/lib/types'

function generateSet(prefix: string, code: string, size: number): Card[] {
  // Ensure each rarity has at least a handful of entries so RNG pools never empty
  const rarities: Rarity[] = ['D1','D2','D3','D4','D5','S1','S2','S3','S4','CROWN']
  const buckets: Record<Rarity, number> = {
    D1: Math.max(1, Math.floor(size*0.66)),
    D2: Math.max(1, Math.floor(size*0.18)),
    D3: Math.max(1, Math.floor(size*0.07)),
    D4: Math.max(1, Math.floor(size*0.03)),
    D5: Math.max(1, Math.floor(size*0.015)),
    S1: Math.max(1, Math.floor(size*0.012)),
    S2: Math.max(1, Math.floor(size*0.006)),
    S3: Math.max(1, Math.floor(size*0.003)),
    S4: Math.max(1, Math.floor(size*0.0015)),
    CROWN: 1,
  }
  // Adjust counts to exactly match size
  let total = Object.values(buckets).reduce((a,b)=>a+b,0)
  while(total > size){ buckets.D1--; total-- }
  while(total < size){ buckets.D1++; total++ }

  const cards: Card[] = []
  let num = 1
  for(const r of rarities){
    const count = buckets[r]
    for(let i=0;i<count;i++){
      cards.push({
        id: `${prefix}-${num}`,
        set: code,
        number: num,
        name: `${code} Card ${num}`,
        rarity: r,
      })
      num++
    }
  }
  return cards
}

const baseCards: Card[] = generateSet('base','BASE',150)
const apexCards: Card[] = generateSet('apex','APEX',160)
const neoCards: Card[] = generateSet('neo','NEO',130)

export const SETS: SetConfig[] = [
  { id: 'base', name: 'Base Set', code: 'BASE', cards: baseCards },
  { id: 'apex', name: 'Galactic Apex', code: 'APEX', cards: apexCards },
  { id: 'neo', name: 'Neo Flash', code: 'NEO', cards: neoCards },
]

export function getSetById(id: string): SetConfig {
  return SETS.find(s=>s.id===id) || SETS[0]
}
