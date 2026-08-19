# Requirements Update Procedure — Meal Forge MVP

> This document governs how to add, change, or remove a requirement and propagate that change consistently across all four documentation and implementation layers.

---

## Layers and their canonical files

| # | Layer | Location | Authoritative file(s) |
|---|-------|----------|----------------------|
| 1 | Business requirements | `docs/requirements/` | `NN_<module>.md` + `actors.yml` |
| 2 | User stories | `docs/user-stories/` | one `<module>.md` per module |
| 3 | Test cases | `docs/test-cases/` | `tc-<module>.md` per-module files (**single source of truth**); `README.md` for counts |
| 4 | Prototype | `prototype/frontend/` | `app/page.tsx`, `types.ts`, `data/seed.ts` |

Supporting files (not layers, but must stay in sync):

| File | Purpose |
|------|---------|
| `docs/requirements/open-questions.md` | Decision log for resolved ambiguities |
| `docs/requirements/actors.yml` | Canonical actor list |
| `docs/user-stories/README.md` | Module index table |
| `docs/test-cases/issues.md` | Known prototype defects |

---

## Naming conventions

Getting names wrong across files is the most common source of drift. Follow these exactly.

### Module abbreviations — user stories

| Module | File | Story prefix |
|--------|------|--------------|
| Products database | `products-database.md` | `US-PA-NNN` |
| Products analyser | `products-analyser.md` | `US-PAN-NNN` |
| Dietary analyser | `dietary-analyser.md` | `US-DA-NNN` |
| Recipe analyser | `recipe-analyser.md` | `US-RA-NNN` |
| Personal cabinet | `personal-cabinet.md` | `US-PC-NNN` |
| Meal planner | `meal-planner.md` | `US-MP-NNN` |
| Shopping list | `shopping-list.md` | `US-SL-NNN` |
| Authentication | `authentication.md` | `US-AUTH-NNN` |
| Advanced search | `advanced-search.md` | `US-AS-NNN` |

### Module abbreviations — test cases

| Module | Section heading | Test case prefix |
|--------|----------------|-----------------|
| Navigation | TC-NAV | `TC-NAV-NNN` |
| Products database | TC-PRD | `TC-PRD-NNN` |
| Products analyser | TC-PAN | `TC-PAN-NNN` |
| Recipes | TC-RCP | `TC-RCP-NNN` |
| Dietary analyser | TC-DIT | `TC-DIT-NNN` |
| Meal planner — weekly summary | TC-PLN | `TC-PLN-NNN` |
| Meal planner — day cards | TC-DAY | `TC-DAY-NNN` |
| Meal planner — calendar | TC-CAL | `TC-CAL-NNN` |
| Shopping list | TC-SHP | `TC-SHP-NNN` |
| Personal cabinet / profile | TC-PRF | `TC-PRF-NNN` |
| Meal tracking | TC-MLT | `TC-MLT-NNN` |
| Authentication | TC-AUTH | `TC-AUTH-NNN` |
| Advanced search | TC-AS | `TC-AS-NNN` |

> **Note:** The Products database story prefix (`US-PA`) differs from the test case prefix (`TC-PRD`). This is intentional — `PA` is the original abbreviation from the user stories and has not been renamed to avoid breaking links. Do not "fix" this.

### Actor names

Always use the names from `actors.yml`. Currently: **User**, **Nutritionist**, **System**. Do not use "Cook", "Planner", "Admin", or any other name.

### Open question IDs

`OQ-NNN` — sequential, never reused. The current highest ID is `OQ-011`. OQ-009 and OQ-010 are open (Advanced Search module). OQ-011 is resolved (Dietary Analyser deferred to post-MVP1). The next available ID is `OQ-012`.

---

## Change categories

Classify the change before starting — this determines which layers need to be updated.

| Category | Layers affected | Example |
|----------|----------------|---------|
| **Additive** | All four (req → story → test → proto) | Adding a "Notes" field to products |
| **Corrective** | Requirement + downstream | Clarifying which actor can perform an action |
| **Scope change** | All four | Promoting URL import from post-MVP to MVP |
| **Decision / OQ resolution** | open-questions.md + affected layers | Deciding visibility rules for user products |
| **Consistency fix** | Whichever layers drifted | Renaming TC-PAL to TC-PAN |
| **Deprecation** | All four (mark/remove) | Removing YouTube import from MVP scope |
| **Prototype-only fix** | Layer 4 only + test case Status update | Fixing a UI bug, correcting a label |

---

## Update procedure

### Step 0 — Resolve ambiguities first

If the change is driven by an open question or unresolved ambiguity, **stop** and do this before touching any other file:

1. Add a new entry to `docs/requirements/open-questions.md` using the next `OQ-NNN` ID.
2. Write the decision: context → options considered → chosen option.
3. Get stakeholder confirmation if needed.
4. Only after the decision is recorded, continue to Step 1.

---

### Step 1 — Update requirements

1. Open the affected `docs/requirements/NN_<module>.md` file.
2. Make the change to the requirement text.
3. If the change was driven by an open question, add a decision callout directly in the requirement:
   ```
   > **Decision (OQ-NNN):** <one-sentence summary of the decision>
   ```
4. If `actors.yml` is affected (new actor, removed actor, permission change), update it.
5. If a new module is being added, create a new `NN_<module>.md` following the format of existing files and update the module list in `docs/user-stories/README.md`.

---

### Step 2 — Update user stories

1. Open `docs/user-stories/<module>.md`.
2. For each requirement change:
   - **Updated requirement** → update the story body, acceptance criteria, or both. Mark changed ACs clearly if they were previously signed off.
   - **New requirement bullet** → write a new story (`US-<MODULE>-NNN`). Use the next sequential ID. Link it to the source requirement at the top of the story.
   - **Removed requirement** → delete the story or add `> Removed: <date> — <reason>` if traceability history matters.
3. Update `docs/user-stories/README.md` module table if a new module was added.
4. Check: do any other module story files reference the changed behavior? Update cross-module references.

---

### Step 3 — Update test cases

1. Open `docs/test-cases/tc-<module>.md` for the affected module.
2. For each changed user story:
   - **Updated story / changed AC** → update the test case preconditions, steps, or expected result. Update the `**AC:**` reference line if the story ID changed.
   - **New story** → write a new test case block following the existing format. Use the next `TC-<MODULE>-NNN` ID. Include: AC reference, Priority, Preconditions, Steps, Expected result, Status.
   - **Removed story** → set `**Status:** 🚫 Removed — <date>` or delete the test case.
3. Update the **Status** field for every test case whose story was touched:
   - `✅` — implemented correctly in the prototype
   - `❌` — implemented but currently fails
   - `🚫` — not yet implemented (or deliberately out of scope for prototype)
   - `❓` — status unknown, needs testing
4. If the prototype has not been updated yet, set status to `🚫` for new cases and leave ❌ for broken cases.

---

### Step 4 — Update the prototype (if required)

If the change requires a code change to the prototype:

1. Check the current test case statuses before touching code (know what was passing before).
2. Make the change in:
   - `prototype/frontend/app/page.tsx` — view logic and UI
   - `prototype/frontend/types.ts` — if the data model changes
   - `prototype/frontend/data/seed.ts` — if seed data changes
3. Verify manually that every affected test case now passes at `http://localhost:3001`.
4. Update the **Status** of each affected test case to `✅`.
5. If any test from `docs/test-cases/issues.md` is now fixed, mark it `[FIXED — <date>]` in the issue log.

---

### Step 5 — Consistency review

Run this checklist before declaring the update complete.

#### Requirements ↔ User stories
- [ ] Every requirement bullet has at least one story that covers it.
- [ ] No story references a requirement section that was removed or renamed.
- [ ] All actor names match `actors.yml` (User, Nutritionist, System — no others).
- [ ] Story IDs are sequential, unique, and follow `US-<MODULE>-NNN`.

#### User stories ↔ Test cases
- [ ] Every acceptance criterion has at least one test case verifying it.
- [ ] No test case `**AC:**` line references a story that no longer exists.
- [ ] Test case IDs are sequential, unique, and follow `TC-<MODULE>-NNN`.
- [ ] No `❓` statuses remain for cases that have been tested this session.

#### Test cases ↔ Prototype
- [ ] Every `✅` test case was verified against the running prototype.
- [ ] Every `❌` test case has a corresponding entry in `docs/test-cases/issues.md`.
- [ ] Every `🚫` test case reflects a known prototype limitation or deferred feature.
- [ ] The prototype builds without TypeScript errors (`npx tsc --noEmit`).

#### Cross-document hygiene
- [ ] All file path references in documents resolve (no dead links).
- [ ] `docs/user-stories/README.md` module table is current.
- [ ] `docs/requirements/open-questions.md` has no unresolved questions.
- [ ] `docs/test-cases/issues.md` severity labels are current (no `🟡 fixed` issues still marked open).

---

### Step 6 — Done criteria

The update is complete when all of the following are true:

- [ ] The requirement file reflects the new state.
- [ ] All affected user stories are updated.
- [ ] All affected test cases are updated with correct expected results and Status values.
- [ ] Prototype is updated (if required) and affected test cases show `✅`.
- [ ] Consistency review (Step 5) passes with no open items.
- [ ] No new `❓` or `TODO` items introduced anywhere.
- [ ] If an open question was resolved: it is recorded in `open-questions.md`.

---

## Common pitfalls

| Pitfall | How to avoid |
|---------|-------------|
| Updating the prototype without updating requirements | Always start at layer 1, even for small changes |
| Writing new test cases before requirements are stable | Lock the requirement text before drafting tests |
| Leaving `❓` on tested cases | Run consistency review as the last step |
| Using wrong actor names ("planner", "cook") | Check `actors.yml` before writing any story |
| Duplicate story or test IDs | `grep "US-SL-" docs/user-stories/shopping-list.md` before adding the next one |
| Broken cross-document links after a rename | `grep -r "OLD-ID" docs/` after every rename |
| Open question driving a change without a recorded decision | Step 0 must be done before anything else |
| Updating `test-cases-detailed.md` instead of `tc-<module>.md` | `test-cases-detailed.md` and `prototype-test-cases.md` are legacy files — the authoritative TCs live in `tc-<module>.md` per-module files |

---

## Using AI assistance (Claude Code)

| Command | When to use |
|---------|-------------|
| `/business-analyst` | Full gap audit — finds inconsistencies across all layers |
| `/business-analyst let's update requirements for <module>` | Guided requirements update with consistency propagation |
| `/business-analyst write user stories for <requirement section>` | Draft stories from a specific requirement |
| `/business-analyst check traceability` | Verify every AC in every story has a test case |
| `/ui-ux-pro-max please retest the prototype against test cases and fix issues` | Full prototype-vs-test-cases verification and code fixes |

After any AI-assisted update, still run the Step 5 consistency review manually — AI can miss implicit cross-document references.
