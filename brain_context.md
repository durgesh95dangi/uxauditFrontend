# Codebase Architecture & Flow Guide (brain_context.md)

Welcome to the **UXAuditX** technical overview. This document provides developers, project managers, and AI assistants with a unified, line-by-line directory layout, technical flows, database schema definitions, and design principles.

---

## 1. Project Purpose & Core Value
UXAuditX is an automated SaaS platform that performs website user experience (UX) and conversion rate optimization (CRO) audits. It opens live client URLs via Playwright, scrolls and segments the page elements, uploads screenshots to Cloudflare R2, and leverages AI vision models (Anthropic/Gemini) to identify prioritized usability flaws and generate actionable suggestions.

---

## 2. Technical Stack
- **Framework:** Next.js 16.2 (App Router, Turbopack) & React 19.2
- **Database / Auth:** Supabase & PostgreSQL (RLS enabled)
- **File Storage:** Cloudflare R2 Bucket (`screenshot-engine`)
- **Multimodal AI Agents:** Google Generative AI (Gemini 2.5 Pro/Flash) & Anthropic SDK (Claude 3.5 Sonnet/Haiku)
- **Headless Browser Crawler:** Playwright (Chromium browser integration)
- **Styling:** Vanilla CSS (Tailwind variables mapped in `globals.css`)
- **E2E Testing:** Playwright Test Suite (`e2e/hero-audit.spec.js`)

---

## 3. Directory Structure

```
├── app/
│   ├── (auth)/                    # Authentication flows (login, signup, password resets)
│   ├── admin/                     # Superadmin panel
│   ├── api/                       # REST endpoints (audit start/status, billing webhook)
│   ├── dashboard/                 # User dashboard client & pages
│   ├── globals.css                # Root global style sheet (new purple/orange design system)
│   ├── page.jsx                   # Website main landing page
│   └── layout.jsx                 # Site shell layout
├── components/
│   ├── audit/                     # Audit UI elements (Inputs, Progress bars, Reports, History)
│   ├── landing/                   # Hero fold, FAQ, pricing, and visual previews
│   └── layout/                    # SiteNav, SiteFooter, BrandLogo, and AuthShell
├── lib/
│   ├── auth/                      # Redirect helpers (safeguarding query params during login)
│   ├── engine/                    # Core browser automation and LLM audit engine
│   │   ├── crawler/               # Playwright launcher, stable wait states, cookie clickers
│   │   ├── analysis/              # LLM section-by-section vision analysis
│   │   ├── storage/               # Cloudflare R2 uploads and DB job mapping
│   │   ├── runner.js              # Orchestrator of the full audit pipeline
│   │   └── config.js              # Environment settings
│   └── supabase/                  # Server-side and client-side database clients
├── supabase/
│   └── migrations/                # Database schemas, scoring, and metadata upgrades
└── package.json                   # Dependencies, dev-dependencies, and runner scripts
```

---

## 4. Key Execution Workflows

### A. The Landing Page & Unlock Flow
1. **Interactive Hero:** The user visits `/`, sees a split two-column hero section backed by `<InteractiveBackground />` (canvas grid + radial cursor-glow). The left column holds left-aligned headings and input fields, while the right column shows a live CSS-animated mockup of an audit report loading critical UX issues sequentially.
2. **Demo Audit:** The user enters a URL and clicks **Audit my site**. It starts a demo (mock) audit:
   - Sets the phase to `scan` and triggers `AuditProgress` for 20 seconds.
   - Transitions to the `results` view showing 3 sample issues (`HeroAuditResults.jsx`) and a blurred lock overlay for the remaining findings.
3. **Account Creation:** The user clicks **Create free account to unlock**. The link redirects to `/signup?redirect=/dashboard&url=example.com`, preserving the audited URL.
4. **Login/Signup Transitions:** Footer links between `/signup` and `/login` preserve all search parameters to avoid losing context.
5. **Dashboard Landing & Auto-trigger:** After verification, the user is redirected to `/dashboard?url=example.com`. `<DashboardClient />` detects the `url` parameter in `useEffect`, fires a POST to `/api/audit/start`, transitions the screen to the live `progress` loader, and cleans the query string to prevent loops.

### B. Backend Engine Runner Pipeline (`lib/engine/runner.js`)
The `runAudit(jobId, url, userId)` orchestrator executes the following pipeline:
1. **Starting Status:** Marks the audit job as `running` in Supabase.
2. **Heuristic Guess:** Infers the site type (e.g. `SaaS`, `E-commerce`, `Landing`) from URL keywords and page titles.
3. **Crawl Viewports:** Launches Playwright in headless mode. Grabs viewports (Desktop & Mobile) in parallel.
4. **Stable Page & Prepare:** Scrolls through the page to trigger lazy-loaded images, handles cookie popups, and waits for network idle.
5. **DOM Section Splitting:** Scrapes the DOM and segments it into distinct visual layers (Hero, CTA, Testimonials, Pricing, Features, Footer).
6. **Capture & Upload:** Takes viewport clips of each section and uploads them to the Cloudflare R2 bucket.
7. **Multimodal AI Analysis:** Submits images of the sections to Gemini/Claude. The models output a layout score (0-100), key positives, and a list of cropped usability/conversion issues with descriptions and fixes.
8. **Summary & Score:** Computes overall weighted usability scores for desktop and mobile (weighting key sections like Hero/CTA heavier than Footers).
9. **Final Save:** Stores findings, screenshot paths, and metadata, marking the job status as `done`.

---

## 5. Database Schema & Models

### Table: `audit_jobs`
One row per audit request:
- `id` (UUID, Primary Key)
- `user_id` (UUID) - Owner of the audit
- `url` (Text) - Destination URL
- `status` (Text) - `pending` | `running` | `done` | `failed`
- `error` (Text) - Reason for failure, if any
- `section_count` / `issue_count` (Integer)
- `current_step` (Text) - Client progress message (e.g., `capturing_desktop`)
- `overall_score` / `mobile_overall_score` (Integer) - Out of 100
- `above_fold_score` (Integer) - Score of above-the-fold CRO review
- `above_fold_vp_clear` (Boolean) - Is value proposition clear?
- `above_fold_cta_visible` (Boolean) - Is CTA visible on load?
- `above_fold_cta_copy` (Text) - Text of primary call to action
- `above_fold_top_risk` (Text) - Main conversion bottleneck identified
- `audit_metadata` (JSONB) - Miscellaneous crawlers, navigation, and API version data

### Table: `screenshots`
Every full-viewport and cropped section captured:
- `id` (UUID, Primary Key)
- `job_id` (UUID) - Foreign Key
- `type` (Text) - `full` | `section`
- `viewport` (Text) - `desktop` | `mobile`
- `label` (Text) - e.g. `hero`, `pricing`, `features`, `testimonial`, `footer`
- `r2_key` / `public_url` (Text) - Cloudflare assets URL
- `y_start` / `y_end` (Integer) - Scroll coordinate ranges
- `section_score` (Integer) - Usability rating of this element
- `positives` (JSONB) - Checklist of things done correctly

### Table: `issues`
Usability issues identified by the AI vision agent:
- `id` (UUID, Primary Key)
- `job_id` (UUID) / `screenshot_id` (UUID)
- `section_label` (Text) / `viewport` (Text)
- `title` (Text) - Brief summary
- `severity` (Text) - `critical` | `high` | `medium` | `low`
- `description` / `why` / `business_impact` / `how_to_fix` (Text)
- `effort` (Text) - `low` | `medium` | `high`
- `category` (Text) - `visual` | `copy` | `trust` | `cta` | `layout`
- `screenshot_url` (Text)

---

## 6. Color System & Styling
The website is styled using CSS custom variables in `app/globals.css` with a high-contrast dark theme:
- **Core Background:** `--color-canvas-soft: #0f0b18` (dark purple) and `--color-canvas-soft-2: #211832` (user dark purple).
- **Core Panels:** `--color-canvas: #161023` and `--color-canvas-elevated: #2d2144`.
- **CTA Brand Color:** `--color-brand: #F25912` (bright orange accent).
- **Secondary Tones:** `--color-purple-mid: #5C3E94` and `--color-purple-deep: #412B6B`.
- **Interactive Background:** `<InteractiveBackground />` sets `--mouse-x` and `--mouse-y` dynamically. It applies a dual radial background gradient that merges `#F25912` (orange glow) with purple highlights following the user's cursor.
- **Hero & Input Heights:** Hero section is set to `min-height: 70svh` to occupy 70% of the viewport. Input forms and action buttons in the hero section are set to `58px` for maximum visibility and ease of interaction.
- **Hero Split Layout:** The main hero fold uses a two-column grid (`.hero-split-layout`) on viewports above `960px`, left-aligning the input form, benefit badges, and a social proof row (stacked user avatars + "Joined by 100+ users last month") on the left, and placing an interactive, animated HTML report card simulation on the right.
- **Benefit Badges:** The subheadline highlights "Free instant report" and "Results in 1-2 min" as two separate badges (`.hero-audit-hint-badge`) styled with thin coral borders and transparent backgrounds.
- **Testimonials Section:** Testimonials cards reside in `.testimonial-grid` styled with `var(--gradient-card)` backgrounds matching the branding. Individual `.testimonial-card`s have micro-animations (hover translate lift) and `.testimonial-avatar`s styled with brand orange-to-coral gradients. A media query for viewports `<= 960px` reflows the grid layout into a clean single-column stack.

---

## 7. Maintenance Policy for Developers
- **Additive SQL:** Any new tables or database columns must be added via migrations inside `supabase/migrations/` using `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
- **Forwarding query parameters:** All transitions between login, signup, and dashboard routes must pass down query parameters (`url`, `redirect`, `plan`) to prevent breaking the first-time user audit unlock flow.
- **Keep this file updated:** Every time you add, modify, or delete database columns, CSS root variables, API endpoints, or crawler runner steps, document the change in this file!
