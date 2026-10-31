import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { store } from '../lib/store'
import { scenes } from '../content'
import { scrollTo } from '../lib/scroll'

/** Top progress hairline + scene index (vertical rail on desktop, chip on mobile). */
export function Progress() {
  const line = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    let last = -1
    const tick = () => {
      if (line.current) line.current.style.transform = `scaleX(${store.progress})`
      const a = Math.min(scenes.length - 1, Math.floor(store.s + 0.25))
      if (a !== last) {
        last = a
        setActive(a)
      }
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 h-[2px] bg-paper/5" aria-hidden>
        <div ref={line} className="h-full origin-left scale-x-0 bg-red" />
      </div>

      <ol className="fixed top-1/2 right-6 z-30 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex" aria-label="Scene index">
        {scenes.map((sc, i) => (
          <li key={sc.id}>
            <button onClick={() => scrollTo(`#${sc.id}`)} className="group flex items-center gap-3 py-0.5" aria-current={i === active ? 'step' : undefined} aria-label={sc.label}>
              <span className={`condensed text-[0.62rem] transition-all duration-500 ${i === active ? 'translate-x-0 text-paper opacity-100' : 'translate-x-2 text-paper/40 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`}>{sc.label}</span>
              <span className={`block h-px transition-all duration-500 ease-out-expo ${i === active ? 'w-8 bg-red' : 'w-3 bg-paper/30 group-hover:w-5'}`} />
            </button>
          </li>
        ))}
      </ol>

      <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-5 z-30 flex items-center gap-2 font-mono text-[0.68rem] text-paper/70 lg:hidden" aria-hidden>
        <span className="text-red">{String(active + 1).padStart(2, '0')}</span>
        <span className="h-px w-5 bg-paper/30" />
        <span key={active} className="condensed animate-[fade_.6s_ease]">{scenes[active].label}</span>
      </div>
    </>
  )
}
