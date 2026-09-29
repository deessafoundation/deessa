import { type NextRequest, NextResponse } from "next/server"

// Maximum size we're willing to proxy (5 MB) – prevents memory exhaustion
const MAX_BYTES = 5 * 1024 * 1024

// Only proxy http/https images – block data: / javascript: / etc.
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"])

// Allowlist of content-types we'll forward. Anything else is rejected.
const ALLOWED_MIME_PREFIX = ["image/"]

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url")
  if (!raw) {
    return new NextResponse("Missing url param", { status: 400 })
  }

  let target: URL
  try {
    target = new URL(raw)
  } catch {
    return new NextResponse("Invalid URL", { status: 400 })
  }

  if (!ALLOWED_PROTOCOLS.has(target.protocol)) {
    return new NextResponse("Unsupported protocol", { status: 400 })
  }

  let upstream: Response
  try {
    upstream = await fetch(target.toString(), {
      // No Referer sent → bypasses hotlink protection
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; DeessaFoundation-ImageProxy/1.0)",
        Accept: "image/*,*/*;q=0.8",
      },
      // Do NOT follow redirects to data: or other odd schemes
      redirect: "follow",
      // Abort after 10 s
      signal: AbortSignal.timeout(10_000),
    })
  } catch (err) {
    console.error("[img-proxy] fetch error:", err)
    return new NextResponse("Failed to fetch image", { status: 502 })
  }

  if (!upstream.ok) {
    return new NextResponse(`Upstream returned ${upstream.status}`, {
      status: upstream.status,
    })
  }

  const contentType = upstream.headers.get("content-type") ?? ""
  if (!ALLOWED_MIME_PREFIX.some((prefix) => contentType.startsWith(prefix))) {
    return new NextResponse("Not an image", { status: 415 })
  }

  // Stream the body, but cap at MAX_BYTES
  const buffer = await upstream.arrayBuffer()
  if (buffer.byteLength > MAX_BYTES) {
    return new NextResponse("Image too large", { status: 413 })
  }

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      // Cache at the CDN / browser for 24 h, stale-while-revalidate for 7 days
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      // Prevent the proxy URL itself from being used as a hotlink vector
      "X-Content-Type-Options": "nosniff",
    },
  })
}
