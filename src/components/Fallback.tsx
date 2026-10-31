import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { store } from '../lib/store'
import { newPose, samplePose } from '../three/choreography'

/**
 * No-WebGL path: the real product render, moved by the same choreography
 * (position, tilt, scale) so the story still reads.
 */
export function Fallback({ compact }: { compact: boolean }) {
  const ref = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const pose = newPose()
    const el = ref.current!
    const tick = () => {
      samplePose(store.s, compact, pose)
      const depth = 7 / Math.max(3, pose.cam[2] - pose.pos[2])
      const x = (pose.pos[0] - pose.cam[0]) * 11 * depth
      const y = -(pose.pos[1] - pose.look[1]) * 11 * depth + (1 - store.intro) * 40 - pose.shift * 100
      const deg = (pose.tiltZ * 180) / Math.PI
      el.style.transform = `translate(-50%,-50%) translate(${x}vh, ${y}vh) rotate(${-deg}deg) scale(${depth * pose.scale})`
      el.style.opacity = String(store.intro)
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [compact])

  return (
    <img
      ref={ref}
      src="/assets/product/can-front.png"
      alt=""
      aria-hidden
      className="pointer-events-none fixed top-1/2 left-1/2 z-[2] h-[62svh] w-auto opacity-0 will-change-transform"
      style={{ filter: 'drop-shadow(0 30px 60px rgba(0,0,0,.6))' }}
    />
  )
}
