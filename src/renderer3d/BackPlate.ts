import * as THREE from 'three'

function stringHash(s:string){ let h=2166136261>>>0; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i); h=Math.imul(h,16777619)} return h>>>0 }
function mulberry32(a:number){ return function(){ let t = a += 0x6D2B79F5; t = Math.imul(t ^ (t >>> 15), 1 | t); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; } }

export function createBackPlate({ width = 0.96, height = 1.35, accent = 0x66e3ff, theme = 'classic' as 'classic'|'cosmic'|'speed', seedKey = 'BASE|0|D1' }: { width?: number; height?: number; accent?: number; theme?: 'classic'|'cosmic'|'speed'; seedKey?: string }){
  const group: any = new THREE.Group()
  ;(group as any).userData = (group as any).userData || {}
  const rand = mulberry32(stringHash(seedKey))

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({ color: 0x0c0d10, roughness: 0.88, metalness: 0.08 })
  )
  plane.receiveShadow = false
  group.add(plane)

  const minwh = Math.min(width, height)

  // Vertical stretched swirl (subtle, behind emblem)
  {
    const uniforms: any = { uOpacity: { value: 0.16 } }
    const swirl = new THREE.Mesh(
      new THREE.PlaneGeometry(width*0.78, height*0.92),
      new THREE.ShaderMaterial({ transparent:true, depthWrite:false, uniforms,
        vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader:`precision highp float; varying vec2 vUv; uniform float uOpacity;
          vec2 p = (vUv-0.5); p.x *= 0.6; // vertical stretch
          float r = length(p);
          float rings = smoothstep(0.46,0.45,r) + smoothstep(0.30,0.29,r) + smoothstep(0.18,0.17,r);
          float glow = exp(-6.0*r);
          float a = clamp((rings*0.35 + glow*0.65) * uOpacity, 0.0, 0.35);
          gl_FragColor = vec4(vec3(1.0), a);
        ` }) as any)
    swirl.position.z = 0.0005
    group.add(swirl)
  }

  if(theme==='classic'){
    // Concentric ring + orbit nodes
    const ringGeo = new THREE.RingGeometry(minwh*0.18, minwh*0.22, 64)
    const ringMat = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.28 })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.name = 'bp-ring'
    group.add(ring)

    const orbitGeo = new THREE.RingGeometry(minwh*0.32, minwh*0.325, 128)
    const orbitMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.10 })
    const orbit = new THREE.Mesh(orbitGeo, orbitMat)
    orbit.name = 'bp-orbit'
    group.add(orbit)

    for(let i=0;i<8;i++){
      const a = (i/8)*Math.PI*2
      const r = minwh*0.325
      const dot = new THREE.Mesh(new THREE.CircleGeometry(0.006, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.16, transparent: true }))
      dot.position.set(Math.cos(a)*r, Math.sin(a)*r, 0.001)
      group.add(dot)
    }
    ;(group as any).userData.anim = { type:'rotate', target: orbit }

    // Center emblem: geometric sigil (ring + dot)
    const emblem = new THREE.Group()
    const eRing = new THREE.Mesh(new THREE.RingGeometry(minwh*0.06, minwh*0.09, 48), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.8 }))
    const eDot = new THREE.Mesh(new THREE.CircleGeometry(minwh*0.025, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }))
    eDot.position.z = 0.001
    emblem.add(eRing); emblem.add(eDot)
    emblem.position.z = 0.001
    group.add(emblem)
  }

  if(theme==='cosmic'){
    // Orbit bands + starfield dots
    const band1 = new THREE.Mesh(new THREE.RingGeometry(minwh*0.22, minwh*0.27, 128), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.22 }))
    const band2 = new THREE.Mesh(new THREE.RingGeometry(minwh*0.34, minwh*0.39, 128), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.10 }))
    band1.rotation.z = 0.2
    band2.rotation.z = -0.35
    group.add(band1); group.add(band2)
    // starfield
    const stars = new THREE.Group()
    for(let i=0;i<48;i++){
      const size = 0.004 + rand()*0.006
      const op = 0.14 + rand()*0.12
      const x = (rand()-0.5)*width*0.9
      const y = (rand()-0.5)*height*0.9
      const s = new THREE.Mesh(new THREE.CircleGeometry(size, 10), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: op }))
      s.position.set(x, y, 0.001)
      stars.add(s)
    }
    group.add(stars)
    ;(group as any).userData.anim = { type:'oscillate', targets: [band1, band2] }

    // Center emblem: orbit crown (simple)
    const emblem = new THREE.Group()
    // base band
    const eBand = new THREE.Mesh(new THREE.RingGeometry(minwh*0.07, minwh*0.095, 48), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.9 }))
    emblem.add(eBand)
    // three points (triangles)
    for(let i=0;i<3;i++){
      const tri = new THREE.Mesh(new THREE.CircleGeometry(minwh*0.018, 3), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }))
      tri.rotation.z = Math.PI/2
      const ang = (-0.5 + i*0.5) // -0.5, 0, 0.5 rad approx
      tri.position.set(Math.sin(ang)*minwh*0.05, minwh*0.06 + Math.cos(ang)*minwh*0.01, 0.001)
      emblem.add(tri)
    }
    emblem.position.z = 0.001
    group.add(emblem)
  }

  if(theme==='speed'){
    // Diagonal rails + scanning bar
    const rails = new THREE.Group()
    const railMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 })
    for(let i=-4;i<=4;i++){
      const rail = new THREE.Mesh(new THREE.PlaneGeometry(width*1.2, 0.01), railMat)
      rail.rotation.z = Math.PI/4
      rail.position.set(i*0.06, i*0.02, 0.001)
      rails.add(rail)
    }
    group.add(rails)
    const scanUniforms: any = { uPos:{ value: -0.6 } }
    const scan = new THREE.Mesh(
      new THREE.PlaneGeometry(width*1.2, 0.06),
      new THREE.ShaderMaterial({ transparent:true, depthWrite:false, uniforms: scanUniforms,
        vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader:`precision highp float; varying vec2 vUv; uniform float uPos; 
          float m = exp(-18.0*abs(vUv.y - (uPos*0.5+0.5))); gl_FragColor=vec4(1.0,1.0,1.0, m*0.11);` }) as any)
    scan.rotation.z = Math.PI/4
    group.add(scan)
    ;(group as any).userData.anim = { type:'scan', uniforms: scanUniforms }

    // Center emblem: angular neon sigil (diamond + bar)
    const emblem = new THREE.Group()
    const diamond = new THREE.Mesh(new THREE.PlaneGeometry(minwh*0.16, minwh*0.16), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.90 }))
    diamond.rotation.z = Math.PI/4
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(minwh*0.18, minwh*0.02), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.8 }))
    bar.position.z = 0.001
    emblem.add(diamond); emblem.add(bar)
    emblem.position.z = 0.001
    group.add(emblem)
  }

  return group
}
