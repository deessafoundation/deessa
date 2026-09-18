import type { Program } from '@/lib/types/program-prototype'
import { ProgramHero } from '../sections/ProgramHero'
import { RichTextSection } from '../sections/RichTextSection'
import { ProgressTrackerSection } from '../sections/ProgressTrackerSection'
import { FeaturesSection } from '../sections/FeaturesSection'
import { TimelineSection } from '../sections/TimelineSection'
import { StatsSection } from '../sections/StatsSection'
import { GallerySection } from '../sections/GallerySection'
import { QuoteSection } from '../sections/QuoteSection'
import { CTASection } from '../sections/CTASection'
import { RelatedProgramsSection } from '../sections/RelatedProgramsSection'
import { SectionNav } from '../sections/SectionNav'

interface CampaignTemplateProps {
  program: Program
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function CampaignTemplate({ program }: CampaignTemplateProps) {
  const sectionNavItems = program.sections
    .filter((s) => s.heading)
    .map((s) => ({ id: `section-${s.id || slugify(s.heading!)}`, label: s.heading! }))

  return (
    <div className="program-campaign" data-theme={program.theme}>
      <ProgramHero hero={program.hero} theme={program.theme} />

      {program.sections.map((section) => {
        const sectionId = `section-${section.id || slugify(section.heading || '')}`
        const wrapped = (child: React.ReactNode) => (
          <div id={sectionId} key={section.id}>{child}</div>
        )

        switch (section.type) {
          case 'rich_text':
            return wrapped(<RichTextSection heading={section.heading} content={section.content as any} theme={program.theme} />)
          case 'progress_tracker':
            return wrapped(<ProgressTrackerSection heading={section.heading} content={section.content as any} theme={program.theme} />)
          case 'features':
            return wrapped(<FeaturesSection heading={section.heading} content={section.content as any} theme={program.theme} />)
          case 'timeline':
            return wrapped(<TimelineSection heading={section.heading} content={section.content as any} theme={program.theme} />)
          case 'stats':
            return wrapped(<StatsSection heading={section.heading} content={section.content as any} theme={program.theme} />)
          case 'gallery':
            return wrapped(<GallerySection heading={section.heading} content={section.content as any} theme={program.theme} />)
          case 'quote':
            return wrapped(<QuoteSection heading={section.heading} content={section.content as any} theme={program.theme} />)
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
