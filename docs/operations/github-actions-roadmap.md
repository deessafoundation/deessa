---
title: "GitHub Actions Roadmap"
description: " Purpose: document the current workflows, the gaps we want to close, and the rollout plan before we make the workflow..."
owner: "Deessa Team"
status: operational
category: operations
audience: operator
last_updated: 2026-09-12
---
# GitHub Actions Roadmap

> Purpose: document the current workflows, the gaps we want to close, and the rollout plan before we make the workflows stricter or add new actions.

## 1. Current Workflow Set

### 1.1 Pull Request Check

File: `.github/workflows/pr-check.yml`

Runs on pull requests to `main`.

Current behavior:
- Checks out the repo.
- Sets up Node.js 22 and pnpm 9.
- Installs dependencies.
- Runs `pnpm run lint`.
- Runs `pnpm run test`.
- Skips the build step with a placeholder message.

Notes:
- Lint and test are currently informational because they use `continue-on-error`.
- The workflow does not yet run the real production build.

### 1.2 Preview Deploy

File: `.github/workflows/preview-deploy.yml`

Runs on pull requests to `main`.

Current behavior:
- Skips Dependabot PRs.
- Installs dependencies.
- Deploys a Vercel preview build.
- Comments the preview URL back on the PR.

### 1.3 Production Deploy

File: `.github/workflows/deploy.yml`

Runs on pushes to `main`.

Current behavior:
- Installs dependencies.
- Installs Vercel CLI.
- Deploys to Vercel production using secrets.

### 1.4 Security Scan

File: `.github/workflows/security-scan.yml`

Runs on pushes to `main`, pull requests to `main`, and every Monday at 9 AM UTC.

Current behavior:
- Installs dependencies.
- Runs `pnpm audit --audit-level=moderate`.
- Runs `pnpm audit --prod`.
- Both scan steps are currently non-blocking.

### 1.5 Dependabot Auto-Merge

File: `.github/workflows/dependabot-auto-merge.yml`

Runs on Dependabot pull requests to `main`.

Current behavior:
- Reads Dependabot metadata.
- Enables auto-merge for patch and minor updates.
- Uses squash merge.

## 2. What Is Missing

### 2.1 PR Validation Is Not Strict Enough

- Lint and test failures do not fail the PR workflow.
- The production build is not being run in CI.
- There is no TypeScript typecheck step separate from lint if we want one.

### 2.2 Deployments Are Not Protected Enough

- Production deploys can run directly from `main` without an approval gate.
- There is no explicit concurrency control to cancel stale preview or deploy runs.
- There is no environment-based separation for preview versus production.

### 2.3 Security Checks Are Informational Only

- Vulnerability scans do not block merges.
- There is no severity policy written down for when a dependency issue becomes a release blocker.

### 2.4 Workflow Efficiency Can Improve

- pnpm caching is not configured.
- Repeated installs take longer than needed.
- Preview comments may become noisy if multiple PR updates create multiple comments.

### 2.5 Release Verification Is Minimal

- There is no post-deploy smoke test.
- There is no automated check that the deployed production site is healthy after release.

## 3. Improvements To Make Before Final Launch

### Phase 1: Document and Observe

- Keep workflows as they are for now.
- Capture current failures from lint, tests, and build on a known branch.
- Record the exact commands used by CI so local debugging matches CI.

### Phase 2: Make CI Real But Non-Blocking

- Replace the placeholder build step with `pnpm run build`.
- Add a TypeScript typecheck step if the repo needs one separate from lint.
- Add pnpm caching.
- Keep the checks non-blocking only until current issues are resolved.

### Phase 3: Fix Repo Issues

- Fix lint failures.
- Fix test failures.
- Fix build failures.
- Fix any missing environment variables or workflow secrets.

### Phase 4: Turn Checks Into Gates

- Remove `continue-on-error` from lint, test, and security scan steps.
- Mark the required PR checks in branch protection rules.
- Protect production deploys with a GitHub environment approval gate if needed.

### Phase 5: Add Release Confidence

- Add a post-deploy smoke test.
- Add a deployment summary step so the team can see what changed.
- Optionally add release notes or changelog generation.

## 4. New Actions We May Add Later

This list should only grow when there is a clear problem to solve.

### 4.1 Code Quality Actions

- TypeScript typecheck workflow.
- Formatting check workflow.
- Dead code or import cleanup check if needed.

### 4.2 Release Safety Actions

- Production smoke test after deploy.
- Rollback or incident notification workflow.
- Manual approval step for production releases.

### 4.3 Dependency Maintenance Actions

- Scheduled dependency update summary.
- Automated patch-only updates with stricter guardrails.
- Security dependency report on a fixed schedule.

### 4.4 Operational Visibility Actions

- Deployment status summary posted to PRs or issues.
- Failed workflow notification for maintainers.
- Audit log of deploys and preview URLs.

## 5. Rules For Adding A New Workflow

Before adding any new GitHub Action, document these items first:

- What problem it solves.
- Which event triggers it.
- What secrets or permissions it needs.
- Whether failure should block merges or just warn.
- Which branch or environment it targets.
- How the team will verify it works.

If the workflow is only useful in launch week or during migrations, keep it documented but do not add it until the need is real.

## 6. Recommended Launch Checklist

- All PR checks should pass on the main branch.
- The production build should run successfully in CI.
- Preview deploys should consistently post the correct URL.
- Production deploys should be repeatable and protected.
- Security scans should have a clear pass/fail policy.
- Dependabot auto-merge should only stay on if CI is trustworthy.

## 7. Decision Log

- Current decision: document the improvements first instead of changing workflow behavior immediately.
- Next decision after launch prep: enable the stricter checks and remove non-blocking behavior.
