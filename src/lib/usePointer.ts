import { useEffect } from 'react'
import { store } from './store'

/** Desktop pointer → NDC parallax, plus drag-to-turn on [data-drag] zones. */
export function usePointer(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    let lastX = 0
    const move = (e: PointerEvent) => {
      store.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      store.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
      if (store.dragging) {
        store.dragImpulse += (e.clientX - lastX) * 0.0035
        store.dragMoved += Math.abs(e.clientX - lastX)
        lastX = e.clientX
      }
    }
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !(e.target as Element).closest('[data-drag]')) return
      store.dragging = true
      store.dragMoved = 0
      lastX = e.clientX
      document.documentElement.classList.add('is-dragging')
    }
    const up = () => {
      store.dragging = false
      document.documentElement.classList.remove('is-dragging')
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    window.addEventListener('blur', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('blur', up)
    }
  }, [enabled])
}
