import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/** Desktop-only cursor: a dot, a lagging ring, and a contextual label. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')

  useEffect(() => {
    document.documentElement.classList.add('has-cursor')
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08 })
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.08 })
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3' })
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3' })
    let hot: Element | null = null
    let seen = false
    gsap.set([dot.current, ring.current], { autoAlpha: 0 })
    const move = (e: PointerEvent) => {
      if (!seen) {
        seen = true
        gsap.set([dot.current, ring.current], { x: e.clientX, y: e.clientY })
        gsap.to([dot.current, ring.current], { autoAlpha: 1, duration: 0.3 })
      }
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
      const t = (e.target as Element).closest('a, button, [data-cursor], [data-drag]')
      if (t !== hot) {
        hot = t
        const l = t?.getAttribute('data-cursor') ?? (t?.hasAttribute('data-drag') ? 'Drag' : '')
        setLabel(l)
        gsap.to(ring.current, { scale: t ? (l ? 2.6 : 1.7) : 1, backgroundColor: t ? 'rgba(205,33,41,0.9)' : 'rgba(205,33,41,0)', borderColor: t ? 'rgba(205,33,41,0)' : 'rgba(236,235,231,0.45)', duration: 0.45, ease: 'expo.out' })
      }
    }
    const leave = () => gsap.to([dot.current, ring.current], { autoAlpha: 0, duration: 0.3 })
    const enter = () => gsap.to([dot.current, ring.current], { autoAlpha: 1, duration: 0.3 })
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    document.addEventListener('pointerenter', enter)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      document.removeEventListener('pointerenter', enter)
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200]">
      <div ref={ring} className="absolute -top-5 -left-5 grid h-10 w-10 place-items-center rounded-full border border-paper/45">
        <span className="condensed scale-[0.4] text-[0.7rem] whitespace-nowrap text-paper">{label}</span>
      </div>
      <div ref={dot} className="absolute -top-[3px] -left-[3px] h-1.5 w-1.5 rounded-full bg-paper mix-blend-difference" />
    </div>
  )
}
