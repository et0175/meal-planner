# Business requirements: personal cabinet

> **Decision (OQ-007):** Supported unit systems are metric and US customary (oz/lb, fl oz/cups/tbsp/tsp). UK Imperial is not in scope.  
> **Decision (OQ-006):** Meal tracking and Meal planner are intentionally independent. Planning is aspirational; logging is factual. A "log from plan" convenience shortcut is planned for a post-MVP version.

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
