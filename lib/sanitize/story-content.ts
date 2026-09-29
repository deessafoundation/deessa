// NOTE: DOMPurify (via isomorphic-dompurify) pulls in JSDOM on the server.
// JSDOM has heavy transitive deps (html-encoding-sniffer / @exodus/bytes) that
// have caused ESM/CJS interop failures during Next.js page-data collection.
// To keep the page module evaluable without loading JSDOM at import time we
// load DOMPurify lazily on first use.
export type DOMPurifyInstance = {
  sanitize: (html: string, config?: Record<string, unknown>) => string
  addHook: (name: string, cb: (node: any) => void) => void
}

let purifyPromise: Promise<DOMPurifyInstance> | null = null

function getPurify(): Promise<DOMPurifyInstance> {
  if (purifyPromise) return purifyPromise
  purifyPromise = (async () => {
    const mod = await import("isomorphic-dompurify")
    const instance = ((mod as any).default ?? mod) as DOMPurifyInstance

    // Configure DOMPurify hooks once
    instance.addHook("afterSanitizeAttributes", (node: any) => {
      // Add rel="noopener noreferrer" to external links for security
      if (node.tagName === "A") {
        const href = node.getAttribute("href")
        if (href && (href.startsWith("http://") || href.startsWith("https://"))) {
          node.setAttribute("rel", "noopener noreferrer")
          node.setAttribute("target", "_blank")
        }
      }

      // Validate iframe sources - only allow YouTube
      if (node.tagName === "IFRAME") {
        const src = node.getAttribute("src")
        if (src && !isAllowedIframeSrc(src)) {
          // Remove the iframe if source is not allowed
          node.remove()
          console.warn("Removed iframe with disallowed source:", src)
        } else if (src) {
          // Add sandbox attribute for security
          if (!node.getAttribute("sandbox")) {
            node.setAttribute(
              "sandbox",
              "allow-scripts allow-same-origin allow-presentation"
            )
          }
        }
      }
    })

    return instance
  })()
  return purifyPromise
}

const SANITIZE_CONFIG: Record<string, unknown> = {
  ALLOWED_TAGS: [
    // Text formatting
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    // Headings
    "h1",
    "h2",
    "h3",
    "h4",
    // Lists
    "ul",
    "ol",
    "li",
    // Quotes
    "blockquote",
    "cite",
    // Links and media
    "a",
    "img",
    "figure",
    "figcaption",
    "iframe",
    // Layout
    "div",
    "span",
    "hr",
    // Tables
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
  ALLOWED_ATTR: [
    // Link attributes
    "href",
    "rel",
    "target",
    // Media attributes
    "src",
    "alt",
    "title",
    "width",
    "height",
    // Styling
    "class",
    "style",
    // Layout block attributes
    "data-type",
    "data-align",
    "data-width",
    "data-callout-type",
    // Iframe attributes
    "frameborder",
    "allow",
    "allowfullscreen",
    "sandbox",
    // Table attributes
    "colspan",
    "rowspan",
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ALLOW_DATA_ATTR: true,
  ADD_ATTR: ["rel"],
  FORBID_TAGS: ["script", "style", "object", "embed", "form", "input", "button"],
  FORBID_ATTR: [
    "onerror",
    "onload",
    "onclick",
    "onmouseover",
    "onmouseout",
    "onmouseenter",
    "onmouseleave",
    "onfocus",
    "onblur",
    "onchange",
    "onsubmit",
  ],
}

/**
 * Sanitizes story HTML content before public rendering to prevent XSS attacks.
 * Async because DOMPurify is loaded lazily to avoid pulling JSDOM into the
 * module graph at import time (see header comment).
 *
 * @param html - The HTML content to sanitize
 * @param storyId - Optional story ID for logging purposes
 * @returns Sanitized HTML string
 */
export async function sanitizeStoryContent(
  html: string,
  storyId?: string
): Promise<string> {
  const purify = await getPurify()
  const clean = purify.sanitize(html, SANITIZE_CONFIG)

  // Log if content was modified during sanitization
  if (clean !== html) {
    console.warn("Content sanitized for story:", storyId, {
      originalLength: html.length,
      sanitizedLength: clean.length,
      removed: html.length - clean.length,
    })
  }

  return clean
}

/**
 * Helper function to check if iframe source is from an allowed domain
 * @param src - The iframe source URL
 * @returns True if the source is allowed, false otherwise
 */
export function isAllowedIframeSrc(src: string): boolean {
  const allowedDomains = [
    "youtube.com",
    "www.youtube.com",
    "youtube-nocookie.com",
    "www.youtube-nocookie.com",
  ]

  try {
    const url = new URL(src)
    return allowedDomains.some(
      (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}
