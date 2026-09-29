import type { ProgramDocument, ProgramSection } from '@/lib/programs/content'
import { outreachStops, researchStages } from '@/components/programs/demo/demo-content'

const children = { url: '/twins-together.jpg', alt: 'Two children sharing a moment outdoors; illustrative photograph' }
const family = { url: '/deesa-resources/IMG_8102.JPG', alt: 'Two children together near bookshelves; illustrative photograph' }
const community = { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=85', alt: 'Friends gathered outdoors; illustrative photograph' }
const learning = { url: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1200&q=85', alt: 'Children learning together; illustrative photograph' }
const hands = { url: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1800&q=85', alt: 'Hands gathered together; illustrative photograph' }

function section(id: string, heading: string, intro: string, content: ProgramSection['content'], description?: string): ProgramSection {
  return { id, heading, intro, description, content, enabled: true }
}
const base = { schemaVersion: 1 as const, seo: {}, tags: [], relatedProgramIds: [] }

// Local comparison fixtures only. These are never used as public program fallbacks.
export const editorialDemoDocuments: Record<'campaign' | 'outreach' | 'research', ProgramDocument> = {
  campaign: {
    ...base, category: 'campaign', title: '1,000 Families Initiative', eyebrow: 'CAMPAIGNS / THE 1,000 FAMILIES INITIATIVE',
    shortDescription: 'Let’s bring communication tools, practical guidance and a sense of belonging to 1,000 families across Nepal.',
    hero: {
      title: 'A little support.\nA world of', description: 'possibility.', image: children,
      actions: [{ label: 'Find your part in the story', url: '#campaign-participate', variant: 'primary' }, { label: 'Get to know the campaign', url: '#campaign-why', variant: 'secondary' }],
      note: { text: 'Every family. Every possibility.' },
      editorial: { captionLeft: 'ONE SHARED GOAL.', captionRight: 'A thousand different stories.' },
    },
    sections: [
      section('campaign-progress', 'OUR SHARED GOAL', 'Illustrative progress · September 2026', { type: 'progress_tracker', current: 820, goal: 1000, unit: 'families' }, 'Connected with tools, learning and community.'),
      section('campaign-why', 'WHY THIS MATTERS', 'No family should have to\n*figure it all out alone.*', { type: 'rich_text', body: '<p>A child has something to say. A parent is looking for a way to understand. Sometimes, the first step is a simple picture board. Sometimes, it is meeting someone who listens.</p><p>This campaign brings those first steps closer to home, with practical support that families can use in their own routines.</p>' }),
      section('campaign-promises', 'What the campaign provides', '', { type: 'features', layout: 'grid', features: [
        { icon: 'MessageCircle', title: 'Tools to express', description: 'Picture boards, visual routines and everyday resources that families can make their own.' },
        { icon: 'Users', title: 'Space to connect', description: 'Welcoming workshops where families learn alongside educators and local facilitators.' },
        { icon: 'Heart', title: 'Support to grow', description: 'Follow-up conversations and community connections that continue beyond the first session.' },
      ] }),
      section('campaign-journey', 'STEP BY STEP, TOGETHER', 'A goal becomes\n*a journey.*', { type: 'timeline', items: [
        { title: 'Listen & connect', description: 'Start with families, local educators and the questions that matter in their everyday lives.', status: 'completed' },
        { title: 'Learn & make', description: 'Bring practical workshops and communication resources into more communities.', status: 'active' },
        { title: 'Keep showing up', description: 'Follow up with families and strengthen the local connections that help support last.', status: 'upcoming' },
      ] }, 'From the first conversation to the next community workshop, here is how the campaign moves forward.'),
      { ...section('campaign-stories', 'A MOMENT FROM THE JOURNEY', 'It starts with\n*“I understand.”*', { type: 'story', image: { ...family, caption: 'THE PEOPLE BEHIND THE PROGRESS' }, description: 'At a community session, a parent tries a picture board for the first time. A small choice becomes a conversation, and a new possibility to take home.', quote: '“We left with something we could try together. That made the next step feel possible.”', person: 'Illustrative family story and quote', stats: [] }), detailLabel: 'Read the workshop story', detailText: 'Families explored visual choices through familiar activities: choosing a snack, planning a morning and asking for a break. The session ended with each family making a board to adapt at home, followed by a planned check-in with a facilitator.' },
      section('campaign-reach', 'MORE THAN A NUMBER', 'Connection, in many forms.', { type: 'stats', stats: [{ value: '820', label: 'families connected' }, { value: '156', label: 'learning sessions' }, { value: '25', label: 'districts reached' }] }, 'Sample campaign reach · September 2026'),
      { ...section('campaign-gallery', 'A FEW MOMENTS ALONG THE WAY', 'This is what\n*together looks like.*', { type: 'gallery', layout: 'grid', images: [{ ...children, caption: 'Connection begins with being together.' }, { ...family, caption: 'Everyday moments. New possibilities.' }, { ...children, focalPoint: '75% center', caption: 'A little more confidence for tomorrow.' }] }, 'Learning, listening and making space for each other. A glimpse of the everyday moments behind a shared goal.'), footnote: 'Illustrative imagery for this design preview.' },
      section('campaign-participate', 'THERE IS A PLACE FOR YOU HERE', '', { type: 'cta', title: 'Bring what you can.\n*Be part of what’s next.*', description: 'Your time, your skills or a conversation can help this community grow.', buttons: [
        { eyebrow: '01 / GIVE YOUR TIME', title: 'Help a session happen.', description: 'Support a workshop, translate a resource or connect us with your community.', label: 'Explore ways to volunteer', url: '/get-involved', variant: 'primary' },
        { eyebrow: '02 / START A CONVERSATION', title: 'Help the story travel.', description: 'Bring everyday communication into conversations with friends, schools and local groups.', label: 'See a message to share', url: '/contact', variant: 'primary' },
      ] }),
    ],
  },
  outreach: {
    ...base, category: 'outreach', title: 'Community Connection Series', eyebrow: 'COMMUNITY & OUTREACH / FIELD JOURNAL 01',
    shortDescription: 'A community learning journey. Three places. Many perspectives. A little more understanding.',
    hero: { title: 'Good things', description: 'happen *together.*', image: community, actions: [], photoNote: 'A community learning journey.\nThree places. Many perspectives.\nA little more understanding.', editorial: { stamp: 'LISTEN.\nLEARN.\nCONNECT.', location: 'Across the Kathmandu Valley', captionLeft: 'THE COMMUNITY CONNECTION SERIES', captionRight: 'APRIL 2026 · SAMPLE JOURNAL' } },
    sections: [
      { ...section('ribbon', '', '', { type: 'stats', stats: [{ value: '140', label: 'people connected' }, { value: '3', label: 'communities' }, { value: '1', label: 'shared conversation' }] }), presentation: 'ribbon' },
      section('opening', 'IT STARTS WITH SHOWING UP', 'Not a lecture.\nA conversation.', { type: 'rich_text', body: '<p>We brought families, teachers and local volunteers into the same space. To listen first. To try something new. To turn “I’m not sure” into “let’s find out together.”</p><p>Through hands-on activities and honest conversations, our sample outreach series explores what inclusion can look like in everyday community life.</p>' }),
      section('field-notes', 'POSTCARDS FROM THE JOURNEY', 'Different places. Shared hopes.', { type: 'activities', activities: outreachStops.map(stop => ({ place: stop.place, date: stop.date, title: stop.title, description: stop.text, count: stop.count })) }),
      section('photo-essay', 'THE LITTLE MOMENTS IN BETWEEN', 'Learning looks like this.', { type: 'gallery', layout: 'story', images: [{ ...learning, caption: 'Space for curiosity. Space for questions.' }, { ...family, caption: 'Connection is where understanding begins.' }] }, 'Making, sharing, asking, laughing. A photo story brings the experience into focus. Images here are illustrative.'),
      section('community-voices', 'COMMUNITY VOICES', '', { type: 'quote', quote: '“We came with questions.\nWe left with ideas —\n*and each other.”*', person: 'A community participant', role: 'Sample story' }),
      section('host', 'LET’S KEEP THE CONVERSATION GOING', '', { type: 'cta', title: 'Your community.\nOur next chapter?', description: 'Bring a learning session to your school, neighborhood or community group.', buttons: [{ label: 'Explore hosting a session', url: '/contact', variant: 'primary' }] }),
      { ...section('outreach-metrics', 'BY THE NUMBERS', 'A journey you can feel.', { type: 'stats', stats: [{ value: '140', label: 'people connected' }, { value: '3', label: 'communities visited' }, { value: '9', label: 'local facilitators' }, { value: '12h', label: 'shared conversation' }] }, 'A simple impact block gives the field journal a clear sense of reach without losing the human stories.'), presentation: 'auto' },
      { ...section('outreach-gallery', 'FIELD NOTES / VISUAL EDITION', 'The details tell the story.', { type: 'gallery', layout: 'grid', images: [{ ...community, caption: 'Arriving with curiosity.' }, { ...learning, caption: 'Making space to try.' }, { ...hands, caption: 'Working things out together.' }, { ...family, caption: 'Taking the idea home.' }] }, 'The gallery can grow with each outreach stop, giving the admin team a flexible way to publish a living journal.'), presentation: 'auto' },
    ],
  },
  research: {
    ...base, category: 'research', title: 'deessa Companion', eyebrow: 'RESEARCH & INNOVATION', tags: ['Accessible by design', 'Family-informed', 'Locally grounded'],
    shortDescription: 'Meet deessa Companion. An exploration of simple digital tools that support communication, routines and everyday independence.',
    hero: { title: 'Designed for\nthe everyday.', description: 'Built around you.', actions: [{ label: 'Explore the concept', url: '#interactive-concept', variant: 'primary' }, { label: 'Our approach', url: '#approach', variant: 'secondary' }], editorial: { status: 'CONCEPT / IN EXPLORATION', conceptLabel: 'THE EVERYDAY TOOLKIT', conceptTitle: 'A little clarity.\nA little confidence.', conceptRoutine1: 'A morning routine, made yours.', conceptRoutine2: 'A new way to say what you need.', conceptBrand: 'companion', conceptCredit: 'by deessa', figureLabel: 'FIG. 01 — SMALL TOOLS, EVERYDAY POSSIBILITIES' } },
    sections: [
      { ...section('question', 'THE QUESTION', '', { type: 'rich_text', body: '<p>How might a simple tool make everyday expression a little easier?</p>' }), presentation: 'question' },
      section('approach', 'DESIGNING WITH, NOT JUST FOR', 'An idea shaped by listening.', { type: 'how_it_works', items: researchStages.map(([date, title, description]) => ({ date, title, description })) }, 'Useful tools begin with real life. Our sample research process puts families’ experiences at the center, from the first question to the next iteration.'),
      section('interactive-concept', 'LESS EXPLAINING. MORE EXPLORING.', 'A small window\ninto the idea.', { type: 'built_in_demo', component: 'communication_board', checklist: ['Clear words paired with familiar symbols', 'Generous touch targets and calm colors', 'Space to explore without getting it wrong'], footnote: 'Interactive design study. Not the released Companion app.' }, 'Tap a few cards and build a phrase. This simplified communication board shows how a familiar, visual interface could help someone express a choice.'),
      { ...section('insights', 'WHAT WE’RE LEARNING', 'The next version\nstarts with a question.', { type: 'features', layout: 'list', features: [{ title: 'Familiarity comes first.', description: 'Everyday words and recognizable symbols can make the first interaction feel less demanding.' }, { title: 'Flexibility matters.', description: 'Different routines, languages and preferences call for tools that can grow with a person.' }] }), footnote: 'Illustrative research themes, not published study findings.' },
      section('resources', 'OPEN NOTEBOOK', 'Explore the thinking.', { type: 'faq', items: [
        { question: 'Design brief / A calmer everyday experience', answer: 'This concept explores communication cards and visual routines in a simple, accessible interface. The next step would be co-design sessions with families and educators.' },
        { question: 'Accessibility notes / Clear, flexible, familiar', answer: 'The prototype uses labeled controls, keyboard interaction, visible focus states and large touch targets. A production tool would also need usability testing with its intended users.' },
        { question: 'Research roadmap / From questions to learning', answer: 'Sample roadmap: listen to families, build a small prototype, run supported trials, document feedback and refine. No study results are represented here.' },
      ] }),
      section('collaborate', 'BETTER QUESTIONS. BETTER POSSIBILITIES.', '', { type: 'cta', title: 'Help shape what comes next.', description: 'Families, educators, researchers and thoughtful collaborators: there’s a place for your perspective.', buttons: [{ label: 'Explore a collaboration', url: '/contact', variant: 'primary' }] }),
      section('research-metrics', 'EARLY RESULTS / SAMPLE ONLY', 'Learning that shapes the next version.', { type: 'stats', stats: [{ value: '3', label: 'prototype rounds' }, { value: '18', label: 'design conversations' }, { value: '6', label: 'everyday routines mapped' }, { value: '100%', label: 'questions still welcome' }] }, 'A results area can make the research journey legible while separating exploratory metrics from published findings.'),
      section('research-gallery', 'RESEARCH ARTEFACTS', 'Ideas you can see and try.', { type: 'gallery', layout: 'grid', images: [{ ...learning, caption: 'A routine begins with listening.' }, { ...hands, caption: 'Prototypes make questions tangible.' }, { ...community, caption: 'Feedback belongs in the room.' }, { ...family, caption: 'Design follows real life.' }] }, 'A visual evidence section can hold prototype snapshots, workshop notes or short videos once the research is live.'),
    ],
  },
}
