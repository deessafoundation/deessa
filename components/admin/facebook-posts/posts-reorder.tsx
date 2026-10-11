"use client"

import { useState, useTransition } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { reorderFacebookPosts } from "@/lib/actions/facebook-posts"
import type { FacebookPost } from "@/lib/facebook-posts/types"
import { toast } from "sonner"

interface SortableItemProps {
  post: FacebookPost
}

function SortableItem({ post }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: post.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm"
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label={`Drag to reorder ${post.title}`}
      >
        <GripVertical className="size-5 text-muted-foreground" />
      </button>
      <div className="flex-1 space-y-1">
        <p className="font-medium">{post.title}</p>
        <div className="flex items-center gap-2">
          <Badge variant={post.is_published ? "default" : "secondary"} className="text-xs">
            {post.is_published ? "Published" : "Draft"}
          </Badge>
          <span className="text-xs text-muted-foreground">Order: {post.display_order}</span>
        </div>
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
    useSensor(PointerSensor),
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

  function handleSave() {
    startTransition(async () => {
      try {
        const result = await reorderFacebookPosts(posts.map(p => p.id))
        if (result.ok) {
          toast.success("Posts reordered successfully")
          onClose()
        } else {
          toast.error(result.error)
        }
      } catch {
        toast.error("Could not reorder posts. Please try again.")
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] border bg-background p-6 shadow-lg sm:rounded-lg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Reorder Posts</h2>
            <p className="text-sm text-muted-foreground">
              Drag and drop to change the display order. Posts at the top appear first on the homepage.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={pending}>
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="max-h-[60vh] space-y-2 overflow-y-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={posts.map(p => p.id)} strategy={verticalListSortingStrategy}>
              {posts.map((post) => (
                <SortableItem key={post.id} post={post} />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={pending}>
            {pending ? "Saving..." : "Save Order"}
          </Button>
        </div>
      </div>
    </div>
  )
}
