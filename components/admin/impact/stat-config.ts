import {
  Heart,
  School,
  Users,
  GraduationCap,
  MapPin,
  Stethoscope,
  Smile,
  Trophy,
  BookOpen,
  Baby,
  Building,
  HandHeart,
  Sparkles,
  Globe,
  Activity,
  ShieldCheck,
  Target,
  Award,
  Lightbulb,
  Briefcase,
  Calendar,
  BarChart3,
  DollarSign,
  Home,
  type LucideIcon,
} from "lucide-react"

export interface StatIconOption {
  key: string
  label: string
  icon: LucideIcon
  category: "community" | "education" | "health" | "milestone" | "general"
}

export const STAT_ICONS: StatIconOption[] = [
  { key: "heart", label: "Heart / Care", icon: Heart, category: "community" },
  { key: "users", label: "Community / People", icon: Users, category: "community" },
  { key: "smile", label: "Autism / Children", icon: Smile, category: "community" },
  { key: "baby", label: "Early Childhood", icon: Baby, category: "community" },
  { key: "hand-heart", label: "Volunteers / Giving", icon: HandHeart, category: "community" },

  { key: "school", label: "School / Classrooms", icon: School, category: "education" },
  { key: "graduation-cap", label: "Scholarships / Students", icon: GraduationCap, category: "education" },
  { key: "book-open", label: "Books / Training", icon: BookOpen, category: "education" },
  { key: "lightbulb", label: "Innovation / Learning", icon: Lightbulb, category: "education" },

  { key: "stethoscope", label: "Health / Medical Camps", icon: Stethoscope, category: "health" },
  { key: "activity", label: "Healthcare / Vitality", icon: Activity, category: "health" },

  { key: "trophy", label: "Achievements", icon: Trophy, category: "milestone" },
  { key: "award", label: "Honors / Recognition", icon: Award, category: "milestone" },
  { key: "target", label: "Milestones / Goals", icon: Target, category: "milestone" },
  { key: "sparkles", label: "Impact / Transformation", icon: Sparkles, category: "milestone" },

  { key: "map-pin", label: "Districts / Location", icon: MapPin, category: "general" },
  { key: "globe", label: "Nationwide / Global", icon: Globe, category: "general" },
  { key: "building", label: "Centers / Infrastructure", icon: Building, category: "general" },
  { key: "home", label: "Villages / Home", icon: Home, category: "general" },
  { key: "shield-check", label: "Trust & Transparency", icon: ShieldCheck, category: "general" },
  { key: "chart", label: "Performance / Analytics", icon: BarChart3, category: "general" },
  { key: "briefcase", label: "Programs & Ops", icon: Briefcase, category: "general" },
  { key: "calendar", label: "Years / Timeline", icon: Calendar, category: "general" },
  { key: "dollar", label: "Funding / Grants", icon: DollarSign, category: "general" },
]

export const STAT_ICON_MAP: Record<string, LucideIcon> = {
  heart: Heart,
  users: Users,
  groups: Users,
  smile: Smile,
  baby: Baby,
  "hand-heart": HandHeart,
  school: School,
  "graduation-cap": GraduationCap,
  "book-open": BookOpen,
  lightbulb: Lightbulb,
  stethoscope: Stethoscope,
  medical: Stethoscope,
  activity: Activity,
  trophy: Trophy,
  award: Award,
  target: Target,
  sparkles: Sparkles,
  "map-pin": MapPin,
  location: MapPin,
  globe: Globe,
  building: Building,
  home: Home,
  "shield-check": ShieldCheck,
  chart: BarChart3,
  briefcase: Briefcase,
  calendar: Calendar,
  dollar: DollarSign,
}

export function getStatIcon(iconKey?: string | null): LucideIcon {
  if (!iconKey) return BarChart3
  const normalized = iconKey.toLowerCase().trim()
  return STAT_ICON_MAP[normalized] || BarChart3
}

export interface ColorOption {
  hex: string
  name: string
  bgTint: string
  borderTint: string
}

export const BRAND_COLORS: ColorOption[] = [
  {
    hex: "#3FABDE",
    name: "Ocean Blue",
    bgTint: "rgba(63, 171, 222, 0.12)",
    borderTint: "rgba(63, 171, 222, 0.35)",
  },
  {
    hex: "#0B5F8A",
    name: "Deep Ocean",
    bgTint: "rgba(11, 95, 138, 0.12)",
    borderTint: "rgba(11, 95, 138, 0.35)",
  },
  {
    hex: "#10B981",
    name: "Emerald Green",
    bgTint: "rgba(16, 185, 129, 0.12)",
    borderTint: "rgba(16, 185, 129, 0.35)",
  },
  {
    hex: "#F59E0B",
    name: "Amber Warmth",
    bgTint: "rgba(245, 158, 11, 0.12)",
    borderTint: "rgba(245, 158, 11, 0.35)",
  },
  {
    hex: "#8B5CF6",
    name: "Royal Violet",
    bgTint: "rgba(139, 92, 246, 0.12)",
    borderTint: "rgba(139, 92, 246, 0.35)",
  },
  {
    hex: "#EC4899",
    name: "Care Rose",
    bgTint: "rgba(236, 72, 153, 0.12)",
    borderTint: "rgba(236, 72, 153, 0.35)",
  },
  {
    hex: "#06B6D4",
    name: "Cyan Waters",
    bgTint: "rgba(6, 182, 212, 0.12)",
    borderTint: "rgba(6, 182, 212, 0.35)",
  },
  {
    hex: "#6366F1",
    name: "Indigo Rights",
    bgTint: "rgba(99, 102, 241, 0.12)",
    borderTint: "rgba(99, 102, 241, 0.35)",
  },
  {
    hex: "#EF4444",
    name: "Urgent Crimson",
    bgTint: "rgba(239, 68, 68, 0.12)",
    borderTint: "rgba(239, 68, 68, 0.35)",
  },
]

export function getColorTokens(colorHex?: string | null): ColorOption {
  if (!colorHex) return BRAND_COLORS[0]
  const match = BRAND_COLORS.find(
    (c) => c.hex.toLowerCase() === colorHex.toLowerCase()
  )
  if (match) return match

  return {
    hex: colorHex,
    name: "Custom",
    bgTint: `${colorHex}20`,
    borderTint: `${colorHex}50`,
  }
}
