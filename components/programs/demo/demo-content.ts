export const demoPages = [
  { slug: 'aac-support', label: 'Services', number: '01', title: 'A little support. A world of possibility.', description: 'A warm, family-centered service experience.', category: 'service' },
  { slug: 'community-outreach', label: 'Outreach', number: '02', title: 'Good things happen together.', description: 'A photographic journal of community connection.', category: 'outreach' },
  { slug: 'deessa-companion', label: 'Research', number: '03', title: 'Small tools. Meaningful possibilities.', description: 'An editorial look at ideas, tools and learning.', category: 'research' },
  { slug: '1000-families', label: 'Campaigns', number: '04', title: '1,000 families. One shared future.', description: 'A bold invitation to be part of a collective goal.', category: 'campaign' },
] as const

export type DemoCategory = typeof demoPages[number]['category']

export const serviceSupport = [
  { title: 'A way to express themselves', text: 'From picture cards to communication boards, we explore tools that fit your child’s everyday life.', icon: 'message' },
  { title: 'Confidence for your family', text: 'Practical, gentle guidance for parents and caregivers. Small things to try, at your own pace.', icon: 'heart' },
  { title: 'Connection beyond home', text: 'Work with educators and a community of families to make communication part of every day.', icon: 'people' },
] as const

export const serviceSteps = [
  ['Let’s have a conversation', 'Tell us about your child, your everyday routines and what you hope for.'],
  ['Find what works together', 'Explore communication tools and build a plan around your family.'],
  ['Practice, learn, celebrate', 'Try small steps at home, with regular check-ins and encouragement.'],
]

export const serviceFaqs = [
  ['Who is this program for?', 'In this sample program, children aged 2–12 and their parents or caregivers can explore communication support together.'],
  ['Do we need a diagnosis to ask for help?', 'For this prototype, families can start with a conversation. A real program would show its referral and eligibility requirements here.'],
  ['Where do sessions take place?', 'Sample delivery: in-person sessions in Lalitpur, with online follow-ups for families further away.'],
  ['What does support cost?', 'Sample model: an initial conversation at no cost, with subsidized support options discussed individually.'],
]

export const outreachStops = [
  { place: 'Lalitpur', date: '12 April', title: 'A space to listen', text: 'Parents and educators shared everyday experiences, asked questions and found common ground.', count: '45 participants' },
  { place: 'Bhaktapur', date: '19 April', title: 'Learning by doing', text: 'A hands-on afternoon making visual schedules, trying communication cards and swapping ideas.', count: '38 participants' },
  { place: 'Kavrepalanchok', date: '26 April', title: 'Taking the ideas home', text: 'Community volunteers helped families turn workshop ideas into small, practical next steps.', count: '57 participants' },
]

export const researchStages = [
  ['01 / LISTEN', 'Start with everyday life', 'Conversations with families reveal the moments where a simple tool could make a difference.'],
  ['02 / MAKE', 'Build something small', 'Co-design simple boards and routines, using familiar symbols and room for personal choices.'],
  ['03 / LEARN', 'Test, reflect, improve', 'Invite feedback, notice what gets in the way and bring those lessons into the next version.'],
]
