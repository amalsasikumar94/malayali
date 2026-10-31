import type { Tier } from './store'

const mq = (q: string) => typeof window !== 'undefined' && window.matchMedia(q).matches

export const prefersReducedMotion = () => mq('(prefers-reduced-motion: reduce)')
export const isFinePointer = () => mq('(hover: hover) and (pointer: fine)')
export const isCompact = () => mq('(max-width: 820px)') || mq('(pointer: coarse)')

function hasWebGL2() {
  try {
    const c = document.createElement('canvas')
    return !!c.getContext('webgl2')
  } catch {
    return false
  }
}

/** Pick a rendering tier once, at boot. */
export function detectTier(): Tier {
  if (!hasWebGL2()) return 'none'
  const nav = navigator as Navigator & { deviceMemory?: number }
  const memory = nav.deviceMemory ?? 8
  const cores = nav.hardwareConcurrency ?? 8
  if (memory <= 2 || cores <= 2) return 'low'
  return isCompact() ? 'mobile' : 'high'
}

export const tierSettings = {
  high: { dpr: [1, 2] as [number, number], label: 2048, droplets: 520, dust: 650, fizz: 160 },
  mobile: { dpr: [1, 1.75] as [number, number], label: 1536, droplets: 220, dust: 240, fizz: 80 },
  low: { dpr: [1, 1.25] as [number, number], label: 1024, droplets: 0, dust: 120, fizz: 40 },
}
