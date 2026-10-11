"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FacebookPostPreview } from "@/components/facebook-posts/facebook-post-preview"
import { normalizeFacebookPostUrl, type FacebookPost } from "@/lib/facebook-posts/types"
import { deleteFacebookPost, saveFacebookPost } from "@/lib/actions/facebook-posts"
import { Calendar, ChevronDown, ChevronUp } from "lucide-react"

const empty = { 
  id: undefined as string | undefined, 
  post_url: "", 
  title: "", 
  image_url: "", 
  image_alt: "", 
  display_order: 0, 
  is_published: false,
  excerpt: "",
  tags: [] as string[],
  published_at: null as string | null,
  views: 0,
  clicks: 0,
  created_at: new Date().toISOString(),
}

export function FacebookPostsManager({ post }: { post?: FacebookPost }) {
  const [draft, setDraft] = useState(post ? { 
    ...post, 
    image_url: post.image_url ?? "", 
    image_alt: post.image_alt ?? "",
    excerpt: post.excerpt ?? "",
    tags: post.tags ?? [],
    published_at: post.published_at ?? null,
  } : empty)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)
  const [pending, startTransition] = useTransition()
  const [previewMode, setPreviewMode] = useState<"admin" | "public">("admin")
  const [showUrlHelp, setShowUrlHelp] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const router = useRouter()
  const previewUrl = normalizeFacebookPostUrl(draft.post_url)

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(async () => {
      try {
        const result = await saveFacebookPost({ 
          ...draft, 
          image_url: draft.image_url || null, 
          image_alt: draft.image_alt || null,
          excerpt: draft.excerpt || null,
          tags: draft.tags,
          published_at: draft.published_at,
        })
        if (!result.ok) { setMessage({ text: result.error, error: true }); return }
        setMessage({ text: draft.is_published ? "Published. The first three published entries appear on the homepage in display order." : "Draft saved. Enable Publish on homepage to make it visible.", error: false })
        if (!draft.id && result.id) router.push(`/admin/community-posts/${result.id}`)
        router.refresh()
      } catch { setMessage({ text: "Could not save the post. Please try again.", error: true }) }
    })
  }

  function addTag() {
    const tag = tagInput.trim()
    if (tag && !draft.tags.includes(tag) && draft.tags.length < 10) {
      setDraft({ ...draft, tags: [...draft.tags, tag] })
      setTagInput("")
    }
  }

  function removeTag(tagToRemove: string) {
    setDraft({ ...draft, tags: draft.tags.filter(t => t !== tagToRemove) })
  }

  function remove(post: FacebookPost) {
    if (!window.confirm(`Remove “${post.title}” from the website? The Facebook post will remain unchanged.`)) return
    startTransition(async () => {
      try {
        const result = await deleteFacebookPost(post.id)
        setMessage({ text: result.ok ? "Website entry removed." : result.error, error: !result.ok })
        if (result.ok) { router.push("/admin/community-posts"); router.refresh() }
      } catch { setMessage({ text: "Could not remove the entry. Please try again.", error: true }) }
    })
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/community-posts" className="inline-flex min-h-11 items-center underline">Back to community posts</Link>
      <header className="space-y-2"><h1 className="text-3xl font-bold">{post ? post.title : "Add community post"}</h1><p className="text-muted-foreground">Paste a public Facebook post link. The first three published entries appear between testimonials and contact on the homepage.</p></header>
      {post && <section aria-label="Post details" className="rounded-xl border bg-card p-5">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div><dt className="text-sm text-muted-foreground">Status</dt><dd className="font-medium">{post.is_published ? "Published" : "Draft — hidden on homepage"}</dd></div>
          <div><dt className="text-sm text-muted-foreground">Platform</dt><dd>Facebook</dd></div>
          <div><dt className="text-sm text-muted-foreground">Display order</dt><dd>{post.display_order}</dd></div>
          <div><dt className="text-sm text-muted-foreground">Views</dt><dd>{post.views}</dd></div>
          <div><dt className="text-sm text-muted-foreground">Clicks</dt><dd>{post.clicks}</dd></div>
          {post.published_at && <div><dt className="text-sm text-muted-foreground">Scheduled for</dt><dd>{new Date(post.published_at).toLocaleString()}</dd></div>}
        </dl>
        <a href={post.post_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center underline">View original Facebook post<span className="sr-only"> (opens in a new tab)</span></a>
      </section>}
      {message && <p id="community-message" role={message.error ? "alert" : "status"} className="rounded-lg border p-4">{message.text}</p>}
      <form onSubmit={save} className="space-y-5 rounded-xl border bg-card p-6" aria-describedby={message?.error ? "community-message" : undefined}>
        <h2 className="text-xl font-semibold">{draft.id ? "Edit post" : "Add a post"}</h2>
        <fieldset disabled={pending} className="space-y-5">
          {/* URL Field with Help */}
          <div className="space-y-2">
            <Label htmlFor="post-url">Facebook post link or embed code</Label>
            <Textarea 
              id="post-url" 
              rows={4} 
              required 
              aria-required="true" 
              maxLength={8192} 
              value={draft.post_url} 
              onChange={e => setDraft({ ...draft, post_url: e.target.value })} 
              aria-describedby="post-url-help" 
            />
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowUrlHelp(!showUrlHelp)}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                {showUrlHelp ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                What links are supported?
              </button>
              {showUrlHelp && (
                <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                  <p className="mb-2 font-medium">Supported URL formats:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Post: https://www.facebook.com/deessaFoundation/posts/123...</li>
                    <li>• Share: https://www.facebook.com/share/p/ABC123...</li>
                    <li>• Permalink: https://www.facebook.com/permalink.php?story_fbid=...&id=...</li>
                    <li>• Photo: https://www.facebook.com/photo.php?fbid=...</li>
                    <li>• Or paste the entire iframe embed code from Facebook</li>
                  </ul>
                  <p className="mt-2 text-muted-foreground">Page URLs, videos, and Reels are not supported yet.</p>
                </div>
              )}
              <p id="post-url-help" className="text-sm text-muted-foreground">
                Paste the entire official iframe code or a post link. We extract the permalink automatically and never execute pasted HTML.
              </p>
            </div>
            {previewUrl && <p className="break-all text-sm text-green-600">✓ Valid Facebook post detected</p>}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="post-title">Card title</Label>
            <Input 
              id="post-title" 
              required 
              aria-required="true" 
              maxLength={120} 
              value={draft.title} 
              onChange={e => setDraft({ ...draft, title: e.target.value })} 
            />
            <p className="text-sm text-muted-foreground">{draft.title.length}/120 characters</p>
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="post-excerpt">
              Excerpt <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea 
              id="post-excerpt" 
              rows={3} 
              maxLength={500} 
              value={draft.excerpt} 
              onChange={e => setDraft({ ...draft, excerpt: e.target.value })} 
              placeholder="Add a brief description to appear on the homepage (150-300 characters recommended)"
            />
            <p className="text-sm text-muted-foreground">{draft.excerpt.length}/500 characters</p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="post-tags">
              Tags <span className="text-muted-foreground">(optional, max 10)</span>
            </Label>
            <div className="flex gap-2">
              <Input 
                id="post-tags" 
                maxLength={50} 
                value={tagInput} 
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                }}
                placeholder="Add a tag and press Enter"
                disabled={draft.tags.length >= 10}
              />
              <Button type="button" variant="outline" onClick={addTag} disabled={!tagInput.trim() || draft.tags.length >= 10}>
                Add
              </Button>
            </div>
            {draft.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {draft.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 rounded-full hover:bg-primary/20"
                      aria-label={`Remove tag ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="post-order">Display order (lowest first)</Label>
            <Input 
              id="post-order" 
              type="number" 
              min={0} 
              max={10000} 
              step={1} 
              required 
              value={draft.display_order} 
              onChange={e => setDraft({ ...draft, display_order: e.target.valueAsNumber })} 
            />
            <p className="text-sm text-muted-foreground">Lower numbers appear first. Use the Reorder Posts button for visual arrangement.</p>
          </div>

          {/* Publishing Options */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-medium">Publishing Options</h3>
            
            <div className="flex items-center gap-3">
              <Checkbox 
                id="post-published" 
                checked={draft.is_published} 
                onCheckedChange={value => setDraft({ ...draft, is_published: value === true })} 
              />
              <Label htmlFor="post-published">Publish on homepage</Label>
            </div>

            {/* Scheduling */}
            {draft.is_published && (
              <div className="space-y-2 pl-7">
                <Label htmlFor="post-schedule" className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  Schedule for later (optional)
                </Label>
                <Input 
                  id="post-schedule" 
                  type="datetime-local" 
                  value={draft.published_at ? new Date(draft.published_at).toISOString().slice(0, 16) : ""} 
                  onChange={e => setDraft({ ...draft, published_at: e.target.value ? new Date(e.target.value).toISOString() : null })} 
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty to publish immediately. Scheduled posts appear on the homepage at the specified time.
                </p>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Drafts do not appear on the homepage. Enable publishing above to show this post. Only the first three published posts are displayed.
            </p>
          </div>

          {/* Save Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button type="submit">
              {pending ? "Saving…" : draft.is_published ? "Save and publish" : "Save draft"}
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/community-posts">Cancel</Link>
            </Button>
          </div>
        </fieldset>

        {/* Preview Section */}
        {previewUrl && (
          <div className="space-y-3 border-t pt-5">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Preview</h3>
              <RadioGroup value={previewMode} onValueChange={(value) => setPreviewMode(value as "admin" | "public")} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="preview-admin" />
                  <Label htmlFor="preview-admin" className="cursor-pointer">Admin view</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="preview-public" />
                  <Label htmlFor="preview-public" className="cursor-pointer">Homepage view</Label>
                </div>
              </RadioGroup>
            </div>
            <FacebookPostPreview 
              key={`${previewUrl}-${previewMode}`} 
              url={previewUrl} 
              title={draft.title || "Post preview"} 
              mode={previewMode}
            />
          </div>
        )}
      </form>
      {post && <section aria-labelledby="remove-post-heading" className="space-y-3 rounded-xl border p-5"><h2 id="remove-post-heading" className="font-semibold">Remove website entry</h2><p className="text-sm text-muted-foreground">This removes the entry from your website. The original Facebook post is unaffected.</p><Button disabled={pending} variant="destructive" onClick={() => remove(post)}>Remove post</Button></section>}
    </div>
  )
}
