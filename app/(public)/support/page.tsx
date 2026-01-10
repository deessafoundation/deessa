import type { Metadata } from "next"
import Link from "next/link"
import { AlertTriangle, Bug, MessageSquareText, ShieldCheck, Sparkles } from "lucide-react"
import { Section } from "@/components/ui/section"
import { Button } from "@/components/ui/button"
import { SupportForm } from "@/components/support-form"
import { isSupportEnabled } from "@/lib/support/settings"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Support & Feedback - Deesha Foundation",
  description: "Report bugs, share suggestions, and help us improve the website before launch.",
}

const supportHighlights = [
  {
    icon: Bug,
    title: "Bug reports",
    text: "Share broken layouts, unusable buttons, or anything that stops a visitor from finishing a task.",
  },
  {
    icon: MessageSquareText,
    title: "Suggestions",
    text: "Tell us what would make the site easier to use, clearer, or more helpful.",
  },
  {
    icon: ShieldCheck,
    title: "Safe by default",
    text: "Inputs are validated, screenshots are size-limited, and stored securely for the admin team.",
  },
] as const

export default async function SupportPage() {
  const supportEnabled = await isSupportEnabled()
  
  if (!supportEnabled) {
    notFound()
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-20 text-white sm:py-28 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(56,189,248,0.15),_transparent_50%),radial-gradient(circle_at_70%_60%,_rgba(14,165,233,0.1),_transparent_50%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:64px_64px]" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16 xl:gap-20">
            {/* Left Column - Main Content */}
            <div className="flex flex-col justify-center">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan-300 backdrop-blur-sm">
                <Sparkles className="size-4" />
                Development Feedback
              </div>
              
              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                Help us catch issues
                <span className="mt-2 block bg-gradient-to-r from-cyan-400 to-sky-400 bg-clip-text text-transparent">
                  before launch
                </span>
              </h1>
              
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg lg:text-xl">
                If something looks off, feels confusing, or could be improved, send it here with a screenshot and a short
                explanation. We review every report manually so the launch stays clean and deliberate.
              </p>
              
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button 
                  asChild 
                  size="lg"
                  className="h-14 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 px-8 text-base font-bold text-white shadow-xl shadow-cyan-500/25 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30"
                >
                  <Link href="#support-form">
                    <AlertTriangle className="mr-2 size-5" />
                    Report an Issue
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-14 rounded-full border-white/20 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/10"
                >
                  <Link href="/contact">General Contact</Link>
                </Button>
              </div>

              {/* Support Highlights - Desktop Only */}
              <div className="mt-12 hidden gap-4 lg:grid lg:grid-cols-3">
                {supportHighlights.map((item) => (
                  <div key={item.title} className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-cyan-400/30 hover:bg-white/10">
                    <div className="mb-3 inline-flex size-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 transition-colors group-hover:bg-cyan-400/20">
                      <item.icon className="size-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Response Promise Card */}
            <div className="flex items-center lg:items-start lg:pt-12">
              <div className="w-full rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-cyan-400/20 px-4 py-2">
                  <ShieldCheck className="size-4 text-cyan-300" />
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">Response Promise</span>
                </div>
                
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 size-2.5 shrink-0 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
                    <div>
                      <p className="font-bold text-white">Fast Triage</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                        We scan new reports and prioritize blockers first.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="mt-1 size-2.5 shrink-0 rounded-full bg-sky-400 shadow-lg shadow-sky-400/50" />
                    <div>
                      <p className="font-bold text-white">Useful Context</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                        A page URL and screenshot help us reproduce issues quickly.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="mt-1 size-2.5 shrink-0 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50" />
                    <div>
                      <p className="font-bold text-white">Manual Review</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                        Every submission is reviewed by the team before anything ships.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support Highlights - Mobile Only */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3 lg:hidden">
            {supportHighlights.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <div className="mb-3 inline-flex size-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                  <item.icon className="size-5" />
                </div>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <Section id="support-form" className="bg-gradient-to-b from-slate-50 via-white to-slate-50 py-20 sm:py-24 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 xl:gap-20">
          {/* Left Column - Form */}
          <div className="space-y-8">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Bug className="size-4" />
                Support Inbox
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Send a report to the admin team
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                Add enough detail for us to reproduce the issue, and include a screenshot if possible. Everything here is reviewed manually so we can keep the launch process clean.
              </p>
            </div>
            
            <SupportForm initialPageUrl="" />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* What to Include Card */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50 shadow-xl shadow-slate-200/50">
              <div className="border-b border-slate-200 bg-slate-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
                    <Bug className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-950">What to Include</h3>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-4 text-sm leading-relaxed text-slate-700">
                  <li className="flex items-start gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">1</span>
                    <span>The page or section where the problem happened.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">2</span>
                    <span>What you expected to happen instead.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">3</span>
                    <span>A screenshot or screen recording if one helps explain it.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Good Reports Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">Good Reports Are</p>
              <div className="space-y-3">
                {["Specific", "Reproducible", "Visual when possible"].map((label) => (
                  <div 
                    key={label} 
                    className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 ring-1 ring-slate-200"
                  >
                    <div className="size-2 rounded-full bg-slate-900" />
                    <span className="text-sm font-semibold text-slate-700">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Note Card */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="size-5 text-slate-600" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Privacy Note</p>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                The form only stores the information needed to diagnose the issue. Screenshots are kept in private storage and reviewed by the admin team.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}