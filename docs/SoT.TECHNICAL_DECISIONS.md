# SoT: Technical Decisions — Meal Forge MVP

**Produced by:** v0.5 Technical Stack Selection  
**Date:** 2026-06-21  
**Next stage:** v0.6 Architecture Design

---

## Discovery Summary

**Product context:** Greenfield SaaS web app. No sibling products. No vendor constraints. Not a regulated industry. Working prototype exists at `prototype/frontend/` (Next.js 16.2.9, React 19, TypeScript, Tailwind v4).

**Existing asset baseline (from prototype):**

| Capability Area | Existing Asset | Status |
|---|---|---|
| Frontend framework | Next.js 16.2.9 + React 19 + TypeScript | Reuse |
| UI styling | Tailwind v4 + custom teal palette | Reuse |
| Icon library | lucide-react | Reuse |
| Utility libraries | clsx, tailwind-merge | Reuse |
| Backend / API | None | New |
| Database | None (seed.ts / in-memory) | New |
| Authentication | None (prototype only, UI scaffolded) | New |
| PDF generation | browser `window.print()` (prototype only) | Replace |
| Recipe import (URL/PDF) | Not implemented | New |
| Hosting / Deployment | None | New |
| Analytics / Monitoring | None | New |
| Email (password reset) | None | New |
| CI/CD | None | New |

---

## TECH- Entries

---

### TECH-001: Frontend Framework

```
TECH-001: Frontend Framework
Category: Reuse
Layer: Frontend
Purpose: Deliver all application screens — products, recipes, meal planner, shopping list,
  dietary analyser, advanced search, personal cabinet, authentication.

Reuse From: Meal Forge prototype (prototype/frontend/)
Reuse Scope: Full reuse — promote prototype to production build
Current State: Next.js 16.2.9, React 19, TypeScript, running at localhost:3001.
  All 8 modules have UI scaffolded. Zero TypeScript errors.
Changes Needed:
  - Split single-file app/page.tsx (~3000 lines) into per-module components/pages
  - Wire to real API (replace in-memory seed.ts data)
  - Enable Next.js App Router server components where appropriate
  - Add route-level authentication guards (redirect unauthenticated → sign-in)

Shared or Separate: Same instance (this is the only product)

Features Served: All modules — Products Database, Products Analyser, Dietary Analyser,
  Recipe Analyser, Personal Cabinet, Meal Planner, Shopping List, Authentication, Advanced Search
Risk Constraints: None identified

Cost: $0 incremental (prototype already built)
Integration Complexity: Low — team already operates this codebase
Lock-in Risk: Low — Next.js is widely supported; React ecosystem is stable
```

---

### TECH-002: UI Styling System

```
TECH-002: UI Styling System
Category: Reuse
Layer: Frontend
Purpose: Visual design system — teal palette, spacing, typography, component styles

Reuse From: Meal Forge prototype (app/globals.css, Tailwind v4 config)
Reuse Scope: Full reuse
Current State: Tailwind v4 with @theme — teal-700 (#1A6B6E), teal-500 (#2D9B9F), green-500
  (#6BAE8C). Geist Sans font. rounded-2xl cards. Consistent visual language across all views.
Changes Needed: None for MVP. May extract to design tokens file as codebase grows.

Shared or Separate: Same instance

Features Served: All modules (visual consistency across all screens)
Risk Constraints: None

Cost: $0 (Tailwind is open source; bundled in Next.js build)
Integration Complexity: Low
Lock-in Risk: Low — standard CSS utility classes; portable to any framework if needed
```

---

### TECH-003: Backend API Framework

```
TECH-003: Backend API Framework
Category: Buy (managed / serverless)
Layer: Backend
Purpose: Serve REST or tRPC API endpoints for all application modules — products CRUD,
  recipe CRUD, meal plan assignments, shopping list generation, user profile, tracking log.

Features Served: All data-mutation and data-read operations across every module.
  Directly serves: Products Database, Recipe Analyser, Meal Planner, Shopping List,
  Personal Cabinet, Advanced Search, Authentication.
Risk Constraints: None — no compliance or latency constraints identified beyond
  09_non-functional.md targets (<200ms search, <500ms shopping list generation).

Decision: Next.js API Routes (App Router route handlers) hosted on Vercel
Rationale:
  - The prototype is already Next.js. API routes live in the same repo with no additional
    framework or language to learn, maintain, or deploy separately.
  - Vercel deploys Next.js API routes as serverless functions automatically — zero infrastructure
    configuration needed.
  - For MVP scale (early users, not millions of concurrent requests), serverless cold-start
    latency is acceptable. Can migrate to dedicated server if needed post-PMF.
  - Eliminates separate backend service, Docker management, or separate deployment pipeline.

Alternatives Considered:
  - Express.js / Fastify (Node.js, separate service): More control, but adds a second repo,
    second deployment, and second operational surface for no MVP benefit.
  - Python FastAPI: Solid choice but team is already in TypeScript; switching languages adds
    friction and context-switching cost.
  - Supabase Edge Functions: Viable if using Supabase; but less portable and harder to test
    locally compared to Next.js routes.

Trade-offs:
  - Pro: Single repo, single deployment, shared types between frontend and API, no new framework
  - Con: Serverless cold starts can add 200-500ms on first request (acceptable for MVP);
    not ideal for long-running background tasks (shopping list generation is <500ms so OK)

Cost: Covered by Vercel hosting (TECH-010). No separate backend cost.
Integration Complexity: Low — already using Next.js
Lock-in Risk: Medium — Vercel-specific deployment patterns for serverless; mitigated because
  Next.js route handlers are standard and can run on any Node.js host if needed.
```

---

### TECH-004: Primary Database

```
TECH-004: Primary Database
Category: Buy (managed service)
Layer: Database
Purpose: Persist all application data: product catalog, recipes, meal plan assignments,
  tracking log entries, user profiles, diet preferences.

Features Served: All modules. Data limits from 09_non-functional.md:
  10,000 products in catalogue, 500 user recipes, 10,000 plan assignments, 3,650 tracking entries.
Risk Constraints: 09_non-functional.md: search <200ms, shopping list <500ms for 31 days.
  Privacy: user data (plans, tracking, profile) must not be visible to other users.

Decision: Supabase (managed PostgreSQL)
Rationale:
  - Supabase provides managed PostgreSQL with a generous free tier and a clear paid upgrade path,
    making it ideal for MVP launch and early growth.
  - Built-in Row Level Security (RLS) enforces per-user data isolation at the database level —
    directly satisfying the privacy requirement without additional application-layer filtering.
  - Supabase offers a TypeScript client library (supabase-js) that integrates cleanly with
    Next.js, reducing the need for a separate ORM.
  - The data model is relational: products → ingredients → recipes, assignments keyed by
    (user, item, day, meal_slot), tracking entries with timestamps. PostgreSQL is the right
    fit — document stores would add complexity without benefit here.
  - Data limits (10K products, 10K assignments, 3,650 tracking entries) are modest for
    PostgreSQL. No sharding or partitioning needed at MVP scale.
  - Supabase free tier handles early validation; paid tier ($25/mo Pro) activates when needed.

Alternatives Considered:
  - PlanetScale / Neon (serverless PostgreSQL): Also viable but Supabase adds more value
    (auth integration, RLS, storage) for the same effort. Lower overall decision count.
  - Firebase / Firestore: NoSQL; relational queries (ingredient aggregation for shopping list,
    nutrition totals) would require application-level joins that increase complexity.
  - Self-managed PostgreSQL on VPS: Higher ops burden, no managed backups, no built-in RLS.
    Not worth it for MVP.
  - SQLite: Fine for single-server but forces migration at scale; no concurrent write support.

Trade-offs:
  - Pro: Managed backups, RLS for privacy, TypeScript client, free tier for MVP, standard PostgreSQL
  - Con: Supabase adds some abstraction over raw PostgreSQL; if we ever migrate to a different
    host, RLS policies need rewriting (acceptable trade-off for MVP speed)

Cost:
  - MVP stage: Free tier (500MB database, 50K monthly active users limit)
  - Growth: Supabase Pro $25/month (8GB database, no MAU limit)
  - 10x scale: $25-100/month depending on storage growth
Integration Complexity: Low (supabase-js client; migrations via Supabase CLI)
Lock-in Risk: Low — standard PostgreSQL; data is portable. RLS syntax is PostgreSQL-standard.
```

---

### TECH-005: Authentication & Session Management

```
TECH-005: Authentication & Session Management
Category: Buy (managed service)
Layer: Auth
Purpose: User registration, sign-in, sign-out, password reset, session management,
  rate limiting on failed attempts, role assignment (User / Nutritionist).

Features Served: Authentication module (08_authentication.md) — all requirements:
  registration, sign-in, sign-out, password reset, session invalidation, rate limiting,
  generic error messages (no email enumeration), role model.
Risk Constraints: 09_non-functional.md: no PII exposure between users.
  08_authentication.md: no social login, no 2FA, no email verification for MVP1.

Decision: Supabase Auth (built into Supabase, same provider as TECH-004)
Rationale:
  - Supabase Auth is included with the Supabase instance chosen in TECH-004 — zero additional
    service or vendor to manage.
  - Provides email + password registration and sign-in out of the box, matching MVP1 scope exactly.
    Social login (Google, Apple), 2FA, and email verification are explicitly deferred to post-MVP1.
  - Password strength enforcement configurable in Supabase dashboard.
  - Rate limiting on failed sign-in attempts is built in (configurable threshold).
  - Session management uses JWT tokens stored in browser session storage (matching the "browser
    session only" requirement from 08_authentication.md).
  - Password reset email flow (reset link + expiry) is built in; uses Supabase transactional
    email (or configurable SMTP — see TECH-009).
  - Generic error messages (no email enumeration) is the default Supabase Auth behaviour.
  - Role management (User / Nutritionist) can be handled via Supabase user metadata or a
    custom roles table with RLS — no admin UI needed for MVP1 (operations procedure only).

Alternatives Considered:
  - Clerk: Excellent product but adds a second vendor when Supabase Auth covers all MVP1 needs.
    Clerk's UI components are polished but add bundle weight and a paid tier sooner ($25/mo).
  - Auth0: Over-engineered for MVP1 scope; enterprise pricing model; more costly at launch.
  - NextAuth.js (now Auth.js): Good library but requires more implementation work (session
    strategy, adapter setup, token rotation). Supabase Auth is ready out of the box.
  - Custom implementation: Rejected — not a differentiator, requires password hashing, token
    rotation, rate limiting, reset flows — all solved by Supabase Auth.

Trade-offs:
  - Pro: Zero additional vendor, built-in rate limiting, built-in reset flows, works with
    Supabase RLS for per-user data isolation, free tier covers MVP
  - Con: Tied to Supabase ecosystem (if we switch databases later, auth migrates too).
    Acceptable for MVP — we'd evaluate this only if replacing Supabase entirely.

Cost: Included in Supabase Free / Pro tier (TECH-004 cost covers auth). $0 additional.
Integration Complexity: Low — supabase-js handles auth client-side; server-side via middleware
Lock-in Risk: Medium — Supabase Auth is not portable like standard OIDC providers.
  Mitigated because MVP1 explicitly defers SSO/social login; migration path exists if needed post-MVP.
```

---

### TECH-006: PDF Generation

```
TECH-006: PDF Generation
Category: Replace
Layer: Frontend utility
Purpose: Export meal plan (Week Summary grid) and grocery list as downloadable PDF files.

Features Served: 06_meal_planner.md (PDF export — full week grid with item names, days, servings,
  totals); 07_shopping_list.md (grocery list PDF — categorised ingredient list + date range).
Risk Constraints: 09_non-functional.md: PDF generation (print dialog open) < 3 s.

Replaces: browser window.print() (current prototype implementation)
Replace Reason: window.print() opens a browser print dialog — not a download. User experience
  is inconsistent across browsers. No control over headers/footers or page layout. The requirement
  says "download as PDF file," which print() does not satisfy reliably.

Decision: @react-pdf/renderer (client-side PDF generation)
Rationale:
  - Generates a real PDF blob in the browser without a server round-trip — satisfies <3s target.
  - Provides programmatic control over layout: we can produce clean multi-page PDFs with the
    week grid, consistent fonts (Geist or fallback), and the Meal Forge brand colours.
  - React-based API fits naturally into the Next.js codebase; no new language or server component.
  - The output is a direct file download (URL.createObjectURL + <a> trigger), not a print dialog.
  - At MVP scale (PDFs generated on-demand in client), no server infrastructure needed.

Alternatives Considered:
  - Puppeteer / Playwright (server-side headless browser): Server-side rendering to PDF is
    high-fidelity but adds a server process, memory overhead (~300MB+), and cold-start latency.
    Overkill for a meal plan list. Not suitable for serverless.
  - jsPDF (lower-level): More manual positioning; @react-pdf/renderer is higher-level and
    maps better to our React component structure.
  - Keep window.print(): Does not produce a reliable file download. Not acceptable for production.
  - PDFShift / DocRaptor (paid API): Adds per-document cost and a network round-trip.
    Unnecessary when client-side generation is sufficient.

Trade-offs:
  - Pro: Client-side, no server cost, direct download, full layout control, React-native API
  - Con: Bundle size increase (~150KB gzip); PDF fidelity differs from browser CSS rendering
    (acceptable — we design the PDF layout explicitly, not from HTML)

Cost: $0 (open source, MIT license)
Integration Complexity: Low-Medium (need to design PDF templates; API is React-based)
Lock-in Risk: Low — library is MIT; PDF output is a standard file format
```

---

### TECH-007: Recipe Import (URL and PDF)

```
TECH-007: Recipe Import from External Sources
Category: Research
Layer: Backend / Integration
Purpose: Parse a recipe from a user-supplied website URL or PDF file and pre-fill
  the recipe add form with name, ingredients, servings, prep time, and instructions.

Features Served: 04_recipe_analyser.md — "Add a recipe from external sources: website URL and
  PDF (MVP). YouTube is post-MVP."
Risk Constraints: None explicitly identified. Quality of extraction affects user satisfaction.

Decision: TBD after POC (default to structured data extraction if available)
Rationale:
  - Two distinct sub-problems with very different solutions:
      1. URL import: many recipe sites publish schema.org/Recipe JSON-LD structured data.
         A simple fetch + JSON-LD parse covers 60-70% of popular recipe sites with zero AI cost.
         For sites without structured data, HTML scraping + LLM extraction is the fallback.
      2. PDF import: requires OCR or PDF text extraction + LLM parsing.
  - Decision cannot be made without validating coverage on real recipe site corpus.
  - Need to decide: single LLM-based pipeline for both (simpler, higher cost) vs. structured-data
    first + LLM fallback (more complex, lower cost).

Alternatives to Evaluate:
  1. schema.org/Recipe JSON-LD extraction (URL only):
     - Fetch URL server-side, parse <script type="application/ld+json"> for Recipe schema
     - Cost: $0 per import
     - Coverage: ~60-70% of major recipe sites (AllRecipes, BBC Good Food, etc.)
     - Limitation: Fails on sites without structured data; no PDF support
  2. LLM extraction (Claude/GPT-4o) for both URL and PDF:
     - Scrape HTML or extract PDF text → prompt LLM → structured JSON output
     - Cost: ~$0.001-0.005 per import (varies by recipe length)
     - Coverage: Near-universal (handles any text)
     - Risk: LLM hallucination on quantities/ingredients; needs output validation
  3. Dedicated recipe parser API (e.g., Edamam, Spoonacular):
     - Managed service with recipe extraction endpoint
     - Cost: $0.001-0.01 per call; tier pricing
     - Coverage: Well-tested on popular sites; built-in ingredient parsing
     - Limitation: Third-party dependency; PDF support varies

Research Needed:
  - Test schema.org extraction against 30 real recipe URLs from target audience
  - Test LLM extraction (Claude Haiku for cost) on same 30 URLs + 5 PDFs
  - Measure extraction accuracy: name, ingredient list (quantity + unit + item), servings
  - Compare cost and accuracy to decide pipeline approach

Evaluation Criteria:
  - Ingredient extraction accuracy ≥ 85% (name, quantity, unit all correct)
  - P95 latency < 5 seconds (user waits on import; acceptable for a one-time action)
  - Cost per import < $0.01 (at MVP import volume, < 100 imports/day)

Decision Deadline: Before WAVE 1 feature build for Recipe Analyser module starts.

Trade-offs:
  - Pro (structured data path): Zero LLM cost; instant; no hallucination risk
  - Con (structured data path): Limited coverage; fails silently on non-schema sites
  - Pro (LLM path): Universal coverage; handles PDFs; single code path
  - Con (LLM path): Per-request cost; latency; needs output validation; LLM provider dependency

Cost: $0 for structured data path; $0.001-0.005/import for LLM path.
  At 100 imports/day → $0.10-0.50/day → $3-15/month LLM cost (acceptable)
Integration Complexity: Medium (server-side fetch, PDF text extraction, optional LLM call)
Lock-in Risk: Low for structured data; Medium for LLM provider (mitigated by abstraction layer)
```

---

### TECH-008: Hosting and Deployment

```
TECH-008: Hosting and Deployment
Category: Buy (managed platform)
Layer: Infrastructure
Purpose: Host the Next.js application (frontend + API routes) with CI/CD, preview environments,
  and CDN delivery.

Features Served: All modules — every screen and API endpoint runs on this platform.
Risk Constraints: 09_non-functional.md: page load <2s on 10 Mbps connection.

Decision: Vercel
Rationale:
  - Vercel is the canonical host for Next.js — developed by the same team. Zero configuration
    needed: push to git → build → deploy.
  - CDN edge network satisfies the <2s cold load target without manual CDN configuration.
  - Preview deployments per PR enable QA without a staging server.
  - Serverless functions (API routes — TECH-003) deploy automatically with the same git push.
  - Free Hobby tier covers MVP launch; Pro tier ($20/month) adds team access and more build minutes.
  - No DevOps skill required to deploy or scale at MVP stage.

Alternatives Considered:
  - Railway / Render: Good for Node.js servers but no built-in CDN; Next.js ISR/RSC features
    need extra configuration. More setup for the same result.
  - AWS (Amplify or EC2): Much more configuration and operational overhead. Appropriate at
    scale but over-engineered for MVP. Risk of spending days on infrastructure instead of product.
  - Netlify: Similar to Vercel; slightly less optimised for Next.js App Router features.
    Vercel is the better fit for this stack.
  - Self-hosted VPS (Hetzner/DigitalOcean): Lowest monthly cost but highest ops burden.
    Not appropriate when team should be building product features.

Trade-offs:
  - Pro: Zero-config Next.js deployment, CDN included, preview URLs, serverless API routes
  - Con: Vercel-specific deployment patterns (cold starts on Hobby tier); function execution
    limits on free tier (10s timeout); Pro tier needed for team collaboration

Cost:
  - MVP launch: Hobby tier $0/month (100GB bandwidth, 100 function hours/month — sufficient early on)
  - Growth: Pro tier $20/month (1TB bandwidth, 1000 function hours/month)
  - 10x scale: Pro + usage overages or Enterprise; estimate $50-150/month
Integration Complexity: Low — git push deploys; environment variables in Vercel dashboard
Lock-in Risk: Medium — ISR, Edge middleware, and Vercel-specific function patterns are
  not portable. Mitigated: standard Next.js builds run on any Node host if migration is needed.
```

---

### TECH-009: Transactional Email

```
TECH-009: Transactional Email
Category: Buy (managed service)
Layer: Email
Purpose: Send password reset emails (the only transactional email in MVP1 scope).

Features Served: 08_authentication.md — password reset flow (reset link sent to registered email).
Risk Constraints: None beyond delivery reliability.

Decision: Resend (or Supabase built-in SMTP)
Rationale:
  - Supabase Auth (TECH-005) includes a built-in email provider for auth flows (registration,
    password reset) on the free tier. For MVP, this covers the single email use case (password reset)
    without any additional setup.
  - If the built-in Supabase email (SendGrid via Supabase) hits rate limits or deliverability
    issues, switch to Resend: developer-friendly API, React Email templates, generous free tier
    (3,000 emails/month free), straightforward Supabase SMTP integration.
  - Resend is preferred over SendGrid / Mailgun for new projects due to simpler API and better
    developer experience.

Default path: Use Supabase built-in email (zero additional setup, zero cost).
Upgrade path: Resend free tier if deliverability issues arise.

Alternatives Considered:
  - SendGrid: Industry standard but more complex setup; overkill for one email type at MVP.
  - Mailgun: Similar to SendGrid; higher configuration complexity.
  - Postmark: Good deliverability; slightly higher cost for low volumes.
  - AWS SES: Very low cost at scale but requires DNS setup and AWS account management.
    Not worth the setup cost for MVP1 with a single email type.

Trade-offs:
  - Pro: Supabase default = zero setup; Resend = simple migration if needed
  - Con: Supabase default email has rate limits (2/hour per user on free tier); acceptable
    for MVP (password reset is low frequency)

Cost: $0 (Supabase built-in) / $0 (Resend free tier up to 3,000 emails/month)
Integration Complexity: Low — configured in Supabase dashboard (SMTP settings)
Lock-in Risk: Low — email is a commodity; switching providers is a config change
```

---

### TECH-010: Analytics and Error Tracking

```
TECH-010: Analytics and Error Tracking
Category: Buy (managed service)
Layer: Observability
Purpose: Understand user behaviour (which features are used, drop-off points) and catch
  runtime errors before users report them.

Features Served: All modules — cross-cutting observability concern.
Risk Constraints: 09_non-functional.md: no PII exposure. Analytics must not log
  personally identifiable information (email addresses, meal plan contents).

Decision: PostHog (product analytics) + Sentry (error tracking)
Rationale:
  PostHog:
  - Open-source-friendly, privacy-first product analytics. Generous free tier (1M events/month).
  - Can be self-hosted if privacy requirements tighten post-MVP; no lock-in risk.
  - Provides session replay, funnels, and feature flags — useful for validating which MVP
    features are actually used.
  - Events should track only anonymized actions (e.g., "recipe_imported", "meal_plan_pdf_exported")
    — never log food item content or user data.

  Sentry:
  - Industry standard for error tracking. Next.js SDK installs in minutes.
  - Free tier: 5,000 errors/month — sufficient for MVP.
  - Alerts on new errors with stack traces; identifies which users are affected without
    exposing PII if configured correctly.

Alternatives Considered (analytics):
  - Mixpanel: Paid after free tier; similar functionality to PostHog but no self-host option.
  - Google Analytics: Strong product analytics but data sent to Google; conflicts with
    privacy stance. PostHog is the better choice.
  - No analytics: Tempting to skip for MVP but blind to whether features are used — decisions
    become guesses. Rejected.

Alternatives Considered (error tracking):
  - Datadog: Full observability platform; expensive overkill for MVP.
  - LogRocket: Session replay focus; less suited for error alerting.
  - Custom logging: Would require building error aggregation. Not a differentiator.

Trade-offs:
  - Pro: PostHog free tier covers MVP; Sentry free tier covers MVP; both have Next.js SDKs
  - Con: Two additional services to configure; adds ~20KB bundle (both SDKs); need to audit
    event tracking to ensure no PII is captured

Cost:
  - PostHog: Free up to 1M events/month → paid $0.00031/event after (estimate: <$50/month at growth)
  - Sentry: Free up to 5K errors/month → Team plan $26/month if exceeded
  - Total MVP: ~$0/month; growth: ~$50-80/month
Integration Complexity: Low — Next.js SDKs, environment variable config, <1 day setup
Lock-in Risk: Low (PostHog is open source, portable; Sentry is standard, portable)
```

---

### TECH-011: CI/CD Pipeline

```
TECH-011: CI/CD Pipeline
Category: Buy (managed service)
Layer: DevOps
Purpose: Automated linting, type checking, and test runs on every pull request;
  automated deployments to preview and production environments.

Features Served: All modules — cross-cutting quality gate.
Risk Constraints: None.

Decision: GitHub Actions + Vercel (native integration)
Rationale:
  - The repository is already on GitHub (evidenced by git history). GitHub Actions is
    included at no cost for public repos and is generous for private repos (2,000 min/month free).
  - Vercel's GitHub integration handles preview deployments automatically — no CI/CD config
    needed for deployment. GitHub Actions handles quality checks (lint, tsc --noEmit, tests).
  - Standard workflow: PR opened → GitHub Actions runs quality checks → Vercel deploys preview →
    PR merged → Vercel deploys to production. Zero manual steps.

Alternatives Considered:
  - CircleCI / Travis CI: Paid; adds a third service when GitHub Actions covers the need.
  - Jenkins: Self-hosted; significant ops overhead. Not appropriate for MVP.
  - Vercel-only (no Actions): Vercel can block deploys on build failure but doesn't run
    type checks or linting as separate steps. Need GitHub Actions for quality gates.

Trade-offs:
  - Pro: GitHub-native, free tier covers MVP, zero-config Vercel integration, familiar to devs
  - Con: GitHub lock-in (mitigated — GitHub is the de-facto standard; migration path exists)

Cost: $0 (GitHub Actions free tier + Vercel integration included in Vercel plan)
Integration Complexity: Low — standard next lint + tsc workflow file; Vercel connected via OAuth
Lock-in Risk: Low — Actions YAML is portable; Vercel deploy step is the only vendor-specific part
```

---

## Risk-to-Technology Mapping

| Risk / Constraint | Source | Technology Response |
|---|---|---|
| Page load < 2s (10 Mbps) | 09_non-functional.md | TECH-008 (Vercel CDN) + TECH-001 (Next.js SSR/static) |
| Live nutrition recalc < 100ms | 09_non-functional.md | TECH-001 (client-side React state, no network call needed) |
| Search response < 200ms (≤10K items) | 09_non-functional.md | TECH-004 (PostgreSQL indexed queries) |
| Shopping list generation < 500ms | 09_non-functional.md | TECH-004 (SQL aggregation) + TECH-003 (API route) |
| PDF open < 3s | 09_non-functional.md | TECH-006 (client-side @react-pdf/renderer, no server round-trip) |
| User data privacy (no cross-user exposure) | 09_non-functional.md | TECH-004 (Supabase RLS) + TECH-005 (Supabase Auth JWT) |
| No email enumeration on auth errors | 08_authentication.md | TECH-005 (Supabase Auth default behaviour) |
| Rate limiting on failed sign-in | 08_authentication.md | TECH-005 (Supabase Auth built-in rate limiting) |
| Session invalidation on sign-out | 08_authentication.md | TECH-005 (Supabase Auth JWT revocation) |
| Debounced search ≤ 300ms | 10_advanced_search.md | TECH-001 (React useCallback + debounce hook, client-side) |
| Recipe import URL and PDF | 04_recipe_analyser.md | TECH-007 (Research — decision pending POC) |
| PDF download (not print dialog) | 06_meal_planner.md, 07_shopping_list.md | TECH-006 (Replace window.print()) |
| Analytics must not log PII | 09_non-functional.md | TECH-010 (PostHog event design — no PII in event payload) |
| WCAG 2.1 AA accessibility | 09_non-functional.md | TECH-001 (semantic HTML in Next.js components; TECH-010 Sentry for regression detection) |

---

## Quality Gate Checklist

- [x] All capability areas addressed (or explicitly N/A with rationale)
- [x] Every TECH- entry cross-references the requirement modules it serves
- [x] Build decisions: none — no core differentiators require custom infrastructure builds
- [x] Buy decisions have cost estimates for MVP and growth stages
- [x] Cost decisions prioritise speed-to-market for MVP
- [x] Research item (TECH-007) has evaluation criteria and decision deadline
- [x] No risk/constraint from non-functional requirements is left unaddressed
- [x] No vendor lock-in without explicit acknowledgment
- [x] Existing prototype assets catalogued before evaluating new choices (Reuse: TECH-001, TECH-002)
- [x] window.print() replacement acknowledged explicitly (TECH-006)

---

## Open Items

| ID | Item | Owner | Deadline |
|---|---|---|---|
| TECH-007-POC | Recipe import POC: test schema.org extraction + LLM on 30 URLs + 5 PDFs | Dev | Before Recipe module build starts |
| TECH-007-DECIDE | Choose import pipeline based on POC results | Tech Lead | Before Recipe module build starts |
