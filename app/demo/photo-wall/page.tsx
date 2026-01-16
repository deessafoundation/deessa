"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, ImageIcon, Layers3, MoveRight, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import PhotoWall from "@/components/photo-wall/photo-wall"

const defaultCollagePanels = [
  {
    src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
    alt: "Volunteer in a bright safety vest standing outdoors",
    label: "Field presence",
    title: "Arrival",
    caption: "Outer edge on the left with the lowest height.",
    height: "h-[392px]",
    tint: "from-amber-950/55",
  },
  {
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
    alt: "Young woman arranging craft supplies at a table",
    label: "Workshop",
    title: "Working",
    caption: "A gradual rise as the strip moves toward the center.",
    height: "h-[486px]",
    tint: "from-slate-950/55",
  },
  {
    src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
    alt: "Child focused on drawing with a pencil",
    label: "Learning",
    title: "Focus",
    caption: "The second bar steps higher, but still stays below the middle.",
    height: "h-[582px]",
    tint: "from-stone-950/50",
  },
  {
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    alt: "Smiling child holding a ball outside",
    label: "Joy",
    title: "Lift",
    caption: "The fourth bar is almost at the peak.",
    height: "h-[682px]",
    tint: "from-indigo-950/45",
  },
  {
    src: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=900&q=80",
    alt: "Adult helping a child write at a desk",
    label: "Guidance",
    title: "Center",
    caption: "The central strip is the longest and most dominant.",
    height: "h-[768px]",
    tint: "from-zinc-950/55",
  },
  {
    src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80",
    alt: "Teacher smiling while writing on a board",
    label: "Teaching",
    title: "Return",
    caption: "Heights begin stepping back down on the right side.",
    height: "h-[682px]",
    tint: "from-rose-950/50",
  },
  {
    src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=80",
    alt: "Community event with people gathered indoors",
    label: "Gathering",
    title: "Shared",
    caption: "This panel mirrors the left side’s third bar.",
    height: "h-[582px]",
    tint: "from-emerald-950/50",
  },
  {
    src: "https://images.unsplash.com/photo-1518156677180-95a2893f3f8f?auto=format&fit=crop&w=900&q=80",
    alt: "Group meeting outdoors in a village setting",
    label: "Outreach",
    title: "Meet",
    caption: "The second-to-last bar is tall but not the tallest.",
    height: "h-[486px]",
    tint: "from-teal-950/50",
  },
  {
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    alt: "Smiling person in a calm indoor portrait",
    label: "Closing",
    title: "Exit",
    caption: "Outer edge on the right with the lowest height.",
    height: "h-[392px]",
    tint: "from-teal-950/50",
  },
]

// Demo-local override key (keeps edits local and safe)
const LOCAL_OVERRIDE_KEY = "demo_photo_wall_override_v1"

const stats = [
  { value: "08", label: "portrait cards" },
  { value: "100%", label: "remote placeholders" },
  { value: "1", label: "ready-to-replace module" },
]

const barHeights = ["55%", "66%", "78%", "90%", "100%", "90%", "78%", "66%", "55%"]

export default function PhotoWallDemoPage() {
  const [panels, setPanels] = useState(defaultCollagePanels)
  const [loadingSettings, setLoadingSettings] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [editorValue, setEditorValue] = useState("")

  useEffect(() => {
    // Load local override first (demo-only), then try admin settings from Supabase
    try {
      const raw = localStorage.getItem(LOCAL_OVERRIDE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length === 9) setPanels(parsed)
      }
    } catch (err) {
      console.warn("Invalid local override", err)
    }

    async function loadFromSettings() {
      setLoadingSettings(true)
      try {
        const supabase = createClient()
        const { data: row, error } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "photo_wall_images")
          .single()

        if (!error && row?.value) {
          // row.value may be an object or a JSON string
          const val = typeof row.value === "string" ? JSON.parse(row.value) : row.value
          if (Array.isArray(val) && val.length === 9) setPanels(val)
        }
      } catch (err) {
        console.warn("Could not load photo wall settings", err)
      } finally {
        setLoadingSettings(false)
      }
    }

    loadFromSettings()
  }, [])

  useEffect(() => {
    setEditorValue(JSON.stringify(panels, null, 2))
  }, [panels])

  const saveLocalOverride = () => {
    try {
      const parsed = JSON.parse(editorValue)
      if (!Array.isArray(parsed) || parsed.length !== 9) {
        alert("Please provide a JSON array of 9 image objects")
        return
      }
      localStorage.setItem(LOCAL_OVERRIDE_KEY, JSON.stringify(parsed))
      setPanels(parsed)
      setShowEditor(false)
    } catch (err) {
      alert("Invalid JSON")
    }
  }

  const clearLocalOverride = () => {
    localStorage.removeItem(LOCAL_OVERRIDE_KEY)
    setPanels(defaultCollagePanels)
    setShowEditor(false)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4ecdf] text-[#1e2a36]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.9),_rgba(244,236,223,0.12)_34%,_transparent_62%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(23,37,56,0.08),transparent)]" />
      <div className="pointer-events-none absolute left-[-6rem] top-[18%] h-72 w-72 rounded-full bg-[#c69d5b]/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-5rem] bottom-[-4rem] h-80 w-80 rounded-full bg-[#90a7c4]/20 blur-3xl" />

      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-5 py-5 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/70 px-4 py-4 shadow-[0_24px_80px_rgba(31,41,55,0.12)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1d3448] text-white shadow-[0_16px_30px_rgba(29,52,72,0.3)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.38em] text-[#7b6758]">Demo / visual study</p>
              <h1 className="mt-1 text-sm font-semibold text-[#253446] sm:text-base">Portrait collage inspired by the reference layout</h1>
            </div>
          </div>

          <Link
            href="/demo"
            className="inline-flex items-center gap-2 self-start rounded-full border border-[#d6c6b4] bg-[#f9f4eb] px-4 py-2 text-sm font-medium text-[#314353] transition hover:-translate-y-0.5 hover:border-[#b79f87] hover:bg-white"
          >
            Back to demo hub
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.95fr_1.25fr] lg:py-12">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#dbcab6] bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-[#876e57] shadow-sm">
              <Layers3 className="h-3.5 w-3.5" />
              Story collage
            </p>

            <h2 className="mt-6 max-w-lg text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-[#192430] sm:text-6xl lg:text-[5.25rem]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              A vertical wall for community moments.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#405164]">
              This demo recreates the stacked portrait-card rhythm from your reference image: narrow panels, staggered heights, soft overlap, and a calm editorial surface. The images are temporary remote placeholders, so you can swap them with your real foundation photography later.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-flex items-center rounded-full bg-[#1d3448] px-4 py-2 text-sm font-medium text-white shadow-[0_16px_35px_rgba(29,52,72,0.28)]">
                Replace with your own assets
              </span>
              <span className="inline-flex items-center rounded-full border border-[#d8c6b2] bg-white/75 px-4 py-2 text-sm font-medium text-[#394959] backdrop-blur">
                Responsive scrollable strip
              </span>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-[22px] border border-white/75 bg-white/75 p-4 shadow-[0_18px_40px_rgba(31,41,55,0.08)] backdrop-blur-sm">
                  <div className="text-2xl font-semibold tracking-[-0.04em] text-[#1f3040]">{stat.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.24em] text-[#7f6958]">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowEditor((s) => !s)}
                className="rounded-full border border-[#d6c6b4] bg-[#fffaf2] px-3 py-2 text-sm font-medium text-[#314353]"
              >
                {showEditor ? "Close editor" : "Customize (demo)"}
              </button>

              {showEditor && (
                <div className="mt-4 rounded-lg border p-4 bg-white/90">
                  <p className="text-sm text-[#44505a]">Paste a JSON array of 9 image objects (src, alt, title, label). This saves only to your browser in demo mode.</p>
                  <textarea
                    value={editorValue}
                    onChange={(e) => setEditorValue(e.target.value)}
                    rows={8}
                    className="mt-2 w-full rounded-md border p-2 font-mono text-sm"
                  />
                  <div className="mt-3 flex gap-2">
                    <button onClick={saveLocalOverride} className="rounded bg-[#0B5F8A] px-3 py-2 text-sm text-white">Save override</button>
                    <button onClick={clearLocalOverride} className="rounded border px-3 py-2 text-sm">Clear override</button>
                    <button onClick={() => setShowEditor(false)} className="ml-auto rounded px-3 py-2 text-sm">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 top-1/2 h-[70%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ceb58a]/35 blur-3xl" />

            <PhotoWall panels={panels} />

            <div className="mt-4 flex items-center justify-between rounded-[24px] border border-white/70 bg-white/65 px-4 py-3 text-sm text-[#495968] shadow-[0_18px_40px_rgba(31,41,55,0.08)] backdrop-blur-sm">
              <span>Designed as a drop-in demo first, production component later.</span>
              <span className="hidden items-center gap-2 md:inline-flex">
                <MoveRight className="h-4 w-4" />
                Shift the images to real content when ready
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}