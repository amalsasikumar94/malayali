import * as THREE from 'three'

/**
 * Slim-can proportions (≈ 53 mm Ø × 134 mm, i.e. height ≈ 2.5 × diameter),
 * cross-checked against can-back.jpg. 1 unit = can radius × 2.
 */
export const CAN = {
  radius: 0.5,
  wallBottom: -1.12,
  wallTop: 1.0,
  wallHeight: 2.12,
  lidY: 1.178,
  /** Centre of the opening, in can-local space. */
  mouth: new THREE.Vector3(0, 1.19, -0.25),
}

const v = (r: number, y: number) => new THREE.Vector2(r, y)

/** Neck taper, double seam, countersink and lid panel. */
export const topProfile = [
  v(0.5, CAN.wallTop - 0.002),
  v(0.499, 1.03),
  v(0.488, 1.075),
  v(0.47, 1.12),
  v(0.462, 1.15),
  v(0.463, 1.165),
  v(0.471, 1.172),
  v(0.473, 1.195),
  v(0.468, 1.212),
  v(0.457, 1.216),
  v(0.449, 1.206),
  v(0.446, 1.185),
  v(0.44, 1.166),
  v(0.43, 1.168),
  v(0.42, 1.177),
  v(0.41, 1.172),
  v(0.398, 1.172),
  v(0.388, CAN.lidY),
  v(0.0, CAN.lidY),
]

/** Bottom curve, standing ring and dome. */
export const bottomProfile = [
  v(0.0, -1.19),
  v(0.2, -1.2),
  v(0.33, -1.225),
  v(0.392, -1.258),
  v(0.405, -1.272),
  v(0.418, -1.278),
  v(0.432, -1.272),
  v(0.452, -1.25),
  v(0.476, -1.205),
  v(0.492, -1.16),
  v(0.5, CAN.wallBottom + 0.002),
]

/** Stay-on-tab outline with finger hole (shape space: +y toward the opening). */
export function tabShape() {
  const s = new THREE.Shape()
  const w = 0.088
  s.moveTo(-w, 0.06)
  s.quadraticCurveTo(-w, 0.12, -0.03, 0.125)
  s.lineTo(0.03, 0.125)
  s.quadraticCurveTo(w, 0.12, w, 0.06)
  s.lineTo(w, -0.17)
  s.quadraticCurveTo(w, -0.255, 0, -0.258)
  s.quadraticCurveTo(-w, -0.255, -w, -0.17)
  s.closePath()

  const hole = new THREE.Path()
  const hw = 0.056
  hole.moveTo(-hw, -0.08)
  hole.lineTo(hw, -0.08)
  hole.lineTo(hw, -0.175)
  hole.quadraticCurveTo(hw, -0.225, 0, -0.226)
  hole.quadraticCurveTo(-hw, -0.225, -hw, -0.175)
  hole.closePath()
  s.holes.push(hole)

  const rivetSlot = new THREE.Path()
  rivetSlot.absellipse(0, 0.015, 0.03, 0.026, 0, Math.PI * 2, false, 0)
  s.holes.push(rivetSlot)
  return s
}

/** Score-line drop shape (shape space: hinge at y=0, far end at +y). */
export function apertureShape(scale = 1) {
  const s = new THREE.Shape()
  const k = scale
  s.moveTo(-0.055 * k, 0)
  s.bezierCurveTo(-0.075 * k, 0.06 * k, -0.11 * k, 0.12 * k, -0.105 * k, 0.19 * k)
  s.bezierCurveTo(-0.1 * k, 0.26 * k, 0.1 * k, 0.26 * k, 0.105 * k, 0.19 * k)
  s.bezierCurveTo(0.11 * k, 0.12 * k, 0.075 * k, 0.06 * k, 0.055 * k, 0)
  s.closePath()
  return s
}

/** Painted parts: the neck carries the white of the label, the bottom curve its red. */
export const neckProfile = topProfile.slice(0, 5)
export const lidProfile = topProfile.slice(4)
export const baseProfile = bottomProfile.slice(0, 7)
export const heelProfile = bottomProfile.slice(6)
