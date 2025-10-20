import { SetConfig, Rarity, Card } from '@/lib/types'
import { rarityRegistry } from './rarity'

type RNG = () => number

function mulberry32(seed: number): RNG {
  let t = seed >>> 0
  return function() {
    t += 0x6D2B79F5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export type PackOptions = {
  packSize?: number
  seed?: string
  weights?: Partial<Record<Rarity, number>>
  noDupes?: boolean
}

export function weightedSample<T>(items: { item: T; weight: number }[], rnd: RNG = Math.random): T {
  const total = items.reduce((a,b)=>a+b.weight, 0)
  let r = rnd() * total
  for(const {item, weight} of items){
    if((r-=weight) <= 0) return item
  }
  return items[items.length-1].item
}

const defaultWeights: Record<Rarity, number> = (()=>{
  const out: Partial<Record<Rarity, number>> = {}
  for(const r of rarityRegistry.rarities){ out[r.id as Rarity] = r.weight }
  return out as Record<Rarity, number>
})()

export function sampleRarity(_set: SetConfig, rng: RNG = Math.random, weights?: Partial<Record<Rarity, number>>): Rarity {
  const w = { ...defaultWeights, ...(weights||{}) } as Record<Rarity, number>
  const entries = (Object.keys(w) as Rarity[]).map(r=>({ item: r, weight: w[r] as number }))
  return weightedSample<Rarity>(entries, rng)
}

function pickRandom<T>(arr: T[], rnd: RNG): T {
  return arr[Math.floor(rnd()*arr.length)]
}

export function samplePack(set: SetConfig, opts: PackOptions = {}): Card[] {
  const { packSize = 10, seed, weights, noDupes = true } = opts
  const rng = seed ? mulberry32(hashString(seed)) : Math.random
  const used = new Set<string>()
  const pulls: Card[] = []

  for(let i=0;i<packSize;i++){
    const r = sampleRarity(set, rng as RNG, weights)
    const all: Card[] = set.cards as Card[]
    let pool: Card[] = all.filter((c)=>c.rarity===r)
    if(noDupes){ pool = pool.filter(c=>!used.has(c.id)) }
    if(pool.length === 0){
      // fallback if pool exhausted or smaller than pack size
      pool = all.filter((c)=>c.rarity===r)
    }
    const base: Card = pickRandom<Card>(pool, rng as RNG)
    used.add(base.id)
    pulls.push(applyShiny(base, rng as RNG))
  }
  return pulls
}

function applyShiny(card: Card, rng: RNG = Math.random): Card {
  const eligible = card.rarity !== 'CROWN'
  const shinyChance = rarityRegistry.overlay.chance
  const shiny = eligible && (rng() < shinyChance)
  // return a cloned object so inventory can track shiny pulls distinctly if desired
  return shiny ? { ...card, shiny: true } : { ...card, shiny: false }
}

function hashString(s: string): number {
  let h = 2166136261 >>> 0
  for(let i=0;i<s.length;i++){
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function seeded(seed: string): RNG {
  return mulberry32(hashString(seed))
}
