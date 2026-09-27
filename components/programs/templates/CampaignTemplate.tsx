import { Fragment } from "react"
import { ArrowDown, ArrowUpRight, Check, Heart } from "lucide-react"
import type { ProgramDocument, ProgramSection } from "@/lib/programs/content"
import {
  AnchorAlias,
  EditorialAccent,
  EditorialIcon,
  EditorialPhoto,
  EditorialSection,
  EditorialText,
} from "./EditorialParts"
import s from "../demo/campaign-concept.module.css"
import base from "../demo/program-base.module.css"

function Heading({ section }: { section: ProgramSection }) {
  return (
    <>
      {section.intro && <span className={s.eyebrow}>{section.heading}</span>}
      <h2>
        <EditorialText text={section.intro || section.heading} />
      </h2>
      {section.description && <p>{section.description}</p>}
    </>
  )
}

function CampaignSection({ section }: { section: ProgramSection }) {
  const c = section.content
  switch (c.type) {
    case "progress_tracker": {
      const percent = Math.min(100, Math.round((c.current / c.goal) * 100))
      return (
        <section id={section.id} className={s.progress}>
          <div>
            <span className={s.eyebrow}>{section.heading}</span>
            <h2>
              <strong>{c.current.toLocaleString("en-US")}</strong>{" "}
              <span>
                of {c.goal.toLocaleString("en-US")} {c.unit}
              </span>
            </h2>
            {section.description && <p>{section.description}</p>}
          </div>
          <div className={s.progressTrack}>
            <div>
              <strong>{percent}% of the way there</strong>
              <span>
                {Math.max(0, c.goal - c.current).toLocaleString("en-US")} {c.unit} to go
              </span>
            </div>
            <progress
              value={Math.min(c.current, c.goal)}
              max={c.goal}
              aria-label={c.current + " of " + c.goal + " " + c.unit}
            />
            {(section.footnote || section.intro) && <p>{section.footnote || section.intro}</p>}
            {c.asOf && (
              <p>
                As of <time dateTime={c.asOf}>{c.asOf.slice(0, 10)}</time>
              </p>
            )}
          </div>
        </section>
      )
    }
    case "rich_text":
      return (
        <section id={section.id} className={s.purpose}>
          <div>
            <Heading section={section} />
          </div>
          <div dangerouslySetInnerHTML={{ __html: c.body }} />
        </section>
      )
    case "features":
      return (
        <section id={section.id} className={s.promiseGrid} aria-label={section.heading || "What the campaign provides"}>
          {c.features.map((item, i) => (
            <article key={i}>
              <EditorialIcon name={item.icon} fallback={(["MessageCircle", "Users", "Heart"] as const)[i % 3]} />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </section>
      )
    case "how_it_works":
    case "timeline":
      return (
        <section id={section.id} className={s.journey}>
          <header>
            <Heading section={section} />
            {c.handwrittenNote && <p className={s.note}>{c.handwrittenNote}</p>}
          </header>
          <ol>
            {c.items.map((item, i) => (
              <li key={i}>
                <span className={s.step}>
                  {item.status === "completed" ? (
                    <Check size={18} aria-hidden="true" />
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </span>
                <div>
                  {item.status && (
                    <span className={s.status}>
                      {{ completed: "Complete", active: "In progress", upcoming: "Up next" }[item.status]}
                    </span>
                  )}
                  {item.date && <span className={s.status}> · {item.date}</span>}
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )
    case "story":
    case "quote":
      return (
        <section id={section.id} className={s.story}>
          <EditorialPhoto image={c.image} className={s.storyPhoto}>
            {c.image?.caption && <span>{c.image.caption}</span>}
          </EditorialPhoto>
          <div className={s.storyCopy}>
            <Heading section={section} />
            {c.type === "story" && c.description && <p>{c.description}</p>}
            <blockquote>
              <EditorialText text={c.quote} />
            </blockquote>
            <span className={s.note}>{[c.person, c.role, c.location].filter(Boolean).join(" · ")}</span>
            {section.detailText && (
              <details>
                <summary>
                  {section.detailLabel || "Read the story"}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </summary>
                <p>{section.detailText}</p>
              </details>
            )}
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
    case "stats":
      return (
        <section id={section.id} className={s.reach}>
          <div>
            <Heading section={section} />
            {section.footnote && <p>{section.footnote}</p>}
          </div>
          <dl>
            {c.stats.map((stat, i) => (
              <div key={i}>
                <dt>
                  {stat.label}
                  {(stat.period || stat.source) && (
                    <small> · {[stat.period, stat.source].filter(Boolean).join(" · ")}</small>
                  )}
                </dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )
    case "gallery":
      return (
        <section id={section.id} className={s.gallery}>
          <header>
            <div>
              {section.intro && <span className={s.eyebrow}>{section.heading}</span>}
              <h2>
                <EditorialText text={section.intro || section.heading} />
              </h2>
            </div>
            {section.description && <p>{section.description}</p>}
          </header>
          <div className={s.galleryGrid}>
            {c.images.map((image, i) => (
              <figure key={i}>
                <EditorialPhoto image={image} className={base.photo} />
                {image.caption && (
                  <figcaption>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {image.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
          {section.footnote && <p className={s.note}>{section.footnote}</p>}
        </section>
      )
    case "cta":
      return (
        <section id={section.id} className={s.participate}>
          <div>
            <span className={s.eyebrow}>{section.heading}</span>
            <h2>
              <EditorialText text={c.title} />
            </h2>
            <p>{c.description}</p>
          </div>
          <div className={s.participationOptions}>
            {c.buttons.map((button, i) => (
              <article key={i}>
                {button.eyebrow && <span>{button.eyebrow}</span>}
                {button.title && (
                  <h3>
                    <EditorialText text={button.title} />
                  </h3>
                )}
                {button.description && <p>{button.description}</p>}
                <a className={button.variant === "primary" ? base.button : base.textLink} href={button.url}>
                  {button.label}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </section>
      )
    default:
      return <EditorialSection section={section} />
  }
}

export function CampaignTemplate({ document }: { document: ProgramDocument }) {
  const { hero } = document
  const sections = document.sections.filter((section) => section.enabled)
  const links = [
    { id: "campaign-why", label: "The purpose", section: sections.find((s) => s.content.type === "rich_text") },
    {
      id: "campaign-journey",
      label: "Our journey",
      section: sections.find((s) => s.content.type === "timeline" || s.content.type === "how_it_works"),
    },
    {
      id: "campaign-stories",
      label: "People & stories",
      section: sections.find((s) => s.content.type === "story" || s.content.type === "quote"),
    },
    { id: "campaign-participate", label: "Get involved", section: sections.find((s) => s.content.type === "cta") },
  ]
  const navigation = links.some((link) => link.section) && (
    <nav className={s.sections} aria-label="On this campaign page">
      {links
        .filter((link) => link.section)
        .map((link) => (
          <a href={"#" + link.section!.id} key={link.id}>
            {link.label}
          </a>
        ))}
    </nav>
  )
  const progressIndex = sections.findIndex((section) => section.content.type === "progress_tracker")
  return (
    <div className={base.root + " " + base.campaign}>
      <div className={s.page}>
        <section className={s.hero}>
          <div className={s.heroCopy}>
            <span className={s.eyebrow}>{document.eyebrow}</span>
            <h1>
              <EditorialText text={hero.title} />
              <br />
              <EditorialAccent text={hero.description} />
            </h1>
            <p>{document.shortDescription}</p>
            {hero.actions.map((action, i) => (
              <a key={i} className={i === 0 ? s.primary : s.quiet} href={action.url}>
                {action.label}
                {i === 0 ? <ArrowUpRight size={18} aria-hidden="true" /> : <ArrowDown size={16} aria-hidden="true" />}
              </a>
            ))}
          </div>
          <EditorialPhoto image={hero.image} className={s.heroVisual} priority>
            {hero.note?.text && (
              <span className={s.photoLabel}>
                <Heart size={17} aria-hidden="true" />
                {hero.note.text}
              </span>
            )}
            {(hero.photoNote || hero.editorial?.captionLeft || hero.editorial?.captionRight) && (
              <div className={s.heroCaption}>
                <EditorialText text={hero.editorial?.captionLeft || hero.photoNote} />
                {hero.editorial?.captionRight && (
                  <strong>
                    <EditorialText text={hero.editorial.captionRight} />
                  </strong>
                )}
              </div>
            )}
          </EditorialPhoto>
        </section>
        {progressIndex < 0 && navigation}
        {sections.map((section, i) => (
          <Fragment key={section.id}>
            {links
              .filter((link) => link.section?.id === section.id)
              .map((link) => (
                <AnchorAlias key={link.id} id={link.id} section={section} />
              ))}
            <CampaignSection section={section} />
            {i === progressIndex && navigation}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
