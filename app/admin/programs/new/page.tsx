"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createProgram } from "@/lib/actions/program-crud"
import type { ProgramDocument, ProgramCategory } from "@/lib/programs/content"
import { getDefaultSectionsForCategory, type ProgramCategoryType } from "@/components/admin/program-sections/types"

const CATEGORIES = [
  { value: "service", label: "Service" },
  { value: "campaign", label: "Campaign" },
  { value: "outreach", label: "Outreach" },
  { value: "research", label: "Research" },
] as const

export default function NewProgramPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<string>("service")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    if (!title.trim()) {
      setError("Title is required")
      return
    }

    setLoading(true)
    setError(null)

    const defaultSections = getDefaultSectionsForCategory(category as ProgramCategoryType)

    const doc: ProgramDocument = {
      schemaVersion: 1,
      title: title.trim(),
      shortDescription: title.trim(),
      category: category as ProgramCategory,
      tags: [],
      hero: { title: title.trim(), description: title.trim(), actions: [] },
      seo: {},
      sections: defaultSections,
      relatedProgramIds: [],
    }

    const result = await createProgram({ title: title.trim(), category, document: doc })

    if (!result.ok) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push(`/admin/programs/${result.data.id}/edit`)
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/admin/programs">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to programs
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create a program draft</CardTitle>
          <CardDescription>
            Choose a category and title. You can edit all content after creation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. AAC Support Program"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleCreate} disabled={loading || !title.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Draft"
              )}
            </Button>
            <Button variant="ghost" asChild disabled={loading}>
              <Link href="/admin/programs">Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
