"use client"

import { useEffect, useRef, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
import Image from "@tiptap/extension-image"
import { TableKit } from "@tiptap/extension-table"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
  Sparkles,
  Image as ImageIcon,
  Plus,
  UploadCloud,
  Link2,
  CheckCircle2,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FileUpload } from "@/components/admin/media/file-upload"
import { notifications } from "@/lib/notifications"

// Custom TipTap Image node preserving inline styles and dimensions for emails
const EmailImage = Image.extend({
  name: "image",
  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute("src"),
        renderHTML: (attributes) => ({ src: attributes.src }),
      },
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute("alt"),
        renderHTML: (attributes) => (attributes.alt ? { alt: attributes.alt } : {}),
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute("title"),
        renderHTML: (attributes) => (attributes.title ? { title: attributes.title } : {}),
      },
      style: {
        default: "max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 16px auto;",
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => (attributes.style ? { style: attributes.style } : {}),
      },
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) => (attributes.width ? { width: attributes.width } : {}),
      },
    }
  },
})

export interface NewsletterVisualEditorProps {
  content: string
  onChange: (html: string) => void
  disabled?: boolean
  onRegisterInsertBlock?: (fn: (html: string) => void) => void
}

export function NewsletterVisualEditor({
  content,
  onChange,
  disabled = false,
  onRegisterInsertBlock,
}: NewsletterVisualEditorProps) {
  const isUpdatingRef = useRef(false)
  const lastHtmlRef = useRef(content)

  // Link dialog state
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")

  // Image & Layout Block dialog state
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [imageSourceTab, setImageSourceTab] = useState<"upload" | "url">("upload")
  const [imgLayoutType, setImgLayoutType] = useState<"banner" | "split_left" | "split_right">("banner")
  const [imgUrl, setImgUrl] = useState("")
  const [imgCaption, setImgCaption] = useState("")
  const [imgLinkUrl, setImgLinkUrl] = useState("")
  const [imgHeadline, setImgHeadline] = useState("")
  const [imgBody, setImgBody] = useState("")
  const [imgButtonLabel, setImgButtonLabel] = useState("Read More")
  const [imgButtonUrl, setImgButtonUrl] = useState("https://deessafoundation.com")

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      EmailImage,
      TableKit.configure({
        table: {
          resizable: false,
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          style: "color: #0B5F8A; text-decoration: underline; font-weight: 500;",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder:
          "Start writing your message here... Use the toolbar above or choose a preset template.",
      }),
      CharacterCount,
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none focus:outline-none min-h-[380px] p-4 sm:p-5 bg-background text-foreground leading-relaxed text-sm sm:text-base outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML()
      lastHtmlRef.current = html
      isUpdatingRef.current = true
      onChange(html)
      setTimeout(() => {
        isUpdatingRef.current = false
      }, 50)
    },
  })

  // Sync external content changes (e.g. from preset template or raw HTML tab)
  useEffect(() => {
    if (!editor) return
    if (content !== lastHtmlRef.current && !isUpdatingRef.current) {
      lastHtmlRef.current = content
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  // Register insert block handler for parent components
  useEffect(() => {
    if (!editor || !onRegisterInsertBlock) return
    onRegisterInsertBlock((blockHtml: string) => {
      editor.commands.insertContent(blockHtml)
      notifications.showSuccess("Layout block added to visual editor")
    })
  }, [editor, onRegisterInsertBlock])

  // Update editable mode
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [disabled, editor])

  if (!editor) {
    return (
      <div className="h-[400px] rounded-xl border border-border/70 bg-muted/20 flex items-center justify-center text-xs text-muted-foreground">
        Loading visual editor...
      </div>
    )
  }

  // Heading determination
  const currentHeadingValue = editor.isActive("heading", { level: 1 })
    ? "h1"
    : editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
    ? "h3"
    : "p"

  const handleHeadingChange = (val: string) => {
    if (val === "p") {
      editor.chain().focus().setParagraph().run()
    } else if (val === "h1") {
      editor.chain().focus().setHeading({ level: 1 }).run()
    } else if (val === "h2") {
      editor.chain().focus().setHeading({ level: 2 }).run()
    } else if (val === "h3") {
      editor.chain().focus().setHeading({ level: 3 }).run()
    }
  }

  const openLinkDialog = () => {
    const previousUrl = editor.getAttributes("link").href || ""
    setLinkUrl(previousUrl)
    setLinkDialogOpen(true)
  }

  const handleApplyLink = () => {
    if (linkUrl.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      let formattedUrl = linkUrl.trim()
      if (!/^https?:\/\//i.test(formattedUrl) && !/^mailto:/i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: formattedUrl }).run()
    }
    setLinkDialogOpen(false)
  }

  const handleInsertToken = (token: string) => {
    editor.chain().focus().insertContent(` ${token} `).run()
    notifications.showSuccess(`Added token ${token}`)
  }

  const handleInsertImageBlock = () => {
    if (!imgUrl.trim()) {
      notifications.showError("Please upload an image or provide an image URL")
      return
    }

    let generatedHtml = ""

    if (imgLayoutType === "banner") {
      const imgTag = `<img src="${imgUrl.trim()}" alt="${imgCaption.trim() || 'Newsletter Banner'}" style="max-width: 100%; height: auto; border-radius: 10px; display: block; margin: 16px auto;" />`
      const wrapped = imgLinkUrl.trim()
        ? `<a href="${imgLinkUrl.trim()}" target="_blank" style="text-decoration: none; display: block;">${imgTag}</a>`
        : imgTag

      generatedHtml = `<p style="text-align: center;">${wrapped}</p>`
      if (imgCaption.trim()) {
        generatedHtml += `<p style="text-align: center; font-size: 13px; color: #64748b; font-style: italic; margin-top: 4px;">${imgCaption.trim()}</p>`
      }
    } else if (imgLayoutType === "split_left") {
      if (!imgHeadline.trim() || !imgBody.trim()) {
        notifications.showError("Please enter a section headline and paragraph text")
        return
      }
      const buttonHtml =
        imgButtonLabel.trim() && imgButtonUrl.trim()
          ? `<p style="margin-top: 12px;"><a href="${imgButtonUrl.trim()}" target="_blank" style="display: inline-block; background-color: #0B5F8A; color: #ffffff; padding: 8px 18px; border-radius: 6px; font-weight: 600; text-decoration: none; font-size: 13px;">${imgButtonLabel.trim()} →</a></p>`
          : ""

      generatedHtml = `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; border-collapse: collapse;">
  <tbody>
    <tr>
      <td width="38%" valign="top" style="padding-right: 16px;">
        <img src="${imgUrl.trim()}" alt="${imgHeadline.trim()}" style="max-width: 100%; height: auto; border-radius: 8px; display: block;" />
      </td>
      <td width="62%" valign="top" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 18px; font-weight: 700; color: #0f172a;">${imgHeadline.trim()}</h3>
        <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">${imgBody.trim()}</p>
        ${buttonHtml}
      </td>
    </tr>
  </tbody>
</table>`
    } else if (imgLayoutType === "split_right") {
      if (!imgHeadline.trim() || !imgBody.trim()) {
        notifications.showError("Please enter a section headline and paragraph text")
        return
      }
      const buttonHtml =
        imgButtonLabel.trim() && imgButtonUrl.trim()
          ? `<p style="margin-top: 12px;"><a href="${imgButtonUrl.trim()}" target="_blank" style="display: inline-block; background-color: #0B5F8A; color: #ffffff; padding: 8px 18px; border-radius: 6px; font-weight: 600; text-decoration: none; font-size: 13px;">${imgButtonLabel.trim()} →</a></p>`
          : ""

      generatedHtml = `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; border-collapse: collapse;">
  <tbody>
    <tr>
      <td width="62%" valign="top" style="padding-right: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 18px; font-weight: 700; color: #0f172a;">${imgHeadline.trim()}</h3>
        <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">${imgBody.trim()}</p>
        ${buttonHtml}
      </td>
      <td width="38%" valign="top">
        <img src="${imgUrl.trim()}" alt="${imgHeadline.trim()}" style="max-width: 100%; height: auto; border-radius: 8px; display: block;" />
      </td>
    </tr>
  </tbody>
</table>`
    }

    if (generatedHtml) {
      editor.chain().focus().insertContent(generatedHtml).run()
      notifications.showSuccess("Image block inserted into visual canvas!")
      setImageDialogOpen(false)
      // Reset form fields
      setImgHeadline("")
      setImgBody("")
      setImgCaption("")
      setImgLinkUrl("")
    }
  }

  return (
    <div className="rounded-xl border border-border/80 bg-background shadow-xs overflow-hidden flex flex-col">
      {/* ── Visual Formatting Toolbar ── */}
      <div className="p-2 sm:p-2.5 bg-muted/30 border-b border-border/60 flex flex-wrap items-center gap-1.5 text-xs">
        {/* Paragraph / Heading Selector */}
        <Select
          value={currentHeadingValue}
          onValueChange={handleHeadingChange}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 text-xs w-[130px] font-medium bg-background border-border/70">
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="p">Paragraph</SelectItem>
            <SelectItem value="h1">Heading 1 (Large)</SelectItem>
            <SelectItem value="h2">Heading 2 (Medium)</SelectItem>
            <SelectItem value="h3">Heading 3 (Small)</SelectItem>
          </SelectContent>
        </Select>

        <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />

        {/* Basic Inline Marks */}
        <Button
          type="button"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
          className="size-8 p-0"
          title="Bold (Ctrl+B)"
        >
          <Bold className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
          className="size-8 p-0"
          title="Italic (Ctrl+I)"
        >
          <Italic className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive("underline") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={disabled}
          className="size-8 p-0"
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="size-3.5" />
        </Button>

        <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />

        {/* Lists & Quotes */}
        <Button
          type="button"
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          className="size-8 p-0"
          title="Bulleted List"
        >
          <List className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive("orderedList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          className="size-8 p-0"
          title="Numbered List"
        >
          <ListOrdered className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive("blockquote") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={disabled}
          className="size-8 p-0"
          title="Quote Block"
        >
          <Quote className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          disabled={disabled}
          className="size-8 p-0"
          title="Horizontal Divider"
        >
          <Minus className="size-3.5" />
        </Button>

        <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />

        {/* Link Tools */}
        <Button
          type="button"
          variant={editor.isActive("link") ? "default" : "ghost"}
          size="sm"
          onClick={openLinkDialog}
          disabled={disabled}
          className="size-8 p-0"
          title="Insert / Edit Link"
        >
          <LinkIcon className="size-3.5" />
        </Button>

        {editor.isActive("link") && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={disabled}
            className="size-8 p-0 text-destructive"
            title="Remove Link"
          >
            <Unlink className="size-3.5" />
          </Button>
        )}

        <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />

        {/* 🌟 IMAGE & LAYOUT INSERTER BUTTON 🌟 */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setImageDialogOpen(true)}
          disabled={disabled}
          className="h-8 px-2.5 text-xs font-semibold gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 shrink-0"
          title="Insert Photo, Banner, or 2-Column Story Layout"
        >
          <ImageIcon className="size-3.5" />
          <span>Add Image / Layout</span>
        </Button>

        <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />

        {/* Undo / Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().undo()}
          className="size-8 p-0"
          title="Undo"
        >
          <Undo className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().redo()}
          className="size-8 p-0"
          title="Redo"
        >
          <Redo className="size-3.5" />
        </Button>

        {/* Dynamic Personalization Tokens */}
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 hidden md:flex">
            <Sparkles className="size-3 text-amber-500" /> Token:
          </span>
          <button
            type="button"
            onClick={() => handleInsertToken("{{name}}")}
            disabled={disabled}
            className="px-2 py-1 rounded bg-background hover:bg-primary/10 border border-border/70 text-[10px] font-mono text-primary transition-colors"
            title="Insert personalized subscriber name"
          >
            {"{{name}}"}
          </button>
          <button
            type="button"
            onClick={() => handleInsertToken("{{email}}")}
            disabled={disabled}
            className="px-2 py-1 rounded bg-background hover:bg-primary/10 border border-border/70 text-[10px] font-mono text-primary transition-colors hidden sm:block"
            title="Insert subscriber email"
          >
            {"{{email}}"}
          </button>
        </div>
      </div>

      {/* ── Editor Canvas ── */}
      <div className="relative flex-1 min-h-[380px] bg-background">
        <EditorContent editor={editor} />
      </div>

      {/* ── Canvas Footer (Word & Char count) ── */}
      <div className="px-4 py-2 border-t border-border/50 bg-muted/10 text-[11px] text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>{editor.storage.characterCount.words()} words</span>
          <span>•</span>
          <span>{editor.storage.characterCount.characters()} characters</span>
        </div>
        <span className="text-[10px] italic">
          WYSIWYG visual mode: formatted content compiles directly into email tables
        </span>
      </div>

      {/* ── Link Dialog ── */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <LinkIcon className="size-4 text-primary" />
              <span>Insert / Edit Hyperlink</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Web Address (URL)</Label>
              <Input
                placeholder="https://deessafoundation.com/..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleApplyLink()
                  }
                }}
                className="h-9 text-xs"
                autoFocus
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Tip: You can also link directly to internal pages like <code className="bg-muted px-1 rounded">/stories</code> or <code className="bg-muted px-1 rounded">/donate</code>.
            </p>
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLinkDialogOpen(false)}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleApplyLink}
              className="h-9 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Apply Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 🌟 Re-Architected Image & Layout Studio Dialog ── */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-xl max-h-[88vh] flex flex-col p-0 overflow-hidden rounded-2xl border-border/80 shadow-2xl">
          {/* Header with clearance for Close X */}
          <DialogHeader className="p-5 pb-3 border-b border-border/60 bg-muted/20">
            <div className="pr-10">
              <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <ImageIcon className="size-5 text-primary" />
                <span>Insert Image & Layout</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Upload a photo or paste a URL, then choose your email layout format.
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Scrollable Form Body */}
          <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
            {/* 1. Layout Format Picker */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                1. Choose Layout Style
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: "banner",
                    title: "Hero Banner",
                    subtitle: "Full-width photo",
                    visual: "🖼️",
                  },
                  {
                    id: "split_left",
                    title: "Image Left",
                    subtitle: "Photo left, words right",
                    visual: "◀️",
                  },
                  {
                    id: "split_right",
                    title: "Image Right",
                    subtitle: "Words left, photo right",
                    visual: "▶️",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setImgLayoutType(item.id as typeof imgLayoutType)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      imgLayoutType === item.id
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow-xs"
                        : "border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="text-lg mb-1">{item.visual}</div>
                    <span className="font-bold text-xs block text-foreground">{item.title}</span>
                    <span className="text-[10px] text-muted-foreground block line-clamp-1">
                      {item.subtitle}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Image Source (Upload vs URL) */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">
                2. Choose Image Source *
              </Label>

              <Tabs
                value={imageSourceTab}
                onValueChange={(val) => setImageSourceTab(val as "upload" | "url")}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 h-9">
                  <TabsTrigger value="upload" className="text-xs gap-1.5">
                    <UploadCloud className="size-3.5" />
                    <span>Upload Image</span>
                  </TabsTrigger>
                  <TabsTrigger value="url" className="text-xs gap-1.5">
                    <Link2 className="size-3.5" />
                    <span>Paste Direct URL</span>
                  </TabsTrigger>
                </TabsList>

                {/* Upload Tab */}
                <TabsContent value="upload" className="pt-2">
                  {imgUrl && imageSourceTab === "upload" ? (
                    /* Polished Uploaded Image Card */
                    <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-2.5">
                      <div className="relative h-36 w-full rounded-lg overflow-hidden border border-border/60 bg-neutral-900/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt="Uploaded Preview"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-emerald-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="size-3" />
                          <span>Uploaded & Ready</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[280px]">
                          {imgUrl.split("/").pop() || "Uploaded Photo"}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setImgUrl("")}
                          className="h-7 text-xs gap-1 font-medium text-destructive hover:text-destructive"
                        >
                          <RotateCcw className="size-3" />
                          <span>Replace</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Clean Dropzone (without duplicate input) */
                    <FileUpload
                      bucket="story-images"
                      currentUrl={imgUrl}
                      onUpload={(url) => setImgUrl(url)}
                      label="Upload Image (JPG, PNG, WebP)"
                      maxSizeMB={5}
                      allowUrl={false}
                    />
                  )}
                </TabsContent>

                {/* URL Tab */}
                <TabsContent value="url" className="pt-2 space-y-2">
                  <Input
                    placeholder="https://images.unsplash.com/... or https://..."
                    value={imgUrl}
                    onChange={(e) => setImgUrl(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                  {imgUrl.trim().length > 10 && (
                    <div className="h-28 w-full rounded-lg overflow-hidden border border-border/60 bg-muted/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt="URL Preview"
                        className="h-full w-full object-cover"
                        onError={() => notifications.showError("Failed to load image preview from URL")}
                      />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* 3. Layout Specific Content Fields */}
            {imgLayoutType === "banner" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Caption (Optional)</Label>
                  <Input
                    placeholder="e.g. Children enjoying the sensory music room"
                    value={imgCaption}
                    onChange={(e) => setImgCaption(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Click Link (Optional)</Label>
                  <Input
                    placeholder="https://deessafoundation.com/..."
                    value={imgLinkUrl}
                    onChange={(e) => setImgLinkUrl(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-1 border-t border-border/50">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Section Headline *</Label>
                  <Input
                    placeholder="e.g. New Outreach Hub in Pokhara"
                    value={imgHeadline}
                    onChange={(e) => setImgHeadline(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Section Narrative Paragraph *</Label>
                  <Textarea
                    placeholder="Explain the milestone, workshop, or story in 2-3 sentences..."
                    value={imgBody}
                    onChange={(e) => setImgBody(e.target.value)}
                    rows={3}
                    className="text-xs leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Button Label (Optional)</Label>
                    <Input
                      placeholder="e.g. Learn More"
                      value={imgButtonLabel}
                      onChange={(e) => setImgButtonLabel(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Button Link URL</Label>
                    <Input
                      placeholder="https://deessafoundation.com/..."
                      value={imgButtonUrl}
                      onChange={(e) => setImgButtonUrl(e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer conforming strictly to user design rules */}
          <DialogFooter className="p-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-end gap-2.5 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setImageDialogOpen(false)}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleInsertImageBlock}
              disabled={!imgUrl.trim()}
              className="h-9 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-3.5" />
              <span>Insert into Newsletter</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
