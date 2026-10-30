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

// Schedule data placeholder — will be populated when provided by organizer
export const summitSchedule: SummitScheduleDay[] = [];

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
