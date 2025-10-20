import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { useInventory } from '@/lib/store'
import type { Rarity } from '@/lib/types'
import { rarityMap } from '@/lib/rarity'
import { ProgrammaticCard } from '@/components/card/ProgrammaticCard'
import { CardRenderer } from '@/components/card/CardRenderer'
import { getRarityIcon } from '@/components/icons/RarityIcons'

type SortKey = 'newest' | 'rarity' | 'set' | 'number'

export function InventoryView(){
  const inv = useInventory()
  const [rarity, setRarity] = useState<'all'|Rarity>('all')
  const [sortKey, setSortKey] = useState<SortKey>('newest')
  const [q, setQ] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const [setFilter, setSetFilter] = useState<'all'|'BASE'|'APEX'|'NEO'>('all')

  const TILE_W = 180
  const TILE_H = 252
  const GAP = 16
  const ROW_H = TILE_H + GAP
  const [cols, setCols] = useState(1)
  const [totalHeight, setTotalHeight] = useState(0)
  const [range, setRange] = useState({ start: 0, end: 0 })
  const [xOffset, setXOffset] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const rank = (r: Rarity) => ({ D1:1,D2:2,D3:3,D4:4,D5:5,S1:6,S2:7,S3:8,S4:9,CROWN:10 } as const)[r]

  const counts = useMemo(()=>{
    const m = new Map<string, number>()
    for(const c of inv.cards){ m.set(c.id, (m.get(c.id)||0)+1) }
    return m
  }, [inv.cards])

  useEffect(()=>{
    try{
      const raw = localStorage.getItem('inv_filters')
      if(raw){ const s = JSON.parse(raw); if(s.rarity) setRarity(s.rarity); if(s.sortKey) setSortKey(s.sortKey); if(typeof s.q==='string') setQ(s.q); if(s.setFilter) setSetFilter(s.setFilter) }
    }catch{}
  }, [])
  useEffect(()=>{
    try{ localStorage.setItem('inv_filters', JSON.stringify({ rarity, sortKey, q, setFilter })) }catch{}
  }, [rarity, sortKey, q, setFilter])

  const filteredSorted = useMemo(()=> {
    let list = inv.cards
    if(rarity!=='all') list = list.filter(c=>c.rarity===rarity)
    if(setFilter!=='all') list = list.filter(c=> c.set === setFilter)
    if(q.trim()){
      const s = q.toLowerCase()
      list = list.filter(c=> c.name.toLowerCase().includes(s) || String(c.id).toLowerCase().includes(s))
    }
    const arr = [...list]
    arr.sort((a,b)=>{
      switch(sortKey){
        case 'newest': return inv.cards.indexOf(b) - inv.cards.indexOf(a) // latest first
        case 'rarity': return rank(b.rarity) - rank(a.rarity)
        case 'set': return a.set.localeCompare(b.set)
        case 'number': return a.number - b.number
      }
    })
    return arr
  }, [inv.cards, rarity, sortKey, q, setFilter])

  useEffect(()=>{
    if(selectedIndex===null) return
    const onKey = (e: KeyboardEvent) => {
      if(e.key==='Escape'){ setSelectedIndex(null) }
      if(e.key==='ArrowLeft'){ setSelectedIndex(i=> i===null? i : Math.max(0, i-1)) }
      if(e.key==='ArrowRight'){ setSelectedIndex(i=> i===null? i : Math.min(filteredSorted.length-1, i+1)) }
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  }, [selectedIndex, filteredSorted.length])

  const recalc = useCallback(()=>{
    const el = containerRef.current
    if(!el){ return }
    const w = el.clientWidth
    const nextCols = Math.max(1, Math.floor((w + GAP) / (TILE_W + GAP)))
    const totalRows = Math.ceil((filteredSorted.length || 0) / nextCols)
    const nextTotalHeight = totalRows > 0 ? totalRows * ROW_H - GAP : 0
    const usedWidth = Math.max(0, nextCols * (TILE_W + GAP) - GAP)
    const nextXOffset = Math.max(0, (w - usedWidth) / 2)

    const rect = el.getBoundingClientRect()
    const containerTop = window.scrollY + rect.top
    const scrollTop = Math.max(0, window.scrollY - containerTop)
    const vh = window.innerHeight || 0
    const overscan = 2
    const startRow = Math.max(0, Math.floor(scrollTop / ROW_H) - overscan)
    const endRow = Math.min(Math.max(0, totalRows - 1), Math.floor((scrollTop + vh) / ROW_H) + overscan)
    const start = Math.min(filteredSorted.length, startRow * nextCols)
    const end = Math.min(filteredSorted.length, (endRow + 1) * nextCols)

    setCols(nextCols)
    setTotalHeight(nextTotalHeight)
    setRange({ start, end })
    setXOffset(nextXOffset)
  }, [filteredSorted.length])

  useEffect(()=>{ recalc() }, [recalc])
  useEffect(()=>{
    const on = () => recalc()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return ()=>{
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [recalc])

  const totalUnique = new Set(inv.cards.map(c=>c.id)).size
  const totalPossible = inv.setMeta.totalUnique

  const R = rarityMap()

  return (
    <div className="px-6 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with title and stats */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Card Collection</h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="opacity-70">Total Cards:</span>
              <span className="font-semibold text-lg">{inv.cards.length}</span>
            </div>
            <div className="h-4 w-px bg-neutral-700"/>
            <div className="flex items-center gap-2">
              <span className="opacity-70">Unique:</span>
              <span className="font-semibold text-lg">{totalUnique}<span className="opacity-50">/{totalPossible}</span></span>
            </div>
            <div className="h-4 w-px bg-neutral-700"/>
            <div className="flex items-center gap-2">
              <span className="opacity-70">Completion:</span>
              <span className="font-semibold text-lg">{Math.round((totalUnique/totalPossible)*100)}%</span>
            </div>
          </div>
        </div>

        {/* Filter bar with premium styling */}
        <div className="mb-6 p-4 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 shadow-xl">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Rarity filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium opacity-60 uppercase tracking-wider">Rarity</label>
              <select className="bg-neutral-800/80 backdrop-blur border border-neutral-700/50 px-3 py-2 rounded-lg text-sm hover:bg-neutral-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-600" value={rarity} onChange={e=>setRarity(e.target.value as any)}>
                <option value="all">All Rarities</option>
                <option value="D1">Common</option>
                <option value="D2">Uncommon</option>
                <option value="D3">Rare</option>
                <option value="D4">Double Rare</option>
                <option value="D5">Elite Rare</option>
                <option value="S1">Illustration Rare</option>
                <option value="S2">Special Illustration</option>
                <option value="S3">Mythic/EX</option>
                <option value="S4">Hyper Rare</option>
                <option value="CROWN">Crown Rare</option>
              </select>
            </div>

            {/* Set filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium opacity-60 uppercase tracking-wider">Expansion</label>
              <select className="bg-neutral-800/80 backdrop-blur border border-neutral-700/50 px-3 py-2 rounded-lg text-sm hover:bg-neutral-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-600" value={setFilter} onChange={e=> setSetFilter(e.target.value as any)}>
                <option value="all">All Sets</option>
                <option value="BASE">BASE - Classic</option>
                <option value="APEX">APEX - Cosmic</option>
                <option value="NEO">NEO - Speed</option>
              </select>
            </div>

            {/* Sort filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium opacity-60 uppercase tracking-wider">Sort By</label>
              <select className="bg-neutral-800/80 backdrop-blur border border-neutral-700/50 px-3 py-2 rounded-lg text-sm hover:bg-neutral-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-600" value={sortKey} onChange={e=>setSortKey(e.target.value as SortKey)}>
                <option value="newest">Newest First</option>
                <option value="rarity">Rarity (High to Low)</option>
                <option value="set">Set (A-Z)</option>
                <option value="number">Card Number</option>
              </select>
            </div>

            {/* Search input */}
            <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
              <label className="text-xs font-medium opacity-60 uppercase tracking-wider">Search</label>
              <input 
                className="w-full bg-neutral-800/80 backdrop-blur border border-neutral-700/50 px-3 py-2 rounded-lg text-sm hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-600" 
                placeholder="Card name or ID..." 
                value={q} 
                onChange={e=>setQ(e.target.value)} 
              />
            </div>
          </div>
        </div>
        {/* Results count */}
        <div className="mb-4 text-sm opacity-70">
          Showing <span className="font-semibold text-white">{filteredSorted.length}</span> card{filteredSorted.length !== 1 ? 's' : ''}
        </div>

        {filteredSorted.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-6xl mb-4 opacity-20">📦</div>
            <div className="text-lg opacity-70">No cards match your filters</div>
            <div className="text-sm opacity-50 mt-2">Try adjusting your search criteria</div>
          </div>
        ) : (
          <div ref={containerRef} className="relative w-full mt-2" style={{ height: totalHeight }}>
            {filteredSorted.slice(range.start, range.end).map((c, i) => {
              const index = range.start + i
              const row = Math.floor(index / cols)
              const col = index % cols
              const left = xOffset + col * (TILE_W + GAP)
              const top = row * ROW_H
              return (
                <div key={`${c.id}-${index}`} className="absolute" style={{ width: TILE_W, height: TILE_H, left, top }}>
                  <div className="relative w-[180px] h-[252px]">
                    <div className="scale-[.90] origin-top-left">
                      <ProgrammaticCard card={c} onClick={()=> setSelectedIndex(index)} topActive={false} fxOn={false} />
                    </div>
                    {(counts.get(c.id)||0) > 1 ? (
                      <div className="absolute top-1 right-1 text-[11px] bg-black/60 text-white px-1.5 py-0.5 rounded">×{counts.get(c.id)}</div>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {selectedIndex!==null && filteredSorted[selectedIndex] ? (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Card Preview">
            <div className="absolute inset-0 bg-black/70 backdrop-blur" onClick={()=> setSelectedIndex(null)} />
            <div className="relative max-w-3xl mx-auto mt-20 rounded-xl border border-neutral-800 bg-neutral-900 p-6 modal-panel">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="relative" style={{ width: 240, aspectRatio: '63/88' }}>
                  <CardRenderer card={filteredSorted[selectedIndex]} fxOn={true} onClick={()=>{}} topActive={true} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xl font-semibold break-words">{filteredSorted[selectedIndex].name}</div>
                  <div className="mt-1 text-sm opacity-80">{filteredSorted[selectedIndex].set} • #{filteredSorted[selectedIndex].number}</div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="badge inline-flex items-center gap-1.5">
                      {getRarityIcon(filteredSorted[selectedIndex].rarity as Rarity, { size: 14 })}
                      <span>{R[filteredSorted[selectedIndex].rarity as Rarity]?.label || filteredSorted[selectedIndex].rarity}</span>
                    </span>
                    {(counts.get(filteredSorted[selectedIndex].id)||0) > 1 ? (
                      <span className="badge">×{counts.get(filteredSorted[selectedIndex].id)} duplicates</span>
                    ) : <span className="badge">Unique</span>}
                    {filteredSorted[selectedIndex].shiny ? <span className="badge">Shiny ✨</span> : null}
                  </div>
                  <div className="mt-6 flex items-center gap-2">
                    <button className="capsule-btn" onClick={()=> setSelectedIndex(i=> i===null? i : Math.max(0, i-1))} aria-label="Previous">‹</button>
                    <button className="capsule-btn" onClick={()=> setSelectedIndex(i=> i===null? i : Math.min(filteredSorted.length-1, i+1))} aria-label="Next">›</button>
                    <div className="ml-auto" />
                    <button className="capsule-btn" onClick={()=> setSelectedIndex(null)}>Close</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
