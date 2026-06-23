# Kanban Board

_Updated: 2026-06-22_

## Wave plan

| Wave | Cards | Status |
|------|-------|--------|
| 1 | CARD-001 P1, CARD-009 P2 | ▶ active |
| 2 | CARD-002 P1, CARD-003 P1 | ⏳ blocked (→ CARD-001) |
| 3 | CARD-004 P2, CARD-005 P1 | ⏳ blocked (→ CARD-003) |
| 4 | CARD-006 P1, CARD-007 P2 | ⏳ blocked (→ CARD-005) |
| 5 | CARD-008 P2 | ⏳ blocked (→ CARD-007) |

_Gantt: [meta/kanban/gantt.md](gantt.md)_

## Backlog (v1.1 deferred — from meta/kanban/backlog.md)
- Products Analyser module (US-PAN-001–009)
- Dietary Analyser module (US-DA-001–005)
- Recipe Analyser module (US-RA-001–015)
- Personal Cabinet module (US-PC-001–010)
- Advanced Search module (US-AS-001–014)
- Shopping List "Next week" quick-select shortcut
- "Repeat every week" staple flag on products

## Ready
- **CARD-002** P1 · Navigation Shell + Auth UI (Next.js) _(wave 2)_
- **CARD-003** P1 · Product Catalog service (Python) _(wave 2)_
- **CARD-004** P2 · Product Catalog UI (Next.js) _(wave 3)_
- **CARD-005** P1 · Meal Planning service (Python) _(wave 3)_
- **CARD-006** P1 · Meal Planning UI (Next.js) _(wave 4)_
- **CARD-007** P2 · Shopping List service (Python) _(wave 4)_
- **CARD-008** P2 · Shopping List UI (Next.js) _(wave 5)_

## In Progress
- **CARD-001** P1 · Identity service (Python) _(wave 1)_
  `worktree: ../project-CARD-001` · `branch: card/001-identity-service`
  `elapsed: 0d / 5d est`
- **CARD-009** P2 · Set up Railway services and Vercel project _(wave 1)_
  `worktree: ../project-CARD-009` · `branch: card/009-railway-vercel-setup`
  `elapsed: 0d / 1d est`

## Review
_(none)_

## Done
_(none)_
