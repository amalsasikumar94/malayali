import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)
gsap.defaults({ ease: 'expo.out' })

export { gsap, ScrollTrigger, SplitText, useGSAP }

/** Masked line/char split that cleans up with the gsap context. */
export const split = (target: gsap.DOMTarget, type: 'lines' | 'words' | 'chars' = 'lines') =>
  SplitText.create(target, {
    // chars are always grouped in words so lines never break mid-word
    type: type === 'lines' ? 'lines' : type === 'words' ? 'lines,words' : 'lines,words,chars',
    mask: 'lines',
    linesClass: 'line',
    wordsClass: 'word',
    aria: 'auto',
  })

/** Breakpoints shared by every scene. */
export const MQ = {
  desktop: '(min-width: 821px) and (prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 820px) and (prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
}
