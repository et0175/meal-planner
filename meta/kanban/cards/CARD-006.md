# CARD-006: Meal Planning UI (Next.js)

**Status:** ready
**Priority:** P1
**Category:** feature
**Estimate:** 5d
**Revision pending:** false
**Skill:** nextjs-developer
**TDD:** —
**Branch:** card/006-meal-planning-ui
**Worktree:** —
**Source:** meta/architecture/handoff.md#increment-3#ui
**Depends on:** CARD-005
**Review score:** —
**Started:** —
**Closed:** —
**Actual:** —
**Merge commit:** —
**Blocked by:** —

## What to implement

Next.js Meal Planning UI (CTX-004, COMP-013–018 frontend):

**Week navigation header:**
- Back / Forward arrows for week navigation; "Today" / current-week button (highlighted when on current week)
- Week label (e.g. "Week 26, Jun 23 – Jun 29")
- Active diet label in header (shown only when diet preference is set)

**Week Summary tab (spreadsheet-style grid):**
- Rows = planned items; columns = Mon–Sun with a quantity cell per day; meal-slot grouping (Breakfast / Lunch / Dinner / Snacks)
- Add-row control (product search → select → quantity + unit)
- Remove row button per row
- Unit toggle per row: servings ↔ grams
- Item search dropdown: recently-used first, then user-owned, then alphabetical (FR-023)

**Calendar tab:**
- Layout toggle: Week / 4-day / Single-day
- Week layout: 7-column grid, each column = one day, rows = meal slots; compact week grid for quick overview
- 4-day and single-day layouts as sub-views
- Per-cell: add product, remove item, adjust servings (stepper)
- Drag-and-drop between meal slots and days (HTML5 DnD or library)
- Empty-day / empty-slot empty states

**Plan Summary Panel (above Calendar grid):**
- Lists all planned items for the week grouped by meal slot
- "Add item" button per slot → product search → add to that slot
- Empty state when no assignments

**Nutrition indicators:**
- Per-day progress bars (kcal, protein, fat, carbs) shown when user has a NutritionTarget set
- No indicators when target is not set (no error)

**Log actions:**
- "Log this day" button per day → calls `POST /plan/log/day`
- "Log this week" button → calls `POST /plan/log/week`
- Log icon per Calendar item → calls `POST /plan/log/item`

**PDF export:**
- "Export PDF" / "Week summary" button → calls `POST /plan/export/pdf` → triggers browser print dialog
- Shows empty-plan PDF without error when week is empty

## Acceptance criteria

**FR-016 — Week navigation**
- AC-046: "Next week" → following week loaded
- AC-047: "Today" → returns to current week
- AC-113: on current week → "Today" button highlighted

**FR-017 — Week Summary grid**
- AC-048: grid renders all assignments with day columns
- AC-049: add row → row appears in grid
- AC-050: remove row → row gone
- AC-051: toggle unit mode → row switches unit display

**FR-019 — Calendar meal slots**
- AC-053: Calendar tab → items grouped under Breakfast / Lunch / Dinner / Snacks
- AC-054: add to Tuesday Dinner → item appears
- AC-055: drag item → moves to new slot/day
- AC-056: adjust servings stepper → quantity updated
- AC-115: servings = 0 → validation error shown

**FR-020 — Calendar layouts**
- AC-057: switch to single-day layout → only that day shown
- AC-116: empty day in single layout → empty-state per slot

**FR-021 — Plan Summary Panel**
- AC-058: Calendar tab → summary panel visible with items by slot
- AC-059: "Add item" in panel → item appears in that slot
- AC-117: no assignments → empty slot sections (no error)

**FR-022 — Diet label**
- AC-060: diet "Keto" → label shown in header
- AC-061: no diet → no label (no error)

**FR-023 — Item search order**
- AC-062: type "oa" → recently used first
- AC-121: no history → alphabetical

**FR-024 — Nutrition indicators**
- AC-063: indicators show percentage of target
- AC-064: no target → indicators hidden (no error)

**FR-025 — Log actions**
- AC-065 / AC-066 / AC-067: log day / week / single item → confirmation feedback
- AC-118: empty day → log succeeds silently

**FR-026 — PDF export**
- AC-068: export → print dialog within 3 s
- AC-069: empty week → empty PDF (no error)

## Architecture context

- **FR:** FR-016–FR-026
- **NFR:** NFR-004 (PDF < 3s), NFR-013 (WCAG 2.1 AA), NFR-014 (responsive ≥ 1280px)
- **ADR:** ADR-0001 (log-from-plan writes to stub table — no read UI needed), ADR-0004 (topbar stats already wired in CARD-002 — now returns real data)
- **Components:** COMP-013 (MealPlanService), COMP-014 (NutritionTargetService), COMP-016 (LogFromPlanService), COMP-018 (MealPlanPdfExport)
- **Trace:** meta/architecture/trace.yml

## Worktree notes

—
