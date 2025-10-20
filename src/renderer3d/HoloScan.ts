import * as THREE from 'three'

export function createHoloPlane({ width = 1, height = 1.4, strength = 0.1, mode = 'rainbow' as 'rainbow'|'aurora'|'streak' }: { width?: number; height?: number; strength?: number; mode?: 'rainbow'|'aurora'|'streak' }){
  const geo = new THREE.PlaneGeometry(width, height)
  const uniforms: any = {
    uTime: { value: 0 },
    uStrength: { value: strength },
    uStrengthBase: { value: strength },
    uTint: { value: new THREE.Color(0x86a6ff) },
  }
  const fragmentRainbow = /* glsl */`
    precision highp float; varying vec2 vUv; uniform float uTime; uniform float uStrength; uniform vec3 uTint;
    vec3 hue(float h){ vec3 rgb = clamp(abs(mod(h*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,0.0,1.0); return rgb; }
    void main(){
      float scan = sin(vUv.y*680.0 - uTime*1.6)*0.5 + 0.5;
      float band = smoothstep(0.46, 0.54, vUv.y);
      float shimmer = sin((vUv.x+vUv.y)*12.0 + uTime*0.7)*0.5 + 0.5;
      float a = uStrength * (0.06 + 0.08*scan) * (0.5 + 0.5*band) * (0.9 + 0.1*shimmer);
      vec3 col = mix(uTint, hue(0.55 + 0.1*sin(uTime*0.3)), 0.5) * (0.20 + 0.40*scan);
      // bright sweep (3.2s period)
      float pos = fract(uTime / 3.2);
      float sweep = exp(-80.0*abs(vUv.y - pos));
      vec3 colOut = col + vec3(1.0) * sweep;
      float aOut = clamp(a + sweep*0.35, 0.0, 1.0);
      gl_FragColor = vec4(colOut, aOut);
    }
  `
  const fragmentAurora = /* glsl */`
    precision highp float; varying vec2 vUv; uniform float uTime; uniform float uStrength; uniform vec3 uTint;
    void main(){
      float wave = sin(vUv.x*8.0 + uTime*0.6)*0.5 + 0.5;
      float wave2 = sin(vUv.x*13.0 - uTime*0.45)*0.5 + 0.5;
      float grad = smoothstep(0.05, 0.95, vUv.y);
      float a = uStrength * (0.10*wave + 0.08*wave2) * grad;
      vec3 col = mix(vec3(0.3,0.5,1.0), vec3(0.3,1.0,0.8), wave) * (0.5+0.5*grad);
      float pos = fract(uTime / 3.2);
      float sweep = exp(-80.0*abs(vUv.y - pos));
      vec3 colOut = col + vec3(1.0) * sweep;
      float aOut = clamp(a + sweep*0.35, 0.0, 1.0);
      gl_FragColor = vec4(colOut, aOut);
    }
  `
  const fragmentStreak = /* glsl */`
    precision highp float; varying vec2 vUv; uniform float uTime; uniform float uStrength; uniform vec3 uTint;
    void main(){
      vec2 p = vUv - 0.5;
      float d = abs(p.x*0.8 + p.y*1.2);
      float lines = smoothstep(0.035, 0.0, fract(d*40.0 - uTime*1.2));
      float a = uStrength * lines * (0.4 + 0.6*(0.5+0.5*sin(uTime*0.8)));
      vec3 col = mix(uTint, vec3(1.0,0.5,1.0), 0.35);
      float pos = fract(uTime / 3.2);
      float sweep = exp(-80.0*abs(vUv.y - pos));
      vec3 colOut = col + vec3(1.0) * sweep;
      float aOut = clamp(a + sweep*0.35, 0.0, 1.0);
      gl_FragColor = vec4(colOut, aOut);
    }
  `
  const fs = mode==='aurora' ? fragmentAurora : mode==='streak' ? fragmentStreak : fragmentRainbow
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms,
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: fs,
  })
  const mesh: any = new THREE.Mesh(geo, mat)
  ;(mesh as any).userData.uniforms = uniforms
  return mesh
}
