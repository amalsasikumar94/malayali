import { useRef } from 'react'
import { gsap, MQ, split, useGSAP } from '../lib/gsap'
import { label } from '../content'
import { Kicker } from '../components/Kicker'

/** Facts surfaced while the can turns. All read off the packaging. */
const callouts = [
  { k: 'Design', t: 'Split by the bolt.', b: 'Off-white over can-red, divided by the ADIPOLI lightning bolt.', pos: 'md:top-[24%] md:left-[8%]' },
  { k: 'Formula', t: 'Magnesium + four vitamins.', b: 'Magnesium citrate with niacin, vitamin B6, biotin and vitamin B12.', pos: 'md:top-[30%] md:right-[9%] md:text-right' },
  { k: 'Process', t: `${label.process.join('. ')}.`, b: 'Both printed right on the label.', pos: 'md:bottom-[22%] md:left-[8%]' },
  { k: 'Origin', t: `Made in ${label.origin}.`, b: `Produced for ${label.producedFor}, Warsaw.`, pos: 'md:bottom-[18%] md:right-[9%] md:text-right' },
]

export function Reveal() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      const st = { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.6 }

      mm.add(`${MQ.desktop}, ${MQ.mobile}`, () => {
        const title = split('[data-reveal-title]', 'chars')
        const tl = gsap.timeline({ scrollTrigger: st, defaults: { ease: 'power2.out', duration: 1 } })
        tl.from(title.chars, { yPercent: 110, stagger: 0.03 }, 0)
          .from('[data-reveal-kicker]', { autoAlpha: 0 }, 0)
          .to('[data-reveal-head]', { autoAlpha: 0, y: -30 }, 1.3)
        gsap.utils.toArray<HTMLElement>('[data-callout]').forEach((el, i) => {
          const at = 2.4 + i * 2.0
          tl.fromTo(el, { autoAlpha: 0, y: 28, filter: 'blur(8px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)' }, at)
          tl.fromTo(el.querySelector('[data-rule]'), { scaleX: 0 }, { scaleX: 1 }, at + 0.1)
          if (i < callouts.length - 1) tl.to(el, { autoAlpha: 0, y: -24, filter: 'blur(6px)' }, at + 1.7)
        })
        tl.to({}, { duration: 0.6 })
      })

      mm.add(MQ.reduced, () => {
        gsap.set('[data-callout]', { autoAlpha: 1 })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="reveal" data-scene data-sticky className="relative h-[300vh] max-md:h-[260vh]" aria-labelledby="reveal-title">
      <div className="sticky top-0 z-[3] h-svh overflow-clip">
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-ink via-ink/75 to-transparent md:hidden" />
        <div data-reveal-head className="absolute inset-x-5 bottom-[max(4.5rem,calc(env(safe-area-inset-bottom)+3.5rem))] md:inset-x-10 md:top-28 md:bottom-auto">
          <div data-reveal-kicker>
            <Kicker n="02">The Can</Kicker>
          </div>
          <h2 id="reveal-title" data-reveal-title className="display mt-4 text-[19vw] md:text-[min(8vw,16vh)]">
            Every <em>angle.</em>
          </h2>
        </div>

        {callouts.map((c, i) => {
          const right = c.pos.includes('right')
          return (
            <article key={c.k} data-callout className={`invisible absolute max-md:inset-x-5 max-md:bottom-[max(4.5rem,calc(env(safe-area-inset-bottom)+3.5rem))] md:w-[26vw] md:max-w-sm ${c.pos}`}>
              <p className={`flex items-center gap-3 font-mono text-[0.68rem] text-red ${right ? 'md:justify-end' : ''}`}>
                <span>0{i + 1}</span>
                <span className="condensed text-paper/55">{c.k}</span>
              </p>
              <span data-rule className={`mt-3 block h-px w-full origin-left bg-gradient-to-r from-red to-transparent ${right ? 'md:origin-right md:bg-gradient-to-l' : ''}`} />
              <h3 className="display mt-4 text-[2.4rem] md:text-[2.6rem]">{c.t}</h3>
              <p className={`mt-3 max-w-[22rem] text-[0.98rem] leading-relaxed text-paper/65 ${right ? 'md:ml-auto' : ''}`}>{c.b}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
