import * as THREE from 'three'
import { createBackPlate } from './BackPlate'
import type { Rarity } from '@/lib/types'

export type Theme = 'classic'|'cosmic'|'speed'|undefined

function rarityParams(r: Rarity){
  switch(r){
    case 'D1': return { metalness: 0.02, roughness: 0.85, clearcoat: 0.0, emissive: 0x000000 }
    case 'D2': return { metalness: 0.04, roughness: 0.82, clearcoat: 0.02, emissive: 0x000000 }
    case 'D3': return { metalness: 0.10, roughness: 0.68, clearcoat: 0.04, emissive: 0x101010 }
    case 'D4': return { metalness: 0.16, roughness: 0.62, clearcoat: 0.06, emissive: 0x181818 }
    case 'D5': return { metalness: 0.22, roughness: 0.58, clearcoat: 0.08, emissive: 0x202020 }
    case 'S1': return { metalness: 0.28, roughness: 0.55, clearcoat: 0.12, emissive: 0x242424 }
    case 'S2': return { metalness: 0.34, roughness: 0.50, clearcoat: 0.18, emissive: 0x2a2a2a }
    case 'S3': return { metalness: 0.42, roughness: 0.46, clearcoat: 0.22, emissive: 0x2f2f2f }
    case 'S4': return { metalness: 0.52, roughness: 0.40, clearcoat: 0.28, emissive: 0x353535 }
    case 'CROWN': return { metalness: 0.65, roughness: 0.32, clearcoat: 0.42, emissive: 0x404040 }
  }
}

function makeNeonRim(w: number, h: number, color: number, intensity = 0.22){
  const geo = new THREE.PlaneGeometry(w, h)
  const mat = new THREE.ShaderMaterial({
    transparent:true, depthWrite:false, blending: THREE.AdditiveBlending,
    uniforms:{ uColor:{ value: new THREE.Color(color) }, uIntensity:{ value: intensity } },
    vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader:`precision highp float; varying vec2 vUv; uniform vec3 uColor; uniform float uIntensity;
      float d=min(min(vUv.x,1.0-vUv.x), min(vUv.y,1.0-vUv.y));
      float rim=smoothstep(0.015,0.0,d) * (1.0 - smoothstep(0.028,0.030,d));
      gl_FragColor=vec4(uColor, rim * uIntensity);`
  }) as any
  return new THREE.Mesh(geo, mat) as any
}

function makeBrushedRim(w: number, h: number, color: number, intensity = 0.18){
  const geo = new THREE.PlaneGeometry(w, h)
  const mat = new THREE.ShaderMaterial({
    transparent:true, depthWrite:false,
    uniforms:{ uColor:{ value:new THREE.Color(color) }, uIntensity:{ value: intensity } },
    vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader:`precision highp float; varying vec2 vUv; uniform vec3 uColor; uniform float uIntensity;
      float d=min(min(vUv.x,1.0-vUv.x), min(vUv.y,1.0-vUv.y));
      float band = smoothstep(0.10, 0.02, d) * (1.0 - smoothstep(0.05, 0.03, d));
      float grain = 0.5 + 0.5*sin((vUv.x+vUv.y)*480.0);
      float a = band * (0.6 + 0.4*grain) * uIntensity;
      gl_FragColor=vec4(uColor*0.9, a);`
  }) as any
  return new THREE.Mesh(geo, mat) as any
}

function makeEngravedOverlay(w: number, h: number, theme: Theme, intensity = 0.25){
  const geo = new THREE.PlaneGeometry(w, h)
  const mat = new THREE.ShaderMaterial({
    transparent:true, depthWrite:false, blending: THREE.MultiplyBlending,
    uniforms:{ uIntensity:{ value:intensity } },
    vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader:`precision highp float; varying vec2 vUv; uniform float uIntensity;
      vec2 p = vUv - 0.5; float d = length(p);
      // classic: concentric engraving
      float classic = smoothstep(0.42,0.40,d) + smoothstep(0.30,0.28,d);
      // cosmic: dual orbit engraves at tilted angles
      float ang = atan(p.y, p.x);
      float orbit = smoothstep(0.36,0.35,d) + smoothstep(0.22,0.21,d);
      float star = step(0.98, sin(12.0*ang)*sin(12.0*ang));
      float cosmic = orbit * (0.6 + 0.4*star);
      // speed: diagonal rails engrave
      float rails = step(0.95, fract((p.x*0.8+p.y*1.2)*12.0));
      float speed = rails;
      float pat = ${'classic'};
      float a = clamp(pat * uIntensity, 0.0, 0.6);
      gl_FragColor=vec4(vec3(0.0), a);
    `
  }) as any
  const fs = (mat as any).fragmentShader
  ;(mat as any).fragmentShader = fs.replace("float pat = classic;", `float pat = ${(theme==='cosmic')?'cosmic':(theme==='speed')?'speed':'classic'};`)
  return new THREE.Mesh(geo, mat) as any
}

function makeS1SpecialBorder(w: number, h: number, theme: Theme, accent: number){
  const geo = new THREE.PlaneGeometry(w, h)
  const themeId = theme==='cosmic'? 1 : theme==='speed'? 2 : 0
  const mat = new THREE.ShaderMaterial({
    transparent:true, depthWrite:false, blending: THREE.AdditiveBlending,
    uniforms:{ uAccent:{ value:new THREE.Color(accent) }, uTheme:{ value: themeId } },
    vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader:`precision highp float; varying vec2 vUv; uniform vec3 uAccent; uniform float uTheme;
      float d=min(min(vUv.x,1.0-vUv.x), min(vUv.y,1.0-vUv.y));
      float ring = smoothstep(0.022,0.016,d) * (1.0 - smoothstep(0.028,0.032,d));
      vec3 col = uAccent;
      if(uTheme<0.5){ // classic: rainbow wave
        float hue = fract((atan(vUv.y-0.5, vUv.x-0.5)/6.2831) + 0.6);
        vec3 rgb = clamp(abs(mod(hue*6.0+vec3(0,4,2),6.0)-3.0)-1.0,0.0,1.0);
        col = mix(uAccent, rgb, 0.6);
      } else if(uTheme<1.5){ // cosmic: starlight ring
        float star = step(0.96, fract(sin(dot(vUv, vec2(127.1,311.7)))*43758.5453123));
        col = mix(uAccent, vec3(1.0), star*0.5);
      } else { // speed: neon rails at corners
        float cx = step(0.02, vUv.x) * step(vUv.x, 0.18) + step(0.82, vUv.x) * step(vUv.x, 0.98);
        float cy = step(0.02, vUv.y) * step(vUv.y, 0.18) + step(0.82, vUv.y) * step(vUv.y, 0.98);
        ring *= max(cx, cy);
      }
      gl_FragColor=vec4(col, ring*0.85);
    `
  }) as any
  return new THREE.Mesh(geo, mat) as any
}

function makeEtchLines(w: number, h: number, color: number, intensity = 0.14){
  const geo = new THREE.PlaneGeometry(w, h)
  const mat = new THREE.ShaderMaterial({
    transparent:true, depthWrite:false, blending: THREE.AdditiveBlending,
    uniforms:{ uColor:{ value:new THREE.Color(color) }, uIntensity:{ value:intensity } },
    vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader:`precision highp float; varying vec2 vUv; uniform vec3 uColor; uniform float uIntensity;
      float gx = step(0.5, fract(vUv.x*24.0)); float gy = step(0.5, fract(vUv.y*20.0));
      float grid = (gx*0.6 + gy*0.4);
      float edge = 1.0 - smoothstep(0.0, 0.02, min(min(vUv.x,1.0-vUv.x), min(vUv.y,1.0-vUv.y)));
      float a = grid * edge * uIntensity;
      gl_FragColor=vec4(uColor, a);
    `
  }) as any
  return new THREE.Mesh(geo, mat) as any
}

function makeSeamLine(w: number, h: number, color: number, intensity = 0.22){
  const geo = new THREE.PlaneGeometry(w, h)
  const mat = new THREE.ShaderMaterial({
    transparent:true, depthWrite:false, blending: THREE.AdditiveBlending,
    uniforms:{ uColor:{ value:new THREE.Color(color) }, uIntensity:{ value:intensity } },
    vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader:`precision highp float; varying vec2 vUv; uniform vec3 uColor; uniform float uIntensity;
      float centerX = 1.0 - smoothstep(0.496, 0.504, abs(vUv.x-0.5));
      float centerY = 1.0 - smoothstep(0.492, 0.508, abs(vUv.y-0.5));
      float a = max(centerX, centerY) * uIntensity * 0.85;
      gl_FragColor=vec4(uColor, a);
    `
  }) as any
  return new THREE.Mesh(geo, mat) as any
}

function makeEmissiveChannel(w: number, h: number, color: number, intensity = 0.2){
  const geo = new THREE.PlaneGeometry(w, h)
  const uniforms: any = { uColor:{ value:new THREE.Color(color) }, uIntensity:{ value:intensity }, uTime:{ value: 0 } }
  const mat = new THREE.ShaderMaterial({
    transparent:true, depthWrite:false, blending: THREE.AdditiveBlending,
    uniforms,
    vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader:`precision highp float; varying vec2 vUv; uniform vec3 uColor; uniform float uIntensity; uniform float uTime; 
      float b=min(min(vUv.x,1.0-vUv.x), min(vUv.y,1.0-vUv.y));
      float ring=smoothstep(0.02,0.0,b)*0.85; float inner=smoothstep(0.018,0.02,b);
      float pulse = 0.85 + 0.15*sin(uTime*1.2);
      float a=ring*inner*uIntensity*pulse; gl_FragColor=vec4(uColor, a);`
  }) as any
  const mesh: any = new THREE.Mesh(geo, mat)
  ;(mesh as any).userData.uniforms = uniforms
  return mesh as any
}

function makeArchedWindowMask(w: number, h: number, opacity = 0.65){
  const geo = new THREE.PlaneGeometry(w, h)
  const mat = new THREE.ShaderMaterial({
    transparent:true, depthWrite:false,
    uniforms:{ uOpacity:{ value: opacity } },
    vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader:`precision highp float; varying vec2 vUv; uniform float uOpacity; 
      vec2 p = vUv; // rounded-rect with arched top
      float rx = 0.14, ry = 0.14; // corner radii
      vec2 q = vec2(max(p.x-0.5+rx,0.0)+max(0.5-rx-p.x,0.0), max(p.y-0.3+ry,0.0)+max(0.7-ry-p.y,0.0));
      float d = length(q) - min(rx,ry);
      float arch = smoothstep(0.0, -0.02, d);
      float head = smoothstep(0.35,0.65,p.y);
      float a = arch * head * uOpacity;
      gl_FragColor = vec4(vec3(1.0), a);
    `
  }) as any
  return new THREE.Mesh(geo, mat) as any
}

function edgeColorForTheme(theme: Theme){
  return theme==='cosmic' ? 0x8893ff : theme==='speed' ? 0x8df2ff : 0xeac27c
}

function accentForTheme(theme: Theme){
  return theme==='cosmic' ? 0x90a0ff : theme==='speed' ? 0x66e7ff : 0xf1d488
}

function makeEdgeGlowPlane(w: number, h: number, color: number, intensity = 0.18){
  const geo = new THREE.PlaneGeometry(w, h)
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uIntensity: { value: intensity } },
    vertexShader: /* glsl */`
      varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
    `,
    fragmentShader: /* glsl */`
      precision highp float; varying vec2 vUv; uniform vec3 uColor; uniform float uIntensity;
      void main(){
        float d = min(min(vUv.x, 1.0-vUv.x), min(vUv.y, 1.0-vUv.y));
        float a = smoothstep(0.022, 0.0, d); // thin border
        gl_FragColor = vec4(uColor * (0.6 + 0.4*(1.0-2.0*abs(vUv.y-0.5))), a * uIntensity);
      }
    `,
  }) as any
  const mesh: any = new THREE.Mesh(geo, mat)
  return mesh
}

function makeCoinEdgeOverlay(w: number, h: number, intensity = 0.16){
  const geo = new THREE.PlaneGeometry(w, h)
  const mat = new THREE.ShaderMaterial({
    transparent:true, depthWrite:false,
    uniforms:{ uIntensity:{ value: intensity } },
    vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader:`precision highp float; varying vec2 vUv; uniform float uIntensity;
      float edgeX = smoothstep(0.02, 0.0, min(vUv.x, 1.0-vUv.x));
      float edgeY = smoothstep(0.02, 0.0, min(vUv.y, 1.0-vUv.y));
      float stripesX = step(0.5, fract(vUv.x*160.0));
      float stripesY = step(0.5, fract(vUv.y*160.0));
      float a = (edgeY*stripesX + edgeX*stripesY) * 0.5 * uIntensity;
      gl_FragColor = vec4(vec3(1.0), a);
    `,
  }) as any
  return new THREE.Mesh(geo, mat) as any
}

export function buildCardMeshV2({ card, theme, frontTex, backTex, detail = 'high', lod }: { card: any; theme: Theme; frontTex: any; backTex: any; detail?: 'high'|'med'|'low'; lod?: 0|1|2 }): any {
  const group: any = new THREE.Group()
  const ratio = 252/180
  const w = 1
  const h = ratio
  const d = 0.022

  const params = rarityParams(card.rarity as Rarity)
  const edgeColor = edgeColorForTheme(theme)
  const frameOpacity = ((): number => {
    switch(card.rarity as Rarity){
      case 'D1': return 0.05; case 'D2': return 0.06; case 'D3': return 0.07; case 'D4': return 0.075; case 'D5': return 0.08;
      case 'S1': return 0.09; case 'S2': return 0.10; case 'S3': return 0.11; case 'S4': return 0.12; case 'CROWN': return 0.14;
    }
  })()
  const frameSteps = ((): number => {
    switch(card.rarity as Rarity){
      case 'D1': return 1; case 'D2': return 1; case 'D3': return 2; case 'D4': return 2; case 'D5': return 2;
      case 'S1': return 2; case 'S2': return 3; case 'S3': return 3; case 'S4': return 4; case 'CROWN': return 4;
    }
  })()
  const lodVal = (typeof lod === 'number') ? lod : (detail==='low'?2:(detail==='med'?1:0))
  const steps = lodVal===2 ? 1 : (detail==='low'? Math.max(1, frameSteps-2) : detail==='med'? Math.max(1, frameSteps-1) : frameSteps)

  // LOD2: flat plane + thin frame only
  if(lodVal===2){
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: frontTex, transparent: true })
    ) as any
    plane.name = 'card-plane'
    group.add(plane)
    const frame = new THREE.Mesh(
      new THREE.PlaneGeometry(w*0.98, h*0.98),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 })
    ) as any
    frame.position.z = 0.001
    group.add(frame)
    return group
  }

  // rarity archetype overlays (theme-tinted)
  const accent = accentForTheme(theme)
  if(['D3','D4'].includes(card.rarity as any) && detail!=='low' && lodVal<2){
    const brushed = makeBrushedRim(w*0.975, h*0.975, accent, card.rarity==='D4'?0.22:0.18)
    brushed.position.z = d*0.526
    group.add(brushed)
    const neon = makeNeonRim(w*0.975, h*0.975, accent, card.rarity==='D4'?0.22:0.18)
    neon.position.z = d*0.528
    group.add(neon)
  }

  if(card.rarity==='D5' && detail!=='low' && lodVal<2){
    const engr = makeEngravedOverlay(w*0.985, h*0.985, theme, 0.25)
    engr.position.z = d*0.527
    group.add(engr)
  }

  if(card.rarity==='S1' && detail!=='low' && lodVal<2){
    const s1b = makeS1SpecialBorder(w*0.98, h*0.98, theme, accent)
    s1b.position.z = d*0.532
    group.add(s1b)
  }

  if(card.rarity==='S2' && detail!=='low' && lodVal<2){
    const etch = makeEtchLines(w*0.98, h*0.98, accent, 0.12)
    etch.position.z = d*0.526
    group.add(etch)
  }

  if(card.rarity==='S3' && detail!=='low' && lodVal<2){
    const seam = makeSeamLine(w*0.98, h*0.98, accent, 0.20)
    seam.position.z = d*0.528
    group.add(seam)
    const ch: any = makeEmissiveChannel(w*0.96, h*0.96, accent, 0.18)
    ch.position.z = d*0.531
    group.add(ch)
    ;(group as any).userData = (group as any).userData || {}
    ;(group as any).userData.emissiveUniforms = (ch.material as any).uniforms
  }

  // Core body with per-face materials (edges + front/back textures)
  const geo = new THREE.BoxGeometry(w, h, d)
  const matEdge = new THREE.MeshStandardMaterial({ color: edgeColor, roughness: Math.min(0.95, params.roughness+0.1), metalness: Math.max(0, params.metalness-0.05), emissive: new THREE.Color(params.emissive), emissiveIntensity: 0.12 })
  const matFront = new THREE.MeshPhysicalMaterial({ map: frontTex, metalness: params.metalness, roughness: params.roughness, clearcoat: params.clearcoat, clearcoatRoughness: 0.35 })
  const matBack = new THREE.MeshPhysicalMaterial({ map: backTex, metalness: params.metalness*0.6, roughness: Math.min(1, params.roughness+0.08), clearcoat: params.clearcoat*0.5, clearcoatRoughness: 0.45 })
  const mats: any[] = [matEdge, matEdge, matEdge, matEdge, matFront, matBack]
  const body: any = new THREE.Mesh(geo, mats)
  body.name = 'card-body'
  group.add(body)

  // Back plate (signature emblem + orbit)
  const seedKey = `${card.set}|${card.id}|${card.rarity}`
  const back = createBackPlate({ width: w*0.94, height: h*0.94, accent: accentForTheme(theme), theme: (theme as any)||'classic', seedKey }) as any
  back.position.z = -d*0.52
  group.add(back)
  ;(group as any).userData = (group as any).userData || {}
  ;(group as any).userData.back = back

  // Thin front frame (neutral; avoids strong blue)
  const frame: any = new THREE.Mesh(
    new THREE.PlaneGeometry(w*0.96, h*0.96),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: frameOpacity })
  )
  frame.position.z = d*0.52
  frame.name = 'front-frame'
  group.add(frame)

  // stepped inner frames (deeper tiers add more)
  for(let i=0;i<steps-1;i++){
    const t = (i+1)/steps
    const step = new THREE.Mesh(
      new THREE.PlaneGeometry(w*0.94*(1 - 0.05*t), h*0.94*(1 - 0.05*t)),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: frameOpacity * (0.6 - 0.4*t) })
    ) as any
    step.position.z = d*0.50 - i*0.001
    group.add(step)
  }

  // coin-edge milling overlay for Elite+ and S tiers (skip at LOD2)
  if(['D5','S1','S2','S3','S4','CROWN'].includes(card.rarity as any) && detail!=='low' && lodVal<2){
    const coin = makeCoinEdgeOverlay(w*0.975, h*0.975, (card.rarity==='D5'?0.14:0.18))
    coin.position.z = d*0.529
    group.add(coin)
  }

  // edge glow for D5 and S1+
  if(['D5','S1','S2','S3','S4','CROWN'].includes(card.rarity as any)){
    const glow = makeEdgeGlowPlane(w*0.975, h*0.975, accentForTheme(theme), (card.rarity==='CROWN'?0.28:0.20))
    glow.position.z = d*0.53
    group.add(glow)
  }

  // inner glass window for Illustration/Special/Mythic/Hyper (S2+ approximates)
  if(['S2','S3','S4','CROWN'].includes(card.rarity as any) && detail!=='low' && lodVal<2){
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(w*0.90, h*0.90),
      new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.22, transparent: true, opacity: 0.6, roughness: 0.2, metalness: 0.0, clearcoat: 0.2, clearcoatRoughness: 0.4 })
    ) as any
    glass.position.z = d*0.515
    group.add(glass)
  }

  // multi-pane parallax for S1/S2 (borderless feel)
  if(['S1','S2'].includes(card.rarity as any) && detail!=='low' && lodVal<2){
    const paneNear: any = new THREE.Mesh(
      new THREE.PlaneGeometry(w*0.88, h*0.88),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.035 })
    )
    paneNear.position.z = d*0.512
    const paneFar: any = new THREE.Mesh(
      new THREE.PlaneGeometry(w*0.84, h*0.84),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.025 })
    )
    paneFar.position.z = d*0.508
    group.add(paneNear); group.add(paneFar)
    ;(group as any).userData = (group as any).userData || {}
    ;(group as any).userData.parallax = [paneNear, paneFar]
  }

  // micro ridge overlay for Elite+ (D5 and S-tier) — LOD0 only
  if(['D5','S1','S2','S3','S4','CROWN'].includes(card.rarity as any) && detail!=='low' && lodVal===0){
    const stripes = new THREE.Mesh(
      new THREE.PlaneGeometry(w*0.98, h*0.98),
      new THREE.ShaderMaterial({
        transparent: true, depthWrite: false,
        uniforms: { uOpacity: { value: 0.08 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `precision highp float; varying vec2 vUv; uniform float uOpacity; 
          float border = 1.0 - smoothstep(0.0, 0.02, min(min(vUv.x,1.0-vUv.x), min(vUv.y,1.0-vUv.y)));
          float lines = step(0.5, fract(vUv.x*80.0)) * 0.5 + step(0.5, fract(vUv.y*80.0)) * 0.5; 
          float a = border * lines * uOpacity; gl_FragColor=vec4(vec3(1.0), a);`
      }) as any
    ) as any
    stripes.position.z = d*0.525
    group.add(stripes)
  }

  // facet overlay for Hyper/Crown to hint prism — LOD0 only
  if(['S4','CROWN'].includes(card.rarity as any) && lodVal===0){
    const uniforms: any = { uIntensity:{ value: detail==='high'?0.22:0.14 }, uTime:{ value: 0 } }
    const facets: any = new THREE.Mesh(
      new THREE.PlaneGeometry(w*0.98, h*0.98),
      new THREE.ShaderMaterial({
        transparent:true, depthWrite:false, blending: THREE.AdditiveBlending,
        uniforms,
        vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader:`precision highp float; varying vec2 vUv; uniform float uIntensity; uniform float uTime; 
          vec2 p=vUv-0.5; float ang = uTime*0.15; mat2 R = mat2(cos(ang),-sin(ang),sin(ang),cos(ang)); p = R*p; 
          float a1=abs(dot(normalize(vec2(1.0,0.6)),p)); float a2=abs(dot(normalize(vec2(-1.0,0.5)),p));
          float a=exp(-6.0*a1)+exp(-6.0*a2); gl_FragColor=vec4(vec3(0.9,1.0,1.0)*a,uIntensity*a);`
      }) as any
    ) as any
    facets.position.z = d*0.535
    group.add(facets)
    ;(group as any).userData = (group as any).userData || {}
    ;(group as any).userData.facetUniforms = uniforms
  }

  // Crown centerpiece (top tier only)
  if(card.rarity === 'CROWN'){
    const emblem: any = new THREE.Mesh(
      new THREE.CircleGeometry(0.18, 48),
      new THREE.MeshStandardMaterial({ color: 0xfff0c0, emissive: 0xffd77a, emissiveIntensity: 0.35, metalness: 0.8, roughness: 0.25 })
    )
    emblem.position.z = 0
    emblem.name = 'crown-emblem'
    group.add(emblem)
  }

  return group
}

export function disposeCardMeshV2(group: any){
  group.traverse((obj: any)=>{
    const mesh: any = obj as any
    const geo = mesh?.geometry as any
    if(geo && typeof geo.dispose === 'function') try{ geo.dispose() }catch{}
    const mat: any = (mesh.material as any)
    if(Array.isArray(mat)) mat.forEach(m=>{ try{ m.dispose?.() }catch{} })
    else if(mat && typeof mat.dispose === 'function') try{ mat.dispose() }catch{}
  })
}
