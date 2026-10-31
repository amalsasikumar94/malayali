import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { detectTier, isFinePointer, prefersReducedMotion } from './lib/device'
import { initScroll } from './lib/scroll'
import { ready } from './lib/ready'
import { founder } from './content'
import { Loader } from './components/Loader'
import { Nav } from './components/Nav'
import { Progress } from './components/Progress'
import { Cursor } from './components/Cursor'
import { Backdrop, Grain } from './components/Backdrop'
import { Fallback } from './components/Fallback'
import { usePointer } from './lib/usePointer'
import { useMedia } from './lib/useMedia'
import { Hero } from './scenes/Hero'
import { Reveal } from './scenes/Reveal'
import { Open } from './scenes/Open'
import { Formula } from './scenes/Formula'
import { Story } from './scenes/Story'
import { Finale } from './scenes/Finale'

// three.js + R3F live in their own chunk so the loader paints immediately.
const Stage = lazy(() => import('./three/Stage').then((m) => ({ default: m.Stage })))

export function App() {
  const env = useMemo(
    () => ({ tier: detectTier(), fine: isFinePointer(), reduced: prefersReducedMotion() }),
    [],
  )
  const [entered, setEntered] = useState(false)
  // same breakpoint as the CSS layout, and live — the 3D framing must never disagree with the page
  const compact = useMedia('(max-width: 820px)')

  useEffect(() => {
    initScroll(env.reduced)
    document.fonts.ready.then(() => ready.resolve('fonts'))
    const img = new Image()
    img.onload = img.onerror = () => ready.resolve('founder')
    img.src = founder.photo
    document.documentElement.classList.toggle('has-gl', env.tier !== 'none')
    if (env.tier === 'none') {
      ready.resolve('gl')
      ready.resolve('label')
    }
    // never trap the visitor behind the loader
    const t = window.setTimeout(() => (['fonts', 'founder', 'gl', 'label'] as const).forEach((k) => ready.resolve(k)), 9000)
    return () => window.clearTimeout(t)
  }, [env])

  usePointer(env.fine && !env.reduced)

  return (
    <>
      <Backdrop />
      {env.tier === 'none' ? (
        <Fallback compact={compact} />
      ) : (
        <Suspense fallback={null}>
          <Stage tier={env.tier} compact={compact} reduced={env.reduced} />
        </Suspense>
      )}
      <Grain />
      <Nav />
      <Progress />
      <main>
        <Hero entered={entered} reduced={env.reduced} draggable={env.fine && env.tier !== 'none'} />
        <Reveal />
        <Open />
        <Formula />
        <Story />
        <Finale draggable={env.fine && env.tier !== 'none'} />
      </main>
      {env.fine && <Cursor />}
      <Loader reduced={env.reduced} onDone={() => setEntered(true)} />
    </>
  )
}
