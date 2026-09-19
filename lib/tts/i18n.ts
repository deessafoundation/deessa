// ── Accessibility Panel UI Strings ──────────────────────────────────────────
// English and Nepali labels for the accessibility panel.
//
// NOTE FOR REVIEWERS: the Nepali strings below are a first pass and must be
// validated by a fluent Nepali speaker before release, per the implementation
// plan. They are Unicode Devanagari, not transliteration.

import type { SupportedSpeechLocale } from "./types"

export interface PanelStrings {
  accessibility: string
  listenToPage: string
  listenHint: string
  readPage: string
  restart: string
  pause: string
  resume: string
  stop: string
  previousSection: string
  nextSection: string
  language: string
  english: string
  nepali: string
  speed: string
  pitch: string
  voice: string
  voiceDefault: string
  highlightSpokenText: string
  autoReadNewPages: string
  autoReadHint: string
  display: string
  textSize: string
  increaseTextSize: string
  decreaseTextSize: string
  highContrast: string
  reduceMotion: string
  calmingMode: string
  resetAll: string
  on: string
  off: string
  close: string
  open: string
  statusReady: string
  statusLoading: string
  statusSpeaking: string
  statusPaused: string
  statusFinished: string
  statusError: string
  sectionProgress: (current: number, total: number) => string
  noVoiceInstalled: string
  noVoiceHelp: string
  substituteVoiceTitle: (language: string) => string
  substituteVoiceHelp: string
  unsupported: string
  nothingToRead: string
  errorGeneric: string
  errorBlocked: string
  keyboardHint: string
  footerNote: string
}

const EN: PanelStrings = {
  accessibility: "Accessibility",
  listenToPage: "Listen to this page",
  listenHint: "Choose a voice and listen at your own pace.",
  readPage: "Read page",
  restart: "Restart",
  pause: "Pause",
  resume: "Resume",
  stop: "Stop",
  previousSection: "Previous section",
  nextSection: "Next section",
  language: "Language",
  english: "English",
  nepali: "Nepali",
  speed: "Speed",
  pitch: "Pitch",
  voice: "Voice",
  voiceDefault: "Natural (Default)",
  highlightSpokenText: "Highlight spoken text",
  autoReadNewPages: "Auto-read new pages",
  autoReadHint: "Starts reading automatically when you open another page.",
  display: "Display",
  textSize: "Text size",
  increaseTextSize: "Increase text size",
  decreaseTextSize: "Decrease text size",
  highContrast: "High contrast",
  reduceMotion: "Reduce motion",
  calmingMode: "Calming mode",
  resetAll: "Reset all",
  on: "ON",
  off: "OFF",
  close: "Close accessibility panel",
  open: "Open accessibility tools",
  statusReady: "Ready",
  statusLoading: "Loading voice",
  statusSpeaking: "Speaking",
  statusPaused: "Paused",
  statusFinished: "Finished",
  statusError: "Error",
  sectionProgress: (current, total) => `Section ${current} of ${total}`,
  noVoiceInstalled: "No Nepali voice is installed",
  noVoiceHelp:
    "Add a Nepali (ne-NP) voice in your device's language or speech settings, then reopen this panel.",
  substituteVoiceTitle: (language) => `Reading Nepali with a ${language} voice`,
  substituteVoiceHelp:
    "Your device has no Nepali voice. Nepali shares the Devanagari script with this language, so the words are correct but the accent is not Nepali. Install a Nepali (ne-NP) voice for the real thing.",
  unsupported: "This browser does not support speech synthesis.",
  nothingToRead: "There is no readable content on this page.",
  errorGeneric: "Speech stopped unexpectedly. Please try again.",
  errorBlocked: "Your browser blocked audio. Press Read page to start.",
  keyboardHint:
    "Keyboard: Space pauses or resumes, Escape stops, Alt + Arrow moves between sections.",
  footerNote:
    "These tools work alongside your screen reader. They do not replace it.",
}

const NE: PanelStrings = {
  accessibility: "पहुँचयोग्यता",
  listenToPage: "यो पृष्ठ सुन्नुहोस्",
  listenHint: "आफ्नो सुविधाअनुसार आवाज छनोट गरी सुन्नुहोस्।",
  readPage: "पृष्ठ पढ्नुहोस्",
  restart: "सुरुदेखि पढ्नुहोस्",
  pause: "रोक्नुहोस्",
  resume: "जारी राख्नुहोस्",
  stop: "बन्द गर्नुहोस्",
  previousSection: "अघिल्लो खण्ड",
  nextSection: "अर्को खण्ड",
  language: "भाषा",
  english: "अंग्रेजी",
  nepali: "नेपाली",
  speed: "गति",
  pitch: "स्वरमान",
  voice: "आवाज",
  voiceDefault: "स्वाभाविक (पूर्वनिर्धारित)",
  highlightSpokenText: "पढिएको पाठ देखाउनुहोस्",
  autoReadNewPages: "नयाँ पृष्ठ स्वतः पढ्नुहोस्",
  autoReadHint: "अर्को पृष्ठ खोल्दा स्वतः पढ्न सुरु गर्छ।",
  display: "देखावट",
  textSize: "अक्षरको आकार",
  increaseTextSize: "अक्षरको आकार बढाउनुहोस्",
  decreaseTextSize: "अक्षरको आकार घटाउनुहोस्",
  highContrast: "उच्च कन्ट्रास्ट",
  reduceMotion: "चलायमान कम गर्नुहोस्",
  calmingMode: "शान्त मोड",
  resetAll: "सबै पूर्वस्थितिमा फर्काउनुहोस्",
  on: "सक्रिय",
  off: "निष्क्रिय",
  close: "पहुँचयोग्यता प्यानल बन्द गर्नुहोस्",
  open: "पहुँचयोग्यता उपकरण खोल्नुहोस्",
  statusReady: "तयार",
  statusLoading: "आवाज लोड हुँदैछ",
  statusSpeaking: "पढिँदैछ",
  statusPaused: "रोकिएको छ",
  statusFinished: "सम्पन्न भयो",
  statusError: "त्रुटि",
  sectionProgress: (current, total) => `खण्ड ${current} / ${total}`,
  noVoiceInstalled: "नेपाली आवाज उपलब्ध छैन",
  noVoiceHelp:
    "आफ्नो यन्त्रको भाषा वा आवाज सेटिङमा नेपाली (ne-NP) आवाज थप्नुहोस्, त्यसपछि यो प्यानल पुनः खोल्नुहोस्।",
  substituteVoiceTitle: (language) =>
    `नेपाली ${language} आवाजमा पढिँदैछ`,
  substituteVoiceHelp:
    "तपाईंको यन्त्रमा नेपाली आवाज छैन। नेपाली र यो भाषा दुवै देवनागरी लिपि प्रयोग गर्छन्, त्यसैले शब्दहरू सही छन् तर लवज नेपाली होइन। साँचो नेपाली उच्चारणका लागि नेपाली (ne-NP) आवाज स्थापना गर्नुहोस्।",
  unsupported: "यो ब्राउजरले आवाज सुविधा समर्थन गर्दैन।",
  nothingToRead: "यो पृष्ठमा पढ्न मिल्ने सामग्री छैन।",
  errorGeneric: "पढ्ने क्रम अचानक रोकियो। कृपया पुनः प्रयास गर्नुहोस्।",
  errorBlocked:
    "तपाईंको ब्राउजरले आवाज रोक्यो। सुरु गर्न ‘पृष्ठ पढ्नुहोस्’ थिच्नुहोस्।",
  keyboardHint:
    "किबोर्ड: Space ले रोक्छ वा जारी राख्छ, Escape ले बन्द गर्छ, Alt + Arrow ले खण्ड बदल्छ।",
  footerNote:
    "यी उपकरणहरू तपाईंको स्क्रिन रिडरसँगै काम गर्छन्, यसको विकल्प होइनन्।",
}

const STRINGS: Record<SupportedSpeechLocale, PanelStrings> = {
  "en-US": EN,
  "ne-NP": NE,
}

export function getPanelStrings(locale: SupportedSpeechLocale): PanelStrings {
  return STRINGS[locale] ?? EN
}

/** HTML `lang` value for the panel itself, so it is pronounced correctly. */
export function htmlLangFor(locale: SupportedSpeechLocale): string {
  return locale === "ne-NP" ? "ne" : "en"
}
