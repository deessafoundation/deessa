"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import type { RegisterButtonConfig } from "@/lib/support/settings"
import { Comic_Neue } from "next/font/google"
import {
  Heart,
  Menu,
  X,
  Home,
  Users,
  Briefcase,
  FileText,
  Calendar,
  Mail,
  ClipboardList,
  Headphones,
  LifeBuoy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import styles from "./navbar.module.css"

const comicNeue = Comic_Neue({ subsets: ["latin"], weight: ["400", "700"] })

interface NavbarProps {
  supportEnabled?: boolean
  registerConfig?: RegisterButtonConfig
}

const primaryNavLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/about", label: "Who We Are", icon: Users },
  { href: "/our-story", label: "Our Story", icon: FileText },
  { href: "/whatwedo", label: "What We Do", icon: Briefcase },
  // { href: "/impact", label: "Impact", icon: Award },
  { href: "/stories", label: "Stories", icon: FileText },
  { href: "/events", label: "Events", icon: Calendar },
] as const

const secondaryNavLinks = [
  // { href: "/impact", label: "Impact", icon: Award },
  { href: "/podcasts", label: "Podcasts", icon: Headphones },
  { href: "/support", label: "Support", icon: LifeBuoy },
  { href: "/contact", label: "Contact", icon: Mail },
] as const

const tabletQuickLinks = [
  { href: "/whatwedo", label: "What We Do", icon: Briefcase },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/stories", label: "Stories", icon: FileText },
  { href: "/contact", label: "Contact", icon: Mail },
  { href: "/support", label: "Support", icon: LifeBuoy },
] as const

function isNavLinkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(href + "/")
}

export function Navbar({ supportEnabled = true, registerConfig }: NavbarProps) {
  const registerHref = registerConfig?.enabled ? (registerConfig.href || "/conference/register") : "/events"
  const registerLabel = registerConfig?.label || "Register"
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hideNavbarLogo, setHideNavbarLogo] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const LOGO_ZONE_WIDTH = 220

  // Filter nav links based on support status
  const filteredSecondaryNavLinks = secondaryNavLinks.filter(link => 
    supportEnabled || link.href !== '/support'
  )
  
  const filteredTabletQuickLinks = tabletQuickLinks.filter(link => 
    supportEnabled || link.href !== '/support'
  )

  useEffect(() => {
    const handleLogoFlying = () => setHideNavbarLogo(true)
    const handleLogoLanded = () => setHideNavbarLogo(false)

    window.addEventListener("intro-logo-flying", handleLogoFlying)
    window.addEventListener("intro-logo-landed", handleLogoLanded)

    return () => {
      window.removeEventListener("intro-logo-flying", handleLogoFlying)
      window.removeEventListener("intro-logo-landed", handleLogoLanded)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = ""
      }
    }

    document.body.style.overflow = ""
    return undefined
  }, [mobileMenuOpen])

  const renderNavLink = (
    link: (typeof primaryNavLinks)[number] | (typeof secondaryNavLinks)[number],
    opts: { variant: "primary" | "secondary"; showDivider: boolean }
  ) => {
    const IconComponent = link.icon
    const active = isNavLinkActive(pathname, link.href)
    const isSecondary = opts.variant === "secondary"
    const isPrimary = opts.variant === "primary"

    return (
      <div key={link.href + link.label} className="flex items-center gap-0">
        {opts.showDivider && (
          <span
            className="hidden lg:flex w-px h-4 bg-slate-200 dark:bg-slate-600 mx-1 shrink-0"
            aria-hidden
          />
        )}
        <Link
          href={link.href}
          aria-current={active ? "page" : undefined}
          className={cn(
            comicNeue.className,
            isSecondary && styles.secondaryLink,
            "group relative flex items-center gap-1.5 rounded-lg transition-colors duration-200",
            isSecondary
              ? "px-2.5 py-2 text-sm font-medium lg:text-[14px]"
              : "px-3 py-2 text-[15px] font-medium",
            active
              ? "text-primary"
              : "text-slate-600 dark:text-slate-400 hover:text-[#3FABDE]"
          )}
        >
          <IconComponent className={cn(isSecondary ? "size-3.5" : "size-4", "shrink-0 opacity-80")} />
          <span>{link.label}</span>
          {isPrimary && (
            <span
              className={cn(
                "pointer-events-none absolute left-1/2 bottom-[-10px] -translate-x-1/2 transition-all duration-300",
                active ? "w-[70%] opacity-100" : "w-0 opacity-0 group-hover:w-[45%] group-hover:opacity-100"
              )}
            >
              <span className="absolute inset-0 h-[3px] rounded-full bg-gradient-to-r from-[#7ad8ff] via-[#3FABDE] to-[#2f95c8] shadow-[0_0_10px_rgba(63,171,222,0.55)]" />
              <span className="absolute inset-0 h-[6px] -translate-y-[1px] rounded-full bg-gradient-to-r from-transparent via-[#66d0ff]/80 to-transparent blur-[2px] animate-pulse" />
            </span>
          )}
        </Link>
      </div>
    )
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white shadow-sm"
          : "bg-white"
      )}
    >
      <div className="w-full px-0 pt-0">

        {/* Layered navbar shell */}
        <div className="relative w-full overflow-visible border-y border-slate-200/80 bg-white shadow-sm">
          {/* Layer 1 (top): Primary row */}
          <div className="relative z-20 bg-white">
            <div className="relative flex h-16 items-center gap-1 px-3 sm:px-4 lg:px-6">
            <Link
              href="/"
              className="group absolute left-[49%] flex shrink-0 -translate-x-1/2 items-center gap-3 lg:relative lg:left-auto lg:w-[220px] lg:translate-x-0 lg:ml-4"
            >
              <div
                className={cn(
                  "flex items-center gap-3 transition-all duration-300",
                  hideNavbarLogo ? "scale-90 opacity-0" : "scale-100 opacity-100"
                )}
              >
                <div data-navbar-logo className="relative shrink-0">
                  <div data-navbar-logo-target className="relative flex h-16 w-16 items-center justify-center p-1 sm:h-[72px] sm:w-[72px]">
                    <Image
                      src="/logo.png"
                      alt="deessa Foundation"
                      width={96}
                      height={96}
                      className="object-contain transition-transform duration-200 scale-[2] group-hover:scale-[2.2]"
                      style={{ width: 'auto', height: 'auto' }}
                      priority
                    />
                  </div>
                </div>
                <div className="hidden lg:flex" />
              </div>
            </Link>

            {/* Development Badge - Desktop: In gap between logo and nav */}
            {process.env.NEXT_PUBLIC_SITE_STATUS !== "live" && (
              <div className="absolute left-[176px] top-1/2 z-30 hidden -translate-y-1/2 lg:block">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 shadow-lg">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-amber-500" />
                  </span>
                  Beta
                </div>
              </div>
            )}

            {/* Development Badge - Mobile/Tablet: Top right corner */}
            {process.env.NEXT_PUBLIC_SITE_STATUS !== "live" && (
              <div className="absolute left-[50px] top-1/2 z-30 -translate-y-1/2 sm:left-4 lg:hidden">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-amber-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-700 shadow-lg">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-amber-500" />
                  </span>
                  Beta
                </div>
              </div>
            )}

            <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex lg:pl-1">
              <div className="flex flex-wrap items-center justify-center gap-x-0">
                {primaryNavLinks.map((link, i) =>
                  renderNavLink(link, { variant: "primary", showDivider: i > 0 })
                )}
              </div>
            </div>

              <div className="ml-auto flex shrink-0 items-center gap-1.5">
              <div className="hidden items-center gap-1.5 lg:flex">
                <Link
                  href={registerHref}
                  className={cn(comicNeue.className, "flex items-center gap-2 rounded-xl border border-primary/50 px-6 py-2.5 text-[15px] font-medium text-primary transition-colors duration-200 hover:bg-[#3FABDE]/20 hover:text-[#0B5F8A]")}
                >
                  <ClipboardList className="size-3.5" />
                  {registerLabel}
                </Link>

                <Button
                  asChild
                  className="h-11 rounded-xl bg-[#3FABDE] px-8 text-[15px] font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.03] hover:bg-[#2f9bca] hover:shadow-md"
                >
                  <Link href="/donate" className={cn(comicNeue.className, "flex items-center gap-1.5")}>
                    <Heart className="size-4 fill-current" />
                    Donate
                  </Link>
                </Button>
              </div>

              <button
                type="button"
                className={cn(
                  styles.mobileToggle,
                  "relative z-50 rounded-lg p-2 transition-colors duration-200 lg:hidden",
                  mobileMenuOpen
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                )}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
              </div>
            </div>

            {/* Transition: organic white cut-out curve */}
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-x-0 -bottom-10 h-10 transition-all duration-300",
                scrolled ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0",
                "max-lg:opacity-0 max-lg:-translate-y-1"
              )}
            >
              <svg className="h-full w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                {/* Straight under logo area, rises near logo edge, then stays straight */}
                <path
                  d={`M0,0 L0,86 L${LOGO_ZONE_WIDTH - 54},86 C${LOGO_ZONE_WIDTH - 26},86 ${LOGO_ZONE_WIDTH - 10},24 ${LOGO_ZONE_WIDTH + 30},24 L1440,24 L1440,0 Z`}
                  fill="white"
                />
              </svg>
            </div>
          </div>

          {/* Layer 1.5 (tablet): Quick links and key actions */}
          <div className="hidden border-t border-slate-200/80 bg-white px-4 py-2.5 md:block lg:hidden">
            <div className="flex items-center gap-2 overflow-x-auto">
              {filteredTabletQuickLinks.map((link) => {
                const IconComponent = link.icon
                const active = isNavLinkActive(pathname, link.href)
                return (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    className={cn(
                      comicNeue.className,
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors duration-200",
                      active
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-slate-200 bg-white text-slate-700 hover:border-[#3FABDE]/45 hover:bg-[#3FABDE]/10 hover:text-[#0B5F8A]"
                    )}
                  >
                    <IconComponent className="size-3.5" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}

              <Link
                href={registerHref}
                className={cn(comicNeue.className, "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/40 px-3 py-1.5 text-sm text-primary transition-colors hover:bg-[#3FABDE]/15 hover:text-[#0B5F8A]")}
              >
                <ClipboardList className="size-3.5" />
                <span>{registerLabel}</span>
              </Link>

              <Link
                href="/donate"
                className={cn(comicNeue.className, "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#3FABDE] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#2f9bca]")}
              >
                <Heart className="size-3.5 fill-current" />
                <span>Donate</span>
              </Link>
            </div>
          </div>

          {/* Layer 2 (middle): Sub-nav tucked under the curve */}
          <div
            className={cn(
              styles.secondaryRow,
              "relative z-10 hidden overflow-hidden bg-[#f1f7fe] px-4 pt-3 pb-2 transition-all duration-300 dark:bg-slate-900 lg:block",
              scrolled ? "max-h-0 translate-y-[-8px] py-0 pt-0 pb-0 opacity-0" : "max-h-24 translate-y-0 opacity-100"
            )}
          >
            <div className="flex flex-wrap items-center justify-center gap-x-0.5">
              {filteredSecondaryNavLinks.map((link, i) =>
                renderNavLink(link, { variant: "secondary", showDivider: i > 0 })
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Mobile/tablet drawer - Redesigned */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-opacity duration-300",
          mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!mobileMenuOpen}
        inert={!mobileMenuOpen}
      >
        {/* Dimmed dark overlay */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden
        />

        {/* Sidebar */}
        <div
          className={cn(
            "absolute right-0 top-0 h-full w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-out",
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <nav className="flex h-full flex-col">
            {/* Header with logo, BETA badge and close button */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              {process.env.NEXT_PUBLIC_SITE_STATUS !== "live" && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-amber-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-700">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-amber-500" />
                  </span>
                  Beta
                </div>
              )}
              
              {/* Logo in center - Simple with padding */}
              <div className="flex-1 flex items-center justify-center px-4">
                <div className="relative h-20 w-20">
                  <Image
                    src="/logo.png"
                    alt="deessa Foundation"
                    width={80}
                    height={80}
                    className="object-contain w-full h-full"
                    priority
                  />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="rounded-full p-1.5 text-slate-600 transition-colors hover:bg-slate-100"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Scrollable navigation content */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {/* Explore Section */}
              <div className="mb-6">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#111]">
                  Explore
                </h3>
                <div className="space-y-1">
                  {[
                    { href: "/", label: "Home", icon: Home },
                    { href: "/about", label: "Who We Are", icon: Users },
                    { href: "/our-story", label: "Our Story", icon: FileText },
                    { href: "/whatwedo", label: "What We Do", icon: Briefcase },
                  ].map((link) => {
                    const IconComponent = link.icon
                    const active = isNavLinkActive(pathname, link.href)
                    return (
                      <Link
                        key={link.href + link.label}
                        href={link.href}
                        className={cn(
                          comicNeue.className,
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                          active
                            ? "bg-[#eaf5fc] text-[#1a6f96] font-medium"
                            : "text-slate-700 hover:bg-slate-50"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span
                          className={cn(
                            "inline-flex size-[34px] shrink-0 items-center justify-center rounded-[9px] transition-colors",
                            active
                              ? "bg-[#2F9BCA] text-white"
                              : "bg-[#f2f4f6] text-[#7a9aaa]"
                          )}
                        >
                          <IconComponent className="size-4" strokeWidth={2} />
                        </span>
                        <span className="text-[15px]">{link.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Community Section */}
              <div className="mb-6">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#111]">
                  Community
                </h3>
                <div className="space-y-1">
                  {[
                    // { href: "/impact", label: "Impact", icon: Award },
                    { href: "/stories", label: "Stories", icon: FileText },
                    { href: "/events", label: "Events", icon: Calendar },
                    { href: "/podcasts", label: "Podcasts", icon: Headphones },
                  ].map((link) => {
                    const IconComponent = link.icon
                    const active = isNavLinkActive(pathname, link.href)
                    return (
                      <Link
                        key={link.href + link.label}
                        href={link.href}
                        className={cn(
                          comicNeue.className,
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                          active
                            ? "bg-[#eaf5fc] text-[#1a6f96] font-medium"
                            : "text-slate-700 hover:bg-slate-50"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span
                          className={cn(
                            "inline-flex size-[34px] shrink-0 items-center justify-center rounded-[9px] transition-colors",
                            active
                              ? "bg-[#2F9BCA] text-white"
                              : "bg-[#f2f4f6] text-[#7a9aaa]"
                          )}
                        >
                          <IconComponent className="size-4" strokeWidth={2} />
                        </span>
                        <span className="text-[15px]">{link.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Connect Section */}
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#111]">
                  Connect
                </h3>
                <div className="space-y-1">
                  {[
                    ...(supportEnabled ? [{ href: "/support", label: "Support", icon: LifeBuoy }] : []),
                    { href: "/contact", label: "Contact", icon: Mail },
                  ].map((link) => {
                    const IconComponent = link.icon
                    const active = isNavLinkActive(pathname, link.href)
                    return (
                      <Link
                        key={link.href + link.label}
                        href={link.href}
                        className={cn(
                          comicNeue.className,
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                          active
                            ? "bg-[#eaf5fc] text-[#1a6f96] font-medium"
                            : "text-slate-700 hover:bg-slate-50"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span
                          className={cn(
                            "inline-flex size-[34px] shrink-0 items-center justify-center rounded-[9px] transition-colors",
                            active
                              ? "bg-[#2F9BCA] text-white"
                              : "bg-[#f2f4f6] text-[#7a9aaa]"
                          )}
                        >
                          <IconComponent className="size-4" strokeWidth={2} />
                        </span>
                        <span className="text-[15px]">{link.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Sticky Footer with CTAs */}
            <div className="border-t border-slate-200 bg-white px-5 py-4">
              <div className="space-y-2.5">
                {/* Primary solid blue button */}
                {supportEnabled && (
                  <Link
                    href="/support"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(comicNeue.className, "flex items-center justify-center gap-2 rounded-xl bg-[#2F9BCA] px-4 py-3 text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-[#2889b5] active:scale-[0.98]")}
                  >
                    <LifeBuoy className="size-4" strokeWidth={2.5} />
                    Support us
                  </Link>
                )}

                {/* Outline blue border button */}
                <Link
                  href={registerHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(comicNeue.className, "flex items-center justify-center gap-2 rounded-xl border-2 border-[#2F9BCA] bg-white px-4 py-3 text-[15px] font-medium text-[#2F9BCA] transition-all hover:bg-[#f0f8fc] active:scale-[0.98]")}
                >
                  <ClipboardList className="size-4" strokeWidth={2.5} />
                  {registerLabel}
                </Link>

                {/* Soft ghost blue button */}
                <Link
                  href="/donate"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(comicNeue.className, "flex items-center justify-center gap-2 rounded-xl bg-[#e8f5fb] px-4 py-3 text-[15px] font-medium text-[#1a6f96] transition-all hover:bg-[#d9eef8] active:scale-[0.98]")}
                >
                  <Heart className="size-4 fill-current" strokeWidth={2.5} />
                  Donate
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
