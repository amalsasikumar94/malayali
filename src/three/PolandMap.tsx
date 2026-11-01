import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { FLAG_Y, POLAND, WARSAW } from './polandOutline'
import { rig } from './rig'
import { range, smooth, store } from '../lib/store'

/**
 * "Made in Poland": the country drawn behind the can during the reveal.
 * Two glowing strokes trace the border from the Baltic coast and meet in the south,
 * then a flag-coloured halftone floods out from Warsaw and a pin starts to pulse.
 * Driven by store.poland (0..1, scrubbed by the Reveal timeline).
 */

const RED = new THREE.Color('#ff2f22')
const PAPER = new THREE.Color('#ecebe7')
const SAMPLES = 420

/** Closed outline split at half its length into two arms that start together, resampled evenly. */
function arms() {
  const loop: THREE.Vector2[] = []
  for (let i = 0; i < POLAND.length; i += 2) loop.push(new THREE.Vector2(POLAND[i], POLAND[i + 1]))
  loop.push(loop[0].clone())
  const cum = [0]
  for (let i = 1; i < loop.length; i++) cum.push(cum[i - 1] + loop[i].distanceTo(loop[i - 1]))
  const total = cum[cum.length - 1]
  const at = (d: number) => {
    let k = 1
    while (k < cum.length - 1 && cum[k] < d) k++
    const t = (d - cum[k - 1]) / (cum[k] - cum[k - 1] || 1)
    return new THREE.Vector2().lerpVectors(loop[k - 1], loop[k], t)
  }
  const fwd: THREE.Vector2[] = []
  const back: THREE.Vector2[] = []
  for (let i = 0; i <= SAMPLES; i++) {
    const f = (i / SAMPLES) * (total / 2)
    fwd.push(at(f))
    back.push(at(total - f))
  }
  return [fwd, back]
}

const flat = (pts: THREE.Vector2[]) => pts.flatMap((p) => [p.x, p.y, 0])

const fillVert = /* glsl */ `
  varying vec2 vP;
  void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`
const fillFrag = /* glsl */ `
  uniform float uFill, uAlpha, uDensity, uTime, uFlagY;
  uniform vec2 uOrigin;
  uniform vec3 uRed, uPaper;
  varying vec2 vP;
  void main() {
    float d = distance(vP, uOrigin);
    float R = uFill * 1.15;
    float inside = 1.0 - smoothstep(R - 0.1, R, d);
    float front = exp(-pow((d - R) * 26.0, 2.0)) * step(0.001, uFill) * (1.0 - smoothstep(0.85, 1.0, uFill));

    vec2 g = vP * uDensity;
    vec2 cell = fract(g) - 0.5;
    // a slow shimmer runs through the dots once they have landed
    float shimmer = 0.5 + 0.5 * sin(dot(floor(g), vec2(0.7, 1.3)) * 0.35 - uTime * 1.6);
    float r = 0.16 + 0.1 * front + 0.04 * shimmer * inside;
    float l = length(cell);
    float aa = fwidth(l) * 1.2;
    float dotm = 1.0 - smoothstep(r - aa, r + aa, l);

    float north = smoothstep(uFlagY - 0.004, uFlagY + 0.004, vP.y);
    vec3 col = mix(uRed, uPaper, north);
    float strength = mix(0.85, 0.42, north);
    float a = dotm * (inside * strength + front * 0.9) + inside * mix(0.1, 0.035, north);
    gl_FragColor = vec4(col * (1.0 + front * 1.4), a * uAlpha);
  }
`

const glowVert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`
/** Comet head at the tip of each stroke. */
const headFrag = /* glsl */ `
  uniform float uAlpha;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float r = length(vUv - 0.5) * 2.0;
    float a = exp(-r * r * 9.0) * 0.9 + exp(-r * r * 90.0);
    gl_FragColor = vec4(mix(uColor, vec3(1.0), exp(-r * r * 60.0)), a * uAlpha);
  }
`
/** Warsaw: a bright core with rings that keep rippling out. */
const pinFrag = /* glsl */ `
  uniform float uAlpha, uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float r = length(vUv - 0.5) * 2.0;
    float core = 1.0 - smoothstep(0.05, 0.075, r);
    float halo = exp(-r * r * 40.0) * 0.7;
    float rings = 0.0;
    for (int i = 0; i < 3; i++) {
      float ph = fract(uTime * 0.45 + float(i) / 3.0);
      rings += (1.0 - smoothstep(0.0, 0.025, abs(r - ph))) * pow(1.0 - ph, 1.5);
    }
    vec3 col = mix(uColor, vec3(1.0), core);
    gl_FragColor = vec4(col, (core + halo + rings * 0.8) * uAlpha);
  }
`

export function PolandMap({ compact }: { compact: boolean }) {
  const group = useRef<THREE.Group>(null!)

  const parts = useMemo(() => {
    const [a, b] = arms()
    const strokes = [a, b].map((pts) => {
      const geo = new LineGeometry()
      geo.setPositions(flat(pts))
      const core = new LineMaterial({ color: RED, linewidth: 2.2, transparent: true, depthWrite: false, toneMapped: false })
      const glow = new LineMaterial({ color: RED, linewidth: 11, transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })
      return { pts, geo, lines: [new Line2(geo, glow), new Line2(geo, core)], mats: [glow, core] }
    })

    // faint dashed guide of the whole border, laid down before the strokes arrive
    const ghostGeo = new LineGeometry()
    ghostGeo.setPositions(flat([...a, ...b.slice().reverse()]))
    const ghostMat = new LineMaterial({ color: PAPER, linewidth: 1, dashed: true, dashSize: 0.008, gapSize: 0.012, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })
    const ghost = new Line2(ghostGeo, ghostMat)
    ghost.computeLineDistances()

    const shape = new THREE.Shape()
    shape.moveTo(POLAND[0], POLAND[1])
    for (let i = 2; i < POLAND.length; i += 2) shape.lineTo(POLAND[i], POLAND[i + 1])
    const fillGeo = new THREE.ShapeGeometry(shape)
    const fillMat = new THREE.ShaderMaterial({
      vertexShader: fillVert,
      fragmentShader: fillFrag,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      uniforms: {
        uFill: { value: 0 },
        uAlpha: { value: 0 },
        uDensity: { value: 70 },
        uTime: { value: 0 },
        uFlagY: { value: FLAG_Y },
        uOrigin: { value: new THREE.Vector2(...WARSAW) },
        uRed: { value: new THREE.Color('#cd2129') },
        uPaper: { value: PAPER.clone() },
      },
    })

    const glowMat = (frag: string, size: number) =>
      new THREE.ShaderMaterial({
        vertexShader: glowVert,
        fragmentShader: frag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        uniforms: { uAlpha: { value: 0 }, uTime: { value: 0 }, uColor: { value: RED.clone() }, uSize: { value: size } },
      })
    const heads = strokes.map(() => glowMat(headFrag, 1))
    const pin = glowMat(pinFrag, 1)
    const quad = new THREE.PlaneGeometry(1, 1)

    return { strokes, ghost, ghostMat, fillGeo, fillMat, heads, pin, quad }
  }, [])

  const headRefs = useRef<THREE.Mesh[]>([])
  const res = useMemo(() => new THREE.Vector2(), [])

  useFrame(({ camera, gl, clock }) => {
    const s = store.s
    const p = store.poland
    const g = group.current
    // only exists during the reveal; leaves as the camera dives into the opening
    const w = range(s, 1.0, 1.12) * (1 - range(s, 1.8, 1.94)) * Math.min(1, p * 12)
    g.visible = w > 0.003
    if (!g.visible) return

    const size = compact ? 2.4 : 3.3
    const t = clock.elapsedTime
    g.position.set(rig.center.x + (compact ? 0 : 0.6), rig.center.y - 0.02 + Math.sin(t * 0.6) * 0.03, rig.center.z - 2.2)
    g.quaternion.copy(camera.quaternion)
    g.scale.setScalar(size * (0.94 + 0.06 * smooth(Math.min(1, p * 3))))

    const draw = smooth(range(p, 0.02, 0.62))
    const meet = Math.exp(-Math.pow((p - 0.64) * 13, 2))
    const dpr = gl.getPixelRatio()
    const shown = Math.floor(draw * SAMPLES)
    // line widths are in drawing-buffer pixels
    gl.getDrawingBufferSize(res)
    parts.ghostMat.resolution.copy(res)
    parts.strokes.forEach((st) => st.mats.forEach((m) => m.resolution.copy(res)))

    parts.ghostMat.opacity = 0.35 * range(p, 0, 0.12) * (1 - range(p, 0.6, 0.9)) * w
    parts.ghostMat.linewidth = 1 * dpr

    parts.strokes.forEach((st, i) => {
      st.geo.instanceCount = shown
      const [glow, core] = st.mats
      glow.linewidth = (8 + meet * 10) * dpr
      glow.opacity = (0.11 + 0.4 * meet + 0.04 * Math.sin(t * 2)) * w
      core.linewidth = (compact ? 1.5 : 1.8) * dpr
      core.opacity = w

      const head = headRefs.current[i]
      const tip = st.pts[Math.min(SAMPLES, shown)]
      head.position.set(tip.x, tip.y, 0.002)
      head.scale.setScalar(0.11 + 0.02 * Math.sin(t * 9 + i))
      parts.heads[i].uniforms.uAlpha.value = range(draw, 0, 0.02) * (1 - range(p, 0.6, 0.66)) * w
    })

    const u = parts.fillMat.uniforms
    u.uFill.value = smooth(range(p, 0.5, 1))
    u.uAlpha.value = w
    u.uTime.value = t
    u.uDensity.value = compact ? 46 : 64

    parts.pin.uniforms.uAlpha.value = smooth(range(p, 0.55, 0.72)) * w
    parts.pin.uniforms.uTime.value = t
  })

  return (
    <group ref={group} renderOrder={-10}>
      <mesh geometry={parts.fillGeo} material={parts.fillMat} renderOrder={-12} />
      <primitive object={parts.ghost} renderOrder={-11} />
      {parts.strokes.map((st, i) => (
        <group key={i}>
          {st.lines.map((l, j) => (
            <primitive key={j} object={l} renderOrder={-10} />
          ))}
          <mesh
            ref={(m) => {
              if (m) headRefs.current[i] = m
            }}
            geometry={parts.quad}
            material={parts.heads[i]}
            renderOrder={-9}
          />
        </group>
      ))}
      <mesh geometry={parts.quad} material={parts.pin} position={[WARSAW[0], WARSAW[1], 0.003]} scale={0.16} renderOrder={-8} />
    </group>
  )
}
