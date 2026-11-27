"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Users,
  Globe,
  Briefcase,
  Heart,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Stethoscope,
  Smile,
  ShieldCheck,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { VolunteerForm } from "@/components/volunteer/volunteer-form"
import styles from "./volunteers-page.module.css"

const VOLUNTEER_ROLES = [
  {
    title: "Field Education Mentor",
    location: "Nepal (On-site)",
    commitment: "2 to 4 weeks minimum",
    department: "Education Programs",
    description:
      "Support rural classrooms, conduct after-school literacy workshops, and mentor students with inclusive learning aids.",
    icon: GraduationCap,
  },
  {
    title: "Healthcare Camp Volunteer",
    location: "Rural Nepal (Field)",
    commitment: "1 to 2 weeks per camp",
    department: "Healthcare Initiatives",
    description:
      "Assist doctors and paramedics during free medical camps, triage patients, manage records, and provide basic health hygiene guidance.",
    icon: Stethoscope,
  },
  {
    title: "Remote Digital & Tech Contributor",
    location: "Global / Remote",
    commitment: "4 to 8 hours / week",
    department: "IT & Technology",
    description:
      "Empower our mission from anywhere by assisting with open-source development, website maintenance, graphic design, and data workflows.",
    icon: Globe,
  },
  {
    title: "Youth & Community Coordinator",
    location: "Kathmandu & Terai",
    commitment: "Flexible / Part-time",
    department: "Community Development",
    description:
      "Organize community awareness campaigns, coordinate food or relief drives, and facilitate interactive youth engagement workshops.",
    icon: Users,
  },
  {
    title: "Creative Arts & Storytelling Advocate",
    location: "Hybrid / Remote",
    commitment: "Project-based",
    department: "Arts & Storytelling",
    description:
      "Help document stories of resilience, capture high-quality photo essays, assist with podcasts, and translate inspiring community voices.",
    icon: Sparkles,
  },
  {
    title: "Disaster Preparedness & Relief Assistant",
    location: "Nepal (Rapid Deployment)",
    commitment: "On-call / Scheduled",
    department: "Disaster Relief",
    description:
      "Support emergency supply logistics, distribution mapping, and post-crisis relief coordination for vulnerable communities.",
    icon: ShieldCheck,
  },
]

const STEPS = [
  {
    stepNumber: "S.No 1",
    title: "Submit Your Application",
    description:
      "Fill out the short online form selecting your skills, availability, and areas of passionate interest.",
  },
  {
    stepNumber: "S.No 2",
    title: "Coordinator Review",
    description:
      "Our team reviews your submission and connects with you for an introductory alignment conversation.",
  },
  {
    stepNumber: "S.No 3",
    title: "Orientation & Training",
    description:
      "Receive our comprehensive orientation pack, meet your program mentors, and review safety guidelines.",
  },
  {
    stepNumber: "S.No 4",
    title: "Create Tangible Impact",
    description:
      "Begin your assignment on the ground or remotely, making a measurable positive difference every day.",
  },
]

const FAQS = [
  {
    question: "Do I need prior volunteer or NGO experience to apply?",
    answer:
      "No! We welcome passionate individuals from all backgrounds. Whether you are a student, skilled professional, or retiree, we match you with roles that leverage your natural strengths and interests.",
  },
  {
    question: "Are international volunteers welcome in Nepal?",
    answer:
      "Yes. International volunteers are warmly welcomed for our on-site field programs. Our team provides pre-arrival orientation, guidance on local travel and accommodations, and 24/7 on-the-ground support.",
  },
  {
    question: "Can I volunteer remotely from outside Nepal?",
    answer:
      "Absolutely. We have active remote volunteer cohorts contributing to translation, digital design, software engineering, curriculum development, and outreach coordination.",
  },
  {
    question: "Will I receive a certificate of completion?",
    answer:
      "Yes. All volunteers who complete their agreed commitment receive an official Certificate of Service from Deesha Foundation detailing their project hours and contributions.",
  },
]

export function VolunteersPageClient() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined)

  const handleOpenModal = (roleTitle?: string) => {
    setSelectedRole(roleTitle)
    setModalOpen(true)
  }

  return (
    <>
      {/* 1. Hero Section */}
      <section className={styles.heroSection} aria-labelledby="volunteer-hero-heading">
        <div className="max-w-5xl mx-auto text-center px-4">
          <div className={styles.heroBadge}>
            <Heart className="size-3.5 fill-current" />
            <span>Grassroots Volunteer Network</span>
          </div>

          <h1
            id="volunteer-hero-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight max-w-3xl mx-auto leading-tight"
          >
            Volunteer With Us to Empower Communities in Nepal
          </h1>

          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your compassion, professional skills, and time can change lives. Join our vibrant team of local and
            international volunteers working together for inclusive education, healthcare, and sustainable community growth.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => handleOpenModal()}
              className="rounded-full h-11 px-7 font-bold shadow-md hover:shadow-lg transition-shadow"
            >
              <Sparkles className="size-4 mr-2" />
              <span>Apply to Volunteer Now</span>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full h-11 px-7 font-semibold"
            >
              <Link href="#roles">
                <span>Explore Open Roles</span>
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Impact KPI Strip */}
      <section className="py-12 bg-muted/20 border-b border-border" aria-label="Volunteer impact metrics">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={styles.statCard}>
            <div className={styles.statValue}>250+</div>
            <div className={styles.statLabel}>Dedicated Volunteers</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>18+</div>
            <div className={styles.statLabel}>Districts Reached</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>12,500+</div>
            <div className={styles.statLabel}>Lives Directly Impacted</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>100%</div>
            <div className={styles.statLabel}>Grassroots Driven</div>
          </div>
        </div>
      </section>

      {/* 3. Open Volunteer Opportunities */}
      <section id="roles" className="py-16 md:py-20 max-w-6xl mx-auto px-4" aria-labelledby="roles-heading">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 id="roles-heading" className="text-2xl sm:text-3xl font-bold text-foreground">
            Current Volunteer Opportunities
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Discover where your unique talents can make the deepest tangible difference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {VOLUNTEER_ROLES.map((role) => {
            const Icon = role.icon
            return (
              <div key={role.title} className={styles.roleCard}>
                <div className={styles.roleIconBox}>
                  <Icon className="size-6" />
                </div>

                <div className="mb-2">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
                    {role.department}
                  </span>
                  <h3 className="text-lg font-bold text-foreground mt-0.5">{role.title}</h3>
                </div>

                <div className="flex flex-wrap gap-1.5 my-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium border border-border">
                    {role.location}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium border border-border">
                    {role.commitment}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed flex-1 mt-2">
                  {role.description}
                </p>

                <div className="pt-5 mt-auto border-t border-border/50">
                  <Button
                    variant="outline"
                    className="w-full rounded-full h-9 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleOpenModal(role.title)}
                  >
                    <span>Apply for this Role</span>
                    <ArrowRight className="size-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. Journey & Process (Explicit S.No sequence) */}
      <section className="py-16 bg-muted/20 border-y border-border" aria-labelledby="process-heading">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 id="process-heading" className="text-2xl sm:text-3xl font-bold text-foreground">
              How the Volunteer Journey Works
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A transparent, structured pathway from application to field deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step) => (
              <div
                key={step.stepNumber}
                className="bg-card border border-border rounded-xl p-5 shadow-2xs relative flex flex-col"
              >
                <div className="inline-block px-2.5 py-0.5 rounded-md bg-primary/10 text-primary font-mono text-xs font-bold w-fit mb-3">
                  {step.stepNumber}
                </div>
                <h3 className="text-base font-bold text-foreground mb-1.5">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQs Section */}
      <section className="py-16 md:py-20 max-w-4xl mx-auto px-4" aria-labelledby="faqs-heading">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 id="faqs-heading" className="text-2xl sm:text-3xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Have questions about volunteering with Deesha Foundation? Find answers below.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => (
            <details key={index} className={`${styles.faqCard} group cursor-pointer`}>
              <summary className="flex items-center justify-between text-sm sm:text-base font-bold text-foreground list-none select-none py-1">
                <span>{faq.question}</span>
                <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180 flex-shrink-0 ml-3" />
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 6. Closing Call to Action */}
      <section className="py-16 bg-muted/40 border-t border-border" aria-labelledby="cta-heading">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 id="cta-heading" className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Ready to Begin Your Volunteer Journey?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Take the first step today. It only takes two minutes to register your interest and join our changemaker community.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => handleOpenModal()}
              className="rounded-full h-11 px-8 font-bold"
            >
              <span>Get Started Now</span>
              <ArrowRight className="size-4 ml-2" />
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full h-11 px-6 font-semibold"
            >
              <Link href="/contact">
                <span>Contact Volunteer Team</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Volunteer Modal Form */}
      <VolunteerForm
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedRole(undefined)
        }}
        roleTitle={selectedRole}
      />
    </>
  )
}
