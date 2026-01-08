import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { hasPermission } from "@/lib/types/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Home,
  Image,
  FileText,
  Calendar,
  Users,
  Building,
  BarChart3,
  Heart,
  FolderKanban,
  Newspaper,
  Settings as SettingsIcon,
  Podcast,
  ArrowRight,
  Sparkles,
  Layers3,
  WandSparkles,
  Palette,
  Gauge,
  ShieldCheck,
} from "lucide-react"

export const metadata = {
  title: "Content Management System - Admin",
  description: "Manage all your website content from one place",
}

export default async function CMSPage() {
  const adminUser = await getCurrentAdmin()

  if (!adminUser) {
    redirect("/admin/login")
  }

  // Define all CMS modules
  const cmsModules = [
    {
      title: "Homepage Manager",
      description: "Configure hero section, initiatives, CTA, and analytics",
      icon: Home,
      href: "/admin/homepage",
      permission: "settings",
      color: "bg-blue-500",
    },
    {
      title: "Media Library",
      description: "Manage images, videos, and documents across all buckets",
      icon: Image,
      href: "/admin/media",
      permission: "settings",
      color: "bg-purple-500",
    },
    {
      title: "Projects",
      description: "Create and manage your organization's projects",
      icon: FolderKanban,
      href: "/admin/projects",
      permission: "projects",
      color: "bg-green-500",
    },
    {
      title: "Events",
      description: "Schedule and manage upcoming events",
      icon: Calendar,
      href: "/admin/events",
      permission: "events",
      color: "bg-orange-500",
    },
    {
      title: "Stories",
      description: "Share success stories and impact reports",
      icon: FileText,
      href: "/admin/stories",
      permission: "stories",
      color: "bg-indigo-500",
    },
    {
      title: "Podcasts",
      description: "Manage podcast episodes, highlights, and videos",
      icon: Podcast,
      href: "/admin/podcasts",
      permission: "stories",
      color: "bg-rose-500",
    },
    {
      title: "Team Members",
      description: "Manage your team profiles and bios",
      icon: Users,
      href: "/admin/team",
      permission: "team",
      color: "bg-cyan-500",
    },
    {
      title: "Partners",
      description: "Showcase your partners and sponsors",
      icon: Building,
      href: "/admin/partners",
      permission: "partners",
      color: "bg-teal-500",
    },
    {
      title: "Impact Stats",
      description: "Display key metrics and achievements",
      icon: BarChart3,
      href: "/admin/stats",
      permission: "stats",
      color: "bg-pink-500",
    },
    {
      title: "Newsletter",
      description: "Manage newsletter subscribers and campaigns",
      icon: Newspaper,
      href: "/admin/newsletter",
      permission: "newsletters",
      color: "bg-amber-500",
    },
    {
      title: "Press & Media",
      description: "Coming soon - Manage press releases and media coverage",
      icon: Newspaper,
      href: "#",
      permission: "settings",
      color: "bg-gray-400",
      disabled: true,
    },
    {
      title: "Site Settings",
      description: "Configure global site settings and branding",
      icon: SettingsIcon,
      href: "/admin/settings",
      permission: "settings",
      color: "bg-slate-500",
    },
  ]

  // Filter modules based on permissions
  const accessibleModules = cmsModules.filter((module) =>
    hasPermission(adminUser.role, module.permission)
  )

  const moduleGroups = [
    {
      title: "Foundation",
      eyebrow: "Start here",
      description: "Core pages and global controls that shape the first impression of the site.",
      icon: Layers3,
      accent: "from-sky-500 via-cyan-500 to-teal-500",
      items: accessibleModules.filter((module) => ["Homepage Manager", "Site Settings", "Media Library"].includes(module.title)),
    },
    {
      title: "Publishing",
      eyebrow: "Create and publish",
      description: "The main editorial surface for programs, stories, events, and audio updates.",
      icon: WandSparkles,
      accent: "from-indigo-500 via-violet-500 to-fuchsia-500",
      items: accessibleModules.filter((module) => ["Projects", "Events", "Stories", "Podcasts"].includes(module.title)),
    },
    {
      title: "Community",
      eyebrow: "People and reach",
      description: "Relationship-driven sections for team, partners, and newsletter growth.",
      icon: Heart,
      accent: "from-rose-500 via-pink-500 to-orange-500",
      items: accessibleModules.filter((module) => ["Team Members", "Partners", "Newsletter"].includes(module.title)),
    },
    {
      title: "Governance",
      eyebrow: "System health",
      description: "Measurement, oversight, and the future-facing controls that keep the CMS clean.",
      icon: ShieldCheck,
      accent: "from-amber-500 via-yellow-500 to-lime-500",
      items: accessibleModules.filter((module) => ["Impact Stats", "Press & Media"].includes(module.title)),
    },
  ].filter((group) => group.items.length > 0)

  const featuredModules = accessibleModules.filter((module) =>
    ["Homepage Manager", "Media Library", "Projects", "Site Settings"].includes(module.title)
  )

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-slate-950 via-sky-950 to-cyan-900 p-6 text-white shadow-2xl md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.16),transparent_28%)]" />
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-100 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              CMS launchpad
            </div>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                A calmer, faster way to manage the full site.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-cyan-100/85 md:text-lg">
                The CMS is organized into a visual launchpad so you can jump into publishing,
                community, and governance work without digging through a flat list of links.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="h-11 rounded-full bg-white px-5 text-slate-950 hover:bg-cyan-50">
                <Link href="/admin">
                  Open dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-full border-white/20 bg-white/5 px-5 text-white hover:bg-white/10">
                <Link href="/">
                  View live site
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-cyan-100">
              <Gauge className="h-4 w-4" />
              At a glance
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Available modules</p>
                <div className="mt-2 text-3xl font-bold">{accessibleModules.length}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Your role</p>
                <div className="mt-2 text-2xl font-semibold capitalize">
                  {adminUser.role.replace("_", " ")}
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-2xl border border-cyan-300/15 bg-cyan-400/10 p-4 text-sm text-cyan-50">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4" />
                Designed for fewer clicks and clearer priorities.
              </div>
              <p className="mt-1 text-cyan-100/80">
                Use the highlighted sections below to get to the right area faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Workflows</CardTitle>
              <Palette className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="mt-1 text-sm text-muted-foreground">Grouped into visual sections instead of one flat list.</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Featured tools</CardTitle>
              <Gauge className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featuredModules.length}</div>
            <p className="mt-1 text-sm text-muted-foreground">The highest-frequency actions stay visually close.</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Focus mode</CardTitle>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ready</div>
            <p className="mt-1 text-sm text-muted-foreground">Hero, hierarchy, and modules now feel like one system.</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Quick access</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The most-used tools are surfaced first for a more direct workflow.
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground md:flex">
            <Layers3 className="h-3.5 w-3.5" />
            launchpad layout
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featuredModules.map((module, index) => (
            <Card
              key={module.title}
              className="group relative overflow-hidden border-border/60 bg-card/95 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-36px_rgba(2,132,199,0.45)]"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500" />
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className={`inline-flex rounded-2xl bg-gradient-to-br ${module.color} p-3 text-white shadow-lg transition-transform duration-300 group-hover:scale-105`}>
                    <module.icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                  <CardDescription className="leading-6">{module.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full rounded-full shadow-sm transition-transform duration-300 group-hover:translate-y-[-1px]">
                  <Link href={module.disabled ? "#" : module.href}>
                    {module.disabled ? "Coming soon" : "Open module"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        {moduleGroups.map((group, groupIndex) => {
          const GroupIcon = group.icon

          return (
            <Card key={group.title} className="overflow-hidden border-border/60 shadow-sm">
              <div className={`h-1 bg-gradient-to-r ${group.accent}`} />
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      <GroupIcon className="h-3.5 w-3.5 text-primary" />
                      {group.eyebrow}
                    </div>
                    <CardTitle className="text-2xl">{group.title}</CardTitle>
                    <CardDescription className="max-w-2xl leading-6">{group.description}</CardDescription>
                  </div>
                  <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground md:flex">
                    Section {groupIndex + 1}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((module) => (
                    <Link
                      key={module.title}
                      href={module.disabled ? "#" : module.href}
                      className={`group block rounded-2xl border border-border/60 bg-background p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg ${
                        module.disabled ? "cursor-not-allowed opacity-60" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className={`inline-flex rounded-2xl bg-gradient-to-br ${module.color} p-3 text-white shadow-sm transition-transform duration-300 group-hover:scale-105`}>
                          <module.icon className="h-5 w-5" />
                        </div>
                        {module.disabled ? (
                          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Soon
                          </span>
                        ) : (
                          <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                        )}
                      </div>

                      <div className="mt-4 space-y-2">
                        <h3 className="text-lg font-semibold tracking-tight">{module.title}</h3>
                        <p className="text-sm leading-6 text-muted-foreground">{module.description}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-primary">
                          {module.disabled ? "Coming soon" : "Open module"}
                        </span>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          CMS
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-muted/60 via-background to-muted/30 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl">Need help moving faster?</CardTitle>
              <CardDescription className="mt-2 max-w-2xl leading-6">
                The CMS works best when the section pages are used as launch points. Keep the sidebar
                for orientation and use the cards above to jump directly into the task.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin">Dashboard</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/settings">Settings</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
