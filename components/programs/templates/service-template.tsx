import type { Program, ProgramSection } from "@/lib/types/program-prototype"
import { ArrowDown, ArrowUpRight, Plus } from "lucide-react"
import { EditorialText, EditorialIcon } from "./editorial-parts"
import { SafeImage } from "../safe-image"
import base from "../demo/programs.module.css"

const service = base

interface ServiceTemplateProps {
  program: Program
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function findContent(sections: ProgramSection[], type: string): any {
  return sections.find((s) => s.type === type)?.content ?? null
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className={base.kicker}>{children}</div>
}

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className={base.sectionHeading}>
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2>
          <EditorialText text={title} />
        </h2>
      </div>
      {text && <p>{text}</p>}
    </div>
  )
}

function Photo({
  src,
  alt,
  focalPoint,
  className = "",
  priority = false,
}: {
  src: string
  alt: string
  focalPoint?: string
  className?: string
  priority?: boolean
}) {
  if (!src) return <div className={`${base.photo} ${className}`} />
  return (
    <div className={`${base.photo} ${className}`}>
      <SafeImage
        src={src}
        alt={alt}
        fill
        style={{ objectPosition: focalPoint || "center" }}
        sizes="(max-width: 760px) 100vw, 60vw"
        priority={priority}
      />
    </div>
  )
}

export function ServiceTemplate({ program }: ServiceTemplateProps) {
  const { hero, sections, eyebrow, shortDescription } = program

  const factsContent = findContent(sections, "facts_bar")
  const featuresContent = findContent(sections, "features")
  const howItWorksContent = findContent(sections, "how_it_works")
  const storyContent = findContent(sections, "story")
  const faqContent = findContent(sections, "faq")
  const ctaContent = findContent(sections, "cta")
  const statsContent = findContent(sections, "stats")
  const galleryContent = findContent(sections, "gallery")

  const facts: any[] = factsContent?.facts ?? []
  const featureItems: any[] = featuresContent?.features ?? []
  const steps: any[] = howItWorksContent?.steps ?? []
  const handwrittenNote: string | undefined = howItWorksContent?.handwrittenNote
  const faqItems: any[] = faqContent?.items ?? []
  const statItems: any[] = statsContent?.stats ?? []
  const galleryImages: any[] = galleryContent?.images ?? []

  const section = (type: string) => sections.find((s) => s.type === type)
  const featuresSection = section("features")
  const howItWorksSection = section("how_it_works")
  const storySection = section("story")
  const faqSection = section("faq")
  const ctaSection = section("cta")
  const statsSection = section("stats")
  const gallerySection = section("gallery")

  const sectionIntro = (value: ProgramSection | undefined) => value?.description || value?.subheading

  const heroImageUrl = hero.image || ""

  return (
    <div className={`${base.root} ${base.service}`}>
      {/* ─── HERO ─── */}
      <section className={`${base.container} ${service.serviceHero}`}>
        <div className={service.heroCopy}>
          <Eyebrow>
            <span className={service.tinyLine} />
            {eyebrow || "SERVICES & PROGRAMS"}
          </Eyebrow>
          <h1>
            <EditorialText text={hero.title || program.title} />
          </h1>
          <p>{hero.description || shortDescription}</p>
          {hero.cta && (
            <div className={base.actions}>
              <a className={base.button} href={hero.cta.url}>
                {hero.cta.label}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
              {hero.secondaryCta && (
                <a className={base.textLink} href={hero.secondaryCta.url}>
                  {hero.secondaryCta.label}
                  <ArrowDown size={17} aria-hidden="true" />
                </a>
              )}
            </div>
          )}
          {hero.note && (
            <div className={base.heroNote}>
              <EditorialIcon name={hero.note.icon} fallback="Heart" /> {hero.note.text}
            </div>
          )}
        </div>
        <div className={service.servicePortrait}>
          <Photo src={heroImageUrl} alt={hero.imageAlt || hero.title} focalPoint={hero.focalPoint} priority />
          {hero.sticker && (
            <span className={base.portraitSticker}>
              <EditorialIcon name={hero.sticker.icon} fallback="Sparkles" />{" "}
              {hero.sticker.text || "Every mind is a gift."}
            </span>
          )}
          {(hero.photoNote || hero.imageCaption) && (
            <div className={base.photoNote}>{hero.photoNote || hero.imageCaption}</div>
          )}
        </div>
      </section>

      {/* ─── FACTS BAR ─── */}
      {facts.length > 0 && (
        <div className={`${base.container} ${service.serviceFacts}`}>
          {facts.map((fact: any, i: number) => (
            <div key={i}>
              <span>{fact.label?.toUpperCase() || "INFO"}</span>
              <strong>{fact.value}</strong>
            </div>
          ))}
        </div>
      )}

      {/* ─── SUPPORT GRID (features) ─── */}
      {featureItems.length > 0 && (
        <section id="about" className={`${base.container} ${base.section}`}>
          <SectionTitle
            eyebrow={featuresSection?.heading || "WHAT WE OFFER"}
            title={featuresSection?.subheading || "More ways to support."}
            text={sectionIntro(featuresSection)}
          />
          <div className={base.supportGrid}>
            {featureItems.map((item: any, index: number) => (
              <article key={index}>
                {item.icon && (
                  <span className={service.serviceIcon}>
                    <EditorialIcon name={item.icon} />
                  </span>
                )}
                <span className={base.cardNumber}>0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ─── JOURNEY STEPS ─── */}
      {steps.length > 0 && (
        <section className={service.serviceJourney}>
          <div className={`${base.container} ${base.journeyGrid}`}>
            <div>
              <Eyebrow>{howItWorksSection?.heading || "HOW IT WORKS"}</Eyebrow>
              <h2>{howItWorksSection?.subheading || "We start where you are."}</h2>
              {howItWorksSection?.description && <p>{howItWorksSection.description}</p>}
              {handwrittenNote && <span className={base.handwritten}>{handwrittenNote}</span>}
            </div>
            <ol className={base.steps}>
              {steps.map((step: any, index: number) => (
                <li key={index}>
                  <span>0{index + 1}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ─── STORY ─── */}
      {storyContent && (
        <section className={`${base.container} ${base.storySection}`}>
          {storyContent.image && (
            <figure>
              <Photo
                src={storyContent.image}
                alt={storyContent.imageAlt || storyContent.person || "Story"}
                focalPoint={storyContent.focalPoint}
              />
              {storyContent.imageCaption && <figcaption>{storyContent.imageCaption}</figcaption>}
            </figure>
          )}
          <div>
            <Eyebrow>{storySection?.heading || "THE MOMENTS THAT MATTER"}</Eyebrow>
            {storyContent.quote && <blockquote>&ldquo;{storyContent.quote}&rdquo;</blockquote>}
            {storyContent.description && <p>{storyContent.description}</p>}
            {storyContent.person && (
              <span className={base.storyCredit}>
                {storyContent.person}
                {storyContent.role ? ` · ${storyContent.role}` : ""}
                {storyContent.location ? ` · ${storyContent.location}` : ""}
              </span>
            )}
            {storyContent.stats && storyContent.stats.length > 0 && (
              <div className={base.miniStats}>
                {storyContent.stats.map((stat: any, i: number) => (
                  <div key={i}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── FAQ ─── */}
      {faqItems.length > 0 && (
        <section id="support" className={`${base.container} ${base.faqSection}`}>
          <div>
            <Eyebrow>{faqSection?.heading || "FAQ"}</Eyebrow>
            <h2>{faqSection?.subheading || "A few things you might wonder."}</h2>
            {faqSection?.description && <p>{faqSection.description}</p>}
          </div>
          <div className={base.faqs}>
            {faqItems.map((item: any, i: number) => (
              <details key={i}>
                <summary>
                  {item.question}
                  <Plus size={20} aria-hidden="true" />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
      {ctaContent && (
        <section className={`${base.container} ${service.serviceCta}`}>
          <div>
            <Eyebrow>{ctaSection?.heading || "YOU DON'T HAVE TO FIGURE IT OUT ALONE"}</Eyebrow>
            <h2>{ctaContent.title || "Let's find your next small step."}</h2>
          </div>
          <div>
            {ctaContent.description && <p>{ctaContent.description}</p>}
            {ctaContent.buttons && ctaContent.buttons.length > 0 && (
              <a className={base.button} href={ctaContent.buttons[0].url}>
                {ctaContent.buttons[0].label}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            )}
          </div>
        </section>
      )}

      {/* ─── METRICS ─── */}
      {statItems.length > 0 && (
        <section className={`${base.container} ${base.metricSection}`}>
          <SectionTitle
            eyebrow={statsSection?.heading || "IMPACT"}
            title={statsSection?.subheading || "Small steps, visible change."}
            text={sectionIntro(statsSection)}
          />
          <div className={base.metricGrid}>
            {statItems.map((stat: any, i: number) => (
              <div className={base.metric} key={i}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── GALLERY ─── */}
      {galleryImages.length > 0 && (
        <section className={`${base.container} ${base.gallerySection}`}>
          <SectionTitle
            eyebrow={gallerySection?.heading || "GALLERY"}
            title={gallerySection?.subheading || "A glimpse of the work."}
            text={sectionIntro(gallerySection)}
          />
          <div className={base.galleryGrid}>
            {galleryImages.map((img: any, i: number) => (
              <figure key={i}>
                <Photo src={img.url || ""} alt={img.alt || "Gallery image"} focalPoint={img.focalPoint} />
                {img.caption && <figcaption>{img.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ─── RICH TEXT / OTHER ─── */}
      {sections.map((section) => {
        if (["facts_bar", "features", "how_it_works", "story", "faq", "cta", "stats", "gallery"].includes(section.type))
          return null
        if (section.type === "rich_text" && "body" in section.content) {
          return (
            <section key={section.id} className={`${base.container} ${base.section}`}>
              {section.heading && <SectionTitle eyebrow="" title={section.heading} />}
              <div dangerouslySetInnerHTML={{ __html: section.content.body }} />
            </section>
          )
        }
        return null
      })}
    </div>
  )
}
