---
id: "USE-111"
size: small
objective: "A To-dos block's reorder and New to-do write through the planner queue, so they wait offline like every other set-up write, and a dated plan's band in Block view opens its event"
slice_type: "two writes moved behind the queue and one band wired; risks a to-do written twice on reconnect, or an order lost when the queue replays"
non_negotiables:
  - "Offline every edit saves on the phone and lands in the order made (D-USE-67); nothing is refused."
  - "From This week every change is that date's only; the usual week is unchanged."
  - "Data through useBlockView and usePlannerWrites; only @syn/ui components and preset tokens."
devs_call: "Whether the planner server gains a slot-order write and a to-do write, or the queue learns the fixture server's writeSlots and writeTodo."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/block-view/by-kind.md"
truth_files: "none: day/block-view/ is promoted with USE"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/web/lib/fixtures/planner/"
  - "apps/web/lib/data/use-planner-writes.ts"
  - "apps/web/app/(shell)/days/block/"
depends_on:
  - "USE-50"
out_of_scope:
  - "The routers' slot and to-do writes (wave 3)"
criteria:
  - id: C1
    statement: "Offline, a to-do reordered or added with New to-do in a To-dos block on This week shows at once and lands once, in order, when the connection is back"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "Tapping Coffee with Sam's band in Errands opens the event's sheet filled, as Set my days' event does"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-111-todo-slot-writes-in-queue/evidence/todos-band-open-402.png"
  - id: C3
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
---

# Contract — todo-slot-writes-in-queue

## Build notes

Found building USE-50: `todos-editing.tsx` writes a to-do slot's order through the fixture server's `writeSlots` and New to-do's to-do through `writeTodo`, outside `usePlannerWrites`' queue, because the planner server has no slot-order or to-do write. Offline those two would not wait as every other set-up write does (D-USE-67). The dated plan's `EventBandRow` is not a button yet: Set my days opens an event in `AddEventSheet`; wire the same here (todos-dated-plan.md, "Tap the band: the event").
