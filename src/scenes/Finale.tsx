import { useRef } from 'react'
import { gsap, MQ, split, useGSAP } from '../lib/gsap'
import { brand, label } from '../content'
import { scrollTo } from '../lib/scroll'
import { DramaDial } from '../components/DramaDial'
import { TapZone } from '../components/TapZone'

export function Finale({ draggable }: { draggable: boolean }) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(`${MQ.desktop}, ${MQ.mobile}`, () => {
        const h = split('[data-final-title]', 'chars')
        const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 55%', toggleActions: 'play none none reverse' } })
        tl.from('[data-final-back] span', { yPercent: 60, autoAlpha: 0, stagger: 0.06, duration: 1.8 }, 0)
          .from(h.chars, { yPercent: 115, stagger: 0.03, duration: 1.2 }, 0.3)
          .from('[data-final-fade]', { autoAlpha: 0, y: 16, stagger: 0.08, duration: 1, ease: 'power3.out' }, 0.6)
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="finale" data-scene className="relative h-svh min-h-[600px]" aria-labelledby="final-title">
      <div data-final-back data-backtype aria-hidden className="pointer-events-none absolute inset-0 z-[1] hidden items-center justify-center overflow-clip md:flex">
        <div className="display flex text-[34vw] leading-none text-red/90">
          {'ADIPOLI'.split('').map((c, i) => (
            <span key={i} className="inline-block">
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-[3] flex h-full flex-col justify-end px-5 pb-[max(3.25rem,calc(env(safe-area-inset-bottom)+2.5rem))] md:px-10 md:pb-8">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[55%] bg-gradient-to-t from-ink via-ink/80 to-transparent" />
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-8">
          <div>
            <h2 id="final-title" data-final-title className="display text-[15vw] md:max-w-[36vw] md:text-[min(8.5vw,16vh)]">
              Stay <em>adipoli.</em>
            </h2>
            <div data-final-fade className="mt-5 md:mt-6">
              <DramaDial />
            </div>
          </div>
          <div data-final-fade className="flex items-center gap-3">
            <a href={brand.handleUrl} target="_blank" rel="noreferrer" className="btn btn-solid" data-cursor="">
              {brand.handleCta}
              <span className="arrow" aria-hidden>
                →
              </span>
            </a>
            <button onClick={() => scrollTo(0)} className="btn !px-5" aria-label="Replay from the start">
              <span aria-hidden>↺</span>
              <span className="max-md:hidden">Replay</span>
            </button>
          </div>
        </div>
        <footer data-final-fade className="mt-5 flex flex-col gap-1 border-t border-paper/10 pt-3 text-[0.68rem] text-paper/40 md:mt-6 md:flex-row md:justify-between md:pt-4 md:text-[0.72rem]">
          <span>
            ADIPOLI® · {brand.handle} · From the makers of {brand.makers}
          </span>
          <span className="max-md:hidden">
            Produced for {label.producedFor} · {label.origin}
          </span>
        </footer>
      </div>

      <TapZone drag={draggable} className="top-[26%] left-1/2 h-[36%] w-[42%] -translate-x-1/2 -translate-y-1/2 md:top-[42%] md:h-[56vh] md:w-[20vw]" />
    </section>
  )
}
