import { Fragment, type ReactNode } from "react"
import { ArrowDown, ArrowUpRight, Check, Heart, MapPin, MessageCircle, Plus, Sparkles, Sun, Users } from "lucide-react"
import type { ProgramDocument, ProgramSection } from "@/lib/programs/content"
import { CommunicationBoard } from "../demo/DemoInteractions"
import { SafeImage } from "../SafeImage"
import base from "../demo/program-base.module.css"
import research from "../demo/research-concept.module.css"

export type ImageRef = ProgramDocument["hero"]["image"]
export type Action = ProgramDocument["hero"]["actions"][number]

// Headings allow line breaks and *emphasis*, never arbitrary HTML.
export function EditorialText({ text = "" }: { text?: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line
            .split(/(\*[^*]+\*)/g)
            .map((part, j) =>
              part.startsWith("*") && part.endsWith("*") ? <em key={j}>{part.slice(1, -1)}</em> : part,
            )}
        </Fragment>
      ))}
    </>
  )
}

export function EditorialAccent({ text }: { text: string }) {
  return text.includes("*") ? (
    <EditorialText text={text} />
  ) : (
    <em>
      <EditorialText text={text} />
    </em>
  )
}

export function imageUrl(image: ImageRef) {
  return image?.assetId ? `/api/assets/${image.assetId}` : image?.url || ""
}

export function EditorialPhoto({
  image,
  className = base.photo,
  priority = false,
  children,
}: {
  image: ImageRef
  className?: string
  priority?: boolean
  children?: ReactNode
}) {
  const src = imageUrl(image)
  if (!src) return null
  return (
    <div className={className}>
      <SafeImage
        src={src}
        alt={image?.alt || ""}
        fill
        priority={priority}
        sizes="(max-width: 760px) 100vw, 60vw"
        style={{ objectFit: "cover", objectPosition: image?.focalPoint || "center" }}
      />
      {children}
    </div>
  )
}

const icons = { Heart, MessageCircle, Users, MapPin, Sparkles, Check, Sun }
export function EditorialIcon({ name, fallback = "MessageCircle" }: { name?: string; fallback?: keyof typeof icons }) {
  const Icon = icons[name as keyof typeof icons] || icons[fallback]
  if (name && !/^[a-zA-Z]+$/.test(name)) return <span aria-hidden="true">{name}</span>
  return <Icon size={27} strokeWidth={1.5} aria-hidden="true" />
}

export function EditorialActions({ actions = [] }: { actions?: Action[] }) {
  return (
    <div className={base.actions}>
      {actions.map((action, i) => (
        <a key={i} className={action.variant === "primary" ? base.button : base.textLink} href={action.url}>
          {action.label}
          {action.variant === "primary" ? (
            <ArrowUpRight size={18} aria-hidden="true" />
          ) : (
            <ArrowDown size={18} aria-hidden="true" />
          )}
        </a>
      ))}
    </div>
  )
}

export function EditorialHeading({ section }: { section: ProgramSection }) {
  return (
    <div className={base.sectionHeading}>
      <div>
        {section.intro && section.heading && <div className={base.kicker}>{section.heading}</div>}
        <h2>
          <EditorialText text={section.intro || section.heading} />
        </h2>
      </div>
      {section.description && <p>{section.description}</p>}
    </div>
  )
}

export function SectionCopy({ section }: { section: ProgramSection }) {
  return (
    <>
      {section.intro && section.heading && <div className={base.kicker}>{section.heading}</div>}
      <h2>
        <EditorialText text={section.intro || section.heading} />
      </h2>
      {section.description && <p>{section.description}</p>}
    </>
  )
}

export function EditorialSection({ section }: { section: ProgramSection }) {
  const c = section.content
  switch (c.type) {
    case "stats":
      return (
        <section id={section.id} className={`${base.container} ${base.metricSection}`}>
          <EditorialHeading section={section} />
          <div className={base.metricGrid}>
            {c.stats.map((stat, i) => (
              <div className={base.metric} key={i}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
                {(stat.period || stat.source) && (
                  <small>{[stat.period, stat.source].filter(Boolean).join(" · ")}</small>
                )}
              </div>
            ))}
          </div>
          {section.footnote && <p className={base.fineprint}>{section.footnote}</p>}
        </section>
      )
    case "gallery": {
      const essay = section.presentation === "essay" || c.layout === "story"
      const body = (
        <>
          <EditorialHeading section={section} />
          <div className={essay ? base.essayGrid : base.galleryGrid}>
            {c.images.map((image, i) => (
              <figure key={i}>
                <EditorialPhoto image={image} />
                {image.caption && (
                  <figcaption>
                    {essay && <span>{String(i + 1).padStart(2, "0")}</span>}
                    <EditorialText text={image.caption} />
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
          {section.footnote && <p className={base.fineprint}>{section.footnote}</p>}
        </>
      )
      return essay ? (
        <section id={section.id} className={base.photoEssay}>
          <div className={base.container}>{body}</div>
        </section>
      ) : (
        <section id={section.id} className={`${base.container} ${base.gallerySection}`}>
          {body}
        </section>
      )
    }
    case "faq":
      return (
        <section id={section.id} className={`${base.container} ${base.resources}`}>
          <EditorialHeading section={section} />
          <div className={base.faqs}>
            {c.items.map((item, i) => (
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
      )
    case "resources":
      return (
        <section id={section.id} className={`${base.container} ${base.resources}`}>
          <EditorialHeading section={section} />
          <div className={base.faqs}>
            {c.resources.map((item, i) => (
              <details key={i}>
                <summary>
                  {item.label}
                  <Plus size={20} aria-hidden="true" />
                </summary>
                <p>{item.description}</p>
                <a className={base.textLink} href={item.url}>
                  {item.label}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </a>
              </details>
            ))}
          </div>
        </section>
      )
    case "rich_text":
      return (
        <section id={section.id} className={`${base.container} ${base.section}`}>
          <EditorialHeading section={section} />
          <div dangerouslySetInnerHTML={{ __html: c.body }} />
        </section>
      )
    case "features":
    case "who_we_support": {
      const items = c.type === "features" ? c.features : c.groups
      return (
        <section id={section.id} className={`${base.container} ${base.section}`}>
          <EditorialHeading section={section} />
          <div className={base.supportGrid}>
            {items.map((item, i) => (
              <article key={i}>
                <span className={base.serviceIcon}>
                  <EditorialIcon name={"icon" in item ? item.icon : undefined} />
                </span>
                <span className={base.cardNumber}>
                  {"number" in item ? item.number : String(i + 1).padStart(2, "0")}
                </span>
                <h3>{item.title}</h3>
                {"ageRange" in item && <span>{item.ageRange}</span>}
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      )
    }
    case "how_it_works":
    case "timeline":
      return (
        <section id={section.id} className={`${base.container} ${base.section}`}>
          <EditorialHeading section={section} />
          <div className={research.researchStages}>
            {c.items.map((item, i) => (
              <article key={i}>
                <div className={base.kicker}>{item.date || String(i + 1).padStart(2, "0")}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                {item.status && <small>{item.status}</small>}
              </article>
            ))}
          </div>
          {c.handwrittenNote && <span className={base.handwritten}>{c.handwrittenNote}</span>}
        </section>
      )
    case "facts_bar":
      return (
        <div id={section.id} className={`${base.container} ${base.serviceFacts}`}>
          {c.facts.map((fact, i) => (
            <div key={i}>
              <span>{fact.label}</span>
              <strong>{fact.value}</strong>
            </div>
          ))}
        </div>
      )
    case "activities":
      return (
        <section id={section.id} className={`${base.container} ${base.section}`}>
          <EditorialHeading section={section} />
          <div className={base.postcards}>
            {c.activities.map((item, i) => (
              <article key={i}>
                <div className={base.postcardTop}>
                  <span>STOP {String(i + 1).padStart(2, "0")}</span>
                  <span>{item.date}</span>
                </div>
                <MapPin size={24} aria-hidden="true" />
                <h3>{item.place}</h3>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                {item.count && <span className={base.participantCount}>{item.count}</span>}
              </article>
            ))}
          </div>
        </section>
      )
    case "quote":
    case "story":
      return (
        <section id={section.id} className={`${base.container} ${base.storySection}`}>
          <EditorialPhoto image={c.image} />
          <div>
            <div className={base.kicker}>{section.heading}</div>
            {section.intro && (
              <h2>
                <EditorialText text={section.intro} />
              </h2>
            )}
            <blockquote>
              <EditorialText text={c.quote} />
            </blockquote>
            {c.type === "story" && c.description && <p>{c.description}</p>}
            <p>{section.description}</p>
            <span className={base.storyCredit}>{[c.person, c.role, c.location].filter(Boolean).join(" · ")}</span>
            {c.type === "story" && c.stats.length > 0 && (
              <div className={base.miniStats}>
                {c.stats.map((stat, i) => (
                  <div key={i}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )
    case "cta":
      return (
        <section id={section.id} className={`${base.container} ${base.serviceCta}`}>
          <div>
            <div className={base.kicker}>{section.heading}</div>
            <h2>
              <EditorialText text={c.title} />
            </h2>
          </div>
          <div>
            <p>{c.description}</p>
            <EditorialActions actions={c.buttons} />
          </div>
        </section>
      )
    case "progress_tracker":
      return (
        <section id={section.id} className={`${base.container} ${base.section}`}>
          <EditorialHeading section={section} />
          <p>
            {c.current.toLocaleString("en-US")} / {c.goal.toLocaleString("en-US")} {c.unit}
          </p>
          <progress
            value={Math.min(c.current, c.goal)}
            max={c.goal}
            aria-label={section.heading || "Program progress"}
          />
        </section>
      )
    case "built_in_demo":
      return (
        <section id={section.id} className={base.interactiveSection}>
          <div className={`${base.container} ${base.interactiveGrid}`}>
            <div>
              <SectionCopy section={section} />
              <ul className={base.checkList}>
                {c.checklist?.map((item, i) => (
                  <li key={i}>
                    <Check size={17} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              {c.footnote && <p className={base.fineprint}>{c.footnote}</p>}
            </div>
            <CommunicationBoard />
          </div>
        </section>
      )
  }
}

// Keep demo anchors working with existing generated CMS section IDbase.
export function AnchorAlias({ id, section }: { id: string; section: ProgramSection | undefined }) {
  return section && section.id !== id ? <span id={id} style={{ display: "block", scrollMarginTop: 110 }} /> : null
}
