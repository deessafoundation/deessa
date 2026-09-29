import { normalizeTerm } from './terms'

export const EXCLUDED = 'a, button, input, textarea, select, form, [contenteditable]:not([contenteditable="false"]), [role="button"], [role="textbox"], [role="dialog"], [role="alertdialog"], dialog, iframe, [hidden], [inert], [aria-hidden="true"], [data-dictionary-exclude], [data-dictionary-ui], .accessibility-panel'

export function eligibleText(node: Node, root: Element): boolean {
  const element = node.nodeType === 1 ? node as Element : node.parentElement
  if (!element || !root.contains(element) || element.closest(EXCLUDED)) return false
  for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
    const style = window.getComputedStyle(ancestor)
    if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse' || style.opacity === '0') return false
  }
  return true
}

export function selectedWord(selection: Selection | null, root: Element) {
  if (!selection || selection.isCollapsed || selection.rangeCount !== 1) return null
  const range = selection.getRangeAt(0)
  if (!eligibleText(range.startContainer, root) || !eligibleText(range.endContainer, root)) return null
  // Inspect intersecting text AND elements: a selection may span an excluded empty control.
  const walker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
  let node: Node | null = walker.currentNode
  do {
    if (range.intersectsNode(node) && !eligibleText(node, root)) return null
    node = walker.nextNode()
  } while (node)
  const term = normalizeTerm(selection.toString())
  return term ? { term, range: range.cloneRange() } : null
}

export function wordAtPoint(x: number, y: number, root: Element) {
  const doc = document as Document & { caretRangeFromPoint?: (x: number, y: number) => Range | null }
  const caret = doc.caretPositionFromPoint?.(x, y)
  const fallback = !caret ? doc.caretRangeFromPoint?.(x, y) : null
  const node = caret?.offsetNode ?? fallback?.startContainer
  const offset = caret?.offset ?? fallback?.startOffset
  if (!node || node.nodeType !== Node.TEXT_NODE || offset === undefined || !eligibleText(node, root)) return null
  const text = node.textContent ?? ''
  const wordCharacter = /[\p{Script=Latin}\p{M}'’-]/u
  let start = offset, end = offset
  while (start > 0 && wordCharacter.test(text[start - 1])) start--
  while (end < text.length && wordCharacter.test(text[end])) end++
  const term = normalizeTerm(text.slice(start, end))
  if (!term) return null
  const range = document.createRange()
  range.setStart(node, start); range.setEnd(node, end)
  if (![...range.getClientRects()].some(rect => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom)) return null
  return { term, range }
}

export function modalIsOpen() {
  return [...document.querySelectorAll('[aria-modal="true"], dialog[open]')].some(node => !node.closest('[hidden], [inert], [aria-hidden="true"]') && node.getClientRects().length > 0)
}
