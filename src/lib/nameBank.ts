export const CARD_NAME_WORDS = {
  prefix: [
    'Ion','Phantom','Solar','Nebula','Aether','Vanta','Prism','Echo','Flux','Rune','Cipher','Vector','Quantum','Orbit','Nova','Pulse'
  ],
  core: [
    'Runner','Shard','Beacon','Engine','Glyph','Spire','Hollow','Drifter','Kernel','Circuit','Nimbus','Warden','Pilot','Vessel','Forge','Cipher'
  ],
}

export function makeName(rand: ()=>number){
  const p = CARD_NAME_WORDS.prefix
  const c = CARD_NAME_WORDS.core
  const a = p[Math.floor(rand()*p.length)]
  const b = c[Math.floor(rand()*c.length)]
  return `${a} ${b}`
}
