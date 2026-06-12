# User stories: personal cabinet

Requirements: [04_personal_cabinet.md](../requirements/04_personal_cabinet.md)

---

## US-PC-001 Sign in and manage email and password

**As a** user  
**I want** to sign in with email and password and change my credentials when needed  
**So that** my account stays secure and reachable.

**Acceptance criteria**

- [ ] User can register or sign in with email and password (per auth design).
- [ ] User can update email and/or password where the product allows, with validation and confirmation as required.

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

- [ ] Unit system preference is stored on the user profile.
- [ ] Displayed quantities in relevant modules respect this preference.

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

- [ ] User can select from diets or preferences offered (aligned with dietary analyser).
- [ ] System shows a recommended calorie corridor based on the chosen rules or formulas.
- [ ] User can set or adjust macro proportions within allowed bounds (per UX and validation rules).

---

## US-PC-006 Log meals and see daily nutrition summary

**As a** user  
**I want** to log products and recipes I ate and see a daily nutrition total  
**So that** I know whether I stayed on target.

**Acceptance criteria**

- [ ] User can add log entries for a day using products and/or recipes.
- [ ] A daily view aggregates nutrition (calories and relevant macros/micros per product scope) for that day.
- [ ] User can edit or remove incorrect log entries.
