# UXAuditX — Current Production Implementation (Do Not Break)

Use this document as the **source of truth** for what already exists. Any new features must **extend** this system, not replace it blindly. Avoid breaking: auth flow, job queue, Playwright pipeline, R2 uploads, Supabase schema, or dashboard polling.

---

## 1. Product summary

**UXAuditX** is a SaaS UX audit tool. An authenticated user submits **one URL**, the system crawls that single page with Playwright, captures screenshots at 3 viewports, detects page sections via DOM heuristics, uploads images to Cloudflare R2, runs Claude Vision analysis on **desktop sections only**, and displays a structured report in the dashboard.

**Not implemented today:** multi-page crawling, numeric scores (0–100), above-fold pass, 50+ point CRO checklist, cross-page consistency, mobile AI analysis, Supabase Storage for images.

---

## 2. Tech stack (actual)

| Layer | Technology |
|-------|------------|
| Framework | **Next.js 16** App Router (JavaScript, not TypeScript) |
| Language | **JS / JSX** (`.js`, `.jsx`) — ESM (`"type": "module"`) |
| Database | **Supabase Postgres** |
| Auth | **Supabase Auth** (`@supabase/ssr`, middleware, login/signup/forgot-password) |
| Screenshot engine | **Playwright** (headless Chromium) — NOT Puppeteer |
| AI | **Anthropic Claude API** — default model `claude-sonnet-4-6` |
| Image storage | **Cloudflare R2** (S3-compatible via `@aws-sdk/client-s3`) — NOT Supabase Storage |
| Image processing | **Sharp** installed but not used for section cropping (Playwright clips instead) |
| Styling | **Tailwind CSS v4** + custom design tokens in `app/globals.css` |
| State | **React useState** in dashboard — NO Zustand |
| Queue | **In-process `p-limit`** queue — NO Redis, NO separate worker service |
| Runtime | Audit API routes use **`export const runtime = "nodejs"`** (Playwright requires Node, not Edge) |

### Key env vars

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
ANTHROPIC_MODEL=claude-sonnet-4-6
ANTHROPIC_WEB_SEARCH_ENABLED=true
STORAGE_BUCKET / R2_BUCKET_NAME=screenshot-engine
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_PUBLIC_BASE_URL
MAX_CONCURRENT_AUDITS=2
AUDIT_COOKIE_STRATEGY=accept|reject
AUDIT_NAV_TIMEOUT_MS=90000
AUDIT_NAV_RETRIES=2
AUDIT_LOAD_TIMEOUT_MS=30000
AUDIT_NETWORK_IDLE_MS=10000
AUDIT_CONTENT_TIMEOUT_MS=20000
```

---

## 3. Database schema (Supabase — live)

### `audit_jobs`

- `id`, `user_id`, `url`, `status` (`pending` | `running` | `done` | `failed`)
- `error`, `section_count`, `issue_count`
- `current_step` (engine phase for UI polling)
- `last_heartbeat_at`, `created_at`, `completed_at`
- `audit_metadata` (JSONB, optional — audit quality panel data)

### `screenshots`

- One row per captured image (full page or section)
- `job_id`, `type` (`full` | `section` | `element`)
- `viewport` (`desktop` | `tablet` | `mobile`)
- `label`, `selector`, `r2_key`, `public_url`
- `y_start`, `y_end`, `clip` (JSONB), `confidence`, `failed`, `fail_reason`

### `issues`

- One row per Claude finding
- `job_id`, `screenshot_id`, `section_label`, `viewport`
- `title`, `severity` (`critical` | `high` | `medium` | `low`)
- `description`, `why`, `business_impact`, `how_to_fix`, `effort`, `category`
- `screenshot_url`

**No tables for:** `audit_pages`, `audit_sections`, page scores, section scores, positives, point IDs.

---

## 4. File structure (live code paths)

```
app/
  page.jsx                          # Marketing landing
  dashboard/page.jsx + DashboardClient.jsx
  (auth)/login, signup, forgot-password, reset-password
  auth/callback/route.js
  api/audit/
    start/route.js                  # POST — create job, enqueue audit
    status/[jobId]/route.js         # GET — poll status
    report/[jobId]/route.js         # GET — full report
    recent/route.js
    history/route.js

lib/
  engine/                           # ★ LIVE AUDIT ENGINE (use this)
    runner.js                       # Orchestrator
    config.js                       # Viewports, timeouts, env
    auditQuality.js                 # Quality metadata builder
    crawler/
      setup.js                      # Playwright launch
      pagePrep.js                   # Navigation + load layers
      pageReady.js                  # Content/fonts/images wait
      pageStable.js                 # DOM ready + navigation recovery
      blockers.js                   # Cookies, modals, overlays
      scroll.js                     # Lazy-load scroll
      sections.js                   # DOM section detection
      capture.js                    # Screenshot clips
    analysis/
      claude.js                     # Claude API calls
      prompts.js                    # Analysis prompts
    storage/
      db.js                         # Supabase CRUD
      r2.js                         # R2 upload
    queue/
      limiter.js                    # p-limit concurrency
      bootstrap.js                  # Sweeper + resume on boot
      sweeper.js                    # Stale running jobs

  supabase/client.js, server.js, middleware.js

components/
  audit/AuditInput.jsx, AuditProgress.jsx, AuditReport.jsx
  audit/AuditQualityPanel.jsx, RecentAudits.jsx
  landing/, layout/

src/                                # ⚠️ LEGACY — do not use for new work
  crawler/, auth/server.js, index.js
```

---

## 5. Full audit pipeline (step-by-step)

### Phase A — User triggers audit

1. User on `/dashboard` submits URL via `AuditInput`.
2. `POST /api/audit/start`:
   - Auth check (Supabase session)
   - Normalize URL (add `https://` if missing)
   - Insert `audit_jobs` row → `status: pending`
   - `enqueue(() => runAudit(...))` — fire-and-forget
   - Return `{ jobId }` immediately
3. `AuditProgress` polls `GET /api/audit/status/[jobId]` every **4 seconds**.

### Phase B — `runAudit(jobId, url)` in `lib/engine/runner.js`

**Step 1:** `audit_jobs.status` → `running`, `current_step: starting`

**Step 2:** Loop **3 viewports** sequentially (each opens a **new browser**):

| Viewport | Size |
|----------|------|
| desktop | 1440×900 |
| tablet | 768×1024 |
| mobile | 390×844 |

For each viewport → `processViewportWithRetry()` (retries once on failure):

#### B1 — Browser bootstrap (`setup.js` + `pagePrep.js`)

1. Launch Playwright Chromium (headless, deviceScaleFactor: 2)
2. Block analytics/media requests (GA, Hotjar, Intercom, etc.)
3. Navigate to URL (`domcontentloaded`, 90s timeout, 2 retries)
4. Wait: `load` → `networkidle` (best-effort) → settle → DOM ready
5. **Clear blockers (initial):** cookies, modals, newsletter popups, hide chat widgets
6. Recover from navigation if cookie click causes page reload

#### B2 — Capture prep (`processViewport`)

1. `waitForPageStable()` — content, fonts, lazy images, loaders
2. `triggerFullScroll()` — scroll down/up to trigger lazy content
3. `waitForPageStable()` again
4. `preparePageForCapture({ phase: "post-scroll" })` — blockers again
5. Scroll again for final page height
6. **Desktop only:** `detectSiteType(url, pageTitle)` via Claude (saas/ecommerce/landing-page/etc.)

#### B3 — Screenshots

1. **Full page** screenshot → upload R2 → save `screenshots` row (`type: full`)
2. `preparePageForCapture({ phase: "pre-capture" })`
3. **Detect sections** (`sections.js`):
   - Semantic HTML (`header`, `main`, `section`, `footer`, …)
   - Keyword class/id matching (hero, pricing, …)
   - CSS-in-JS / geometry fallbacks
   - Split monolithic `<main>` into child sections or viewport bands
   - If still 0 sections → **full-page fallback** (1 section labeled "Full Page")
4. **Per section:** Playwright clip screenshot → upload R2 → save `screenshots` row (`type: section`)
5. Close browser

**Step 3:** After all viewports, load desktop section screenshots from DB (`failed: false`)

**Step 4:** If desktop sections = 0 → fallback to **tablet sections** for analysis

**Step 5:** If still 0 → job `failed` with error message → STOP

**Step 6:** Claude analysis (`runAnalysisOnDesktopSections`):

- Batches of **3 sections** in parallel
- **1 second** delay between batches
- For each section: send **R2 public URL** to Claude Vision
- Optional **web search** tool for fact verification
- Prompt: 7 general UX categories (hierarchy, CTA, copy, trust, cognitive load, spacing, mobile)
- Returns JSON array of issues → save to `issues` table

**Step 7:** Build `audit_metadata` (quality panel: cookies handled, modals, section count, warnings)

**Step 8:** Job → `done` with `section_count`, `issue_count`, `completed_at`

### Phase C — Report

1. Poll sees `status: done`
2. `GET /api/audit/report/[jobId]` returns:
   - `job`, `summary` (issue counts, sections analyzed)
   - `sections` — issues grouped by `section_label`
   - `screenshots`, `screenshotMap`
   - `auditQuality` — capture quality panel
3. `AuditReport.jsx` renders summary cards, quality panel, section sidebar, issue cards, section screenshots

---

## 6. Critical constraints (do not break)

### Concurrency & runtime

- Audits run **inside the Next.js Node process** — not a separate worker
- Max **2 concurrent audits** (`MAX_CONCURRENT_AUDITS`) — each spawns Chromium + Claude calls
- Long-running — API routes must stay `runtime = "nodejs"`, `dynamic = "force-dynamic"`
- Stale job sweeper runs on API boot (`bootQueue()`)

### Analysis scope

- **Only desktop sections** go to Claude (tablet fallback if desktop capture fails)
- Tablet/mobile screenshots are **stored but not analyzed**
- **Single URL only** — no multi-page crawl

### Storage

- Screenshots in **R2**, not Supabase Storage
- DB stores metadata + `public_url` pointing to R2
- Path pattern: `audits/{jobId}/{filename}.png`

### Section detection

- **DOM-based** in browser via `page.evaluate()` — NOT Claude-based section detection
- NOT Sharp crop from full-page image

### Auth

- All audit APIs require authenticated Supabase user
- Jobs scoped by `user_id`
- Dashboard is behind auth middleware

### Failure modes (already handled)

- Navigation during cookie/modal dismiss → `pageStable.js` recovery
- Viewport crash → retry once per viewport
- 0 sections → full-page fallback section
- Desktop fail → tablet sections for analysis
- R2 upload fail → screenshot saved with `failed: true`
- `audit_metadata` column optional — job completes even if migration missing

---

## 7. API contracts (current)

### POST `/api/audit/start`

```json
{ "url": "https://example.com" }
→ { "jobId": "uuid", "status": "pending" }
```

### GET `/api/audit/status/[jobId]`

```json
{
  "jobId", "url", "status", "currentStep", "lastHeartbeatAt",
  "issueCount", "sectionCount", "error", "createdAt", "completedAt"
}
```

### GET `/api/audit/report/[jobId]` (when status = done)

```json
{
  "job": { "...audit_jobs row" },
  "summary": { "totalIssues", "critical", "high", "medium", "low", "sectionsAnalyzed" },
  "sections": { "Hero": ["issues..."], "Footer": [] },
  "screenshots": ["..."],
  "screenshotMap": { "Hero": "https://r2.../..." },
  "auditQuality": { "coverage", "items", "warnings" }
}
```

---

## 8. Issue schema (Claude output today)

```json
{
  "title": "string",
  "severity": "critical | high | medium | low",
  "description": "string",
  "why": "string",
  "business_impact": "string",
  "how_to_fix": "string",
  "effort": "low | medium | high",
  "category": "visual | copy | trust | cta | layout"
}
```

No `point_id`, no `area` enum, no `positives`, no section/page scores.

---

## 9. UI flow (current)

```
/ (landing) → login/signup → /dashboard
  ├── AuditInput (submit URL)
  ├── AuditProgress (poll status, step indicators)
  ├── AuditReport (sections + issues + quality panel)
  └── RecentAudits (history table)
```

No `/audit/[jobId]` route — report is inline in dashboard state machine.

---

## 10. Safe extension guidelines for new implementation

When adding features from a new spec, **prefer:**

| Do | Don't |
|----|-------|
| Add new columns/tables alongside existing ones | Drop/rename `screenshots`, `issues`, `audit_jobs` |
| Extend `runner.js` with new phases after capture | Replace Playwright with Puppeteer |
| Add new Claude calls in `lib/engine/analysis/` | Move analysis to Edge runtime |
| Keep R2 for images OR migrate with dual-write period | Switch storage mid-audit without migration |
| Add `audit_pages` as new table linked to `job_id` | Change `issues.severity` enum without migration |
| Run new analysis in same `p-limit` queue | Spawn unlimited parallel browsers |
| Add routes under `app/api/audit/` | Break existing start/status/report contracts |
| Feature-flag new pipeline steps | Replace section detection entirely in one PR |

### Recommended phasing (won't crash system)

1. **Phase 1:** Add `audit_pages` table + crawler — still write to existing `screenshots`/`issues`
2. **Phase 2:** New Claude prompts (50+ points) — extend `issues` with optional `point_id`, `area` columns
3. **Phase 3:** Scoring — add `score` columns, compute after analysis
4. **Phase 4:** Above-fold + consistency passes — new Claude calls, new issue rows
5. **Phase 5:** Report UI — extend `AuditReport.jsx`, keep old report shape as fallback

---

## 11. Legacy code warning

`src/` folder contains an **old Express-based** crawler and auth server (`npm run auth-api`, `npm run legacy-start`). The **live Next.js app does NOT use these** for audits. All new work goes in `lib/engine/`.

---

## 12. How to run locally

```bash
npm run dev          # Single server — Next.js on :3000 (includes audit API)
npm run setup-db     # Prints SQL for Supabase tables
npm run verify       # Validates R2 + Supabase connection
```

Only `npm run dev` is needed for full app + audit pipeline.

---

*Last updated: May 2026. Use this as baseline when planning changes.*
