import type { Metadata } from "next"
import Link from "next/link"
import {
  AlertTriangle,
  Bug,
  FileText,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react"
import { Section } from "@/components/ui/section"
import { Button } from "@/components/ui/button"
import { SupportForm } from "@/components/support-form"
import { isSupportEnabled } from "@/lib/support/settings"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Support & Feedback - deessa Foundation",
  description: "Report bugs, share suggestions, and help us improve the website before launch.",
}

const supportHighlights = [
  {
    icon: Bug,
    title: "Bug reports",
    text: "Share broken layouts, unusable buttons, or anything that stops a visitor from finishing a task.",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-500",
    ring: "ring-rose-100",
  },
  {
    icon: MessageSquareText,
    title: "Suggestions",
    text: "Tell us what would make the site easier to use, clearer, or more helpful.",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-500",
    ring: "ring-amber-100",
  },
  {
    icon: ShieldCheck,
    title: "Safe by default",
    text: "Inputs are validated, screenshots are size-limited, and stored securely for the admin team.",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-500",
    ring: "ring-emerald-100",
  },
] as const

const responsePromise = [
  {
    icon: Zap,
    title: "Fast Triage",
    text: "We scan new reports and prioritize blockers first.",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-500",
  },
  {
    icon: FileText,
    title: "Useful Context",
    text: "A page URL and screenshot help us reproduce issues quickly.",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-500",
  },
  {
    icon: Users,
    title: "Manual Review",
    text: "Every submission is reviewed by the team before anything ships.",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-500",
  },
] as const

export default async function SupportPage() {
  const supportEnabled = await isSupportEnabled()

  if (!supportEnabled) {
    notFound()
  }

  return (
    <>
      {/* Hero Section - light */}
      <section data-a11y-region="neutral" className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-slate-50 py-16 sm:py-20 lg:py-24">
        <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_15%_20%,_rgba(56,189,248,0.12),_transparent_45%),radial-gradient(circle_at_85%_10%,_rgba(167,139,250,0.10),_transparent_45%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            {/* Left Column - Main Content */}
            <div className="flex flex-col justify-center">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-sm">
                <Sparkles className="size-4 text-sky-500" />
                Development Feedback
              </div>

              <h1
                className="font-marissa text-4xl font-medium leading-[1.1] tracking-tight text-black sm:text-5xl lg:text-6xl"
                style={{ WebkitTextStroke: "0.8px currentColor" }}
              >
                Help us catch issues before launch
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                If something looks off, feels confusing, or could be improved, send it here with a screenshot and a short
                explanation. We review every report manually so the launch stays clean and deliberate.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="h-13 rounded-full bg-gradient-to-r from-[#0b76b7] to-sky-500 px-8 text-base font-bold text-white shadow-lg shadow-sky-500/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-sky-500/30"
                >
                  <Link href="#support-form">
                    <AlertTriangle className="mr-2 size-5 text-sky-100" />
                    Report an Issue
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-13 rounded-full border-sky-300 bg-white px-8 text-base font-semibold text-[#0b76b7] hover:bg-sky-50"
                >
                  <Link href="/contact">
                    <MessageSquareText className="mr-2 size-5 text-sky-500" />
                    General Contact
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Column - Response Promise Card */}
            <div className="flex items-center lg:items-start lg:pt-4">
              <div className="w-full rounded-3xl border border-sky-100 bg-white p-6 shadow-xl shadow-sky-100/60 sm:p-8">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2">
                  <ShieldCheck className="size-4 text-sky-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-black">Response Promise</span>
                </div>

                <div className="space-y-6">
                  {responsePromise.map((item) => (
                    <div key={item.title} className="flex items-start gap-4">
                      <div
                        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor}`}
                      >
                        <item.icon className="size-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Support Highlights */}
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
            {supportHighlights.map((item) => (
              <div
                key={item.title}
                className={`group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ${item.ring} transition-all hover:-translate-y-1 hover:shadow-lg`}
              >
                <div
                  className={`mb-4 inline-flex size-12 items-center justify-center rounded-2xl ${item.iconBg} ${item.iconColor}`}
                >
                  <item.icon className="size-6" />
                </div>
                <h3 className="font-marissa text-xl font-medium text-black" style={{ WebkitTextStroke: "0.4px currentColor" }}>
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <Section id="support-form" className="bg-gradient-to-b from-slate-50 via-white to-slate-50 py-16 sm:py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 xl:gap-20">
          {/* Left Column - Form */}
          <div className="space-y-8">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black ring-1 ring-sky-100">
                <MessageSquareText className="size-4 text-sky-600" />
                Support Inbox
              </div>
              <h2
                className="mt-4 font-marissa text-3xl font-medium leading-tight tracking-tight text-black sm:text-4xl lg:text-5xl"
                style={{ WebkitTextStroke: "0.7px currentColor" }}
              >
                Send a report to the admin team
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                Add enough detail for us to reproduce the issue, and include a screenshot if possible. Everything here is
                reviewed manually so we can keep the launch process clean.
              </p>
            </div>

            <SupportForm initialPageUrl="" />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* What to Include Card */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
              <div className="border-b border-sky-100 bg-sky-50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-500">
                    <FileText className="size-5" />
                  </div>
                  <h3 className="font-marissa text-lg font-medium text-black" style={{ WebkitTextStroke: "0.4px currentColor" }}>
                    What to Include
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-4 text-sm leading-relaxed text-slate-700">
                  <li className="flex items-start gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-400 text-xs font-bold text-white">
                      1
                    </span>
                    <span>The page or section where the problem happened.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white">
                      2
                    </span>
                    <span>What you expected to happen instead.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0b76b7] text-xs font-bold text-white">
                      3
                    </span>
                    <span>A screenshot or screen recording if one helps explain it.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Good Reports Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">Good Reports Are</p>
              <div className="space-y-3">
                {[
                  { label: "Specific", color: "bg-sky-400" },
                  { label: "Reproducible", color: "bg-sky-500" },
                  { label: "Visual when possible", color: "bg-[#0b76b7]" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-2xl bg-sky-50 px-4 py-3 ring-1 ring-sky-100"
                  >
                    <div className={`size-2.5 rounded-full ${item.color}`} />
                    <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Note Card */}
            <div className="rounded-3xl border border-sky-100 bg-sky-50/60 p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="size-5 text-sky-600" />
                <p className="text-xs font-bold uppercase tracking-wider text-black">Privacy Note</p>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                The form only stores the information needed to diagnose the issue. Screenshots are kept in private storage
                and reviewed by the admin team.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
