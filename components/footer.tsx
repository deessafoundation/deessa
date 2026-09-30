"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, Mail, MapPin, Phone, Target, GraduationCap, HeartHandshake, Shield, Users, FileText, Award, Calendar, Download, CheckCircle, Briefcase, Camera, Archive, UserPlus, Handshake, Accessibility, ArrowRight } from "lucide-react"
import { NewsletterForm } from "@/components/newsletter-form"
import { Facebook, Twitter, Instagram, Youtube } from "@/components/social-icons"

const footerLinks = {
  about: [
    { label: "Our Mission", href: "/about", icon: Target },
    { label: "Our Story", href: "/our-story", icon: Heart },
    { label: "Our Team", href: "/about#team", icon: Users },
    { label: "Partners", href: "/about#partners", icon: HeartHandshake },
    { label: "Press & Media", href: "/press", icon: FileText },
    { label: "Annual Reports", href: "/impact#reports", icon: Award },
    { label: "Autism Programs", href: "/whatwedo?category=autism", icon: Heart },
    { label: "Careers", href: "/about#careers", icon: Briefcase },
  ],
  programs: [
    { label: "Education", href: "/whatwedo?category=education", icon: GraduationCap },
    { label: "Healthcare", href: "/whatwedo?category=health", icon: Heart },
    { label: "Women Empowerment", href: "/whatwedo?category=empowerment", icon: Users },
    { label: "Disaster Relief", href: "/whatwedo?category=relief", icon: Shield },
    { label: "Art Workshop", href: "/whatwedo?category=art", icon: Camera },
    { label: "Training Programs", href: "/whatwedo?category=training", icon: GraduationCap },
  ],
  getInvolved: [
    { label: "Donate", href: "/donate", icon: Heart },
    { label: "Volunteer", href: "/get-involved#volunteer", icon: HeartHandshake },
    { label: "Become a Member", href: "/get-involved#member", icon: Users },
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Sponsor a Child", href: "/get-involved#sponsor", icon: UserPlus },
    { label: "Corporate Partnership", href: "/get-involved#corporate", icon: Handshake },
  ],
  resources: [
    { label: "Accessibility", href: "#accessibility", icon: Accessibility, isAccessibility: true },
    { label: "Brand Guidelines", href: "/deesa-resources/Deessa Brand Guidelines.pdf", download: true, icon: Download },
    { label: "Organization Bio", href: "/deesa-resources/deessa Foundation_ Short Bio -2.pdf", download: true, icon: Download },
    { label: "SWC Certificate", href: "/deesa-resources/SWC.jpg", download: true, icon: Download },
    { label: "Contact Us", href: "/contact", icon: Mail },
    { label: "Photo Gallery", href: "/impact#gallery", icon: Camera },
    { label: "Arts", href: "/arts", icon: Camera },
    { label: "Newsletter Archive", href: "/newsletter-archive", icon: Archive },
  ],
}

const socialLinks = [
  {
    icon: Facebook,
    href: "https://www.facebook.com/deessaFoundation",
    label: "Facebook"
  },
  {
    icon: Twitter,
    href: "#",
    label: "Twitter",
    isAlert: true
  },
  {
    icon: Instagram,
    href: "https://www.instagram.com/deessa.foundation?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
    label: "Instagram"
  },
  {
    icon: Youtube,
    href: "https://www.youtube.com/@deessaFoundation",
    label: "YouTube"
  },
]

/* Presentation-only lookups (data above is untouched) */
const socialBrandClass: Record<string, string> = {
  Facebook: "bg-[#1877F2]",
  Instagram: "bg-gradient-to-br from-[#F9CE34] via-[#EE2A7B] to-[#6228D7]",
  YouTube: "bg-[#FF0000]",
  Twitter: "bg-[#1DA1F2]",
}

/* Solid glyphs — the design calls for filled icons and lucide ships outline only. */
function SolidEnvelope({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2 6.6 12 12.2 22 6.6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M22 9 12 14.6 2 9V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z" />
    </svg>
  )
}

function SolidCalendar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 2v2h8V2h2v2h1.5A2.5 2.5 0 0 1 22 6.5V9H2V6.5A2.5 2.5 0 0 1 4.5 4H6V2Z" />
      <path d="M2 11h20v8.5A2.5 2.5 0 0 1 19.5 22h-15A2.5 2.5 0 0 1 2 19.5Z" />
    </svg>
  )
}

function SolidPeopleGroup({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <circle cx="12" cy="6.6" r="3.1" />
      <circle cx="4.6" cy="8.8" r="2.4" />
      <circle cx="19.4" cy="8.8" r="2.4" />
      <path d="M12 11.3c-3.2 0-5.7 2-5.7 4.8V20h11.4v-3.9c0-2.8-2.5-4.8-5.7-4.8Z" />
      <path d="M4.6 12.4c-2.4 0-4.1 1.6-4.1 3.6V20h4.4v-3.9c0-1.3.3-2.5 1-3.5a5 5 0 0 0-1.3-.2Z" />
      <path d="M19.4 12.4c-.4 0-.9.06-1.3.2.7 1 1 2.2 1 3.5V20h4.4v-4c0-2-1.7-3.6-4.1-3.6Z" />
    </svg>
  )
}

/* Two-tone green/blue shield with a white check. */
function ShieldCheckTwoTone({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <clipPath id="footer-shield-clip">
          <path d="M12 1.8 3.6 4.9v6.3c0 5.2 3.5 9.2 8.4 10.9 4.9-1.7 8.4-5.7 8.4-10.9V4.9Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#footer-shield-clip)">
        <rect x="0" y="0" width="12" height="24" fill="var(--shield-green)" />
        <rect x="12" y="0" width="12" height="24" fill="var(--shield-blue)" />
      </g>
      <path
        d="M7.9 12.2 10.8 15.1 16.2 9.4"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const newsletterBenefits = [
  { icon: SolidEnvelope, label: "Monthly impact reports" },
  { icon: SolidCalendar, label: "Upcoming events & programs" },
  { icon: SolidPeopleGroup, label: "Stories from the field" },
]

const contactItems = [
  { icon: MapPin, srLabel: "Location", value: "Dhobighat Nayabato, Sanepa, Lalitpur 44600, Nepal" },
  { icon: Mail, srLabel: "Email", value: "deessa.social@gmail.com" },
  { icon: Phone, srLabel: "Phone", value: "+977 1-4123456" },
]

const linkColumns = [
  { title: "About", links: footerLinks.about },
  { title: "Programs", links: footerLinks.programs },
  { title: "Get Involved", links: footerLinks.getInvolved },
  { title: "Resources", links: footerLinks.resources },
]

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Sitemap", href: "/sitemap" },
]

export function Footer() {
  const [clickCount, setClickCount] = useState(0)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handler for opening accessibility panel
  const handleAccessibilityClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // Dispatch custom event to open accessibility panel
    const event = new CustomEvent('openAccessibilityPanel')
    window.dispatchEvent(event)
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()

    const newCount = clickCount + 1

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }

    if (newCount === 3) {
      window.open("/admin", "_blank", "noopener,noreferrer")
      setClickCount(0)
    } else {
      setClickCount(newCount)

      clickTimeoutRef.current = setTimeout(() => {
        if (newCount === 1) {
          window.location.href = "/"
        }
        setClickCount(0)
      }, 1000)
    }
  }

  const handleTwitterClick = () => {
    alert("🐦 We'll be on Twitter Soon! 🌟\n\nWe're excited to connect with you on Twitter!\nIn the meantime, follow us on our other social platforms to stay updated with our latest work and impact stories.\n\n💙 Thank you for your support!")
  }

  const socialButtonClass =
    "flex size-11 items-center justify-center rounded-full text-white transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-footer-blue sm:size-9"

  return (
    <footer className="font-comic bg-footer-blue text-white">
      {/* ================= NEWSLETTER STRIP ================= */}
      <section aria-labelledby="footer-newsletter-heading" className="bg-newsletter-bg">
        <div className="mx-auto grid max-w-[1500px] gap-7 px-8 py-7 sm:px-12 lg:grid-cols-3 lg:gap-0 lg:px-[8%]">
          {/* Column 1 — Stay Connected */}
          <div className="lg:pr-7">
            <h2 id="footer-newsletter-heading" className="font-comic text-center text-[1.6rem] font-bold leading-none text-newsletter-heading lg:text-left">
              Stay Connected
            </h2>
            <p className="font-comic mt-2 max-w-[19rem] text-[13px] leading-relaxed text-newsletter-body sm:text-[0.7rem] sm:leading-snug">
              Get the latest updates on our impact, upcoming events, and new ways to make a difference in rural Nepal.
            </p>

            <ul className="mt-3 space-y-2">
              {newsletterBenefits.map((benefit) => {
                const BenefitIcon = benefit.icon
                return (
                  <li key={benefit.label} className="flex items-center gap-3">
                    <BenefitIcon className="size-[1.15rem] shrink-0 text-newsletter-heading" />
                    <span className="font-comic text-[13px] text-newsletter-label sm:text-[0.72rem]">{benefit.label}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Column 2 — Subscribe */}
          <div className="lg:border-l lg:border-newsletter-rule lg:px-7">
            <h3 className="font-comic text-center text-[0.95rem] font-bold text-newsletter-navy lg:text-left">
              Join 2,400+ supporters
            </h3>

            <div className="mt-2.5">
              <NewsletterForm variant="footer" />
            </div>

            <p className="font-comic mt-2 text-xs text-newsletter-body sm:text-[0.62rem]">
              No spam. Unsubscribe anytime.
            </p>
          </div>

          {/* Column 3 — Transparency */}
          <div className="lg:border-l lg:border-newsletter-rule lg:pl-7">
            <div className="flex flex-col items-center gap-3 lg:flex-row lg:items-start">
              <ShieldCheckTwoTone className="size-7 shrink-0" />
              <div className="w-full">
                <h3 className="font-comic text-center text-[0.8rem] font-bold text-newsletter-navy lg:text-left">100% Transparent</h3>
                <p className="font-comic mt-1 w-full text-[13px] leading-relaxed text-newsletter-body sm:text-[0.7rem] sm:leading-snug">
                  We believe in complete financial transparency. Every rupee you donate or track through our reports goes directly toward empowering rural communities in Nepal.
                </p>
                <Link
                  href="/impact"
                  className="font-comic mt-2 inline-flex min-h-11 items-center gap-1.5 text-[13px] font-semibold text-newsletter-heading transition-colors duration-200 hover:text-newsletter-subscribe focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-newsletter-heading focus-visible:ring-offset-2 sm:min-h-0 sm:text-[0.7rem]"
                >
                  Explore our financials
                  <ArrowRight className="size-3" strokeWidth={2.75} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MAIN FOOTER ================= */}
      <div className="mx-auto max-w-[1400px] px-6 py-10 text-center md:px-10 md:text-left">
        <div className="grid grid-cols-2 justify-items-center gap-8 md:grid-cols-4 md:justify-items-stretch xl:grid-cols-[1.15fr_1fr_repeat(4,0.85fr)]">
          {/* Logo + mission */}
          <div className="col-span-2 md:col-span-4 xl:col-span-1">
            <Link href="/" onClick={handleLogoClick} className="inline-block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <Image
                src="/logo.png"
                alt="deessa Foundation"
                width={290}
                height={100}
                className="h-12 w-auto"
                priority={false}
              />
            </Link>

            <h2 className="font-comic mt-5 text-sm font-bold text-white">Our Mission</h2>
            <p className="font-comic mt-2 max-w-xs text-sm leading-relaxed text-footer-muted sm:text-xs">
              Empowering communities in rural Nepal through sustainable education, healthcare, and livelihood
              initiatives since 2022.
            </p>
            <p className="font-comic mt-3 border-l-2 border-white/40 pl-3 text-sm italic text-footer-muted sm:text-xs">
              Making a difference, one community at a time.
            </p>

            <ul className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
              <li className="font-comic inline-flex items-center gap-1.5 rounded-full border border-white/25 px-2.5 py-1 text-[10px] text-footer-muted">
                <Award className="size-3" aria-hidden="true" />
                Govt Registered NGO since 2022
              </li>
              <li className="font-comic inline-flex items-center gap-1.5 rounded-full border border-white/25 px-2.5 py-1 text-[10px] text-footer-muted">
                <CheckCircle className="size-3" aria-hidden="true" />
                SWC Affiliated
              </li>
            </ul>
          </div>

          {/* Get in Touch */}
          <div className="col-span-2 md:col-span-4 xl:col-span-1">
            <h2 className="font-comic text-sm font-bold text-white">Get in Touch</h2>
            <ul className="mt-4 space-y-3">
              {contactItems.map((item) => {
                const ContactIcon = item.icon
                return (
                  <li key={item.srLabel} className="flex items-start justify-center gap-2.5 md:justify-start">
                    <ContactIcon className="mt-px size-4 shrink-0 text-white/90" strokeWidth={1.75} aria-hidden="true" />
                    <p className="font-comic text-[13px] leading-relaxed text-footer-muted sm:text-xs">
                      <span className="sr-only">{item.srLabel}: </span>
                      {item.value}
                    </p>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Link columns */}
          {linkColumns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="w-full">
              <h2 className="font-comic text-sm font-bold text-white">{column.title}</h2>
              <ul className="mt-4 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {"download" in link && link.isAccessibility ? (
                      <button
                        onClick={handleAccessibilityClick}
                        className="flex items-center gap-2 text-gray-400 text-sm hover:text-primary transition-all duration-200 group w-full text-left"
                        aria-label="Open Accessibility Settings"
                      >
                        <IconComponent className="size-3.5 opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all" />
                        <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                      </button>
                    ) : link.download ? (
                      <a
                        href={link.href}
                        download
                        className="font-comic inline-flex min-h-8 items-center rounded text-[13px] text-footer-muted transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:min-h-0 sm:text-xs"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="font-comic inline-flex min-h-8 items-center rounded text-[13px] text-footer-muted transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:min-h-0 sm:text-xs"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Hairline with heart marker */}
        <div className="relative mt-10 flex items-center justify-center" aria-hidden="true">
          <div className="h-px w-full bg-footer-rule" />
          <span className="absolute flex size-7 items-center justify-center rounded-full bg-footer-blue">
            <Heart className="size-3.5 fill-white/80 text-white/80" />
          </span>
        </div>

        {/* Copyright */}
        <p className="font-comic mt-5 text-center text-[11px] text-footer-muted">
          © {new Date().getFullYear()} deessa Foundation. All rights reserved.
        </p>
              <div className="h-4 w-px bg-gray-700 hidden sm:block"></div>
              <p className="text-gray-500 text-xs text-center sm:text-left">
                Accessibility powered by <a href="https://opendyslexic.org/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors underline">OpenDyslexic</a>
              </p>

        {/* Socials + legal */}
        <div className="mt-4 grid grid-cols-1 items-center justify-items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-self-start">
            <nav aria-label="Follow our journey" className="flex items-center gap-2.5">
              {socialLinks.map((social) => (
                social.isAlert ? (
                  <button
                    key={social.label}
                    type="button"
                    onClick={handleTwitterClick}
                    className={`${socialButtonClass} ${socialBrandClass[social.label]}`}
                    aria-label={social.label}
                  >
                    <social.icon className="size-4" aria-hidden="true" />
                  </button>
                ) : (
                  <Link
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${socialButtonClass} ${socialBrandClass[social.label]}`}
                    aria-label={social.label}
                  >
                    <social.icon className="size-4" aria-hidden="true" />
                  </Link>
                )
              ))}
            </nav>
          </div>

          <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 md:col-start-2">
            {legalLinks.map((link, index) => (
              <span key={link.href} className="flex items-center gap-x-3">
                <Link
                  href={link.href}
                  className="font-comic rounded text-[11px] text-footer-muted transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {link.label}
                </Link>
                <span aria-hidden="true" className="text-white/35">|</span>
                {index === legalLinks.length - 1 && (
                  <Link
                    href="/admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-comic rounded text-[11px] text-footer-muted transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    Admin
                  </Link>
                )}
              </span>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
