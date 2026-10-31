import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { rig } from './rig'

/** Slow-drifting light motes. All motion lives in the vertex shader. */
const vert = /* glsl */ `
  uniform float uTime, uSize;
  attribute vec4 aSeed;
  varying float vA; varying float vWarm;
  void main() {
    vec3 p = position;
    p.y += mod(uTime * (0.03 + aSeed.x * 0.06) + aSeed.y * 8.0, 8.0) - 4.0;
    p.x += sin(uTime * 0.2 + aSeed.z * 6.28) * 0.25;
    p.z += cos(uTime * 0.17 + aSeed.x * 6.28) * 0.2;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.3 + aSeed.w) / -mv.z;
    vA = (0.25 + 0.75 * aSeed.w) * (0.6 + 0.4 * sin(uTime * (0.6 + aSeed.z) + aSeed.x * 30.0));
    vWarm = step(0.62, aSeed.y);
  }
`
const frag = /* glsl */ `
  uniform float uOpacity;
  varying float vA; varying float vWarm;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    vec3 col = mix(vec3(1.0, 0.93, 0.88), vec3(1.0, 0.32, 0.22), vWarm);
    gl_FragColor = vec4(col, a * a * vA * uOpacity);
  }
`

export function Dust({ count, reduced }: { count: number; reduced: boolean }) {
  const { geo, mat } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const p = new Float32Array(count * 3)
    const sd = new Float32Array(count * 4)
    for (let i = 0; i < count; i++) {
      p.set([(Math.random() - 0.5) * 12, 0, -5 + Math.random() * 7.5], i * 3)
      sd.set([Math.random(), Math.random(), Math.random(), Math.pow(Math.random(), 2)], i * 4)
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(sd, 4))
    const m = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uSize: { value: 70 * Math.min(window.devicePixelRatio, 2) }, uOpacity: { value: 0 } },
    })
    return { geo: g, mat: m }
  }, [count])

  useFrame(() => {
    mat.uniforms.uTime.value = reduced ? 12 : rig.time
    mat.uniforms.uOpacity.value = 0.35 + 0.45 * rig.pose.rim
  })

  return <points geometry={geo} material={mat} frustumCulled={false} />
}
