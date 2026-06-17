# Kanban Board

_Updated: 2026-06-16_

## Wave plan

| Wave | Cards | Status |
|------|-------|--------|
| 1 | CARD-001 P1 | ✅ done |
| 2 | CARD-002 P1 | ⏳ ready |
| 3 | CARD-003 P2, CARD-004 P1 | ⏳ blocked (→ CARD-002) |
| 4 | CARD-005 P1, CARD-006 P2 | ⏳ blocked (→ CARD-004) |
| 5 | CARD-007 P2, CARD-008 P1 | ⏳ blocked (→ CARD-005) |
| 6 | CARD-009 P2, CARD-010 P3, CARD-011 P2 | ⏳ blocked (→ CARD-008) |
| 7 | CARD-012 P2 | ⏳ blocked (→ CARD-007, CARD-009) |
| 8 | CARD-013 P2 | ⏳ blocked (→ CARD-012) |
| 9 | CARD-014 P2 | ⏳ blocked (→ CARD-013) |

_Gantt: [meta/kanban/gantt.md](gantt.md)_

## Architecture

_(none)_

## Ready

- **CARD-002** P1 · Auth Service + JWT issuance
  `branch: card/002-auth-service-jwt-issuance` · `est: 2d`

## In Progress

_(none)_

## Review

_(none)_

## Done

- **CARD-001** P1 · DB schema + infrastructure skeleton
  `merged: f18b9ce` · `actual: 0.4d / 2d est` · `score: 9/10`
