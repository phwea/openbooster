import { useMemo, useState } from 'react'
import clickSfx from '@/sfx/flip.mp3'
import rareSfx from '@/sfx/rare-sting.mp3'
import { Howl } from 'howler'
import { rarityToFx, rarityOverlay, rarityFrameColors, rarityUsesGradientFrame, rgba } from '@/lib/fx'
import { rarityMap } from '@/lib/rarity'
import type { Rarity } from '@/lib/types'
import { CardArt, seedFromId } from '@/lib/cardArt'
import { SETS as REGISTRY } from '@/sets/registry'
import { getRarityIcon } from '@/components/icons/RarityIcons'

export function CardView({ card, revealed, onClick, index, suspense, faceUp, pulse, topActive, stackBackOnly, onSetClick, fxOn = true, minimalFrame = false }: { card: any; revealed: boolean; onClick: ()=>void; index: number; suspense: boolean; faceUp?: boolean; pulse?: boolean; topActive?: boolean; stackBackOnly?: boolean; onSetClick?: (setId: string)=>void; fxOn?: boolean; minimalFrame?: boolean }){
  const [hover, setHover] = useState(false)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const click = useMemo(()=> new Howl({ src:[clickSfx], volume: 0.5 }), [])
  const rare = useMemo(()=> new Howl({ src:[rareSfx], volume: 0.6 }), [])

  const doClick = () => {
    onClick()
    click.play()
    if(card.rarity==='S1' || card.rarity==='S2' || card.rarity==='S3' || card.rarity==='S4' || card.rarity==='CROWN'){
      setTimeout(()=> rare.play(), 120)
    }
  }

  const fx = rarityToFx(card.rarity, !!card.shiny, suspense)
  const overlay = rarityOverlay(card.rarity, !!card.shiny)
  const frame = rarityFrameColors(card.rarity)
  const gradientFrame = rarityUsesGradientFrame(card.rarity)
  const useGradient = minimalFrame ? false : gradientFrame
  const meta = rarityMap()[card.rarity as Rarity]
  const theme = useMemo(()=> REGISTRY[card.set]?.theme as ('classic'|'cosmic'|'speed'|undefined), [card.set])
  const fxClass = (()=>{
    switch(meta?.fx){
      case 'holo_shimmer': return 'fx-holo-shimmer'
      case 'texture_shine': return 'fx-texture-shine'
      case 'foil_streak': return 'fx-foil-streak'
      case 'parallax_glow': return 'fx-parallax-glow'
      case 'scene_shimmer': return 'fx-scene-shimmer'
      case 'aura_pulse': return 'fx-aura-pulse'
      case 'gold_sweep': return 'fx-gold-sweep'
      case 'legendary_reveal': return 'fx-legendary-reveal'
      default: return ''
    }
  })()

  const prefersReduced = useMemo(()=> typeof window!=='undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  return (
    <button
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>{ setHover(false); setTilt({rx:0, ry:0}) }}
      onPointerMove={(e)=>{
        if(prefersReduced) return
        const el = (e.currentTarget as HTMLButtonElement)
        const r = el.getBoundingClientRect()
        const dx = (e.clientX - (r.left + r.width/2)) / r.width
        const dy = (e.clientY - (r.top + r.height/2)) / r.height
        const rx = Math.max(-4, Math.min(4, -dy * 8))
        const ry = Math.max(-6, Math.min(6, dx * 12))
        setTilt({ rx, ry })
      }}
      onPointerLeave={()=> setTilt({rx:0, ry:0})}
      onClick={doClick}
      className={`relative w-[180px] h-[252px] rounded-xl overflow-hidden card-3d ${minimalFrame? '' : (useGradient? 'gradient-border foil-texture' : 'simple-border')} ${fxOn? 'reveal-pop' : ''} ${pulse && fxOn ? 'pulse-once' : ''} ${fxOn && fxClass ? fxClass : ''} ${suspense? 'ring-2 ring-yellow-500/30 pulse-once':''}`}
      style={{ transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) ${hover? ' translateY(-4px)' : ''}`, transformStyle: 'preserve-3d', ['--frame-a' as any]: minimalFrame? 'rgba(255,255,255,0.14)' : frame.a, ['--frame-b' as any]: minimalFrame? '#777' : frame.b }}
    >
      <div className={`inner absolute inset-[2px] rounded-[10px] bg-neutral-900 ${fxOn && card.shiny ? 'shiny-sweep' : ''}`}/>
      {/* Premium depth shadows and borders */}
      <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ 
        boxShadow: minimalFrame 
          ? '0 8px 24px rgba(0,0,0,0.30)' 
          : `0 12px 32px rgba(0,0,0,0.40), 0 0 16px ${rgba(meta?.border || '#888888', 0.15)}` 
      }} />
      <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ 
        border: minimalFrame 
          ? '1px solid rgba(255,255,255,0.12)' 
          : `1px solid ${rgba(meta?.border || '#888888', 0.45)}`,
        boxShadow: minimalFrame ? 'none' : `inset 0 1px 0 ${rgba(meta?.border || '#ffffff', 0.20)}`
      }} />
      {minimalFrame ? null : (
        <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ 
          border: `1.5px solid ${rgba(meta?.border || '#888888', 0.85)}`, 
          background: `linear-gradient(180deg, ${rgba(meta?.border || '#ffffff', 0.10)}, transparent 45%)`,
          boxShadow: `inset 0 0 12px ${rgba(meta?.border || '#000000', 0.12)}`
        }} />
      )}
      <CardArt seed={seedFromId(card.id)} rarity={card.rarity as Rarity} theme={theme} />
      {/* badge (only when revealed) */}
      {true ? (
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1">
          {onSetClick ? (
            <button className="set-pill hover:bg-neutral-800" onClick={(e)=>{ e.stopPropagation(); onSetClick(card.set) }}>{card.set}</button>
          ) : (
            <span className="set-pill">{card.set}</span>
          )}
          <span className="badge" style={{ border: `1px solid ${meta?.border}`, color: meta?.text, background: 'rgba(0,0,0,0.5)' }}>
            {getRarityIcon(card.rarity as Rarity, { size: 16 })}
          </span>
        </div>
      ) : null}
      {/* sheen (static) */}
      {topActive ? <div className="sheen"/> : null}
      {/* rarity overlay (only when revealed) */}
      {fxOn && overlay ? (
        <div className="absolute inset-0 pointer-events-none z-[5]" style={{ background: overlay, mixBlendMode: 'screen', opacity: 0.9 }}/>
      ) : null}
      {fxOn && card.shiny ? (
        <div className="absolute inset-0 pointer-events-none z-[6] starfield-overlay" />
      ) : null}
      {/* states */}
      {!revealed && (
        <div className="absolute inset-0 grid place-items-center z-10">
          <div className="w-[86%] h-[86%] rounded-[10px] bg-neutral-800 relative overflow-hidden">
            <div className="absolute inset-0 foil-texture opacity-60" />
            <div className="absolute inset-0" style={{background: 'linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0) 60%)'}}/>
          </div>
        </div>
      )}
      {true && (
        <div className={`absolute inset-0 p-3 z-10 ${prefersReduced? '' : fxClass}`} style={{ boxShadow: fx.shadow }}>
          <div className="mt-2 text-sm font-semibold flex items-baseline justify-between gap-2">
            <span className="truncate mr-2">{card.name}</span>
            <span className="text-[10px] opacity-70">#{card.number}</span>
          </div>
          {fxOn ? <div className="absolute inset-0 pointer-events-none" style={{ background: fx.glow }}/> : null}
        </div>
      )}
    </button>
  )
}
