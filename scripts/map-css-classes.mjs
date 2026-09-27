#!/usr/bin/env node
/**
 * Step 3a: Parse program-demo.module.css and map classes to destination files
 *
 * Analyzes which classes are used by which consumers and determines
 * the correct destination file for each class during the split.
 */

import fs from "fs"
import path from "path"

const COLORS = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
}

function color(c, text) {
  return `${c}${text}${COLORS.reset}`
}

// Parse CSS to extract class definitions
function parseClasses(cssContent) {
  const classes = new Map() // className -> { line: number, content: string }
  const lines = cssContent.split("\n")

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const match = line.match(/^\.([a-zA-Z_][\w-]*)/)

    if (match) {
      const className = match[1]
      if (!classes.has(className)) {
        classes.set(className, { line: i + 1, firstSeen: i + 1 })
      }
    }
  }

  return classes
}

// Parse TypeScript file to find className references
function findClassReferences(tsContent, filePath) {
  const refs = new Set()
  const fileName = path.basename(filePath)

  // Find all s.className patterns anywhere in the file
  const classRefRegex = /s\.(\w+)/g
  let match

  while ((match = classRefRegex.exec(tsContent)) !== null) {
    const className = match[1]
    // Filter out JavaScript methods (common false positives)
    if (
      ![
        "map",
        "filter",
        "find",
        "some",
        "every",
        "reduce",
        "forEach",
        "includes",
        "indexOf",
        "slice",
        "splice",
        "push",
        "pop",
        "shift",
        "unshift",
        "sort",
        "reverse",
        "join",
        "length",
        "toString",
        "valueOf",
        "constructor",
        "hasOwnProperty",
        "charAt",
        "charCodeAt",
        "concat",
        "endsWith",
        "startsWith",
        "match",
        "replace",
        "search",
        "split",
        "substring",
        "toLowerCase",
        "toUpperCase",
        "trim",
        "padStart",
        "padEnd",
        "repeat",
        "id",
        "type",
        "content",
        "findIndex",
        "children",
        "family",
        "learning",
        "community",
        "hands",
        "unsplash",
      ].includes(className)
    ) {
      refs.add(className)
    }
  }

  return { fileName, refs: Array.from(refs) }
}

// Classify classes based on naming patterns
function classifyClass(className) {
  // Theme roots (used dynamically)
  if (["service", "campaign", "outreach", "research"].includes(className)) {
    return "base"
  }

  // Service-specific
  if (className.startsWith("service")) return "service"
  if (className.startsWith("hero") && className.includes("Portrait")) return "service"
  if (className === "heroCopy") return "service" // Used by service
  if (className === "tinyLine") return "service"

  // Outreach-specific
  if (className.startsWith("outreach")) return "outreach"
  if (className.startsWith("paper") || className.startsWith("postcard")) return "outreach"
  if (className.startsWith("cover") && className.includes("Caption")) return "outreach"

  // Research-specific
  if (className.startsWith("research")) return "research"
  if (className.startsWith("concept")) return "research"
  if (className.startsWith("visual") || className.startsWith("board")) return "research"
  if (className.startsWith("word") || className === "sentence") return "research"
  if (className === "figureLabel" || className === "liveDot") return "research"

  // Campaign (kept as base since it's a theme root)
  if (className === "campaign") return "base"

  // Index-related (small, goes in base)
  if (className.startsWith("index")) return "base"

  // Contribution/amounts (retained export, goes in base)
  if (className === "contribution" || className === "amounts") return "base"

  // Shared/base classes
  if (
    [
      "root",
      "container",
      "section",
      "demoBar",
      "previewDot",
      "dummyLabel",
      "switcher",
      "photo",
      "kicker",
      "button",
      "textLink",
      "actions",
      "sectionHeading",
      "faqs",
      "nextConcept",
      "feedback",
      "actionWrap",
      "fineprint",
      "eyebrow",
      "metric",
      "metricGrid",
      "metricSection",
      "galleryGrid",
      "gallerySection",
      "essayGrid",
      "photoEssay",
      "storySection",
      "storyCredit",
      "miniStats",
      "supportGrid",
      "cardNumber",
      "serviceCta",
      "serviceFacts",
      "serviceIcon",
      "postcards",
      "postcardTop",
      "participantCount",
      "resources",
      "researchStages",
      "interactiveSection",
      "interactiveGrid",
      "checkList",
    ].includes(className)
  ) {
    return "base"
  }

  // Default to base for unclassified
  return "base"
}

// Main analysis
async function analyze() {
  console.log(color(COLORS.cyan, "\n📊 CSS Class Mapping Analysis\n"))

  // Read CSS
  const cssPath = "components/programs/demo/program-demo.module.css"
  const cssContent = fs.readFileSync(cssPath, "utf8")
  const classes = parseClasses(cssContent)

  console.log(`Found ${color(COLORS.green, classes.size)} classes in ${cssPath}\n`)

  // Read consumers
  const consumers = [
    "components/programs/demo/ProgramDemos.tsx",
    "components/programs/demo/DemoInteractions.tsx",
    "components/programs/templates/ServiceTemplate.tsx",
    "components/programs/templates/ResearchTemplate.tsx",
    "components/programs/templates/OutreachTemplate.tsx",
    "components/programs/templates/EditorialParts.tsx",
    "components/programs/templates/CampaignTemplate.tsx",
  ]

  const consumerRefs = new Map()

  for (const consumerPath of consumers) {
    if (!fs.existsSync(consumerPath)) continue
    const content = fs.readFileSync(consumerPath, "utf8")
    const refs = findClassReferences(content, consumerPath)
    consumerRefs.set(refs.fileName, refs.refs)
  }

  // Build usage map
  const usageMap = new Map() // className -> [consumers]
  const destinationMap = new Map() // className -> destination file

  for (const className of classes.keys()) {
    const usedBy = []
    for (const [consumer, refs] of consumerRefs.entries()) {
      if (refs.includes(className)) {
        usedBy.push(consumer)
      }
    }
    usageMap.set(className, usedBy)

    // Classify
    const dest = classifyClass(className)
    destinationMap.set(className, dest)
  }

  // Group by destination
  const byDestination = {
    base: [],
    service: [],
    outreach: [],
    research: [],
    unused: [],
  }

  for (const [className, dest] of destinationMap.entries()) {
    const usedBy = usageMap.get(className)
    if (usedBy.length === 0) {
      byDestination.unused.push(className)
    } else {
      byDestination[dest].push(className)
    }
  }

  // Report
  console.log(color(COLORS.blue, "📋 Destination File Assignments:\n"))

  for (const [dest, classList] of Object.entries(byDestination)) {
    if (classList.length === 0) continue

    const destColor =
      dest === "base"
        ? COLORS.green
        : dest === "service"
          ? COLORS.cyan
          : dest === "outreach"
            ? COLORS.yellow
            : dest === "research"
              ? COLORS.magenta
              : COLORS.reset

    console.log(color(destColor, `${dest.toUpperCase()}: ${classList.length} classes`))

    // Show first 10 classes
    const preview = classList.slice(0, 10).join(", ")
    console.log(`  ${preview}${classList.length > 10 ? "..." : ""}`)
    console.log()
  }

  // Unused classes report
  if (byDestination.unused.length > 0) {
    console.log(color(COLORS.yellow, `⚠️  Unused classes (${byDestination.unused.length}):`))
    console.log(`  ${byDestination.unused.join(", ")}\n`)
  }

  // Consumer usage report
  console.log(color(COLORS.blue, "📱 Consumer Usage:\n"))
  for (const [consumer, refs] of consumerRefs.entries()) {
    console.log(`  ${color(COLORS.cyan, consumer)}: ${refs.length} classes`)
  }

  // Write mapping to file for next steps
  const mapping = {
    timestamp: new Date().toISOString(),
    totalClasses: classes.size,
    assignments: {
      base: byDestination.base,
      service: byDestination.service,
      outreach: byDestination.outreach,
      research: byDestination.research,
      unused: byDestination.unused,
    },
    consumerUsage: Object.fromEntries(consumerRefs),
    classDetails: Object.fromEntries(
      Array.from(classes.entries()).map(([name, info]) => [
        name,
        {
          line: info.line,
          destination: destinationMap.get(name),
          usedBy: usageMap.get(name),
        },
      ]),
    ),
  }

  fs.writeFileSync("scripts/class-mapping.json", JSON.stringify(mapping, null, 2))
  console.log(color(COLORS.green, "\n✅ Mapping saved to scripts/class-mapping.json"))
  console.log(color(COLORS.cyan, "\nReady for Step 3b: Create new CSS module files\n"))
}

analyze().catch((err) => {
  console.error("Error:", err)
  process.exit(1)
})
