import { Fragment } from 'react'
import { ArrowDown, Check, Heart, MessageCircle, Sun } from 'lucide-react'
import type { ProgramDocument } from '@/lib/programs/content'
import { AnchorAlias, EditorialAccent, imageUrl, EditorialActions, EditorialPhoto, EditorialSection, EditorialText, SectionCopy } from './EditorialParts'
import s from '../demo/program-demo.module.css'
import photoStyles from './editorial-photo.module.css'

export function ResearchTemplate({ document }: { document: ProgramDocument }) {
  const { hero } = document
  const visual = hero.editorial
  const sections = document.sections.filter(section => section.enabled)
  const question = document.sections.find(section => section.content.type === 'rich_text')
  const approach = sections.find(section => section.content.type === 'how_it_works' || section.content.type === 'timeline')
  const board = sections.find(section => section.content.type === 'built_in_demo')
  return <div className={s.root + ' ' + s.research}>
    <section className={s.container + ' ' + s.researchHero}><div className={s.researchMeta}><div className={s.kicker}>{document.eyebrow}</div>{visual?.status && <span><span className={s.liveDot} />{visual.status}</span>}</div><div className={s.researchHeroGrid}><div><h1><EditorialText text={hero.title} /><br /><EditorialAccent text={hero.description} /></h1><p>{document.shortDescription}</p><EditorialActions actions={hero.actions} /><div className={s.researchTags}>{document.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div><div className={s.researchVisual}><div className={s.visualOrbit} aria-hidden="true" />{imageUrl(hero.image) ? <EditorialPhoto image={hero.image} className={photoStyles.photo} priority /> : <div className={s.conceptCard}><span className={s.conceptCardLabel}>{visual?.conceptLabel || document.eyebrow}</span><div className={s.conceptSymbols}><MessageCircle aria-hidden="true" /><Sun aria-hidden="true" /><Heart aria-hidden="true" /></div><h2><EditorialText text={visual?.conceptTitle || hero.title} /></h2>{visual?.conceptRoutine1 && <div className={s.conceptRoutine}><Check size={18} aria-hidden="true" />{visual.conceptRoutine1}</div>}{visual?.conceptRoutine2 && <div className={s.conceptRoutine}><MessageCircle size={18} aria-hidden="true" />{visual.conceptRoutine2}</div>}<span className={s.conceptFoot}>{visual?.conceptBrand || document.title}{visual?.conceptCredit && <span>{visual.conceptCredit}</span>}</span></div>}{(visual?.figureLabel || hero.photoNote) && <span className={s.figureLabel}>{visual?.figureLabel || hero.photoNote}</span>}</div></div></section>
    {sections.map(section => {
      const c = section.content
      if (c.type === 'rich_text' && (section.presentation === 'question' || (!section.presentation && section.id === question?.id))) return <div key={section.id} id={section.id} className={s.researchStrip}><div className={s.container}><span>{section.heading || 'THE QUESTION'}</span><div dangerouslySetInnerHTML={{ __html: c.body }} /><ArrowDown size={22} aria-hidden="true" /></div></div>
      if (c.type === 'features' && (section.presentation === 'insights' || c.layout === 'list')) return <section key={section.id} id={section.id} className={s.container + ' ' + s.researchNotes}><div><SectionCopy section={section} /></div><div>{c.features.map((item, i) => <article key={i}><span>INSIGHT {item.number || String(i + 1).padStart(2, '0')}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}{section.footnote && <p className={s.fineprint}>{section.footnote}</p>}</div></section>
      if (c.type === 'cta') return <section key={section.id} id={section.id} className={s.researchCta}><div className={s.container}><div><SectionCopy section={{ ...section, intro: c.title, description: c.description }} /></div><EditorialActions actions={c.buttons} /></div></section>
      return <Fragment key={section.id}>{section.id === approach?.id && <><AnchorAlias id="approach" section={section} /><AnchorAlias id="methodology" section={section} /></>}{section.id === board?.id && <AnchorAlias id="interactive-concept" section={section} />}<EditorialSection section={section} /></Fragment>
    })}
  </div>
}
