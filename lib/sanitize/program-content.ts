import type { DOMPurifyInstance } from "./story-content"

let purifyPromise: Promise<DOMPurifyInstance> | null = null

async function getPurify(): Promise<DOMPurifyInstance> {
  if (purifyPromise) return purifyPromise
  purifyPromise = (async () => {
    const mod = await import("isomorphic-dompurify")
    const instance = ((mod as any).default ?? mod) as DOMPurifyInstance

    instance.addHook("afterSanitizeAttributes", (node: any) => {
      if (node.tagName === "A") {
        const href = node.getAttribute("href")
        if (href && (href.startsWith("http://") || href.startsWith("https://"))) {
          node.setAttribute("rel", "noopener noreferrer")
          node.setAttribute("target", "_blank")
        }
      }

      if (node.tagName === "IFRAME") {
        const src = node.getAttribute("src")
        const allowedDomains = [
          "youtube.com",
          "www.youtube.com",
          "youtube-nocookie.com",
          "www.youtube-nocookie.com",
        ]
        let isAllowed = false
        try {
          const url = new URL(src)
          isAllowed = allowedDomains.some(
            (d) => url.hostname === d || url.hostname.endsWith(`.${d}`)
          )
        } catch {
          isAllowed = false
        }
        if (!isAllowed) {
          node.remove()
        } else if (!node.getAttribute("sandbox")) {
          node.setAttribute(
            "sandbox",
            "allow-scripts allow-same-origin allow-presentation"
          )
        }
      }
    })

    return instance
  })()
  return purifyPromise
}

const PROGRAM_SANITIZE_CONFIG: Record<string, unknown> = {
  ALLOWED_TAGS: [
    "p", "br", "strong", "em", "u", "s",
    "h1", "h2", "h3", "h4",
    "ul", "ol", "li",
    "blockquote", "cite",
    "a", "img", "figure", "figcaption",
    "iframe",
    "div", "span", "hr",
    "table", "thead", "tbody", "tr", "th", "td",
    "dl", "dt", "dd",
    "span",
  ],
  ALLOWED_ATTR: [
    "href", "rel", "target",
    "src", "alt", "title", "width", "height",
    "class", "style",
    "data-type", "data-align", "data-width",
    "frameborder", "allow", "allowfullscreen", "sandbox",
    "colspan", "rowspan",
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ALLOW_DATA_ATTR: true,
  ADD_ATTR: ["rel"],
  FORBID_TAGS: ["script", "style", "object", "embed", "form", "input", "button"],
  FORBID_ATTR: [
    "onerror", "onload", "onclick", "onmouseover", "onmouseout",
    "onmouseenter", "onmouseleave", "onfocus", "onblur", "onchange", "onsubmit",
  ],
}

export async function sanitizeProgramContent(html: string): Promise<string> {
  const purify = await getPurify()
  return purify.sanitize(html, PROGRAM_SANITIZE_CONFIG)
}
