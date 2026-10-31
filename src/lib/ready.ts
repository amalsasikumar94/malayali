/** Tiny readiness registry for the loader. */
type Key = 'label' | 'fonts' | 'founder' | 'gl'

const done = new Set<Key>()
const listeners = new Set<(n: number) => void>()
const total = 4

export const ready = {
  resolve(k: Key) {
    if (done.has(k)) return
    done.add(k)
    listeners.forEach((l) => l(done.size / total))
  },
  subscribe(fn: (n: number) => void) {
    listeners.add(fn)
    fn(done.size / total)
    return () => void listeners.delete(fn)
  },
}
