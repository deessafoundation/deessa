// Standalone public content. This event is intentionally independent of the CMS.

export type AccessibilityFeature = 
  | "sign-language" 
  | "captions" 
  | "audio-description" 
  | "wheelchair-accessible"
  | "sensory-friendly";

export interface SummitScheduleSession {
  id: string;
  time: string;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  speaker?: string;
  speakerRole?: string;
  track: string;
  room: string;
  accessibilityFeatures: AccessibilityFeature[];
}

export interface SummitScheduleDay {
  dayNumber: number;
  date: string;
  dateLabel: string;
  fullDate: string;
  theme: string;
  sessions: SummitScheduleSession[];
}

export interface SummitAccommodation {
  id: string;
  title: string;
  description: string;
  icon: "wheelchair" | "sign-language" | "captions" | "sensory" | "hearing" | "document";
}

export const summitAccommodations: SummitAccommodation[] = [
  {
    id: "physical-access",
    title: "Step-Free Physical Access",
    description: "Hotel Pauwa features level ground-floor entrances, ramps, wide corridors, and accessible restrooms for wheelchair and mobility aid users.",
    icon: "wheelchair",
  },
  {
    id: "sign-language",
    title: "Nepali Sign Language (NSL)",
    description: "Professional NSL interpreters will provide continuous interpretation on stage for all plenaries and parallel working tracks.",
    icon: "sign-language",
  },
  {
    id: "live-captions",
    title: "Real-Time CART Captions",
    description: "Live speech-to-text transcription will be displayed on hall screens and accessible directly on personal smartphones via web browser.",
    icon: "captions",
  },
  {
    id: "sensory-space",
    title: "Sensory Reset Quiet Room",
    description: "A dedicated quiet room with dimmable lighting, comfortable seating, and low auditory stimulation is available throughout both days.",
    icon: "sensory",
  },
  {
    id: "assistive-listening",
    title: "Assistive Listening Systems",
    description: "FM listening headsets and neck-loops are provided at the accessibility reception desk for hard-of-hearing attendees.",
    icon: "hearing",
  },
  {
    id: "accessible-materials",
    title: "Screen-Reader & Large Print Materials",
    description: "All program agendas, speaker bios, and presentation summaries are published in accessible HTML and screen-reader-compliant digital formats.",
    icon: "document",
  },
];

export const summitSchedule: SummitScheduleDay[] = [
  {
    dayNumber: 1,
    date: "2026-11-30",
    dateLabel: "Day 1: Monday, Nov 30",
    fullDate: "Monday, 30 November 2026",
    theme: "From Constitutional Rights to Everyday Access",
    sessions: [
      {
        id: "d1-s1",
        time: "08:30 AM – 09:30 AM",
        startTime: "08:30",
        endTime: "09:30",
        title: "Registration, Morning Tea & Accessibility Orientation",
        description: "Welcome desk check-in, distribution of accessible summit packets (large print, digital screen-reader format), assistive listening device allocation, and hall wayfinding orientation.",
        track: "Orientation",
        room: "Main Foyer & Reception (Ground Floor)",
        accessibilityFeatures: ["wheelchair-accessible", "sign-language", "sensory-friendly"],
      },
      {
        id: "d1-s2",
        time: "09:30 AM – 11:00 AM",
        startTime: "09:30",
        endTime: "11:00",
        title: "Opening Plenary: Bridging Constitutional Guarantees and Lived Experience",
        description: "Opening addresses by disability rights advocates, national commissioners, and OPD leaders examining progress and real-world implementation gaps under Nepal's Disability Rights Act 2074.",
        speaker: "National Disability Rights Commissioners & OPD Leaders",
        speakerRole: "Keynote Panel",
        track: "Plenary",
        room: "Machhapuchhre Hall (Main Auditorium)",
        accessibilityFeatures: ["wheelchair-accessible", "sign-language", "captions", "audio-description"],
      },
      {
        id: "d1-s3",
        time: "11:15 AM – 12:45 PM",
        startTime: "11:15",
        endTime: "12:45",
        title: "Thematic Panel: Inclusive Education from the Himalayas to the Terai",
        description: "Innovative approaches to Universal Design for Learning (UDL), accessible curriculum development, braille production, and assistive learning aids in rural community schools.",
        speaker: "Inclusive Educators & Assistive Tech Practitioners",
        track: "Inclusive Education",
        room: "Machhapuchhre Hall",
        accessibilityFeatures: ["wheelchair-accessible", "sign-language", "captions"],
      },
      {
        id: "d1-s4",
        time: "12:45 PM – 01:45 PM",
        startTime: "12:45",
        endTime: "13:45",
        title: "Community Lunch & Assistive Technology Exhibition",
        description: "Inclusive community meal with clear allergen/dietary labeling and tactile orientation, alongside live demonstrations of assistive devices designed in Nepal.",
        track: "Community & Networking",
        room: "Lakeside Pavilion & Dining Hall",
        accessibilityFeatures: ["wheelchair-accessible", "sensory-friendly"],
      },
      {
        id: "d1-s5",
        time: "01:45 PM – 03:15 PM",
        startTime: "13:45",
        endTime: "15:15",
        title: "Parallel Working Track: Accessible Healthcare & Community-Based Rehabilitation",
        description: "Breaking systemic physical, communication, and economic barriers in health posts, maternal care, and physical rehabilitation services across Gandaki Province and remote districts.",
        speaker: "CBR Coordinators & Health Access Advocates",
        track: "Healthcare & Rehabilitation",
        room: "Hall A (Ground Floor)",
        accessibilityFeatures: ["wheelchair-accessible", "sign-language", "captions"],
      },
      {
        id: "d1-s6",
        time: "03:30 PM – 05:00 PM",
        startTime: "15:30",
        endTime: "17:00",
        title: "Universal Design in Public Infrastructure & Tourism",
        description: "Concrete engineering and policy strategies to establish Pokhara as Nepal's first fully accessible international tourism and community recreation destination.",
        speaker: "Urban Planners, Tourism Board & Universal Design Architects",
        track: "Built Environment",
        room: "Machhapuchhre Hall",
        accessibilityFeatures: ["wheelchair-accessible", "sign-language", "captions", "audio-description"],
      },
    ],
  },
  {
    dayNumber: 2,
    date: "2026-12-01",
    dateLabel: "Day 2: Tuesday, Dec 1",
    fullDate: "Tuesday, 1 December 2026",
    theme: "Digital Futures, Livelihoods & Collective Action",
    sessions: [
      {
        id: "d2-s1",
        time: "09:00 AM – 10:30 AM",
        startTime: "09:00",
        endTime: "10:30",
        title: "Digital Accessibility, Mobile Apps & Web Standards in Nepal",
        description: "Implementing WCAG 2.2 AA standards across municipal portals, banking apps, and digital citizen services. Featuring live accessibility testing by blind and low-vision screen reader users.",
        speaker: "Accessibility Engineers & Assistive Software Testers",
        track: "Digital & Communication",
        room: "Machhapuchhre Hall",
        accessibilityFeatures: ["wheelchair-accessible", "sign-language", "captions"],
      },
      {
        id: "d2-s2",
        time: "10:45 AM – 12:15 PM",
        startTime: "10:45",
        endTime: "12:15",
        title: "Community Voices: Persons with Complex, Multiple & Neurodivergent Disabilities",
        description: "Direct first-person narratives spotlighting self-advocacy, personal assistance, autism acceptance, and social protection support for individuals from remote and marginalized communities.",
        speaker: "Self-Advocates & Family Caregiver Alliances",
        track: "Community Voices",
        room: "Machhapuchhre Hall",
        accessibilityFeatures: ["wheelchair-accessible", "sign-language", "captions", "sensory-friendly"],
      },
      {
        id: "d2-s3",
        time: "12:15 PM – 01:15 PM",
        startTime: "12:15",
        endTime: "13:15",
        title: "Networking Lunch & Youth Innovators Showcase",
        description: "Community lunch gathering celebrating innovations developed by disabled youth leaders, student engineers, and inclusive arts creators.",
        track: "Networking",
        room: "Lakeside Pavilion & Dining Hall",
        accessibilityFeatures: ["wheelchair-accessible", "sensory-friendly"],
      },
      {
        id: "d2-s4",
        time: "01:15 PM – 02:45 PM",
        startTime: "13:15",
        endTime: "14:45",
        title: "Action Roundtables: Co-Designing Inclusive Employment & Entrepreneurship",
        description: "Interactive roundtables bringing together employers, chamber of commerce representatives, and disabled entrepreneurs to establish concrete hiring and retention pathways.",
        speaker: "Private Sector Employers & Inclusive Employment Champions",
        track: "Livelihoods",
        room: "Breakout Rooms 1 & 2",
        accessibilityFeatures: ["wheelchair-accessible", "sign-language"],
      },
      {
        id: "d2-s5",
        time: "03:00 PM – 04:30 PM",
        startTime: "15:00",
        endTime: "16:30",
        title: "Adoption of the Pokhara Accessibility Declaration & Next Steps",
        description: "Review, consensus-building, and official adoption of the Pokhara 2026 Declaration on Disability Rights and Accessibility Infrastructure, setting binding multi-sector benchmarks.",
        speaker: "Summit Drafting Committee & Multi-Sector Stakeholders",
        track: "Plenary & Advocacy",
        room: "Machhapuchhre Hall",
        accessibilityFeatures: ["wheelchair-accessible", "sign-language", "captions", "audio-description"],
      },
      {
        id: "d2-s6",
        time: "04:30 PM – 05:00 PM",
        startTime: "16:30",
        endTime: "17:00",
        title: "Closing Ceremonies, Inclusive Cultural Showcase & Farewell",
        description: "Celebratory closing ceremony featuring inclusive musical performances, sign-language poetry, and token distribution to volunteers and organizers.",
        track: "Closing",
        room: "Machhapuchhre Hall",
        accessibilityFeatures: ["wheelchair-accessible", "sign-language", "captions"],
      },
    ],
  },
];

export const accessibilitySummit = {
  id: "standalone-accessibility-summit-2026",
  title: "Nepal Accessibility Summit 2026",
  slug: "nepal-accessibility-summit-2026",
  short_description: "Accessible Nepal: inclusive education, health, social protection & urban futures.",
  event_date: "2026-11-30",
  event_end_date: "2026-12-01",
  event_time: "09:00 AM (Nepal time)",
  location: "Pokhara, Nepal",
  venue_name: "Hotel Pauwa, Lakeside Street No.1",
  image: "/events/accessibility-summit/poster.jpg",
  banner_url: "/events/accessibility-summit/poster.jpg",
  inner_poster: "/events/accessibility-summit/inner-poster.jpeg",
  category: "conference" as const,
  is_free: false,
  facebookUrl: "https://www.facebook.com/share/19b3vkYJoN/",
  email: "nepalaccessibilitysummit@gmail.com",
  venueMapUrl: "https://maps.google.com/?q=Hotel+Pauwa+Lakeside+Pokhara",
  schedule: summitSchedule,
  accommodations: summitAccommodations,
};
