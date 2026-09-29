<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
# Agent instructions — Deesha Foundation (Next.js App Router)

## Frontend conventions

- Default styling is Tailwind utilities plus the `cn()` helper from `lib/utils.ts`.
- CSS Modules are for keyframe animations, layers driven by CSS custom properties, and `forced-colors`/`print` media queries; co-locate `*.module.css` with its component.
- Global CSS lives only under `app/`; it holds theme tokens and contrast/print/forced-colors overrides.
- Inline `style={{}}` is for dynamic values only (CSS custom properties, computed widths) — never static layout.
- Components live in `components/<feature>/`; the `home-` prefix is reserved for homepage-only components.
- Verification is opt-in: do not run Prettier, ESLint, typecheck, or the test suites unless explicitly asked in the request. Just report which commands exist if asked.

## Tooling

- Package manager: **pnpm** (never npm); lockfile is `pnpm-lock.yaml`.
- `pnpm run format` / `pnpm run format:check` — Prettier per `.prettierrc` (double quotes, no semicolons, printWidth 120). `pnpm run format:check` is not repo-clean yet (the repo-wide format is a separate, later commit).
- `pnpm run lint` — ESLint; the repo-wide run has pre-existing errors, so `npx eslint <files>` is the targeted form.
- `pnpm run typecheck` — report-only (`tsc --noEmit`); the repository has pre-existing TypeScript errors, none in the accessibility feature.
- Accessibility test suite: `node node_modules/jest/bin/jest.js --config jest.accessibility.config.cjs --runInBand` (19 tests).
- No git hooks are installed.
