"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { FancySelect } from "@/components/ui/fancy-select"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  CreditCard,
  Heart,
  Users,
  HandHeart,
  Sparkles,
  BookOpen,
  ArrowRight,
  type LucideIcon,
} from "lucide-react"
import type { HomepageCTACardsSettings, HomepageCTACard } from "@/lib/types/homepage-settings"
import { cn } from "@/lib/utils"

interface CTACardsManagerProps {
  ctaCards: HomepageCTACardsSettings
  onChange: (ctaCards: HomepageCTACardsSettings) => void
}

const ICON_MAP: Record<string, LucideIcon> = {
  heart: Heart,
  users: Users,
  "hand-heart": HandHeart,
  sparkles: Sparkles,
  "book-open": BookOpen,
}

const ICON_OPTIONS = [
  { value: "heart", label: "Heart (Donate / Care)" },
  { value: "users", label: "Users (Volunteer / Community)" },
  { value: "hand-heart", label: "Hands with Heart (Sponsorship)" },
  { value: "sparkles", label: "Sparkles (Changemaker)" },
  { value: "book-open", label: "Open Book (Advocate)" },
]

const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string; btn: string }> = {
  orange: {
    bg: "bg-amber-500/10 dark:bg-amber-950/20",
    border: "border-amber-500/30",
    text: "text-amber-800 dark:text-amber-300",
    btn: "bg-amber-600 hover:bg-amber-700 text-white",
  },
  teal: {
    bg: "bg-teal-500/10 dark:bg-teal-950/20",
    border: "border-teal-500/30",
    text: "text-teal-800 dark:text-teal-300",
    btn: "bg-teal-600 hover:bg-teal-700 text-white",
  },
  white: {
    bg: "bg-muted/40",
    border: "border-border",
    text: "text-foreground",
    btn: "bg-primary hover:bg-primary/90 text-primary-foreground",
  },
  purple: {
    bg: "bg-purple-500/10 dark:bg-purple-950/20",
    border: "border-purple-500/30",
    text: "text-purple-800 dark:text-purple-300",
    btn: "bg-purple-600 hover:bg-purple-700 text-white",
  },
  blue: {
    bg: "bg-blue-500/10 dark:bg-blue-950/20",
    border: "border-blue-500/30",
    text: "text-blue-800 dark:text-blue-300",
    btn: "bg-blue-600 hover:bg-blue-700 text-white",
  },
}

export default function CTACardsManager({ ctaCards, onChange }: CTACardsManagerProps) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const addCard = () => {
    const newCard: HomepageCTACard = {
      id: `card-${Date.now()}`,
      title: "New Engagement Pathway",
      description: "Explain how supporters or volunteers can take meaningful action...",
      icon: "heart",
      ctaLabel: "Learn More",
      ctaUrl: "/get-involved",
      color: "teal",
      order: (ctaCards.cards || []).length + 1,
      visible: true,
    }
    onChange({ cards: [...(ctaCards.cards || []), newCard] })
  }

  const updateCard = (index: number, updates: Partial<HomepageCTACard>) => {
    const newCards = [...(ctaCards.cards || [])]
    newCards[index] = { ...newCards[index], ...updates }
    onChange({ cards: newCards })
  }

  const confirmDelete = () => {
    if (deleteIndex === null) return
    const newCards = (ctaCards.cards || []).filter((_, i) => i !== deleteIndex)
    onChange({ cards: newCards })
    setDeleteIndex(null)
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newCards = [...(ctaCards.cards || [])]
    ;[newCards[index - 1], newCards[index]] = [newCards[index], newCards[index - 1]]
    onChange({ cards: newCards })
  }

  const moveDown = (index: number) => {
    if (index === (ctaCards.cards || []).length - 1) return
    const newCards = [...(ctaCards.cards || [])]
    ;[newCards[index], newCards[index + 1]] = [newCards[index + 1], newCards[index]]
    onChange({ cards: newCards })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border/70">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            &ldquo;Get Involved&rdquo; Pathway Cards
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Conversion cards shown in the Get Involved section (Donate, Volunteer, Partner).
          </p>
        </div>
        <Button onClick={addCard} size="sm" className="h-9 self-start sm:self-auto text-xs font-medium">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Card
        </Button>
      </div>

      <div className="space-y-4">
        {(ctaCards.cards || []).map((card, index) => {
          const CardIcon = ICON_MAP[card.icon] || Heart
          const colorStyles = COLOR_CLASSES[card.color] || COLOR_CLASSES.white

          return (
            <Card
              key={card.id || index}
              className={cn(
                "border border-border/80 shadow-sm transition-all",
                !card.visible && "opacity-60 bg-muted/30"
              )}
            >
              <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-card border text-primary">
                    <CardIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-foreground">
                      {card.title || "Untitled Card"}
                    </span>
                    {!card.visible && (
                      <span className="ml-2 text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="h-8 w-8 p-0"
                    aria-label="Move card up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveDown(index)}
                    disabled={index === (ctaCards.cards || []).length - 1}
                    className="h-8 w-8 p-0"
                    aria-label="Move card down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateCard(index, { visible: !card.visible })}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    aria-label={card.visible ? "Hide card" : "Show card"}
                  >
                    {card.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteIndex(index)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    aria-label="Delete card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <Label className="text-xs font-medium">Card Title</Label>
                    <Input
                      value={card.title}
                      onChange={(e) => updateCard(index, { title: e.target.value })}
                      placeholder="e.g. Become a Monthly Sustainer"
                      className="mt-1.5 h-9 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Icon</Label>
                    <div className="mt-1.5">
                      <FancySelect
                        value={card.icon}
                        onValueChange={(val) => updateCard(index, { icon: val })}
                        options={ICON_OPTIONS}
                        size="sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Surface Tint</Label>
                    <div className="mt-1.5">
                      <FancySelect
                        value={card.color}
                        onValueChange={(value) => updateCard(index, { color: value as any })}
                        options={[
                          { value: "teal", label: "Teal Brand" },
                          { value: "orange", label: "Warm Amber" },
                          { value: "blue", label: "Sky Blue" },
                          { value: "purple", label: "Royal Purple" },
                          { value: "white", label: "Neutral White" },
                        ]}
                        size="sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <Label className="text-xs font-medium">Description</Label>
                    <Textarea
                      value={card.description}
                      onChange={(e) => updateCard(index, { description: e.target.value })}
                      rows={2}
                      placeholder="Contextual call to action for the supporter..."
                      className="mt-1.5 text-sm resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-xs font-medium">Button Label</Label>
                    <Input
                      value={card.ctaLabel}
                      onChange={(e) => updateCard(index, { ctaLabel: e.target.value })}
                      placeholder="e.g. Donate Monthly"
                      className="mt-1.5 h-9 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-xs font-medium">Button Target URL</Label>
                    <Input
                      value={card.ctaUrl}
                      onChange={(e) => updateCard(index, { ctaUrl: e.target.value })}
                      placeholder="e.g. /donate?type=monthly"
                      className="mt-1.5 h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Card Preview */}
                <div className={cn("p-4 sm:p-5 rounded-2xl border transition-all", colorStyles.bg, colorStyles.border)}>
                  <div className="flex items-center gap-2 mb-2">
                    <CardIcon className={cn("w-4 h-4", colorStyles.text)} />
                    <h4 className="font-bold text-base text-foreground">{card.title || "Card Headline"}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 max-w-lg leading-relaxed">
                    {card.description || "Card description copy..."}
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground">
                    {card.ctaLabel || "Take Action"}
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {(ctaCards.cards || []).length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-2xl bg-muted/20">
            <CreditCard className="w-10 h-10 mx-auto text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium text-foreground">No CTA cards defined</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Add engagement cards for volunteer outreach, donation paths, and partnership forms.
            </p>
            <Button onClick={addCard} size="sm" variant="outline">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add First Card
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete CTA Pathway Card?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &ldquo;{deleteIndex !== null ? ctaCards.cards[deleteIndex]?.title : ""}&rdquo;?
              This card will no longer appear on the public homepage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Card
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
