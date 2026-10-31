import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { store } from '../lib/store'

const quips = ['Nope. 0% Drama.', 'Told you. 0% Drama.', 'Back to chill. 0% Drama.', 'Nice try. 0% Drama.']

/**
 * The brand line, made playable: drag drama up and the scene erupts (spin,
 * camera shake, red light). Let go and it springs back to zero.
 */
export function DramaDial() {
  const input = useRef<HTMLInputElement>(null)
  const fill = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(0)
  const [quip, setQuip] = useState('')
  const proxy = useRef({ v: 0 })
  const tries = useRef(0)

  const apply = (v: number) => {
    proxy.current.v = v
    store.drama = v / 100
    setValue(Math.round(v))
    if (input.current) input.current.value = String(v)
    if (fill.current) fill.current.style.transform = `scaleX(${v / 100})`
  }

  const release = () => {
    if (proxy.current.v < 1) return
    gsap.killTweensOf(proxy.current)
    gsap.to(proxy.current, { v: 0, duration: 1.4, ease: 'elastic.out(1, 0.45)', onUpdate: () => apply(Math.max(0, proxy.current.v)) })
    setQuip(quips[tries.current++ % quips.length])
  }

  useEffect(() => () => void (store.drama = 0), [])

  return (
    <div className="w-full max-w-sm select-none">
      <div className="mb-3 flex items-baseline justify-between">
        <label htmlFor="drama" className="condensed text-[0.68rem] text-paper/60">
          Drama level
        </label>
        <output htmlFor="drama" className="font-mono text-sm tabular-nums" aria-live="off">
          <span className={value > 0 ? 'text-hot' : 'text-paper'}>{value}%</span>
        </output>
      </div>
      <div className="relative h-11">
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-paper/20" />
        <span ref={fill} aria-hidden className="absolute inset-x-0 top-1/2 h-[3px] origin-left -translate-y-1/2 scale-x-0 bg-gradient-to-r from-red to-hot" />
        <input
          ref={input}
          id="drama"
          type="range"
          min={0}
          max={100}
          defaultValue={0}
          aria-describedby="drama-quip"
          onInput={(e) => {
            gsap.killTweensOf(proxy.current)
            setQuip('')
            apply(Number((e.target as HTMLInputElement).value))
          }}
          onPointerUp={release}
          onTouchEnd={release}
          onKeyUp={release}
          className="drama-range absolute inset-0 w-full"
        />
      </div>
      <p id="drama-quip" className="serif mt-2 h-7 text-xl text-paper/80" aria-live="polite">
        {quip || (value > 0 ? 'Easy…' : 'Go on, add some drama.')}
      </p>
    </div>
  )
}
