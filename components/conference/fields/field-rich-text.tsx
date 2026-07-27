"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import Placeholder from "@tiptap/extension-placeholder"
import { Label } from "@/components/ui/label"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading2,
  Link as LinkIcon,
  Undo,
  Redo,
} from "lucide-react"
import type { FormField } from "@/lib/types/conference-form-schema"

interface FieldRichTextProps {
  field: FormField
  value: string | null
  onChange: (value: string | null) => void
  onBlur?: () => void
  error?: string
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex size-7 items-center justify-center rounded transition-colors ${
        isActive
          ? "bg-black/10 text-black"
          : "text-black/40 hover:bg-gray-100 hover:text-black/60"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )
}

export function FieldRichText({ field, value, onChange, error }: FieldRichTextProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        validate: (href) => /^(https?:\/\/|\/)/i.test(href),
      }),
      Underline,
      Placeholder.configure({
        placeholder: field.placeholder || "Enter content...",
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html === "<p></p>" ? null : html)
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2",
      },
    },
  })

  const setLink = () => {
    if (!editor) return
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("URL", previousUrl)
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div className={`rounded-lg border overflow-hidden ${error ? "border-destructive" : "border-input"}`}>
        {/* Toolbar */}
        {editor && (
          <div className="flex items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
            >
              <Bold className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
            >
              <Italic className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
            >
              <UnderlineIcon className="size-3.5" />
            </ToolbarButton>

            <div className="w-px h-4 bg-gray-300 mx-1" />

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive("heading", { level: 2 })}
            >
              <Heading2 className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
            >
              <List className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
            >
              <ListOrdered className="size-3.5" />
            </ToolbarButton>

            <div className="w-px h-4 bg-gray-300 mx-1" />

            <ToolbarButton
              onClick={setLink}
              isActive={editor.isActive("link")}
            >
              <LinkIcon className="size-3.5" />
            </ToolbarButton>

            <div className="flex-1" />

            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo className="size-3.5" />
            </ToolbarButton>
          </div>
        )}

        {/* Editor */}
        <EditorContent editor={editor} className="bg-white" />
      </div>

      {field.helpText && !error && (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
