# Non-Functional Requirements — Meal Forge MVP

## Performance

| Requirement | Target |
|---|---|
| Initial page load (cold, 10 Mbps connection) | < 2 s |
| Live nutrition recalculation in Products Analyser | < 100 ms after each input change |
| Search / filter response time (catalogue ≤ 10,000 items per language) | < 200 ms |
| Shopping list generation | < 500 ms for up to 31 days of assignments |
| PDF generation (print dialog open) | < 3 s |

## Accessibility

- WCAG 2.1 Level AA compliance across all views.
- All interactive controls are keyboard-navigable (Tab / Shift-Tab focus order, Enter / Space activation).
- Colour-coded indicators (green / amber / red corridor strips) must include a non-colour label or icon so information is not conveyed by colour alone.
- Minimum colour contrast ratio: 4.5:1 for normal text, 3:1 for large text (WCAG AA).
- All form inputs have a visible `<label>` associated via `for` attribute (or equivalent `aria-label`).

## Data limits (per user account)

| Entity | Limit |
|---|---|
| Products in global catalogue | 10,000 per language |
| User-added products per account | 500 |
| Recipes per account | 500 |
| Meal plan assignments (total, all time) | 10,000 |
| Meal tracking log entries | 3,650 (≈ 10 entries/day × 365 days) |
| Alternative units per product | 10 |
| Ingredients per recipe | 50 |

## Browser support

Last 2 major versions of: Chrome, Firefox, Safari (macOS + iOS), Edge.
Mobile browsers: Chrome for Android, Safari for iOS.

## Data & privacy

- No personally identifiable data (meal plans, tracking logs, profile information) is exposed to other users.
- User-added products are visible to all users in the global catalogue (see OQ-001). Only the creator can edit or delete their own products.
- User meal plans, tracking entries, and profile settings are private to the account holder.
