/**
 * Frame-shared mutable state. Written by scroll / pointer handlers, read inside
 * render loops. Deliberately not React state: nothing here should re-render.
 */
export const store = {
  /** Continuous scene position: 0 = hero … 6 = finale. */
  s: 0,
  /** 0..1 of the whole page. */
  progress: 0,
  /** Intro reveal, animated 0 → 1 once loading completes. */
  intro: 0,
  /** Pointer in NDC (-1..1). */
  pointer: { x: 0, y: 0 },
  /** Accumulated drag rotation impulse (radians), consumed by the can rig. */
  dragImpulse: 0,
  dragging: false,
  /** Pixels moved since pointer-down; a click under ~6px counts as a tap. */
  dragMoved: 0,
  /** Set by a tap on the can; the rig consumes it and nudges the can. */
  tapPending: false,
  /** The finale’s drama dial, 0..1. */
  drama: 0,
}

export type Tier = 'high' | 'mobile' | 'low' | 'none'

export const SCENE_COUNT = 6
/** Portion of a sticky scene's timeline spent while it is stuck. */
export const STUCK = 0.8

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
/** Local 0..1 progress of a sticky scene `i` from the global scene position. */
export const sceneProgress = (s: number, i: number) => clamp01((s - i) / STUCK)
export const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a))
export const smooth = (t: number) => t * t * (3 - 2 * t)
