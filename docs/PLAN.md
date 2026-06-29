# CARD-002: Navigation Shell + Auth UI — Implementation Plan

## Components to build (in order)

- [x] Read card + ADRs
- [ ] `frontend/src/lib/api/identity.ts` — typed fetch wrappers: register, sign-in, sign-out, reset-request
- [ ] `frontend/src/lib/hooks/useAuth.ts` — sessionStorage session management hook
- [ ] `frontend/src/components/ui/Button.tsx` — shared button primitive
- [ ] `frontend/src/components/ui/Input.tsx` — shared input primitive
- [ ] `frontend/src/app/globals.css` — Tailwind v4 base styles + teal palette
- [ ] `frontend/src/app/layout.tsx` — root layout (html, body, font, metadata)
- [ ] `frontend/src/app/page.tsx` — root redirect (auth→/planner, unauth→/sign-in)
- [ ] `frontend/src/app/(auth)/layout.tsx` — public layout (no shell)
- [ ] `frontend/src/app/(auth)/sign-in/page.tsx` — sign-in form
- [ ] `frontend/src/app/(auth)/register/page.tsx` — register form
- [ ] `frontend/src/app/(auth)/forgot-password/page.tsx` — forgot-password form
- [ ] `frontend/src/shell/Sidebar.tsx` — sidebar navigation component
- [ ] `frontend/src/shell/Topbar.tsx` — topbar with week-stats widget
- [ ] `frontend/src/app/(app)/layout.tsx` — auth guard + shell layout
- [ ] `frontend/src/app/(app)/planner/page.tsx` — placeholder
- [ ] `frontend/src/app/(app)/products/page.tsx` — placeholder
- [ ] `frontend/src/app/(app)/shopping/page.tsx` — placeholder
- [ ] `frontend/src/lib/api/planning.ts` — stub for GET /plan/summary
- [ ] `frontend/CLAUDE.md` — context for future sessions
- [ ] `frontend/README.md` — human-readable docs
- [ ] npm run lint + npm run format:check pass
- [ ] Commit

## Key decisions

- Session token in `sessionStorage` (tab-scoped, per FR-002) — key: `mf_session`
- Auth guard in `(app)/layout.tsx` using `"use client"` + `useEffect` redirect
- Root `page.tsx` is a Server Component that redirects based on cookie/header — but since
  token is in sessionStorage (client-only), use a client component with useEffect redirect
- Topbar calls `GET /plan/summary` from planning service; renders zero-state (0 meals, 0 kcal)
  when the response is empty, errors, or planning service is not yet implemented (ADR-0004)
- Identity API base URL from `NEXT_PUBLIC_IDENTITY_URL`; Planning from `NEXT_PUBLIC_PLANNING_URL`
- No raw fetch in components — all calls through `lib/api/`
- Brand primary: `#1A6B6E` (teal-700 from prototype)
- Sidebar items: Planner (`/planner`), Products (`/products`), Shopping (`/shopping`)

## Risks

- sessionStorage is client-only: root redirect must be a Client Component with useEffect
- Tailwind v4 uses `@import "tailwindcss"` not `@tailwind` directives
- `lucide-react` v1.20 — verify exact icon names match package (UtensilsCrossed, CalendarDays, etc.)
- ESLint + Prettier must both pass before commit
