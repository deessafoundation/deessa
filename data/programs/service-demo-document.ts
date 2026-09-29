import type { ProgramDocument } from '@/lib/programs/content'
import { serviceSupport, serviceSteps, serviceFaqs } from '@/components/programs/demo/demo-content'

const children = { url: '/twins-together.jpg', alt: 'Two children sharing a moment outdoors; illustrative photograph' }
const family = { url: '/deessa-resources/IMG_8102.JPG', alt: 'Two children together near bookshelves; illustrative photograph' }

export const serviceDemoDocument: ProgramDocument = {
  schemaVersion: 1, category: 'service', title: 'AAC Support Services', eyebrow: 'SERVICES & PROGRAMS',
  shortDescription: 'Communication support that helps families discover tools, confidence and connections.',
  tags: ['communication', 'aac', 'families', 'support'], seo: {}, relatedProgramIds: [],
  hero: {
    title: 'Every little expression. A big possibility.',
    description: 'Communication looks different for every child. We help families discover the tools, confidence and connections to find their own way.',
    image: children,
    actions: [{ label: 'Find support for your family', url: '#support', variant: 'primary' }, { label: 'Explore the program', url: '#about', variant: 'secondary' }],
    note: { icon: 'Heart', text: 'At your pace. By your side.' },
    sticker: { icon: 'Sparkles', text: 'Every mind is a gift.' },
    photoNote: 'A connection can begin with the smallest moment.',
  },
  sections: [
    { id: 'facts', enabled: true, content: { type: 'facts_bar', facts: [
      { label: 'THE PROGRAM', value: 'AAC communication support' }, { label: 'WHO IT’S FOR', value: 'Children & their families' },
      { label: 'WHERE WE CONNECT', value: 'Lalitpur + online' }, { label: 'OUR APPROACH', value: 'Family-centered, always' },
    ] } },
    { id: 'about', enabled: true, heading: 'A LITTLE UNDERSTANDING GOES A LONG WAY', intro: 'More ways to say “this is me.”', description: 'AAC means augmentative and alternative communication. It can be a picture, a gesture or a digital tool. What matters is finding what feels right for your child.', content: { type: 'features', layout: 'grid', features: serviceSupport.map((item, i) => ({ title: item.title, description: item.text, icon: ['💬', '♡', '👥'][i] })) } },
    { id: 'journey', enabled: true, heading: 'NO TWO JOURNEYS ARE THE SAME', intro: 'We start where you are.', description: 'You don’t need all the answers before reaching out. We’ll figure out the next step together.', content: { type: 'how_it_works', items: serviceSteps.map(([title, description]) => ({ title, description })), handwrittenNote: 'Small steps count, too.' } },
    { id: 'family-story', enabled: true, heading: 'THE MOMENTS THAT MATTER', content: { type: 'story', quote: 'It wasn’t just a new way to communicate. It was a new way to connect.', description: 'A sample family story about finding everyday moments of understanding through a simple picture board.', person: 'A parent’s perspective', role: 'Illustrative story', location: 'Lalitpur', image: family, stats: [{ value: '120', label: 'families learning together' }, { value: '24', label: 'community sessions' }] } },
    { id: 'support', enabled: true, heading: 'LET’S MAKE THE FIRST STEP EASIER', intro: 'A few things you might wonder.', description: 'Every family’s questions are welcome.', content: { type: 'faq', items: serviceFaqs.map(([question, answer]) => ({ question, answer })) } },
    { id: 'enquire', enabled: true, heading: 'YOU DON’T HAVE TO FIGURE IT OUT ALONE', content: { type: 'cta', title: 'Let’s find your next small step.', description: 'Start with a conversation about your family and the support you’re looking for.', buttons: [{ label: 'Ask about communication support', url: '/contact', variant: 'primary' }] } },
    { id: 'service-metrics', enabled: true, heading: 'SMALL STEPS, SHARED PROGRESS', intro: 'Every connection counts.', description: 'Illustrative program metrics for testing the service layout.', content: { type: 'stats', stats: [{ value: '120', label: 'families learning together' }, { value: '24', label: 'community sessions' }, { value: '12', label: 'local educators' }, { value: '3', label: 'ways to connect' }] } },
    { id: 'service-gallery', enabled: true, heading: 'EVERYDAY CONNECTIONS', intro: 'A little glimpse of together.', description: 'Illustrative photographs for the service gallery.', content: { type: 'gallery', layout: 'grid', images: [{ ...children, caption: 'A moment of connection.' }, { ...family, caption: 'Learning alongside each other.' }, { ...children, caption: 'Every expression matters.' }, { ...family, caption: 'Small steps, together.' }] } },
  ],
}
