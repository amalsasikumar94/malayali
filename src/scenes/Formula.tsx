import { useRef } from 'react'
import { gsap, MQ, split, useGSAP } from '../lib/gsap'
import { Kicker } from '../components/Kicker'
import { actives, label, nutrition, volume } from '../content'

export function Formula() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(`${MQ.desktop}, ${MQ.mobile}`, () => {
        const mobile = window.matchMedia(MQ.mobile).matches
        const d = mobile ? 0.9 : 1.2
        const once = (trigger: Element, start = 'top 82%') => ({ trigger, start, toggleActions: 'play none none reverse' })

        const t = split('[data-formula-title]', 'chars')
        gsap.from(t.chars, { yPercent: 115, stagger: 0.025, duration: d, scrollTrigger: once(root.current!.querySelector('[data-formula-title]')!) })

        gsap.utils.toArray<HTMLElement>('[data-active]').forEach((row) => {
          const tl = gsap.timeline({ scrollTrigger: once(row, 'top 88%') })
          tl.from(row.querySelector('[data-rule]'), { scaleX: 0, duration: d * 1.2 })
            .from(row.querySelectorAll('[data-rise]'), { yPercent: 110, duration: d, stagger: 0.06 }, 0.05)
            .from(row.querySelectorAll('[data-fade]'), { autoAlpha: 0, duration: d }, 0.25)
        })

        const q = split('[data-quote]', 'words')
        gsap.from(q.words, { autoAlpha: 0.12, stagger: 0.04, ease: 'none', scrollTrigger: { trigger: '[data-quote]', start: 'top 80%', end: 'bottom 55%', scrub: true } })

        gsap.from('[data-ing]', { autoAlpha: 0, y: 18, stagger: 0.05, duration: d, scrollTrigger: once(root.current!.querySelector('[data-ings]')!) })
        gsap.from('[data-spec]', { autoAlpha: 0, y: 24, stagger: 0.07, duration: d, scrollTrigger: once(root.current!.querySelector('[data-specs]')!) })
      })
    },
    { scope: root },
  )

  const specs = [
    { k: 'Process', v: label.process.join(' · ') },
    { k: 'Country of origin', v: label.origin },
    { k: 'Produced for', v: `${label.producedFor}, ${label.address}` },
    { k: 'EAN', v: `${label.ean[0]} ${label.ean.slice(1, 7)} ${label.ean.slice(7)}`, mono: true },
    ...(volume ? [{ k: 'Volume', v: volume }] : []),
  ]

  return (
    <section ref={root} id="formula" data-scene className="relative" aria-labelledby="formula-title">
      <div className="relative z-[3] px-5 pt-[22vh] pb-[16vh] md:px-10 md:pr-[44vw] lg:pr-[46vw]">
        {/* phones: the can recedes behind; this keeps copy legible over it */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-ink/85 via-[28vh] to-ink md:hidden" />

        <Kicker n="04">Formula</Kicker>
        <h2 id="formula-title" data-formula-title className="display mt-5 text-[20vw] md:text-[9vw]">
          What’s <em>inside.</em>
        </h2>
        <p className="mt-6 max-w-md text-lg text-paper/60">Transcribed from the back of the can — word for word.</p>

        <ul className="mt-[10vh]" aria-label="Active ingredients">
          {actives.map((a, i) => (
            <li key={a.name} data-active className="relative py-5 md:py-6">
              <span data-rule className="absolute inset-x-0 top-0 h-px origin-left bg-paper/15" />
              <div className="flex items-baseline gap-4 md:gap-6">
                <span className="line-mask font-mono text-xs text-red">
                  <span data-rise className="block">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </span>
                <span className="line-mask flex-1">
                  <span data-rise className="display block text-[13vw] md:text-[6vw]">
                    {a.name}
                  </span>
                </span>
                <span data-fade className="condensed hidden text-[0.66rem] text-paper/50 sm:block">
                  {a.detail}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <figure className="mt-[14vh]">
          <blockquote data-quote className="serif text-[2rem] leading-[1.12] md:text-[3.2vw]">
            “{label.vitaminStatement}”
          </blockquote>
          <figcaption className="condensed mt-6 text-[0.66rem] text-paper/45">— As printed on the can</figcaption>
        </figure>

        <div data-ings className="mt-[14vh]">
          <h3 className="condensed text-[0.7rem] text-paper/55">Ingredients · label order</h3>
          <ol className="mt-6 flex flex-wrap gap-x-3 gap-y-3 text-[1.15rem] leading-snug md:text-[1.35rem]">
            {label.ingredients.map((ing, i) => (
              <li key={ing} data-ing className="flex items-baseline gap-2 rounded-full border border-paper/12 px-4 py-2">
                <span className="font-mono text-[0.62rem] text-red">{String(i + 1).padStart(2, '0')}</span>
                <span>{ing}</span>
              </li>
            ))}
          </ol>
        </div>

        <dl data-specs className="mt-[12vh] grid gap-px overflow-hidden rounded-2xl border border-paper/10 bg-paper/10 sm:grid-cols-2">
          {specs.map((s) => (
            <div key={s.k} data-spec className="bg-ink p-6 md:p-7">
              <dt className="condensed text-[0.62rem] text-paper/45">{s.k}</dt>
              <dd className={`mt-3 text-lg leading-snug ${s.mono ? 'font-mono text-base' : ''}`}>{s.v}</dd>
            </div>
          ))}
        </dl>

        {nutrition.rows.length > 0 && (
          <table className="mt-10 w-full text-left">
            <caption className="condensed mb-4 text-left text-[0.7rem] text-paper/55">Nutrition {nutrition.per && `· per ${nutrition.per}`}</caption>
            <tbody>
              {nutrition.rows.map((r) => (
                <tr key={r.label} className="border-t border-paper/12">
                  <th className="py-3 font-normal text-paper/70">{r.label}</th>
                  <td className="py-3 text-right font-mono">{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
