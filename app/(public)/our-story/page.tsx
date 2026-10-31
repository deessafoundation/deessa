import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Brain, Eye, Flag, HandHeart, Heart, Lock, School, UserRoundX } from "lucide-react"
import { BrushStroke } from "@/components/ui/brush-stroke"
import { AnimatedBrushQuote } from "./AnimatedBrushQuote"
import { CircularTestimonials } from "@/components/shared/testimonials/circular-testimonials"

export const metadata: Metadata = {
  title: "Our Story: Why We Were Founded | deessa Foundation",
  description:
    "Every movement begins with a story. Ours began with two little girls, Deetya and Marissa, whose journeys inspired deessa Foundation's mission of inclusion for children with disabilities across Nepal.",
}

const challengeCards = [
  {
    icon: Lock,
    title: "Limited & Distant Care",
    description:
      "Even in Kathmandu, support was limited, expensive, and hard to reach. At times, we travelled to India just to find the right therapy.",
    accent: "text-primary",
  },
  {
    icon: UserRoundX,
    title: "Stigma & Misunderstanding",
    description:
      "Some told us to seek spiritual healing instead of professional care. Others said, “she'll grow out of it.” Well-meaning as they were, these responses only delayed understanding and made the journey more isolating.",
    accent: "text-empowerment",
  },
  {
    icon: School,
    title: "A Search for Belonging",
    description:
      "Before she turned seven, Marissa had attended five different schools. We weren't just looking for a school that would admit her, we were looking for one that would understand her.",
    accent: "text-chart-4",
  },
]

const storyPhotos = [
  {
    src: "/twins-newborn.jpg",
    alt: "The twins as newborns, lying side by side on a blanket in white onesies, one yawning with her arm raised.",
    name: "",
    designation: "",
    quote: "",
  },
  {
    src: "/twins-together.jpg",
    alt: "The twins as toddlers outdoors in matching light blue dresses, standing face to face in front of green bushes.",
    name: "",
    designation: "",
    quote: "",
  },
  {
    src: "/twins-dino.jpg",
    alt: "The twins crouching on the grass in matching blue \"Team Dino\" t-shirts, watching something on the ground.",
    name: "",
    designation: "",
    quote: "",
  },
  {
    src: "/twins-cheer.jpg",
    alt: "The twins in a playroom, raising their arms together during an activity, with books and an abacus behind them.",
    name: "",
    designation: "",
    quote: "",
  },
  {
    src: "/twins-curious.jpg",
    alt: "The twins at a table; one leans in to smell an orange fruit while her sister watches.",
    name: "",
    designation: "",
    quote: "",
  },
  {
    src: "/twin-solo-1.jpg",
    alt: "One of the twins outdoors, laughing with delight in a light blue dress and pink headband.",
    name: "",
    designation: "",
    quote: "",
  },
  {
    src: "/twin-solo-2.jpg",
    alt: "One of the twins outdoors, standing and looking at the camera in a light blue dress and pink headband.",
    name: "",
    designation: "",
    quote: "",
  },
]

const impact = [
  {
    icon: Brain,
    from: "From confusion",
    to: "to clarity",
    text: "Empowering families with knowledge and clear diagnostic paths.",
    color: "text-primary",
  },
  {
    icon: Heart,
    from: "From stigma",
    to: "to acceptance",
    text: "Promoting awareness and celebrating every unique ability.",
    color: "text-empowerment",
  },
  {
    icon: HandHeart,
    from: "From isolation",
    to: "to support",
    text: "Building networks of support so no family walks alone.",
    color: "text-chart-4",
  },
]

export default function OurStoryPage() {
  return (
    <div className="bg-background text-foreground">
      <section id="about" className="bg-surface px-6 py-24 md:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="relative">
              <div className="absolute -inset-3 -rotate-2 rounded-3xl bg-chart-4/20" aria-hidden />
              <Image
                src="/twins-hug.jpg"
                alt="Deetya and Marissa embracing"
                width={800}
                height={1000}
                className="relative w-full rounded-3xl object-cover shadow-xl"
              />
            </div>
          </div>

          <div className="order-1 space-y-7 lg:order-2">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">The Sisters who Sparked a Movement</h1>
            <div className="text-foreground-muted space-y-5 text-base leading-relaxed sm:text-lg">
              <p>
                Our twin daughters, <span className="font-bold text-primary">Deetya and Marissa</span>, were born on
                the same day. Their journeys unfolded very differently.
              </p>
              <p>
                Deetya was born with bilateral clubfoot. Since birth, she&apos;s gone through treatment and
                physiotherapy, and still wears specialized shoes. She&apos;s made remarkable progress, though some
                days are still hard. Her story reminds us that progress isn&apos;t about perfection. It&apos;s about
                perseverance, support, and opportunity.
              </p>
              <p>
                As the twins grew, we noticed Marissa was different. She struggled with eye contact, communication,
                and connecting with the world around her. After months of consultations, we finally had an answer:
                Marissa was diagnosed with autism.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-muted p-6">
                <p data-tts-ignore="" className="text-3xl font-bold text-primary">D</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Deetya</p>
              </div>
              <div className="rounded-2xl bg-muted p-6">
                <p data-tts-ignore="" className="text-3xl font-bold text-empowerment">M</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Marissa</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 max-w-2xl">
            <h2 className="text-3xl font-bold sm:text-4xl">Facing the Invisible Walls</h2>
            <p className="text-foreground-muted mt-4">
              We encountered obstacles that felt insurmountable at first, reflecting the struggles of thousands of families.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {challengeCards.map((card) => {
              const Icon = card.icon
              return (
                <article key={card.title} className="bg-surface rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-1">
                  <Icon className={`mb-5 size-8 ${card.accent}`} aria-hidden />
                  <h3 className="text-xl font-bold">{card.title}</h3>
                  <p className="text-foreground-muted mt-3 leading-relaxed">{card.description}</p>
                </article>
              )
            })}
          </div>

          <AnimatedBrushQuote />
        </div>
      </section>

      <section className="bg-surface px-6 py-28 text-center md:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
            “If it was this hard for our family ;
            <br className="hidden md:block" />
            with access to education, resources, and services ;
            <br className="hidden md:block" />
            what must it be like for a family in rural Nepal?”
          </h2>
          <div className="text-foreground-muted mt-10 space-y-2 text-lg md:text-xl">
            <p>No specialist nearby.</p>
            <p>No information.</p>
            <p>No guidance.</p>
            <p>No one to tell them they are not alone.</p>
          </div>
          <div className="bg-chart-4 mx-auto mt-10 h-1 w-24 rounded-full" />
          <p className="mx-auto mt-10 max-w-3xl text-lg leading-relaxed sm:text-xl">
            That question became our purpose. We founded{" "}
            <span className="font-bold text-primary">deessa Foundation</span> so that no parent has to walk this path
            alone, and no child is left behind because of where they&apos;re born or how they learn.
          </p>
        </div>
      </section>

      <section className="overflow-hidden bg-surface px-6 py-28 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-14 lg:flex-row lg:gap-16">
          <div className="flex-1 space-y-7">
            <h2 className="text-3xl font-bold sm:text-4xl">More Than a Name</h2>
            <p className="text-foreground-muted text-lg leading-relaxed">
              The name <span className="font-bold text-primary">deessa</span> carries this story. “Dee” from Deetya.
              “Ssa” from Marissa. And the Nepali word for “direction” , because every child and every family deserves
              guidance, dignity, and a path forward.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border-primary/25 rounded-3xl border p-7 text-center">
                <p data-tts-ignore="" className="text-5xl font-extrabold text-primary">dee</p>
                <p className="text-muted-foreground mt-2 text-xs uppercase tracking-[0.2em]">Deetya</p>
              </div>
              <div className="border-empowerment/35 rounded-3xl border p-7 text-center">
                <p data-tts-ignore="" className="text-5xl font-extrabold text-empowerment">ssa</p>
                <p className="text-muted-foreground mt-2 text-xs uppercase tracking-[0.2em]">Marissa</p>
              </div>
            </div>

            <div className="bg-muted flex items-center gap-5 rounded-3xl p-6">
              <div className="bg-primary/25 text-primary inline-flex size-14 items-center justify-center rounded-full">
                <Flag className="size-6" aria-hidden />
              </div>
              <div>
                <p className="text-xl font-bold">Direction</p>
                <p className="text-foreground-muted text-sm">Meaning of “deessa” in Nepali context</p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full flex justify-center">
            <CircularTestimonials
              testimonials={storyPhotos}
              autoplay
              showContent={false}
              imageHeight="26rem"
              colors={{
                arrowBackground: "rgb(var(--brand-primary))",
                arrowForeground: "#ffffff",
                arrowHoverBackground: "rgb(var(--brand-primary-dark))",
              }}
            />
          </div>
        </div>
      </section>

      <section id="mission" className="bg-muted px-6 py-24 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 md:gap-10">
          <article className="bg-surface border-primary rounded-3xl border-t-8 p-10 shadow-sm">
            <Flag className="text-primary mb-5 size-9" aria-hidden />
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p className="text-foreground-muted mt-5 text-lg leading-relaxed">
              To break down barriers for families navigating developmental and physical challenges by providing
              accessible healthcare, educational resources, and a community of unwavering support.
            </p>
          </article>

          <article className="bg-surface rounded-3xl border-t-8 border-[rgb(var(--accent-empowerment))] p-10 shadow-sm">
            <Eye className="text-empowerment mb-5 size-9" aria-hidden />
            <h2 className="text-3xl font-bold">Our Vision</h2>
            <p className="text-foreground-muted mt-5 text-lg leading-relaxed">
              A world where every child, regardless of ability or location, is seen, heard, and given the resources
              to lead a life of dignity and purpose.
            </p>
          </article>
        </div>
      </section>

      <section className="bg-surface px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">The Evolution of Impact</h2>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {impact.map((item, index) => {
              const Icon = item.icon
              return (
                <article key={item.from} className="group text-center">
                  <div className="relative mb-8 inline-block">
                    <div className="bg-muted text-muted-foreground inline-flex size-28 items-center justify-center rounded-full transition-colors group-hover:bg-accent sm:size-32">
                      <Icon className={`size-10 ${item.color}`} aria-hidden />
                    </div>
                    {index < impact.length - 1 && (
                      <ArrowRight className="text-border absolute -right-8 top-1/2 hidden size-7 -translate-y-1/2 md:block" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold">{item.from}</h3>
                  <p className="text-foreground-muted mt-3 px-4">{item.text}</p>
                  <p className={`mt-3 font-bold ${item.color}`}>{item.to}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-6 py-24 md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand-primary-dark px-6 py-14 text-center sm:px-10 sm:py-20">
          <div className="absolute inset-0 opacity-20">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDObnZb9aDESJ36lgucVDoXG4ikhozQiTrqeLRtpIdSNRy5igPnNFD8ELZKcR9IRcU7oz6dSPbFoFlYSveJqlZRa_tdqqAreV_NQge-Ryajr-weagx4XprOHVZSMsYBWn3MWeLouBUb-iUHWpm10ckFMO0_yjDlZuBNGSMmKcBSGm4z2a_EwG0Ip0KcNJE4xjLdnQQ4ER7OxQL1HNNa3NULGLGU1elM726TzK_JM0jKLIM3dnDDN4ah09-mbldfWlA_4HYp2h38IWY"
              alt="Hands nurturing a seedling"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
              Every child deserves
              <br />
              understanding.
              <br />
              Every family deserves
              <br />
              support.
            </h2>
            <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-white/85">
              What began as our family&apos;s journey has become a shared journey with thousands of children,
              families, and communities across Nepal. And this is only the beginning.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/get-involved"
                className="inline-flex items-center rounded-full bg-brand-primary px-8 py-3 text-sm font-bold text-white transition hover:bg-brand-primary-dark"
              >
                Join Us
                <ArrowRight className="ml-2 size-4" aria-hidden />
              </Link>
              <Link
                href="/donate"
                className="rounded-full bg-white px-8 py-3 text-sm font-bold text-brand-primary-dark transition hover:bg-surface"
              >
                Support Our Mission
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


