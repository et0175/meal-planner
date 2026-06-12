# Business requirements: meal planner

A module for choosing meals across a date range.

## Date range

- By default, the range is the current calendar week (start through end), but the user can change it.
- The system shows one card per day in the selected range.
- The page also includes a meal-prep summary listing all dishes planned for that range.

## Building the plan (summary and categories)

- Products and recipes marked for the current week appear in the summary area.
- The user can filter and select products and recipes (for example via drag-and-drop) and place them into the summary.

1. Selected products and recipes can be organized into menu sections such as: breakfasts, lunches, dinners, desserts, salads, and snacks.
2. The user can add, delete, or rename these sections.

## Day cards

1. Each day card includes breakfast, lunch, dinner, and snacks by default.
2. The user can add, delete, or rename sections on a day card.
3. The user can drag items from the summary into a day card section. Each section can hold zero or more items. Items remain in the summary after they are placed on a day card.
4. The user can drag items between different day cards and between sections on the same day card.
5. The user can select items in another way (not only drag-and-drop); those selections should also appear in the summary as appropriate.
6. The user can remove an item from a day card. If the item does not appear on any other day card, it is removed from the summary as well.
7. The user can set the number of servings for each dish on a day card.
8. Each day card shows a nutrition summary for its contents.

## Shopping list

- Generate a shopping list from the meal plan, or refresh an existing shopping list from the current plan.
