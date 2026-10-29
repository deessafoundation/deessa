#!/usr/bin/env node
/**
 * Public asset guard — run with: node scripts/check-public-assets.mjs [--strict]
 *
 * Protects public/ from the four failure modes that have actually occurred in
 * this repository:
 *
 *   1. A path referenced in source does not exist on disk  -> ERROR
 *      (renames that missed a reference; a deleted "unused" file that was not)
 *   2. A file in public/ is gitignored or untracked        -> ERROR
 *      (blanket *.mp4 ignore once silently excluded a site video from deploys)
 *   3. Two entries differ only by case                     -> ERROR
 *      (Windows/macOS checkouts cannot detect this; Vercel's Linux can)
 *   4. Naming / size budget violations                     -> warning
 *      (--strict escalates these to errors; enforce only after the rename pass)
 *
 * No dependencies. Exit code 1 on any error.
 */
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative, sep } from "node:path"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("..", import.meta.url))
const pub = join(root, "public")
const strict = process.argv.includes("--strict")

// Folders whose contents are referenced through template literals or generated
// at build time, so static scanning cannot prove they are used. Orphan checks
// skip these; direct-path checks never skip anything.
const DYNAMIC_FOLDERS = ["errors", "events/hero", "artWork", "fonts", "accessibility"]

// Public root is reserved for platform files; everything else must live in a
// feature folder. See docs/standards/public-assets.md.
const PLATFORM_ROOT_FILES = new Set(["favicon.png", "favicon.ico", "site.webmanifest", "robots.txt"])

const SCAN_DIRS = ["app", "components", "lib", "hooks", "context", "contexts", "data", "scripts", "content", "__tests__"]
const ROOT_CONFIG_FILES = ["next.config.mjs", "next.config.js", "tailwind.config.mjs", "tail.config.js"]
const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".json", ".md", ".mdx"])

const ASSET_REF =
  /["'`(](\/(?!(?:api|_next|admin|demo)\/)[A-Za-z0-9 ._\-()/%]*?\.(?:png|jpe?g|webp|svg|avif|mp4|pdf|webmanifest|woff2?|ttf|otf))["'`)]|url\(\s*["']?(\/[^)"']+?\.(?:png|jpe?g|webp|svg|avif|mp4|pdf|webmanifest|woff2?|ttf|otf))["']?\s*\)/gi

const errors = []
const warnings = []
const info = []
const orphans = []

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) walk(path, out)
    else out.push(path)
  }
  return out
}

// --- collect source texts -------------------------------------------------
const sources = []
for (const dir of SCAN_DIRS) {
  const abs = join(root, dir)
  try {
    for (const file of walk(abs)) if (CODE_EXT.has(file.slice(file.lastIndexOf(".")))) sources.push(file)
  } catch {
    /* optional directory */
  }
}
for (const name of ROOT_CONFIG_FILES) {
  try {
    statSync(join(root, name))
    sources.push(join(root, name))
  } catch {
    /* optional */
  }
}

const texts = new Map()
for (const file of sources) {
  try {
    texts.set(file, readFileSync(file, "utf8"))
  } catch {
    /* unreadable */
  }
}

// --- public inventory -----------------------------------------------------
const publicFiles = walk(pub).map(file => "/" + relative(pub, file).split(sep).join("/"))
// lowercase -> exact path, so references can be matched case-insensitively but
// still reported when the reference and the disk name disagree in case.
const publicByLower = new Map(publicFiles.map(path => [path.toLowerCase(), path]))

// --- 1. every referenced path must exist ----------------------------------
// Next.js file-convention routes are served from app/ at runtime, not public/.
const GENERATED_ROUTES = /\/(opengraph-image|twitter-image|icon|apple-icon|favicon)(-\d+x\d+)?\.(png|jpg|jpeg|svg|ico)$/
// Documented exceptions: retired files that are redirect sources on purpose,
// and real defects tracked for a later fix. See the JSON for the reason each.
const exceptionsPath = join(root, "scripts", "public-asset-exceptions.json")
let exceptions = { intentional: {}, knownBugs: {} }
try {
  exceptions = JSON.parse(readFileSync(exceptionsPath, "utf8"))
} catch {
  warnings.push("scripts/public-asset-exceptions.json missing or unreadable — every missing reference is an error")
}
const intentional = new Map(Object.entries(exceptions.intentional || {}))
const knownBugs = new Map(Object.entries(exceptions.knownBugs || {}))
const reportMissing = (file, decoded) => {
  const where = `${relative(root, file)} references "${decoded}"`
  if (knownBugs.has(decoded)) warnings.push(`known bug: ${where} — ${knownBugs.get(decoded)}`)
  else if (intentional.has(decoded)) info.push(`exception: ${where} — ${intentional.get(decoded)}`)
  else errors.push(`${where} but no such file exists in public/ — 404 in production`)
}
for (const [file, text] of texts) {
  for (const match of text.matchAll(ASSET_REF)) {
    const raw = (match[1] || match[2] || "").trim()
    if (!raw || raw.length < 5) continue
    let decoded = raw
    try {
      decoded = decodeURIComponent(raw)
    } catch {
      /* keep raw */
    }
    if (GENERATED_ROUTES.test(decoded)) continue
    const onDisk = publicByLower.get(decoded.toLowerCase())
    if (!onDisk) {
      reportMissing(file, decoded)
    } else if (onDisk !== decoded) {
      errors.push(`${relative(root, file)} references "${decoded}" but disk has "${onDisk}" — case mismatch breaks on Linux`)
    }
  }
}

const referenced = new Set()
for (const text of texts.values()) {
  for (const match of text.matchAll(ASSET_REF)) {
    const raw = (match[1] || match[2] || "").trim()
    if (!raw) continue
    try {
      referenced.add(decodeURIComponent(raw).toLowerCase())
    } catch {
      referenced.add(raw.toLowerCase())
    }
  }
}

// --- 2. nothing in public/ may be gitignored or untracked -----------------
let ignored = []
try {
  // Files that exist on disk but git will not ship: present locally, 404 in prod.
  const untrackedIgnored = execFileSync(
    "git",
    ["ls-files", "--others", "--ignored", "--exclude-standard", "public"],
    { cwd: root, encoding: "utf8" },
  )
  ignored = untrackedIgnored.split("\n").filter(Boolean).map(line => "/" + line.trim())
} catch {
  warnings.push("git not available — skipped ignored/untracked verification")
}
for (const file of ignored) errors.push(`${file} is gitignored — it will never deploy (silent 404)`)

// --- 3. case-only collisions ----------------------------------------------
const groups = new Map()
for (const path of publicFiles) {
  const key = path.toLowerCase()
  if (!groups.has(key)) groups.set(key, [])
  groups.get(key).push(path)
}
for (const paths of groups.values()) {
  if (paths.length > 1) errors.push(`case-only collision: ${paths.join(" vs ")}`)
}
const dirKeys = new Map()
for (const path of publicFiles) {
  const parts = path.split("/").slice(1, -1)
  for (let i = 1; i <= parts.length; i++) {
    const dirPath = "/" + parts.slice(0, i).join("/")
    const key = dirPath.toLowerCase()
    if (!dirKeys.has(key)) dirKeys.set(key, new Set())
    dirKeys.get(key).add(dirPath)
  }
}
for (const set of dirKeys.values()) {
  if (set.size > 1) errors.push(`case-only directory collision: ${[...set].join(" vs ")}`)
}

// --- 4. naming, budgets, orphans (warnings unless --strict) ---------------
const NAME_OK = /^[a-z0-9][a-z0-9-]*\.(webp|avif|jpg|jpeg|png|svg|mp4|pdf|webmanifest|txt|md|json)$/
const NAME_UPSTREAM_FONT = /^(OpenDyslexic|ComicNeue|MarissaFont)[A-Za-z-]*\.(otf|ttf|woff2?)$/
// Asset-contract docs that legitimately sit beside the assets they document
// (public/errors/README.md, public/fonts/*/LICENSE.txt). No other docs in public/.
const NAME_ALLOWED_DOC = /^(README|LICENSE|OFL)\.(md|txt)$/
const BUDGET_KB = { png: 500, jpg: 500, jpeg: 500, webp: 300, svg: 20, mp4: 15360 }

for (const path of publicFiles) {
  const name = path.slice(path.lastIndexOf("/") + 1)
  const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase()
  const sizeKB = statSync(join(pub, path.slice(1))).size / 1024
  const inFonts = path.startsWith("/fonts/")
  const isPlatform = !path.slice(1).includes("/")

  if (!isPlatform && !inFonts && !NAME_OK.test(name) && !NAME_UPSTREAM_FONT.test(name) && !NAME_ALLOWED_DOC.test(name)) {
    warnings.push(`naming: "${path}" violates lowercase-kebab standard`)
  }
  const budget = BUDGET_KB[ext]
  if (budget && sizeKB > budget) {
    warnings.push(`size: "${path}" is ${Math.round(sizeKB)} KB (budget ${budget} KB)`)
  }
  if (isPlatform && !PLATFORM_ROOT_FILES.has(name)) {
    warnings.push(`root: "${path}" belongs in a feature folder, not public/ root`)
  }
  const isDynamic = DYNAMIC_FOLDERS.some(folder => path.startsWith(`/${folder}/`))
  // Platform files are wired through metadata APIs (layout.tsx `manifest:`), not
  // string asset references — they are never orphans.
  const isPlatformFile = isPlatform && PLATFORM_ROOT_FILES.has(name)
  if (!isPlatformFile && !isDynamic && !referenced.has(path.toLowerCase())) {
    orphans.push(`orphan candidate (verify dynamic/CMS use before deleting): ${path}`)
  }
}

// --- report ---------------------------------------------------------------
const print = (label, list, mark) => {
  if (!list.length) return
  console.log(`\n${label} (${list.length})`)
  for (const line of [...new Set(list)].sort()) console.log(`  ${mark} ${line}`)
}
print("ERRORS", errors, "✖")
print("WARNINGS", warnings, "▲")
print("ORPHANS", orphans, "·")
if (process.env.VERBOSE) print("INFO", info, "·")

console.log(
  `\npublic/: ${publicFiles.length} files | errors: ${new Set(errors).size} | warnings: ${new Set(warnings).size} | orphans: ${new Set(orphans).size} | exceptions: ${new Set(info).size}`,
)
if (strict && warnings.length) {
  console.log("\n--strict: warnings are fatal")
  process.exit(1)
}
process.exit(errors.length ? 1 : 0)
