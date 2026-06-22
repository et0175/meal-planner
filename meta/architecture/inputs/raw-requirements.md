# Raw Requirements — Meal Forge Core Loop
# Intake queue — formalized into requirements.yml by forge:architect-domain-extraction

## Non-functional requirements
<!-- Source: docs/requirements/09_non-functional.md -->

# processed: 2026-06-21 → NFR-001
- Initial page load (cold, 10 Mbps) must be < 2 s (NFR, p95). Source: 09_non-functional.md, 2026-06-21.

# processed: 2026-06-21 → NFR-005
- Live nutrition recalculation (Products Analyser) must be < 100 ms after each input change (NFR, p95). Source: 09_non-functional.md, 2026-06-21.

# processed: 2026-06-21 → NFR-002
- Search/filter response time (catalogue ≤ 10,000 items) must be < 200 ms (NFR, p95). Source: 09_non-functional.md, 2026-06-21.

# processed: 2026-06-21 → NFR-003
- Shopping list generation must be < 500 ms for up to 31 days of assignments (NFR, p95). Source: 09_non-functional.md, 2026-06-21.

# processed: 2026-06-21 → NFR-004
- PDF generation (print dialog open) must be < 3 s (NFR, p95). Source: 09_non-functional.md, 2026-06-21.

# processed: 2026-06-21 → NFR-006
- WCAG 2.1 Level AA compliance across all views (NFR, accessibility). Source: 09_non-functional.md, 2026-06-21.

# processed: 2026-06-21 → NFR-007
- All interactive controls must be keyboard-navigable (NFR, accessibility). Source: 09_non-functional.md, 2026-06-21.

# processed: 2026-06-21 → NFR-009
- Colour-coded indicators must include a non-colour label or icon (NFR, accessibility). Source: 09_non-functional.md, 2026-06-21.

# processed: 2026-06-21 → NFR-008
- Minimum colour contrast ratio: 4.5:1 normal text, 3:1 large text (NFR, accessibility). Source: 09_non-functional.md, 2026-06-21.

## Data limits (per user account)
<!-- Source: docs/requirements/09_non-functional.md -->

# processed: 2026-06-21 → NFR-010
- Products in global catalogue: max 10,000 (NFR, scalability). Source: 09_non-functional.md, 2026-06-21.

# processed: 2026-06-21 → NFR-011
- User-added products per account: max 500 (NFR, scalability). Source: 09_non-functional.md, 2026-06-21.

# processed: 2026-06-21 → NFR-012
- Meal plan assignments (total, all time): max 10,000 (NFR, scalability). Source: 09_non-functional.md, 2026-06-21.

# processed: 2026-06-21 → NFR-013
- Meal tracking log entries per account: max 3,650 (NFR, scalability). Source: 09_non-functional.md, 2026-06-21.

# processed: 2026-06-21 → FR-032 (via INV-004)
- Alternative units per product: max 10 (FR). Source: 09_non-functional.md, 2026-06-21.

# processed: 2026-06-21 → deferred — recipe module out of scope for MVP1
- Ingredients per recipe: max 50 (FR). Source: 09_non-functional.md, 2026-06-21. [recipe module deferred to v1.1]

## Browser support
<!-- Source: docs/requirements/09_non-functional.md -->

# processed: 2026-06-21 → NFR-014
- Support last 2 major versions of Chrome, Firefox, Safari (macOS + iOS), Edge (NFR, compatibility). Source: 09_non-functional.md, 2026-06-21.

# processed: 2026-06-21 → NFR-014
- Support Chrome for Android and Safari for iOS (NFR, compatibility). Source: 09_non-functional.md, 2026-06-21.

## Privacy and security
<!-- Source: docs/requirements/09_non-functional.md -->

# processed: 2026-06-21 → NFR-015
- No PII (meal plans, tracking logs, profile info) exposed to other users (NFR, security/privacy). Source: 09_non-functional.md, 2026-06-21.

# processed: 2026-06-21 → FR-036 (via INV-006)
- User-added products visible to all users; only creator can edit or delete their own (FR, OQ-001 resolved). Source: open-questions.md, 2026-06-21.

# processed: 2026-06-21 → NFR-015
- Meal plans, tracking entries, profile settings are private to the account holder (NFR, security/privacy). Source: 09_non-functional.md, 2026-06-21.

# processed: 2026-06-21 → FR-005 (via INV-002)
- Password reset links are single-use and expire after a defined time window (FR, security). Source: US-AUTH-004, 2026-06-21.

# processed: 2026-06-21 → FR-003
- Rate-limiting on sign-in after configurable number of failed attempts (FR, security). Source: US-AUTH-002, 2026-06-21.

## Tech stack constraints
<!-- Source: brainstorm session, 2026-06-21 -->

# processed: 2026-06-21 → CON-001
- Frontend: Next.js (TypeScript), separate deployment unit (CON, technical). Source: brainstorm, 2026-06-21.

# processed: 2026-06-21 → CON-002
- Backend: Python service, REST API, separate deployment unit (CON, technical). Source: brainstorm, 2026-06-21.

# processed: 2026-06-21 → CON-003
- Auth: session-based with email + password; no OAuth/SSO in MVP1 (CON, technical). Source: brainstorm, 2026-06-21.

# processed: 2026-06-21 → CON-004
- Units: metric + US customary; no other measurement systems in MVP1 (CON, technical). Source: OQ-007 resolved, 2026-06-21.

# processed: 2026-06-21 → CON-005
- Diet definitions: 12 hardcoded patterns; no admin management in MVP1 (CON, technical). Source: OQ-002 resolved, 2026-06-21.

# processed: 2026-06-21 → CON-006
- Nutritionist role identical to User in MVP1; role stored on account but no UI differentiation (CON, technical). Source: OQ-005 resolved, 2026-06-21.

## Week flag auto-rollover
<!-- Source: docs/user-stories/products-database.md, US-PA-007 -->

# processed: 2026-06-21 → FR-034 + POL-001
- On each Monday, "Next week" flags auto-promote to "This week" and affected products appear in the current week's planner summary (FR, System actor). Source: US-PA-007, 2026-06-21.

## Log from plan
<!-- Source: docs/requirements/open-questions.md, OQ-008 resolved -->

# processed: 2026-06-21 → FR-035
- "Log this day" and "Log this week" actions create Meal tracking entries pre-filled from planner assignments; entries are editable in Personal Cabinet; data stores remain independent (FR, OQ-008 resolved). Source: open-questions.md, 2026-06-21.

# processed: 2026-06-21 → FR-025 (US-045 / CMD-017)
- Individual item log action from Calendar per-item creates a single tracking entry (FR). Source: US-MP-021, 2026-06-21.

## Shopping list behaviour
<!-- Source: docs/requirements/open-questions.md, OQ-003 resolved -->

# processed: 2026-06-21 → FR-029
- Both recipe ingredients and standalone products from the planner appear in the grocery list (FR, OQ-003 resolved). Source: open-questions.md, 2026-06-21.

# processed: 2026-06-21 → FR-027 + FR-030 + POL-002..006
- Shopping list is automatically generated on navigation; stale when plan changes (FR). Source: US-SL-005, US-SL-006, 2026-06-21.
