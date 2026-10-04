import type { ProgramCategory, ProgramSection } from '@/lib/programs/content'
import { createSection, SECTION_TYPE_MAP } from './types'

export type TemplateSlot = { key: string; title: string; hint: string; type: ProgramSection['content']['type']; presentation?: ProgramSection['presentation'] }
export const TEMPLATE_LAYOUTS: Record<Exclude<ProgramCategory, 'service'>, TemplateSlot[]> = {
  campaign: [
    { key: 'progress_tracker', type: 'progress_tracker', title: 'Campaign Progress', hint: 'Current reach, shared goal and progress note' },
    { key: 'rich_text', type: 'rich_text', title: 'Campaign Purpose', hint: 'Editorial heading and opening story' },
    { key: 'features', type: 'features', title: 'Promise Cards', hint: 'The ways this campaign helps' },
    { key: 'timeline', type: 'timeline', title: 'Campaign Journey', hint: 'Milestones, dates and completion status' },
    { key: 'story', type: 'story', title: 'Family Story', hint: 'Photo, quote and expandable workshop story' },
    { key: 'stats', type: 'stats', title: 'Campaign Reach', hint: 'Impact figures beside the editorial heading' },
    { key: 'gallery', type: 'gallery', title: 'Campaign Gallery', hint: 'Staggered photographs and captions' },
    { key: 'cta', type: 'cta', title: 'Participation Cards', hint: 'Ways to get involved, with individual links' },
  ],
  outreach: [
    { key: 'ribbon', type: 'stats', presentation: 'ribbon', title: 'Impact Ribbon', hint: 'Compact figures immediately below the cover' },
    { key: 'rich_text', type: 'rich_text', title: 'Journal Opening', hint: 'Opening heading and community story' },
    { key: 'activities', type: 'activities', title: 'Journey Postcards', hint: 'Places, dates and stories from each stop' },
    { key: 'essay', type: 'gallery', presentation: 'essay', title: 'Photo Essay', hint: 'Large editorial photographs with numbered captions' },
    { key: 'quote', type: 'quote', title: 'Community Voice', hint: 'Featured quote and participant attribution' },
    { key: 'cta', type: 'cta', title: 'Host a Session', hint: 'Invitation and enquiry link' },
    { key: 'stats', type: 'stats', presentation: 'auto', title: 'Outreach Metrics', hint: 'Separate impact cards below the invitation' },
    { key: 'gallery', type: 'gallery', presentation: 'auto', title: 'Field Notes Gallery', hint: 'The growing journal of community photographs' },
  ],
  research: [
    { key: 'question', type: 'rich_text', presentation: 'question', title: 'Research Question', hint: 'The colored question strip below the hero' },
    { key: 'how_it_works', type: 'how_it_works', title: 'Research Approach', hint: 'Listen, make and learn stages' },
    { key: 'built_in_demo', type: 'built_in_demo', title: 'Interactive Concept', hint: 'Communication board introduction, checklist and disclaimer' },
    { key: 'insights', type: 'features', presentation: 'insights', title: 'Research Insights', hint: 'Numbered findings and research footnote' },
    { key: 'faq', type: 'faq', title: 'Research Resources', hint: 'Expandable notebook entries' },
    { key: 'cta', type: 'cta', title: 'Collaboration Invitation', hint: 'Invitation heading, supporting copy and link' },
    { key: 'stats', type: 'stats', title: 'Research Metrics', hint: 'Early results and learning figures' },
    { key: 'gallery', type: 'gallery', title: 'Research Gallery', hint: 'Prototype and workshop photographs' },
  ],
}

export function templateSectionDetails(category: Exclude<ProgramCategory, 'service'>, section: ProgramSection, sections: ProgramSection[]): TemplateSlot {
  const content = section.content
  let key: string = content.type
  const first = (type: typeof content.type) => sections.find(s => s.content.type === type)?.id === section.id
  if (category === 'outreach') {
    if (content.type === 'stats' && (section.presentation === 'ribbon' || (!section.presentation && first('stats')))) key = 'ribbon'
    if (content.type === 'gallery' && (section.presentation === 'essay' || content.layout === 'story' || (!section.presentation && first('gallery')))) key = 'essay'
  }
  if (category === 'research') {
    if (content.type === 'rich_text' && (section.presentation === 'question' || (!section.presentation && first('rich_text')))) key = 'question'
    if (content.type === 'features') key = 'insights'
    if (content.type === 'timeline') key = 'how_it_works'
    if (content.type === 'resources') key = 'faq'
  }
  if (category === 'campaign') {
    if (content.type === 'how_it_works') key = 'timeline'
    if (content.type === 'quote') key = 'story'
  }
  return TEMPLATE_LAYOUTS[category].find(slot => slot.key === key) || { key, type: content.type, title: SECTION_TYPE_MAP[content.type]?.label || content.type, hint: 'Additional page section' }
}

export function createTemplateSection(slot: TemplateSlot): ProgramSection {
  return { ...createSection(slot.type), ...(slot.presentation ? { presentation: slot.presentation } : {}) }
}

