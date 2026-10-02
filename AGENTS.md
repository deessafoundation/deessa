# Agent instructions — Deesha Foundation (Next.js App Router)

## Frontend conventions

- Default styling is Tailwind utilities plus the `cn()` helper from `lib/utils.ts`.
- CSS Modules are for keyframe animations, layers driven by CSS custom properties, and `forced-colors`/`print` media queries; co-locate `*.module.css` with its component.
- Global CSS lives only under `app/`; it holds theme tokens and contrast/print/forced-colors overrides.
- Inline `style={{}}` is for dynamic values only (CSS custom properties, computed widths) — never static layout.
- Components live in `components/<feature>/`; the `home-` prefix is reserved for homepage-only components.
- Every feature ships with a formatter-clean diff and passes lint.

## Tooling

- Package manager: **pnpm** (never npm); lockfile is `pnpm-lock.yaml`.
- `pnpm run format` / `pnpm run format:check` — Prettier per `.prettierrc` (double quotes, no semicolons, printWidth 120). `pnpm run format:check` is not repo-clean yet (the repo-wide format is a separate, later commit); run Prettier on the files you touch.
- `pnpm run lint` — ESLint; the repo-wide run has pre-existing errors, so gate on `npx eslint <touched-files>` instead.
- `pnpm run typecheck` — report-only (`tsc --noEmit`); the repository has pre-existing TypeScript errors, none in the accessibility feature.
- Accessibility test suite: `node node_modules/jest/bin/jest.js --config jest.accessibility.config.cjs --runInBand` (19 tests, must pass).
- No git hooks are installed — run Prettier on the files you touch before committing.
