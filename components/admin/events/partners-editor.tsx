"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  Loader2,
  Users,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Copy,
  Settings,
  Upload,
  Link2,
  Check,
  X,
  Pencil,
  ExternalLink,
  Search,
  Building2,
  Layers,
  Sparkles,
  ArrowUpDown,
  Globe,
} from "lucide-react"
import { notifications } from "@/lib/notifications"
import {
  createPartnerCategory,
  updatePartnerCategory,
  deletePartnerCategory,
  reorderCategories,
  createPartner,
  updatePartner,
  createContextPartner,
  updateContextPartner,
  deleteContextPartner,
  reorderPartners,
} from "@/lib/actions/context-partners"
import type { PartnerCategory, Partner, ContextPartnerDetailed } from "@/lib/types/partners"
import { DEFAULT_EVENT_CATEGORIES } from "@/lib/types/partners"

interface PartnersEditorProps {
  eventId: string
  categories: PartnerCategory[]
  availablePartners: Partner[]
  linkedPartners: ContextPartnerDetailed[]
  onUpdate?: () => void
}

interface PartnerModalState {
  isOpen: boolean
  mode: "add" | "edit"
  linkId?: string
  partnerId?: string
  name: string
  category_key: string
  website: string
  logo: string
  uploadMethod: "upload" | "url"
}

export function PartnersEditor({
  eventId,
  categories: initialCategories,
  availablePartners,
  linkedPartners: initialLinkedPartners,
  onUpdate,
}: PartnersEditorProps) {
  // Navigation & View Mode
  const [view, setView] = useState<"manage" | "categories">(
    initialCategories.length === 0 ? "categories" : "manage"
  )

  // Local synced state
  const [categories, setCategories] = useState<PartnerCategory[]>(initialCategories)
  const [linkedPartners, setLinkedPartners] = useState<ContextPartnerDetailed[]>(initialLinkedPartners)

  // Keep state in sync with prop updates from parent refetches
  useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  useEffect(() => {
    setLinkedPartners(initialLinkedPartners)
  }, [initialLinkedPartners])

  // Operation loading state
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all")

  // Partner Modal (Add & Edit)
  const [partnerModal, setPartnerModal] = useState<PartnerModalState>({
    isOpen: false,
    mode: "add",
    name: "",
    category_key: categories[0]?.category_key || "organizers",
    website: "",
    logo: "",
    uploadMethod: "upload",
  })
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isDraggingLogo, setIsDraggingLogo] = useState(false)
  const logoFileInputRef = useRef<HTMLInputElement>(null)

  // Category Edit state
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [categoryForm, setCategoryForm] = useState({ key: "", label: "" })

  // Delete Dialog state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "partner" | "category"
    id: string
    name: string
  } | null>(null)

  // Diagnostics: Run orphaned records cleanup on mount
  useEffect(() => {
    const checkAndCleanOrphaned = async () => {
      try {
        const { cleanupOrphanedPartners } = await import("@/lib/actions/cleanup-orphaned-partners")
        const result = await cleanupOrphanedPartners(eventId)
        if (result.success && result.orphanedCount > 0) {
          notifications.showInfo({
            description: `Cleaned up ${result.orphanedCount} orphaned partner record(s)`,
          })
          onUpdate?.()
        }
      } catch (err) {
        console.error("Failed to check orphaned partners:", err)
      }
    }
    checkAndCleanOrphaned()
  }, [eventId, onUpdate])

  // Summary statistics
  const stats = useMemo(() => {
    const total = linkedPartners.length
    const visible = linkedPartners.filter((p) => p.is_visible).length
    const hidden = total - visible
    const categoryCount = categories.length
    return { total, visible, hidden, categoryCount }
  }, [linkedPartners, categories])

  // Filtered partners based on search and category tab
  const filteredPartners = useMemo(() => {
    return linkedPartners.filter((partner) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        partner.partner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (partner.partner_website && partner.partner_website.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory =
        selectedCategoryFilter === "all" || partner.category_key === selectedCategoryFilter

      return matchesSearch && matchesCategory
    })
  }, [linkedPartners, searchQuery, selectedCategoryFilter])

  // Open modal for Adding Partner
  const handleOpenAddModal = (presetCategoryKey?: string) => {
    const defaultCatKey = presetCategoryKey || categories[0]?.category_key || ""
    setPartnerModal({
      isOpen: true,
      mode: "add",
      name: "",
      category_key: defaultCatKey,
      website: "",
      logo: "",
      uploadMethod: "upload",
    })
  }

  // Open modal for Editing Partner
  const handleOpenEditModal = (partner: ContextPartnerDetailed) => {
    setPartnerModal({
      isOpen: true,
      mode: "edit",
      linkId: partner.id,
      partnerId: partner.partner_id,
      name: partner.partner_name,
      category_key: partner.category_key,
      website: partner.partner_website || "",
      logo: partner.partner_logo || "",
      uploadMethod: partner.partner_logo && !partner.partner_logo.includes("supabase.co") ? "url" : "upload",
    })
  }

  // Handle Logo Upload via Supabase Storage
  const handleLogoUpload = async (file: File) => {
    const MAX_SIZE_MB = 2
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]

    if (!ALLOWED_TYPES.includes(file.type)) {
      notifications.showError({ description: "Please upload a PNG, JPG, WebP, or SVG image." })
      return
    }

    if (file.size > MAX_SIZE_BYTES) {
      notifications.showError({ description: `Logo exceeds ${MAX_SIZE_MB}MB maximum limit.` })
      return
    }

    setIsUploadingLogo(true)

    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        notifications.showError({ description: "You must be logged in to upload files." })
        setIsUploadingLogo(false)
        return
      }

      const fileExt = file.name.split(".").pop()?.toLowerCase() || "png"
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `temp/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("partner-logos")
        .upload(filePath, file, { cacheControl: "3600", upsert: false })

      if (uploadError) {
        console.error("Storage upload error:", uploadError)
        notifications.showError({ description: "Failed to upload logo image." })
        setIsUploadingLogo(false)
        return
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("partner-logos").getPublicUrl(filePath)

      setPartnerModal((prev) => ({ ...prev, logo: publicUrl }))
      notifications.showSuccess({ description: "Logo uploaded successfully" })
    } catch (err) {
      console.error("Logo upload failed:", err)
      notifications.showError({ description: "Error processing logo upload." })
    } finally {
      setIsUploadingLogo(false)
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = ""
      }
    }
  }

  // Save Partner (Create or Update)
  const handleSavePartner = async () => {
    const trimmedName = partnerModal.name.trim()
    if (!trimmedName) {
      notifications.showError({ description: "Partner name is required." })
      return
    }

    if (!partnerModal.category_key) {
      notifications.showError({ description: "Please select a partner category." })
      return
    }

    // Auto-normalize website URL if needed
    let trimmedWebsite = partnerModal.website.trim()
    if (trimmedWebsite && !/^https?:\/\//i.test(trimmedWebsite)) {
      trimmedWebsite = `https://${trimmedWebsite}`
    }

    const trimmedLogo = partnerModal.logo.trim()

    if (partnerModal.mode === "add") {
      setActionLoading("save-partner")
      try {
        // 1. Create partner in master table scoped to this event
        const partnerResult = await createPartner({
          name: trimmedName,
          website: trimmedWebsite || undefined,
          logo: trimmedLogo || undefined,
          type: "partner",
          is_published: true,
          created_context_type: "event",
          created_context_id: eventId,
        })

        if (!partnerResult.success || !partnerResult.data) {
          throw new Error(partnerResult.error || "Failed to create partner")
        }

        // 2. Link partner to this event in the selected category
        const categoryPartners = linkedPartners.filter((p) => p.category_key === partnerModal.category_key)
        const linkResult = await createContextPartner({
          context_type: "event",
          context_id: eventId,
          partner_id: partnerResult.data.id,
          category_key: partnerModal.category_key,
          display_order: categoryPartners.length,
          is_visible: true,
        })

        if (!linkResult.success || !linkResult.data) {
          throw new Error(linkResult.error || "Failed to link partner to event")
        }

        // 3. Optimistic local state update
        const matchingCategory = categories.find((c) => c.category_key === partnerModal.category_key)
        const newLinkedItem: ContextPartnerDetailed = {
          id: linkResult.data.id,
          context_type: "event",
          context_id: eventId,
          partner_id: partnerResult.data.id,
          category_key: partnerModal.category_key,
          partner_display_order: categoryPartners.length,
          is_visible: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          partner_name: trimmedName,
          partner_logo: trimmedLogo || null,
          partner_logo_storage_path: null,
          partner_logo_uploaded_at: null,
          partner_website: trimmedWebsite || null,
          partner_description: null,
          partner_type: "partner",
          category_label: matchingCategory?.category_label || partnerModal.category_key,
          category_display_order: matchingCategory?.display_order || 0,
        }

        setLinkedPartners((prev) => [...prev, newLinkedItem])
        setPartnerModal((prev) => ({ ...prev, isOpen: false }))
        notifications.showSuccess({ description: `Partner "${trimmedName}" added successfully` })
        onUpdate?.()
      } catch (err) {
        console.error("Error creating partner:", err)
        notifications.showError({ description: err instanceof Error ? err.message : "Failed to add partner" })
      } finally {
        setActionLoading(null)
      }
    } else if (partnerModal.mode === "edit" && partnerModal.partnerId && partnerModal.linkId) {
      setActionLoading("save-partner")
      try {
        // 1. Update partner details
        const updateResult = await updatePartner(partnerModal.partnerId, {
          name: trimmedName,
          website: trimmedWebsite || null,
          logo: trimmedLogo || null,
        })

        if (!updateResult.success) {
          throw new Error(updateResult.error || "Failed to update partner details")
        }

        // 2. If category changed, update junction record
        const existingPartner = linkedPartners.find((p) => p.id === partnerModal.linkId)
        if (existingPartner && existingPartner.category_key !== partnerModal.category_key) {
          const categoryPartners = linkedPartners.filter((p) => p.category_key === partnerModal.category_key)
          const catResult = await updateContextPartner(partnerModal.linkId, {
            category_key: partnerModal.category_key,
            display_order: categoryPartners.length,
          })
          if (!catResult.success) {
            throw new Error(catResult.error || "Failed to update partner category")
          }
        }

        // 3. Optimistic local state update
        const matchingCategory = categories.find((c) => c.category_key === partnerModal.category_key)
        setLinkedPartners((prev) =>
          prev.map((p) => {
            if (p.id === partnerModal.linkId) {
              return {
                ...p,
                partner_name: trimmedName,
                partner_website: trimmedWebsite || null,
                partner_logo: trimmedLogo || null,
                category_key: partnerModal.category_key,
                category_label: matchingCategory?.category_label || p.category_label,
              }
            }
            return p
          })
        )

        setPartnerModal((prev) => ({ ...prev, isOpen: false }))
        notifications.showSuccess({ description: `Partner "${trimmedName}" updated successfully` })
        onUpdate?.()
      } catch (err) {
        console.error("Error updating partner:", err)
        notifications.showError({ description: err instanceof Error ? err.message : "Failed to update partner" })
      } finally {
        setActionLoading(null)
      }
    }
  }

  // Toggle Visibility with button spinner & confirmation toast
  const handleToggleVisibility = useCallback(
    async (partner: ContextPartnerDetailed) => {
      const nextVisible = !partner.is_visible
      setActionLoading(partner.id)

      try {
        const result = await updateContextPartner(partner.id, { is_visible: nextVisible })
        if (!result.success) {
          throw new Error(result.error || "Failed to update visibility")
        }

        // Apply state update after server confirms
        setLinkedPartners((prev) =>
          prev.map((p) => (p.id === partner.id ? { ...p, is_visible: nextVisible } : p))
        )

        notifications.showSuccess({
          description: nextVisible
            ? `"${partner.partner_name}" is now visible on the public event page`
            : `"${partner.partner_name}" is now hidden from the public event page`,
        })
        onUpdate?.()
      } catch (err) {
        notifications.showError({
          description: err instanceof Error ? err.message : "Failed to update partner visibility",
        })
      } finally {
        setActionLoading(null)
      }
    },
    [onUpdate]
  )

  // Move Partner with Instant Optimistic UI Reordering
  const handleMovePartner = useCallback(
    async (categoryKey: string, currentIndex: number, direction: "up" | "down") => {
      const categoryPartners = linkedPartners
        .filter((p) => p.category_key === categoryKey)
        .sort((a, b) => a.partner_display_order - b.partner_display_order)

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
      if (targetIndex < 0 || targetIndex >= categoryPartners.length) return

      // Optimistic reorder
      const reorderedList = [...categoryPartners]
      const [movedItem] = reorderedList.splice(currentIndex, 1)
      reorderedList.splice(targetIndex, 0, movedItem)

      const updatedCategoryItems = reorderedList.map((item, idx) => ({
        ...item,
        partner_display_order: idx,
      }))

      // Update full linkedPartners state
      const remainingPartners = linkedPartners.filter((p) => p.category_key !== categoryKey)
      setLinkedPartners([...remainingPartners, ...updatedCategoryItems])

      try {
        const partnerOrders = updatedCategoryItems.map((p) => ({
          partner_id: p.partner_id,
          display_order: p.partner_display_order,
        }))

        const result = await reorderPartners({
          context_type: "event",
          context_id: eventId,
          category_key: categoryKey,
          partner_orders: partnerOrders,
        })

        if (!result.success) {
          throw new Error(result.error || "Failed to reorder partners")
        }
        onUpdate?.()
      } catch (err) {
        // Revert to original order
        setLinkedPartners(linkedPartners)
        notifications.showError({ description: "Failed to save partner order" })
      }
    },
    [linkedPartners, eventId, onUpdate]
  )

  // Remove Partner from Event with spinner & confirmation toast
  const handleRemovePartner = useCallback(async () => {
    if (!deleteTarget || deleteTarget.type !== "partner") return

    const partnerId = deleteTarget.id
    const partnerName = deleteTarget.name
    setActionLoading(`delete-${partnerId}`)

    try {
      const result = await deleteContextPartner(partnerId)
      if (!result.success) {
        throw new Error(result.error || "Failed to remove partner")
      }
      setLinkedPartners((prev) => prev.filter((p) => p.id !== partnerId))
      setDeleteTarget(null)
      notifications.showSuccess({ description: `Partner "${partnerName}" removed from this event` })
      onUpdate?.()
    } catch (err) {
      notifications.showError({
        description: err instanceof Error ? err.message : "Failed to remove partner",
      })
    } finally {
      setActionLoading(null)
    }
  }, [deleteTarget, onUpdate])

  // Category Actions
  const handleCopyDefaults = useCallback(async () => {
    setActionLoading("copy-defaults")
    try {
      for (const cat of DEFAULT_EVENT_CATEGORIES) {
        const exists = categories.some((c) => c.category_key === cat.category_key)
        if (!exists) {
          await createPartnerCategory({
            context_type: "event",
            context_id: eventId,
            category_key: cat.category_key,
            category_label: cat.category_label,
            display_order: cat.display_order,
          })
        }
      }
      notifications.showSuccess({ description: "Standard event categories initialized" })
      onUpdate?.()
    } catch (error) {
      notifications.showError({ description: "Failed to create default categories" })
    } finally {
      setActionLoading(null)
    }
  }, [categories, eventId, onUpdate])

  const handleCreateCategory = useCallback(async () => {
    const key = categoryForm.key.trim().toLowerCase().replace(/\s+/g, "_")
    const label = categoryForm.label.trim()

    if (!key || !label) {
      notifications.showError({ description: "Category Key and Label are required" })
      return
    }

    if (categories.some((c) => c.category_key === key)) {
      notifications.showError({ description: "A category with this key already exists" })
      return
    }

    setActionLoading("create-category")
    const result = await createPartnerCategory({
      context_type: "event",
      context_id: eventId,
      category_key: key,
      category_label: label,
      display_order: categories.length,
    })
    setActionLoading(null)

    if (result.success && result.data) {
      notifications.showSuccess({ description: `Category "${label}" created` })
      setCategories((prev) => [...prev, result.data!])
      setCategoryForm({ key: "", label: "" })
      onUpdate?.()
    } else {
      notifications.showError({ description: result.error || "Failed to create category" })
    }
  }, [categoryForm, categories, eventId, onUpdate])

  const handleUpdateCategory = useCallback(
    async (id: string) => {
      const label = categoryForm.label.trim()
      if (!label) {
        notifications.showError({ description: "Category label cannot be empty" })
        return
      }

      setActionLoading(`update-cat-${id}`)
      const result = await updatePartnerCategory(id, { category_label: label })
      setActionLoading(null)

      if (result.success) {
        notifications.showSuccess({ description: "Category updated" })
        setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, category_label: label } : c)))
        setEditingCategoryId(null)
        setCategoryForm({ key: "", label: "" })
        onUpdate?.()
      } else {
        notifications.showError({ description: result.error || "Failed to update category" })
      }
    },
    [categoryForm.label, onUpdate]
  )

  const handleDeleteCategory = useCallback(async () => {
    if (!deleteTarget || deleteTarget.type !== "category") return

    setActionLoading(`delete-cat-${deleteTarget.id}`)
    const result = await deletePartnerCategory(deleteTarget.id)
    setActionLoading(null)

    if (result.success) {
      notifications.showSuccess({ description: `Category "${deleteTarget.name}" deleted` })
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      setDeleteTarget(null)
      onUpdate?.()
    } else {
      notifications.showError({ description: result.error || "Failed to delete category" })
    }
  }, [deleteTarget, onUpdate])

  const handleMoveCategory = useCallback(
    async (index: number, direction: "up" | "down") => {
      const targetIndex = direction === "up" ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= categories.length) return

      const updated = [...categories]
      ;[updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]]
      const reordered = updated.map((cat, idx) => ({ ...cat, display_order: idx }))
      setCategories(reordered)

      await reorderCategories({
        context_type: "event",
        context_id: eventId,
        category_orders: reordered.map((cat) => ({
          category_key: cat.category_key,
          display_order: cat.display_order,
        })),
      })
      onUpdate?.()
    },
    [categories, eventId, onUpdate]
  )

  return (
    <>
      <div className="space-y-6">
        {/* Main Toolbar & Header */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  Event Partners & Collaborators
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Manage all organizing partners, collaborators, sponsors, and supporters for this event.
                </CardDescription>
              </div>

              {/* View Switcher & Primary Add CTA */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex rounded-lg border border-border/80 bg-muted/40 p-1">
                  <Button
                    type="button"
                    variant={view === "manage" ? "default" : "ghost"}
                    size="sm"
                    className="h-8 text-xs font-medium"
                    onClick={() => setView("manage")}
                    disabled={categories.length === 0}
                  >
                    <Layers className="mr-1.5 h-3.5 w-3.5" />
                    Partners
                  </Button>
                  <Button
                    type="button"
                    variant={view === "categories" ? "default" : "ghost"}
                    size="sm"
                    className="h-8 text-xs font-medium"
                    onClick={() => setView("categories")}
                  >
                    <Settings className="mr-1.5 h-3.5 w-3.5" />
                    Categories ({categories.length})
                  </Button>
                </div>

                {categories.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleOpenAddModal()}
                    className="h-9 shadow-xs font-medium"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Partner
                  </Button>
                )}
              </div>
            </div>

            {/* Metric Stats Bar */}
            <div className="mt-4 pt-4 border-t border-border/60 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <span className="flex h-2 w-2 rounded-full bg-primary" />
                <span>Total: {stats.total}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <span className="flex h-2 w-2 rounded-full bg-foreground/60" />
                <span>Visible: {stats.visible}</span>
              </div>
              {stats.hidden > 0 && (
                <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                  <span className="flex h-2 w-2 rounded-full bg-muted-foreground/60" />
                  <span>Hidden: {stats.hidden}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span>Active Categories: {stats.categoryCount}</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* View 1: Manage Partners */}
        {view === "manage" && (
          <div className="space-y-6">
            {categories.length === 0 ? (
              /* No categories state */
              <Card className="border-dashed border-2 p-8 text-center bg-muted/10">
                <CardContent className="space-y-4 max-w-md mx-auto p-0">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold">No Categories Configured</h3>
                    <p className="text-xs text-muted-foreground">
                      Partners are organized by category (e.g. Organizing Partners, In Collaboration With). Initialize
                      the 5 summit categories or add custom ones.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                    <Button
                      size="sm"
                      onClick={handleCopyDefaults}
                      disabled={actionLoading === "copy-defaults"}
                      className="font-medium"
                    >
                      {actionLoading === "copy-defaults" ? (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      ) : (
                        <Copy className="mr-1.5 h-4 w-4" />
                      )}
                      Initialize Summit Categories
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setView("categories")}>
                      Custom Categories
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Search & Category Filter Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="Search partners by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-xs"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    <Button
                      type="button"
                      variant={selectedCategoryFilter === "all" ? "default" : "outline"}
                      size="sm"
                      className="h-8 text-xs shrink-0"
                      onClick={() => setSelectedCategoryFilter("all")}
                    >
                      All ({linkedPartners.length})
                    </Button>
                    {categories.map((cat) => {
                      const count = linkedPartners.filter((p) => p.category_key === cat.category_key).length
                      return (
                        <Button
                          key={cat.id}
                          type="button"
                          variant={selectedCategoryFilter === cat.category_key ? "default" : "outline"}
                          size="sm"
                          className="h-8 text-xs shrink-0"
                          onClick={() => setSelectedCategoryFilter(cat.category_key)}
                        >
                          {cat.category_label} ({count})
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* Categories & Partners List */}
                <div className="space-y-6">
                  {categories
                    .filter(
                      (cat) => selectedCategoryFilter === "all" || selectedCategoryFilter === cat.category_key
                    )
                    .map((cat) => {
                      const categoryPartners = filteredPartners
                        .filter((p) => p.category_key === cat.category_key)
                        .sort((a, b) => a.partner_display_order - b.partner_display_order)

                      const totalInCat = linkedPartners.filter((p) => p.category_key === cat.category_key).length

                      return (
                        <Card key={cat.id} className="border-border/70 overflow-hidden shadow-xs">
                          {/* Category Header */}
                          <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <h3 className="font-semibold text-sm text-foreground">{cat.category_label}</h3>
                              <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
                                {totalInCat} {totalInCat === 1 ? "partner" : "partners"}
                              </Badge>
                              <span className="hidden sm:inline-block font-mono text-[11px] text-muted-foreground/80">
                                {cat.category_key}
                              </span>
                            </div>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs font-medium"
                              onClick={() => handleOpenAddModal(cat.category_key)}
                            >
                              <Plus className="mr-1 h-3.5 w-3.5" />
                              Add to Category
                            </Button>
                          </div>

                          {/* Category Content: Partner Cards */}
                          <CardContent className="p-4">
                            {categoryPartners.length === 0 ? (
                              <div className="rounded-lg border border-dashed border-border/70 p-6 text-center">
                                <Building2 className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                                <p className="text-xs font-medium text-foreground">
                                  No partners in this category {searchQuery && "matching your search"}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">
                                  {searchQuery
                                    ? "Try adjusting your search query."
                                    : "Add partners to display them under this section."}
                                </p>
                                {!searchQuery && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={() => handleOpenAddModal(cat.category_key)}
                                  >
                                    <Plus className="mr-1 h-3.5 w-3.5" />
                                    Add Partner
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-2.5">
                                {categoryPartners.map((partner, index) => (
                                  <div
                                    key={partner.id}
                                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border transition-all ${
                                      partner.is_visible
                                        ? "bg-card border-border/80 hover:border-border shadow-2xs"
                                        : "bg-muted/50 border-dashed border-border/90 dark:bg-muted/20 opacity-85 hover:opacity-100"
                                    }`}
                                  >
                                    {/* Left: Index + Logo + Info */}
                                    <div className="flex items-center gap-3.5 min-w-0">
                                      {/* Order Indicator */}
                                      <div
                                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold ${
                                          partner.is_visible
                                            ? "bg-muted text-muted-foreground"
                                            : "bg-muted/80 text-muted-foreground/60"
                                        }`}
                                      >
                                        #{index + 1}
                                      </div>

                                      {/* Logo Thumbnail Container (High Contrast Safe) */}
                                      <div
                                        className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border p-1.5 shadow-2xs overflow-hidden transition-all ${
                                          partner.is_visible
                                            ? "border-border/80 bg-neutral-100/90 dark:bg-neutral-800/90"
                                            : "border-border/60 bg-neutral-200/50 dark:bg-neutral-800/50"
                                        }`}
                                      >
                                        {partner.partner_logo ? (
                                          <img
                                            src={partner.partner_logo}
                                            alt={partner.partner_name}
                                            className={`h-full w-full object-contain transition-all ${
                                              !partner.is_visible ? "opacity-50 grayscale" : ""
                                            }`}
                                            loading="lazy"
                                          />
                                        ) : (
                                          <Building2
                                            className={`h-6 w-6 ${
                                              partner.is_visible
                                                ? "text-muted-foreground/60"
                                                : "text-muted-foreground/40"
                                            }`}
                                          />
                                        )}
                                      </div>

                                      {/* Name & Website & Status */}
                                      <div className="min-w-0 space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span
                                            className={`font-semibold text-sm truncate ${
                                              partner.is_visible
                                                ? "text-foreground"
                                                : "text-muted-foreground line-through decoration-muted-foreground/40"
                                            }`}
                                          >
                                            {partner.partner_name}
                                          </span>

                                          {/* Visibility Status Badge */}
                                          {partner.is_visible ? (
                                            <Badge
                                              variant="secondary"
                                              className="text-[10px] px-1.5 py-0 h-4 font-normal text-muted-foreground"
                                            >
                                              Live
                                            </Badge>
                                          ) : (
                                            <Badge
                                              variant="outline"
                                              className="text-[10px] px-1.5 py-0 h-4 border-neutral-300 bg-neutral-200/70 dark:bg-neutral-800 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 font-medium flex items-center gap-1"
                                            >
                                              <EyeOff className="h-2.5 w-2.5" />
                                              Hidden
                                            </Badge>
                                          )}
                                        </div>

                                        {!partner.is_visible ? (
                                          <p className="text-[11px] text-muted-foreground/75 italic">
                                            Hidden from public summit page • Click &quot;Unhide&quot; to restore
                                          </p>
                                        ) : partner.partner_website ? (
                                          <a
                                            href={partner.partner_website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline truncate max-w-xs sm:max-w-sm"
                                          >
                                            <Globe className="h-3 w-3 shrink-0" />
                                            <span className="truncate">{partner.partner_website}</span>
                                            <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                                          </a>
                                        ) : (
                                          <span className="text-xs text-muted-foreground italic">No website link</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Right: Actions (Reorder, Visibility, Edit, Delete) */}
                                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                      {/* Reorder Up / Down */}
                                      <div className="flex items-center rounded-md border border-border/80 bg-background">
                                        <Button
                                          type="button"
                                          size="icon"
                                          variant="ghost"
                                          className="h-8 w-8 rounded-none rounded-l-md hover:bg-muted"
                                          onClick={() => handleMovePartner(cat.category_key, index, "up")}
                                          disabled={index === 0}
                                          title="Move up"
                                        >
                                          <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <div className="h-4 w-px bg-border/80" />
                                        <Button
                                          type="button"
                                          size="icon"
                                          variant="ghost"
                                          className="h-8 w-8 rounded-none rounded-r-md hover:bg-muted"
                                          onClick={() => handleMovePartner(cat.category_key, index, "down")}
                                          disabled={index === categoryPartners.length - 1}
                                          title="Move down"
                                        >
                                          <ChevronDown className="h-4 w-4" />
                                        </Button>
                                      </div>

                                      {/* Toggle Visibility (Unhide / Hide) */}
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className={`h-8 px-2.5 text-xs font-medium transition-all ${
                                          !partner.is_visible
                                            ? "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/60"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                        }`}
                                        onClick={() => handleToggleVisibility(partner)}
                                        disabled={actionLoading === partner.id}
                                        title={
                                          partner.is_visible
                                            ? "Click to hide from public event page"
                                            : "Click to unhide (make visible on public event page)"
                                        }
                                      >
                                        {actionLoading === partner.id ? (
                                          <>
                                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin text-muted-foreground" />
                                            <span>{partner.is_visible ? "Hiding..." : "Unhiding..."}</span>
                                          </>
                                        ) : partner.is_visible ? (
                                          <>
                                            <EyeOff className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                            <span>Hide</span>
                                          </>
                                        ) : (
                                          <>
                                            <Eye className="mr-1.5 h-3.5 w-3.5 text-primary" />
                                            <span>Unhide</span>
                                          </>
                                        )}
                                      </Button>

                                      {/* Edit Partner */}
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="h-8 px-2.5 text-xs font-medium"
                                        onClick={() => handleOpenEditModal(partner)}
                                      >
                                        <Pencil className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                                        Edit
                                      </Button>

                                      {/* Delete Partner */}
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() =>
                                          setDeleteTarget({
                                            type: "partner",
                                            id: partner.id,
                                            name: partner.partner_name,
                                          })
                                        }
                                        title="Remove partner from event"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                </div>
              </>
            )}
          </div>
        )}

        {/* View 2: Category Settings */}
        {view === "categories" && (
          <div className="space-y-6">
            <Card className="border-border/70 shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-semibold">Event Partner Categories</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Define the sections and order in which partner logos appear on the event page.
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleCopyDefaults}
                    disabled={actionLoading === "copy-defaults"}
                    className="h-8 text-xs font-medium"
                  >
                    {actionLoading === "copy-defaults" ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Reset to Summit Defaults
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {categories.length === 0 ? (
                  <div className="p-8 text-center rounded-lg border border-dashed border-border/80">
                    <p className="text-sm font-medium">No categories configured yet.</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">
                      Copy the default 5-category structure to get started immediately.
                    </p>
                    <Button size="sm" onClick={handleCopyDefaults} disabled={actionLoading === "copy-defaults"}>
                      <Copy className="mr-1.5 h-4 w-4" />
                      Copy Default Categories
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories.map((cat, index) => {
                      const count = linkedPartners.filter((p) => p.category_key === cat.category_key).length
                      const isEditing = editingCategoryId === cat.id

                      return (
                        <div
                          key={cat.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border/80 bg-card"
                        >
                          {isEditing ? (
                            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <Input
                                value={categoryForm.label}
                                onChange={(e) => setCategoryForm({ ...categoryForm, label: e.target.value })}
                                placeholder="Category label (e.g. Knowledge Partners)"
                                className="h-8 text-xs flex-1"
                                autoFocus
                              />
                              <div className="flex items-center gap-1.5">
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-8 text-xs"
                                  onClick={() => handleUpdateCategory(cat.id)}
                                  disabled={actionLoading === `update-cat-${cat.id}`}
                                >
                                  {actionLoading === `update-cat-${cat.id}` ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    "Save"
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs"
                                  onClick={() => {
                                    setEditingCategoryId(null)
                                    setCategoryForm({ key: "", label: "" })
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-3">
                                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-[11px] font-semibold text-muted-foreground">
                                  #{index + 1}
                                </div>
                                <div>
                                  <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                                    {cat.category_label}
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                      {count} {count === 1 ? "partner" : "partners"}
                                    </Badge>
                                  </div>
                                  <div className="text-[11px] font-mono text-muted-foreground">
                                    Key: {cat.category_key}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 self-end sm:self-center">
                                <div className="flex items-center rounded-md border border-border/80 bg-background">
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 rounded-none rounded-l-md"
                                    onClick={() => handleMoveCategory(index, "up")}
                                    disabled={index === 0}
                                    title="Move up"
                                  >
                                    <ChevronUp className="h-3.5 w-3.5" />
                                  </Button>
                                  <div className="h-3.5 w-px bg-border/80" />
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 rounded-none rounded-r-md"
                                    onClick={() => handleMoveCategory(index, "down")}
                                    disabled={index === categories.length - 1}
                                    title="Move down"
                                  >
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  </Button>
                                </div>

                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs font-medium"
                                  onClick={() => {
                                    setEditingCategoryId(cat.id)
                                    setCategoryForm({ key: cat.category_key, label: cat.category_label })
                                  }}
                                >
                                  Rename
                                </Button>

                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: "category",
                                      id: cat.id,
                                      name: cat.category_label,
                                    })
                                  }
                                  title="Delete category"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Create Custom Category Card */}
            <Card className="border-dashed border-border/80 shadow-xs">
              <CardContent className="p-4 space-y-3">
                <div className="font-semibold text-sm">Add New Custom Category</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Category Display Label *</Label>
                    <Input
                      value={categoryForm.label}
                      onChange={(e) => {
                        const val = e.target.value
                        setCategoryForm({
                          label: val,
                          key: categoryForm.key || val.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
                        })
                      }}
                      placeholder="e.g. Media Partners"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Identifier Key (lowercase, underscores) *</Label>
                    <Input
                      value={categoryForm.key}
                      onChange={(e) => setCategoryForm({ ...categoryForm, key: e.target.value })}
                      placeholder="e.g. media_partners"
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateCategory}
                  disabled={actionLoading === "create-category"}
                  className="font-medium"
                >
                  {actionLoading === "create-category" ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Create Category
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* Unified Add / Edit Partner Modal */}
      {/* ============================================================ */}
      <Dialog
        open={partnerModal.isOpen}
        onOpenChange={(open) => setPartnerModal((prev) => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {partnerModal.mode === "add" ? "Add Event Partner" : `Edit Partner: ${partnerModal.name}`}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {partnerModal.mode === "add"
                ? "Add a new partner logo and website link to display on this event's public page."
                : "Update partner details, logo image, or move to another category."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Partner Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Partner Name *</Label>
              <Input
                value={partnerModal.name}
                onChange={(e) => setPartnerModal((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. KU School of Education, GIZ, Social Artist Nepal"
                className="h-9 text-xs"
                autoFocus
              />
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Category *</Label>
              <Select
                value={partnerModal.category_key}
                onValueChange={(val) => setPartnerModal((prev) => ({ ...prev, category_key: val }))}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Choose category..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.category_key} className="text-xs">
                      {cat.category_label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Website URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Website URL (optional)</Label>
                {partnerModal.website && (
                  <a
                    href={
                      /^https?:\/\//i.test(partnerModal.website)
                        ? partnerModal.website
                        : `https://${partnerModal.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                  >
                    Test link <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
              </div>
              <Input
                type="url"
                value={partnerModal.website}
                onChange={(e) => setPartnerModal((prev) => ({ ...prev, website: e.target.value }))}
                placeholder="https://example.org"
                className="h-9 text-xs"
              />
            </div>

            {/* Logo Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Partner Logo</Label>
                <div className="flex rounded-md border border-border/80 p-0.5 bg-muted/30">
                  <button
                    type="button"
                    onClick={() => setPartnerModal((prev) => ({ ...prev, uploadMethod: "upload" }))}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      partnerModal.uploadMethod === "upload"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setPartnerModal((prev) => ({ ...prev, uploadMethod: "url" }))}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      partnerModal.uploadMethod === "url"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              {partnerModal.uploadMethod === "upload" ? (
                <div className="space-y-2">
                  {/* Drag-and-drop Dropzone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDraggingLogo(true)
                    }}
                    onDragLeave={() => setIsDraggingLogo(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setIsDraggingLogo(false)
                      const file = e.dataTransfer.files?.[0]
                      if (file) handleLogoUpload(file)
                    }}
                    onClick={() => logoFileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      isDraggingLogo
                        ? "border-primary bg-primary/5"
                        : "border-border/80 hover:border-primary/50 hover:bg-muted/20"
                    }`}
                  >
                    <input
                      ref={logoFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleLogoUpload(file)
                      }}
                      disabled={isUploadingLogo}
                    />

                    {isUploadingLogo ? (
                      <div className="flex flex-col items-center gap-1.5 py-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs font-medium">Uploading logo to cloud...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 py-1 text-center">
                        <Upload className="h-5 w-5 text-muted-foreground mb-0.5" />
                        <span className="text-xs font-medium">Click to browse or drag and drop</span>
                        <span className="text-[10px] text-muted-foreground">
                          SVG, PNG, JPG, or WebP up to 2MB (transparent PNG or SVG recommended)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Input
                    type="url"
                    value={partnerModal.logo}
                    onChange={(e) => setPartnerModal((prev) => ({ ...prev, logo: e.target.value }))}
                    placeholder="https://example.org/images/logo.png"
                    className="h-9 text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">Direct link to hosted SVG or PNG logo</p>
                </div>
              )}

              {/* Live Logo Preview Box */}
              {partnerModal.logo && (
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/80 bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-12 w-20 shrink-0 items-center justify-center rounded-md border border-border/80 bg-neutral-100/90 dark:bg-neutral-800/90 p-1 overflow-hidden">
                      <img
                        src={partnerModal.logo}
                        alt="Logo preview"
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          // Prevent infinite loop if broken
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Check className="h-3 w-3 text-primary" />
                        Logo Ready
                      </span>
                      <span className="text-[10px] text-muted-foreground block truncate max-w-[200px]">
                        {partnerModal.logo}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setPartnerModal((prev) => ({ ...prev, logo: "" }))}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-row justify-end items-center gap-3 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              className="h-9 px-4 text-xs font-medium"
              onClick={() => setPartnerModal((prev) => ({ ...prev, isOpen: false }))}
              disabled={actionLoading === "save-partner"}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-9 px-4 text-xs font-medium"
              onClick={handleSavePartner}
              disabled={actionLoading === "save-partner" || !partnerModal.name.trim() || isUploadingLogo}
            >
              {actionLoading === "save-partner" ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  <span>{partnerModal.mode === "add" ? "Adding..." : "Saving..."}</span>
                </>
              ) : (
                <span>{partnerModal.mode === "add" ? "Add Partner" : "Save Changes"}</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* Delete Confirmation Alert Dialog */}
      {/* ============================================================ */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              {deleteTarget?.type === "category" ? "Delete Category?" : "Remove Partner from Event?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              {deleteTarget?.type === "category"
                ? `Are you sure you want to delete the category "${deleteTarget?.name}"? All partners assigned to this category will also be unlinked from the event.`
                : `Are you sure you want to remove "${deleteTarget?.name}" from this event? The partner will no longer appear on the summit page.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row justify-end items-center gap-3 pt-3">
            <AlertDialogCancel
              className="h-9 px-4 text-xs font-medium"
              disabled={Boolean(actionLoading?.startsWith("delete-"))}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteTarget?.type === "category" ? handleDeleteCategory : handleRemovePartner}
              disabled={Boolean(actionLoading?.startsWith("delete-"))}
              className="h-9 px-4 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading?.startsWith("delete-") ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
