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

**Variables** tab — add everything from your local `.env`, for example:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL` / `ANTHROPIC_MODEL_FAST`
- R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_BASE_URL`
- Optional: `MAX_CONCURRENT_AUDITS=2`

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

---

## Why not Vercel for this app?

This project runs **Playwright in the same Node process** as the API. Vercel serverless cannot run Chromium. Railway + Docker is the right setup for frontend and audits together.
