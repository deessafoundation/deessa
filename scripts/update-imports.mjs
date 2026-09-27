#!/usr/bin/env node
/**
 * Step 3f: Update imports in consumer files
 *
 * Updates the 7 consumer files to import from the new split CSS modules
 * according to the mapping created in Step 3a.
 */

import fs from "fs"

const COLORS = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
}

function color(c, text) {
  return `${c}${text}${COLORS.reset}`
}

// Import update patterns for each consumer
const updates = {
  "components/programs/demo/ProgramDemos.tsx": {
    pattern: /import\s+s\s+from\s+['"]\.\/program-demo\.module\.css['"]/,
    replacement: `import base from './program-base.module.css'\nimport service from './service-concept.module.css'\nimport outreach from './outreach-concept.module.css'\nimport research from './research-concept.module.css'`,
    description: "Import all modules (uses all concepts)",
    classUpdates: [
      // Dynamic access: s[category] becomes base[category]
      { from: /s\[category\]/g, to: "base[category]" },
      { from: /s\[page\.category\]/g, to: "base[page.category]" },
      // Service classes
      { from: /s\.serviceHero\b/g, to: "service.serviceHero" },
      { from: /s\.heroCopy\b/g, to: "service.heroCopy" },
      { from: /s\.tinyLine\b/g, to: "service.tinyLine" },
      { from: /s\.servicePortrait\b/g, to: "service.servicePortrait" },
      { from: /s\.serviceFacts\b/g, to: "service.serviceFacts" },
      { from: /s\.serviceJourney\b/g, to: "service.serviceJourney" },
      // Outreach classes
      { from: /s\.outreachIntro\b/g, to: "outreach.outreachIntro" },
      { from: /s\.outreachStamp\b/g, to: "outreach.outreachStamp" },
      { from: /s\.outreachCover\b/g, to: "outreach.outreachCover" },
      { from: /s\.paperLabel\b/g, to: "outreach.paperLabel" },
      { from: /s\.coverCaption\b/g, to: "outreach.coverCaption" },
      { from: /s\.outreachRibbon\b/g, to: "outreach.outreachRibbon" },
      { from: /s\.outreachOpening\b/g, to: "outreach.outreachOpening" },
      { from: /s\.postcards\b/g, to: "outreach.postcards" },
      { from: /s\.postcardTop\b/g, to: "outreach.postcardTop" },
      { from: /s\.outreachVoice\b/g, to: "outreach.outreachVoice" },
      { from: /s\.outreachCta\b/g, to: "outreach.outreachCta" },
      { from: /s\.outreachAsterisk\b/g, to: "outreach.outreachAsterisk" },
      // Research classes
      { from: /s\.researchHero\b/g, to: "research.researchHero" },
      { from: /s\.researchMeta\b/g, to: "research.researchMeta" },
      { from: /s\.researchHeroGrid\b/g, to: "research.researchHeroGrid" },
      { from: /s\.researchTags\b/g, to: "research.researchTags" },
      { from: /s\.researchVisual\b/g, to: "research.researchVisual" },
      { from: /s\.visualOrbit\b/g, to: "research.visualOrbit" },
      { from: /s\.conceptCard\b/g, to: "research.conceptCard" },
      { from: /s\.conceptCardLabel\b/g, to: "research.conceptCardLabel" },
      { from: /s\.conceptSymbols\b/g, to: "research.conceptSymbols" },
      { from: /s\.conceptRoutine\b/g, to: "research.conceptRoutine" },
      { from: /s\.conceptFoot\b/g, to: "research.conceptFoot" },
      { from: /s\.figureLabel\b/g, to: "research.figureLabel" },
      { from: /s\.researchStrip\b/g, to: "research.researchStrip" },
      { from: /s\.researchStages\b/g, to: "research.researchStages" },
      { from: /s\.interactiveSection\b/g, to: "research.interactiveSection" },
      { from: /s\.interactiveGrid\b/g, to: "research.interactiveGrid" },
      { from: /s\.checkList\b/g, to: "research.checkList" },
      { from: /s\.board\b/g, to: "research.board" },
      { from: /s\.boardTop\b/g, to: "research.boardTop" },
      { from: /s\.boardDot\b/g, to: "research.boardDot" },
      { from: /s\.boardGreeting\b/g, to: "research.boardGreeting" },
      { from: /s\.boardBottom\b/g, to: "research.boardBottom" },
      { from: /s\.sentence\b/g, to: "research.sentence" },
      { from: /s\.wordGrid\b/g, to: "research.wordGrid" },
      { from: /s\.researchNotes\b/g, to: "research.researchNotes" },
      { from: /s\.researchCta\b/g, to: "research.researchCta" },
      { from: /s\.liveDot\b/g, to: "research.liveDot" },
      // All other classes stay with base
    ],
  },

  "components/programs/demo/DemoInteractions.tsx": {
    pattern: /import\s+s\s+from\s+['"]\.\/program-demo\.module\.css['"]/,
    replacement: `import base from './program-base.module.css'\nimport research from './research-concept.module.css'`,
    description: "Import base + research (for CommunicationBoard)",
    classUpdates: [
      { from: /s\.board\b/g, to: "research.board" },
      { from: /s\.boardTop\b/g, to: "research.boardTop" },
      { from: /s\.boardDot\b/g, to: "research.boardDot" },
      { from: /s\.boardGreeting\b/g, to: "research.boardGreeting" },
      { from: /s\.boardBottom\b/g, to: "research.boardBottom" },
      { from: /s\.sentence\b/g, to: "research.sentence" },
      { from: /s\.wordGrid\b/g, to: "research.wordGrid" },
      { from: /s\./g, to: "base." }, // All others to base
    ],
  },

  "components/programs/templates/ServiceTemplate.tsx": {
    pattern: /import\s+s\s+from\s+['"]\.\.\/demo\/program-demo\.module\.css['"]/,
    replacement: `import base from '../demo/program-base.module.css'\nimport service from '../demo/service-concept.module.css'`,
    description: "Import base + service",
    classUpdates: [
      { from: /s\.serviceHero\b/g, to: "service.serviceHero" },
      { from: /s\.heroCopy\b/g, to: "service.heroCopy" },
      { from: /s\.tinyLine\b/g, to: "service.tinyLine" },
      { from: /s\.servicePortrait\b/g, to: "service.servicePortrait" },
      { from: /s\.serviceFacts\b/g, to: "service.serviceFacts" },
      { from: /s\.serviceIcon\b/g, to: "service.serviceIcon" },
      { from: /s\.serviceJourney\b/g, to: "service.serviceJourney" },
      { from: /s\.serviceCta\b/g, to: "service.serviceCta" },
      { from: /s\./g, to: "base." },
    ],
  },

  "components/programs/templates/ResearchTemplate.tsx": {
    pattern: /import\s+s\s+from\s+['"]\.\.\/demo\/program-demo\.module\.css['"]/,
    replacement: `import base from '../demo/program-base.module.css'\nimport research from '../demo/research-concept.module.css'`,
    description: "Import base + research",
    classUpdates: [
      { from: /s\.researchHero\b/g, to: "research.researchHero" },
      { from: /s\.researchMeta\b/g, to: "research.researchMeta" },
      { from: /s\.researchHeroGrid\b/g, to: "research.researchHeroGrid" },
      { from: /s\.researchTags\b/g, to: "research.researchTags" },
      { from: /s\.researchVisual\b/g, to: "research.researchVisual" },
      { from: /s\.visualOrbit\b/g, to: "research.visualOrbit" },
      { from: /s\.conceptCard\b/g, to: "research.conceptCard" },
      { from: /s\.conceptCardLabel\b/g, to: "research.conceptCardLabel" },
      { from: /s\.conceptSymbols\b/g, to: "research.conceptSymbols" },
      { from: /s\.conceptRoutine\b/g, to: "research.conceptRoutine" },
      { from: /s\.conceptFoot\b/g, to: "research.conceptFoot" },
      { from: /s\.figureLabel\b/g, to: "research.figureLabel" },
      { from: /s\.researchStrip\b/g, to: "research.researchStrip" },
      { from: /s\.researchStages\b/g, to: "research.researchStages" },
      { from: /s\.interactiveSection\b/g, to: "research.interactiveSection" },
      { from: /s\.interactiveGrid\b/g, to: "research.interactiveGrid" },
      { from: /s\.checkList\b/g, to: "research.checkList" },
      { from: /s\.researchNotes\b/g, to: "research.researchNotes" },
      { from: /s\.researchCta\b/g, to: "research.researchCta" },
      { from: /s\.liveDot\b/g, to: "research.liveDot" },
      { from: /s\./g, to: "base." },
    ],
  },

  "components/programs/templates/OutreachTemplate.tsx": {
    pattern: /import\s+s\s+from\s+['"]\.\.\/demo\/program-demo\.module\.css['"]/,
    replacement: `import base from '../demo/program-base.module.css'\nimport outreach from '../demo/outreach-concept.module.css'`,
    description: "Import base + outreach",
    classUpdates: [
      { from: /s\.outreachIntro\b/g, to: "outreach.outreachIntro" },
      { from: /s\.outreachStamp\b/g, to: "outreach.outreachStamp" },
      { from: /s\.outreachCover\b/g, to: "outreach.outreachCover" },
      { from: /s\.paperLabel\b/g, to: "outreach.paperLabel" },
      { from: /s\.coverCaption\b/g, to: "outreach.coverCaption" },
      { from: /s\.outreachRibbon\b/g, to: "outreach.outreachRibbon" },
      { from: /s\.outreachOpening\b/g, to: "outreach.outreachOpening" },
      { from: /s\.postcards\b/g, to: "outreach.postcards" },
      { from: /s\.postcardTop\b/g, to: "outreach.postcardTop" },
      { from: /s\.outreachVoice\b/g, to: "outreach.outreachVoice" },
      { from: /s\.outreachCta\b/g, to: "outreach.outreachCta" },
      { from: /s\.outreachAsterisk\b/g, to: "outreach.outreachAsterisk" },
      { from: /s\./g, to: "base." },
    ],
  },

  "components/programs/templates/EditorialParts.tsx": {
    pattern: /import\s+s\s+from\s+['"]\.\.\/demo\/program-demo\.module\.css['"]/,
    replacement: `import base from '../demo/program-base.module.css'\nimport research from '../demo/research-concept.module.css'`,
    description: "Import base + research (for .researchStages)",
    classUpdates: [
      { from: /s\.researchStages\b/g, to: "research.researchStages" },
      { from: /s\./g, to: "base." },
    ],
  },

  "components/programs/templates/CampaignTemplate.tsx": {
    pattern: /import\s+base\s+from\s+['"]\.\.\/demo\/program-demo\.module\.css['"]/,
    replacement: `import base from '../demo/program-base.module.css'`,
    description: "Just rename path (already uses base alias)",
    classUpdates: [], // Already uses base.*, just need to update path
  },
}

async function updateImports() {
  console.log(color(COLORS.cyan, "\n📝 Updating imports in consumer files\n"))

  let totalUpdated = 0

  for (const [filePath, { pattern, replacement, description, classUpdates }] of Object.entries(updates)) {
    if (!fs.existsSync(filePath)) {
      console.log(color(COLORS.yellow, `⚠️  ${filePath} not found, skipping`))
      continue
    }

    console.log(color(COLORS.cyan, `Updating ${filePath}...`))
    console.log(`  ${description}`)

    let content = fs.readFileSync(filePath, "utf8")
    const originalContent = content

    // Update import statement
    content = content.replace(pattern, replacement)

    // Update class references
    let classUpdateCount = 0
    for (const { from, to } of classUpdates) {
      const matches = (content.match(from) || []).length
      if (matches > 0) {
        content = content.replace(from, to)
        classUpdateCount += matches
      }
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content)
      console.log(color(COLORS.green, `  ✓ Updated import + ${classUpdateCount} class references\n`))
      totalUpdated++
    } else {
      console.log(color(COLORS.yellow, `  ⚠️  No changes made\n`))
    }
  }

  console.log(color(COLORS.green, `\n✅ Updated ${totalUpdated}/${Object.keys(updates).length} consumer files`))
  console.log(color(COLORS.cyan, "\nNext: Run pnpm build to verify\n"))
}

updateImports().catch((err) => {
  console.error("Error:", err.message)
  console.error(err.stack)
  process.exit(1)
})
