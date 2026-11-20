"use client"

import { useState, useMemo, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  RotateCw,
  Home,
  Copy,
  Table as TableIcon,
  LayoutGrid,
  Sparkles,
  Layers,
  ArrowUpDown,
  Eye,
  EyeOff,
  Target,
  SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  toggleStatPublishedAction,
  deleteImpactStat,
  seedDefaultStatsAction,
} from "@/lib/actions/admin-stats"
import { StatModal } from "./stat-modal"
import { getColorTokens, getStatIcon } from "./stat-config"
import type { ImpactStat } from "@/lib/types/admin"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import styles from "./stats.module.css"

export type StatCategoryScope = "all" | "home" | "impact"
type StatusFilter = "all" | "published" | "hidden"
type SortOption = "order-asc" | "label-asc" | "label-desc" | "value-desc" | "newest"

interface StatsListClientProps {
  initialStats: ImpactStat[]
}

export function StatsListClient({ initialStats }: StatsListClientProps) {
  const router = useRouter()
  const [stats, setStats] = useState<ImpactStat[]>(initialStats)
  const [prevInitial, setPrevInitial] = useState(initialStats)
  const [isPending, startTransition] = useTransition()

  // Sync state if server props change
  if (initialStats !== prevInitial) {
    setPrevInitial(initialStats)
    setStats(initialStats)
  }

  // Filters & State
  const [selectedScope, setSelectedScope] = useState<StatCategoryScope>("all")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortBy, setSortBy] = useState<SortOption>("order-asc")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")

  // Modal & Dialog States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statToEdit, setStatToEdit] = useState<ImpactStat | null>(null)
  const [statToDelete, setStatToDelete] = useState<ImpactStat | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)

  // Optimistic toggles
  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({})

  // Handlers for Add / Edit
  function handleOpenCreate() {
    setStatToEdit(null)
    setIsModalOpen(true)
  }

  function handleOpenEdit(stat: ImpactStat) {
    setStatToEdit(stat)
    setIsModalOpen(true)
  }

  function handleDuplicate(stat: ImpactStat) {
    const duplicated: ImpactStat = {
      ...stat,
      id: "",
      label: `${stat.label} (Copy)`,
    }
    setStatToEdit(duplicated)
    setIsModalOpen(true)
  }

  function handleModalSuccess(savedStat: ImpactStat) {
    setStats((prev) => {
      const exists = prev.some((s) => s.id === savedStat.id)
      if (exists) {
        return prev.map((s) => (s.id === savedStat.id ? savedStat : s))
      }
      return [...prev, savedStat]
    })
    startTransition(() => {
      router.refresh()
    })
  }

  // Handle direct publish toggle
  async function handleTogglePublished(stat: ImpactStat, checked: boolean) {
    const statId = stat.id
    setTogglingIds((prev) => ({ ...prev, [statId]: true }))

    // Optimistic update
    setStats((prev) =>
      prev.map((s) => (s.id === statId ? { ...s, is_published: checked } : s))
    )

    try {
      const res = await toggleStatPublishedAction(statId, checked)
      if (!res.success) {
        // Rollback
        setStats((prev) =>
          prev.map((s) => (s.id === statId ? { ...s, is_published: !checked } : s))
        )
        notifications.showError({
          title: "Update Failed",
          description: res.error || "Failed to update status.",
        })
      } else {
        notifications.showSuccess(
          checked
            ? `"${stat.label}" is now live on public website.`
            : `"${stat.label}" is now hidden from public view.`
        )
      }
    } catch {
      // Rollback
      setStats((prev) =>
        prev.map((s) => (s.id === statId ? { ...s, is_published: !checked } : s))
      )
      notifications.showError({
        title: "Network Error",
        description: "Could not update statistic visibility.",
      })
    } finally {
      setTogglingIds((prev) => ({ ...prev, [statId]: false }))
    }
  }

  // Handle Delete
  async function handleDeleteConfirm() {
    if (!statToDelete) return
    setIsDeleting(true)

    try {
      const res = await deleteImpactStat(statToDelete.id)
      if (res.error) {
        notifications.showError({
          title: "Delete Failed",
          description: res.error,
        })
      } else {
        notifications.showSuccess(`Deleted statistic "${statToDelete.label}"`)
        setStats((prev) => prev.filter((s) => s.id !== statToDelete.id))
        setStatToDelete(null)
        startTransition(() => {
          router.refresh()
        })
      }
    } catch {
      notifications.showError({
        title: "Error",
        description: "An unexpected error occurred while deleting.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle Seed Defaults
  async function handleSeedDefaults() {
    setIsSeeding(true)
    try {
      const res = await seedDefaultStatsAction()
      if (!res.success) {
        notifications.showError({
          title: "Seeding Failed",
          description: res.error || "Failed to populate default statistics.",
        })
      } else {
        notifications.showSuccess(`Successfully populated ${res.count ?? 8} default statistics!`)
        startTransition(() => {
          router.refresh()
        })
      }
    } catch {
      notifications.showError({
        title: "Error",
        description: "An unexpected error occurred while seeding.",
      })
    } finally {
      setIsSeeding(false)
    }
  }

  // Compute KPI metrics
  const kpis = useMemo(() => {
    const total = stats.length
    const published = stats.filter((s) => s.is_published).length
    const homepage = stats.filter((s) => s.category === "home").length
    const impactPage = stats.filter((s) => s.category === "impact").length
    const withProgress = stats.filter((s) => s.progress !== null && s.progress !== undefined).length
    const publishedPercent = total > 0 ? Math.round((published / total) * 100) : 0

    return {
      total,
      published,
      publishedPercent,
      homepage,
      impactPage,
      withProgress,
    }
  }, [stats])

  // Scope counts for tabs
  const scopeCounts = useMemo(() => {
    return {
      all: stats.length,
      home: stats.filter((s) => s.category === "home").length,
      impact: stats.filter((s) => s.category === "impact").length,
    }
  }, [stats])

  // Filtered and Sorted list
  const filteredStats = useMemo(() => {
    let result = [...stats]

    // 1. Scope filter
    if (selectedScope !== "all") {
      result = result.filter((s) => s.category === selectedScope)
    }

    // 2. Status filter
    if (statusFilter === "published") {
      result = result.filter((s) => s.is_published)
    } else if (statusFilter === "hidden") {
      result = result.filter((s) => !s.is_published)
    }

    // 3. Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(
        (s) =>
          s.label.toLowerCase().includes(q) ||
          s.value.toLowerCase().includes(q) ||
          (s.icon && s.icon.toLowerCase().includes(q))
      )
    }

    // 4. Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "order-asc":
          return (a.sort_order ?? 0) - (b.sort_order ?? 0)
        case "label-asc":
          return a.label.localeCompare(b.label)
        case "label-desc":
          return b.label.localeCompare(a.label)
        case "value-desc": {
          const numA = parseFloat(a.value.replace(/[^0-9.-]+/g, "")) || 0
          const numB = parseFloat(b.value.replace(/[^0-9.-]+/g, "")) || 0
          return numB - numA
        }
        case "newest":
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        default:
          return 0
      }
    })

    return result
  }, [stats, selectedScope, statusFilter, search, sortBy])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Impact Statistics</h1>
            <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5">
              {stats.length} metrics
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage figures, key metrics, and progress milestones shown across the homepage and impact page.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {stats.length === 0 && (
            <Button
              variant="outline"
              onClick={handleSeedDefaults}
              disabled={isSeeding}
              className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
            >
              <RotateCw className={cn("size-4", isSeeding && "animate-spin")} />
              {isSeeding ? "Seeding..." : "Seed Default Statistics"}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0" title="More options">
                <SlidersHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleSeedDefaults} disabled={isSeeding}>
                <Sparkles className="size-4 mr-2 text-primary" />
                <span>Seed 8 Default Statistics</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  startTransition(() => router.refresh())
                  notifications.showSuccess("Refreshed statistics data")
                }}
              >
                <RotateCw className={cn("size-4 mr-2", isPending && "animate-spin")} />
                <span>Refresh Data</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={handleOpenCreate}
            className="gap-2 shadow-xs font-semibold"
          >
            <Plus className="size-4" />
            Add Statistic
          </Button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Metrics
              </span>
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <BarChart3 className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight">{kpis.total}</span>
              <span className="text-xs text-muted-foreground">across site</span>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Live to Public
              </span>
              <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Eye className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {kpis.published}
              </span>
              <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600">
                {kpis.publishedPercent}% visible
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Homepage Featured
              </span>
              <div className="size-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <Home className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight">{kpis.homepage}</span>
              <span className="text-xs text-muted-foreground">in hero rail</span>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Goal Milestones
              </span>
              <div className="size-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
                <Target className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight">{kpis.withProgress}</span>
              <span className="text-xs text-muted-foreground">progress tracked</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scope Switcher Rail with Ocean Blue Shimmer */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-muted/40 border border-border/70">
        <button
          type="button"
          onClick={() => setSelectedScope("all")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all",
            selectedScope === "all"
              ? cn(
                  styles.oceanShimmerTab,
                  "bg-primary text-primary-foreground shadow-xs"
                )
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          )}
        >
          <Layers className="size-4 shrink-0" />
          <span>All Statistics</span>
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full",
              selectedScope === "all" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
            )}
          >
            {scopeCounts.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedScope("home")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all",
            selectedScope === "home"
              ? cn(
                  styles.oceanShimmerTab,
                  "bg-primary text-primary-foreground shadow-xs"
                )
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          )}
        >
          <Home className="size-4 shrink-0" />
          <span>Homepage Hero</span>
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full",
              selectedScope === "home" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
            )}
          >
            {scopeCounts.home}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedScope("impact")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all",
            selectedScope === "impact"
              ? cn(
                  styles.oceanShimmerTab,
                  "bg-primary text-primary-foreground shadow-xs"
                )
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          )}
        >
          <BarChart3 className="size-4 shrink-0" />
          <span>Impact Page</span>
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full",
              selectedScope === "impact" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
            )}
          >
            {scopeCounts.impact}
          </span>
        </button>
      </div>

      {/* Filter and View Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-card p-3 rounded-xl border border-border/70 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by label, value, or icon..."
            className="pl-9 pr-8 h-9 text-xs sm:text-sm bg-muted/30"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Right Controls: Status, Sort, View */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as StatusFilter)}
          >
            <SelectTrigger className="h-9 text-xs w-[130px] bg-muted/30">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published Only</SelectItem>
              <SelectItem value="hidden">Hidden Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select
            value={sortBy}
            onValueChange={(val) => setSortBy(val as SortOption)}
          >
            <SelectTrigger className="h-9 text-xs w-[150px] bg-muted/30">
              <ArrowUpDown className="size-3 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="order-asc">Order (1 to N)</SelectItem>
              <SelectItem value="value-desc">Value (High to Low)</SelectItem>
              <SelectItem value="label-asc">Label (A - Z)</SelectItem>
              <SelectItem value="label-desc">Label (Z - A)</SelectItem>
              <SelectItem value="newest">Recently Updated</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex items-center border border-border/70 rounded-lg p-0.5 bg-muted/30">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="Table View"
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === "table"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <TableIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Bento Grid View"
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Table or Grid */}
      {filteredStats.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <BarChart3 className="size-7" />
            </div>
            <h3 className="text-lg font-bold">No Statistics Found</h3>
            <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
              {search || statusFilter !== "all" || selectedScope !== "all"
                ? "No statistics match your current search filters. Try clearing filters or searching for something else."
                : "You haven't configured any impact statistics yet. Populate default statistics to get started with 8 realistic metrics immediately."}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {stats.length === 0 && (
                <Button
                  onClick={handleSeedDefaults}
                  disabled={isSeeding}
                  variant="outline"
                  className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
                >
                  <RotateCw className={cn("size-4", isSeeding && "animate-spin")} />
                  {isSeeding ? "Seeding..." : "Seed Default Statistics"}
                </Button>
              )}
              <Button onClick={handleOpenCreate} className="gap-2">
                <Plus className="size-4" />
                Add Statistic
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        <Card className="border-border/70 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[60px] text-center">#</TableHead>
                  <TableHead className="w-[80px]">Icon</TableHead>
                  <TableHead>Metric & Description</TableHead>
                  <TableHead className="w-[160px]">Placement Scope</TableHead>
                  <TableHead className="w-[170px]">Goal Progress</TableHead>
                  <TableHead className="w-[130px]">Status</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStats.map((stat, idx) => {
                  const IconComp = getStatIcon(stat.icon)
                  const colorTokens = getColorTokens(stat.color)
                  const isToggling = togglingIds[stat.id]

                  return (
                    <TableRow
                      key={stat.id}
                      onClick={() => handleOpenEdit(stat)}
                      className="cursor-pointer hover:bg-muted/30 transition-colors group"
                    >
                      {/* S.No */}
                      <TableCell className="text-center font-mono text-xs text-muted-foreground">
                        {stat.sort_order || idx + 1}
                      </TableCell>

                      {/* Icon */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div
                          className={cn(styles.iconCanvas, "size-10 border")}
                          style={{
                            backgroundColor: colorTokens.bgTint,
                            borderColor: colorTokens.borderTint,
                          }}
                        >
                          <IconComp
                            className="size-5"
                            style={{ color: stat.color || "#3FABDE" }}
                          />
                        </div>
                      </TableCell>

                      {/* Metric Value & Label */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span
                            className="text-lg font-bold tracking-tight tabular-nums"
                            style={{ color: stat.color || undefined }}
                          >
                            {stat.value}
                          </span>
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {stat.label}
                          </span>
                        </div>
                      </TableCell>

                      {/* Scope Badge */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[11px] font-medium gap-1",
                            stat.category === "home" ? styles.badgeHome : styles.badgeImpact
                          )}
                        >
                          {stat.category === "home" ? (
                            <>
                              <Home className="size-3" /> Homepage
                            </>
                          ) : (
                            <>
                              <BarChart3 className="size-3" /> Impact Page
                            </>
                          )}
                        </Badge>
                      </TableCell>

                      {/* Progress Milestone */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {stat.progress !== null && stat.progress !== undefined ? (
                          <div className="flex items-center gap-2.5">
                            <Progress value={stat.progress} className="h-2 w-24" />
                            <span className="text-xs font-semibold tabular-nums">
                              {stat.progress}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">None</span>
                        )}
                      </TableCell>

                      {/* Status Toggle */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={stat.is_published}
                            disabled={isToggling}
                            onCheckedChange={(checked) => handleTogglePublished(stat, checked)}
                            className="scale-90"
                          />
                          <span className="text-xs font-medium">
                            {stat.is_published ? (
                              <span className="text-emerald-600 dark:text-emerald-400">Live</span>
                            ) : (
                              <span className="text-muted-foreground">Hidden</span>
                            )}
                          </span>
                        </div>
                      </TableCell>

                      {/* Action buttons */}
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => handleOpenEdit(stat)}
                            title="Edit statistic"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => handleDuplicate(stat)}
                            title="Duplicate statistic"
                          >
                            <Copy className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setStatToDelete(stat)}
                            title="Delete statistic"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        /* Bento Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStats.map((stat) => {
            const IconComp = getStatIcon(stat.icon)
            const colorTokens = getColorTokens(stat.color)
            const isToggling = togglingIds[stat.id]

            return (
              <div
                key={stat.id}
                onClick={() => handleOpenEdit(stat)}
                className={cn(
                  styles.statBentoCard,
                  "group relative p-5 rounded-2xl border border-border/70 bg-card cursor-pointer flex flex-col justify-between"
                )}
              >
                {/* Top: Icon + Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(styles.iconCanvas, "size-12 border")}
                    style={{
                      backgroundColor: colorTokens.bgTint,
                      borderColor: colorTokens.borderTint,
                    }}
                  >
                    <IconComp
                      className="size-6 transition-transform group-hover:scale-110"
                      style={{ color: stat.color || "#3FABDE" }}
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-medium gap-1",
                        stat.category === "home" ? styles.badgeHome : styles.badgeImpact
                      )}
                    >
                      {stat.category === "home" ? "Home" : "Impact"}
                    </Badge>

                    <div onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={stat.is_published}
                        disabled={isToggling}
                        onCheckedChange={(checked) => handleTogglePublished(stat, checked)}
                        className="scale-75"
                        title={stat.is_published ? "Published (Live)" : "Hidden (Draft)"}
                      />
                    </div>
                  </div>
                </div>

                {/* Middle: Metric Value & Label */}
                <div className="my-4">
                  <div
                    className="text-3xl font-extrabold tracking-tight tabular-nums"
                    style={{ color: stat.color || undefined }}
                  >
                    {stat.value}
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mt-1 line-clamp-2">
                    {stat.label}
                  </h4>
                </div>

                {/* Bottom: Progress or Actions */}
                <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                  {stat.progress !== null && stat.progress !== undefined ? (
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
                        <span>Goal Progress</span>
                        <span className="font-semibold text-foreground">{stat.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${stat.progress}%`,
                            backgroundColor: stat.color || "#3FABDE",
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">Order #{stat.sort_order}</span>
                  )}

                  <div
                    className="flex items-center gap-0.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => handleOpenEdit(stat)}
                      title="Edit"
                    >
                      <Pencil className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => handleDuplicate(stat)}
                      title="Duplicate"
                    >
                      <Copy className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setStatToDelete(stat)}
                      title="Delete"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Stat Modal */}
      <StatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        statToEdit={statToEdit}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!statToDelete} onOpenChange={(open) => !open && setStatToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Statistic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete &quot;{statToDelete?.label}&quot;?
              This statistic will immediately be removed from the public website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Statistic"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
