<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
# Agent instructions — deessa Foundation (Next.js App Router)

## Frontend conventions

- Default styling is Tailwind utilities plus the `cn()` helper from `lib/utils.ts`.
- CSS Modules are for keyframe animations, layers driven by CSS custom properties, and `forced-colors`/`print` media queries; co-locate `*.module.css` with its component.
- Global CSS lives only under `app/`; it holds theme tokens and contrast/print/forced-colors overrides.
- Inline `style={{}}` is for dynamic values only (CSS custom properties, computed widths) — never static layout.
- Components live in `components/<feature>/`; the `home-` prefix is reserved for homepage-only components.
- Verification is opt-in: do not run Prettier, ESLint, typecheck, or the test suites unless explicitly asked in the request. Just report which commands exist if asked.

## Accessibility (mandatory for all UI work)

> **Before writing or editing any UI code — especially anything under `app/(public)/` or `components/` — you MUST read `docs/in-progress/accessibility-feature/STANDARDS.md` in full.**

Key rules derived from that document:

- **High-contrast / inverted-contrast modes** are implemented via `body.high-contrast` and `body.inverted-contrast` class selectors scoped inside CSS Modules (never in `globals.css` unless adding a new global pattern).
- **Never use inline Tailwind `bg-[#…]` or `text-[#…]` arbitrary-value classes on `<button>` or `<a>` elements** (or on any ancestor that contains them). These strings match `[class*="bg-[#"] button/a` and `[class*="text-[#"]` selectors in `app/globals.css` and will override all colors with `#000`/`#fff` in high-contrast mode, making text invisible. Move per-component colors into a co-located `*.module.css` file instead.
- **SVG icons** rendered via Lucide (or any `stroke="currentColor"` SVG) inside a high-contrast-mode dark container must have explicit `stroke: #fff !important; color: #fff !important` rules in the CSS module — inherited `currentColor` is not reliable.
- **`data-*` attribute selectors** (e.g. `data-accent`, `data-action`) are the approved pattern for applying per-variant colors from a CSS module when the color values would otherwise require `bg-[#…]` or `text-[#…]` inline classes.
- `app/globals.css` already contains hundreds of high-contrast overrides. Check for conflicts before adding new rules there.

## Tooling

- Package manager: **pnpm** (never npm); lockfile is `pnpm-lock.yaml`.
- `pnpm run format` / `pnpm run format:check` — Prettier per `.prettierrc` (double quotes, no semicolons, printWidth 120). `pnpm run format:check` is not repo-clean yet (the repo-wide format is a separate, later commit).
- `pnpm run lint` — ESLint; the repo-wide run has pre-existing errors, so `npx eslint <files>` is the targeted form.
- `pnpm run typecheck` — report-only (`tsc --noEmit`); the repository has pre-existing TypeScript errors, none in the accessibility feature.
- Accessibility test suite: `node node_modules/jest/bin/jest.js --config jest.accessibility.config.cjs --runInBand` (19 tests).
- No git hooks are installed.
