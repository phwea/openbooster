export type Rarity = 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'S1' | 'S2' | 'S3' | 'S4' | 'CROWN'

export type Card = {
  id: string
  set: string
  number: number
  name: string
  rarity: Rarity
  shiny?: boolean
}

export type SetConfig = {
  id: string
  name: string
  code: string
  cards: Card[]
}
