import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { CAN } from './canSpec'

/** Chilled-can condensation: flattened instanced beads seated on the wall. */
export function Condensation({ count }: { count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const geo = useMemo(() => new THREE.SphereGeometry(1, 10, 6), [])
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        metalness: 0,
        roughness: 0.02,
        clearcoat: 1,
        transparent: true,
        opacity: 0.3,
        envMapIntensity: 3.2,
        depthWrite: false,
      }),
    [],
  )

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const n = new THREE.Vector3()
    const up = new THREE.Vector3(0, 1, 0)
    const p = new THREE.Vector3()
    const sc = new THREE.Vector3()
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    for (let i = 0; i < count; i++) {
      const th = rnd() * Math.PI * 2
      const y = CAN.wallBottom + 0.04 + rnd() * (CAN.wallHeight - 0.1)
      const r = 0.0035 + Math.pow(rnd(), 3.2) * 0.017
      n.set(Math.sin(th), 0, Math.cos(th))
      p.copy(n).multiplyScalar(CAN.radius + r * 0.18).setY(y)
      q.setFromUnitVectors(up, n)
      // beads sag: slightly taller than wide
      sc.set(r, r * 0.38, r * (1.08 + rnd() * 0.4))
      ref.current.setMatrixAt(i, m.compose(p, q, sc))
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [count])

  return <instancedMesh ref={ref} args={[geo, mat, count]} frustumCulled={false} />
}
