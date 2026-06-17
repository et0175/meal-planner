# User stories: personal cabinet

Requirements: [05_personal_cabinet.md](../requirements/05_personal_cabinet.md)

---

## US-PC-001 Update email and password

**As a** signed-in user  
**I want** to change my email address or password from my profile  
**So that** my account stays secure and reachable if my details change.

> Registration and sign-in flows are covered in [authentication.md](authentication.md).

**Acceptance criteria**

- [ ] User can change their email address; the new address must be unique and the change requires password confirmation.
- [ ] User can change their password; the form requires the current password and a new password meeting the minimum strength policy.
- [ ] After a password change, the current session is invalidated and the user is redirected to sign-in.

---

## US-PC-002 Set language preference

**As a** user  
**I want** to choose my interface language  
**So that** I can use the app in English or Ukrainian as offered.

**Acceptance criteria**

- [ ] Language setting is available in profile or settings.
- [ ] Changing language updates the UI without requiring a full reinstall (per i18n implementation).

---

## US-PC-003 Set unit system

**As a** user  
**I want** to choose metric or another supported unit system  
**So that** weights and measures match how I cook and shop.

**Acceptance criteria**

- [ ] Unit system preference is stored on the user profile; options are metric and US customary.
- [ ] In metric mode, weights show in g/kg and volumes in ml/l.
- [ ] In US customary mode, weights show in oz/lb and volumes in fl oz/cups/tbsp/tsp.
- [ ] Displayed quantities in all modules (products, recipes, planner, shopping list) respect the selected preference.

---

## US-PC-004 Maintain demographic and body metrics

**As a** user  
**I want** to record gender, age, weight, and body composition (where supported)  
**So that** recommendations can be personalized.

**Acceptance criteria**

- [ ] Profile form includes gender, age, weight, and body composition fields as defined by the product (optional vs required per field policy).
- [ ] Values persist and are editable; invalid inputs are rejected with clear messages.

---

## US-PC-005 Configure diet preferences and calorie corridor

**As a** user  
**I want** to select diet preferences, see a recommended calorie range, and set protein, fat, and carbohydrate proportions  
**So that** planning and tracking align with my goals.

**Acceptance criteria**

- [ ] User can select one diet at a time from the diets offered by the dietary analyser (single-select).
- [ ] System displays a calorie corridor as `target − 150` to `target + 150` kcal (e.g. a 2000 kcal target yields 1850–2150 kcal).
- [ ] User can set macro proportions (protein %, fat %, carbs %); the UI shows a visible warning when the three values do not sum to exactly 100%.

---

## US-PC-006 Log meals and see daily nutrition summary

**As a** user  
**I want** to log products and recipes I ate and see a daily nutrition total  
**So that** I know whether I stayed on target.

> **Design note:** Meal tracking (what was eaten) and the Meal planner (what is intended) are independent by design — planning is aspirational, logging is factual. Logging a meal does not create a planner assignment. A "log from plan" shortcut (US-MP-016) creates tracking entries pre-filled from plan data; the data stores remain independent.

**Acceptance criteria**

- [ ] User can add log entries for a day using products and/or recipes.
- [ ] A daily view aggregates nutrition (calories and relevant macros/micros per product scope) for that day.
- [ ] User can edit or remove incorrect log entries.

---

## US-PC-007 View meal tracking in calendar view

**As a** user who wants to review my logging history  
**I want** a calendar view of my Meal tracking that shows what I logged each day  
**So that** I can spot patterns and gaps in my food intake at a glance.

Source: [05_personal_cabinet.md](../requirements/05_personal_cabinet.md) — Calendar view

**Acceptance criteria**

- [ ] The Meal tracking section of the Personal cabinet includes a calendar view similar to the Meal planner's Calendar tab.
- [ ] Each day cell in the calendar shows: logged items (names), total kcal logged, and a visual indicator of whether the calorie corridor was reached.
- [ ] Days with no log entries show an empty or placeholder state.
- [ ] The user can navigate between weeks and months in the tracking calendar.
- [ ] Clicking a day cell navigates to or highlights that day's detailed log entries.

---

## US-PC-008 See whether corridor goal is reached each day and week

**As a** user with a calorie target set  
**I want** to see at a glance whether I hit my corridor goal today and across the current week  
**So that** I can take action when I am persistently under or over target.

Source: [05_personal_cabinet.md](../requirements/05_personal_cabinet.md) — Goal corridor summary

**Acceptance criteria**

- [ ] A summary panel in Meal tracking shows the current day's logged kcal and whether it falls within the corridor (`target − 150` to `target + 150` kcal).
- [ ] The summary labels the day's status: "Within goal", "Below target", or "Above target".
- [ ] A weekly summary shows the number of days out of 7 on which the corridor goal was reached (e.g. "4 / 7 days on target").
- [ ] The summary is not shown if no calorie target is set in the profile.

---

## US-PC-009 See nutrition progress percentages and weekly/monthly summaries

**As a** user tracking my intake  
**I want** to see each macro as a percentage of my daily target, and summary views by week and month  
**So that** I understand my consistency over time and can spot nutritional gaps.

Source: [05_personal_cabinet.md](../requirements/05_personal_cabinet.md) — Nutrition progress percentages

**Acceptance criteria**

- [ ] The daily tracking view shows, for each macro (kcal, protein, fat, carbs), the consumed amount and the percentage of the target value.
- [ ] A weekly summary view shows the average % of target per macro across all logged days in the week.
- [ ] A monthly summary view shows the same averages across all logged days in the month.
- [ ] Days with no entries are excluded from the average calculation (not counted as 0%).
- [ ] The progress display is not shown if no profile targets are set.
