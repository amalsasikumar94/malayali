import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { AdaptiveDpr, Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { Can } from './Can'
import { Backdrop3D } from './Backdrop3D'
import { Dust } from './Dust'
import { PolandMap } from './PolandMap'
import { rig } from './rig'
import { ready } from '../lib/ready'
import { tierSettings } from '../lib/device'
import type { Tier } from '../lib/store'

const RED = new THREE.Color('#ff2a1f')

/** Brand-red rim lights that swell in the finale (and with the drama dial). */
function Lights() {
  const a = useRef<THREE.SpotLight>(null!)
  const b = useRef<THREE.SpotLight>(null!)
  useFrame(() => {
    const k = rig.pose.rim * (1 + rig.drama * 1.6)
    a.current.intensity = 28 * k
    b.current.intensity = 20 * k
  })
  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight position={[-3, 5, 4]} intensity={1.6} color="#fff4ea" />
      <spotLight ref={a} position={[-4.5, 2, -3]} angle={0.5} penumbra={1} color={RED} distance={14} decay={1.6} />
      <spotLight ref={b} position={[4.5, -1.5, -2.5]} angle={0.55} penumbra={1} color={RED} distance={14} decay={1.6} />
    </>
  )
}

/** Procedural studio — no HDR download. Tall strips give the cylinder its specular lines. */
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={['#050303']} />
      <Lightformer form="rect" intensity={3.2} position={[0, 5, 2]} scale={[8, 3, 1]} rotation-x={Math.PI / 2} />
      {/* softbox behind/above: what the lid mirrors in the opening close-up */}
      <Lightformer form="rect" intensity={1.3} position={[0, 4, -5]} scale={[9, 4, 1]} rotation-x={0.67} />
      <Lightformer form="rect" intensity={4} position={[-4, 0.5, 3]} scale={[0.6, 9, 1]} rotation-y={Math.PI / 3} />
      <Lightformer form="rect" intensity={2.2} position={[4, 0.5, 2]} scale={[1.2, 9, 1]} rotation-y={-Math.PI / 3} />
      <Lightformer form="rect" intensity={1.6} color="#ff3524" position={[0, -1.8, -6]} scale={[10, 1.2, 1]} />
      <Lightformer form="ring" intensity={1.1} color="#ff5a3c" position={[3, -3, -2]} scale={2.5} />
    </Environment>
  )
}

export function Stage({ tier, compact, reduced }: { tier: Exclude<Tier, 'none'>; compact: boolean; reduced: boolean }) {
  const cfg = tierSettings[tier]
  const [dpr, setDpr] = useState(cfg.dpr[1])
  return (
    <Canvas
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100lvh', zIndex: 2, pointerEvents: 'none' }}
      dpr={[cfg.dpr[0], dpr]}
      camera={{ fov: 30, near: 0.1, far: 60, position: [0, 0.25, 7.8] }}
      gl={{ antialias: tier !== 'low', alpha: true, powerPreference: 'high-performance', toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 1.05 }}
      onCreated={() => requestAnimationFrame(() => ready.resolve('gl'))}
      aria-hidden
    >
      <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(1, d - 0.25))} flipflops={3} />
      <AdaptiveDpr pixelated={false} />
      <Studio />
      <Lights />
      <Can labelSize={cfg.label} segments={tier === 'high' ? 96 : 64} droplets={reduced ? Math.min(cfg.droplets, 200) : cfg.droplets} fizz={cfg.fizz} compact={compact} reduced={reduced} />
      <Backdrop3D compact={compact} />
      <PolandMap compact={compact} />
      <Dust count={reduced ? Math.round(cfg.dust / 2) : cfg.dust} reduced={reduced} />
    </Canvas>
  )
}
