"use client"

import { useState, useTransition } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, X, ArrowUp, ArrowDown, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { reorderFacebookPosts } from "@/lib/actions/facebook-posts"
import type { FacebookPost } from "@/lib/facebook-posts/types"
import { showToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

interface SortableItemProps {
  post: FacebookPost
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
}

function SortableItem({ post, index, total, onMoveUp, onMoveDown }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: post.id })

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
        "flex items-center gap-3 rounded-xl border bg-card p-3 shadow-xs transition-shadow",
        isDragging && "ring-2 ring-primary shadow-lg"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label={`Drag to reorder ${post.title}`}
      >
        <GripVertical className="size-5" />
      </button>

      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground font-mono">
        {index + 1}
      </span>

      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="font-medium text-sm truncate">{post.title}</p>
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] font-medium px-1.5 py-0",
              post.is_published 
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" 
                : "bg-muted text-muted-foreground"
            )}
          >
            {post.is_published ? "Live" : "Draft"}
          </Badge>
          <span className="text-[11px] text-muted-foreground">Original Order: #{post.display_order}</span>
        </div>
      </div>

      {/* Accessible Mobile/Keyboard Step Buttons */}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          disabled={index === 0}
          onClick={onMoveUp}
          aria-label="Move Up"
        >
          <ArrowUp className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          disabled={index === total - 1}
          onClick={onMoveDown}
          aria-label="Move Down"
        >
          <ArrowDown className="size-4" />
        </Button>
      </div>
    </div>
  )
}

interface PostsReorderProps {
  posts: FacebookPost[]
  onClose: () => void
}

export function PostsReorder({ posts: initialPosts, onClose }: PostsReorderProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [pending, startTransition] = useTransition()

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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setPosts((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  function moveItem(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= posts.length) return
    setPosts(prev => arrayMove(prev, index, targetIndex))
  }

  function handleSave() {
    startTransition(async () => {
      try {
        const result = await reorderFacebookPosts(posts.map(p => p.id))
        if (result.ok) {
          showToast.success({
            title: "Display order updated",
            description: "New post ordering saved successfully.",
          })
          onClose()
        } else {
          showToast.error({
            title: "Reorder failed",
            description: result.error,
          })
        }
      } catch {
        showToast.error({
          title: "Reorder failed",
          description: "Could not save reordered list. Please try again.",
        })
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border bg-card p-6 shadow-xl space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-2 border-b">
          <div>
            <h2 className="text-lg font-bold">Reorder Community Posts</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Drag items or use the up/down arrows. Posts at the top appear first on the homepage.
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose} disabled={pending}>
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={posts.map(p => p.id)} strategy={verticalListSortingStrategy}>
              {posts.map((post, index) => (
                <SortableItem 
                  key={post.id} 
                  post={post} 
                  index={index} 
                  total={posts.length}
                  onMoveUp={() => moveItem(index, "up")}
                  onMoveDown={() => moveItem(index, "down")}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-xs text-muted-foreground">
            {posts.length} posts to be re-indexed
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Save Order
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
