import { describe, expect, it } from "@jest/globals"
import { facebookEmbedUrl, normalizeFacebookPostUrl } from "@/lib/facebook-posts/types"

describe("Facebook post links", () => {
  it("extracts the permalink from official iframe code without rendering its attributes", () => {
    const post = "https://www.facebook.com/NepalAccessibilitySummit/posts/pfbidABC123"
    const code = `<iframe src="https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(post)}&amp;show_text=true&amp;width=500" width="500" height="717" style="border:none" allowfullscreen="true"></iframe>`
    expect(normalizeFacebookPostUrl(code)).toBe(post)
    expect(facebookEmbedUrl(code)).toContain("https://www.facebook.com/plugins/post.php?")
  })
  it.each([
    '<iframe src="https://evil.test/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpage%2Fposts%2F123"></iframe>',
    '<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fevil.test%2Fpage%2Fposts%2F123"></iframe>',
    '<script>alert(1)</script><iframe src="https://www.facebook.com"></iframe>',
    '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
  ])("rejects non-Facebook or mixed HTML embeds: %s", code => {
    expect(normalizeFacebookPostUrl(code)).toBeNull()
  })
  it("normalizes mobile post links and removes tracking", () => {
    expect(normalizeFacebookPostUrl("https://m.facebook.com/deessaFoundation/posts/pfbidABC123/?utm_source=share"))
      .toBe("https://www.facebook.com/deessaFoundation/posts/pfbidABC123")
  })
  it("preserves identity parameters on legacy permalinks and photos", () => {
    expect(normalizeFacebookPostUrl("https://www.facebook.com/story.php?id=123&story_fbid=456&tracking=1"))
      .toBe("https://www.facebook.com/permalink.php?story_fbid=456&id=123")
    expect(normalizeFacebookPostUrl("https://www.facebook.com/photo.php?fbid=456&set=abc"))
      .toBe("https://www.facebook.com/photo.php?fbid=456")
  })
  it.each([
    "javascript:alert(1)", "https://www.facebook.com.evil.test/page/posts/123",
    "https://www.facebook.com@evil.test/page/posts/123", "http://www.facebook.com/page/posts/123",
    "https://user:password@www.facebook.com/page/posts/123", "https://www.facebook.com:8443/page/posts/123",
    "https://www.facebook.com/deessaFoundation", "https://www.facebook.com/share/v/123",
    "https://www.facebook.com/permalink.php?id=123", "https://www.facebook.com/photo.php?fbid=evil",
    '<iframe src="https://www.facebook.com"></iframe>', "https://www.facebook.com/reel/123",
  ])("rejects unsupported or unsafe input: %s", value => {
    expect(normalizeFacebookPostUrl(value)).toBeNull()
    expect(facebookEmbedUrl(value)).toBeNull()
  })
  it("constructs a fixed Facebook embed endpoint with an encoded canonical link", () => {
    const embed = new URL(facebookEmbedUrl("https://www.facebook.com/page/posts/123")!)
    expect(embed.origin + embed.pathname).toBe("https://www.facebook.com/plugins/post.php")
    expect(embed.searchParams.get("href")).toBe("https://www.facebook.com/page/posts/123")
  })
  it("accepts the Copy Link share-post format and removes tracking", () => {
    expect(normalizeFacebookPostUrl("https://www.facebook.com/share/p/1DqLmQT9tC/?mibextid=abc"))
      .toBe("https://www.facebook.com/share/p/1DqLmQT9tC")
    expect(normalizeFacebookPostUrl("https://www.facebook.com.evil.test/share/p/1DqLmQT9tC/"))
      .toBeNull()
  })
})
