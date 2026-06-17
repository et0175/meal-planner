# Business requirements: personal cabinet

> **Decision (OQ-007):** Supported unit systems are metric and US customary (oz/lb, fl oz/cups/tbsp/tsp). UK Imperial is not in scope.  
> **Decision (OQ-008):** "Log from plan" is now included in MVP (overrides OQ-006). Tracking and planning data stores remain independent; the log action copies data without linking the two stores.

A signed-in user’s personal area.

## User profile

The user can maintain:

- Email and password  
- Language  
- Unit system: metric or US customary (oz/lb, fl oz/cups/tbsp/tsp)  
- Gender  
- Age  
- Weight  
- Body composition (as supported by the product)  

## Diet preferences

The user selects a single active diet, sees a recommended calorie range, and sets or adjusts the protein, fat, and carbohydrate split.

- The calorie corridor is displayed as `target − 150` to `target + 150` kcal around the user's stated calorie target.
- Macro percentages must sum to 100%; the UI shows a warning when the total is not 100%.
- The currently active diet label is surfaced in the Meal planner header so the user can see their diet context while planning.

## Meal tracking

Log food intake (products and recipes) and view a daily nutrition summary. Meal tracking records what the user **actually ate**, as distinct from the Meal planner which records what they **intend to eat**. The two are independent: logging a meal in Tracking does not create a planner assignment, and planning a meal does not create a tracking entry.

### Log from plan

- From the Meal planner, the user can trigger **"Log this day"** (logs all assignments for a single selected day) or **"Log this week"** (logs all assignments for the full selected week) to create Meal tracking entries pre-filled from the planned items and quantities.
- Created entries appear in the Meal tracking section of the Personal cabinet and are editable there (quantity, item, or removal).
- If a tracking entry already exists for a day+item, the log-from-plan action adds to it (does not duplicate or overwrite silently).

### Calendar view

- The Meal tracking section offers a **calendar view** similar to the Meal planner's Calendar tab.
- The calendar shows one cell per day; each cell displays logged items, total kcal logged, and a visual indicator of whether the calorie corridor was reached for that day.
- The user can navigate between weeks and months in this calendar view.

### Goal corridor summary

- A summary panel shows whether the **calorie corridor goal** was reached for the current day and the current week.
- If the day's logged kcal falls within the corridor (`target − 150` to `target + 150`), the summary shows a "goal reached" indicator; if below or above, it shows "below target" or "above target" respectively.
- A weekly summary shows the number of days out of 7 on which the corridor goal was reached.

### Nutrition progress percentages

- The daily tracking view shows, for each macro (calories, protein, fat, carbs), the **consumed amount as a percentage of the target**.
- The Personal cabinet also shows a **weekly summary** (average % of target per macro across logged days) and a **monthly summary** (same, averaged across all logged days in the month).
