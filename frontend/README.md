# Meal Forge — Frontend Prototype

Single-page interactive prototype built with Next.js. All data is in-memory (no backend required).

## Prerequisites

- **Node.js** 18 or later ([nodejs.org](https://nodejs.org))
- **npm** 9 or later (bundled with Node.js)

## Running the prototype

```bash
# 1. Install dependencies (first time only, or after pulling changes)
npm install

# 2. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app reloads automatically when you save a file.

## What's included

The prototype covers seven views, accessible from the sidebar:

| View | What you can do |
|---|---|
| **Planner** | Plan meals week by week — Weekly summary grid (grouped by Breakfast / Lunch / Dinner / Snacks), Day cards with drag-and-drop, and a Calendar overview |
| **All products** | Browse the product database in list or card view; filter by category, diet, or week flag; add/edit/delete your own products |
| **Products analyser** | Compose a custom list of products and see the combined nutrition breakdown live |
| **Recipes** | Browse, filter, and manage recipes |
| **Diets** | Reference cards for common diet patterns |
| **Profile** | Personal nutrition targets and unit preferences |
| **Shopping list** | Generate a grocery list from a selected date range, grouped by product category |

## Project structure

```
src/
  app/
    page.tsx      # All prototype logic and views (single file)
    styles.css    # Global styles and design tokens
    layout.tsx    # Root layout
```

## Other commands

```bash
# Type-check without emitting (catches TypeScript errors)
npx tsc --noEmit

# Production build (optional — not needed for prototype work)
npm run build
npm run start
```
