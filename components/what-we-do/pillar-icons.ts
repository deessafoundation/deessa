import { ArrowRight, ArrowUpRight, BookOpen, ChevronRight, FileText, Globe, GraduationCap, Handshake, Heart, Lightbulb, Megaphone, Scale, Users, type LucideIcon } from "lucide-react"
import type { WhatWeDoCard } from "@/lib/types/what-we-do-settings"

export const PILLAR_ICONS: Record<WhatWeDoCard["icon"], LucideIcon> = {
  megaphone: Megaphone,
  "book-open": BookOpen,
  "file-text": FileText,
  scale: Scale,
  users: Users,
  heart: Heart,
  "graduation-cap": GraduationCap,
  handshake: Handshake,
  lightbulb: Lightbulb,
  globe: Globe,
}
export const PILLAR_ARROWS: Record<WhatWeDoCard["arrow"], LucideIcon> = {
  "arrow-right": ArrowRight,
  "chevron-right": ChevronRight,
  "arrow-up-right": ArrowUpRight,
}
