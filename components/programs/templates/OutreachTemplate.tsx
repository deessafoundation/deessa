import { Fragment } from "react"
import { ArrowDown, MapPin } from "lucide-react"
import type { ProgramDocument } from "@/lib/programs/content"
import {
  AnchorAlias,
  EditorialAccent,
  EditorialActions,
  EditorialPhoto,
  EditorialSection,
  EditorialText,
  SectionCopy,
} from "./EditorialParts"
import base from "../demo/program-base.module.css"
import outreach from "../demo/outreach-concept.module.css"

export function OutreachTemplate({ document }: { document: ProgramDocument }) {
  const { hero } = document
  const sections = document.sections.filter((section) => section.enabled)
  const firstStats = sections.find((section) => section.content.type === "stats")
  const firstGallery = sections.find((section) => section.content.type === "gallery")
  const activities = sections.find((section) => section.content.type === "activities")
  const visual = hero.editorial
  return (
    <div className={base.root + " " + base.outreach}>
      <section className={base.container + " " + outreach.outreachIntro}>
        <div>
          <div className={base.kicker}>{document.eyebrow}</div>
          <h1>
            <EditorialText text={hero.title} />
            <br />
            <EditorialAccent text={hero.description} />
          </h1>
        </div>
        <div>
          {(visual?.stamp || hero.sticker?.text) && (
            <span className={outreach.outreachStamp}>
              <EditorialText text={visual?.stamp || hero.sticker?.text} />
            </span>
          )}
          <p>
            <EditorialText text={hero.photoNote || document.shortDescription} />
          </p>
        </div>
      </section>
      <section className={base.container + " " + outreach.outreachCover}>
        <EditorialPhoto image={hero.image} priority />
        {(visual?.location || hero.note?.text) && (
          <span className={outreach.paperLabel}>
            <MapPin size={18} aria-hidden="true" />
            {visual?.location || hero.note?.text}
          </span>
        )}
        {(visual?.captionLeft || visual?.captionRight) && (
          <div className={outreach.coverCaption}>
            <span>{visual.captionLeft}</span>
            <span>{visual.captionRight}</span>
          </div>
        )}
      </section>
      {hero.actions.length > 0 && (
        <div className={base.container}>
          <EditorialActions actions={hero.actions} />
        </div>
      )}
      {sections.map((section) => {
        const c = section.content
        if (
          c.type === "stats" &&
          (section.presentation === "ribbon" || (!section.presentation && section.id === firstStats?.id))
        )
          return (
            <div id={section.id} className={outreach.outreachRibbon} key={section.id}>
              <div className={base.container}>
                {c.stats.map((stat, i) => (
                  <span key={i}>
                    {stat.value} <small>{stat.label}</small>
                  </span>
                ))}
                {activities && (
                  <a href={"#" + activities.id}>
                    Explore the journey <ArrowDown size={19} aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          )
        if (c.type === "rich_text")
          return (
            <section key={section.id} id={section.id} className={base.container + " " + outreach.outreachOpening}>
              <div className={base.kicker}>{section.heading}</div>
              <div>
                {section.intro && (
                  <h2>
                    <EditorialText text={section.intro} />
                  </h2>
                )}
                {section.description && <p>{section.description}</p>}
                <div dangerouslySetInnerHTML={{ __html: c.body }} />
              </div>
            </section>
          )
        if (c.type === "quote")
          return (
            <section key={section.id} id={section.id} className={base.container + " " + outreach.outreachVoice}>
              <div className={base.kicker}>{section.heading}</div>
              <blockquote>
                <EditorialText text={c.quote} />
              </blockquote>
              <p>{[c.person, c.role, c.location].filter(Boolean).join(" · ")}</p>
              {section.description && <p>{section.description}</p>}
            </section>
          )
        if (c.type === "cta")
          return (
            <section key={section.id} id={section.id} className={base.container + " " + outreach.outreachCta}>
              <span className={outreach.outreachAsterisk} aria-hidden="true">
                ✳
              </span>
              <div>
                <SectionCopy section={{ ...section, intro: c.title, description: c.description }} />
                <EditorialActions actions={c.buttons} />
              </div>
            </section>
          )
        const essay = c.type === "gallery" && !section.presentation && section.id === firstGallery?.id
        return (
          <Fragment key={section.id}>
            {section.id === activities?.id && <AnchorAlias id="field-notes" section={section} />}
            <EditorialSection section={essay ? { ...section, presentation: "essay" } : section} />
          </Fragment>
        )
      })}
    </div>
  )
}
