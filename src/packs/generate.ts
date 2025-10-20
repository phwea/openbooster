import { SETS, type RarityId } from '@/sets/registry'
import { seeded, weightedPick, hashString } from '@/util/rng'

function rankOf(r: RarityId): number {
  const order: RarityId[] = ["1D","2D","3D","4D","5D","1S","2S","3S","4S","CR"]
  return order.indexOf(r)
}

function mapRarityIdToOld(r: RarityId): 'D1'|'D2'|'D3'|'D4'|'D5'|'S1'|'S2'|'S3'|'S4'|'CROWN' {
  switch(r){
    case '1D': return 'D1'; case '2D': return 'D2'; case '3D': return 'D3'; case '4D': return 'D4'; case '5D': return 'D5'
    case '1S': return 'S1'; case '2S': return 'S2'; case '3S': return 'S3'; case '4S': return 'S4'; case 'CR': return 'CROWN'
  }
}

function rollRarity(weights: Record<RarityId, number>, rng: () => number, min?: RarityId): RarityId {
  if(min){
    // filter to keys >= min in tier order
    const allowed = Object.fromEntries(Object.entries(weights).filter(([k])=> rankOf(k as RarityId) >= rankOf(min))) as Record<RarityId, number>
    return weightedPick<RarityId>(allowed, rng)
  }
  return weightedPick<RarityId>(weights, rng)
}

function parseNumberFromCid(cid: string): number {
  const m = cid.match(/-(\d+)$/)
  return m ? parseInt(m[1],10) : 0
}

export function buildPack(setId: string){
  const def = SETS[setId]
  if(!def) throw new Error(`Unknown set: ${setId}`)
  const packId = (globalThis.crypto && 'randomUUID' in globalThis.crypto) ? crypto.randomUUID() : `${Date.now()}-${Math.floor(Math.random()*1e6)}`
  const rng = seeded(packId)

  const chosen = new Set<string>()
  const cards: any[] = []

  for(let slot=1; slot<=def.slotRules.packSize; slot++){
    const forceMin = slot === def.slotRules.minRarityAt ? '3D' as RarityId : undefined
    let rarity = rollRarity(def.rarityWeights, rng, forceMin)

    let pool = def.pool.filter(c=> c.rarity===rarity && !chosen.has(c.cid))
    if(pool.length === 0 && forceMin){
      // relax once: try any allowed rarity >= min
      const allowed = (Object.keys(def.rarityWeights) as RarityId[]).filter(r=> rankOf(r) >= rankOf(forceMin))
      for(const rr of allowed){
        pool = def.pool.filter(c=> c.rarity===rr && !chosen.has(c.cid))
        if(pool.length) { rarity = rr; break }
      }
    }
    if(pool.length === 0){
      // final fallback: any rarity
      pool = def.pool.filter(c=> !chosen.has(c.cid))
    }
    const idx = Math.floor(rng()*pool.length)
    const base = pool[idx]
    if(!base) continue

    chosen.add(base.cid)
    const number = parseNumberFromCid(base.cid)
    cards.push({
      id: `${packId}-${slot}`,
      packId,
      setId,
      cid: base.cid,
      name: base.name,
      rarityId: base.rarity,
      index: slot,
      seed: base.artSeed ?? hashString(`${base.cid}:${packId}`),
      shiny: rng() < 0.02,
      number,
    })
  }

  return { id: packId, setId, cards }
}

export function toUiCard(c: ReturnType<typeof buildPack>['cards'][number]){
  return {
    id: c.cid,
    set: c.setId,
    number: c.number,
    name: c.name,
    rarity: mapRarityIdToOld(c.rarityId),
    shiny: c.shiny,
  }
}
