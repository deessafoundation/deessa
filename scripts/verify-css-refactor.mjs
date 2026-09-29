#!/usr/bin/env node
/**
 * CSS Refactor Verification Script
 *
 * Verifies that CSS module refactoring maintains all functionality:
 * 1. All class references resolve to imported modules
 * 2. No duplicate class definitions across split files
 * 3. All consumers can import their required classes
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
}

function log(color, prefix, message) {
  console.log(`${color}${prefix}${COLORS.reset} ${message}`)
}

function error(message) {
  log(COLORS.red, "✗", message)
}

function success(message) {
  log(COLORS.green, "✓", message)
}

function info(message) {
  log(COLORS.blue, "ℹ", message)
}

function warn(message) {
  log(COLORS.yellow, "⚠", message)
}

/**
 * Parse CSS module to extract class names
 */
function parseCSSClasses(cssContent) {
  const classes = new Set()

  // Match class selectors: .className
  const classRegex = /\.([a-zA-Z_][\w-]*)/g
  let match

  while ((match = classRegex.exec(cssContent)) !== null) {
    const className = match[1]
    // Exclude pseudo-classes and special selectors
    if (!className.includes(":") && !className.startsWith("-")) {
      classes.add(className)
    }
  }

  return classes
}

/**
 * Parse TypeScript/React file to extract CSS module references
 */
function parseModuleReferences(fileContent, filePath) {
  const imports = []
  const references = new Set()

  // Extract imports: import s from './styles.module.css'
  const importRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+\.module\.css)['"]/g
  let match

  while ((match = importRegex.exec(fileContent)) !== null) {
    const [, alias, modulePath] = match
    const resolvedPath = path.resolve(path.dirname(filePath), modulePath)
    imports.push({ alias, modulePath, resolvedPath })
  }

  // Extract class references: s.className inside className="..." or className={...}
  // This avoids false positives from array methods
  for (const { alias } of imports) {
    // Match className={s.foo} or className={cn(s.foo, ...)}
    const classNameRegex = new RegExp(`className\\s*=\\s*[{]?[^}]*?${alias}\\.(\\w+)`, "g")
    while ((match = classNameRegex.exec(fileContent)) !== null) {
      references.add({ alias, className: match[1] })
    }

    // Also check for dynamic access: s[key]
    const dynamicRegex = new RegExp(`${alias}\\[`, "g")
    if (dynamicRegex.test(fileContent)) {
      warn(`Dynamic class access found in ${path.basename(filePath)} with ${alias}[]`)
    }
  }

  return { imports, references: Array.from(references) }
}

/**
 * Main verification function
 */
function verify() {
  info("Starting CSS refactor verification...\n")

  let hasErrors = false
  const errors = []
  const warnings = []

  // Find all CSS modules in components/programs/demo
  const demoDir = path.resolve(process.cwd(), "components/programs/demo")
  const cssModules = fs
    .readdirSync(demoDir)
    .filter((f) => f.endsWith(".module.css"))
    .map((f) => path.join(demoDir, f))

  info(`Found ${cssModules.length} CSS module(s) in components/programs/demo/`)

  // Build class → file mapping
  const classToFile = new Map()
  const fileToClasses = new Map()

  for (const cssFile of cssModules) {
    const content = fs.readFileSync(cssFile, "utf8")
    const classes = parseCSSClasses(content)
    const fileName = path.basename(cssFile)

    fileToClasses.set(fileName, classes)

    for (const className of classes) {
      if (classToFile.has(className)) {
        const existing = classToFile.get(className)
        errors.push(`Duplicate class .${className} found in:\n  - ${existing}\n  - ${fileName}`)
        hasErrors = true
      } else {
        classToFile.set(className, fileName)
      }
    }

    console.log(`  ${COLORS.cyan}${fileName}${COLORS.reset}: ${classes.size} classes`)
  }

  console.log()

  // Find all consumers
  const consumers = [
    "components/programs/demo/ProgramDemos.tsx",
    "components/programs/demo/DemoInteractions.tsx",
    "components/programs/templates/ServiceTemplate.tsx",
    "components/programs/templates/ResearchTemplate.tsx",
    "components/programs/templates/OutreachTemplate.tsx",
    "components/programs/templates/EditorialParts.tsx",
    "components/programs/templates/CampaignTemplate.tsx",
  ]

  info(`Verifying ${consumers.length} consumer file(s)...\n`)

  for (const consumerPath of consumers) {
    const fullPath = path.resolve(process.cwd(), consumerPath)

    if (!fs.existsSync(fullPath)) {
      errors.push(`Consumer file not found: ${consumerPath}`)
      hasErrors = true
      continue
    }

    const content = fs.readFileSync(fullPath, "utf8")
    const { imports, references } = parseModuleReferences(content, fullPath)
    const fileName = path.basename(consumerPath)

    console.log(`  ${COLORS.cyan}${fileName}${COLORS.reset}`)
    console.log(`    Imports: ${imports.map((i) => i.alias).join(", ") || "none"}`)

    // Verify each reference can be resolved
    for (const { alias, className } of references) {
      const importInfo = imports.find((i) => i.alias === alias)

      if (!importInfo) {
        errors.push(`${fileName}: reference ${alias}.${className} but ${alias} not imported`)
        hasErrors = true
        continue
      }

      const moduleName = path.basename(importInfo.modulePath)
      const availableClasses = fileToClasses.get(moduleName)

      if (!availableClasses) {
        errors.push(`${fileName}: imports ${moduleName} but file not found`)
        hasErrors = true
        continue
      }

      if (!availableClasses.has(className)) {
        errors.push(`${fileName}: references ${alias}.${className} but .${className} not in ${moduleName}`)
        hasErrors = true
      }
    }

    if (references.length > 0) {
      console.log(`    References: ${references.length} class(es)`)
    }
    console.log()
  }

  // Report results
  console.log("─".repeat(60))

  if (errors.length > 0) {
    console.log(`\n${COLORS.red}Errors found:${COLORS.reset}\n`)
    errors.forEach((err) => error(err))
  }

  if (warnings.length > 0) {
    console.log(`\n${COLORS.yellow}Warnings:${COLORS.reset}\n`)
    warnings.forEach((w) => warn(w))
  }

  if (!hasErrors) {
    console.log()
    success("All verifications passed!")
    console.log()
    return true
  } else {
    console.log()
    error(`Verification failed with ${errors.length} error(s)`)
    console.log()
    return false
  }
}

// Run verification
try {
  const success = verify()
  process.exit(success ? 0 : 1)
} catch (err) {
  error(`Verification script error: ${err.message}`)
  console.error(err)
  process.exit(1)
}
