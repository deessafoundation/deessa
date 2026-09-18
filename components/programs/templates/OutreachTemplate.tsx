import type { Program } from '@/lib/types/program-prototype'
import { ProgramHero } from '../sections/ProgramHero'
import { RichTextSection } from '../sections/RichTextSection'
import { FeaturesSection } from '../sections/FeaturesSection'
import { StatsSection } from '../sections/StatsSection'
import { QuoteSection } from '../sections/QuoteSection'
import { GallerySection } from '../sections/GallerySection'
import { CTASection } from '../sections/CTASection'
import { FactsBarSection } from '../sections/FactsBarSection'
import { ActivitiesSection } from '../sections/ActivitiesSection'
import { RelatedProgramsSection } from '../sections/RelatedProgramsSection'
import { SectionNav } from '../sections/SectionNav'

interface OutreachTemplateProps {
  program: Program
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function OutreachTemplate({ program }: OutreachTemplateProps) {
  const sectionNavItems = program.sections
    .filter((s) => s.heading)
    .map((s) => ({ id: `section-${s.id || slugify(s.heading!)}`, label: s.heading! }))

  return (
    <div className="program-outreach" data-theme={program.theme}>
      <ProgramHero hero={program.hero} theme={program.theme} />

      {program.sections.map((section) => {
        const sectionId = `section-${section.id || slugify(section.heading || '')}`
        const wrapped = (child: React.ReactNode) => (
          <div id={sectionId} key={section.id}>{child}</div>
        )

        switch (section.type) {
          case 'rich_text':
            return wrapped(<RichTextSection heading={section.heading} content={section.content as any} theme={program.theme} />)
          case 'facts_bar':
            return wrapped(<FactsBarSection heading={section.heading} content={section.content as any} theme={program.theme} />)
          case 'activities':
            return wrapped(<ActivitiesSection heading={section.heading} subheading={section.subheading} content={section.content as any} theme={program.theme} />)
          case 'features':
            return wrapped(<FeaturesSection heading={section.heading} content={section.content as any} theme={program.theme} />)
          case 'stats':
            return wrapped(<StatsSection heading={section.heading} content={section.content as any} theme={program.theme} />)
          case 'quote':
            return wrapped(<QuoteSection heading={section.heading} content={section.content as any} theme={program.theme} />)
          case 'gallery':
            return wrapped(<GallerySection heading={section.heading} content={section.content as any} theme={program.theme} />)
          case 'cta':
            return wrapped(<CTASection content={section.content as any} theme={program.theme} />)
          default:
            return null
        }
      })}

      {program.relatedPrograms && program.relatedPrograms.length > 0 && (
        <RelatedProgramsSection programs={program.relatedPrograms} />
      )}

      <SectionNav sections={sectionNavItems} />
    </div>
  )
}
