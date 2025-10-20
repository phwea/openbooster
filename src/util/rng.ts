export type RNG = () => number;

export function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seeded(seed: string | number): RNG {
  const n = typeof seed === 'number' ? seed : hashString(String(seed));
  let t = n >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function weightedPick<T extends string | number>(weights: Record<T, number>, rng: RNG): T {
  const entries = Object.entries(weights) as Array<[T, number]>;
  const total = entries.reduce((a, [, w]) => a + (w || 0), 0);
  let r = rng() * total;
  for (const [key, w] of entries) {
    if ((r -= w) <= 0) return key;
  }
  return entries[entries.length - 1][0];
}
