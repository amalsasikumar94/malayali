import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { CAN, apertureShape, baseProfile, heelProfile, lidProfile, neckProfile, tabShape } from './canSpec'
import { PAPER, RED, paintLabel } from './labelTexture'
import { beats, newPose, samplePose } from './choreography'
import { rig } from './rig'
import { store } from '../lib/store'
import { ready } from '../lib/ready'
import { Condensation } from './Condensation'
import { Fizz } from './Fizz'

type Props = { labelSize: number; segments: number; droplets: number; fizz: number; compact: boolean; reduced: boolean }

const TAU = Math.PI * 2
const tmp = new THREE.Vector3()
const lookAt = new THREE.Vector3()

export function Can({ labelSize, segments, droplets, fizz, compact, reduced }: Props) {
  const gl = useThree((s) => s.gl)
  const outer = useRef<THREE.Group>(null!)
  const spin = useRef<THREE.Group>(null!)
  const tab = useRef<THREE.Group>(null!)
  const panel = useRef<THREE.Group>(null!)
  const [label, setLabel] = useState<THREE.CanvasTexture | null>(null)

  useEffect(() => {
    let tex: THREE.CanvasTexture | null = null
    paintLabel(labelSize)
      .then((cv) => {
        tex = new THREE.CanvasTexture(cv)
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
        setLabel(tex)
      })
      .catch((e) => console.error('label paint failed', e))
      .finally(() => ready.resolve('label'))
    return () => tex?.dispose()
  }, [labelSize, gl])

  const geo = useMemo(() => {
    const wall = new THREE.CylinderGeometry(CAN.radius, CAN.radius, CAN.wallHeight, segments, 1, true, Math.PI, TAU)
    const neck = new THREE.LatheGeometry(neckProfile, segments)
    const lid = new THREE.LatheGeometry(lidProfile, segments)
    const heel = new THREE.LatheGeometry(heelProfile, segments)
    const base = new THREE.LatheGeometry(baseProfile, segments)
    const tabG = new THREE.ExtrudeGeometry(tabShape(), { depth: 0.012, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.004, bevelSegments: 2, curveSegments: 16 })
    const panelG = new THREE.ExtrudeGeometry(apertureShape(), { depth: 0.002, bevelEnabled: true, bevelThickness: 0.0015, bevelSize: 0.003, bevelSegments: 1, curveSegments: 20 })
    const hole = new THREE.ShapeGeometry(apertureShape(1.05), 20)
    const rivet = new THREE.CylinderGeometry(0.026, 0.03, 0.016, 20)
    return { wall, neck, lid, heel, base, tabG, panelG, hole, rivet }
  }, [segments])

  const mats = useMemo(() => {
    const metal = new THREE.MeshPhysicalMaterial({ color: '#d4d7db', metalness: 1, roughness: 0.24, side: THREE.DoubleSide })
    const lid = new THREE.MeshPhysicalMaterial({ color: '#c9ccd0', metalness: 1, roughness: 0.3, anisotropy: 0.6, side: THREE.DoubleSide })
    const print = new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 0.28, roughness: 0.34, clearcoat: 1, clearcoatRoughness: 0.14 })
    // the print continues over the shoulder (white) and the heel (red); lid and foot stay bare metal
    const neck = new THREE.MeshPhysicalMaterial({ color: PAPER, metalness: 0.28, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12, side: THREE.DoubleSide })
    const heel = new THREE.MeshPhysicalMaterial({ color: RED, metalness: 0.28, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12, side: THREE.DoubleSide })
    const hole = new THREE.MeshBasicMaterial({ color: '#070505', polygonOffset: true, polygonOffsetFactor: -2 })
    return { metal, lid, print, neck, heel, hole }
  }, [])

  useEffect(() => {
    mats.print.map = label
    mats.print.needsUpdate = true
  }, [label, mats])

  const target = useMemo(newPose, [])
  const st = useRef({ spin: 0, vel: 0 })

  useFrame((state, dt) => {
    dt = Math.min(dt, 1 / 20)
    rig.time += dt
    const s = store.s
    samplePose(s, compact, target)
    const b = (rig.beats = beats(s))
    const p = rig.pose
    const λ = reduced ? 10 : 4.2
    const d = THREE.MathUtils.damp
    for (let i = 0; i < 3; i++) {
      p.pos[i] = d(p.pos[i], target.pos[i], λ, dt)
      p.cam[i] = d(p.cam[i], target.cam[i], 3.4, dt)
      p.look[i] = d(p.look[i], target.look[i], 3.4, dt)
    }
    p.tiltX = d(p.tiltX, target.tiltX, λ, dt)
    p.tiltZ = d(p.tiltZ, target.tiltZ, λ, dt)
    p.yaw = d(p.yaw, target.yaw, λ * 0.85, dt)
    p.scale = d(p.scale, target.scale, λ, dt)
    p.rim = d(p.rim, target.rim, 3, dt)
    p.shift = d(p.shift, target.shift, 3.4, dt)

    // a tap/click on the can: it flinches and spins
    if (store.tapPending) {
      store.tapPending = false
      rig.tapAt = rig.time
      st.current.vel += 0.22
    }
    rig.drama = d(rig.drama, store.drama, 6, dt)
    const tap = rig.time - rig.tapAt
    const wobble = tap < 2.5 ? Math.sin(tap * 15) * Math.exp(-tap * 3.2) * 0.2 : 0

    // Idle spin + desktop drag; eases back to a whole turn when the story takes over.
    const sp = st.current
    sp.vel += store.dragImpulse
    store.dragImpulse = 0
    sp.spin += sp.vel
    sp.vel *= Math.pow(0.9, dt * 60)
    if (b.spin > 0.3 && !reduced) sp.spin += dt * (0.42 * b.spin + rig.drama * 5)
    else if (!store.dragging) sp.spin = d(sp.spin, Math.round(sp.spin / TAU) * TAU, 2.5, dt)

    const intro = store.intro
    const e = 1 - intro
    outer.current.position.set(p.pos[0], p.pos[1] - e * e * 2.6, p.pos[2])
    outer.current.rotation.set(p.tiltX + wobble * 0.6, 0, p.tiltZ + e * 0.35 + wobble)
    outer.current.scale.setScalar(p.scale * (0.72 + 0.28 * intro) * (1 + (tap < 1 ? 0.05 * Math.exp(-tap * 7) : 0)))
    spin.current.rotation.y = p.yaw + sp.spin - e * 2.4

    tab.current.rotation.x = -b.lift * 1.2
    panel.current.rotation.x = -b.panel * 1.45

    // Camera with a light pointer parallax (desktop only — pointer stays 0 on touch).
    const cam = state.camera
    const shake = reduced ? 0 : rig.drama * 0.09
    cam.position.set(
      p.cam[0] + store.pointer.x * 0.22 + Math.sin(rig.time * 37) * shake,
      p.cam[1] + store.pointer.y * 0.14 + Math.sin(rig.time * 29 + 1) * shake,
      p.cam[2],
    )
    cam.lookAt(lookAt.set(p.look[0], p.look[1], p.look[2]))
    // phones: slide the frame so the subject sits in the upper band, clear of captions
    const { width: w, height: h } = state.size
    const pc = cam as THREE.PerspectiveCamera
    if (Math.abs((pc.view?.offsetY ?? 0) - p.shift * h) > 0.25 || pc.view?.fullWidth !== w || pc.view?.fullHeight !== h) {
      pc.setViewOffset(w, h, 0, p.shift * h, w, h)
    }

    rig.center.copy(outer.current.position)
    outer.current.updateMatrixWorld()
    rig.spinMatrix.copy(spin.current.matrixWorld)
    spin.current.localToWorld(rig.mouth.copy(CAN.mouth))
    tmp.set(0, 0.35, -1).normalize().transformDirection(spin.current.matrixWorld)
    rig.mouthDir.copy(tmp)
  })

  const wallY = (CAN.wallTop + CAN.wallBottom) / 2
  return (
    <group ref={outer}>
      <group ref={spin}>
        <mesh geometry={geo.wall} material={mats.print} position-y={wallY} />
        <mesh geometry={geo.neck} material={mats.neck} />
        <mesh geometry={geo.lid} material={mats.metal} />
        <mesh geometry={geo.heel} material={mats.heel} />
        <mesh geometry={geo.base} material={mats.metal} />
        <group position-y={CAN.lidY}>
          {/* drop-shaped aperture: reads as the score line until the panel folds in */}
          <mesh geometry={geo.hole} material={mats.hole} rotation-x={-Math.PI / 2} position={[0, 0.0012, -0.065]} />
          <group ref={panel} position={[0, 0.0015, -0.07]}>
            <mesh geometry={geo.panelG} material={mats.lid} rotation-x={-Math.PI / 2} />
          </group>
          <group ref={tab} position={[0, 0.006, 0]}>
            <mesh geometry={geo.tabG} material={mats.lid} rotation-x={-Math.PI / 2} position-z={0.015} />
          </group>
          <mesh geometry={geo.rivet} material={mats.lid} position-y={0.006} />
        </group>
        {droplets > 0 && <Condensation count={droplets} />}
        <Fizz count={fizz} />
      </group>
    </group>
  )
}
