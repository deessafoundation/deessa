#!/usr/bin/env node
/**
 * Steps 3b-3e: Extract CSS classes to new module files
 *
 * Reads the class mapping and extracts complete CSS rules (including
 * media queries, pseudo-classes, and high-contrast variants) to new files.
 */

import fs from "fs"

const COLORS = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
}

function color(c, text) {
  return `${c}${text}${COLORS.reset}`
}

// Parse CSS into AST-like structure
function parseCSS(cssContent) {
  const lines = cssContent.split("\n")
  const rules = []
  let currentRule = null
  let braceDepth = 0
  let inMediaQuery = false
  let mediaQueryBlock = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Track media queries
    if (trimmed.startsWith("@media")) {
      inMediaQuery = true
      mediaQueryBlock = {
        start: i,
        query: trimmed,
        rules: [],
      }
      continue
    }

    // Track braces
    const openBraces = (line.match(/{/g) || []).length
    const closeBraces = (line.match(/}/g) || []).length
    braceDepth += openBraces - closeBraces

    // Media query closing
    if (inMediaQuery && braceDepth === 0 && closeBraces > 0) {
      inMediaQuery = false
      if (mediaQueryBlock) {
        rules.push({ type: "media", ...mediaQueryBlock, end: i })
        mediaQueryBlock = null
      }
      continue
    }

    // Class definition start
    const classMatch = trimmed.match(/^\.([a-zA-Z_][\w-]*)/)
    if (classMatch && !inMediaQuery) {
      if (currentRule) {
        currentRule.end = i - 1
        rules.push(currentRule)
      }
      currentRule = {
        type: "rule",
        className: classMatch[1],
        start: i,
        lines: [line],
      }
    } else if (currentRule) {
      currentRule.lines.push(line)

      // Rule ended
      if (braceDepth === 0 && closeBraces > 0) {
        currentRule.end = i
        rules.push(currentRule)
        currentRule = null
      }
    } else if (inMediaQuery && mediaQueryBlock) {
      // Inside media query - track the class
      const mediaClassMatch = trimmed.match(/^\.([a-zA-Z_][\w-]*)/)
      if (mediaClassMatch) {
        const mediaRule = {
          className: mediaClassMatch[1],
          start: i,
          lines: [line],
        }
        mediaQueryBlock.rules.push(mediaRule)
      } else if (mediaQueryBlock.rules.length > 0) {
        const lastRule = mediaQueryBlock.rules[mediaQueryBlock.rules.length - 1]
        if (!lastRule.end) {
          lastRule.lines.push(line)
          if (braceDepth === 1 && closeBraces > 0) {
            lastRule.end = i
          }
        }
      }
    }
  }

  return rules
}

// Extract rules for specific classes
function extractRulesForClasses(rules, classNames) {
  const extracted = []
  const classSet = new Set(classNames)

  for (const rule of rules) {
    if (rule.type === "rule" && classSet.has(rule.className)) {
      extracted.push(rule)
    } else if (rule.type === "media") {
      // Check if any rules in this media query match our classes
      const matchingMediaRules = rule.rules.filter((r) => classSet.has(r.className))
      if (matchingMediaRules.length > 0) {
        extracted.push({
          ...rule,
          rules: matchingMediaRules,
        })
      }
    }
  }

  return extracted
}

// Generate CSS content from rules
function generateCSS(rules, header) {
  let output = header + "\n\n"
  const processed = new Set()

  // First, output all base rules
  for (const rule of rules) {
    if (rule.type === "rule" && !processed.has(rule.className)) {
      output += rule.lines.join("\n") + "\n\n"
      processed.add(rule.className)
    }
  }

  // Then output media queries
  let lastMediaQuery = null
  for (const rule of rules) {
    if (rule.type === "media") {
      // Group rules by media query
      if (rule.query !== lastMediaQuery) {
        if (lastMediaQuery) output += "}\n\n"
        output += rule.query + " {\n"
        lastMediaQuery = rule.query
      }

      for (const mediaRule of rule.rules) {
        if (!processed.has(`${rule.query}:${mediaRule.className}`)) {
          output += mediaRule.lines.map((l) => "  " + l).join("\n") + "\n\n"
          processed.add(`${rule.query}:${mediaRule.className}`)
        }
      }
    }
  }

  if (lastMediaQuery) {
    output += "}\n"
  }

  return output.trim() + "\n"
}

// Main extraction
async function extract() {
  console.log(color(COLORS.cyan, "\n🔧 Extracting CSS Modules\n"))

  // Load mapping
  const mapping = JSON.parse(fs.readFileSync("scripts/class-mapping.json", "utf8"))
  console.log(`Loaded mapping with ${mapping.totalClasses} classes\n`)

  // Load source CSS
  const sourceCSS = fs.readFileSync("components/programs/demo/program-demo.module.css", "utf8")
  const rules = parseCSS(sourceCSS)
  console.log(`Parsed ${rules.length} CSS rules\n`)

  // Extract to each destination
  const destinations = {
    "program-base.module.css": {
      classes: mapping.assignments.base,
      header: `/**
 * Program Base Styles
 * 
 * Shared layout, navigation, and theme root classes used across
 * all program demonstration concepts.
 * 
 * Theme roots (.service, .outreach, .research) enable dynamic
 * styling via s[category] access pattern.
 */`,
    },
    "service-concept.module.css": {
      classes: mapping.assignments.service,
      header: `/**
 * Service Concept Styles
 * 
 * Visual styling for the AAC Support services demonstration,
 * featuring ocean blue theme with portrait photography.
 */`,
    },
    "outreach-concept.module.css": {
      classes: mapping.assignments.outreach,
      header: `/**
 * Outreach Concept Styles
 * 
 * Field journal aesthetic for community outreach programs,
 * with paper postcards and stamp decorations.
 */`,
    },
    "research-concept.module.css": {
      classes: mapping.assignments.research,
      header: `/**
 * Research Concept Styles
 * 
 * Technical notebook styling for DEESSA Companion research
 * demonstration, featuring interactive communication boards.
 */`,
    },
  }

  for (const [filename, { classes, header }] of Object.entries(destinations)) {
    if (classes.length === 0) continue

    console.log(color(COLORS.blue, `Creating ${filename}...`))
    console.log(`  Extracting ${classes.length} classes`)

    const extracted = extractRulesForClasses(rules, classes)
    console.log(`  Found ${extracted.length} rules (including media queries)`)

    const css = generateCSS(extracted, header)
    const outPath = `components/programs/demo/${filename}`
    fs.writeFileSync(outPath, css)

    const lines = css.split("\n").length
    console.log(color(COLORS.green, `  ✓ ${outPath} (${lines} lines)\n`))
  }

  console.log(color(COLORS.green, "✅ All CSS modules created!"))
  console.log(color(COLORS.cyan, "\nNext: Step 3f - Update imports in consumer files\n"))
}

extract().catch((err) => {
  console.error(color(COLORS.yellow, "Error:"), err.message)
  console.error(err.stack)
  process.exit(1)
})
