import { CAN } from './canSpec'

/**
 * Paints the ADIPOLI wrap label onto a canvas, reconstructed from the product photos:
 * the vertical wordmark (official logo artwork), the bolt split between the off-white
 * top and red bottom, and the side lines "A TROPICAL DRINK WITH / MAGNESIUM & VITAMINS",
 * "100% FRESHNESS." and "0% DRAMA."
 *
 * The front design is printed twice (front and back), so the wordmark faces the viewer
 * from every angle as the can turns.
 *
 * Canvas x = around the can (front centred at W/2), canvas y = down the wall.
 * All copy reads bottom → top, as printed.
 */

export const PAPER = '#ECEBE7'
export const RED = '#D63A2A'
export const LILAC = '#8C8197'
const FONT = '"Archivo Variable", "Arial Black", sans-serif'

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => res(img)
    img.onerror = rej
    img.src = src
  })

/** Points along the bolt's outer edge, in logo.png space (x = reading direction). */
const BOLT: [number, number][] = [
  [662, 130],
  [672, 190],
  [652, 328],
  [748, 328],
  [572, 660],
]

export async function paintLabel(width: number): Promise<HTMLCanvasElement> {
  const W = width
  const H = Math.round((W * CAN.wallHeight) / (2 * Math.PI * CAN.radius))
  const [logo] = await Promise.all([loadImage('/assets/brand/logo.png'), document.fonts.load(`900 40px ${FONT}`)])

  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const ctx = cv.getContext('2d')!

  // ---- Logo-space transform (logo.png is 1524×709; x = reading direction) ----
  const k = (0.915 * H) / 1346 // along the can
  const k2 = k * 1.14 // across: letters a touch fuller, as printed
  const oy = 0.975 * H + 84 * k
  const P = W / 2 // one design per half turn
  // composition centres; W/2 faces the camera, 0 / W is the back (painted twice across the seam)
  const centres = [-P, 0, P, W]
  const at = (c: number) => (lx: number, ly: number): [number, number] => [c - 370 * k2 + ly * k2, oy - lx * k]

  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, W, H)

  // ---- Red lower half, split by the bolt; each panel joins the next one's band ----
  ctx.fillStyle = RED
  for (const c of centres) {
    const L = at(c)
    const leftY = L(662, 0)[1]
    const rightY = L(572, 0)[1]
    const bandL = L(0, -60)[0]
    const bandR = L(0, 700)[0]
    ctx.beginPath()
    ctx.moveTo(bandL, leftY)
    for (const [lx, ly] of BOLT) ctx.lineTo(...L(lx, ly))
    ctx.lineTo(bandR, rightY)
    ctx.lineTo(bandL + P, leftY)
    ctx.lineTo(bandL + P, H + 4)
    ctx.lineTo(bandL, H + 4)
    ctx.closePath()
    ctx.fill()
  }

  // ---- Wordmark + side lines, drawn in logo space ----
  const fit = (text: string, x: number, y: number, w: number, color: string) => {
    ctx.font = `900 100px ${FONT}`
    const m = ctx.measureText(text).width
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(w / m, (w / m) * 0.92)
    ctx.fillStyle = color
    ctx.fillText(text, 0, 0)
    ctx.restore()
  }
  for (const c of centres) {
    ctx.save()
    ctx.translate(c - 370 * k2, oy)
    ctx.rotate(-Math.PI / 2)
    ctx.scale(k, k2)
    ctx.drawImage(logo, 0, 0)
    ctx.textBaseline = 'alphabetic'
    fit('A TROPICAL DRINK WITH', 850, 196, 560, LILAC)
    fit('MAGNESIUM & VITAMINS', 850, 240, 560, RED)
    fit('100% FRESHNESS.', 850, 580, 560, LILAC)
    fit('0% DRAMA.', 140, 580, 300, LILAC)
    ctx.restore()
  }

  return cv
}
