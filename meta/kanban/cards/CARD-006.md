# CARD-006: Custom products + diet catalog

**Status:** ready
**Priority:** P2
**Category:** feature
**Estimate:** 2d
**Revision pending:** false
**Skill:** nextjs-developer
**TDD:** —
**Branch:** card/006-custom-products-diet-catalog
**Worktree:** —
**Source:** meta/architecture/handoff.md#increment-2
**Depends on:** CARD-004
**Review score:** —
**Started:** —
**Closed:** —
**Actual:** —
**Merge commit:** —
**Blocked by:** —

## What to implement

Implement custom product CRUD (user-created products), the diet catalog UI (list + description), and product-diet compatibility tagging.

**Scope:**
- **COMP-001 Product Catalog Service — write path:**
  - `CreateProduct(name, calories, protein, fat, carbs, ...)` — user-owned product; appears in catalog immediately (FR-004)
  - `UpdateProduct(id, ...)` — owner-only; 403 for non-owners and system-seeded products (FR-005 / NFR-002)
  - `DeleteProduct(id)` — owner-only; same authz rule (FR-005 / NFR-002)
- **COMP-002 Dietary Tagging Service — UI + commands:**
  - Diet list page: displays 12+ diets from CARD-004 seed (FR-007)
  - Diet detail: shows description, macro-split guidance where applicable (FR-007)
  - `TagProductWithDiet(productId, dietId)` — idempotent; 401 for unauthenticated (FR-008)
- **UI:** "Add product" form (name + nutrition fields), product edit form (owner only), diet list and detail pages

**Key constraint from handoff:**
> Ownership enforcement (INV-002) must pass NFR-002 gate: zero exceptions — non-owners must never succeed in editing or deleting another user's product.

## Acceptance criteria

**FR-004** — Add custom product:
- Given: authenticated user, valid payload → HTTP 201, product appears in catalog search (AC-009)
- Given: empty name → HTTP 422, nothing persisted (AC-010)
- Given: negative calories → HTTP 422, nothing persisted (AC-011)
- Given: unauthenticated → HTTP 401 (AC-012)

**FR-005** — Ownership enforcement:
- Given: user A owns product P → A updates name → HTTP 200, name changed (AC-013)
- Given: user B tries to update P owned by A → HTTP 403, product unchanged (AC-014)
- Given: user A deletes P → HTTP 200, P no longer retrievable (AC-015)
- Given: user B tries to delete P owned by A → HTTP 403, P still exists (AC-016)
- Given: system-seeded product → any user deletes → HTTP 403 (AC-017)

**FR-008** — Product-diet tag:
- Given: authenticated user, product P, diet D → TagProductWithDiet → HTTP 200, D in product's compatibility list (AC-024)
- Given: same product + diet tagged twice → idempotent, no duplicate (AC-025)
- Given: unauthenticated → HTTP 401 (AC-026)

## Architecture context

- **FR:** FR-004, FR-005, FR-007, FR-008
- **NFR:** NFR-002 (ownership — zero exceptions), NFR-004 (structured log on every command)
- **ADR:** (none specific to this card)
- **Components:** COMP-001 (Product Catalog Service), COMP-002 (Dietary Tagging Service), COMP-008 (Catalog DB)
- **Trace:** meta/architecture/trace.yml

## Worktree notes

—
