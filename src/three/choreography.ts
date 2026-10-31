import { range, sceneProgress, smooth } from '../lib/store'

/**
 * Camera + can poses keyed on the continuous scene position `s`
 * (0 hero · 1 reveal · 2 open · 3 formula · 4 story · 5 finale).
 * Each key only lists what changes; the rest carries forward.
 */
export type Pose = {
  pos: [number, number, number]
  tiltX: number
  tiltZ: number
  yaw: number
  scale: number
  cam: [number, number, number]
  look: [number, number, number]
  rim: number
  /** Phones: lifts the render into the upper band so captions own the lower band (fraction of screen height). */
  shift: number
}

type Key = { s: number } & Partial<Pose>
const TAU = Math.PI * 2

const base: Pose = {
  pos: [0, -0.05, 0],
  tiltX: 0.06,
  tiltZ: -0.05,
  yaw: 0,
  scale: 1,
  cam: [0, 0.25, 7.8],
  look: [0, 0, 0],
  rim: 1,
  shift: 0,
}

const desktop: Key[] = [
  { s: 0 },
  { s: 1, pos: [0, 0, 0], tiltX: 0, tiltZ: 0, cam: [0, 0.1, 6.6], look: [0, 0.05, 0], rim: 0.8 },
  { s: 1.4, yaw: -Math.PI, cam: [1.7, 0.6, 6.0], look: [0, 0.1, 0] },
  { s: 1.8, yaw: -TAU * 0.88, cam: [-1.0, 0.2, 6.3] },
  { s: 2.0, yaw: -TAU, pos: [0, -0.1, 0], cam: [0, 1.4, 5.3], look: [0, 0.8, 0], rim: 0.6 },
  { s: 2.2, cam: [0, 2.75, 2.45], look: [0, 1.12, -0.06] },
  { s: 2.8, cam: [0, 2.55, 2.15], look: [0, 1.14, -0.08] },
  { s: 3.0, pos: [1.9, -0.05, 0], yaw: -TAU * 2, cam: [0, 0, 7.6], look: [0, 0, 0], rim: 0.6 },
  { s: 3.75, pos: [2.0, 0.08, 0], yaw: -TAU * 2 - 0.7 },
  { s: 4.0, pos: [-4.4, 0.4, -1.5], yaw: -TAU * 2.6, tiltZ: -0.3 },
  { s: 4.6, pos: [-4.4, 0.4, -1.5] },
  { s: 5.0, pos: [0, 0.18, 0], tiltZ: 0, tiltX: 0, yaw: -TAU * 3, cam: [0, -0.55, 6.6], look: [0, 0.05, 0], rim: 1.9 },
]

/**
 * Portrait phones. The render is lifted (shift) into the upper ~60% of the screen and
 * captions live in the lower band, so copy never sits on the can. During the long
 * reading scenes (formula, story) the can leaves the frame entirely.
 */
const compact: Key[] = [
  { s: 0, cam: [0, 0.2, 9.4], shift: 0.15 },
  { s: 1, pos: [0, 0, 0], tiltX: 0, tiltZ: 0, cam: [0, 0.1, 8.9], look: [0, 0, 0], rim: 0.8 },
  { s: 1.4, yaw: -Math.PI, cam: [0.6, 0.45, 8.7], look: [0, 0.05, 0] },
  { s: 1.8, yaw: -TAU * 0.88, cam: [-0.45, 0.2, 8.9] },
  { s: 2.0, yaw: -TAU, pos: [0, -0.1, 0], cam: [0, 1.8, 6.6], look: [0, 0.8, 0], rim: 0.6, shift: 0.2 },
  { s: 2.2, cam: [0, 5.0, 2.1], look: [0, 0.98, -0.1] },
  { s: 2.8, cam: [0, 4.75, 1.95], look: [0, 1.0, -0.12] },
  { s: 3.0, pos: [0, 5.5, -3], yaw: -TAU * 2, cam: [0, 0, 9], look: [0, 0, 0], rim: 0.5, shift: 0.15 },
  { s: 4.6, pos: [0, 5.5, -3], yaw: -TAU * 2.6 },
  { s: 5.0, pos: [0, 0, 0], tiltX: 0, yaw: -TAU * 3, cam: [0, -0.3, 12.6], look: [0, 0.05, 0], rim: 1.9, shift: 0.21 },
]

function bake(keys: Key[]) {
  let prev: Pose = base
  return keys.map((k) => {
    const p: Pose = { ...prev, ...k }
    prev = p
    return { s: k.s, p }
  })
}
const baked = { desktop: bake(desktop), compact: bake(compact) }

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const lerp3 = (out: number[], a: number[], b: number[], t: number) => {
  out[0] = lerp(a[0], b[0], t)
  out[1] = lerp(a[1], b[1], t)
  out[2] = lerp(a[2], b[2], t)
}

/** Writes the interpolated pose for scene position `s` into `out`. */
export function samplePose(s: number, isCompact: boolean, out: Pose) {
  const keys = isCompact ? baked.compact : baked.desktop
  let i = 0
  while (i < keys.length - 2 && s > keys[i + 1].s) i++
  const a = keys[i]
  const b = keys[i + 1]
  const t = smooth(range(s, a.s, b.s))
  lerp3(out.pos, a.p.pos, b.p.pos, t)
  lerp3(out.cam, a.p.cam, b.p.cam, t)
  lerp3(out.look, a.p.look, b.p.look, t)
  out.tiltX = lerp(a.p.tiltX, b.p.tiltX, t)
  out.tiltZ = lerp(a.p.tiltZ, b.p.tiltZ, t)
  out.yaw = lerp(a.p.yaw, b.p.yaw, t)
  out.scale = lerp(a.p.scale, b.p.scale, t)
  out.rim = lerp(a.p.rim, b.p.rim, t)
  out.shift = lerp(a.p.shift, b.p.shift, t)
  return out
}

export const newPose = (): Pose => ({ ...base, pos: [...base.pos], cam: [...base.cam], look: [...base.look] })

/** Scroll-driven sub-animations. All pure functions of `s`, so scrubbing backwards just works. */
export function beats(s: number) {
  const open = sceneProgress(s, 2)
  const resealed = s > 4.2 // off-screen during the story; the finale shows a fresh can
  const lift = resealed ? 0 : smooth(range(open, 0.18, 0.5)) * (1 - 0.72 * smooth(range(open, 0.72, 0.95)))
  const panel = resealed ? 0 : smooth(range(open, 0.42, 0.66))
  return {
    lift,
    panel,
    /** The pop: a puff of carbonation at the opening, scrubbed. */
    burst: s < 3.0 ? range(open, 0.5, 0.86) : 0,
    /** Bubbles rising from the opening afterwards. */
    fizz: resealed ? 0 : range(open, 0.6, 0.75) * (1 - range(s, 2.85, 3.0)),
    /** Auto-spin weight: hero, finale and a lazy turn during the formula scene. */
    spin: Math.max(1 - range(s, 0.25, 0.85), range(s, 4.6, 5), 0.35 * range(s, 3.05, 3.3) * (1 - range(s, 3.7, 3.9))),
  }
}
