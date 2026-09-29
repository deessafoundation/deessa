import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const newValue = {
  education: {
    title: 'Rural Education',
    description: 'Providing quality education, teacher training, and infrastructure to children in remote villages to ensure a brighter future.',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=85'
  },
  empowerment: {
    title: "Women's Empowerment",
    description: 'Creating sustainable livelihoods through vocational training, micro-finance support, and market access for rural women.',
    image: 'https://images.unsplash.com/photo-1607748851687-ba9a10438559?auto=format&fit=crop&w=1200&q=85'
  },
  health: {
    title: 'Healthcare Access',
    description: 'Delivering essential medical supplies, hygiene kits, and health camps to underserved communities lacking basic care.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=85'
  }
};

const { data, error } = await supabase
  .from('site_settings')
  .update({ value: newValue })
  .eq('key', 'home_initiatives')
  .select('key');

if (error) {
  console.error('Error:', JSON.stringify(error));
} else {
  console.log('Updated home_initiatives successfully:', JSON.stringify(data));
}
