import sanitizeHtml from "sanitize-html"

const PROGRAM_SANITIZE_CONFIG: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "em", "u", "s",
    "h1", "h2", "h3", "h4",
    "ul", "ol", "li",
    "blockquote", "cite",
    "a", "img", "figure", "figcaption",
    "iframe",
    "div", "span", "hr",
    "table", "thead", "tbody", "tr", "th", "td",
    "dl", "dt", "dd",
  ],
  allowedAttributes: {
    a: ["href", "rel", "target"],
    img: ["src", "alt", "title", "width", "height"],
    iframe: ["src", "frameborder", "allow", "allowfullscreen", "sandbox", "width", "height"],
    div: ["class", "data-type", "data-align", "data-width"],
    span: ["class", "style"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan"],
    "*": ["class", "data-*"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
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

export async function sanitizeProgramContent(html: string): Promise<string> {
  return sanitizeHtml(html, PROGRAM_SANITIZE_CONFIG)
}
