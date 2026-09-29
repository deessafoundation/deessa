import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const episodes = [
  {
    slug: 'living-with-autism-real-voices-real-stories-ep-4',
    title: 'Living with Autism: Real Voices, Real Stories || EP 4',
    description: 'Episode 4 of the podcast series Living with Autism: Real Voices, Real Stories, produced by the deessa Foundation with technical support from SDG Studio. This episode continues powerful conversations around autism awareness, inclusion, and community support in Nepal.',
    youtube_id: '5K2oqSIHVhs',
    thumbnail_url: 'https://img.youtube.com/vi/5K2oqSIHVhs/maxresdefault.jpg',
    duration: '',
    format: 'video',
    episode_number: 4,
    topics: ['Autism Awareness', 'Inclusion', 'Community', 'Personal Stories', 'Education'],
    show_notes: JSON.stringify([{ title: 'About This Episode', content: 'A powerful continuation of our series exploring autism, inclusion, and community empowerment in Nepal.' }]),
    key_topics: '',
    transcript: '',
    highlights: ['https://youtu.be/wJhJiCZnobg?si=0Q001AKoae3-MbYn'],
    guest_name: null,
    guest_title: null,
    guest_bio: null,
    guest_photo_url: null,
    guest_social_links: null,
    guest_roles: [],
    related_episode_ids: [],
    view_count: 0,
    featured: true,
    published: true,
    published_at: new Date().toISOString(),
  },
  {
    slug: 'living-with-autism-real-voices-real-stories-ep-5',
    title: 'Living with Autism: Real Voices, Real Stories || EP 5',
    description: 'Episode 5 of the podcast series Living with Autism: Real Voices, Real Stories, produced by the deessa Foundation. Another inspiring episode featuring stories, insights, and conversations about autism, inclusion, and family journeys in Nepal.',
    youtube_id: 'eQtORk0dGUc',
    thumbnail_url: 'https://img.youtube.com/vi/eQtORk0dGUc/maxresdefault.jpg',
    duration: '',
    format: 'video',
    episode_number: 5,
    topics: ['Autism Awareness', 'Inclusion', 'Community', 'Personal Stories', 'Family Support'],
    show_notes: JSON.stringify([{ title: 'About This Episode', content: 'Our latest episode featuring heartfelt stories and expert conversations on autism awareness and community empowerment.' }]),
    key_topics: '',
    transcript: '',
    highlights: ['https://youtu.be/p2E4qaD_fjg?si=b9Iu3YVn3Q6w697e'],
    guest_name: null,
    guest_title: null,
    guest_bio: null,
    guest_photo_url: null,
    guest_social_links: null,
    guest_roles: [],
    related_episode_ids: [],
    view_count: 0,
    featured: true,
    published: true,
    published_at: new Date().toISOString(),
  },
];

for (const ep of episodes) {
  const { data, error } = await supabase.from('podcasts').insert(ep).select('id,slug,episode_number');
  if (error) {
    console.error(`Insert error EP${ep.episode_number}:`, JSON.stringify(error));
  } else {
    console.log(`Inserted EP${ep.episode_number}:`, JSON.stringify(data));
  }
}
