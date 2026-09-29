import type { Metadata } from "next"
import { Suspense } from "react"
import { Mail, Phone, MapPin, Clock, ArrowRight, Shield, Award, Loader2, ExternalLink, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContactFormPrefilled } from "@/components/contact-form-prefilled"
import { isSupportEnabled } from "@/lib/support/settings"
import Link from "next/link"
import { generateSEOMetadata } from "@/lib/seo/metadata-utils"
import styles from "./contact.module.css"

export const metadata: Metadata = generateSEOMetadata({
  title: "Contact Us - Get in Touch with Deesha Foundation",
  description:
    "Get in touch with Deesha Foundation. Reach out for partnerships, donations, volunteering opportunities, or general inquiries. We're here to help make a difference in Nepal.",
  path: "/contact",
  keywords: [
    "contact Deesha Foundation",
    "Nepal NGO contact",
    "volunteer Nepal",
    "donate to Nepal",
    "partnership opportunities",
    "get involved",
  ],
})

const channels = [
  {
    icon: MapPin,
    meta: "Find Us",
    label: "Our Office",
    items: [{ text: "Dhobighat Nayabato, Sanepa" }, { text: "Lalitpur 44600, Nepal" }],
  },
  {
    icon: Mail,
    meta: "Write to Us",
    label: "Email",
    items: [{ text: "deessa.social@gmail.com", href: "mailto:deessa.social@gmail.com" }],
  },
  {
    icon: Phone,
    meta: "Call Us",
    label: "Phone",
    items: [
      { text: "+977 1-4123456", href: "tel:+97714123456" },
      { text: "+977 9841234567", href: "tel:+9779841234567" },
    ],
  },
  {
    icon: Clock,
    meta: "Office Hours",
    label: "Open Hours",
    items: [{ text: "Sun – Fri: 9 AM – 5 PM" }, { text: "Saturday: Closed" }],
  },
]

const credentials = [
  {
    icon: Shield,
    iconBg: "rgba(63,171,222,0.15)",
    iconColor: "#3fabde",
    accentColor: "#3fabde",
    linkColor: "#3fabde",
    num: "01",
    title: "SWC Registered",
    desc: "Officially registered with Nepal's Social Welfare Council, operating with full legal standing and government oversight.",
    href: "/deesa-resources/SWC.jpg",
    download: true,
    linkLabel: "View Certificate",
  },
  {
    icon: Award,
    iconBg: "rgba(149,193,31,0.15)",
    iconColor: "#95c11f",
    accentColor: "#95c11f",
    linkColor: "#95c11f",
    num: "02",
    title: "PAN Registered",
    desc: "Valid PAN registration ensuring complete financial transparency and accountability for every rupee we spend.",
    href: "/deesa-resources/PAN.pdf",
    download: true,
    linkLabel: "View PAN",
  },
  {
    icon: BookOpen,
    iconBg: "rgba(247,197,43,0.15)",
    iconColor: "#f7c52b",
    accentColor: "#f7c52b",
    linkColor: "#f7c52b",
    num: "03",
    title: "Organization Bio",
    desc: "Download our comprehensive biography to learn about our mission, history, and impact across communities in Nepal.",
    href: "/deesa-resources/deessa Foundation_ Short Bio -2.pdf",
    download: true,
    linkLabel: "Download Bio",
  },
]

export default async function ContactPage() {
  const supportEnabled = await isSupportEnabled()

  return (
    <div>
      {/* ━━━━━━━━━━━━ HERO ━━━━━━━━━━━━ */}
      <section data-a11y-hero="photo" aria-labelledby="contact-hero-heading" className={styles.hero}>
        <div
          data-a11y-photo
          className={styles.heroBg}
          style={{
            backgroundImage: `url("/contact-page.png")`,
          }}
          role="img"
          aria-label="Caregiver and child working through picture cards together — contact hero"
        />
        <div data-a11y-shade className={styles.heroOverlay} aria-hidden="true" />

        <div data-a11y-hero-copy className={styles.heroContent}>
          <div data-a11y-contact-badge className={styles.heroBadge} aria-hidden="true">
            <span className={styles.heroBadgeDot} />
            Get in Touch
          </div>

          <h1 id="contact-hero-heading" className={styles.heroTitle}>
            We&apos;d Love to
            <span className={styles.heroTitleAccent}>Hear From You</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Questions, partnership ideas, or just want to say hello? Drop us a message and our team will respond within
            24 hours.
          </p>

          {supportEnabled && (
            <div className="mt-8">
              <Button
                asChild
                className="rounded-full bg-amber-400 px-6 text-slate-950 hover:bg-amber-300 font-semibold"
              >
                <Link href="/support">Report a bug or suggest an improvement</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Wave into channels band */}
        <div className={styles.waveDivider} aria-hidden="true">
          <svg viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path
              d="M0 72L60 60C120 48 240 24 360 18C480 12 600 24 720 30C840 36 960 36 1080 30C1200 24 1320 12 1380 6L1440 0V72H1380C1320 72 1200 72 1080 72C960 72 840 72 720 72C600 72 480 72 360 72C240 72 120 72 60 72H0Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* ━━━━━━━━━━━━ CHANNELS BAND ━━━━━━━━━━━━ */}
      <div className={styles.channelsBand} role="region" aria-label="Contact channels">
        <div className="max-w-350 mx-auto px-4 md:px-8">
          <ul className={styles.channelsInner}>
            {channels.map((ch) => (
              <li key={ch.label} className={styles.channelItem}>
                <div className={styles.channelIconRing} aria-hidden="true">
                  <ch.icon size={17} />
                </div>
                <span className={styles.channelMeta}>{ch.meta}</span>
                <span className={styles.channelLabel}>{ch.label}</span>
                <div className={styles.channelValue}>
                  {ch.items.map((item, idx) => (
                    <p key={idx}>
                      {item.href ? (
                        <a href={item.href} className={styles.channelLink}>
                          {item.text}
                        </a>
                      ) : (
                        item.text
                      )}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ━━━━━━━━━━━━ FORM + LOCATION ━━━━━━━━━━━━ */}
      <section className={styles.formSection} aria-labelledby="contact-form-heading">
        <div className="max-w-350 mx-auto px-4 md:px-8">
          <div className={styles.formSectionInner}>
            {/* Form Column */}
            <div className={styles.formSide}>
              <div className={styles.columnHeader}>
                <p className={styles.eyebrow}>
                  <span className={styles.eyebrowLine} aria-hidden="true" />
                  Send a Message
                </p>
                <h2 id="contact-form-heading" className={styles.sectionHeading}>
                  Let&apos;s Start a Conversation
                </h2>
                <p className={styles.sectionLead}>
                  Fill out the form and we&apos;ll get back to you within 24 hours. Every message matters — we read
                  every single one.
                </p>
              </div>

              <div className={styles.formShell}>
                <Suspense
                  fallback={
                    <div
                      className="flex items-center gap-2 text-foreground-muted text-sm py-8"
                      role="status"
                      aria-live="polite"
                    >
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      <span>Loading form…</span>
                    </div>
                  }
                >
                  <ContactFormPrefilled />
                </Suspense>
              </div>
            </div>

            {/* Location Column */}
            <div className={styles.locationSide} role="region" aria-labelledby="location-heading">
              <div className={styles.columnHeader}>
                <p className={styles.eyebrow}>
                  <span className={styles.eyebrowLine} aria-hidden="true" />
                  Where We Are
                </p>
                <h2 id="location-heading" className={styles.sectionHeading}>
                  Visit Our Office
                </h2>
                <p className={styles.sectionLead}>
                  We&apos;re based in the heart of Lalitpur. Visitors are always welcome — reach out anytime to schedule
                  a visit.
                </p>
              </div>

              <div className={styles.locationContent}>
                {/* Real Google Maps Card */}
                <div
                  className={styles.locationCard}
                  role="region"
                  aria-label="Interactive map showing Deesha Foundation office location"
                >
                  <iframe
                    src="https://maps.google.com/maps?q=Dhobighat%20Nayabato%2C%20Sanepa%2C%20Lalitpur%2C%20Nepal&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    title="Google Map showing Deesha Foundation office in Dhobighat Nayabato, Sanepa, Lalitpur, Nepal"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className={styles.mapIframe}
                    aria-label="Google Map showing office location in Sanepa, Lalitpur"
                  />

                  {/* Floating badge over map */}
                  <div className={styles.locationOverlay}>
                    <div className={styles.locationOverlayContent}>
                      <span className={styles.locationPill}>
                        <MapPin size={9} aria-hidden="true" />
                        Lalitpur, Nepal
                      </span>
                      <h3 className={styles.locationName}>Deesha Foundation HQ</h3>
                      <p className={styles.locationAddr}>Dhobighat Nayabato, Sanepa, Lalitpur 44600</p>
                    </div>

                    <a
                      href="https://maps.google.com/?q=Sanepa,Lalitpur,Nepal"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.locationMapBtn}
                      aria-label="Open Deesha Foundation office location in Google Maps (opens in new tab)"
                    >
                      <span>Open in Maps</span>
                      <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  </div>
                </div>

                {/* Accessible Info pills below map */}
                <ul className={styles.locationStats} aria-label="Quick contact details">
                  <li className={styles.locationStatPill}>
                    <div className={styles.locationStatIcon} aria-hidden="true">
                      <Clock size={15} />
                    </div>
                    <div className={styles.locationStatText}>
                      <p className={styles.locationStatLabel}>Response Time</p>
                      <p className={styles.locationStatValue}>Within 24 hours</p>
                    </div>
                  </li>
                  <li className={styles.locationStatPill}>
                    <div className={styles.locationStatIcon} aria-hidden="true">
                      <Mail size={15} />
                    </div>
                    <div className={styles.locationStatText}>
                      <p className={styles.locationStatLabel}>General Inquiries</p>
                      <p className={styles.locationStatValue}>
                        <a href="mailto:deessa.social@gmail.com" className={styles.locationStatLink}>
                          deessa.social@gmail.com
                        </a>
                      </p>
                    </div>
                  </li>
                  <li className={styles.locationStatPill}>
                    <div className={styles.locationStatIcon} aria-hidden="true">
                      <Phone size={15} />
                    </div>
                    <div className={styles.locationStatText}>
                      <p className={styles.locationStatLabel}>Direct Line</p>
                      <p className={styles.locationStatValue}>
                        <a href="tel:+9779841234567" className={styles.locationStatLink}>
                          +977 9841234567
                        </a>
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━ CREDENTIALS ━━━━━━━━━━━━ */}
      <section className={styles.credSection} aria-labelledby="credentials-heading">
        <div className={styles.credBg} aria-hidden="true" />
        <div className={styles.credGlow} aria-hidden="true" />

        <div className="max-w-350 mx-auto px-4 md:px-8 relative">
          <div className={styles.credHeader}>
            <div className={styles.credHeaderLeft}>
              <p className={styles.credEyebrow}>
                <span className={styles.credEyebrowLine} aria-hidden="true" />
                Transparency &amp; Trust
              </p>
              <h2 id="credentials-heading" className={styles.credHeading}>
                Registered <span aria-hidden="true">&amp;</span>
                <span className="sr-only">and</span> Verified
              </h2>
            </div>
            <p className={styles.credSubtitle}>
              Official government registration and legal documentation — everything you need to know we&apos;re
              accountable.
            </p>
          </div>

          <ul className={styles.credCards}>
            {credentials.map((cred) => (
              <li key={cred.title} className={styles.credCard}>
                <div
                  className={styles.credCardAccent}
                  style={{ background: `linear-gradient(90deg, ${cred.accentColor}, transparent)` }}
                  aria-hidden="true"
                />

                <div className={styles.credIconBox} style={{ background: cred.iconBg }} aria-hidden="true">
                  <cred.icon size={24} color={cred.iconColor} />
                </div>

                <span className={styles.credCardNum} aria-hidden="true">
                  {cred.num}
                </span>
                <h3 className={styles.credCardTitle}>{cred.title}</h3>
                <p className={styles.credCardDesc}>{cred.desc}</p>

                <a
                  href={cred.href}
                  download={cred.download}
                  className={styles.credCardLink}
                  style={{ color: cred.linkColor }}
                  aria-label={`${cred.linkLabel} — ${cred.title}`}
                >
                  {cred.linkLabel}
                  <ArrowRight size={13} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ━━━━━━━━━━━━ CTA BAND ━━━━━━━━━━━━ */}
      <section className={styles.ctaBand} aria-labelledby="contact-cta-heading">
        <div className={styles.ctaBandGlow} aria-hidden="true" />
        <div className="max-w-350 mx-auto px-4 md:px-8">
          <div className={styles.ctaInner}>
            {/* Left: Statement */}
            <div className={styles.ctaLeft}>
              <div className={styles.ctaQuoteBar} aria-hidden="true">
                <span className={styles.ctaQuoteBarLine} />
                <span className={styles.ctaQuoteTag}>Quick Contact</span>
              </div>
              <h2 id="contact-cta-heading" className={styles.ctaStatement}>
                Have a quick <span className={styles.ctaStatementAccent}>question</span> for us?
              </h2>
              <p className={styles.ctaBody}>
                We&apos;re a small team, but we&apos;re responsive. Whether it&apos;s a simple question, a funding
                inquiry, or a media request — someone on the team will get back to you.
              </p>
            </div>

            {/* Right: Action Box */}
            <div className={styles.ctaRight}>
              <div className={styles.ctaRightBg} aria-hidden="true" />
              <div className="relative">
                <span className={styles.ctaEmailLabel}>Email us at</span>
                <a href="mailto:deessa.social@gmail.com" className={styles.ctaEmailVal}>
                  deessa.social@gmail.com
                </a>
                <div className={styles.ctaDivider} aria-hidden="true" />
                <nav className={styles.ctaActions} aria-label="Contact actions">
                  <a
                    href="mailto:deessa.social@gmail.com"
                    className={`${styles.ctaActionBtn} ${styles.ctaActionPrimary}`}
                    aria-label="Send email to Deesha Foundation"
                  >
                    <span className="flex items-center gap-2">
                      <Mail size={15} aria-hidden="true" />
                      Email Us Directly
                    </span>
                    <span className={styles.ctaActionIcon} aria-hidden="true">
                      <ArrowRight size={14} />
                    </span>
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
