import { useRef } from 'react'
import { gsap, MQ, split, useGSAP } from '../lib/gsap'
import { Kicker } from '../components/Kicker'
import { brand, founder, label } from '../content'

export function Story() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(`${MQ.desktop}, ${MQ.mobile}`, () => {
        const once = (trigger: gsap.DOMTarget, start = 'top 80%') => ({ trigger, start, toggleActions: 'play none none reverse' })

        gsap.fromTo('[data-ml]', { xPercent: 8 }, { xPercent: -10, ease: 'none', scrollTrigger: { trigger: '[data-ml]', start: 'top bottom', end: 'bottom top', scrub: true } })
        const m = split('[data-meaning]', 'words')
        gsap.from(m.words, { yPercent: 110, stagger: 0.04, duration: 1.1, scrollTrigger: once('[data-meaning]') })

        // cinematic mask: the photo is uncovered upward while its inner image settles
        const tl = gsap.timeline({ scrollTrigger: { trigger: '[data-photo]', start: 'top 85%', end: 'center 50%', scrub: 0.8 } })
        tl.fromTo('[data-photo]', { clipPath: 'inset(100% 0% 0% 0%)', rotate: 0 }, { clipPath: 'inset(0% 0% 0% 0%)', rotate: -2.5, ease: 'power2.inOut' })
          .fromTo('[data-photo] img', { scale: 1.35, yPercent: 8 }, { scale: 1, yPercent: 0, ease: 'power2.out' }, 0)
        gsap.to('[data-photo-wrap]', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '[data-photo-wrap]', start: 'top bottom', end: 'bottom top', scrub: true } })

        const h = split('[data-makers]', 'chars')
        gsap.from(h.chars, { yPercent: 115, stagger: 0.018, duration: 1.2, scrollTrigger: once('[data-makers]') })
        gsap.from('[data-value]', { autoAlpha: 0, y: 30, stagger: 0.12, duration: 1.1, scrollTrigger: once('[data-values]') })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="story" data-scene className="relative z-[3] overflow-clip bg-ink pt-[18vh] pb-[20vh]" aria-labelledby="story-title">
      <div className="px-5 md:px-10">
        <Kicker n="05">Story</Kicker>
      </div>

      {/* The name */}
      <div className="mt-[8vh]">
        <p data-ml lang="ml" className="pl-[4vw] font-ml text-[34vw] leading-[1.15] font-[800] whitespace-nowrap text-red md:text-[21vw]" aria-describedby="meaning">
          {brand.wordMalayalam}
        </p>
        <p id="meaning" data-meaning className="serif mt-6 max-w-3xl px-5 text-[2rem] leading-[1.1] md:px-10 md:text-[3.4vw]">
          <span className="text-red">Adipoli</span> — {brand.wordMeaning}. Said when something is just right.
        </p>
      </div>

      {/* Editorial spread */}
      <div className="mt-[18vh] grid items-center gap-[10vh] px-5 md:grid-cols-12 md:gap-10 md:px-10">
        <figure data-photo-wrap className="md:col-span-5 md:col-start-2">
          <div data-photo className="overflow-hidden rounded-[4px] shadow-[0_40px_120px_-30px_rgba(0,0,0,.9)]">
            <img src={founder.photo} alt={founder.name ? `${founder.name}, founder of ADIPOLI` : 'The founder of ADIPOLI with Malayali bottles'} width={509} height={602} loading="lazy" decoding="async" className="block h-auto w-full" />
          </div>
          <figcaption className="mt-5 flex items-center gap-3">
            <span className="h-px w-8 bg-red" />
            <span className="condensed text-[0.66rem] text-paper/55">
              {founder.name ? `${founder.name}${founder.role ? ` · ${founder.role}` : ''}` : 'The founder'}
            </span>
          </figcaption>
        </figure>

        <div className="md:col-span-5 md:col-start-8">
          <h2 id="story-title" data-makers className="display text-[15vw] md:text-[6vw]">
            From the makers of <em className="text-red">{brand.makers}.</em>
          </h2>
          {founder.bio.map((p) => (
            <p key={p} className="mt-6 max-w-xl text-lg leading-relaxed text-paper/70">
              {p}
            </p>
          ))}
          <p className="mt-8 max-w-md text-base leading-relaxed text-paper/55">
            Produced for {label.producedFor} — {label.address}.
          </p>

          <div data-values className="mt-[8vh]">
            <p className="condensed text-[0.66rem] text-paper/45">Two numbers on every can</p>
            <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-paper/10 bg-paper/10">
              {[brand.taglineA, brand.taglineB].map((v) => {
                const [num, ...rest] = v.split(' ')
                return (
                  <div key={v} data-value className="bg-ink p-5 md:p-7">
                    <p className="display text-[11vw] text-red md:text-[4vw]">{num}</p>
                    <p className="condensed mt-3 text-[0.72rem] text-paper/75">{rest.join(' ')}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

