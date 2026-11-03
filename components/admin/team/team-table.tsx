"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
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
} from "@/components/ui/dialog"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Plus,
  Pencil,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Star,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronsUp,
  ChevronsDown,
  Loader2,
  GripVertical,
} from "lucide-react"
import {
  deleteTeamMember,
  toggleTeamMemberPublish,
  toggleTeamMemberFeatured,
  reorderTeamMembers,
} from "@/lib/actions/admin-team"
import { notifications } from "@/lib/notifications"
import { ConfirmDialog } from "../common/confirm-dialog"
import { isSafeMediaUrl } from "@/lib/media-validation"
import { TEAM_TIERS, TEAM_TIER_DETAILS, type TeamTier } from "@/lib/types/team-input"
import { cn } from "@/lib/utils"

export type TeamMemberItem = {
  id: string
  name: string
  role: string
  tier?: string | null
  is_featured?: boolean
  bio: string | null
  image: string | null
  email: string | null
  phone: string | null
  is_published: boolean
  sort_order: number
}

const PAGE_SIZE = 12

function formatBioExcerpt(bio: string | null | undefined, maxLength = 70): string {
  if (!bio) return ""
  const singleLine = bio.replace(/\s+/g, " ").trim()
  if (singleLine.length <= maxLength) return singleLine
  const slice = singleLine.slice(0, maxLength)
  const lastSpace = slice.lastIndexOf(" ")
  const truncated = lastSpace > 25 ? slice.slice(0, lastSpace) : slice
  return `${truncated.trimEnd()}...`
}

/**
 * Sortable list row for the sequence modal powered by @dnd-kit
 */
function SortableTeamMemberRow({
  member,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onMoveToTop,
  onMoveToBottom,
  disabled,
}: {
  member: TeamMemberItem
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
  onMoveToTop: () => void
  onMoveToBottom: () => void
  disabled?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: member.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  }

  const isFirst = index === 0
  const isLast = index === total - 1
  const tierKey = (member.tier as TeamTier) || "vision"
  const meta = TEAM_TIER_DETAILS[tierKey] || TEAM_TIER_DETAILS.vision

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-border/80 bg-card transition-all shadow-2xs select-none",
        isDragging
          ? "opacity-60 ring-2 ring-primary shadow-lg bg-muted/60 scale-[1.01]"
          : "hover:bg-muted/30"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Drag Handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          disabled={disabled}
          className="touch-none cursor-grab active:cursor-grabbing p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-hidden focus:ring-2 focus:ring-primary shrink-0"
          aria-label={`Drag to reorder ${member.name}`}
          title="Drag to rearrange sequence"
        >
          <GripVertical className="size-4 text-muted-foreground/70" />
        </button>

        {/* Position Badge */}
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold tabular-nums">
          #{index + 1}
        </span>

        {/* Avatar */}
        <div className="relative shrink-0">
          {member.image && isSafeMediaUrl(member.image) ? (
            <img
              src={member.image}
              alt=""
              className="size-9 rounded-lg object-cover border border-border/70"
            />
          ) : (
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground border border-border/70">
              {member.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Member Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
              {member.name}
            </p>
            {member.is_featured && (
              <Star className="size-3 fill-amber-400 text-amber-500 shrink-0" />
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {member.role}
          </p>
        </div>

        {/* Tier Badge */}
        <span className={cn("hidden sm:inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold shrink-0", meta.badgeTone)}>
          {meta.label}
        </span>
      </div>

      {/* Button Controls for non-drag users / precise nudging with filled triangles */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isFirst || disabled}
          onClick={onMoveToTop}
          className="h-8 px-1.5 sm:px-2 text-xs text-muted-foreground hover:text-foreground"
          title="Move to top (#1)"
        >
          <ChevronsUp className="size-3.5 sm:mr-1" />
          <span className="hidden md:inline">Top</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={isFirst || disabled}
          onClick={onMoveUp}
          className="size-8 text-muted-foreground hover:text-primary"
          title="Move up one position"
          aria-label={`Move ${member.name} up`}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="size-2.5" aria-hidden="true">
            <path d="M8 4.5l4.5 5.5h-9l4.5-5.5z" />
          </svg>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={isLast || disabled}
          onClick={onMoveDown}
          className="size-8 text-muted-foreground hover:text-primary"
          title="Move down one position"
          aria-label={`Move ${member.name} down`}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="size-2.5" aria-hidden="true">
            <path d="M8 11.5l-4.5-5.5h9l-4.5 5.5z" />
          </svg>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isLast || disabled}
          onClick={onMoveToBottom}
          className="h-8 px-1.5 sm:px-2 text-xs text-muted-foreground hover:text-foreground"
          title="Move to bottom"
        >
          <ChevronsDown className="size-3.5 sm:mr-1" />
          <span className="hidden md:inline">Bottom</span>
        </Button>
      </div>
    </div>
  )
}

export function TeamTable({ members }: { members: TeamMemberItem[] }) {
  const router = useRouter()
  const [items, setItems] = useState<TeamMemberItem[]>(members)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "published" | "hidden">("all")
  const [tierFilter, setTierFilter] = useState<"all" | TeamTier>("all")
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(null)
  const [reorderingId, setReorderingId] = useState<string | null>(null)

  // Reorder modal states
  const [reorderModalOpen, setReorderModalOpen] = useState(false)
  const [modalTierFilter, setModalTierFilter] = useState<"all" | TeamTier>("all")
  const [modalItems, setModalItems] = useState<TeamMemberItem[]>(members)
  const [modalSaving, setModalSaving] = useState(false)

  // dnd-kit sensors with 5px distance activation constraint to differentiate clicks from drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Keep local items synchronized if server passes fresh data
  useEffect(() => {
    setItems(members)
    setModalItems(members)
  }, [members])

  // Count items per tier for the quick tabs
  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length }
    for (const t of TEAM_TIERS) counts[t] = 0
    for (const m of items) {
      const t = (m.tier as TeamTier) || "vision"
      counts[t] = (counts[t] || 0) + 1
    }
    return counts
  }, [items])

  // Filtered members for current search and filters
  const filtered = useMemo(() => {
    let result = items
    if (filter === "published") result = result.filter((m) => m.is_published)
    if (filter === "hidden") result = result.filter((m) => !m.is_published)
    if (tierFilter !== "all") {
      result = result.filter((m) => (m.tier || "vision") === tierFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.bio?.toLowerCase().includes(q),
      )
    }
    return result
  }, [items, search, filter, tierFilter])

  // Members scoped for the reorder modal view
  const visibleModalMembers = useMemo(() => {
    if (modalTierFilter === "all") return modalItems
    return modalItems.filter((m) => (m.tier || "vision") === modalTierFilter)
  }, [modalItems, modalTierFilter])

  // Check if modal has unsaved reorder changes
  const isModalDirty = useMemo(() => {
    if (modalItems.length !== items.length) return true
    return modalItems.some((m, idx) => m.id !== items[idx]?.id)
  }, [modalItems, items])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const hasActiveFilters = search.trim() !== "" || filter !== "all" || tierFilter !== "all"

  function handleResetFilters() {
    setSearch("")
    setFilter("all")
    setTierFilter("all")
    setPage(1)
  }

  // Handle single-step move up/down on the main table or cards
  async function handleMove(memberId: string, direction: "up" | "down", scopeList?: TeamMemberItem[]) {
    if (reorderingId) return
    const currentList = scopeList || filtered
    const currentIndex = currentList.findIndex((m) => m.id === memberId)
    if (currentIndex === -1) return

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= currentList.length) return

    const targetMember = currentList[targetIndex]
    const member = currentList[currentIndex]

    // Find their positions in the full items array
    const fullIdx1 = items.findIndex((m) => m.id === member.id)
    const fullIdx2 = items.findIndex((m) => m.id === targetMember.id)
    if (fullIdx1 === -1 || fullIdx2 === -1) return

    const previousItems = [...items]
    const nextItems = [...items]
    nextItems[fullIdx1] = previousItems[fullIdx2]
    nextItems[fullIdx2] = previousItems[fullIdx1]

    const reordered = nextItems.map((m, idx) => ({ ...m, sort_order: idx }))
    setItems(reordered)
    setModalItems(reordered)
    setReorderingId(memberId)

    try {
      const res = await reorderTeamMembers(reordered.map((m) => m.id))
      if (res.error) {
        notifications.showError({ description: res.error })
        setItems(previousItems)
        setModalItems(previousItems)
      } else {
        notifications.showSuccess({
          description: `${member.name} moved ${direction === "up" ? "up" : "down"} to position #${targetIndex + 1}.`,
        })
        router.refresh()
      }
    } catch (err) {
      console.error("Failed to reorder team members:", err)
      notifications.showError({ description: "Could not update sequence. Please try again." })
      setItems(previousItems)
      setModalItems(previousItems)
    } finally {
      setReorderingId(null)
    }
  }

  // Handle drag-and-drop end inside the modal
  function handleModalDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setModalItems((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === active.id)
      const newIndex = prev.findIndex((item) => item.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  // Handle modal single-step move up/down
  function handleModalMoveStep(memberId: string, direction: "up" | "down") {
    const currentIndex = visibleModalMembers.findIndex((m) => m.id === memberId)
    if (currentIndex === -1) return
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= visibleModalMembers.length) return

    const targetMember = visibleModalMembers[targetIndex]
    const fullIdx1 = modalItems.findIndex((m) => m.id === memberId)
    const fullIdx2 = modalItems.findIndex((m) => m.id === targetMember.id)
    if (fullIdx1 === -1 || fullIdx2 === -1) return

    setModalItems((prev) => {
      const copy = [...prev]
      const temp = copy[fullIdx1]
      copy[fullIdx1] = copy[fullIdx2]
      copy[fullIdx2] = temp
      return copy
    })
  }

  // Handle modal jump to top/bottom
  function handleModalMoveExtreme(memberId: string, extreme: "top" | "bottom") {
    const currentIndex = visibleModalMembers.findIndex((m) => m.id === memberId)
    if (currentIndex === -1) return
    if (extreme === "top" && currentIndex === 0) return
    if (extreme === "bottom" && currentIndex === visibleModalMembers.length - 1) return

    const targetMember = extreme === "top" ? visibleModalMembers[0] : visibleModalMembers[visibleModalMembers.length - 1]
    const fullOldIdx = modalItems.findIndex((m) => m.id === memberId)
    const fullTargetIdx = modalItems.findIndex((m) => m.id === targetMember.id)
    if (fullOldIdx === -1 || fullTargetIdx === -1) return

    setModalItems((prev) => arrayMove(prev, fullOldIdx, fullTargetIdx))
  }

  // Save full modal reorder
  async function handleSaveModalOrder() {
    if (!isModalDirty) {
      setReorderModalOpen(false)
      return
    }

    setModalSaving(true)
    const reordered = modalItems.map((m, idx) => ({ ...m, sort_order: idx }))

    try {
      const res = await reorderTeamMembers(reordered.map((m) => m.id))
      if (res.error) {
        notifications.showError({ description: res.error })
      } else {
        setItems(reordered)
        notifications.showSuccess({
          description: "Team display order updated successfully.",
        })
        setReorderModalOpen(false)
        router.refresh()
      }
    } catch {
      notifications.showError({ description: "Could not save order. Please try again." })
    } finally {
      setModalSaving(false)
    }
  }

  // Quick toggle Hero collage featured status
  async function handleToggleFeatured(memberId: string, currentFeatured: boolean) {
    const nextState = !currentFeatured

    if (nextState) {
      const currentlyFeaturedCount = items.filter((m) => m.is_featured && m.id !== memberId).length
      if (currentlyFeaturedCount >= 3) {
        notifications.showError({
          description: "Maximum 3 members can be featured in the Hero collage. Please unfeature another member first.",
        })
        return
      }
    }

    setTogglingFeaturedId(memberId)
    setItems((prev) => prev.map((m) => (m.id === memberId ? { ...m, is_featured: nextState } : m)))
    try {
      const res = await toggleTeamMemberFeatured(memberId, nextState)
      if (res.error) {
        notifications.showError({ description: res.error })
        setItems((prev) => prev.map((m) => (m.id === memberId ? { ...m, is_featured: currentFeatured } : m)))
      } else {
        notifications.showSuccess({
          description: nextState
            ? "Member is now featured in the Hero collage."
            : "Member removed from Hero collage.",
        })
        router.refresh()
      }
    } catch (err) {
      console.error("Failed to toggle Hero status:", err)
      notifications.showError({
        description: err instanceof Error ? err.message : "Could not update Hero status. Please try again.",
      })
      setItems((prev) => prev.map((m) => (m.id === memberId ? { ...m, is_featured: currentFeatured } : m)))
    } finally {
      setTogglingFeaturedId(null)
    }
  }

  // Quick toggle publishing status
  async function handleTogglePublish(memberId: string, currentPublished: boolean) {
    const nextState = !currentPublished
    setPublishingId(memberId)
    setItems((prev) => prev.map((m) => (m.id === memberId ? { ...m, is_published: nextState } : m)))
    try {
      const res = await toggleTeamMemberPublish(memberId, nextState)
      if (res.error) {
        notifications.showError({ description: res.error })
        setItems((prev) => prev.map((m) => (m.id === memberId ? { ...m, is_published: currentPublished } : m)))
      } else {
        notifications.showSuccess({
          description: nextState
            ? "Member is now published on Who We Are."
            : "Member is hidden from Who We Are.",
        })
        router.refresh()
      }
    } catch (err) {
      console.error("Failed to update publication status:", err)
      notifications.showError({
        description: err instanceof Error ? err.message : "Could not update status. Please try again.",
      })
      setItems((prev) => prev.map((m) => (m.id === memberId ? { ...m, is_published: currentPublished } : m)))
    } finally {
      setPublishingId(null)
    }
  }

  // Delete handler
  async function handleDelete() {
    if (!deleteId || deleting) return
    setDeleting(true)
    try {
      const result = await deleteTeamMember(deleteId)
      if (result.error) {
        notifications.showError({ description: result.error })
        return
      }
      notifications.showSuccess({ description: result.warning || "Member deleted." })
      setItems((prev) => prev.filter((m) => m.id !== deleteId))
      setModalItems((prev) => prev.filter((m) => m.id !== deleteId))
      setDeleteId(null)
      setPage(1)
      router.refresh()
    } catch {
      notifications.showError({ description: "Delete could not be confirmed. Please try again." })
    } finally {
      setDeleting(false)
    }
  }

  const memberToDelete = items.find((m) => m.id === deleteId)

  return (
    <div className="space-y-4">
      {/* Tier Filter Tabs Bar */}
      <div className="relative">
        <nav
          aria-label="Filter members by organizational tier"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
        >
          <button
            type="button"
            onClick={() => {
              setTierFilter("all")
              setPage(1)
            }}
            className={cn(
              "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors",
              tierFilter === "all"
                ? "bg-primary text-white shadow-xs hover:bg-primary/90"
                : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <span>All Groups</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px] tabular-nums",
                tierFilter === "all" ? "bg-white/20 text-white font-bold" : "bg-muted-foreground/15 text-muted-foreground font-medium",
              )}
            >
              {tierCounts.all || 0}
            </span>
          </button>

          {TEAM_TIERS.map((tierKey) => {
            const meta = TEAM_TIER_DETAILS[tierKey]
            const count = tierCounts[tierKey] || 0
            const active = tierFilter === tierKey
            return (
              <button
                key={tierKey}
                type="button"
                onClick={() => {
                  setTierFilter(tierKey)
                  setPage(1)
                }}
                className={cn(
                  "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors",
                  active
                    ? "bg-primary text-white shadow-xs hover:bg-primary/90"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span>{meta.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px] tabular-nums",
                    active ? "bg-white/20 text-white font-bold" : "bg-muted-foreground/15 text-muted-foreground font-medium",
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row sm:flex-1 sm:items-center gap-2">
              <div className="relative w-full sm:max-w-sm sm:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  aria-label="Search team members by name, role, email, or bio"
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="min-h-11 sm:min-h-10 pl-9 pr-8 text-sm"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("")
                      setPage(1)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select
                  value={filter}
                  onValueChange={(val) => {
                    setFilter(val as typeof filter)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="min-h-11 sm:min-h-10 flex-1 sm:w-[140px] text-xs font-medium" aria-label="Filter by publication status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="min-h-11 sm:min-h-10 text-xs text-muted-foreground hover:text-foreground px-3 shrink-0"
                  >
                    <X className="mr-1 h-3.5 w-3.5" />
                    Reset
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-muted-foreground pt-1 sm:pt-0 border-t sm:border-0 border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setModalTierFilter(tierFilter)
                  setModalItems(items)
                  setReorderModalOpen(true)
                }}
                className="min-h-10 sm:min-h-9 text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/10 shrink-0"
                title="Open sequence reordering dialog"
              >
                <ArrowUpDown className="size-3.5" />
                <span>Reorder Sequence</span>
              </Button>

              <span className="tabular-nums font-mono text-[11px] sm:text-xs">
                Showing {filtered.length} of {items.length} members
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Card: Desktop Table & Mobile Cards */}
      <Card className="overflow-hidden border-border/80 shadow-xs">
        <CardContent className="p-0">
          {/* Mobile Card List (md:hidden) */}
          <div className="md:hidden divide-y divide-border/60">
            {pageItems.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <SlidersHorizontal className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">
                      {items.length === 0 ? "No team members yet" : "No matching members found"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {items.length === 0
                        ? "Add your first member to showcase your leadership and team."
                        : "Try broadening your search term or clearing active filters."}
                    </p>
                  </div>
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={handleResetFilters} className="min-h-11 mt-2">
                      Clear active filters
                    </Button>
                  )}
                  {items.length === 0 && (
                    <Button asChild size="sm" className="min-h-11 mt-2 bg-brand-primary text-white hover:bg-brand-primary-dark">
                      <Link href="/admin/team/new">
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add First Member
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              pageItems.map((member) => {
                const currentIndexInFiltered = filtered.findIndex((m) => m.id === member.id)
                const isFirst = currentIndexInFiltered === 0
                const isLast = currentIndexInFiltered === filtered.length - 1
                const isBusy = reorderingId === member.id

                const tierKey = (member.tier as TeamTier) || "vision"
                const meta = TEAM_TIER_DETAILS[tierKey] || TEAM_TIER_DETAILS.vision
                const isFeatured = !!member.is_featured

                return (
                  <div
                    key={member.id}
                    className="p-3.5 space-y-3 hover:bg-muted/20 active:bg-muted/30 transition-colors"
                  >
                    {/* Header Row: Avatar, Info, Actions */}
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0 cursor-pointer" onClick={() => router.push(`/admin/team/${member.id}`)}>
                        {member.image && isSafeMediaUrl(member.image) ? (
                          <img
                            src={member.image}
                            alt=""
                            className="size-12 rounded-xl object-cover border border-border/80 shadow-2xs"
                          />
                        ) : (
                          <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-base font-semibold text-muted-foreground border border-border/80">
                            {member.name.charAt(0)}
                          </div>
                        )}
                        <span
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-background",
                            member.is_published ? "bg-emerald-500" : "bg-slate-300",
                          )}
                          title={member.is_published ? "Published" : "Hidden"}
                        />
                      </div>

                      <div className="min-w-0 flex-1 cursor-pointer" onClick={() => router.push(`/admin/team/${member.id}`)}>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-semibold text-foreground text-sm leading-tight truncate">
                            {member.name}
                          </p>
                          {isFeatured && (
                            <span
                              title="Featured in Hero collage"
                              className="inline-flex items-center justify-center size-5 rounded-full bg-amber-50 border border-amber-200 text-amber-500 shrink-0"
                            >
                              <Star className="size-3 fill-amber-400 text-amber-500" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium truncate mt-0.5">
                          {member.role}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                              meta.badgeTone,
                            )}
                          >
                            {meta.label}
                          </span>
                          <span className="inline-flex items-center gap-0.5 rounded-full border border-border/80 bg-muted/60 px-2 py-0.5 text-[10px] font-mono font-bold tabular-nums text-foreground/80">
                            Order #{currentIndexInFiltered + 1}
                          </span>
                        </div>
                      </div>

                      {/* Reorder Up/Down with Filled Triangle Buttons + Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {/* Quick Up/Down Filled Triangle Buttons */}
                        <div className="flex flex-col border border-border/80 rounded-lg p-0.5 bg-muted/20">
                          <button
                            type="button"
                            disabled={isFirst || isBusy}
                            onClick={() => handleMove(member.id, "up")}
                            className={cn(
                              "p-1.5 rounded text-muted-foreground/70 hover:text-primary hover:bg-primary/10 active:bg-primary/20 transition-colors",
                              (isFirst || isBusy) && "opacity-20 pointer-events-none cursor-not-allowed"
                            )}
                            title={`Move ${member.name} up (appear earlier)`}
                            aria-label={`Move ${member.name} up`}
                          >
                            {isBusy ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <svg viewBox="0 0 16 16" fill="currentColor" className="size-3" aria-hidden="true">
                                <path d="M8 4.5l4.5 5.5h-9l4.5-5.5z" />
                              </svg>
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={isLast || isBusy}
                            onClick={() => handleMove(member.id, "down")}
                            className={cn(
                              "p-1.5 rounded text-muted-foreground/70 hover:text-primary hover:bg-primary/10 active:bg-primary/20 transition-colors",
                              (isLast || isBusy) && "opacity-20 pointer-events-none cursor-not-allowed"
                            )}
                            title={`Move ${member.name} down (appear later)`}
                            aria-label={`Move ${member.name} down`}
                          >
                            {isBusy ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <svg viewBox="0 0 16 16" fill="currentColor" className="size-3" aria-hidden="true">
                                <path d="M8 11.5l-4.5-5.5h9l-4.5 5.5z" />
                              </svg>
                            )}
                          </button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-9 rounded-lg text-muted-foreground hover:text-foreground"
                          asChild
                        >
                          <Link href={`/admin/team/${member.id}`} aria-label={`Edit ${member.name}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          disabled={deleting}
                          aria-label={`Delete ${member.name}`}
                          onClick={() => setDeleteId(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Bio preview if any */}
                    {member.bio && (
                      <p
                        title={member.bio}
                        className="text-xs text-muted-foreground/90 line-clamp-2 bg-muted/40 rounded-lg p-2 leading-relaxed"
                      >
                        {formatBioExcerpt(member.bio, 110)}
                      </p>
                    )}

                    {/* Quick Toggles Row */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50">
                      {/* Hero Toggle */}
                      <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 border border-border/60">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Star
                            className={cn(
                              "size-3.5 shrink-0 transition-colors",
                              isFeatured ? "fill-amber-400 text-amber-500" : "text-muted-foreground/40",
                            )}
                          />
                          <span className="text-xs font-medium text-foreground truncate">Hero</span>
                        </div>
                        <Switch
                          checked={isFeatured}
                          disabled={togglingFeaturedId === member.id || !member.is_published}
                          onCheckedChange={() => handleToggleFeatured(member.id, isFeatured)}
                          className="data-[state=checked]:bg-primary shrink-0"
                          aria-label={`Toggle Hero collage for ${member.name}`}
                        />
                      </div>

                      {/* Visible Toggle */}
                      <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 border border-border/60">
                        <span
                          className={cn(
                            "text-xs font-semibold truncate",
                            member.is_published ? "text-black dark:text-white" : "text-muted-foreground",
                          )}
                        >
                          {member.is_published ? "Visible" : "Hidden"}
                        </span>
                        <Switch
                          checked={member.is_published}
                          disabled={publishingId === member.id}
                          onCheckedChange={() => handleTogglePublish(member.id, member.is_published)}
                          className="data-[state=checked]:bg-primary shrink-0"
                          aria-label={`Toggle visibility for ${member.name}`}
                        />
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Desktop Table View (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-24 text-center font-semibold">Order</TableHead>
                  <TableHead className="min-w-[200px] max-w-[320px] font-semibold">Member</TableHead>
                  <TableHead className="font-semibold">Tier / Group</TableHead>
                  <TableHead className="font-semibold">Role / Position</TableHead>
                  <TableHead className="w-28 text-center font-semibold">Hero (★)</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-14 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <SlidersHorizontal className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">
                            {items.length === 0 ? "No team members yet" : "No matching members found"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {items.length === 0
                              ? "Add your first member to showcase your leadership and team on Who We Are."
                              : "Try broadening your search term or clearing active filters."}
                          </p>
                        </div>
                        {hasActiveFilters && (
                          <Button variant="outline" size="sm" onClick={handleResetFilters} className="min-h-9 mt-2">
                            Clear active filters
                          </Button>
                        )}
                        {items.length === 0 && (
                          <Button asChild size="sm" className="min-h-9 mt-2">
                            <Link href="/admin/team/new">
                              <Plus className="mr-1.5 h-4 w-4" />
                              Add First Member
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pageItems.map((member) => {
                    const currentIndexInFiltered = filtered.findIndex((m) => m.id === member.id)
                    const isFirst = currentIndexInFiltered === 0
                    const isLast = currentIndexInFiltered === filtered.length - 1
                    const isBusy = reorderingId === member.id

                    const tierKey = (member.tier as TeamTier) || "vision"
                    const meta = TEAM_TIER_DETAILS[tierKey] || TEAM_TIER_DETAILS.vision
                    const isFeatured = !!member.is_featured

                    return (
                      <TableRow
                        key={member.id}
                        className="group transition-colors hover:bg-muted/40 cursor-pointer"
                        onClick={() => router.push(`/admin/team/${member.id}`)}
                      >
                        {/* Order Column with Filled Triangle Up/Down Buttons */}
                        <TableCell className="w-24 p-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-foreground w-6 tabular-nums">
                              #{currentIndexInFiltered + 1}
                            </span>
                            <div className="flex flex-col items-center">
                              <button
                                type="button"
                                disabled={isFirst || isBusy}
                                onClick={() => handleMove(member.id, "up")}
                                className={cn(
                                  "p-1 rounded text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-colors",
                                  (isFirst || isBusy) && "opacity-20 pointer-events-none cursor-not-allowed"
                                )}
                                title={`Move ${member.name} up (appear earlier)`}
                                aria-label={`Move ${member.name} up`}
                              >
                                {isBusy ? (
                                  <Loader2 className="size-2.5 animate-spin" />
                                ) : (
                                  <svg viewBox="0 0 16 16" fill="currentColor" className="size-2.5" aria-hidden="true">
                                    <path d="M8 4.5l4.5 5.5h-9l4.5-5.5z" />
                                  </svg>
                                )}
                              </button>
                              <button
                                type="button"
                                disabled={isLast || isBusy}
                                onClick={() => handleMove(member.id, "down")}
                                className={cn(
                                  "p-1 rounded text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-colors",
                                  (isLast || isBusy) && "opacity-20 pointer-events-none cursor-not-allowed"
                                )}
                                title={`Move ${member.name} down (appear later)`}
                                aria-label={`Move ${member.name} down`}
                              >
                                {isBusy ? (
                                  <Loader2 className="size-2.5 animate-spin" />
                                ) : (
                                  <svg viewBox="0 0 16 16" fill="currentColor" className="size-2.5" aria-hidden="true">
                                    <path d="M8 11.5l-4.5-5.5h9l-4.5 5.5z" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        </TableCell>

                        {/* Member Identity & Hero Pill */}
                        <TableCell className="py-3 max-w-[280px] lg:max-w-[340px]">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              {member.image && isSafeMediaUrl(member.image) ? (
                                <img
                                  src={member.image}
                                  alt=""
                                  className="h-11 w-11 rounded-lg object-cover border border-border/80 shadow-2xs"
                                />
                              ) : (
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground border border-border/80">
                                  {member.name.charAt(0)}
                                </div>
                              )}
                              <span
                                className={cn(
                                  "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-background",
                                  member.is_published ? "bg-emerald-500" : "bg-slate-300",
                                )}
                                title={member.is_published ? "Published" : "Hidden"}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-foreground text-sm leading-tight truncate">
                                  {member.name}
                                </p>
                                {isFeatured && (
                                  <span
                                    title="Featured in Hero collage (Top 3)"
                                    aria-label="Featured in Hero collage"
                                    className="inline-flex items-center justify-center size-5 rounded-full bg-amber-50 border border-amber-200 text-amber-500 shrink-0 shadow-2xs"
                                  >
                                    <Star className="size-3 fill-amber-400 text-amber-500" />
                                  </span>
                                )}
                              </div>
                              {member.bio ? (
                                <p
                                  title={member.bio}
                                  className="text-xs text-muted-foreground truncate max-w-[200px] lg:max-w-[260px] mt-0.5 cursor-help"
                                >
                                  {formatBioExcerpt(member.bio, 60)}
                                </p>
                              ) : (
                                <p className="text-xs text-muted-foreground/60 italic mt-0.5">No bio written</p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Tier Badge */}
                        <TableCell className="py-3">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
                              meta.badgeTone,
                            )}
                          >
                            {meta.label}
                          </span>
                        </TableCell>

                        {/* Role */}
                        <TableCell className="py-3 text-sm text-foreground/90 font-medium">
                          {member.role}
                        </TableCell>

                        {/* Hero Collage Direct Toggle */}
                        <TableCell className="py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <Star
                              className={cn(
                                "size-4 shrink-0 transition-colors",
                                isFeatured ? "fill-amber-400 text-amber-500" : "text-muted-foreground/30",
                              )}
                            />
                            <Switch
                              checked={isFeatured}
                              disabled={togglingFeaturedId === member.id || !member.is_published}
                              onCheckedChange={() => handleToggleFeatured(member.id, isFeatured)}
                              className="data-[state=checked]:bg-primary"
                              aria-label={
                                isFeatured
                                  ? `Remove ${member.name} from Hero collage`
                                  : `Feature ${member.name} in Hero collage`
                              }
                            />
                          </div>
                        </TableCell>

                        {/* Publication Status & Direct Toggle */}
                        <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2.5">
                            <Switch
                              checked={member.is_published}
                              disabled={publishingId === member.id}
                              onCheckedChange={() => handleTogglePublish(member.id, member.is_published)}
                              className="data-[state=checked]:bg-primary"
                              aria-label={`Toggle publication for ${member.name}`}
                            />
                            <span
                              className={cn(
                                "text-xs font-semibold",
                                member.is_published ? "text-black dark:text-white" : "text-muted-foreground",
                              )}
                            >
                              {member.is_published ? "Visible" : "Hidden"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-3 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-9 rounded-md text-muted-foreground hover:text-foreground"
                              asChild
                            >
                              <Link href={`/admin/team/${member.id}`} aria-label={`Edit ${member.name}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-9 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              disabled={deleting}
                              aria-label={`Delete ${member.name}`}
                              onClick={() => setDeleteId(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border/70 px-4 py-3 bg-muted/20">
              <p className="text-xs text-muted-foreground text-center sm:text-left">
                Page <span className="font-semibold text-foreground">{page}</span> of{" "}
                <span className="font-semibold text-foreground">{totalPages}</span>
                <span className="ml-1 opacity-70">({filtered.length} total)</span>
              </p>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-1.5 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="min-h-11 sm:min-h-9 px-3 text-xs justify-center"
                >
                  <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="min-h-11 sm:min-h-9 px-3 text-xs justify-center"
                >
                  Next
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sequence Reordering Modal with Drag-and-Drop */}
      <Dialog open={reorderModalOpen} onOpenChange={setReorderModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-border/70 bg-muted/20 text-left">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ArrowUpDown className="size-4" />
                </div>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold">
                    Drag & Reorder Team Members
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Drag the grip handles to arrange members, or use the quick Top / Triangle buttons.
                  </DialogDescription>
                </div>
              </div>

              {isModalDirty && (
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-full shrink-0">
                  Unsaved changes
                </span>
              )}
            </div>

            {/* Modal Tier Filters */}
            <div className="pt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setModalTierFilter("all")}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-semibold transition-colors shrink-0",
                  modalTierFilter === "all"
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                All Groups ({modalItems.length})
              </button>
              {TEAM_TIERS.map((tierKey) => {
                const meta = TEAM_TIER_DETAILS[tierKey]
                const count = modalItems.filter((m) => (m.tier || "vision") === tierKey).length
                return (
                  <button
                    key={tierKey}
                    type="button"
                    onClick={() => setModalTierFilter(tierKey)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-semibold transition-colors shrink-0",
                      modalTierFilter === tierKey
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {meta.label} ({count})
                  </button>
                )
              })}
            </div>
          </DialogHeader>

          {/* Modal Sortable Drag & Drop List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {visibleModalMembers.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-8">
                No members found in this group.
              </p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleModalDragEnd}
              >
                <SortableContext
                  items={visibleModalMembers.map((m) => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {visibleModalMembers.map((member, index) => (
                    <SortableTeamMemberRow
                      key={member.id}
                      member={member}
                      index={index}
                      total={visibleModalMembers.length}
                      onMoveUp={() => handleModalMoveStep(member.id, "up")}
                      onMoveDown={() => handleModalMoveStep(member.id, "down")}
                      onMoveToTop={() => handleModalMoveExtreme(member.id, "top")}
                      onMoveToBottom={() => handleModalMoveExtreme(member.id, "bottom")}
                      disabled={modalSaving}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>

          <div className="p-3 sm:p-4 border-t border-border/70 bg-muted/20 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{visibleModalMembers.length}</span> members in this view
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setModalItems(items)
                  setReorderModalOpen(false)
                }}
                disabled={modalSaving}
                className="min-h-9 px-3 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={modalSaving}
                onClick={handleSaveModalOrder}
                className="min-h-9 px-4 text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary-dark"
              >
                {modalSaving && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
                {isModalDirty ? "Save New Order" : "Done"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!deleting && !open) setDeleteId(null)
        }}
        title="Delete Team Member"
        description={`Are you sure you want to delete ${memberToDelete?.name ?? "this member"}? This will remove them from the website and organizational structure.`}
        loading={deleting}
        closeOnConfirm={false}
        onConfirm={handleDelete}
      />
    </div>
  )
}
