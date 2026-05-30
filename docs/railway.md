# Deploy UXAuditX on Railway (frontend + audits)

Railway must build with the **Dockerfile** (Playwright + Chromium).  
**Nixpacks / npm-only builds will fail audits** with `Executable doesn't exist`.

The repo includes `railway.json` so Railway uses the Dockerfile automatically on new deploys.

---

## 1. Connect the repo

1. [Railway](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Select `uxauditFrontend` (or your fork)
3. Branch: **main**

---

## 2. Confirm Docker build

**Project → your service → Settings → Build**

| Setting | Value |
|---------|--------|
| **Builder** | `Dockerfile` |
| **Dockerfile path** | `Dockerfile` (repo root) |

If you still see Nixpacks or a custom build command like `playwright install`, switch to **Dockerfile** and redeploy.

---

## 3. Environment variables

**Variables** tab — add everything from your local `.env`. These are required **before the first deploy** (Next.js reads `NEXT_PUBLIC_*` at **build time**):

| Variable | Required at build |
|----------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Runtime |
| `ANTHROPIC_API_KEY` | Runtime |
| Paddle `NEXT_PUBLIC_*` + server keys | Build + runtime (for pricing checkout) |
| `ANTHROPIC_MODEL` / `ANTHROPIC_MODEL_FAST` | Runtime |
| R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_BASE_URL` | Runtime |
| Optional: `MAX_CONCURRENT_AUDITS=2` | Runtime |

Do **not** set `PORT` — Railway injects it. The app listens on `0.0.0.0` via `HOSTNAME` in the Dockerfile.

---

## 4. Resources (important for audits)

**Settings → Resources**

- **Memory:** at least **2 GB** (Playwright + Chromium + Next.js)
- **CPU:** 2 vCPU recommended if audits feel slow

---

## 5. Domain

**Settings → Networking → Generate domain** or attach **uxauditx.com** custom domain.

---

## 6. Deploy

Push to `main` or click **Redeploy** in Railway.

Build logs should show Docker steps (`FROM mcr.microsoft.com/playwright:v1.60.0-jammy`), not only `npm ci` on a slim image.

---

## 7. Verify audits

1. Open your Railway URL (or custom domain)
2. Sign in → run an audit
3. If it still fails, open **Deployments → View logs** and search for `playwright` or `Capture failed`

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Executable doesn't exist` | Builder is not Dockerfile — change in Settings and redeploy |
| Build timeout | Playwright image is large; retry deploy or increase build timeout if available |
| Browser crashes mid-audit | Bump memory to 2 GB+; `--disable-dev-shm-usage` is already in launch args |
| App won't start | Check all required env vars; view deploy/runtime logs |
| **Pricing still shows "Coming soon" / Starter & Pro $49** | Production is on an **old deploy**. See [Deploy stuck on old code](#deploy-stuck-on-old-code) below |
| **`Missing NEXT_PUBLIC_SUPABASE_URL` during build** | Add Supabase `NEXT_PUBLIC_*` vars in Railway **before** deploy, then redeploy |

---

## Deploy stuck on old code

If [uxauditx.com/pricing](https://uxauditx.com/pricing) still shows **Starter / Pro $49 / Coming soon**, the live app has **not** picked up recent GitHub commits.

### Verify

Open these URLs after a deploy:

| URL | Expected (current code) | Old deploy |
|-----|-------------------------|------------|
| `https://uxauditx.com/api/version` | JSON with `"appVersion": "2026-05-30-pricing-v2"` and `"plans": ["free","founder","agency"]` | 404 |
| `https://uxauditx.com/api/billing/config` | JSON with `clientToken` and `prices.founder` | 404 |
| `/pricing` page title | **Founder & Agency** — Free / $19 / $199 | Pro $49 / Coming soon |

### Fix in Railway

1. **Project → Service → Settings → Source**
   - Repo: `durgesh95dangi/uxauditFrontend`
   - Branch: **main**
   - **Wait for CI** / auto-deploy: **enabled**
2. **Settings → Build**
   - Builder: **Dockerfile** (not Nixpacks)
   - Dockerfile path: `Dockerfile`
3. **Deployments** tab
   - Check latest deploy — if **Failed**, open build logs and fix the error
   - If no new deploy after git push, click **Deploy → Redeploy** on the latest commit
4. After deploy succeeds, hard-refresh `/pricing` (`Ctrl+Shift+R`) or use an incognito window
5. If using **Cloudflare** in front of Railway: **Caching → Purge Everything** once after the new deploy

Pushes to `main` on GitHub do **nothing** until Railway shows a **successful** deployment for that commit SHA.

---

## Why not Vercel for this app?

This project runs **Playwright in the same Node process** as the API. Vercel serverless cannot run Chromium. Railway + Docker is the right setup for frontend and audits together.
