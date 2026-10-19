---
target: specs/web/ux/day/overview.md
status: approved
promoted:
---

# day — overview

Handoff pass, the ledger of the boards (`docs/workflows/stages/ux.md` §4), from the approved narrative (`../narrative/`, "N1" to "N6"; notes are "note n"), the locked boards and the decision log in [`decisions/`](decisions/D-USE-1-24.md). The open items moved to [`open/`](open/open-1.md) (D-USE-59); coverage of every artboard is in `../boards/`.

## Frame

Taylor, half awake on the toilet, one thumb, about ten minutes before the cold bath, other apps locked; the phone spent the night in the bathroom drawer, so getting it meant getting up (notes 9–12, 20; D-USE-112). The day must open like the planner's week page, already written in, with a pencil in reach (notes 68–69): Orient settles the emotions first (note 20), Review the day takes a swap in a tap or two, and "Ready, go" turns the rest of the day into "check, check, check" (note 65), one block at a time, nothing outside it on screen (note 56). Never a questionnaire (note 88); never a clock telling Taylor off (note 62). One primary action per screen; nothing asked that isn't optional (N3).

## Flow order: the first-wake loop first

| # | Surface | Carried by | Primary action | Goes to |
| --- | --- | --- | --- | --- |
| 0 | Sign-in, only when signed out | `auth/sign-in.md` (living truth) | Sign in | 1 |
| 1 | Orient | [`orient/`](orient/index.md) | Review the day | 2 |
| 2 | Review the day | [`review-the-day/`](review-the-day/index.md) | Ready, go | 3; 2a; 2b |
| 2a | Block view, from the day | `block-view/` | Back by breadcrumb | 2 |
| 2b | Item sheet | [`item-sheet/`](item-sheet/index.md) | None; edits save | 2 |
| 2c | The Ready, go hand-off | [`ready-go/`](../interactions/ready-go/index.md) | Start the first block | 3 |
| 3 | Now | [`now/`](now/index.md) | Done | 3; 4; 5 |
| 4 | Running, and Done with time | [`running/`](running/index.md) | Done | 3 |
| 5 | Block complete | [`block-complete/`](block-complete/index.md) | Start the next block | 3 |

Through the day: a work block in go mode ([`now-work.md`](now-work.md), reconciled with [`../work/today/`](../work/today/index.md) by D-USE-40 to 58), the To-dos tray and its reminder (`todos/`), the To-do sheet (`todo-sheet/`), Schedule (`schedule/`), the evening close ([`close-the-day/`](close-the-day/index.md)). The loop in full, step by step, is [`../interactions/first-wake-loop.md`](../interactions/first-wake-loop.md). A path without a link is written by a later thread of the handoff; its flat intent file stands until then.

## Routes

| Route | Surface | Entry from | Exit to |
| --- | --- | --- | --- |
| `/orient` | `orient/` | Entry tree, first open of the day | `/today/review` |
| `/today/review` [PROPOSED] | [`review-the-day/`](review-the-day/index.md) | Orient; a second open before go; Now before go | `/today` on Ready, go; `/orient` |
| `/today/block/{id}` [PROPOSED] | `block-view/index.md` | A block on Review the day, Schedule, Now's "Edit block" | Back by breadcrumb |
| `/today` | [`now/`](now/index.md), [`running/`](running/index.md), [`block-complete/`](block-complete/index.md), `now-work.md` | The welcome's Start; the List tab; a reminder | Schedule; the block view |
| `/today/schedule` | `schedule/` | The Schedule tab; "See the whole day" | The block view |
| `?sheet=item&id=`, `?sheet=todo&id=` | `item-sheet/`, `todo-sheet/` | An item; a to-do in the tray | Closes to the screen beneath |
| `/day/{date}/journal` (built, DYN-18) | [`close-the-day/`](close-the-day/index.md) | Wind-down's Journal item | Back by breadcrumb |

## Navigation and shell

- Orient stays bare. Review the day is focused: no tab bar, Ready, go above the safe area (N3), no avatar [ASSUMPTION: none named].
- Now keeps `AppHeader` and `BottomNav` (N4). The List tab reads Now while the day is live, List before Ready, go; Schedule stays the whole day (round 9).
- Entry: signed out goes to sign-in, then back (refinement 3). The first open of the day goes to Orient; a later open goes to Review the day, or to Now after Ready, go (N3).

## Design

Paper file `01M49AX02VV4SSBKNCN6NRTS6Y` (note 107), three pages: "USE — daily use" (p-3-0), "USE — set up" (p-4-0), "USE — work" (p-6-0). Phone 402 × 874 (iPhone, light), desk 1440 and 1728, Set my days also at 1024 (D-USE-39). Artboards are named `<surface> / <state> / <width> / <scheme>`, the state phrase quoted as drawn. Locked by Taylor on 2026-10-10 ("Lock it after that", D-USE-49), covering the three pages as they stood; the phone rows on "USE — work" (row 5 at y 5760, row 6 at y 7200, D-USE-50 to 57) locked on 2026-10-12 (D-USE-58). The dark variants were not drawn (not wanted at lock) and come with the build's theme pass. Captures sit beside each surface in `captures/<state>-<width>.png`. The intent pass's fixture stands: Taylor's Monday (N1) in Taylor's own words, its times placeholders; Wednesday and Thursday to Friday swap the workout (note 35).

## Scope and bends

Untouched: the first run (kept, not worked on), Review, history, settings, the Workflow board; weight is weighed, never entered (N1). The product rules are experiments here (amendment 7); kept where free: only lengths and times show, "1 min over" being a length; no counts, streaks or scores against the pull of "gamify mode" (note 49); Orient shows no time; colour never alone (N5).
