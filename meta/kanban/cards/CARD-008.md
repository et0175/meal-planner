# CARD-008: Shopping List UI (Next.js)

**Status:** done
**Priority:** P2
**Category:** feature
**Estimate:** 2d
**Revision pending:** false
**Skill:** nextjs-developer
**TDD:** —
**Branch:** card/008-shopping-list-ui
**Worktree:** —
**Source:** meta/architecture/handoff.md#increment-4#ui
**Depends on:** CARD-007
**Review score:** —
**Started:** 2026-06-30T00:00:00Z
**Closed:** 2026-06-30T00:00:00Z
**Actual:** 2d
**Merge commit:** 6750500
**Blocked by:** —

## What to implement

Next.js Shopping List UI (CTX-005, COMP-020–022 frontend):

**Shopping List view:**
- Auto-loads on navigation (calls `GET /shopping`); default date range = current ISO week
- Items displayed grouped by product category; categories sorted alphabetically; empty categories omitted
- Each item row: product name + total quantity + unit
- Empty state when no assignments exist for the date range

**Date range picker:**
- Date-range input with "from" and "to" date fields; default pre-filled to current ISO week Mon–Sun
- "Apply" button calls `POST /shopping/generate` with selected range
- Client-side validation: from_date ≤ to_date

**Stale indicator + refresh:**
- When list has `stale: true`, show a banner/badge ("Plan changed — refresh to update")
- "Refresh" button calls `POST /shopping/refresh`; hides banner on success

**Plan summary panel (sidebar or above list):**
- Shows the date range currently being viewed
- Shows total item count and an estimate of categories

**PDF download:**
- "Download PDF" button calls `POST /shopping/export/pdf` → triggers browser print dialog
- Enabled even when list is empty (generates empty-list PDF)

## Acceptance criteria

**FR-027 — Auto-generate**
- AC-070: navigate to screen with assignments → list shown immediately
- AC-071: no assignments → empty state shown

**FR-028 — Date range**
- AC-072: set custom range → list reflects only that range
- AC-073: from > to → client-side validation error shown

**FR-029 — Aggregate and group**
- AC-074: Oats 100 g + 50 g → Oats 150 g under Grains
- AC-119: empty plan → empty list (no error)

**FR-030 — Stale indicator**
- AC-075: plan changes → stale banner appears
- AC-076: "Refresh" → list regenerated, banner hidden

**FR-031 — PDF download**
- AC-077: "Download PDF" → print dialog opens within 3 s
- AC-120: empty list → empty-list PDF (no error)

## Architecture context

- **FR:** FR-027, FR-028, FR-029, FR-030, FR-031
- **NFR:** NFR-013 (WCAG 2.1 AA), NFR-014 (responsive ≥ 1280px)
- **ADR:** ADR-0007 (default ISO week pre-filled in date picker), ADR-0008 (upsert — no conflict UI needed)
- **Components:** COMP-020 (ShoppingListGenerator), COMP-021 (StalenessService), COMP-022 (ShoppingListPdfExport)
- **Trace:** meta/architecture/trace.yml

## Worktree notes

Status: done
Closed: 2026-06-30T00:00:00Z
Actual: 2d

### Files created

- `frontend/src/lib/api/shopping.ts` — typed wrappers: getShoppingList, generateShoppingList, refreshShoppingList, exportShoppingPdf
- `frontend/src/shopping/ShoppingListView.tsx` — grouped-by-category list; empty state; `<section>` landmarks for a11y
- `frontend/src/shopping/DateRangePicker.tsx` — from/to date inputs pre-filled to ISO week Mon–Sun; client-side from ≤ to validation (AC-073)
- `frontend/src/shopping/StalenessBanner.tsx` — amber banner with Refresh button; hides on REFRESH_SUCCESS
- `frontend/src/shopping/PlanSummaryPanel.tsx` — date range, item count, category count
- `frontend/src/app/(app)/shopping/page.tsx` — page orchestrator; useReducer for all async state
- `frontend/src/__tests__/ShoppingListView.test.tsx` — 13 RTL tests
- `frontend/src/__tests__/DateRangePicker.test.tsx` — 12 RTL tests

### Build results

- All 138 tests pass (25 new)
- `npm run lint` — clean (0 errors)
- `npm run format:check` — clean
- `npm run build` — clean production build
