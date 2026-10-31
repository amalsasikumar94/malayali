import { store } from '../lib/store'

/**
 * Invisible hit area over the can. Desktop: drag to turn, click to give it a nudge.
 * Phones: tap for the nudge (with a tiny haptic tick where supported).
 */
export function TapZone({ drag, className }: { drag: boolean; className: string }) {
  const tap = () => {
    if (store.dragMoved > 6) return // that was a drag, not a click
    store.tapPending = true
    navigator.vibrate?.(12)
  }
  return (
    <button
      type="button"
      onClick={tap}
      aria-label="Nudge the can"
      data-drag={drag ? '' : undefined}
      data-cursor={drag ? 'Drag · Click' : 'Tap'}
      className={`absolute z-[3] cursor-none rounded-full outline-offset-8 [-webkit-tap-highlight-color:transparent] ${className}`}
    />
  )
}
