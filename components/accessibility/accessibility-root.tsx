"use client"

// ── Accessibility Root ──────────────────────────────────────────────────────
// Mount this once, around the public page tree. It provides the accessibility
// context to descendants and renders the single launcher + panel.
//
// Do not mount this in /admin: authenticated admin content must never be read
// aloud or extracted.

import type { ReactNode } from "react"

import { AccessibilityProvider } from "@/contexts/AccessibilityContext"

import { AccessibilityPanel } from "./accessibility-panel"

export function AccessibilityRoot({ children }: { children: ReactNode }) {
  return (
    <AccessibilityProvider>
      {children}
      <AccessibilityPanel />
    </AccessibilityProvider>
  )
}
