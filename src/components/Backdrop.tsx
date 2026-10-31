import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { store } from '../lib/store'

/**
 * Fixed backdrop beneath the canvas: a brand-red light pool behind the can that
 * breathes with the scene, plus film grain. Updated outside React.
 */
export function Backdrop() {
  const glow = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = glow.current!
    let last = -1
    const tick = () => {
      const s = store.s
      // strongest in the hero and the finale; quiet behind the reading scenes
      const k =
        (1 - Math.min(1, s / 1.6)) * 0.9 +
        Math.max(0, (s - 4.4) / 0.6) * 1.0 +
        0.18
      const v = Math.round(Math.min(1, k * store.intro) * 100) / 100
      if (v !== last) {
        el.style.opacity = String(v)
        last = v
      }
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  return (
    <div aria-hidden data-css-backdrop className="pointer-events-none fixed inset-0 z-0 h-lvh">
      <div
        ref={glow}
        className="absolute inset-0 opacity-0"
        style={{
          background:
            'radial-gradient(38% 46% at 50% 52%, rgba(205,33,41,0.42), rgba(205,33,41,0.10) 55%, transparent 75%), radial-gradient(70% 50% at 50% 110%, rgba(255,59,38,0.16), transparent 70%)',
        }}
      />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.65))' }} />
    </div>
  )
}

/** Film grain over everything visual (canvas included), under the copy. */
export function Grain() {
  return <div aria-hidden className="grain pointer-events-none fixed inset-0 z-[2] h-lvh" />
}
