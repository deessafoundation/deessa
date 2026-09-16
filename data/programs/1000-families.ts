import type { Program } from '@/lib/types/program-prototype'

export const thousandFamiliesCampaign: Program = {
  id: '1000-families',
  slug: '1000-families',
  title: '1000 Families Campaign 2024',
  category: 'campaign',
  theme: 'warm',
  eyebrow: '🎯 ACTIVE CAMPAIGN',
  shortDescription: 'Supporting 1000 families with autism-related resources, training, and community connections before December 31, 2024.',
  tags: ['campaign', 'autism', 'family-support', '2024'],

  hero: {
    eyebrow: '🎯 ACTIVE CAMPAIGN',
    title: '1000 Families Campaign 2024',
    description: 'Supporting 1000 families across Nepal with autism resources, professional training, and community connections. Together, we can reach every family that needs support before December 31, 2024.',
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1600&q=80',
    imageAlt: 'Families participating in autism support training',
    layout: 'split',
    cta: {
      label: 'Support the Campaign',
      url: '/donate',
      variant: 'primary',
    },
    secondaryCta: {
      label: 'Learn More →',
      url: '#why-it-matters',
    },
  },

  sections: [
    {
      id: 'why-it-matters',
      type: 'rich_text',
      heading: 'Why This Campaign Matters',
      content: {
        type: 'rich_text',
        body: `
          <p class="lead">In Nepal, 1 in 68 children has autism. Yet most families never receive proper diagnosis, support, or resources. This campaign is changing that reality—one family at a time.</p>
          
          <h3>The Challenge We Face</h3>
          <p>Families across Nepal struggle to find the help they need:</p>
          <ul>
            <li><strong>83% of families</strong> never receive an autism diagnosis for their child</li>
            <li><strong>Only 12%</strong> have access to professional therapy and support services</li>
            <li><strong>90% face stigma</strong> in their communities, leading to isolation and shame</li>
            <li><strong>Limited resources</strong> mean families don't know where to turn for help</li>
          </ul>
          
          <h3>Our Solution</h3>
          <p>The 1000 Families Campaign provides comprehensive support to families who need it most. We're not just providing services—we're building a movement of understanding, acceptance, and hope across Nepal.</p>
          
          <p>Every family deserves access to the tools, training, and community connections that can transform their child's future. With your support, we can reach our goal of 1000 families by December 31, 2024.</p>

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
              color: #F97316;
              font-weight: 600;
            }
          </style>
        `,
      },
    },

    {
      id: 'progress',
      type: 'progress_tracker',
      heading: 'Our Goal',
      content: {
        type: 'progress_tracker',
        goal: 1000,
        current: 820,
        unit: 'families',
        startDate: 'January 1, 2024',
        endDate: 'December 31, 2024',
        daysLeft: 87,
      },
    },

    {
      id: 'what-were-doing',
      type: 'features',
      heading: 'What Each Family Receives',
      content: {
        type: 'features',
        layout: 'list',
        features: [
          {
            icon: '🎓',
            title: 'Professional Training Workshops',
            description: 'Comprehensive 2-day workshops for parents and caregivers covering autism basics, communication strategies, behavioral support techniques, and AAC implementation. Families learn practical skills they can use immediately at home.',
          },
          {
            icon: '🏥',
            title: 'Therapy & Assessment Services',
            description: '3 months of professional therapy sessions for children, including speech therapy, occupational therapy, and behavioral support. Each child receives an individualized assessment and customized treatment plan.',
          },
          {
            icon: '📚',
            title: 'Resource Materials & Tools',
            description: 'Communication boards, visual schedules, sensory tools, and educational materials tailored to each child\'s needs. Families receive a complete toolkit to support their child\'s development at home and in the community.',
          },
          {
            icon: '🤝',
            title: 'Community Support Network',
            description: 'Access to ongoing support groups, peer mentoring, and a network of families facing similar challenges. Monthly meetups create lasting connections and shared learning opportunities across districts.',
          },
          {
            icon: '📱',
            title: 'Follow-up & Guidance',
            description: 'Regular check-ins via phone and community visits to ensure families are implementing strategies successfully. Our team provides ongoing guidance and troubleshooting for 12 months after initial training.',
          },
          {
            icon: '🌟',
            title: 'Advocacy & Awareness',
            description: 'Training on how to advocate for your child in schools, healthcare settings, and the community. We empower families to become champions for autism acceptance and inclusion in their own neighborhoods.',
          },
        ],
      },
    },

    {
      id: 'timeline',
      type: 'timeline',
      heading: 'Campaign Timeline',
      content: {
        type: 'timeline',
        items: [
          {
            date: 'JAN-MAR',
            title: 'Launch Phase',
            description: '250 families reached with initial training and resources.',
            status: 'completed',
          },
          {
            date: 'APR-JUN',
            title: 'Expansion Phase',
            description: '300 more families joined (total: 550 families reached).',
            status: 'completed',
          },
          {
            date: 'JUL-SEP',
            title: 'Acceleration Phase',
            description: '270 more families supported (total: 820 families reached).',
            status: 'completed',
          },
          {
            date: 'OCT-DEC',
            title: 'Final Push',
            description: '180 families to go! Help us reach our goal of 1000 families.',
            status: 'active',
          },
        ],
      },
    },

    {
      id: 'impact-stats',
      type: 'stats',
      heading: 'Our Impact So Far',
      content: {
        type: 'stats',
        stats: [
          {
            icon: '👨‍👩‍👧',
            value: '820',
            label: 'Families Reached',
            sublabel: 'Across Nepal',
          },
          {
            icon: '👥',
            value: '2,460',
            label: 'People Impacted',
            sublabel: 'Including parents & siblings',
          },
          {
            icon: '🎓',
            value: '156',
            label: 'Training Sessions',
            sublabel: 'Completed',
          },
          {
            icon: '🗺️',
            value: '25',
            label: 'Districts Covered',
            sublabel: 'And growing',
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
        quote: 'Before this campaign, we felt alone and didn\'t know how to help our son. The training gave us tools and confidence. The support group gave us hope. Now we see progress every day.',
        person: 'Sita Rai',
        role: 'Mother of Aayush, age 6',
        location: 'Dhading District',
      },
    },

    {
      id: 'gallery',
      type: 'gallery',
      heading: 'Campaign Highlights',
      content: {
        type: 'gallery',
        layout: 'grid',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80',
            alt: 'Training workshop with families',
            caption: 'Parent training workshop in Kathmandu',
          },
          {
            url: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=600&q=80',
            alt: 'Community support group',
            caption: 'Community support group meeting',
          },
          {
            url: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=600&q=80',
            alt: 'Therapy session',
            caption: 'Therapy session with trained therapist',
          },
          {
            url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80',
            alt: 'Family celebration',
            caption: 'Celebrating progress milestones',
          },
        ],
      },
    },

    {
      id: 'cta',
      type: 'cta',
      content: {
        type: 'cta',
        title: 'Help Us Reach 1000 Families',
        description: 'We\'re 82% of the way there. With your support, we can reach 100%. Every contribution brings us closer to supporting 1000 families across Nepal before year-end.',
        buttons: [
          {
            label: 'Donate Now',
            url: '/donate',
            variant: 'primary',
          },
          {
            label: 'Volunteer With Us',
            url: '/get-involved',
            variant: 'outline',
          },
        ],
        backgroundStyle: 'gradient',
      },
    },
  ],
}
