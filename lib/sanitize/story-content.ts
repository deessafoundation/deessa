import sanitizeHtml from "sanitize-html"

const SANITIZE_CONFIG: sanitizeHtml.IOptions = {
  allowedTags: [
    // Text formatting
    "p", "br", "strong", "em", "u", "s",
    // Headings
    "h1", "h2", "h3", "h4",
    // Lists
    "ul", "ol", "li",
    // Quotes
    "blockquote", "cite",
    // Links and media
    "a", "img", "figure", "figcaption", "iframe",
    // Layout
    "div", "span", "hr",
    // Tables
    "table", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "rel", "target"],
    img: ["src", "alt", "title", "width", "height"],
    iframe: ["src", "frameborder", "allow", "allowfullscreen", "sandbox", "width", "height"],
    div: ["class", "data-type", "data-align", "data-width", "data-callout-type"],
    span: ["class", "style"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan"],
    "*": ["class", "data-*"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel", "callto", "sms"],
  allowedSchemesByTag: {
    img: ["http", "https", "data"],
  },
  allowedIframeHostnames: [
    "www.youtube.com",
    "youtube.com",
    "www.youtube-nocookie.com",
    "youtube-nocookie.com",
  ],
  transformTags: {
    a: (tagName, attribs) => {
      // Add security attributes to external links
      if (attribs.href && (attribs.href.startsWith("http://") || attribs.href.startsWith("https://"))) {
        return {
          tagName,
          attribs: {
            ...attribs,
            rel: "noopener noreferrer",
            target: "_blank",
          },
        }
      }
      return { tagName, attribs }
    },
    iframe: (tagName, attribs) => {
      // Add sandbox to iframes if not present
      if (!attribs.sandbox) {
        return {
          tagName,
          attribs: {
            ...attribs,
            sandbox: "allow-scripts allow-same-origin allow-presentation",
          },
        }
      }
      return { tagName, attribs }
    },
  },
}

/**
 * Sanitizes story HTML content before public rendering to prevent XSS attacks.
 *
 * @param html - The HTML content to sanitize
 * @param storyId - Optional story ID for logging purposes
 * @returns Sanitized HTML string
 */
export async function sanitizeStoryContent(
  html: string,
  storyId?: string
): Promise<string> {
  const clean = sanitizeHtml(html, SANITIZE_CONFIG)

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
