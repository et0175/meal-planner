# ADR-0002: Recipe import uses GPT-4o with structured outputs

**Status:** Accepted  
**Date:** 2026-06-12  
**Deciders:** product owner  
**References:** DEC-002, FR-016, CON-005, EXT-001

---

## Context

The Recipe Analyser module must support importing a recipe from three external source types: a URL, a PDF, and a YouTube video (US-RA-010). In all three cases the system must extract structured recipe data — ingredient lines (with amounts and product references), steps, servings count, and enough metadata to compute a nutrition breakdown — and produce an editable draft that the user can review before saving.

The extraction step requires natural-language understanding to handle the wide variety of formats these sources use. The vision document confirms an OpenAI-based parsing pipeline as the preferred direction (CON-005); the exact model and API pattern was left open (DEC-002) pending this decision.

Three alternatives were evaluated: GPT-4o with structured outputs, GPT-4o-mini with a GPT-4o fallback, and a fine-tuned smaller model.

The decision is bounded to MVP1 (web only, moderate import volume). The YouTube source type requires a separate transcription step (Whisper API or YouTube captions) before the model call; that is out of scope for this ADR.

---

## Decision

**Use GPT-4o with structured outputs (JSON schema enforcement) for the recipe import extraction step.**

A single API call is made to GPT-4o with a declared JSON schema matching the recipe draft structure. The model returns a fully typed object; no post-processing coercion is needed. The same call pattern is used for all three source types (URL text, PDF text, YouTube transcript) — only the pre-processing step that produces the text differs.

---

## Consequences

### Positive

- **Highest extraction accuracy** across all three source types, including complex multi-component recipes (sauce + base + garnish, multi-step ingredient lists).
- **Single code path** — one model, one API call, one schema. No conditional escalation logic, no fallback orchestration to test.
- **Schema enforced by the API** — GPT-4o structured outputs guarantees the response conforms to the declared JSON schema, eliminating a class of runtime parsing errors.
- **Predictable behavior** — a fixed model means reproducible output characteristics; easier to write integration tests against.

### Negative

- **Higher per-import cost** — approximately $0.01–0.05 per recipe depending on input length, compared to GPT-4o-mini. At low MVP1 import volumes this is not material; it should be re-evaluated if imports scale significantly.
- **Latency up to ~10 seconds** for a single extraction call. This makes the synchronous-vs-async pattern for the import flow a live question (DEC-003); the UX must account for the wait time regardless of which pattern is chosen.

### Neutral

- Cost can be optimized later (post-MVP1) by introducing a GPT-4o-mini first-pass with GPT-4o fallback (Option B of DEC-002) once enough imported recipes exist to characterize failure modes accurately.
- The model choice is encapsulated behind an import service interface; swapping models in the future requires changing configuration and the system prompt, not the surrounding application code, provided the schema contract is stable.

---

## Alternatives considered

**GPT-4o-mini with GPT-4o fallback** — rejected for MVP1. The cost savings (~10–20×) are real but modest at expected MVP1 import volumes. The two-code-path complexity (three test outcomes: mini success, mini fail → GPT-4o success, total fail) is not worth the engineering overhead at this stage. Revisit post-MVP1 if import volume makes cost material.

**Fine-tuned smaller model** — rejected. Requires labeled training data that does not exist yet. Maintenance burden grows as recipe formats evolve (new YouTube layouts, PDF structures). Appropriate only after thousands of successfully imported recipes are available as training examples. Revisit as a cost-optimization measure post-MVP2.
