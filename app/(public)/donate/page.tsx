import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Heart, ArrowDown, ArrowUpRight, Shield, Search, BookOpen, Stethoscope, GraduationCap, Scissors, Droplets, School } from "lucide-react"
import styles from "./donate.module.css"
import { GivingOptions } from "@/components/donations/giving-options"
import { DonationForm } from "@/components/donations/donation-form"
import { BankTransferPanel } from "@/components/donations/bank-transfer-panel"
import { getPaymentSettings, getSupportedProviders } from "@/lib/payments/config"
import { getConfiguredBankAccounts } from "@/lib/payments/bank-details"
import { generateSEOMetadata } from "@/lib/seo/metadata-utils"

export const metadata: Metadata = generateSEOMetadata({
  title: "Donate - Support Our Mission in Nepal",
  description:
    "Support our mission to empower communities in Nepal through education, healthcare, and sustainable development. Every donation makes a real difference in children's lives.",
  path: "/donate",
  keywords: [
    "donate to Nepal",
    "support Nepal NGO",
    "charity donation",
    "help Nepal children",
    "education donation",
    "autism support donation",
    "make a difference Nepal",
  ],
})

const donationTiers = [
  {
    amount: 25,
    impact: "School supplies for 5 children",
    icon: "📚",
  },
  {
    amount: 50,
    impact: "Medical checkup for a family",
    icon: "🏥",
  },
  {
    amount: 100,
    impact: "Teacher training workshop",
    icon: "👩‍🏫",
  },
  {
    amount: 250,
    impact: "Skills training for 3 women",
    icon: "✂️",
  },
  {
    amount: 500,
    impact: "Clean water for a village",
    icon: "💧",
  },
  {
    amount: 1000,
    impact: "Rebuild a classroom",
    icon: "🏫",
  },
]

const faqs = [
  {
    question: "How is my donation used?",
    answer: "88% of all donations go directly to programs. The remaining 12% covers essential operational costs.",
  },
  {
    question: "Is my donation tax-deductible?",
    answer: "Yes! deessa Foundation is a registered 501(c)(3) nonprofit. You will receive a tax receipt via email.",
  },
  {
    question: "Can I donate to a specific program?",
    answer: "You can select a specific program during checkout, or leave it unrestricted for greatest impact.",
  },
  {
    question: "How do I cancel a recurring donation?",
    answer: "Contact us anytime at deessa.social@gmail.com and we'll process your request within 24 hours.",
  },
]

export default async function DonatePage() {
  const settings = await getPaymentSettings()
  const enabledProviders = getSupportedProviders(settings)
  const bankAccounts = getConfiguredBankAccounts()

  const impactIcons = [BookOpen, Stethoscope, GraduationCap, Scissors, Droplets, School]

  return (
    <div className={styles.page}>
      <section aria-labelledby="donate-heading" className={`${styles.hero} relative isolate overflow-hidden`}>
        <div aria-hidden="true" className={`${styles.decor} pointer-events-none absolute -right-24 -top-16 h-[500px] w-[700px] opacity-40`}>
          <Image src="/artWork/art-watercolor-splash.webp" alt="" fill sizes="700px" className="object-fill" />
        </div>
        <div className="relative mx-auto max-w-[1440px] px-5 pb-16 pt-6 sm:px-8 lg:px-16 lg:pb-20">
          <nav aria-label="Breadcrumb" className="mb-10 text-sm"><ol className="flex items-center gap-2"><li><Link href="/" className="inline-block py-3 hover:underline">Home</Link></li><li aria-hidden="true">›</li><li aria-current="page">Donate</li></ol></nav>
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
            <div className="relative">
              <h1 id="donate-heading" className={`${styles.heroHeading} text-balance text-[clamp(2.5rem,7vw,4rem)] leading-[1.15]`}>
                A little kindness.<br />
                <span className={`${styles.heroAccent} relative inline-block pb-4`}>A world of possibility.
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 500 24" preserveAspectRatio="none" className={`${styles.decor} pointer-events-none absolute bottom-0 left-0 h-3 w-full`}><path d="M4 17C99 6 218 3 335 7C406 8 460 10 495 14C359 12 194 14 5 23Z" fill="#f7bd09" /></svg>
                </span>
              </h1>
              <p className={`${styles.heroCopy} mt-6 max-w-xl text-lg leading-relaxed sm:text-xl`}>Help children and families across Nepal feel understood, included, and supported. Every gift makes room for learning, creativity, and connection.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href="#giving-options" data-a11y-control="" className={`${styles.primaryLink} inline-flex min-h-14 items-center justify-center gap-3 rounded-full px-8 py-3 text-lg font-bold`}>Give with love <Heart aria-hidden="true" className="size-5" /></a>
                <a href="#impact-heading" className={`${styles.secondaryLink} inline-flex min-h-14 items-center justify-center gap-3 rounded-full border px-7 py-3 text-lg font-bold`}>See your impact <ArrowDown aria-hidden="true" className="size-5" /></a>
              </div>
              <p className={`${styles.heroCopy} mt-6 flex items-center gap-2 text-sm`}><Shield aria-hidden="true" className="size-4 shrink-0" />A secure way to support a kinder tomorrow.</p>
            </div>
            <div className="relative mx-auto w-full max-w-xl pb-8 pl-3 pr-5 pt-4 sm:pr-10">
              <div aria-hidden="true" className={`${styles.decor} pointer-events-none absolute -inset-5 opacity-65`}><Image src="/artWork/art-watercolor-splash.webp" alt="" fill sizes="650px" className="object-fill" /></div>
              <figure className={`${styles.photoFrame} relative -rotate-3 p-3 pb-5 sm:p-4 sm:pb-6`}>
                <span aria-hidden="true" className={`${styles.tape} ${styles.decor} absolute -top-3 left-1/2 z-10 h-7 w-24 -translate-x-1/2 rotate-6`} />
                <div className="relative aspect-[4/3] overflow-hidden"><Image src="/home/hero/art_banner.jpeg" alt="Children sharing a creative activity together" fill sizes="(max-width: 1023px) 90vw, 44vw" className="object-cover" /></div>
                <figcaption className="px-2 pt-5 text-center text-base">More moments to learn, create, and belong.</figcaption>
              </figure>
            </div>
          </div>
        </div>
        <svg aria-hidden="true" focusable="false" viewBox="0 0 1440 50" preserveAspectRatio="none" className={`${styles.heroEdge} ${styles.decor} pointer-events-none absolute inset-x-0 bottom-0 h-7 w-full`}><path d="M0 24Q180 48 360 26T720 25T1080 30T1440 18V50H0Z" fill="currentColor" /></svg>
      </section>

      <section aria-labelledby="giving-heading" className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="mb-10 text-center"><h2 id="giving-heading" className="text-3xl leading-tight sm:text-4xl">Let&apos;s make a difference, together.</h2><p className="mt-4 text-lg text-foreground-muted">A one-time kindness or a little love each month. It all matters.</p></div>
        <GivingOptions
          onlineAvailable={enabledProviders.length > 0}
          online={<DonationForm tiers={donationTiers} enabledProviders={enabledProviders} primaryProvider={settings.primaryProvider} defaultCurrency={settings.defaultCurrency} />}
          bank={bankAccounts.length > 0 ? <BankTransferPanel accounts={bankAccounts} /> : undefined}
        />
        <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-5 border-t border-border pt-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="flex items-center gap-2 text-sm text-foreground-muted"><Shield aria-hidden="true" className="size-4 shrink-0" />Secure payments. Support when you need it.</p>
          <Link href="/verify" className={`${styles.textLink} inline-flex min-h-11 items-center gap-2 text-sm font-bold`}><Search aria-hidden="true" className="size-4" />Verify your receipt<ArrowUpRight aria-hidden="true" className="size-4" /></Link>
        </div>

      </section>

      <section aria-labelledby="impact-heading" className={`border-y border-border ${styles.impact}`}>
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="grid gap-4 md:grid-cols-2 md:gap-12">
            <h2 id="impact-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">A gift becomes<br />a real possibility.</h2>
            <p className="max-w-lg self-end leading-relaxed text-foreground-muted">Here&apos;s how your donation translates into real change on the ground. The examples below are in US dollars.</p>
          </div>
          <div className="mt-10 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {donationTiers.map((tier, index) => {
              const Icon = impactIcons[index]
              return <div key={tier.amount} className="flex items-start gap-4 border-t border-border py-7"><Icon aria-hidden="true" className={`mt-1 size-6 shrink-0 ${styles.accent}`} /><div><p className="text-2xl font-bold tabular-nums">${tier.amount}</p><p className="mt-1 text-sm text-foreground-muted">{tier.impact}</p></div></div>
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div><h2 id="faq-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">Good questions.<br />Clear answers.</h2><p className="mt-5 text-foreground-muted">Need a little help before giving?</p><Link href="/contact" className={`mt-3 inline-flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4 ${styles.textLink}`}>Talk to our team <ArrowUpRight aria-hidden="true" className="size-4" /></Link></div>
        <div className="min-w-0">
          {faqs.map((faq) => <details key={faq.question} className={`border-b border-border py-5 ${styles.faq}`}><summary className="cursor-pointer pr-3 text-lg font-semibold">{faq.question}</summary><p className="mt-4 max-w-2xl leading-relaxed text-foreground-muted">{faq.answer}</p></details>)}
        </div>
      </section>

      <section aria-labelledby="other-heading" className={styles.other}>
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 id="other-heading" className="text-3xl font-bold">Generosity takes many forms.</h2><p className="mt-3">Explore other ways to support our mission.</p></div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {[{ label: "Corporate Partnerships", href: "/contact" }, { label: "In-Kind Donations", href: "/get-involved" }, { label: "Legacy Giving", href: "/contact" }].map((item) => <Link key={item.label} href={item.href} className="inline-flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4">{item.label}<ArrowUpRight aria-hidden="true" className="size-4" /></Link>)}
          </div>
        </div>
      </section>
    </div>
  )
}
