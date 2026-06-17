# CARD-010: AI recipe import (GPT-4o)

**Status:** ready
**Priority:** P3
**Category:** feature
**Estimate:** 2d
**Revision pending:** false
**Skill:** nextjs-developer
**TDD:** —
**Branch:** card/010-ai-recipe-import
**Worktree:** —
**Source:** meta/architecture/handoff.md#increment-3
**Depends on:** CARD-008
**Review score:** —
**Started:** —
**Closed:** —
**Actual:** —
**Merge commit:** —
**Blocked by:** —

## What to implement

Implement the `ImportRecipe` feature: user submits a URL / PDF / YouTube link, the system calls GPT-4o with structured outputs, and the result is stored as a draft or saved recipe.

**Prerequisite — DEC-003 must be resolved before starting this card.**
The handoff mandates: DEC-003 (sync vs. async import) resolved before Increment 3 ships CARD-010.
If DEC-003 → `async_job_with_polling`: implement a job queue + polling endpoint.
If DEC-003 → `synchronous_with_timeout`: implement a blocking call with a timeout (e.g. 30s).
Default safe choice: HTTP 202 + polling (as noted in handoff).

**Scope:**
- **COMP-004 Recipe Import ACL:**
  - `ImportRecipe(sourceType, sourceUrl/pdfData)` — calls GPT-4o with structured outputs (ADR-0002)
  - Result: draft recipe with title, ingredient lines, instructions, estimated nutrition (via CatalogReadRepository to resolve product refs)
  - Stack must not be hardcoded outside ADR-0002 (CON-005)
- **UI:** "Import recipe" button/modal on recipe list page; source type selector (URL / PDF / YouTube); progress indicator (if async); review-and-save screen for the AI draft

**Key constraint from handoff:**
> DEC-003 (sync vs. async import pattern) is open and non-blocking; the team should decide before shipping this card. HTTP 202 + polling is the safer default for a ~10-second OpenAI call.
> Recipe import must not hardcode the AI stack outside ADR-0002 (CON-005).

## Acceptance criteria

**FR-016** — Recipe import from URL:
- Given: authenticated user, valid website URL → ImportRecipe(source_type=url) → HTTP 202 or 201, recipe persisted (AC-045)
- Given: import completes successfully → result has populated title and at least one ingredient line (AC-105)

**ADR-0002** — Structured outputs:
- Import calls GPT-4o with OpenAI structured outputs; model abstraction follows ADR-0002

**CON-005** — Stack not hardcoded:
- Model/provider selection must be configurable outside the import service

## Architecture context

- **FR:** FR-016
- **CON:** CON-005 (AI stack not hardcoded outside ADR-0002)
- **ADR:** ADR-0002 (GPT-4o structured outputs for recipe import)
- **Open decision:** DEC-003 — resolve before implementing the async/sync pattern here
- **Components:** COMP-003 (Recipe Management Service), COMP-004 (Recipe Import ACL), COMP-006 (Catalog Read Repository), COMP-008 (Catalog DB)
- **Trace:** meta/architecture/trace.yml

## Worktree notes

—
