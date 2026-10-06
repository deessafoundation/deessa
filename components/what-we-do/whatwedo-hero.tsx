import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import styles from "./whatwedo-hero.module.css"

// Brand palette used by this hero
// Deep Ocean #0B5F8A · Ocean Blue #3FABDE · Yellow #F7C52B · Pink #D6336C · Pale Blue #E8F6FC

const heroPhotos = [
  {
    src: "/WhatWeDo/community_learning.jpg",
    alt: "Two women reviewing notes together in a notebook during an inclusive education workshop.",
    sizes: "(min-width: 1360px) 600px, (min-width: 768px) 46vw, 100vw",
    frame: "col-span-2 aspect-[16/10] max-[359px]:col-span-1 md:col-span-1 md:aspect-auto",
    crop: "object-[50%_35%]",
    eager: true,
  },
  {
    src: "/WhatWeDo/football_program.jpg",
    alt: "A girls' football team in red and white kits celebrating together with a trophy and medals on the pitch.",
    sizes: "(min-width: 1360px) 340px, (min-width: 768px) 26vw, 50vw",
    frame: "aspect-[4/5] md:aspect-auto",
    crop: "object-[48%_55%]",
    eager: false,
  },
  {
    src: "/WhatWeDo/speaker.jpg",
    alt: "A woman smiling as she speaks into a microphone while addressing an audience.",
    sizes: "(min-width: 1360px) 370px, (min-width: 768px) 28vw, 50vw",
    frame: "aspect-[4/5] md:aspect-auto",
    crop: "object-[40%_30%]",
    eager: false,
  },
]

const buttonBase = cn(
  "inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-[12px] border-[1.5px] border-[#0B5F8A] px-6",
  "font-comic text-[1.0625rem] font-bold transition-colors duration-200 sm:w-auto",
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3FABDE]/45 focus-visible:ring-offset-2",
)

export function WhatWeDoHero() {
  return (
    <section
      id="whatwedo-hero"
      aria-labelledby="whatwedo-hero-heading"
      className={cn(styles.hero, "relative w-full overflow-x-clip bg-white")}
    >
      <div className="mx-auto w-full max-w-[1360px] px-5 pt-8 pb-12 sm:px-8 md:pt-10 md:pb-14 lg:px-12 xl:px-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 md:mb-7">
          <ol className={cn(styles.breadcrumb, "flex items-center gap-2 font-comic text-[0.8125rem] text-[#1e293b]")}>
            <li>
              <Link
                href="/"
                className="rounded-sm hover:text-[#0B5F8A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3FABDE]"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page">Programs</li>
          </ol>
        </nav>

        {/* Eyebrow */}
        <p
          className={cn(
            styles.eyebrow,
            "mb-3 font-comic text-[0.8125rem] uppercase tracking-[0.2em] text-[#1672A6] sm:text-[0.875rem]",
          )}
        >
          MAKING A DIFFERENCE ACROSS NEPAL
        </p>

        {/* Introduction: heading left, copy + actions right */}
        <div className="grid grid-cols-1 items-center gap-7 md:gap-8 lg:grid-cols-[52fr_48fr] lg:gap-12 xl:gap-16">
          <h1
            id="whatwedo-hero-heading"
            className={cn(
              styles.heading,
              "font-marissa text-[#0B5F8A]",
              "text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[clamp(3.25rem,5vw,4.5rem)]",
              // Line-height must come after the font-size classes: tailwind-merge drops a
              // leading-* class when a later text-* size class is present.
              "leading-[1.08]",
              "[-webkit-text-stroke:0.5px_currentColor] lg:[-webkit-text-stroke:0.8px_currentColor]",
            )}
          >
            <span className="lg:block">
              Programs{" "}
              <span className="relative inline-block">
                That
                {/* Pink emphasis marks */}
                <svg
                  aria-hidden="true"
                  focusable="false"
                  viewBox="0 0 40 40"
                  className={cn(styles.decor, "pointer-events-none absolute -right-[0.46em] -top-[0.3em] h-[0.5em] w-[0.5em]")}
                >
                  <g fill="none" stroke="#D6336C" strokeLinecap="round" strokeWidth="3.5">
                    <path d="M7 17 L5 3" />
                    <path d="M13 23 L26 12" />
                    <path d="M17 33 L35 31" />
                  </g>
                </svg>
              </span>
            </span>{" "}
            <span className="lg:block">
              Change{" "}
              <span className={cn(styles.headingAccent, "relative inline-block text-[#3FABDE]")}>
                Lives.
                {/* Yellow underline */}
                <svg
                  aria-hidden="true"
                  focusable="false"
                  viewBox="0 0 200 20"
                  className={cn(styles.decor, "pointer-events-none absolute -bottom-[0.16em] left-[0.02em] h-[0.19em] w-[88%]")}
                >
                  <path
                    d="M4 14 C 48 7, 118 4, 196 9"
                    fill="none"
                    stroke="#F7C52B"
                    strokeLinecap="round"
                    strokeWidth="5.5"
                  />
                </svg>
              </span>
            </span>
          </h1>

          <div className="lg:pr-6 xl:pr-0">
            <p
              className={cn(
                styles.description,
                "max-w-[34rem] font-comic text-[1.125rem] leading-[1.6] text-[#334155] xl:text-[1.25rem]",
              )}
            >
              From classrooms in Karnali to clinics in the Terai, our work brings sustainable education, healthcare, and
              empowerment reaching Nepal&apos;s most remote communities.
            </p>

            <div className="mt-6 flex flex-col gap-3.5 sm:flex-row sm:flex-wrap md:mt-7">
              <a
                href="#programs"
                data-slot="button"
                data-variant="default"
                className={cn(styles.primaryBtn, buttonBase, "bg-[#0B5F8A] text-white hover:border-[#094E72] hover:bg-[#094E72]")}
              >
                Explore Programs <span aria-hidden="true">↓</span>
              </a>
              <Link
                href="/donate"
                data-slot="button"
                data-variant="outline"
                className={cn(styles.secondaryBtn, buttonBase, "bg-white text-[#0B5F8A] hover:bg-[#E8F6FC]")}
              >
                Donate to a Program <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Photo strip */}
        <div className="relative mt-10 lg:mt-12">
          {/* Pale-blue backing, top left */}
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 400 300"
            preserveAspectRatio="none"
            className={cn(styles.decor, "pointer-events-none absolute -left-5 -top-4 h-[82%] w-[44%] sm:-left-8 sm:-top-5")}
          >
            <path
              d="M38 6 C 120 -4, 250 10, 330 8 C 380 7, 398 40, 396 90 C 394 170, 400 240, 360 280 C 300 300, 120 296, 50 290 C 12 286, 2 250, 4 190 C 6 120, -4 60, 10 30 C 16 16, 26 8, 38 6 Z"
              fill="#E8F6FC"
            />
          </svg>

          {/* Pale-blue backing, bottom right */}
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 300 260"
            preserveAspectRatio="none"
            className={cn(styles.decor, "pointer-events-none absolute -bottom-4 -right-4 h-[72%] w-[30%] sm:-bottom-5 sm:-right-6")}
          >
            <path
              d="M60 10 C 140 2, 230 6, 270 20 C 296 32, 298 80, 296 140 C 294 200, 300 240, 262 254 C 200 262, 110 258, 50 252 C 14 246, 4 214, 6 160 C 8 100, 2 50, 20 26 C 30 14, 44 11, 60 10 Z"
              fill="#E8F6FC"
            />
          </svg>

          {/* Thin decorative curve, bottom right */}
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 300 200"
            preserveAspectRatio="none"
            className={cn(styles.decor, "pointer-events-none absolute -bottom-8 -right-3 h-[58%] w-[26%] sm:-right-8 md:-bottom-10")}
          >
            <path
              d="M6 192 C 110 190, 214 162, 294 34"
              fill="none"
              stroke="#3FABDE"
              strokeOpacity="0.55"
              strokeLinecap="round"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div
            className={cn(
              "relative z-10 grid grid-cols-2 gap-3 max-[359px]:grid-cols-1 sm:gap-3.5",
              "md:h-[280px] md:grid-cols-[46fr_26fr_28fr] md:gap-3.5 lg:h-[320px] lg:gap-4 xl:h-[350px]",
            )}
          >
            {heroPhotos.map((photo) => (
              <figure
                key={photo.src}
                className={cn(styles.photo, "relative m-0 overflow-hidden rounded-[20px] bg-[#E8F6FC]", photo.frame)}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes={photo.sizes}
                  loading={photo.eager ? "eager" : "lazy"}
                  fetchPriority={photo.eager ? "high" : "auto"}
                  className={cn("object-cover", photo.crop)}
                />
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
