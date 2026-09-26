'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { useAccessibility } from '@/lib/hooks/use-accessibility'
import { ReadingGuideSticker } from './reading-guide-sticker'
import styles from './accessibility-reading-aids.module.css'

const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false

/** A body portal avoids transformed page containers. It never accepts input. */
export function AccessibilityReadingAids() {
  const { preferences } = useAccessibility()
  const mounted = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
  const layer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = layer.current
    if (!element || !['mask', 'guide'].includes(preferences.cursorMode)) return
    let frame = 0
    let position: { x: number; y: number; height: number; target: Element } | null = { x: window.innerWidth / 2, y: window.innerHeight / 2, height: 0, target: document.body }
    const hide = () => { element.style.visibility = 'hidden' }
    const suspended = () => [...document.querySelectorAll('[role="dialog"], [role="alertdialog"], dialog[open]')]
      .some(node => {
        if (node.matches('.accessibility-panel') || node.closest('[aria-hidden="true"], [inert]')) return false
        const bounds = node.getBoundingClientRect()
        if (!node.getClientRects().length || bounds.bottom <= 0 || bounds.top >= innerHeight || bounds.right <= 0 || bounds.left >= innerWidth) return false
        for (let ancestor: Element | null = node; ancestor; ancestor = ancestor.parentElement) {
          const style = getComputedStyle(ancestor)
          if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0) return false
        }
        return true
      })
    const render = () => {
      frame = 0
      if (!position || suspended() || position.target.closest('iframe, video')) { hide(); return }
      const height = Math.min(window.innerHeight, Math.max(160 * preferences.textScale, position.height + 32))
      const top = Math.max(0, Math.min(window.innerHeight - height, position.y - height / 2))
      element.style.setProperty('--reading-top', `${top}px`)
      element.style.setProperty('--reading-bottom', `${top + height}px`)
      const lineHeight = parseFloat(getComputedStyle(position.target).lineHeight) || 24 * preferences.textScale
      const viewportWidth = document.documentElement.clientWidth
      const guideWidth = viewportWidth * 0.5
      const guideLeft = Math.max(8, Math.min(viewportWidth - guideWidth - 8, position.x - guideWidth / 2))
      const underlineY = position.y + (position.height || lineHeight) / 2 + 6
      const guideTop = Math.max(0, Math.min(window.innerHeight - 58, underlineY))
      element.style.setProperty('--guide-left', guideLeft + 'px')
      element.style.setProperty('--guide-width', guideWidth + 'px')
      element.style.setProperty('--guide-top', guideTop + 'px')
      element.style.visibility = 'visible'
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render) }
    const pointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      position = { x: event.clientX, y: event.clientY, height: 0, target: event.target as Element }
      schedule()
    }
    const focus = () => {
      const target = document.activeElement
      if (!target || target === document.body || target.closest('.accessibility-button')) { schedule(); return }
      const bounds = target.getBoundingClientRect()
      position = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2, height: bounds.height, target }
      schedule()
    }
    const exit = () => { position = null; hide() }
    // Observe dialog lifecycle only; our style writes cannot trigger this observer.
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open', 'aria-hidden', 'data-state'] })
    schedule()
    document.addEventListener('pointermove', pointer, { passive: true })
    document.addEventListener('focusin', focus)
    document.addEventListener('transitionend', schedule, true)
    document.documentElement.addEventListener('pointerleave', exit)
    window.addEventListener('blur', exit)
    window.addEventListener('resize', focus)
    document.addEventListener('scroll', focus, { passive: true, capture: true })
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('pointermove', pointer)
      document.removeEventListener('focusin', focus)
      document.removeEventListener('transitionend', schedule, true)
      document.documentElement.removeEventListener('pointerleave', exit)
      window.removeEventListener('blur', exit)
      window.removeEventListener('resize', focus)
      document.removeEventListener('scroll', focus, true)
      hide()
    }
  }, [mounted, preferences.cursorMode, preferences.textScale])

  if (!mounted || !['mask', 'guide'].includes(preferences.cursorMode)) return null
  return createPortal(
    <div ref={layer} className={styles.layer} data-a11y-reading-layer={preferences.cursorMode} aria-hidden="true">
      {preferences.cursorMode === 'mask' ? <><div className={styles.above} /><div className={styles.below} /></> : <div className={styles.guide}><div className={styles.marker} data-a11y-guide-marker={preferences.guideSticker}><ReadingGuideSticker id={preferences.guideSticker} /></div><div className={styles.line} /></div>}
    </div>, document.body,
  )
}
