"use client"

import { useState, useTransition, useEffect } from "react"
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
import { GripVertical, ArrowUp, ArrowDown, Check, Loader2, Star } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { reorderArtworks } from "@/lib/actions/artworks"
import { toArtwork, type ArtworkRow } from "@/lib/arts/types"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"

interface SortableArtworkProps {
  artwork: ArtworkRow
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
}

function SortableArtwork({ artwork, index, total, onMoveUp, onMoveDown }: SortableArtworkProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: artwork.id })
  const art = toArtwork(artwork)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card p-2.5 sm:p-3 shadow-xs transition-shadow",
        isDragging && "ring-2 ring-primary shadow-lg"
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label={`Drag to reorder ${artwork.title}`}
      >
        <GripVertical className="size-4 sm:size-5" />
      </button>

      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold tabular-nums">
        #{index + 1}
      </span>

      {art?.src && (
        <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
          <Image src={art.src} alt="" fill sizes="40px" className="object-cover" />
        </div>
      )}

      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="font-semibold text-sm truncate">{artwork.title}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-medium px-1.5 py-0",
              artwork.is_published
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                : "bg-muted text-muted-foreground"
            )}
          >
            {artwork.is_published ? "Published" : "Draft"}
          </Badge>
          {artwork.is_featured && (
            <Badge
              variant="outline"
              className="text-[10px] font-medium px-1.5 py-0 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
            >
              <Star className="size-2.5 mr-1 fill-amber-500 text-amber-500" />
              Featured
            </Badge>
          )}
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            {artwork.artist_credit || "No credit"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground"
          disabled={index === 0}
          onClick={onMoveUp}
          aria-label={`Move ${artwork.title} up`}
        >
          <ArrowUp className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground"
          disabled={index === total - 1}
          onClick={onMoveDown}
          aria-label={`Move ${artwork.title} down`}
        >
          <ArrowDown className="size-4" />
        </Button>
      </div>
    </div>
  )
}

interface ArtworksReorderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  artworks: ArtworkRow[]
  onReorderSuccess: (newArtworks: ArtworkRow[]) => void
}

export function ArtworksReorderModal({
  open,
  onOpenChange,
  artworks: initialArtworks,
  onReorderSuccess,
}: ArtworksReorderModalProps) {
  const [items, setItems] = useState<ArtworkRow[]>(initialArtworks)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setItems(initialArtworks)
  }, [initialArtworks, open])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setItems((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === active.id)
      const newIndex = prev.findIndex((item) => item.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  function moveItem(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.length) return
    setItems((prev) => arrayMove(prev, index, targetIndex))
  }

  const isOrderChanged = JSON.stringify(items.map((i) => i.id)) !== JSON.stringify(initialArtworks.map((i) => i.id))

  function handleSave() {
    startTransition(async () => {
      const orderedIds = items.map((i) => i.id)
      const result = await reorderArtworks(orderedIds)

      if (!result.ok) {
        notifications.showError({ description: result.error || "Failed to update artwork order." })
        return
      }

      notifications.showSuccess({ description: "Artworks order updated successfully." })
      const updated = items.map((item, idx) => ({ ...item, display_order: idx + 1 }))
      onReorderSuccess(updated)
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] flex flex-col p-0 sm:max-w-xl rounded-2xl overflow-hidden border shadow-2xl">
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b bg-card">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
              <ArrowUpDown className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">Reorder Artworks</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Drag to sequence items or use step buttons. The order syncs with the live /arts gallery and homepage.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              {items.map((artwork, index) => (
                <SortableArtwork
                  key={artwork.id}
                  artwork={artwork}
                  index={index}
                  total={items.length}
                  onMoveUp={() => moveItem(index, "up")}
                  onMoveDown={() => moveItem(index, "down")}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <DialogFooter className="p-4 sm:p-5 border-t bg-card flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isOrderChanged ? (
              <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                Unsaved sequence
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">Original order</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setItems(initialArtworks)
                onOpenChange(false)
              }}
              disabled={isPending}
              className="h-10 px-4 text-sm font-medium"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSave}
              disabled={!isOrderChanged || isPending}
              className="h-10 px-5 text-sm font-semibold shadow-xs"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving Order…
                </>
              ) : (
                <>
                  <Check className="mr-2 size-4" />
                  Apply Order
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
