import { rarityMap } from '@/lib/rarity'
import type { Rarity } from '@/lib/types'
import { renderToStaticMarkup } from 'react-dom/server'
import { CardArt, seedFromId } from '@/lib/cardArt'

function clamp(n:number, a:number, b:number){ return Math.max(a, Math.min(b, n)) }
function truncate(s:string, max:number){ return s.length>max ? s.slice(0, max-1) + '…' : s }

export type ThemeName = 'classic'|'cosmic'|'speed'|undefined

export function makeFrontTexture(card: { id:string; name:string; set:string; number:number; rarity:Rarity }, theme: ThemeName, opts?: { maxSize?: number }){
  const maxSize = opts?.maxSize ?? (isDesktop()? 1024 : 512)
  const ratio = 252/180
  const w = maxSize
  const h = Math.round(maxSize*ratio)
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const ctx = c.getContext('2d')!
  // fully transparent outside the rounded-rect mask
  ctx.clearRect(0,0,w,h)
  // theme wash
  const meta = rarityMap()[card.rarity]
  const border = meta?.border || '#9aa1a9'
  const color = meta?.text || '#e6edf3'
  const pad = Math.round(10*(w/180))
  const rx = Math.round(12*(w/180))

  // background motif (deterministic by set|id|rarity)
  const seed = stringHash(`${card.set}|${card.id}|${card.rarity}`)
  const rand = mulberry32(seed)

  // Clip to rounded-rect to guarantee crisp corners
  ctx.save()
  roundRect(ctx, pad, pad, w-pad*2, h-pad*2, Math.round(10*(w/180)))
  ctx.clip()
  // ===== CardSkin Dark Mode: background base
  ctx.fillStyle = '#0b0d10'; ctx.fillRect(pad, pad, w-pad*2, h-pad*2)

  // Rarity border color, width, and background
  const borderColor = ((): string=>{
    switch(card.rarity as Rarity){
      case 'D1': return '#3A4450'
      case 'D2': return '#4A9B62'
      case 'D3': return '#5B8FD9'
      case 'D4': return '#A855F7'
      case 'D5': return '#EC4899'
      case 'S1': return '#F59E0B'
      case 'S2': return '#06B6D4'
      case 'S3': return '#F43F5E'
      case 'S4': return '#8B5CF6'
      case 'CROWN': return '#FCD34D'
    }
  })()
  const borderWidth = ((): number=>{
    switch(card.rarity as Rarity){
      case 'D1': case 'D2': return 1
      case 'D3': case 'D4': case 'D5': return 2
      case 'S1': case 'S2': case 'S3': return 3
      case 'S4': case 'CROWN': return 4
    }
  })()
  const bgColor = ((): string=>{
    switch(card.rarity as Rarity){
      case 'D1': case 'D2': case 'S1': case 'S2': return '#0B0D0F'
      case 'D3': return '#0F1218'
      case 'D4': return '#11101A'
      case 'D5': return '#1A0F1A'
      case 'S3': return '#1A0A14'
      case 'S4': return '#14101C'
      case 'CROWN': return '#1A1410'
    }
  })()
  const isFullArt = card.rarity === 'S1' || card.rarity === 'S2'

  // ===== Dark-mode frame (radial gradient) with rarity border
  const frameGrad = ctx.createRadialGradient(w/2, 0, 0, w/2, h, h)
  frameGrad.addColorStop(0, bgColor); frameGrad.addColorStop(1, '#0B0D0F')
  roundRect(ctx, pad, pad, w-pad*2, h-pad*2, Math.round(12*(w/180)))
  ctx.fillStyle = frameGrad; ctx.fill()
  
  ctx.strokeStyle = borderColor; ctx.lineWidth = Math.max(1, Math.round(borderWidth*(w/180)))
  roundRect(ctx, pad, pad, w-pad*2, h-pad*2, Math.round(12*(w/180))); ctx.stroke()
  
  // inner subtle highlight stroke
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1
  roundRect(ctx, pad+borderWidth+1, pad+borderWidth+1, w-pad*2-borderWidth*2-2, h-pad*2-borderWidth*2-2, Math.round(10*(w/180))); ctx.stroke()

  // ===== Inner content area
  const inset = pad + Math.round(10*(w/180))
  const innerX = inset, innerY = inset, innerW = w - inset*2, innerH = h - inset*2

  // Full-art background for S1/S2
  if(isFullArt){
    ctx.save()
    roundRect(ctx, innerX, innerY, innerW, innerH, Math.round(10*(w/180)))
    ctx.clip()
    // Draw full-bleed procedural art
    const wash = ctx.createRadialGradient(innerX+innerW/2, innerY+innerH*0.42, 0, innerX+innerW/2, innerY+innerH*0.42, Math.max(innerW,innerH))
    wash.addColorStop(0, 'rgba(255,255,255,0.12)'); wash.addColorStop(1, 'rgba(255,255,255,0.00)')
    ctx.fillStyle = wash; ctx.fillRect(innerX, innerY, innerW, innerH)
    if(theme==='cosmic'){
      ctx.strokeStyle = 'rgba(180,200,255,0.12)'; ctx.lineWidth = Math.max(1, Math.round(w*0.003))
      for(let i=1;i<=3;i++){ ctx.beginPath(); ctx.arc(innerX+innerW/2, innerY+innerH*0.42, i*innerW*0.22, 0, Math.PI*2); ctx.stroke() }
      for(let i=0;i<5;i++){
        const rr = (Math.min(innerW,innerH) * (0.15 + rand()*0.20))
        const ox = (rand()-0.5) * innerW*0.6
        const oy = (rand()-0.3) * innerH*0.5
        const gx = ctx.createRadialGradient(innerX+innerW/2+ox, innerY+innerH*0.42+oy, 0, innerX+innerW/2+ox, innerY+innerH*0.42+oy, rr)
        gx.addColorStop(0.0, card.rarity==='S1'? 'rgba(245,158,11,0.18)' : 'rgba(6,182,212,0.18)')
        gx.addColorStop(1.0, 'rgba(0,0,0,0)')
        ctx.fillStyle = gx; ctx.fillRect(innerX, innerY, innerW, innerH)
      }
    } else if(theme==='speed'){
      ctx.fillStyle = card.rarity==='S1'? 'rgba(245,158,11,0.15)' : 'rgba(6,182,212,0.15)'
      const rails = 5
      for(let i=0;i<rails;i++){
        const yy = innerY + Math.round(innerH*0.15) + i*Math.round(innerH*0.12)
        ctx.fillRect(innerX+10, yy, innerW-20, Math.max(2, Math.round(h*0.012)))
      }
    }
    // Dark gradient overlay for text legibility
    const overlayGrad = ctx.createLinearGradient(0, innerY, 0, innerY+innerH)
    overlayGrad.addColorStop(0, 'rgba(11,13,15,0)'); overlayGrad.addColorStop(0.5, 'rgba(11,13,15,0.3)'); overlayGrad.addColorStop(1, 'rgba(11,13,15,0.85)')
    ctx.fillStyle = overlayGrad; ctx.fillRect(innerX, innerY, innerW, innerH)
    ctx.restore()
  }

  // Header band (dark mode)
  const headerH = Math.round(innerH * 0.17)
  const headerGrad = ctx.createLinearGradient(0, innerY, 0, innerY+headerH)
  if(isFullArt){
    headerGrad.addColorStop(0, 'rgba(0,0,0,0.6)'); headerGrad.addColorStop(1, 'rgba(0,0,0,0.4)')
  } else {
    headerGrad.addColorStop(0, 'rgba(255,255,255,0.08)'); headerGrad.addColorStop(1, 'rgba(255,255,255,0.04)')
  }
  roundRect(ctx, innerX, innerY, innerW, headerH, Math.round(8*(w/180)))
  ctx.fillStyle = headerGrad; ctx.fill()
  // Title text (light)
  ctx.fillStyle = '#E6EAEE'
  ctx.font = `${Math.round(w*0.075)}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
  ctx.textBaseline = 'middle'
  ctx.fillText(truncate(card.name, 20), innerX+Math.round(8*(w/180)), innerY + Math.round(headerH/2))
  // Set tag pill
  const tag = String(card.set).toUpperCase()
  const tagW = Math.ceil(ctx.measureText(tag).width)
  const tagPadX = Math.round(w*0.030), tagPadY = Math.round(w*0.016)
  const tagH = Math.round(w*0.075) + tagPadY*0.2
  const tagX = innerX + innerW - tagW - tagPadX*2 - Math.round(8*(w/180))
  const tagY = innerY + Math.round((headerH-tagH)/2)
  drawRoundRect(ctx, tagX, tagY, tagW + tagPadX*2, tagH, Math.round(tagH/2), 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0.08)')
  ctx.fillStyle = '#A9B0B8'; ctx.font = `${Math.round(w*0.060)}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
  ctx.textBaseline = 'middle'
  ctx.fillText(tag, tagX + tagPadX, tagY + Math.round(tagH/2))

  // Art window (skip for full-art)
  if(!isFullArt){
    const artMargin = Math.round(8*(w/180))
    const artX = innerX
    const artY = innerY + headerH + artMargin
    const artW = innerW
    const artH = Math.round(innerH * 0.40)
    ctx.save()
    roundRect(ctx, artX, artY, artW, artH, Math.round(8*(w/180)))
    ctx.clip()
    // Seeded fallback art: quiet bokeh/rails (dark mode subtle)
    // Contained art window - scale down to 90% to fit better
    const containMargin = Math.round(artW * 0.05)
    const containX = artX + containMargin
    const containY = artY + containMargin
    const containW = artW - containMargin*2
    const containH = artH - containMargin*2
    // base wash
    const wash = ctx.createRadialGradient(containX+containW/2, containY+containH*0.42, 0, containX+containW/2, containY+containH*0.42, Math.max(containW,containH))
    wash.addColorStop(0, 'rgba(255,255,255,0.06)'); wash.addColorStop(1, 'rgba(255,255,255,0.00)')
    ctx.fillStyle = wash; ctx.fillRect(containX, containY, containW, containH)
    if(theme==='cosmic'){
      // sparse orbits + bokeh (muted for dark mode)
      ctx.strokeStyle = 'rgba(180,200,255,0.08)'; ctx.lineWidth = Math.max(1, Math.round(w*0.002))
      for(let i=1;i<=2;i++){ ctx.beginPath(); ctx.arc(containX+containW/2, containY+containH*0.42, i*containW*0.22, 0, Math.PI*2); ctx.stroke() }
      for(let i=0;i<3;i++){
        const rr = (Math.min(containW,containH) * (0.18 + rand()*0.22))
        const ox = (rand()-0.5) * containW*0.35
        const oy = (rand()-0.3) * containH*0.35
        const gx = ctx.createRadialGradient(containX+containW/2+ox, containY+containH*0.42+oy, 0, containX+containW/2+ox, containY+containH*0.42+oy, rr)
        gx.addColorStop(0.0, 'rgba(180,200,255,0.08)'); gx.addColorStop(1.0, 'rgba(180,200,255,0.00)') 
        ctx.fillStyle = gx; ctx.fillRect(containX, containY, containW, containH)
      }
    } else if(theme==='speed'){
      ctx.fillStyle = 'rgba(255,255,255,0.12)'
      const rails = 3
      for(let i=0;i<rails;i++){
        const yy = containY + Math.round(containH*0.18) + i*Math.round(containH*0.14)
        ctx.fillRect(containX+10, yy, containW-20, Math.max(2, Math.round(h*0.012)))
      }
    }
    ctx.restore()
  }

  // Info panel (dark mode deep neutral) - skip for full-art
  if(!isFullArt){
    const artMargin = Math.round(8*(w/180))
    const artY = innerY + headerH + artMargin
    const artH = Math.round(innerH * 0.40)
    const infoY = artY + artH + artMargin
    const infoH = Math.round(innerH * 0.22)
    roundRect(ctx, innerX, infoY, innerW, infoH, Math.round(8*(w/180)))
    ctx.fillStyle = '#161A20'; ctx.fill()
    // Grain
    ctx.save(); ctx.globalAlpha = 0.06
    ctx.fillStyle = noisePattern(w,h)
    try{ ctx.fillRect(innerX, infoY, innerW, infoH) }catch{}
    ctx.restore()
    // Placeholder rules text lines (light on dark)
    ctx.fillStyle = 'rgba(255,255,255,0.10)'
    const lh = Math.round(w*0.07)
    const tx = innerX + Math.round(10*(w/180))
    let ty = infoY + Math.round(lh*0.8)
    const tw = innerW - Math.round(20*(w/180))
    for(let i=0;i<2;i++){ ctx.fillRect(tx, ty, tw, Math.round(lh*0.55)); ty += Math.round(lh*0.8) }
    ctx.fillRect(tx, ty, Math.round(tw*0.6), Math.round(lh*0.55))
  }

  // Footer bar
  const artMargin = Math.round(8*(w/180))
  let footerY: number
  if(isFullArt){
    footerY = innerY + innerH - Math.round(w*0.120)
  } else {
    const artY = innerY + headerH + artMargin
    const artH = Math.round(innerH * 0.40)
    const infoY = artY + artH + artMargin
    const infoH = Math.round(innerH * 0.22)
    footerY = infoY + infoH + artMargin
  }
  const dotColor = borderColor
  // rarity pill (dot + text)
  const pillText = (meta?.symbol || String(card.rarity))
  ctx.font = `${Math.round(w*0.055)}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
  const pW = Math.ceil(ctx.measureText(pillText).width)
  const pPadX = Math.round(w*0.030), pH = Math.round(w*0.080)
  drawRoundRect(ctx, innerX, footerY, pW + pPadX*2 + pH, pH, Math.round(pH/2), 'rgba(255,255,255,0.04)', 'rgba(255,255,255,0.08)')
  // dot
  ctx.fillStyle = dotColor; ctx.beginPath(); ctx.arc(innerX + pPadX + pH*0.35, footerY + pH/2, pH*0.18, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#A9B0B8'; ctx.textBaseline = 'middle'
  ctx.fillText(pillText, innerX + pPadX + pH*0.7, footerY + pH/2)
  // number right
  ctx.fillStyle = '#A9B0B8'
  const numText = `#${card.number}`
  const numW = Math.ceil(ctx.measureText(numText).width)
  ctx.fillText(numText, innerX + innerW - numW, footerY + pH/2)

  // restore clip
  ctx.restore()
  return c
}

export function makeBackTexture(setId: string, opts?: { maxSize?: number }){
  const maxSize = opts?.maxSize ?? (isDesktop()? 1024 : 512)
  const ratio = 252/180
  const w = maxSize
  const h = Math.round(maxSize*ratio)
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#0b0b0b'; ctx.fillRect(0,0,w,h)
  const grad = ctx.createLinearGradient(0,0,w,h)
  grad.addColorStop(0, 'rgba(255,255,255,0.06)')
  grad.addColorStop(1, 'rgba(255,255,255,0.00)')
  ctx.fillStyle = grad
  const pad = Math.round(12*(w/180))
  ctx.fillRect(pad, pad, w-pad*2, h-pad*2)
  ctx.font = `${Math.round(w*0.12)}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  const text = setId
  const tw = ctx.measureText(text).width
  ctx.fillText(text, (w-tw)/2, h/2 - Math.round(w*0.06))
  return c
}

function roundRect(ctx:CanvasRenderingContext2D, x:number,y:number,w:number,h:number,r:number){
  const rr = Math.min(r, w/2, h/2)
  ctx.beginPath()
  ctx.moveTo(x+rr, y)
  ctx.arcTo(x+w, y, x+w, y+h, rr)
  ctx.arcTo(x+w, y+h, x, y+h, rr)
  ctx.arcTo(x, y+h, x, y, rr)
  ctx.arcTo(x, y, x+w, y, rr)
  ctx.closePath()
}

function drawRoundRect(ctx:CanvasRenderingContext2D, x:number, y:number, w:number, h:number, r:number, fill:string, stroke:string){
  roundRect(ctx, x, y, w, h, r)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = stroke
  ctx.lineWidth = Math.max(1, Math.round(w*0.004))
  ctx.stroke()
}

function isDesktop(){
  if(typeof navigator==='undefined') return true
  return !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

function stringHash(s:string){ let h=2166136261>>>0; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i); h=Math.imul(h,16777619)} return h>>>0 }
function mulberry32(a:number){ return function(){ var t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, 1 | t); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; } }

// small tiling noise pattern for paper grain
function noisePattern(w:number, h:number){
  const c = document.createElement('canvas'); const s = 64; c.width=s; c.height=s; const g = c.getContext('2d')!
  const id = g.createImageData(s,s); const data = id.data
  for(let i=0;i<s*s;i++){ const v = 230 + Math.floor(Math.random()*10); const o = i*4; data[o]=v; data[o+1]=v; data[o+2]=v; data[o+3]=255 }
  g.putImageData(id,0,0); return g.createPattern(c, 'repeat')!
}

// Render React CardArt (SVG) into the given canvas region so WebGL textures match 2D programmatic cards
export async function applyCardArtToCanvas(canvas: HTMLCanvasElement, card: { id: string; rarity: Rarity; set: string }, theme: ThemeName): Promise<void> {
  try{
    const w = canvas.width
    const h = canvas.height
    const ctx = canvas.getContext('2d')!
    const isFullArt = card.rarity === 'S1' || card.rarity === 'S2'
    const pad = Math.round(10*(w/180))
    const inset = pad + Math.round(10*(w/180))
    const innerX = inset, innerY = inset, innerW = w - inset*2, innerH = h - inset*2

    // Compute art rectangle identical to makeFrontTexture
    let rx = innerX, ry = innerY, rw = innerW, rh = innerH
    if(!isFullArt){
      const headerH = Math.round(innerH * 0.17)
      const artMargin = Math.round(8*(w/180))
      const artX = innerX
      const artY = innerY + headerH + artMargin
      const artW = innerW
      const artH = Math.round(innerH * 0.40)
      // Fill the entire art window
      rx = artX
      ry = artY
      rw = artW
      rh = artH
    }

    const seed = seedFromId(card.id)
    let svgMarkup = renderToStaticMarkup(CardArt({ seed, rarity: card.rarity, theme } as any))
    // Prefer meeting aspect inside the window; do not force width/height here
    svgMarkup = svgMarkup.replace('<svg ', '<svg preserveAspectRatio="xMidYMid meet" ')
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    await new Promise<void>((resolve, reject)=>{
      const img = new Image()
      img.onload = ()=>{
        try{
          ctx.save()
          // clip to rounded rect similar to art window rounding
          roundRect(ctx, rx, ry, rw, rh, Math.round(8*(w/180)))
          ctx.clip()
          const iw = (img as any).naturalWidth || 180
          const ih = (img as any).naturalHeight || 252
          const scale = rw / Math.max(1, iw)
          const dW = rw
          const dH = Math.round(ih * scale)
          const dX = rx
          const dY = ry + Math.round((rh - dH)/2)
          ctx.drawImage(img, dX, dY, dW, dH)
          ctx.restore()
        }finally{
          URL.revokeObjectURL(url)
          resolve()
        }
      }
      img.onerror = ()=>{ URL.revokeObjectURL(url); reject(new Error('SVG load failed')) }
      img.src = url
    })
  }catch{}
}
