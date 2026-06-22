# Implementation Gantt

_Generated: 2026-06-22_

```mermaid
gantt
  title Meal Forge MVP1 — Implementation plan
  dateFormat X
  axisFormat Day %j

  section Wave 1 (no deps)
    CARD-001 Identity service (Python)        :p1, card1, 0, 5d

  section Wave 2
    CARD-002 Navigation Shell + Auth UI       :p1, card2, after card1, 4d
    CARD-003 Product Catalog service (Python) :p1, card3, after card1, 5d

  section Wave 3
    CARD-004 Product Catalog UI               :p2, card4, after card3, 4d
    CARD-005 Meal Planning service (Python)   :p1, card5, after card3, 6d

  section Wave 4
    CARD-006 Meal Planning UI                 :p1, card6, after card5, 5d
    CARD-007 Shopping List service (Python)   :p2, card7, after card5, 3d

  section Wave 5
    CARD-008 Shopping List UI                 :p2, card8, after card7, 2d
```

## Wave plan summary

| Wave | Cards | Total estimate | Parallelisable |
|------|-------|---------------:|----------------|
| 1 | CARD-001 | 5d | — |
| 2 | CARD-002, CARD-003 | 9d | Yes (4d + 5d in parallel) |
| 3 | CARD-004, CARD-005 | 10d | Yes (4d + 6d in parallel) |
| 4 | CARD-006, CARD-007 | 8d | Yes (5d + 3d in parallel) |
| 5 | CARD-008 | 2d | — |
| **Total** | **8 cards** | **34d sequential / ~20d parallel** | |
