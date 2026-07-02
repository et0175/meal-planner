# User Stories — Meal Forge Core Loop

## Authentication (2026-06-21)
<!-- source: docs/user-stories/authentication.md (US-AUTH-001–007) -->

US-001: As a new visitor, I want to create an account with my email and password, so that I can access the application and my data is stored under my identity. [US-AUTH-001]

US-002: As a registered user, I want to sign in with my email and password, so that I can access my personal data and plans. [US-AUTH-002]

US-003: As a signed-in user, I want to sign out explicitly, so that my session is closed on shared devices. [US-AUTH-003]

US-004: As a user who cannot remember their password, I want to request a password reset link by email, so that I can regain access without contacting support. [US-AUTH-004]

US-005: As a signed-in user, I want my session to persist while the browser tab is open, so that I do not have to sign in again on every navigation. [US-AUTH-005]

US-006: As a product owner, I want all application modules to require authentication, so that user data is protected and the product is accessed only by registered users. [US-AUTH-006]

US-007: As the system, I want both the User and Nutritionist roles to have identical access in MVP1, so that role infrastructure is in place without exposing unimplemented permission differences. [US-AUTH-007]

## Navigation shell (2026-06-21)
<!-- source: docs/user-stories/navigation.md (US-NAV-001–005) -->

US-008: As a user, I want to see all application modules in the sidebar at all times, so that I can reach any section in one click. [US-NAV-001]

US-009: As a user opening the app, I want the Planner to be the first screen I see, so that I land on the most commonly used view immediately. [US-NAV-002]

US-010: As a user, I want the sidebar to visually indicate which section I am currently in, so that I always know where I am in the app. [US-NAV-003]

US-011: As a user, I want the topbar to show the name of the current module, so that I have a consistent orientation cue regardless of how deep in the view I am. [US-NAV-004]

US-012: As a user, I want to see a brief summary of the current week's plan stats in the topbar when in the Planner, so that I have at-a-glance feedback while editing. [US-NAV-005]

## Products Database (2026-06-21)
<!-- source: docs/user-stories/products-database.md (US-PA-001–012) -->

US-013: As a user, I want to browse All products with nutrition breakdown per item, so that I can compare foods and use them in plans accurately. [US-PA-001]

US-014: As a user building a meal plan, I want to filter products by category and diet tag, so that I can narrow the list to relevant items quickly. [US-PA-002]

US-015: As a user, I want to search for a product by name or diet tag, so that I can find a specific item without scrolling the whole catalog. [US-PA-003]

US-016: As a user, I want search, filter, and browse to work together on a single screen, so that I can narrow down products quickly without losing context. [US-PA-004]

US-017: As a user, I want to add a product not in the default database, so that my plans reflect what I actually buy or eat. [US-PA-005]

US-018: As a user who added custom products, I want to edit or delete only the products I created, so that I cannot change system-wide data by mistake. [US-PA-006]

US-019: As a user planning weekly meals, I want to mark a product as planned for this week or next week, so that it surfaces in the appropriate weekly plan and can be filtered accordingly. [US-PA-007]

US-020: As a user, I want to toggle All products between category cards view and list view, so that I can navigate by food group or compare nutrition in a table. [US-PA-008]

US-021: As a user, I want to see product categories as clickable cards and see the products within a category when I click, so that I can navigate to a specific food group quickly. [US-PA-009]

US-022: As a user, I want to see a detailed product card with a macro pie chart and unit conversion table, so that I can understand the macro balance at a glance. [US-PA-010]

US-023: As a user comparing products, I want to sort the product table by any column, so that I can quickly find the highest-protein or lowest-calorie options. [US-PA-011]

US-024: As a user adding a product, I want to define multiple alternative units with clear gram-conversion labels, so that the product can be measured accurately in every context. [US-PA-012]

US-055: As a user who reads in my own language, I want product names, categories, and diet-tag labels shown in my chosen language — falling back to English when a translation is missing — so that I can browse and search the catalog without a language barrier. [US-PA-013]

## Meal Planner (2026-06-21)
<!-- source: docs/user-stories/meal-planner.md (US-MP-001–023) -->

US-025: As a user planning meals, I want to move forward and backward through calendar weeks and jump to the current week, so that I can plan ahead or review past weeks. [US-MP-001]

US-026: As a user, I want to switch between Week summary and Calendar tabs, so that I can edit or review my plan in the format that suits the task. [US-MP-002]

US-027: As a user, I want to fill in a spreadsheet-style grid with items and servings per day per meal slot, so that I can see and edit my entire week at a glance. [US-MP-003]

US-028: As a user, I want to add new rows to any meal slot and remove rows I no longer need, so that my summary reflects the current plan. [US-MP-004]

US-029: As a user who thinks in weight, I want a unit selector column in the Week summary grid to switch each row between servings mode and grams mode, so that I can enter quantities in the unit I actually measure. [US-MP-005]

US-030: As a user, I want products and recipes I mark "This week" to appear in the planner summary automatically, so that I do not have to add them manually. [US-MP-006]

US-031: As a user, I want each day in the Calendar to show its meals divided by Breakfast, Lunch, Dinner, and Snacks, so that I can see and adjust what I am eating each day. [US-MP-007]

US-032: As a user, I want to add items directly to a specific meal slot in a calendar day and remove items I no longer want, so that I can fine-tune each day without the summary grid. [US-MP-008]

US-033: As a user, I want to increase or decrease the number of servings for an item in a calendar day view, so that portion sizes match what I will actually eat. [US-MP-009]

US-034: As a user, I want to drag a planned item from one meal slot or day to another in the Calendar, so that I can rebalance my week quickly. [US-MP-010]

US-035: As a user, I want a compact calendar grid showing all planned items across the week, so that I can quickly sense-check the week. [US-MP-011]

US-036: As a user, I want to toggle the Calendar between week and month views, so that I can zoom out to see how meals are distributed across the month. [US-MP-012]

US-037: As a user, I want to add items to a day and remove them directly in the Calendar, so that I can edit my plan without switching to the Week summary. [US-MP-013]

US-038: As a user, I want to drag planned items from one day to another in the Calendar, so that I can move meals to different days without re-entering them. [US-MP-014]

US-039: As a user who has set a diet preference in their profile, I want to see my active diet label in the planner header, so that I can plan meals with my dietary context in view. [US-MP-015]

US-040: As a user who wants to record what I ate without re-entering data, I want to log a single day or an entire week from the planner in one action, so that my Meal tracking entries are pre-filled from my plan. [US-MP-016]

US-041: As a user who wants a focused view, I want to switch the Calendar to a single-day or 4-day layout, so that I can see and edit meals in more detail than the full-week grid allows. [US-MP-017]

US-042: As a user planning in the Calendar tab, I want to see a summary of all planned items above the calendar grid organised by meal slot, so that I can quickly assign planned items to specific days. [US-MP-018]

US-043: As a user tracking nutritional goals, I want to see the percentage of my target corridor consumed for each planned day with per-macro indicators, so that I can plan ahead to stay on target. [US-MP-019]

US-044: As a user adding items to the planner, I want item search suggestions sorted by recently used, then user-owned, then alphabetical, so that commonly planned and personal items are always at the top. [US-MP-020]

US-045: As a user reviewing my meals in the Calendar, I want to log a single item directly from the calendar, so that I can mark only what I actually ate one item at a time. [US-MP-021]

US-046: As a user who wants to share or print my meal plan, I want to download the current week's plan as a PDF, so that I can have an offline or printed copy. [US-MP-022]

US-047: As a user planning in the Calendar tab, I want to add an item to a specific meal slot in the plan summary panel, so that I can build my plan quickly from within the Calendar tab itself. [US-MP-023]

## Shopping List (2026-06-21)
<!-- source: docs/user-stories/shopping-list.md (US-SL-001–007) -->

US-048: As a user, I want the shopping list to be its own navigation item, so that I can generate and review my grocery list independently of the meal planner. [US-SL-001]

US-049: As a user, I want to choose a from–to date range for the shopping list, so that the list covers exactly the days I am shopping for. [US-SL-002]

US-050: As a user, I want to see all planned meals within the selected date range summarised in one place, so that I know which dishes I am shopping for. [US-SL-003]

US-051: As a user, I want all planned items — recipe ingredients and standalone products — aggregated and grouped by category, so that I can shop efficiently by section of the supermarket. [US-SL-004]

US-052: As a user who has made changes to their meal plan after generating a grocery list, I want to see that the list is stale and refresh it, so that I do not shop from an outdated list. [US-SL-005]

US-053: As a user navigating to the Shopping list, I want the grocery list to be generated immediately without any extra action, so that I can see my shopping needs at a glance. [US-SL-006]

US-054: As a user who wants to shop without a phone, I want to download my grocery list as a PDF, so that I can print or share it. [US-SL-007]
