# Deploy Scripts

Deployment and post-deploy verification for staging/production.

| Script | Purpose |
|--------|---------|
| `deploy-staging.ps1` / `.sh` | Deploy to staging |
| `deploy-production.ps1` | Deploy to production |
| `enable-v2-staging.ps1` / `.sh` | Enable Payment V2 flags on staging |
| `smoke-tests-staging.ps1` / `.sh` | Post-deploy smoke tests |
| `monitor-staging.ps1` | Watch staging health after deploy |

npm shortcuts live in root `package.json` (e.g. `npm run deploy:staging`).
