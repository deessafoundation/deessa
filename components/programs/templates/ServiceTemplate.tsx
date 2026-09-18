import type { Program, ProgramSection } from '@/lib/types/program-prototype'
import Image from 'next/image'
import { ArrowDown, ArrowUpRight, Heart, Plus, Sparkles } from 'lucide-react'
import s from '../demo/program-demo.module.css'

interface ServiceTemplateProps {
  program: Program
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function findContent(sections: ProgramSection[], type: string): any {
  return sections.find((s) => s.type === type)?.content ?? null
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className={s.kicker}>{children}</div>
}

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className={s.sectionHeading}>
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2>{title}</h2>
      </div>
      {text && <p>{text}</p>}
    </div>
  )
}

function Photo({ src, alt, className = '', priority = false }: { src: string; alt: string; className?: string; priority?: boolean }) {
  if (!src) return <div className={`${s.photo} ${className}`} />
  return (
    <div className={`${s.photo} ${className}`}>
      <Image src={src} alt={alt} fill sizes="(max-width: 760px) 100vw, 60vw" priority={priority} />
    </div>
  )
}

export function ServiceTemplate({ program }: ServiceTemplateProps) {
  const { hero, sections, eyebrow, shortDescription } = program

  const factsContent = findContent(sections, 'facts_bar')
  const featuresContent = findContent(sections, 'features')
  const howItWorksContent = findContent(sections, 'how_it_works')
  const storyContent = findContent(sections, 'story')
  const faqContent = findContent(sections, 'faq')
  const ctaContent = findContent(sections, 'cta')
  const statsContent = findContent(sections, 'stats')
  const galleryContent = findContent(sections, 'gallery')

  const facts: any[] = factsContent?.facts ?? []
  const featureItems: any[] = featuresContent?.features ?? []
  const steps: any[] = howItWorksContent?.steps ?? []
  const handwrittenNote: string | undefined = howItWorksContent?.handwrittenNote
  const faqItems: any[] = faqContent?.items ?? []
  const statItems: any[] = statsContent?.stats ?? []
  const galleryImages: any[] = galleryContent?.images ?? []

  const section = (type: string) => sections.find((s) => s.type === type)
  const factsBarSection = section('facts_bar')
  const featuresSection = section('features')
  const howItWorksSection = section('how_it_works')
  const storySection = section('story')
  const faqSection = section('faq')
  const ctaSection = section('cta')
  const statsSection = section('stats')
  const gallerySection = section('gallery')

  const heroImageUrl = hero.image || ''

  return (
    <div className={`${s.root} ${s.service}`}>
      {/* ─── HERO ─── */}
      <section className={`${s.container} ${s.serviceHero}`}>
        <div className={s.heroCopy}>
          <Eyebrow>
            <span className={s.tinyLine} />
            {eyebrow || 'SERVICES & PROGRAMS'}
          </Eyebrow>
          <h1>{hero.title || program.title}</h1>
          <p>{hero.description || shortDescription}</p>
          {hero.cta && (
            <div className={s.actions}>
              <a className={s.button} href={hero.cta.url}>{hero.cta.label}<ArrowUpRight size={18} aria-hidden="true" /></a>
              {hero.secondaryCta && (
                <a className={s.textLink} href={hero.secondaryCta.url}>{hero.secondaryCta.label}<ArrowDown size={17} aria-hidden="true" /></a>
              )}
            </div>
          )}
          {hero.note && (
            <div className={s.heroNote}>
              <Heart size={18} aria-hidden="true" /> {hero.note.text}
            </div>
          )}
        </div>
        <div className={s.servicePortrait}>
          <Photo src={heroImageUrl} alt={hero.imageAlt || hero.title} priority />
          {hero.sticker && (
            <span className={s.portraitSticker}>
              <Sparkles size={22} aria-hidden="true" /> {hero.sticker.text || 'Every mind is a gift.'}
            </span>
          )}
          {hero.photoNote && <div className={s.photoNote}>{hero.photoNote}</div>}
        </div>
      </section>

      {/* ─── FACTS BAR ─── */}
      {facts.length > 0 && (
        <div className={`${s.container} ${s.serviceFacts}`}>
          {facts.map((fact: any, i: number) => (
            <div key={i}>
              <span>{fact.label?.toUpperCase() || 'INFO'}</span>
              <strong>{fact.value}</strong>
            </div>
          ))}
        </div>
      )}

      {/* ─── SUPPORT GRID (features) ─── */}
      {featureItems.length > 0 && (
        <section id="about" className={`${s.container} ${s.section}`}>
          <SectionTitle
            eyebrow={featuresSection?.heading || 'WHAT WE OFFER'}
            title={featuresSection?.subheading || 'More ways to support.'}
          />
          <div className={s.supportGrid}>
            {featureItems.map((item: any, index: number) => (
              <article key={index}>
                {item.icon && (
                  <span className={s.serviceIcon}>
                    <span style={{ fontSize: 27 }}>{item.icon}</span>
                  </span>
                )}
                <span className={s.cardNumber}>0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ─── JOURNEY STEPS ─── */}
      {steps.length > 0 && (
        <section className={s.serviceJourney}>
          <div className={`${s.container} ${s.journeyGrid}`}>
            <div>
              <Eyebrow>{howItWorksSection?.heading || 'HOW IT WORKS'}</Eyebrow>
              <h2>{howItWorksSection?.subheading || 'We start where you are.'}</h2>
              {handwrittenNote && (
                <span className={s.handwritten}>{handwrittenNote}</span>
              )}
            </div>
            <ol className={s.steps}>
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
        <section className={`${s.container} ${s.storySection}`}>
          {storyContent.image && <Photo src={storyContent.image} alt={storyContent.person || 'Story'} />}
          <div>
            <Eyebrow>{storySection?.heading || 'THE MOMENTS THAT MATTER'}</Eyebrow>
            {storyContent.quote && <blockquote>&ldquo;{storyContent.quote}&rdquo;</blockquote>}
            {storyContent.description && <p>{storyContent.description}</p>}
            {storyContent.person && (
              <span className={s.storyCredit}>{storyContent.person}{storyContent.role ? ` · ${storyContent.role}` : ''}</span>
            )}
            {storyContent.stats && storyContent.stats.length > 0 && (
              <div className={s.miniStats}>
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
        <section id="support" className={`${s.container} ${s.faqSection}`}>
          <div>
            <Eyebrow>{faqSection?.heading || 'FAQ'}</Eyebrow>
            <h2>{faqSection?.subheading || 'A few things you might wonder.'}</h2>
          </div>
          <div className={s.faqs}>
            {faqItems.map((item: any, i: number) => (
              <details key={i}>
                <summary>{item.question}<Plus size={20} aria-hidden="true" /></summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
      {ctaContent && (
        <section className={`${s.container} ${s.serviceCta}`}>
          <div>
            <Eyebrow>{ctaSection?.heading || "YOU DON'T HAVE TO FIGURE IT OUT ALONE"}</Eyebrow>
            <h2>{ctaContent.title || "Let's find your next small step."}</h2>
          </div>
          <div>
            {ctaContent.description && <p>{ctaContent.description}</p>}
            {ctaContent.buttons && ctaContent.buttons.length > 0 && (
              <a className={s.button} href={ctaContent.buttons[0].url}>
                {ctaContent.buttons[0].label}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            )}
          </div>
        </section>
      )}

      {/* ─── METRICS ─── */}
      {statItems.length > 0 && (
        <section className={`${s.container} ${s.metricSection}`}>
          <SectionTitle
            eyebrow={statsSection?.heading || 'IMPACT'}
            title={statsSection?.subheading || 'Small steps, visible change.'}
          />
          <div className={s.metricGrid}>
            {statItems.map((stat: any, i: number) => (
              <div className={s.metric} key={i}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── GALLERY ─── */}
      {galleryImages.length > 0 && (
        <section className={`${s.container} ${s.gallerySection}`}>
          <SectionTitle
            eyebrow={gallerySection?.heading || 'GALLERY'}
            title={gallerySection?.subheading || 'A glimpse of the work.'}
          />
          <div className={s.galleryGrid}>
            {galleryImages.map((img: any, i: number) => (
              <figure key={i}>
                <Photo src={img.url || ''} alt={img.alt || 'Gallery image'} />
                {img.caption && <figcaption>{img.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ─── RICH TEXT / OTHER ─── */}
      {sections.map((section) => {
        if (['facts_bar', 'features', 'how_it_works', 'story', 'faq', 'cta', 'stats', 'gallery'].includes(section.type)) return null
        if (section.type === 'rich_text' && 'body' in section.content) {
          return (
            <section key={section.id} className={`${s.container} ${s.section}`}>
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
