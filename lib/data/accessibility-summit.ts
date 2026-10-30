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
};
