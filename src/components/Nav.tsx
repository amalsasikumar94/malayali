import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { brand, scenes } from '../content'
import { scrollTo, lockScroll } from '../lib/scroll'

const links = scenes.slice(1, 6)

export function Nav() {
  const [open, setOpen] = useState(false)
  const sheet = useRef<HTMLDivElement>(null)

  const mounted = useRef(false)

  useEffect(() => {
    if (!sheet.current) return
    // the loader owns the scroll lock until the first interaction
    if (!mounted.current) {
      mounted.current = true
      return
    }
    lockScroll(open)
    gsap.to(sheet.current, { clipPath: open ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)', duration: 0.8, ease: 'expo.inOut' })
    if (open) gsap.fromTo('[data-sheet-link]', { yPercent: 110 }, { yPercent: 0, stagger: 0.05, duration: 0.8, ease: 'expo.out', delay: 0.2 })
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    scrollTo(`#${id}`)
  }

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-40 h-28 bg-gradient-to-b from-ink/85 to-transparent md:h-32" />
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))] md:px-10 md:pt-7">
        <button onClick={() => go('hero')} aria-label="ADIPOLI — back to top" className="relative z-10">
          <img src="/assets/brand/logo.png" alt="ADIPOLI" className="h-7 w-auto md:h-8" />
        </button>
        <nav aria-label="Scenes" className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <button key={l.id} onClick={() => go(l.id)} className="group condensed relative text-[0.72rem] text-paper/60 transition-colors hover:text-paper" data-cursor="">
              {l.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-full origin-right scale-x-0 bg-red transition-transform duration-500 ease-out-expo group-hover:origin-left group-hover:scale-x-100" />
            </button>
          ))}
        </nav>
        <a href={brand.handleUrl} target="_blank" rel="noreferrer" className="condensed hidden rounded-full border border-paper/20 px-4 py-2.5 text-[0.7rem] transition-colors hover:border-red hover:bg-red md:inline-block">
          {brand.handle}
        </a>
        <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="sheet" className="relative z-10 flex h-11 w-11 items-center justify-center md:hidden" aria-label={open ? 'Close menu' : 'Open menu'}>
          <span className={`absolute h-px w-6 bg-paper transition-transform duration-500 ${open ? 'rotate-45' : '-translate-y-1'}`} />
          <span className={`absolute h-px w-6 bg-paper transition-transform duration-500 ${open ? '-rotate-45' : 'translate-y-1'}`} />
        </button>
      </header>

      <div id="sheet" ref={sheet} className="fixed inset-0 z-40 flex flex-col justify-end bg-ink px-5 pb-[max(2rem,env(safe-area-inset-bottom))] md:hidden" style={{ clipPath: 'inset(0 0 100% 0)' }} aria-hidden={!open}>
        <ul className="mb-10 space-y-1">
          {links.map((l, i) => (
            <li key={l.id} className="overflow-clip">
              <button data-sheet-link tabIndex={open ? 0 : -1} onClick={() => go(l.id)} className="display flex items-baseline gap-4 py-1 text-[13vw]">
                <span className="font-mono text-xs font-normal tracking-normal text-red">0{i + 2}</span>
                {l.label}
              </button>
            </li>
          ))}
        </ul>
        <a href={brand.handleUrl} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1} className="btn self-start">
          {brand.handle}
        </a>
      </div>
    </>
  )
}
