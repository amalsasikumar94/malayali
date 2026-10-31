import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { rig } from './rig'
import { store, range } from '../lib/store'

/**
 * The studio itself, rendered in WebGL: a dark sweep with a brand-red light pool tracking the can, a vignette, and the
 * giant "ADIPOLI" back-type the can floats in front of.
 */

const bgVert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`
const bgFrag = /* glsl */ `
  uniform vec2 uCenter;
  uniform float uGlow, uAspect;
  uniform vec3 uInk, uRed, uHot;
  varying vec2 vUv;
  void main() {
    vec2 q = (vUv - uCenter) * vec2(uAspect, 1.0);
    float d2 = dot(q, q);
    float pool = exp(-d2 * 55.0) * uGlow;
    float core = exp(-d2 * 180.0) * uGlow;
    float floorGlow = exp(-pow((vUv.y - 0.3) * 9.0, 2.0)) * 0.04 * uGlow;
    vec3 col = uInk + uRed * (pool * 0.16 + floorGlow) + uHot * core * 0.08;
    float vig = smoothstep(0.75, 0.2, length((vUv - 0.5) * vec2(uAspect * 0.7, 1.0)));
    col *= mix(0.45, 1.0, vig);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

function wordTexture(word: string, outline: boolean) {
  const c = document.createElement('canvas')
  c.width = 2048
  c.height = 560
  const g = c.getContext('2d')!
  g.font = `760 520px "Archivo Variable", "Arial Narrow", sans-serif`
  ;(g as CanvasRenderingContext2D & { fontStretch?: string }).fontStretch = 'condensed'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  const w = g.measureText(word).width
  g.translate(1024, 300)
  g.scale(Math.min(1, 1960 / w), 1)
  if (outline) {
    g.lineWidth = 2.5
    g.strokeStyle = '#fff'
    g.strokeText(word, 0, 0)
  } else {
    g.fillStyle = '#fff'
    g.fillText(word, 0, 0)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

type Word = { tex: THREE.Texture; color: THREE.Color; y: number; vis: (s: number) => number }

export function Backdrop3D({ compact }: { compact: boolean }) {
  const bg = useRef<THREE.Mesh>(null!)
  const words = useRef<THREE.Group>(null!)
  const size = useThree((s) => s.size)

  const bgMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: bgVert,
        fragmentShader: bgFrag,
        depthWrite: false,
        depthTest: false,
        uniforms: {
          uCenter: { value: new THREE.Vector2(0.5, 0.5) },
          uGlow: { value: 0 },
          uAspect: { value: 1 },
          uInk: { value: new THREE.Color('#0b0807') },
          uRed: { value: new THREE.Color('#cd2129') },
          uHot: { value: new THREE.Color('#ff5a3c') },
        },
      }),
    [],
  )

  // fonts are ready by the time the stage mounts (the loader waits on them)
  const list = useMemo<Word[]>(
    () => [
      { tex: wordTexture('ADIPOLI', true), color: new THREE.Color('#ecebe7').multiplyScalar(0.07), y: 0, vis: (s) => (1 - range(s, 0.3, 0.9)) * store.intro },
      { tex: wordTexture('ADIPOLI', false), color: new THREE.Color('#cd2129').multiplyScalar(0.5), y: 0.1, vis: (s) => range(s, 4.6, 4.95) },
    ],
    [],
  )
  const wordMats = useMemo(() => list.map((w) => new THREE.MeshBasicMaterial({ map: w.tex, alphaTest: 0.35, color: w.color.clone(), toneMapped: false })), [list])

  const fwd = useMemo(() => new THREE.Vector3(), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ camera }) => {
    const cam = camera as THREE.PerspectiveCamera
    const s = store.s
    const D = 30
    cam.getWorldDirection(fwd)
    const h = 2 * D * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * 1.7
    const w = h * (size.width / size.height)
    bg.current.position.copy(cam.position).addScaledVector(fwd, D)
    bg.current.quaternion.copy(cam.quaternion)
    bg.current.scale.set(w, h, 1)
    bg.current.updateMatrixWorld()

    // centre the light pool on the can, in the plane's own uv space
    tmp.copy(rig.center).sub(cam.position)
    const along = tmp.dot(fwd)
    if (along > 0.1) {
      tmp.multiplyScalar(D / along).add(cam.position)
      bg.current.worldToLocal(tmp)
      bgMat.uniforms.uCenter.value.set(tmp.x + 0.5, tmp.y + 0.5)
    }
    bgMat.uniforms.uAspect.value = w / h
    const glow =
      (1 - Math.min(1, s / 1.6)) * 0.9 + Math.max(0, (s - 4.4) / 0.6) + 0.18
    bgMat.uniforms.uGlow.value = Math.min(2.2, glow * store.intro + rig.drama * 1.4)

    // back-type: desktop only; sits 3 units behind the can and fills the frame width
    words.current.visible = !compact
    if (compact) return
    const dist = Math.max(1, cam.position.z + 3)
    const fw = 2 * dist * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * (size.width / size.height)
    words.current.children.forEach((m, i) => {
      const wd = list[i]
      const vis = wd.vis(s)
      m.visible = vis > 0.01
      const mesh = m as THREE.Mesh
      ;(mesh.material as THREE.MeshBasicMaterial).color.copy(wd.color).multiplyScalar(vis)
      mesh.scale.set(fw * 0.98, (fw * 0.98 * 560) / 2048, 1)
      mesh.position.set(cam.position.x * 0.6, wd.y + (1 - vis) * -0.4, -3)
    })
  })

  return (
    <>
      <mesh ref={bg} material={bgMat} renderOrder={-100} frustumCulled={false}>
        <planeGeometry />
      </mesh>
      <group ref={words}>
        {list.map((_, i) => (
          <mesh key={i} material={wordMats[i]} renderOrder={-50}>
            <planeGeometry />
          </mesh>
        ))}
      </group>
    </>
  )
}
