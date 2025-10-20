export type RarityId = "1D"|"2D"|"3D"|"4D"|"5D"|"1S"|"2S"|"3S"|"4S"|"CR";

export interface SetDef {
  id: string;
  name: string;
  size: number;
  theme: "classic"|"cosmic"|"speed";
  rarityWeights: Record<RarityId, number>;
  slotRules: {
    packSize: number;
    minRarityAt: number;
    allowReverseHolo: boolean;
  };
  pool: Array<{
    cid: string;
    name: string;
    rarity: RarityId;
    artSeed?: number;
    tags?: string[];
  }>;
}

import { weightedPick, seeded, hashString } from '@/util/rng';
import { makeName } from '@/lib/nameBank';

function pad3(n: number){ return String(n).padStart(3, '0') }

function generatePool(id: string, size: number, weights: Record<RarityId, number>, seedKey: string, pinned: Record<string, { name: string; rarity: RarityId; tags?: string[] }>): SetDef["pool"]{
  const rng = seeded(seedKey)
  const pool: SetDef["pool"] = []
  const used = new Set<string>()
  for(let i=1;i<=size;i++){
    const cid = `${id}-${pad3(i)}`
    if(pinned[cid]){
      const p = pinned[cid]
      pool.push({ cid, name: p.name, rarity: p.rarity, tags: p.tags, artSeed: hashString(`${cid}`) })
      used.add(cid)
      continue
    }
    const rarity = weightedPick<RarityId>(weights, rng)
    const name = makeName(rng)
    pool.push({ cid, name, rarity, artSeed: hashString(`${cid}`) })
  }
  return pool
}

export const SETS: Record<string, SetDef> = ((): Record<string, SetDef> => {
  const BASE: SetDef = {
    id: 'BASE',
    name: 'Base Set',
    size: 150,
    theme: 'classic',
    rarityWeights: { "1D":6200,"2D":2300,"3D":950,"4D":350,"5D":120,"1S":55,"2S":20,"3S":18,"4S":6,"CR":1 },
    slotRules: { packSize: 5, minRarityAt: 5, allowReverseHolo: true },
    pool: [],
  }
  const APEX: SetDef = {
    id: 'APEX',
    name: 'Galactic Apex',
    size: 160,
    theme: 'cosmic',
    rarityWeights: { "1D":5700,"2D":2400,"3D":1100,"4D":420,"5D":180,"1S":80,"2S":42,"3S":28,"4S":12,"CR":3 },
    slotRules: { packSize: 5, minRarityAt: 5, allowReverseHolo: true },
    pool: [],
  }
  const NEO: SetDef = {
    id: 'NEO',
    name: 'Neo Flash',
    size: 130,
    theme: 'speed',
    rarityWeights: { "1D":6000,"2D":2200,"3D":1000,"4D":450,"5D":180,"1S":70,"2S":40,"3S":30,"4S":10,"CR":2 },
    slotRules: { packSize: 5, minRarityAt: 5, allowReverseHolo: true },
    pool: [],
  }

  const basePins: Record<string, { name: string; rarity: RarityId; tags?: string[] }> = {
    'BASE-001': { name: 'Glass Totem', rarity: '1D', tags: ['relic'] },
    'BASE-002': { name: 'Void Beacon', rarity: '2D' },
    'BASE-132': { name: 'Nova Cipher', rarity: '3D' },
  }
  const apexPins: Record<string, { name: string; rarity: RarityId; tags?: string[] }> = {
    'APEX-009': { name: 'Orbit Runner', rarity: '1D', tags: ['engine'] },
    'APEX-145': { name: 'Ion Shard', rarity: '1S' },
    'APEX-155': { name: 'Solar Vessel', rarity: '5D' },
  }
  const neoPins: Record<string, { name: string; rarity: RarityId; tags?: string[] }> = {
    'NEO-017': { name: 'Phase Runner', rarity: '2D' },
    'NEO-121': { name: 'Vector Spire', rarity: '4D' },
  }

  BASE.pool = generatePool(BASE.id, BASE.size, BASE.rarityWeights, 'BASE', basePins)
  APEX.pool = generatePool(APEX.id, APEX.size, APEX.rarityWeights, 'APEX', apexPins)
  NEO.pool = generatePool(NEO.id, NEO.size, NEO.rarityWeights, 'NEO', neoPins)

  return { BASE, APEX, NEO }
})()
