import * as THREE from 'three'

export function createEnergySwirl({ width = 0.9, height = 1.25, intensity = 0.22, hue = 0.58 }: { width?: number; height?: number; intensity?: number; hue?: number }){
  const geo = new THREE.PlaneGeometry(width, height)
  const uniforms: any = {
    uTime: { value: 0 },
    uIntensity: { value: intensity },
    uHue: { value: hue },
  }
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms,
    vertexShader: /* glsl */`
      varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
    `,
    fragmentShader: /* glsl */`
      precision highp float; varying vec2 vUv; uniform float uTime; uniform float uIntensity; uniform float uHue;
      vec3 hsl2rgb(vec3 hsl){
        vec3 rgb = clamp(abs(mod(hsl.x*6.0 + vec3(0.0,4.0,2.0), 6.0)-3.0)-1.0,0.0,1.0);
        return hsl.z + hsl.y*(rgb-0.5)*(1.0-abs(2.0*hsl.z-1.0));
      }
      void main(){
        vec2 p = (vUv-0.5);
        float r = length(p);
        float a = atan(p.y, p.x);
        float swirl = sin(8.0*a + uTime*1.2) * 0.5 + 0.5;
        float ring = exp(-12.0*abs(r-0.28 - 0.04*sin(uTime*0.8)));
        float streaks = smoothstep(0.48,0.5,r) * (0.5 + 0.5*sin(20.0*a + uTime*0.6));
        float alpha = (ring*0.9 + streaks*0.6 + swirl*0.3) * uIntensity;
        vec3 col = hsl2rgb(vec3(uHue + 0.05*sin(uTime*0.2), 0.65, 0.55));
        gl_FragColor = vec4(col, alpha);
      }
    `,
  })
  const mesh: any = new THREE.Mesh(geo, mat)
  ;(mesh as any).userData.uniforms = uniforms
  return mesh
}
