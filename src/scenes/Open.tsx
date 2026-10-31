import { useRef } from 'react'
import { gsap, MQ, split, useGSAP } from '../lib/gsap'
import { Kicker } from '../components/Kicker'

/** Scene 03 — copy around the close-up of the lid while the tab lifts. */
export function Open() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(`${MQ.desktop}, ${MQ.mobile}`, () => {
        const t = split('[data-open-title]', 'chars')
        const sub = split('[data-open-sub]')
        // 10 timeline units = the stuck stretch of the scene (matches beats() in choreography)
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
          defaults: { ease: 'power2.out' },
        })
        tl.from('[data-open-kicker]', { autoAlpha: 0, duration: 1 }, 0.2)
          .from(t.chars, { yPercent: 115, stagger: 0.12, duration: 1.4 }, 0.2)
          // the "pop": a red pressure ring timed to the panel folding in
          .fromTo('[data-open-pop]', { scale: 0.2, autoAlpha: 0 }, { scale: 1.5, autoAlpha: 0.9, duration: 0.5, ease: 'expo.out' }, 5.0)
          .to('[data-open-pop]', { scale: 2.4, autoAlpha: 0, duration: 1.4, ease: 'power2.out' }, 5.5)
          .from(sub.lines, { yPercent: 105, stagger: 0.25, duration: 1.2 }, 5.4)
          .to('[data-open-copy]', { autoAlpha: 0, y: -24, duration: 1 }, 9)
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="open" data-scene data-sticky className="relative h-[260vh] max-md:h-[230vh]" aria-labelledby="open-title">
      <div className="sticky top-0 z-[3] h-svh overflow-clip">
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-ink from-45% via-ink/85 to-transparent md:hidden" />
        <div data-open-pop aria-hidden className="invisible absolute top-1/2 left-1/2 -mt-[18vmin] -ml-[18vmin] h-[36vmin] w-[36vmin] rounded-full border border-hot/70 shadow-[0_0_80px_rgba(255,59,38,.35)]" />
        <div data-open-copy className="absolute inset-x-5 bottom-[max(4.5rem,calc(env(safe-area-inset-bottom)+3.5rem))] md:inset-x-auto md:top-1/2 md:bottom-auto md:left-10 md:w-[40vw] md:-translate-y-1/2">
          <div data-open-kicker>
            <Kicker n="03">Open</Kicker>
          </div>
          <h2 id="open-title" data-open-title className="display mt-4 text-[20vw] md:text-[min(9vw,17vh)]">
            Crack <em>it.</em>
          </h2>
          <p data-open-sub className="mt-5 max-w-[24rem] text-lg leading-snug text-paper/70 md:text-xl">
            Lift the tab. Hear the hiss. Carbonated — just like the label says.
          </p>
        </div>
      </div>
    </section>
  )
}
