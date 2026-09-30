// ── Reading Start Position ──────────────────────────────────────────────────
// Decides where "Read page" begins: the section the visitor is currently
// looking at, rather than the top of the page. Browser-only; every function
// here reads layout, so call it from an event handler, not during render.
//
// Rules, in order:
//  1. Scrolled to (or near) the very top → start at the first section, so a
//     fresh page load still reads the whole page.
//  2. Otherwise start at the first section, in reading order, that is
//     meaningfully visible in the viewport band below any sticky site header.
//  3. If that section is body text whose heading sits just above the band
//     (usually hidden behind the sticky header), start at the heading instead
//     so the listener hears what the section is about.
//  4. If nothing is visible (e.g. a large image fills the screen), start at the
//     next section below.
//  5. If the visitor is past all readable content (e.g. in the footer), fall
//     back to the first section.
//
// The algorithm is language-agnostic: it runs on the extracted sections before
// any translation, so English, Nepali and the Hindi substitute voice all start
// at the same place.

import { TTS_ATTRIBUTES, type SpeechSection } from "./types"

/** Scrolled less than this and the visitor is still "at the top". */
const TOP_OF_PAGE_PX = 8
/** A heading hidden at most this far above the band still titles the section. */
const HEADING_LOOKBACK_PX = 160
/** A sticky header taller than this share of the viewport is not a header. */
const MAX_HEADER_SHARE = 0.4

const CAROUSEL_SELECTOR = "[aria-roledescription='carousel']"

interface Band {
  top: number
  bottom: number
  left: number
  right: number
}

interface Box {
  top: number
  bottom: number
  left: number
  right: number
  height: number
}

/**
 * Bottom edge of any site header pinned to the top of the viewport. Content
 * underneath it is covered, so it does not count as "on screen".
 */
function pinnedHeaderBottom(root: HTMLElement, viewportHeight: number): number {
  let bottom = 0
  const candidates = document.querySelectorAll<HTMLElement>("header, [role='banner']")
  for (const header of Array.from(candidates)) {
    // Article/card headers inside the readable region are content, not chrome.
    if (root.contains(header)) continue
    const position = window.getComputedStyle(header).position
    if (position !== "sticky" && position !== "fixed") continue
    const rect = header.getBoundingClientRect()
    if (rect.height === 0 || rect.top > 1 || rect.bottom <= 0) continue
    if (rect.height > viewportHeight * MAX_HEADER_SHARE) continue
    bottom = Math.max(bottom, rect.bottom)
  }
  return bottom
}

function viewportBand(root: HTMLElement): Band {
  const height = window.innerHeight || document.documentElement.clientHeight
  const width = window.innerWidth || document.documentElement.clientWidth
  return {
    top: Math.min(pinnedHeaderBottom(root, height), height),
    bottom: height,
    left: 0,
    right: width,
  }
}

/**
 * Layout box for a section. Carousel slides are measured by their carousel,
 * because inactive slides are translated off-screen sideways; this keeps a
 * carousel's slides together and starts them from the first slide.
 * `display: contents` elements report an empty rect, so their contents are
 * measured instead.
 */
function boxOf(el: HTMLElement): Box | null {
  const target = el.hasAttribute(TTS_ATTRIBUTES.carouselSlide)
    ? (el.closest<HTMLElement>(CAROUSEL_SELECTOR) ?? el)
    : el

  let rect: DOMRect = target.getBoundingClientRect()
  if (rect.width === 0 && rect.height === 0) {
    const range = document.createRange()
    range.selectNodeContents(target)
    rect = range.getBoundingClientRect()
  }
  if (rect.width === 0 && rect.height === 0) return null

  return {
    top: rect.top,
    bottom: rect.bottom,
    left: rect.left,
    right: rect.right,
    height: rect.height,
  }
}

function overlapsHorizontally(box: Box, band: Band): boolean {
  return box.right > band.left && box.left < band.right
}

/**
 * True when the section is on screen enough to be "where the visitor is": at
 * least half of it is visible, or — for blocks taller than the viewport — it
 * fills at least a quarter of the band. A line or two of an already-read
 * paragraph peeking out under the header therefore does not count.
 */
function isMeaningfullyVisible(box: Box, band: Band): boolean {
  const visible = Math.min(box.bottom, band.bottom) - Math.max(box.top, band.top)
  if (visible <= 0) return false
  const bandHeight = band.bottom - band.top
  return visible >= Math.min(box.height * 0.5, bandHeight * 0.25)
}

/**
 * Sticky sidebars, sticky players and fixed overlays are always on screen
 * regardless of scroll position, so they never mark the reading position.
 * They are still read normally once playback reaches them.
 */
function isInPinnedLayer(el: HTMLElement, root: HTMLElement): boolean {
  let current: HTMLElement | null = el
  while (current && current !== root) {
    const position = window.getComputedStyle(current).position
    if (position === "fixed" || position === "sticky") return true
    current = current.parentElement
  }
  return false
}

function currentScrollTop(): number {
  return (
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  )
}

/**
 * Index of the section playback should start from, based on what is on screen.
 * Always returns a valid index for a non-empty list (0 when unsure).
 */
export function findReadingStartIndex(
  sections: readonly SpeechSection[],
  root?: HTMLElement | null
): number {
  if (sections.length === 0) return 0
  if (typeof window === "undefined" || typeof document === "undefined") return 0
  if (currentScrollTop() <= TOP_OF_PAGE_PX) return 0

  const scope =
    root ?? sections[0]?.element.closest<HTMLElement>(`[${TTS_ATTRIBUTES.root}], main`) ?? document.body
  const band = viewportBand(scope)
  if (band.bottom - band.top <= 0) return 0

  const boxes = new Map<number, Box | null>()
  const measure = (index: number): Box | null => {
    if (!boxes.has(index)) {
      const section = sections[index]
      boxes.set(index, section && section.element.isConnected ? boxOf(section.element) : null)
    }
    return boxes.get(index) ?? null
  }

  let anchor = -1
  let nextBelow = -1

  for (let index = 0; index < sections.length; index++) {
    const box = measure(index)
    if (!box || !overlapsHorizontally(box, band)) continue

    if (isMeaningfullyVisible(box, band)) {
      if (isInPinnedLayer(sections[index]!.element, scope)) continue
      anchor = index
      break
    }

    // Starts inside or below the band but is not visible enough yet — the
    // next thing the visitor would scroll to.
    if (nextBelow === -1 && box.top >= band.top && !isInPinnedLayer(sections[index]!.element, scope)) {
      nextBelow = index
    }
  }

  if (anchor === -1) return nextBelow === -1 ? 0 : nextBelow

  // Pull in the section's heading when it has just scrolled out of view.
  const previous = sections[anchor - 1]
  if (sections[anchor]!.kind !== "heading" && previous?.kind === "heading") {
    const headingBox = measure(anchor - 1)
    // The heading was not picked itself, so it is at most a sliver on screen.
    // Accept it when it sits above the band (usually under the sticky header).
    if (
      headingBox &&
      overlapsHorizontally(headingBox, band) &&
      headingBox.top < band.top &&
      band.top - headingBox.bottom <= HEADING_LOOKBACK_PX
    ) {
      return anchor - 1
    }
  }

  return anchor
}
