# Booster Box Opening

High-end Pokémon-style booster pack opening simulator. Pure RNG; no pity.

## Scripts
- dev: Vite dev server
- build: production build
- preview: preview build

## Setup
1. Install Node 18+.
2. Install deps:
```
npm install
```
3. Run:
```
npm run dev
```

## Assets
Place audio in `src/sfx/`:
- pack-tear.mp3
- shuffle.mp3
- flip.mp3
- rare-sting.mp3

## Notes
- Rarity odds: common baseline; rare ~1/10, ultra ~1/200, secret ~1/500. No guarantees.
- Last two cards flagged with `suspense` visuals and sting on reveal.
- Inventory persisted locally via `zustand` storage.
