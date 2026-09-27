#!/usr/bin/env node
/**
 * Remove dead campaign v1 CSS from program-demo.module.css
 *
 * Removes verified-unused campaign classes while preserving:
 * - .campaign theme root (line 679, used dynamically)
 * - .contribution and .amounts (lines 982-1033, attached to retained export)
 */

import fs from "fs"
import path from "path"

const filePath = "components/programs/demo/program-demo.module.css"

console.log("📋 Reading program-demo.module.css...")
const content = fs.readFileSync(filePath, "utf8")
const lines = content.split("\n")

console.log(`   Total lines: ${lines.length}`)

// Define ranges to remove (0-indexed, inclusive)
const rangesToRemove = [
  // Base campaign v1 classes (campaignHero through involveOption)
  { start: 686, end: 980, description: "campaignHero through involveOption base definitions" },

  // Responsive in @media(min-width:1500px)
  { start: 1562, end: 1566, description: ".campaignHeroInner in min-1500 media query" },

  // Responsive duplicates in @media(max-width:1050px)
  { start: 1889, end: 1889, description: ".involvement in max-1050 media query" },
  { start: 1933, end: 1940, description: ".updateGrid and .updateQuote in max-1050 media query" },

  // Responsive duplicates in @media(max-width:760px)
  {
    start: 1893,
    end: 1920,
    description: ".campaignHeroInner, .campaignHero h1, .campaignHeroBottom in max-760 media query",
  },
  { start: 2225, end: 2245, description: ".progressBand and .progressDetail in max-760 media query" },
  { start: 2279, end: 2297, description: ".updateGrid, .updateQuote, .involvement in max-760 media query" },

  // High-contrast selector (only the campaign parts)
  // Line 2635 has: .serviceCta, .campaignHero, .campaignUpdate, .researchStrip, .researchCta
  // We need to edit this line to remove .campaignHero and .campaignUpdate

  // High-contrast/responsive combined at end
  { start: 2733, end: 2838, description: "campaign v1 high-contrast and theme overrides" },

  // Additional responsive at end
  { start: 2948, end: 2991, description: "final campaign v1 responsive overrides" },
]

console.log(`\n🎯 Ranges to remove:`)
rangesToRemove.forEach((range, i) => {
  console.log(`   ${i + 1}. Lines ${range.start + 1}-${range.end + 1}: ${range.description}`)
})

// Create a set of line numbers to remove for fast lookup
const linesToRemove = new Set()
rangesToRemove.forEach(({ start, end }) => {
  for (let i = start; i <= end; i++) {
    linesToRemove.add(i)
  }
})

console.log(`\n   Total lines to remove: ${linesToRemove.size}`)

// Filter out lines to remove
let filteredLines = lines.filter((line, index) => !linesToRemove.has(index))

// Post-process: remove campaign classes from mixed high-contrast selector
filteredLines = filteredLines.map((line) => {
  // Line with mixed classes: .serviceCta, .campaignHero, .campaignUpdate, .researchStrip, .researchCta
  if (line.includes(":global(body.high-contrast) .root :is(.serviceCta, .campaignHero, .campaignUpdate,")) {
    return line.replace(", .campaignHero", "").replace(", .campaignUpdate", "")
  }
  return line
})

console.log(`   Remaining lines: ${filteredLines.length}`)

// Write back
const newContent = filteredLines.join("\n")
fs.writeFileSync(filePath, newContent, "utf8")

console.log(`\n✅ Dead campaign CSS removed from ${filePath}`)
console.log(`   ${lines.length} → ${filteredLines.length} lines (removed ${linesToRemove.size})`)

// Verify key classes are preserved
const preserved = [
  { pattern: /^\.campaign\s*\{/, name: ".campaign theme root" },
  { pattern: /^\.contribution\s*\{/, name: ".contribution" },
  { pattern: /^\.amounts\s*\{/, name: ".amounts" },
]

console.log(`\n🔍 Verifying preserved classes:`)
preserved.forEach(({ pattern, name }) => {
  const found = filteredLines.some((line) => pattern.test(line))
  console.log(`   ${found ? "✓" : "✗"} ${name}`)
})

// Verify removed classes are gone
const removed = [
  { pattern: /\.campaignHero[^a-z]/i, name: ".campaignHero" },
  { pattern: /\.progressBand/i, name: ".progressBand" },
  { pattern: /\.campaignManifesto/i, name: ".campaignManifesto" },
  { pattern: /\.updateGrid/i, name: ".updateGrid" },
  { pattern: /\.involvement/i, name: ".involvement" },
]

console.log(`\n🗑️  Verifying removed classes:`)
removed.forEach(({ pattern, name }) => {
  const found = filteredLines.some((line) => pattern.test(line))
  console.log(`   ${found ? "✗ STILL EXISTS" : "✓"} ${name}`)
})

console.log("\n✅ Done! Run pnpm build to verify.")
