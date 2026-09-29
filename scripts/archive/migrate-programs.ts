/**
 * Programs CMS Migration Script (P7-02)
 * 
 * Idempotent migration tool that imports legacy projects and hardcoded prototypes
 * into the new Programs CMS database tables.
 * 
 * Usage:
 *   npx tsx scripts/archive/migrate-programs.ts --dry-run        # Preview changes
 *   npx tsx scripts/archive/migrate-programs.ts --import          # Execute migration
 *   npx tsx scripts/archive/migrate-programs.ts --import --source hardcoded  # Only hardcoded prototypes
 *   npx tsx scripts/archive/migrate-programs.ts --import --source legacy     # Only old projects table
 *   npx tsx scripts/archive/migrate-programs.ts --skip-existing               # Skip if slug exists
 * 
 * Environment:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or .env.local)
 */

import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

// =============================================
// Configuration
// =============================================

const args = process.argv.slice(2)
const DRY_RUN = args.includes("--dry-run")
const DO_IMPORT = args.includes("--import")
const SOURCE = args.includes("--source") ? args[args.indexOf("--source") + 1] : "all"
const SKIP_EXISTING = args.includes("--skip-existing")

if (!DO_IMPORT && !DRY_RUN) {
  console.log("Usage: npx tsx scripts/archive/migrate-programs.ts --dry-run | --import")
  process.exit(1)
}

// =============================================
// Category Mapping: Old → New
// =============================================

const CATEGORY_MAP: Record<string, string> = {
  education: "service",
  health: "outreach",
  empowerment: "service",
  relief: "campaign",
  // New CMS categories pass through
  service: "service",
  outreach: "outreach",
  research: "research",
  campaign: "campaign",
}

const THEME_MAP: Record<string, string> = {
  education: "warm",
  health: "editorial",
  empowerment: "energetic",
  relief: "campaign",
  service: "warm",
  outreach: "editorial",
  research: "editorial",
  campaign: "campaign",
}

// =============================================
// Legacy HTML Normalizer (P7-03)
// =============================================

function normalizeLegacyHtml(html: string): string {
  if (!html) return ""
  let cleaned = html
  // Remove <style> tags and their content
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, "")
  // Remove <script> tags and their content
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, "")
  // Remove inline style attributes
  cleaned = cleaned.replace(/\s+style="[^"]*"/gi, "")
  // Remove class attributes (legacy CMS classes)
  cleaned = cleaned.replace(/\s+class="[^"]*"/gi, "")
  // Remove &nbsp; entities (replace with spaces)
  cleaned = cleaned.replace(/&nbsp;/g, " ")
  // Remove empty paragraphs
  cleaned = cleaned.replace(/<p>\s*<\/p>/gi, "")
  // Trim whitespace
  cleaned = cleaned.trim()
  return cleaned
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}

// =============================================
// Legacy Project → CMS Document Transformer
// =============================================

interface LegacyProject {
  id: string
  title: string
  slug: string
  description: string
  long_description: string | null
  image: string
  category: string
  location: string
  status: string
  raised: number
  goal: number
  is_published: boolean
  created_at: string
  metrics?: Array<{ label: string; value: string }>
  timeline?: Array<{ phase: string; date_range: string; description: string; status: string }>
}

function transformLegacyProject(project: LegacyProject) {
  const category = CATEGORY_MAP[project.category] || "service"
  const theme = THEME_MAP[project.category] || "warm"
  const cmsStatus = project.is_published ? "published" : "draft"

  // Build sections array
  const sections: any[] = []

  // Stats section (from metrics + raised/goal)
  const stats: Array<{ label: string; value: string }> = []
  if (project.raised && project.goal) {
    stats.push({ label: "Raised", value: `$${project.raised.toLocaleString()}` })
    stats.push({ label: "Goal", value: `$${project.goal.toLocaleString()}` })
  }
  if (project.metrics) {
    for (const m of project.metrics) {
      stats.push({ label: m.label, value: m.value })
    }
  }
  if (stats.length > 0) {
    sections.push({
      id: "stats-imported",
      heading: "Key Figures",
      enabled: true,
      content: { type: "stats", stats },
    })
  }

  // Timeline section
  if (project.timeline && project.timeline.length > 0) {
    sections.push({
      id: "timeline-imported",
      heading: "Project Timeline",
      enabled: true,
      content: {
        type: "timeline",
        milestones: project.timeline.map((t) => ({
          title: t.phase,
          date: t.date_range,
          description: t.description,
          status: t.status === "completed" ? "completed" : t.status === "current" ? "active" : "upcoming",
        })),
      },
    })
  }

  // Rich text section (from long_description)
  if (project.long_description) {
    sections.push({
      id: "about-imported",
      heading: "About This Project",
      enabled: true,
      content: {
        type: "rich_text",
        body: normalizeLegacyHtml(project.long_description),
      },
    })
  }

  // Build hero
  const hero = {
    title: project.title,
    description: project.description || "",
    image: project.image || "",
    imageAlt: project.title,
    layout: "full_bleed" as const,
    actions: [],
  }

  // Build SEO
  const seo = {
    title: `${project.title} | DEESSA Foundation`,
    description: stripHtml(project.description || project.long_description || "").slice(0, 160),
  }

  // Build card data
  const card = {
    image: project.image || "",
    stats: stats.slice(0, 2),
  }

  return {
    slug: project.slug,
    title: project.title,
    category,
    theme,
    eyebrow: category.toUpperCase(),
    shortDescription: stripHtml(project.description || "").slice(0, 400),
    tags: [category, project.location].filter(Boolean),
    status: cmsStatus,
    hero,
    sections,
    seo,
    card,
    displayOrder: 0,
  }
}

// =============================================
// Hardcoded Prototype Transformer
// =============================================

interface HardcodedProgram {
  id: string
  slug: string
  title: string
  category: string
  theme: string
  eyebrow?: string
  shortDescription: string
  tags?: string[]
  hero: any
  sections: any[]
}

function transformHardcodedProgram(program: HardcodedProgram) {
  return {
    slug: program.slug,
    title: program.title,
    category: program.category,
    theme: program.theme,
    eyebrow: program.eyebrow || program.category.toUpperCase(),
    shortDescription: program.shortDescription,
    tags: program.tags || [],
    status: "draft" as const,
    hero: program.hero,
    sections: program.sections,
    seo: {
      title: `${program.title} | DEESSA Foundation`,
      description: program.shortDescription?.slice(0, 160) || "",
    },
    card: {
      image: program.hero?.image || "",
    },
    displayOrder: 0,
  }
}

// =============================================
// SQL Generator
// =============================================

function generateSql(importData: ReturnType<typeof transformLegacyProject>[]) {
  const lines: string[] = []
  lines.push("-- Programs CMS Migration Import")
  lines.push(`-- Generated: ${new Date().toISOString()}`)
  lines.push(`-- Records: ${importData.length}`)
  lines.push("")
  lines.push("DO $$")
  lines.push("DECLARE")
  lines.push("  v_program_id uuid;")
  lines.push("  v_user_id uuid;")
  lines.push("BEGIN")
  lines.push("  SELECT user_id INTO v_user_id FROM public.admin_users WHERE is_active = true LIMIT 1;")
  lines.push("")

  for (const data of importData) {
    const escapedTitle = data.title.replace(/'/g, "''")
    const escapedDesc = data.shortDescription.replace(/'/g, "''")
    const escapedEyebrow = (data.eyebrow || "").replace(/'/g, "''")
    const tagsArray = data.tags.length > 0 ? `ARRAY['${data.tags.join("','")}']` : "NULL"
    const heroJson = JSON.stringify(data.hero).replace(/'/g, "''")
    const sectionsJson = JSON.stringify(data.sections).replace(/'/g, "''")
    const seoTitle = (data.seo?.title || "").replace(/'/g, "''")
    const seoDesc = (data.seo?.description || "").replace(/'/g, "''")
    const cardJson = JSON.stringify(data.card).replace(/'/g, "''")

    lines.push(`  -- ${data.title} (${data.slug})`)
    lines.push(`  IF NOT EXISTS (SELECT 1 FROM public.programs WHERE slug = '${data.slug}') THEN`)
    lines.push(`    INSERT INTO public.programs (id, slug, title, category, theme, eyebrow, short_description, tags, status, display_order, created_by, updated_by)`)
    lines.push(`    VALUES (gen_random_uuid(), '${data.slug}', '${escapedTitle}', '${data.category}', '${data.theme}', '${escapedEyebrow}', '${escapedDesc}', ${tagsArray}, '${data.status}', ${data.displayOrder}, v_user_id, v_user_id)`)
    lines.push(`    RETURNING id INTO v_program_id;`)
    lines.push(``)
    lines.push(`    INSERT INTO public.program_drafts (program_id, hero, sections, seo_title, seo_description, revision, updated_by)`)
    lines.push(`    VALUES (v_program_id, '${heroJson}'::jsonb, '${sectionsJson}'::jsonb, '${seoTitle}', '${seoDesc}', 1, v_user_id);`)
    lines.push(``)
    lines.push(`    RAISE NOTICE 'Imported: % (%)', '${escapedTitle}', '${data.slug}';`)
    lines.push(`  ELSE`)
    lines.push(`    RAISE NOTICE 'Skipped (exists): %', '${data.slug}';`)
    lines.push(`  END IF;`)
    lines.push(``)
  }

  lines.push("END $$;")
  return lines.join("\n")
}

// =============================================
// Manifest Generator (P7-01)
// =============================================

function generateManifest(
  legacyProjects: LegacyProject[],
  hardcodedPrograms: any[],
  importData: ReturnType<typeof transformLegacyProject>[]
) {
  const manifest: any = {
    generatedAt: new Date().toISOString(),
    summary: {
      legacyProjects: legacyProjects.length,
      hardcodedPrototypes: hardcodedPrograms.length,
      totalToImport: importData.length,
      categories: {} as Record<string, number>,
    },
    records: [] as any[],
  }

  for (const data of importData) {
    manifest.summary.categories[data.category] = (manifest.summary.categories[data.category] || 0) + 1
    manifest.records.push({
      source: data.slug.includes("test-") || hardcodedPrograms.some((h: any) => h.slug === data.slug) ? "hardcoded" : "legacy-db",
      sourceSlug: data.slug,
      targetSlug: data.slug,
      category: data.category,
      status: data.status,
      sectionCount: data.sections.length,
      hasHero: !!data.hero?.image,
      action: "migrate",
    })
  }

  // Add retired records
  for (const project of legacyProjects) {
    if (!importData.some((d) => d.slug === project.slug)) {
      manifest.records.push({
        source: "legacy-db",
        sourceSlug: project.slug,
        targetSlug: null,
        category: project.category,
        status: "retired",
        action: "retire",
        reason: "No CMS equivalent or unmapped content",
      })
    }
  }

  return manifest
}

// =============================================
// Main
// =============================================

async function main() {
  console.log("=== Programs CMS Migration ===")
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "IMPORT"}`)
  console.log(`Source: ${SOURCE}`)
  console.log(`Skip existing: ${SKIP_EXISTING}`)
  console.log("")

  // Load Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
    process.exit(1)
  }
  const supabase = createClient(supabaseUrl, supabaseKey)

  // 1. Load legacy projects from database
  let legacyProjects: LegacyProject[] = []
  if (SOURCE === "all" || SOURCE === "legacy") {
    console.log("Loading legacy projects from database...")
    const { data, error } = await supabase.from("projects").select("*")
    if (error) {
      if (error.code === "42P01") {
        console.log("  → Old projects table does not exist (already migrated or never created)")
      } else {
        console.error("  → Error:", error.message)
      }
    } else {
      legacyProjects = data || []
      console.log(`  → Found ${legacyProjects.length} legacy projects`)
    }
  }

  // 2. Load hardcoded prototypes
  let hardcodedPrograms: any[] = []
  if (SOURCE === "all" || SOURCE === "hardcoded") {
    console.log("Loading hardcoded prototypes...")
    const hardcodedPath = path.resolve(process.cwd(), "data/programs")
    if (fs.existsSync(hardcodedPath)) {
      const files = fs.readdirSync(hardcodedPath).filter((f) => f.endsWith(".ts"))
      for (const file of files) {
        const mod = require(path.join(hardcodedPath, file.replace(".ts", "")))
        const program = mod.default || mod[Object.keys(mod)[0]]
        if (program) hardcodedPrograms.push(program)
      }
      console.log(`  → Found ${hardcodedPrograms.length} hardcoded prototypes`)
    } else {
      console.log("  → No hardcoded prototypes directory found")
    }
  }

  // 3. Transform data
  console.log("\nTransforming data...")
  const importData: ReturnType<typeof transformLegacyProject>[] = []

  for (const project of legacyProjects) {
    importData.push(transformLegacyProject(project))
  }
  for (const program of hardcodedPrograms) {
    importData.push(transformHardcodedProgram(program) as any)
  }

  console.log(`  → ${importData.length} records to import`)

  // 4. Check for conflicts
  if (SKIP_EXISTING || !DRY_RUN) {
    console.log("Checking for slug conflicts...")
    const slugs = importData.map((d) => d.slug)
    const { data: existing } = await supabase.from("programs").select("slug").in("slug", slugs)
    const existingSlugs = new Set(existing?.map((e) => e.slug) || [])
    const conflicts = importData.filter((d) => existingSlugs.has(d.slug))
    if (conflicts.length > 0) {
      console.log(`  → ${conflicts.length} slugs already exist:`)
      for (const c of conflicts) {
        console.log(`    - ${c.slug}`)
      }
      if (SKIP_EXISTING) {
        console.log("  → Will skip existing (--skip-existing)")
      }
    } else {
      console.log("  → No conflicts")
    }
  }

  // 5. Generate manifest (P7-01)
  const manifest = generateManifest(legacyProjects, hardcodedPrograms, importData)
  const manifestPath = path.resolve(process.cwd(), "scripts/migration-manifest.json")
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  console.log(`\nManifest written to: ${manifestPath}`)

  // 6. Generate SQL
  const sql = generateSql(importData)
  const sqlPath = path.resolve(process.cwd(), "scripts/migration-import.sql")
  fs.writeFileSync(sqlPath, sql)
  console.log(`SQL written to: ${sqlPath}`)

  // 7. Summary
  console.log("\n=== Migration Summary ===")
  console.log(`Legacy projects: ${legacyProjects.length}`)
  console.log(`Hardcoded prototypes: ${hardcodedPrograms.length}`)
  console.log(`Total to import: ${importData.length}`)
  console.log("By category:")
  for (const [cat, count] of Object.entries(manifest.summary.categories)) {
    console.log(`  ${cat}: ${count}`)
  }

  if (DRY_RUN) {
    console.log("\n[DRY RUN] No changes made. Run with --import to execute.")
  } else {
    console.log("\n[IMPORT] SQL generated. Review scripts/migration-import.sql, then execute in Supabase SQL Editor.")
  }
}

main().catch(console.error)
