import type { Program } from '@/lib/types/program-prototype'

export const aacSupportProgram: Program = {
  id: 'aac-support',
  slug: 'aac-support',
  title: 'Every Mind Is a Gift',
  category: 'service',
  theme: 'warm',
  eyebrow: '🧩 AUTISM SUPPORT',
  shortDescription: 'Supporting children and families through accessible communication tools and inclusive practices.',
  tags: ['autism', 'communication', 'AAC', 'family-support'],

  hero: {
    eyebrow: '🧩 AUTISM SUPPORT',
    title: 'Every Mind Is a Gift',
    description: 'Supporting children and families through accessible communication tools and inclusive practices. We believe every child deserves a way to express their needs, feelings, and ideas.',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
    imageAlt: 'Child using AAC communication device with caregiver',
    layout: 'split',
    cta: {
      label: 'Get Support',
      url: '/contact',
      variant: 'primary',
    },
    secondaryCta: {
      label: 'Learn More →',
      url: '#about',
    },
  },

  sections: [
    {
      id: 'about',
      type: 'rich_text',
      heading: 'About the Program',
      content: {
        type: 'rich_text',
        body: `
          <p class="lead">Every child deserves a way to express their needs, feelings, and ideas. Our AAC Communication Support program provides personalized strategies, tools, and training for children with communication challenges and their families.</p>
          
          <h3>What is AAC?</h3>
          <p>Augmentative and Alternative Communication (AAC) encompasses all forms of communication beyond oral speech that help individuals express their thoughts, needs, and ideas. This includes:</p>
          <ul>
            <li><strong>Low-tech solutions:</strong> Picture boards, communication books, and gesture systems</li>
            <li><strong>Mid-tech devices:</strong> Simple electronic devices with pre-recorded messages</li>
            <li><strong>High-tech systems:</strong> Tablets and specialized AAC apps with dynamic displays</li>
          </ul>
          
          <h3>Our Approach</h3>
          <p>We work directly with families, caregivers, educators, and communities to create supportive environments where every child can thrive. Our approach combines:</p>
          <ul>
            <li>Evidence-based practices proven effective in communication development</li>
            <li>Cultural sensitivity tailored to Nepali families and communities</li>
            <li>Local context understanding of available resources and challenges</li>
            <li>Family-centered care that empowers parents as primary communication partners</li>
          </ul>
          
          <p>From low-tech communication boards to high-tech AAC devices, we ensure families have access to the tools and knowledge they need to support their child's communication journey—regardless of economic status.</p>

          <style>
            .lead {
              font-size: 1.25rem;
              line-height: 1.8;
              margin-bottom: 2rem;
              color: #1a1a2e;
              font-weight: 500;
            }
            h3 {
              font-size: 1.5rem;
              font-weight: 700;
              color: #1a1a2e;
              margin-top: 2rem;
              margin-bottom: 1rem;
              font-family: 'Marissa Font', sans-serif;
            }
            ul {
              margin-left: 1.5rem;
              margin-bottom: 1.5rem;
            }
            li {
              margin-bottom: 0.75rem;
              line-height: 1.7;
            }
            strong {
              color: #3FABDE;
              font-weight: 600;
            }
          </style>
        `,
      },
    },

    {
      id: 'who-we-support',
      type: 'who_we_support',
      heading: 'Who We Support',
      content: {
        type: 'who_we_support',
        targetGroups: [
          {
            icon: '🧒',
            title: 'Children with Autism',
            ageRange: '2-12 years',
            description: 'Non-verbal or minimally verbal children who benefit from alternative communication methods.',
          },
          {
            icon: '👨‍👩‍👧',
            title: 'Families & Caregivers',
            description: 'Parents and caregivers seeking communication strategies and support for their children.',
          },
          {
            icon: '👩‍🏫',
            title: 'Educators & Communities',
            description: 'Teachers, therapists, and community members learning AAC implementation.',
          },
        ],
      },
    },

    {
      id: 'what-we-provide',
      type: 'features',
      heading: 'What We Provide',
      content: {
        type: 'features',
        layout: 'list',
        features: [
          {
            icon: '💬',
            title: 'Personalized AAC Strategies',
            description: 'Custom communication plans tailored to each child\'s needs, abilities, and learning style. We assess current communication skills, identify goals, and develop step-by-step implementation plans that grow with your child.',
          },
          {
            icon: '👨‍👩‍👧‍👦',
            title: 'Family & Caregiver Training',
            description: 'Comprehensive workshops and one-on-one guidance for implementing AAC at home and in daily routines. We teach modeling techniques, response strategies, and how to create communication-rich environments.',
          },
          {
            icon: '📱',
            title: 'Device & Tool Support',
            description: 'Access to AAC apps, tablets, devices, and low-tech communication boards. We provide device trials, teach customization, and offer ongoing technical support to ensure tools meet evolving needs.',
          },
          {
            icon: '🏫',
            title: 'School Integration Support',
            description: 'We work with teachers and school staff to ensure AAC systems are effectively used in educational settings, with IEP support and classroom adaptation strategies.',
          },
          {
            icon: '📊',
            title: 'Progress Tracking & Assessment',
            description: 'Regular assessments and milestone celebration to track communication growth. We document progress, adjust strategies, and celebrate every achievement—no matter how small.',
          },
          {
            icon: '🤝',
            title: 'Peer Support Network',
            description: 'Connection to other families using AAC, creating a community of support, shared experiences, and practical tips from those who understand your journey.',
          },
        ],
      },
    },

    {
      id: 'how-it-works',
      type: 'how_it_works',
      heading: 'How It Works',
      content: {
        type: 'how_it_works',
        steps: [
          {
            number: 1,
            title: 'Initial Assessment',
            description: 'We meet your child and family to understand communication needs and goals.',
          },
          {
            number: 2,
            title: 'Custom Plan Creation',
            description: 'We design a tailored AAC strategy based on your child\'s abilities.',
          },
          {
            number: 3,
            title: 'Training & Practice',
            description: 'Family and child learn together through hands-on sessions.',
          },
          {
            number: 4,
            title: 'Ongoing Support',
            description: 'Regular check-ins and progress reviews to ensure success.',
          },
        ],
      },
    },

    {
      id: 'impact',
      type: 'stats',
      heading: 'Our Impact',
      content: {
        type: 'stats',
        stats: [
          {
            icon: '👨‍👩‍👧‍👦',
            value: '500+',
            label: 'Families Supported',
            sublabel: 'Since 2020',
          },
          {
            icon: '🧒',
            value: '120',
            label: 'Children Learning',
            sublabel: 'This year',
          },
          {
            icon: '📱',
            value: '850+',
            label: 'AAC Tools Provided',
            sublabel: 'Donated',
          },
        ],
      },
    },

    {
      id: 'testimonial',
      type: 'quote',
      heading: 'Stories from Families',
      content: {
        type: 'quote',
        quote: 'Before AAC, we didn\'t know what Maya needed. Now she points to pictures, and we finally understand her. This program gave us hope.',
        person: 'Rajesh Kumar',
        role: 'Parent',
        location: 'Kathmandu, Nepal',
      },
    },

    {
      id: 'gallery',
      type: 'gallery',
      heading: 'See Us in Action',
      content: {
        type: 'gallery',
        layout: 'grid',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80',
            alt: 'Child using AAC device',
            caption: 'Learning to communicate with AAC tools',
          },
          {
            url: 'https://images.unsplash.com/photo-1544816565-aa8c31f7f5e6?w=600&q=80',
            alt: 'Parent training workshop',
            caption: 'Family training session',
          },
          {
            url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
            alt: 'Group therapy session',
            caption: 'Community AAC workshop',
          },
          {
            url: 'https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=600&q=80',
            alt: 'Child with communication board',
            caption: 'Using low-tech communication boards',
          },
        ],
      },
    },

    {
      id: 'cta',
      type: 'cta',
      content: {
        type: 'cta',
        title: 'Ready to Get Started?',
        description: 'Every child deserves a voice. Let\'s help your child find theirs through AAC communication support.',
        buttons: [
          {
            label: 'Contact Us',
            url: '/contact',
            variant: 'primary',
          },
          {
            label: 'Download Brochure',
            url: '/resources/aac-brochure.pdf',
            variant: 'outline',
          },
        ],
        backgroundStyle: 'gradient',
      },
    },
  ],
}
