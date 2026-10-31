import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CAN } from './canSpec'
import { rig } from './rig'

/**
 * Carbonation at the opening: a one-shot burst of fine mist (scrubbed by scroll)
 * plus a continuous rise of small bubbles while the can is open.
 */
const vert = /* glsl */ `
  uniform float uTime, uBurst, uFizz, uSize;
  uniform vec3 uMouth;
  attribute vec4 aSeed; // x,y,z random, w kind (0 bubble, 1 burst)
  varying float vAlpha;
  void main() {
    vec3 p = uMouth;
    float a = 0.0;
    if (aSeed.w < 0.5) {
      float life = fract(uTime * (0.35 + aSeed.y * 0.5) + aSeed.x);
      float ang = aSeed.z * 6.2831;
      p += vec3(cos(ang) * 0.07 * aSeed.y, life * (0.35 + aSeed.x * 0.45), sin(ang) * 0.05 * aSeed.y);
      p.x += sin(life * 9.0 + aSeed.z * 20.0) * 0.012;
      a = uFizz * smoothstep(0.0, 0.1, life) * (1.0 - life);
    } else {
      float b = uBurst;
      float ang = aSeed.x * 6.2831;
      float spd = 0.25 + aSeed.y * 0.65;
      vec3 dir = normalize(vec3(cos(ang) * (0.4 + aSeed.z), 1.2 + aSeed.z, sin(ang) * (0.4 + aSeed.z)));
      float t = b * 1.4;
      p += dir * spd * t - vec3(0.0, 0.35 * t * t, 0.0);
      a = step(0.001, b) * (1.0 - b) * smoothstep(0.0, 0.05, b);
    }
    vAlpha = a;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.35 + aSeed.y) * (1.0 / -mv.z);
  }
`
const frag = /* glsl */ `
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float ring = smoothstep(0.5, 0.36, d) * (0.35 + 0.65 * smoothstep(0.18, 0.42, d));
    float spec = smoothstep(0.16, 0.0, length(c - vec2(-0.14, -0.14)));
    gl_FragColor = vec4(vec3(1.0, 0.97, 0.92), (ring + spec) * vAlpha);
  }
`

export function Fizz({ count }: { count: number }) {
  const { geo, mat } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count * 4)
    for (let i = 0; i < count; i++) {
      seed.set([Math.random(), Math.random(), Math.random(), i % 3 === 0 ? 0 : 1], i * 4)
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4))
    const m = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uBurst: { value: 0 },
        uFizz: { value: 0 },
        uSize: { value: 26 * Math.min(window.devicePixelRatio, 2) },
        uMouth: { value: CAN.mouth.clone().setY(CAN.mouth.y + 0.01) },
      },
    })
    return { geo: g, mat: m }
  }, [count])

  useFrame(() => {
    const u = mat.uniforms
    u.uTime.value = rig.time
    u.uBurst.value = rig.beats.burst
    u.uFizz.value = rig.beats.fizz
  })

  return <points geometry={geo} material={mat} frustumCulled={false} />
}
