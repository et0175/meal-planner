# CARD-003: User profile — language, units, demographics, diet & calorie corridor

**Status:** ready
**Priority:** P2
**Category:** feature
**Estimate:** 2d
**Revision pending:** false
**Skill:** nextjs-developer
**TDD:** —
**Branch:** card/003-user-profile
**Worktree:** —
**Source:** meta/architecture/handoff.md#increment-1
**Depends on:** CARD-002
**Review score:** —
**Started:** —
**Closed:** —
**Actual:** —
**Merge commit:** —
**Blocked by:** —

## What to implement

Implement the user profile features: language preference, unit system, demographic body metrics, diet preference selection, and calorie corridor configuration (including display). All five stories from Increment 1 that are user-facing.

**Scope:**
- **COMP-010 User Profile Service:**
  - `SetLanguage` — English or Ukrainian; persists immediately; governs UI language (CON-007)
  - `SetUnitSystem` — metric or other; governs quantity display throughout the product (FR-023)
  - `UpdateBodyMetrics` — weight, height, age, sex (CON-006: simple metrics only, no wearables)
  - `UpdateDietPreference` — links user to a diet from the diet catalog (FR-025)
  - `UpdateUserProfile` — the compound command that triggers token refresh when any calorie-corridor input changes (ADR-0006)
- **COMP-011 Calorie Corridor Calculator:**
  - Calculates `calorie_corridor` from body metrics + diet preference
  - Result embedded in JWT claims on every profile save that touches corridor inputs
- **UI pages:** profile settings page with tabs/sections for each group of settings

**Key constraint from handoff:**
> `UpdateUserProfile` must trigger token refresh whenever any calorie-corridor input changes (ADR-0006 mandatory rule). Body composition limited to simple metrics (weight, BMI); wearables excluded (CON-006).

## Acceptance criteria

**FR-022** — Language preference:
- Given: authenticated user selects "Ukrainian" → persists immediately, UI reflects language on next load

**FR-023** — Unit system:
- Given: user selects "imperial" → all quantity fields throughout the app show lbs/oz/fl.oz; "metric" shows g/ml

**FR-024** — Demographics:
- Given: user saves weight=70kg, height=175cm, age=30, sex=female → HTTP 200, values persisted, calorie corridor recalculated

**FR-025** — Diet preference + calorie corridor:
- Given: user selects diet "keto" and saves profile → calorie corridor recomputed and new JWT issued with updated claims
- Given: any calorie-corridor input changes (weight, diet, age) → JWT refreshed automatically (ADR-0006)

## Architecture context

- **FR:** FR-022, FR-023, FR-024, FR-025
- **CON:** CON-006 (simple body metrics only), CON-007 (English + Ukrainian only)
- **ADR:** ADR-0006 (calorie corridor in JWT — UpdateUserProfile must trigger token refresh)
- **Components:** COMP-010 (User Profile Service), COMP-011 (Calorie Corridor Calculator), COMP-012 (JWT Token Issuer — refresh), COMP-014 (Identity DB)
- **Trace:** meta/architecture/trace.yml

## Worktree notes

—
