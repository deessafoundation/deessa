// Temporary Advocacy-first rollout. Restore these areas when their pages are ready.
// Keep their saved content intact; clickable cards open designed empty states for now.
export const PAUSED_WHAT_WE_DO_AREAS = ["awareness", "training", "resources"] as const
export function isWhatWeDoAreaPaused(slug: string) {
  return PAUSED_WHAT_WE_DO_AREAS.some(area => area === slug)
}
