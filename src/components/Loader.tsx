import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ready } from '../lib/ready'
import { lockScroll } from '../lib/scroll'
import { brand } from '../content'

const LOGO = '/assets/brand/logo.png'
const LOGO_W = 1524
const LOGO_H = 709
const OUT_W = 840 // layer resolution: 420 css px at 2x
// The lightning-bolt "i" (its centre in logo pixels), then the letters around it in reveal order.
const BOLT = { cx: 630, cy: 365 }
type Glyph = { name: string; cx: number; order: number; owns: (x: number, red: boolean) => boolean }
const glyphs: Glyph[] = [
  { name: 'bolt', cx: BOLT.cx, order: -1, owns: (x, red) => (red ? x >= 500 && x < 760 : x >= 523 && x < 760) },
  { name: 'A', cx: 197, order: 1, owns: (x, red) => !red && x < 323 },
  { name: 'D', cx: 428, order: 0, owns: (x, red) => !red && x >= 323 && x < 523 },
  { name: 'P', cx: 854, order: 0, owns: (x, red) => red && x >= 760 && x < 946 },
  { name: 'O', cx: 1064, order: 1, owns: (x, red) => red && x >= 946 && x < 1187 },
  { name: 'L', cx: 1271, order: 2, owns: (x, red) => red && x >= 1187 && x < 1354 },
  { name: 'I', cx: 1421, order: 3, owns: (x, red) => red && x >= 1354 },
]

/** Splits the logo into one transparent layer per glyph (red vs white ink, by column), so each can move on its own. */
function splitLogo(img: HTMLImageElement, layers: HTMLCanvasElement[]) {
  const src = document.createElement('canvas')
  src.width = OUT_W
  src.height = Math.round((OUT_W * LOGO_H) / LOGO_W)
  const g = src.getContext('2d', { willReadFrequently: true })!
  g.drawImage(img, 0, 0, src.width, src.height)
  const all = g.getImageData(0, 0, src.width, src.height)
  const k = LOGO_W / src.width
  const outs = layers.map((c) => {
    c.width = src.width
    c.height = src.height
    return c.getContext('2d')!.createImageData(src.width, src.height)
  })
  const d = all.data
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 8) continue
    const x = ((i / 4) % src.width) * k
    const red = d[i] - d[i + 1] > 60
    const at = glyphs.findIndex((gl) => gl.owns(x, red))
    if (at < 0) continue
    outs[at].data.set(d.subarray(i, i + 4), i)
  }
  layers.forEach((c, i) => c.getContext('2d')!.putImageData(outs[i], 0, 0))
}

/** Logo reveal driven by real readiness (fonts, label texture, GL, founder photo). */
export function Loader({ onDone, reduced }: { onDone: () => void; reduced: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const logo = useRef<HTMLDivElement>(null)
  const layers = useRef<HTMLCanvasElement[]>([])
  const [gone, setGone] = useState(false)

  useEffect(() => {
    lockScroll(true)
    const shown = { v: 0 }
    const started = performance.now()
    let exiting = false

    // The bolt strikes alone, big and centred, then settles into its slot while the letters spring out from behind it.
    const intro = gsap.timeline({ paused: true })
    const [bolt, ...letters] = layers.current
    const ox = `${(BOLT.cx / LOGO_W) * 100}% ${(BOLT.cy / LOGO_H) * 100}%`
    if (reduced) {
      intro.set(layers.current, { autoAlpha: 1 })
    } else {
      intro
        .set(bolt, { transformOrigin: ox, xPercent: (0.5 - BOLT.cx / LOGO_W) * 100, yPercent: (0.5 - BOLT.cy / LOGO_H) * 100, scale: 3.4 })
        .fromTo(bolt, { autoAlpha: 0, scale: 4.2 }, { autoAlpha: 1, scale: 2.6, duration: 0.5, ease: 'expo.out' })
        .to(bolt, { opacity: 0.35, duration: 0.05, repeat: 3, yoyo: true, ease: 'none' }, 0.5)
        .to(bolt, { scale: 1, xPercent: 0, yPercent: 0, duration: 0.85, ease: 'expo.inOut' }, 0.75)
      letters.forEach((el, i) => {
        const gl = glyphs[i + 1]
        intro.fromTo(
          el,
          { autoAlpha: 0, scale: 0.3, x: () => ((BOLT.cx - gl.cx) / LOGO_W) * el.offsetWidth * 0.9, transformOrigin: `${(gl.cx / LOGO_W) * 100}% 55%` },
          { autoAlpha: 1, scale: 1, x: 0, duration: 0.75, ease: 'back.out(1.7)' },
          1.25 + gl.order * 0.09,
        )
      })
      intro.fromTo(logo.current, { scale: 1 }, { scale: 1.05, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }, 1.55)
    }
    const minTime = reduced ? 300 : intro.duration() * 1000 + 350

    const img = new Image()
    img.onload = () => {
      splitLogo(img, layers.current)
      intro.play()
    }
    img.onerror = () => intro.progress(1)
    img.src = LOGO

    const render = () => {
      if (count.current) count.current.textContent = String(Math.round(shown.v * 100)).padStart(3, '0')
      if (bar.current) bar.current.style.transform = `scaleX(${shown.v})`
    }

    const exit = () => {
      if (exiting) return
      exiting = true
      const tl = gsap.timeline({
        onComplete: () => {
          lockScroll(false)
          setGone(true)
        },
      })
      tl.to('[data-loader-fade]', { autoAlpha: 0, duration: 0.4, ease: 'power2.in' })
        .to(logo.current, { scale: reduced ? 1 : 0.86, autoAlpha: 0, duration: 0.6, ease: 'power3.in' }, '<0.1')
        .add(onDone, '-=0.15')
        .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: reduced ? 0.3 : 1.1, ease: 'expo.inOut' }, '-=0.2')
    }

    const unsub = ready.subscribe((n) => {
      gsap.to(shown, {
        v: n,
        duration: 0.9,
        ease: 'power2.out',
        onUpdate: render,
        onComplete: () => {
          if (shown.v >= 0.999) {
            // never cut the logo reveal short, even if the image arrived late
            const wait = Math.max(minTime - (performance.now() - started), (intro.duration() - intro.time()) * 1000 + 350, 0)
            gsap.delayedCall(wait / 1000, exit)
          }
        },
      })
    })
    return () => {
      unsub()
      img.onload = img.onerror = null
      intro.kill()
    }
    // onDone is stable for the app's lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (gone) return null
  return (
    <div ref={root} className="fixed inset-0 z-[100] grid place-items-center bg-ink" style={{ clipPath: 'inset(0 0 0% 0)' }} role="status" aria-label="Loading ADIPOLI">
      <div ref={logo} role="img" aria-label="ADIPOLI" className="relative w-[min(62vw,420px)]" style={{ aspectRatio: `${LOGO_W} / ${LOGO_H}` }}>
        {glyphs.map((gl, i) => (
          <canvas
            key={gl.name}
            ref={(el) => void (el && (layers.current[i] = el))}
            aria-hidden
            className={`invisible absolute inset-0 h-full w-full ${gl.name === 'bolt' ? 'z-[1]' : ''}`}
          />
        ))}
      </div>
      <div data-loader-fade className="absolute inset-x-5 bottom-[max(1.5rem,env(safe-area-inset-bottom))] md:inset-x-10">
        <div className="mb-4 flex items-end justify-between">
          <span className="condensed text-[0.7rem] text-paper/50">
            {brand.taglineA} {brand.taglineB}
          </span>
          <span ref={count} className="font-mono text-sm tabular-nums text-paper/80">
            000
          </span>
        </div>
        <div className="h-px w-full bg-paper/10">
          <div ref={bar} className="h-full origin-left scale-x-0 bg-red" />
        </div>
      </div>
    </div>
  )
}
