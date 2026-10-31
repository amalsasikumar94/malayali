import { useRef } from 'react'
import { gsap, split, useGSAP } from '../lib/gsap'
import { store } from '../lib/store'
import { brand } from '../content'
import { TapZone } from '../components/TapZone'

export function Hero({ entered, reduced, draggable }: { entered: boolean; reduced: boolean; draggable: boolean }) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (!entered) return
      const tl = gsap.timeline()
      tl.to(store, { intro: 1, duration: reduced ? 0.01 : 2.6, ease: 'expo.out' }, 0)
      if (!reduced) {
        const a = split('[data-hero-line]', 'chars')
        tl.from(a.chars, { yPercent: 115, duration: 1.3, stagger: 0.022 }, 0.45)
          .from('[data-hero-back] span', { yPercent: 30, autoAlpha: 0, duration: 2, stagger: 0.07 }, 0.1)
          .from('[data-hero-fade]', { autoAlpha: 0, y: 14, duration: 1.1, stagger: 0.08, ease: 'power3.out' }, 0.9)
      }

      // Leaving the hero: copy lifts away, back-type drifts slower than the page.
      const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true }
      gsap.to('[data-hero-copy]', { yPercent: -18, autoAlpha: 0, ease: 'none', scrollTrigger: { ...st, end: 'bottom 35%' } })
      gsap.to('[data-hero-back]', { yPercent: 35, autoAlpha: 0.2, ease: 'none', scrollTrigger: st })
    },
    { scope: root, dependencies: [entered] },
  )

  return (
    <section ref={root} id="hero" data-scene className="relative h-svh min-h-[560px]" style={{ visibility: entered ? 'visible' : 'hidden' }} aria-label='ADIPOLI'>
      {/* Desktop back-type sits beneath the canvas: the can floats in front of its own name. */}
      <div data-hero-back data-backtype aria-hidden className="pointer-events-none absolute inset-0 z-[1] hidden items-center justify-center overflow-clip md:flex">
        <div className="display outline-type flex text-[30vw] leading-none">
          {'ADIPOLI'.split('').map((c, i) => (
            <span key={i} className="inline-block">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Phones: the can owns the upper band (see choreography shift); all copy lives below it. */}
      <div data-hero-copy className="relative z-[3] flex h-full flex-col justify-end px-5 pb-[max(4.25rem,calc(env(safe-area-inset-bottom)+3.25rem))] md:grid md:grid-rows-[auto_1fr_auto] md:justify-normal md:px-10 md:pt-32 md:pb-10">
        <p data-hero-fade className="condensed text-[0.68rem] leading-relaxed text-paper/60 md:max-w-[17rem]">
          {brand.descriptor}
        </p>

        <h1 className="display pointer-events-none mt-4 text-[17vw] md:mt-0 md:grid md:content-center md:text-[clamp(3rem,min(7vw,15vh),9rem)]">
          <span data-hero-line className="block md:max-w-[40vw]">
            <Tagline text={brand.taglineA} />
          </span>
          <span data-hero-line className="block text-red md:mt-[16vh] md:ml-auto md:max-w-[36vw] md:text-right">
            <Tagline text={brand.taglineB} />
          </span>
        </h1>

        <div className="hidden items-end justify-between md:flex">
          <p data-hero-fade className="condensed text-[0.66rem] text-paper/45">
            {draggable ? 'Drag or click the can · Scroll to begin' : 'Scroll to begin'}
          </p>
          <ScrollCue />
        </div>
      </div>
      <div data-hero-fade className="absolute right-5 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[3] flex items-end gap-3 md:hidden">
        <span className="condensed pointer-events-none text-[0.6rem] text-paper/50 [writing-mode:vertical-rl]">Tap the can</span>
        <ScrollCue />
      </div>


      <TapZone drag={draggable} className="top-[34%] left-1/2 h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 md:top-1/2 md:h-[64vh] md:w-[22vw]" />
    </section>
  )
}

/** "100% Freshness." → condensed number + serif-italic word. */
function Tagline({ text }: { text: string }) {
  const [num, ...rest] = text.split(' ')
  return (
    <>
      {num} <em>{rest.join(' ')}</em>
    </>
  )
}

function ScrollCue() {
  return (
    <div className="flex flex-col items-center gap-3" aria-hidden>
      <span className="condensed text-[0.6rem] text-paper/50 [writing-mode:vertical-rl]">Scroll</span>
      <span className="relative block h-12 w-px overflow-hidden bg-paper/15">
        <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2s_cubic-bezier(.7,0,.3,1)_infinite] bg-red" />
      </span>
    </div>
  )
}
