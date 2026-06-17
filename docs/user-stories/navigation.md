# User stories: navigation

Requirements: [06_meal_planner.md](../requirements/06_meal_planner.md) (nav structure implied by all modules)

---

## US-NAV-001 Sidebar navigation to all seven modules

**As a** user  
**I want** to see all application modules in the sidebar at all times  
**So that** I can reach any section in one click without hunting for it.

**Acceptance criteria**

- [ ] Sidebar is visible on all authenticated screens.
- [ ] Sidebar contains exactly 7 items in order: Planner, Products, Products analyser, Recipes, Diets, Shopping list, Profile.
- [ ] Shopping list appears as a top-level item (not nested inside Planner).
- [ ] Products analyser appears as a top-level item (not nested inside Products).

---

## US-NAV-002 Default landing view is Planner

**As a** user opening the app  
**I want** the Planner to be the first screen I see  
**So that** I land on the most commonly used view immediately.

**Acceptance criteria**

- [ ] Navigating to the app root (or completing sign-in) shows the Planner view.
- [ ] Planner is the active item in the sidebar on load.

---

## US-NAV-003 Active navigation item is highlighted

**As a** user  
**I want** the sidebar to visually indicate which section I am currently in  
**So that** I always know where I am in the app.

**Acceptance criteria**

- [ ] The sidebar item corresponding to the current view has a distinct active state (background, colour, or underline).
- [ ] Only one item is active at a time.
- [ ] The active state updates immediately when the user navigates.

---

## US-NAV-004 Topbar reflects the current view name

**As a** user  
**I want** the topbar to show the name of the current module  
**So that** I have a consistent orientation cue regardless of how deep in the view I am.

**Acceptance criteria**

- [ ] Topbar heading text matches the name of the currently active module.
- [ ] Heading updates without page reload when the user switches modules.

---

## US-NAV-005 Topbar shows reactive plan metrics

**As a** user  
**I want** to see a brief summary of the current week's plan stats (e.g. total kcal, number of planned items) in the topbar when in the Planner module  
**So that** I have at-a-glance feedback while editing.

**Acceptance criteria**

- [ ] While the Planner module is active, the topbar shows at least: planned kcal total and/or count of planned assignments for the selected week.
- [ ] Metrics update immediately when the user adds, edits, or removes an assignment (no manual refresh required).
- [ ] Metrics are not shown when a non-Planner module is active.
