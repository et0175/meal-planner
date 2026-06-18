# Business requirements: personal cabinet

> **Decision (OQ-007):** Supported unit systems are metric and US customary (oz/lb, fl oz/cups/tbsp/tsp). UK Imperial is not in scope.  
> **Decision (OQ-008):** "Log from plan" is now included in MVP (overrides OQ-006). Tracking and planning data stores remain independent; the log action copies data without linking the two stores.

A signed-in user's personal area, organised into two top-level tabs: **Profile** and **Meal tracking**.

---

## Functional requirements

### Tab structure

- The Personal Cabinet presents two top-level tabs:
  - **Profile** — personal information and diet preferences.
  - **Meal tracking** — food intake log, calendar view, goal corridor summaries, and nutrition progress.

### Profile tab — User profile

The user can maintain:

- Email and password
- Language
- Unit system: metric or US customary (oz/lb, fl oz/cups/tbsp/tsp)
- Gender
- Age
- Weight
- Body composition *(out of scope for MVP1 — specific fields TBD in a later iteration)*

### Profile tab — Diet preferences

- The user selects a single active diet, sees a recommended calorie range, and sets or adjusts the protein, fat, and carbohydrate split.
- The calorie corridor is defined as `target − 150` to `target + 150` kcal around the user's stated calorie target.
- Macro percentages must sum to 100%.
- The currently active diet label is surfaced in the Meal planner header so the user can see their diet context while planning.

### Meal tracking tab

Log food intake (products and recipes) and view a daily nutrition summary. Meal tracking records what the user **actually ate**, as distinct from the Meal planner which records what they **intend to eat**. The two are independent: logging a meal in Tracking does not create a planner assignment, and planning a meal does not create a tracking entry.

#### Layout views

The Meal tracking tab offers three layout views toggled by a **Today / Week / Month** selector:

- **Today** — shows the current day's log entries and the daily nutrition summary.
- **Week** — shows a 7-day calendar view for the selected week, with per-day kcal totals and corridor indicators.
- **Month** — shows a month grid with per-day kcal totals and corridor indicators.

#### Log from plan

- From the Meal planner, the user can trigger **"Log this day"** (logs all assignments for a single selected day) or **"Log this week"** (logs all assignments for the full selected week) to create Meal tracking entries pre-filled from the planned items and quantities.
- Created entries appear in the Meal Tracking tab and are editable (quantity, item, or removal).
- If a tracking entry already exists for a day + item, the log-from-plan action adds to it (does not duplicate or overwrite silently).

#### Goal corridor summary

- A summary panel shows whether the calorie corridor goal was reached for the current day and the current week.
- If the day's logged kcal falls within the corridor, the summary shows a "goal reached" indicator; if below or above, it shows "below target" or "above target" respectively.
- A weekly summary shows the number of days out of 7 on which the corridor goal was reached.

#### Nutrition progress percentages

- The daily tracking view shows, for each macro (calories, protein, fat, carbs), the **consumed amount as a percentage of the target**.
- A **weekly summary** shows the average % of target per macro across logged days.
- A **monthly summary** shows the same averaged across all logged days in the month.

---

## UI / Prototype spec

- The Personal Cabinet displays two tabs at the top: **Profile** and **Meal tracking**. Clicking a tab switches the content area.
- The Profile tab contains: personal details section (email/password, language, unit system, demographics) and diet preferences section (diet selector, calorie target, macro split, corridor display).
- The macro split input shows a warning when percentages do not sum to 100%.
- The Meal tracking tab shows a **Today / Week / Month** toggle at the top. The default view is **Today**.
- The daily and weekly nutrition summaries are displayed as a **pie chart** showing the proportion of calories consumed from protein, fat, and carbs relative to the target. The corridor goal status and % of target figures accompany the chart.
- The Week and Month layouts show one cell per day with total kcal logged and a corridor indicator colour-coded: green = within corridor, amber = above, red = below.
