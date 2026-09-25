// ── Readable Content Extraction ─────────────────────────────────────────────
// Walks the public page's main region and produces an ordered list of
// SpeechSection records. Browser-only: guard calls behind a client check.
//
// Design notes:
//  - We emit *leaf* readable blocks only. A <p> nested inside a <blockquote>
//    is emitted once (as the <p>), never twice.
//  - Skipping happens at the subtree level so hidden/ignored branches cost
//    nothing to traverse.
//  - Text is deduplicated globally to remove responsive desktop/mobile copies
//    of the same copy, which is the most common source of double-reading.

import { detectLocale, normalizeLocaleTag } from "./language-detector"
import { normalizeForSpeech, normalizeWhitespace } from "./text-normalizer"
import {
  TTS_ATTRIBUTES,
  TTS_LIMITS,
  type SpeechSection,
  type SpeechSectionKind,
  type SupportedSpeechLocale,
} from "./types"

/** Tags that never contain speakable content. */
const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEMPLATE",
  "SVG",
  "CANVAS",
  // Image alt text is useful to screen readers, but this page-reading mode is
  // intentionally text-only. Real headings, paragraphs, captions, and buttons
  // layered over an image remain separate DOM nodes and are still spoken.
  "IMG",
  "IFRAME",
  "VIDEO",
  "AUDIO",
  "OBJECT",
  "EMBED",
  "MAP",
  "AREA",
  "TRACK",
  "SOURCE",
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "OPTION",
  "OPTGROUP",
  "PROGRESS",
  "METER",
  "HEAD",
  "LINK",
  "META",
  "BR",
  "HR",
])

/**
 * Chrome/structural regions and app furniture that must not be read during a
 * normal page read. Matched with `closest()` semantics on the subtree root.
 */
const SKIP_SELECTORS = [
  `[${TTS_ATTRIBUTES.ignore}]`,
  "[aria-hidden='true']",
  "[inert]",
  "[hidden]",
  // In-page navigation (breadcrumbs, pagination, tab strips) is chrome.
  "nav",
  // Landmark roles only. Bare <header>/<footer> are NOT skipped: nested inside
  // an article, blockquote or figure they hold real content such as quote
  // attributions and article bylines. The site's actual banner and contentinfo
  // live outside <main>, so extraction never reaches them anyway.
  "[role='navigation']",
  "[role='banner']",
  "[role='contentinfo']",
  "[role='alert']",
  "[role='status']",
  "[role='toolbar']",
  "[role='tooltip']",
  "[role='dialog']",
  "[role='alertdialog']",
  "[data-sonner-toaster]",
  "[data-sonner-toast]",
  "[data-radix-popper-content-wrapper]",
  "[data-nextjs-toast]",
  "[data-nextjs-dialog-overlay]",
  "nextjs-portal",
  ".sr-only",
  "[data-tts-panel]",
  // Carousel transport controls. Their accessible names ("Previous slide",
  // "Next slide", "Go to slide 3", "Pause carousel") are navigation affordances
  // for sighted pointer users, not page content — announcing them mid-read
  // interrupts the prose for no benefit. The shadcn carousel exposes these
  // slots; the hero carousel marks its own controls with data-tts-ignore.
  "[data-slot='carousel-previous']",
  "[data-slot='carousel-next']",
  // Collapsed disclosures/accordions. Radix only adds `hidden` once its exit
  // animation finishes, so match on state as well.
  "[data-state='closed']",
].join(",")

/** Carousel slide wrapper used by both the hero and the shadcn carousel. */
const SLIDE_SELECTOR = "[aria-roledescription='slide']"

/** Sensitive inputs: never read or transmit these, even as labels. */
const SENSITIVE_SELECTORS = [
  "form [type='password']",
  "[data-sensitive]",
  "[data-payment]",
  "[autocomplete*='cc-']",
  "[autocomplete='current-password']",
  "[autocomplete='new-password']",
].join(",")

/**
 * Readable leaf blocks, in the order they are tested. A candidate is only
 * emitted when it contains no nested candidate of its own.
 */
const READABLE_SELECTOR = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "[role='heading']",
  "p",
  "li",
  "dt",
  "dd",
  "blockquote",
  "figcaption",
  "caption",
  "th",
  "td",
  "summary",
  "address",
  "pre",
].join(",")

/** Interactive elements worth reading when they stand alone. */
const CONTROL_SELECTOR = "a[href],button,[role='button'],[role='link']"

interface ExtractOptions {
  /** Visitor's selected locale; used for Latin text and as a tie-breaker. */
  preferredLocale: SupportedSpeechLocale
  /** Optional explicit root. Defaults to `main[data-tts-root]` then `main`. */
  root?: HTMLElement | null
}

export interface ExtractResult {
  sections: SpeechSection[]
  /** Total normalized characters, for the page-size guard. */
  totalCharacters: number
  /** True when the page exceeded `TTS_LIMITS.maxCharsPerPage`. */
  truncated: boolean
}

/** Resolve the region to read. */
export function resolveTtsRoot(
  explicit?: HTMLElement | null
): HTMLElement | null {
  if (explicit) return explicit
  if (typeof document === "undefined") return null
  const tagged = document.querySelector<HTMLElement>(
    `main[${TTS_ATTRIBUTES.root}], [${TTS_ATTRIBUTES.root}]`
  )
  if (tagged) return tagged
  return document.querySelector<HTMLElement>("main")
}

function isElement(node: Node): node is HTMLElement {
  return node.nodeType === Node.ELEMENT_NODE
}

/**
 * Visibility test.
 *
 * Only reads are performed here (no style writes), so the browser computes
 * layout once for the whole extraction pass rather than thrashing.
 *
 * Note the `display: contents` special case: such elements generate no box and
 * therefore report zero client rects, but their children are perfectly
 * visible. Treating them as hidden would silently drop whole subtrees.
 *
 * `opacity: 0` on its own is deliberately NOT treated as hidden. This site's
 * scroll-reveal animations (ScrollReveal in components/scroll-animations.tsx)
 * render every not-yet-scrolled-into-view section at `opacity: 0` before
 * fading it in — which on a long homepage is most of the page at extraction
 * time. Treating that as hidden silently drops most of the readable page.
 */
function isVisuallyHidden(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el)
  if (style.display === "none") return true
  if (style.visibility === "hidden" || style.visibility === "collapse") {
    return true
  }
  if (style.display === "contents") return false

  // `opacity: 0` *paired with* `pointer-events: none` is this codebase's idiom
  // for a genuinely hidden overlay or control that still keeps its layout box:
  // the back-to-top button, hover glows, the intro-video fade, the mobile menu.
  // ScrollReveal never sets `pointer-events: none`, so revealing content is
  // unaffected. Opacity does not inherit, so this only skips the element that
  // actually declares both — not children of a mid-animation wrapper.
  if (
    Number.parseFloat(style.opacity || "1") === 0 &&
    style.pointerEvents === "none"
  ) {
    return true
  }

  // Detached, zero-size, or `content-visibility: hidden` subtrees produce no
  // client rects. Decorative zero-size tags are already filtered by SKIP_TAGS.
  return el.getClientRects().length === 0
}

/**
 * Inactive carousel slides stay in the DOM and keep their layout boxes — they
 * are simply translated out of the track's visible window. Only the slide
 * overlapping the viewport horizontally is the active one, so everything else
 * is skipped. (The hero carousel also sets `aria-hidden`, which is caught
 * earlier; this covers the shadcn/embla carousel, which does not.)
 */
function isInactiveSlide(el: HTMLElement): boolean {
  if (!el.matches(SLIDE_SELECTOR)) return false
  const rect = el.getBoundingClientRect()
  if (rect.width === 0) return true
  const viewportWidth =
    window.innerWidth || document.documentElement.clientWidth
  // Require a real overlap, not a single-pixel edge touch.
  const overlap = Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0)
  return overlap < rect.width / 2
}

/** True when the whole subtree should be skipped. */
function shouldSkipSubtree(el: HTMLElement): boolean {
  if (SKIP_TAGS.has(el.tagName)) return true
  if (el.matches(SKIP_SELECTORS)) return true
  if (el.matches(SENSITIVE_SELECTORS)) return true
  if (isVisuallyHidden(el)) return true
  if (isInactiveSlide(el)) return true
  return false
}

function kindForElement(el: HTMLElement): SpeechSectionKind {
  const tag = el.tagName
  if (/^H[1-6]$/.test(tag) || el.getAttribute("role") === "heading") {
    return "heading"
  }
  if (tag === "LI" || tag === "DT" || tag === "DD") return "list-item"
  if (tag === "FIGCAPTION" || tag === "CAPTION") return "caption"
  if (tag === "TH" || tag === "TD") return "table"
  if (el.matches(CONTROL_SELECTOR)) return "control"

  const priority = el.getAttribute(TTS_ATTRIBUTES.priority)
  if (priority === "heading") return "heading"
  if (priority === "caption") return "caption"
  return "paragraph"
}

/**
 * Nearest author-declared locale, walking up from the element. Falls back to
 * the `lang` attribute so bilingual CMS blocks work without extra markup.
 */
function declaredLocale(
  el: HTMLElement,
  root: HTMLElement
): SupportedSpeechLocale | null {
  let current: HTMLElement | null = el
  while (current) {
    const explicit = normalizeLocaleTag(
      current.getAttribute(TTS_ATTRIBUTES.language)
    )
    if (explicit) return explicit
    const lang = normalizeLocaleTag(current.getAttribute("lang"))
    if (lang) return lang
    if (current === root) break
    current = current.parentElement
  }
  return null
}

/**
 * Visible text of an element, excluding skipped descendants. Uses an explicit
 * walk rather than `textContent` so hidden responsive copies and ignored
 * children do not leak into the spoken string.
 */
function visibleTextOf(el: HTMLElement): string {
  const override = el.getAttribute(TTS_ATTRIBUTES.text)
  if (override !== null) return normalizeWhitespace(override)

  const parts: string[] = []

  const collect = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      parts.push(node.nodeValue ?? "")
      return
    }
    if (!isElement(node)) return

    if (node !== el && shouldSkipSubtree(node)) return

    const nodeOverride = node.getAttribute(TTS_ATTRIBUTES.text)
    if (node !== el && nodeOverride !== null) {
      parts.push(` ${nodeOverride} `)
      return
    }

    for (const child of Array.from(node.childNodes)) collect(child)
  }

  for (const child of Array.from(el.childNodes)) collect(child)
  return normalizeWhitespace(parts.join(""))
}

/** Stable-ish id. Prefers the DOM id so ids survive re-extraction. */
function sectionIdFor(el: HTMLElement, index: number): string {
  if (el.id) return `tts-${el.id}`
  return `tts-section-${index}`
}

/**
 * Extract ordered readable sections from the page.
 *
 * Returns an empty list when there is no main region — callers surface an
 * "empty-content" error rather than speaking the whole document.
 */
export function extractSections(options: ExtractOptions): ExtractResult {
  const { preferredLocale } = options
  const root = resolveTtsRoot(options.root)
  if (!root || typeof window === "undefined") {
    return { sections: [], totalCharacters: 0, truncated: false }
  }

  const sections: SpeechSection[] = []
  const seenText = new Set<string>()
  const emittedElements = new Set<HTMLElement>()
  let totalCharacters = 0
  let truncated = false
  let index = 0

  const emit = (el: HTMLElement, rawText: string, kind: SpeechSectionKind) => {
    if (truncated) return

    const locale =
      declaredLocale(el, root) ?? detectLocale(rawText, preferredLocale)
    const text = normalizeForSpeech(rawText, locale)
    if (text.length < TTS_LIMITS.minSectionChars) return

    const dedupeKey = `${locale}::${text.toLowerCase()}`
    if (seenText.has(dedupeKey)) return

    if (totalCharacters + text.length > TTS_LIMITS.maxCharsPerPage) {
      truncated = true
      return
    }

    seenText.add(dedupeKey)
    totalCharacters += text.length
    emittedElements.add(el)
    sections.push({
      id: sectionIdFor(el, index++),
      text,
      locale,
      element: el,
      kind,
    })
  }

  /**
   * Handle a readable block that also contains readable blocks. Text belonging
   * to the element itself is buffered and flushed whenever a readable child is
   * reached, which preserves document order.
   */
  const walkMixedReadable = (el: HTMLElement) => {
    const kind = kindForElement(el)
    const buffer: string[] = []

    const flush = () => {
      const text = normalizeWhitespace(buffer.join(""))
      buffer.length = 0
      if (text) emit(el, text, kind)
    }

    for (const child of Array.from(el.childNodes)) {
      if (truncated) return

      if (child.nodeType === Node.TEXT_NODE) {
        buffer.push(child.nodeValue ?? "")
        continue
      }
      if (!isElement(child)) continue
      if (shouldSkipSubtree(child)) continue

      const childIsReadable = child.matches(READABLE_SELECTOR)
      const childHasReadable = child.querySelector(READABLE_SELECTOR) !== null

      if (childIsReadable || childHasReadable) {
        flush()
        walk(child)
      } else {
        buffer.push(` ${visibleTextOf(child)} `)
      }
    }

    flush()
  }

  /** Depth-first walk in document order. */
  const walk = (el: HTMLElement) => {
    if (truncated) return
    // Homepage hero slides have an explicit spoken alternative. Include all
    // four in order even though only the current slide is visually exposed.
    if (
      el !== root &&
      !el.hasAttribute(TTS_ATTRIBUTES.carouselSlide) &&
      shouldSkipSubtree(el)
    ) return

    // Author-provided spoken alternative replaces the whole subtree.
    if (el !== root && el.hasAttribute(TTS_ATTRIBUTES.text)) {
      emit(el, el.getAttribute(TTS_ATTRIBUTES.text) ?? "", kindForElement(el))
      return
    }

    const isExplicitSection = el.hasAttribute(TTS_ATTRIBUTES.section)
    const isReadable = el !== root && el.matches(READABLE_SELECTOR)

    if (isReadable) {
      const hasReadableChild = el.querySelector(READABLE_SELECTOR) !== null
      if (!hasReadableChild) {
        // A leaf readable block: emit it whole and stop.
        emit(el, visibleTextOf(el), kindForElement(el))
        return
      }
      // A readable block wrapping other readable blocks — a nested list, or a
      // blockquote around paragraphs plus an attribution. Interleave this
      // element's own text with its readable children so nothing is lost and
      // reading order still matches the document.
      walkMixedReadable(el)
      return
    }

    // An explicit section wrapper with no readable children still gets read.
    if (isExplicitSection && el.querySelector(READABLE_SELECTOR) === null) {
      emit(el, visibleTextOf(el), kindForElement(el))
      return
    }

    for (const child of Array.from(el.children)) {
      if (isElement(child)) walk(child as HTMLElement)
      if (truncated) return
    }


    // After children, pick up standalone controls that carry meaning and were
    // not already captured inside a readable block.
    if (el !== root && el.matches(CONTROL_SELECTOR)) {
      if (!emittedElements.has(el) && !el.querySelector(READABLE_SELECTOR)) {
        const label =
          el.getAttribute("aria-label")?.trim() || visibleTextOf(el)
        if (label) emit(el, label, "control")
      }
    }
  }

  walk(root)

  return { sections, totalCharacters, truncated }
}

/**
 * Cheap fingerprint of the readable content, used to decide whether a DOM
 * mutation actually changed anything worth re-extracting.
 */
export function fingerprintSections(sections: SpeechSection[]): string {
  return `${sections.length}:${sections.map((s) => s.text.length).join(",")}`
}
