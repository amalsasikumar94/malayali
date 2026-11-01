import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { store, STUCK, SCENE_COUNT } from './store'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null
/** Piecewise-linear map: scrollY anchors → scene position anchors. */
let anchorsY: number[] = [0]
let anchorsS: number[] = [0]

/**
 * Builds the scroll → scene map from the DOM. Sticky scenes spend STUCK of their
 * unit while stuck, and the rest while the next section slides in.
 */
function measure() {
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]'))
  const vh = window.innerHeight
  const max = Math.max(1, document.documentElement.scrollHeight - vh)
  const ys: number[] = []
  const ss: number[] = []
  sections.forEach((el, i) => {
    const top = el.offsetTop
    ys.push(top)
    ss.push(i)
    if (el.dataset.sticky !== undefined) {
      // the pinned panel is large-viewport tall, so it unpins when the section's end meets its bottom
      const pin = el.querySelector<HTMLElement>('.sticky')
      ys.push(top + el.offsetHeight - (pin?.offsetHeight ?? vh))
      ss.push(i + STUCK)
    }
  })
  ys.push(max)
  ss.push(SCENE_COUNT - 1)
  // Keep strictly increasing so the lookup never divides by zero.
  for (let i = 1; i < ys.length; i++) if (ys[i] <= ys[i - 1]) ys[i] = ys[i - 1] + 1
  anchorsY = ys
  anchorsS = ss
}

function sceneAt(y: number) {
  const ys = anchorsY
  if (y <= ys[0]) return anchorsS[0]
  for (let i = 1; i < ys.length; i++) {
    if (y < ys[i]) {
      const t = (y - ys[i - 1]) / (ys[i] - ys[i - 1])
      return anchorsS[i - 1] + (anchorsS[i] - anchorsS[i - 1]) * t
    }
  }
  return anchorsS[anchorsS.length - 1]
}

function tick() {
  const y = window.scrollY
  const max = document.documentElement.scrollHeight - window.innerHeight
  store.s = Math.min(SCENE_COUNT - 1, sceneAt(y))
  store.progress = max > 0 ? y / max : 0
}

let started = false

export function initScroll(reducedMotion: boolean) {
  if (started) return
  started = true
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)
  if (!reducedMotion) {
    // Touch devices keep native scrolling (syncTouch off) — it is what feels right on phones.
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.9 })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((t) => lenis?.raf(t * 1000))
    gsap.ticker.lagSmoothing(0)
  }
  ScrollTrigger.addEventListener('refresh', measure)
  measure()
  gsap.ticker.add(tick)
  tick()
}

export function scrollTo(target: string | number) {
  if (lenis) lenis.scrollTo(target, { duration: 1.6 })
  else if (typeof target === 'number') window.scrollTo({ top: target })
  else document.querySelector(target)?.scrollIntoView()
}

export function lockScroll(locked: boolean) {
  if (lenis) locked ? lenis.stop() : lenis.start()
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}
