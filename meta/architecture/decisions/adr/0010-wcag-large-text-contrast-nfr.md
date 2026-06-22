# ADR-0010: WCAG large-text contrast as explicit NFR metric

**Status:** Accepted  
**Date:** 2026-06-22  
**Deciders:** @omelnikova  
**Revised:** —

## Context

NFR-008 specifies a minimum colour contrast ratio of 4.5:1 for normal text, sourced
from WCAG 2.1 AA. NFR-006 requires WCAG 2.1 Level AA compliance across all views.
WCAG 2.1 AA also mandates a 3:1 contrast ratio for large text (defined as 18pt or
larger, or 14pt bold or larger), but NFR-008 does not capture this as a separate
machine-checkable metric — it only states the normal-text threshold.

The gap means that automated contrast testing tools, which operate on named
metrics and thresholds, have no explicit assertion target for large text. Relying
on the prose WCAG reference in NFR-006 alone requires the reviewer to know that
WCAG AA implies a 3:1 large-text threshold — knowledge that is not encoded in
the requirements artefact.

## Decision

We will add a dedicated NFR entry with `metric: contrast_ratio_large_text` and
`threshold: 3:1`, applicable under the condition "all large text elements (18pt+ or
14pt+ bold) across all authenticated views". This makes the large-text requirement
independently machine-checkable and explicit in the trace matrix alongside NFR-008,
without removing or changing the WCAG reference in NFR-006.

## Alternatives considered

### covered_by_wcag_nfr
Treat the large-text threshold as implicitly covered by NFR-006 (WCAG 2.1 AA
compliance). No new NFR entry is required. Rejected because this relies on implicit
knowledge of what WCAG AA mandates: an automated test suite or a new team member
reading only `requirements.yml` would not know a 3:1 threshold exists without
looking it up externally. An explicit metric removes that dependency and makes
compliance verifiable without external reference.

## Consequences

### Positive
- The large-text contrast requirement is machine-checkable: automated tools
  (e.g. axe-core, Lighthouse) can assert `contrast_ratio_large_text ≥ 3:1`
  as an explicit acceptance criterion.
- The requirements artefact is self-contained for accessibility compliance —
  no external WCAG lookup needed to understand what is required.

### Negative
- Minor duplication: the 3:1 threshold is technically implied by NFR-006. A
  reviewer reading both NFRs must understand they are consistent, not contradictory.

### Neutral
- The new NFR should cross-reference NFR-006 and NFR-008 in its `rationale`
  field so the relationship is clear in the artefact.
- Large text elements in this product include section headings, modal titles,
  and the calorie/macro summary figures in the planner and topbar widget — these
  are the primary targets for the 3:1 assertion.

## References

- DEC-006 (resolved by this ADR)
- NFR-006 (WCAG 2.1 AA compliance — parent requirement)
- NFR-008 (normal text contrast ratio 4.5:1 — sibling metric)

## History

- 2026-06-22: Created — explicit large-text NFR metric added for machine-checkable
  contrast compliance; covered-by-WCAG approach rejected as insufficiently explicit.
