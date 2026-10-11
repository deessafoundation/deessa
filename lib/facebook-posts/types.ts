export interface FacebookPost {
  id: string
  post_url: string
  title: string
  image_url: string | null
  image_alt: string | null
  display_order: number
  is_published: boolean
  created_at: string
  excerpt: string | null
  tags: string[]
  published_at: string | null
  views: number
  clicks: number
}

export const FACEBOOK_POST_COLUMNS = "id,post_url,title,image_url,image_alt,display_order,is_published,created_at,excerpt,tags,published_at,views,clicks"

/** Normalize supported post links without following external redirects. */
export function normalizeFacebookPostUrl(value: string): string | null {
  try {
    if (value.length > 8192) return null
    let input = value.trim()
    if (input.startsWith("<")) {
      if (!/^<iframe\b[^<>]*>\s*<\/iframe>$/i.test(input)) return null
      const src = input.match(/\ssrc\s*=\s*(["'])(.*?)\1/i)
      if (!src) return null
      input = src[2].replace(/&amp;/gi, "&")
    }
    let url = new URL(input)
    if (url.origin === "https://www.facebook.com" && url.pathname === "/plugins/post.php" && !url.username && !url.password) {
      const permalink = url.searchParams.get("href")
      if (!permalink || permalink.length > 2048) return null
      url = new URL(permalink)
    } else if (value.trim().startsWith("<")) return null
    if (url.href.length > 2048) return null
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null
    if (!["facebook.com", "www.facebook.com", "m.facebook.com"].includes(url.hostname)) return null
    const path = url.pathname.replace(/\/$/, "")
    const canonical = new URL(`https://www.facebook.com${path}`)
    if (/^\/share\/p\/[A-Za-z0-9]+$/.test(path)) return canonical.href
    if (/^\/[\w.-]+\/posts\/[\w]+$/.test(path)) return canonical.href
    if (path === "/permalink.php" || path === "/story.php") {
      const post = url.searchParams.get("story_fbid")
      const page = url.searchParams.get("id")
      if (!post || !/^[\w]+$/.test(post) || !page || !/^\d+$/.test(page)) return null
      canonical.pathname = "/permalink.php"
      canonical.searchParams.set("story_fbid", post)
      canonical.searchParams.set("id", page)
      return canonical.href
    }
    if (path === "/photo.php" || path === "/photo") {
      const photo = url.searchParams.get("fbid")
      if (!photo || !/^\d+$/.test(photo)) return null
      canonical.pathname = "/photo.php"
      canonical.searchParams.set("fbid", photo)
      return canonical.href
    }
    return null
  } catch {
    return null
  }
}

export function facebookEmbedUrl(postUrl: string): string | null {
  const canonical = normalizeFacebookPostUrl(postUrl)
  if (!canonical) return null
  return `https://www.facebook.com/plugins/post.php?${new URLSearchParams({ href: canonical, show_text: "true", width: "500" })}`
}
