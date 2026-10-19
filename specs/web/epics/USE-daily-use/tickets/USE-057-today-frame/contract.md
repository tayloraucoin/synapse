---
id: "USE-57"
size: small
objective: "/today from 1024 is the desk's Today (the date and time, the block band, the Next strip, the tiers with Next lifted as the card and items firing in place, the To-dos section), and below 1024 Now shows the same tiers inside a Work block, on fixtures, with loading, error and the not-a-work-block band reachable by ?state="
slice_type: "a screen frame over shared parts; risks Next picked in the component instead of by resolveWorkNext, a firing row moved out of its place, the desk tree switched in JS, and a part redrawn instead of composed"
non_negotiables:
  - "Next is resolveWorkNext's answer; the screen never orders items itself (C-USE-today-3)."
  - "A firing item stays in its tier and place with its mark and \"firing · n min\"; nothing moves it (C-USE-today-working-1)."
  - "The desk tree and the phone's Work block switch in CSS (split:), never by useIsSplit (USE-4)."
  - "Composes USE-10's WorkRow, TierGroup and DayBlockBand/Header; only @syn/ui components and preset tokens (canon §2, A-01 to A-20)."
  - "Reads only through useToday and the planner hooks; nothing here imports lib/fixtures, @syn/db or tRPC."
  - "No count, streak or \"missed\"; no red but firing's words and the priority and due chips (C-USE-today-7)."
devs_call: "File split under today/_components/desk/ and components/work/; the view-model builder's name; the skeleton's rhythm; how the header's time refreshes (useNow)."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/today/index.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/working.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/loading.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/error.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/not-a-work-block.md"
  - "C-USE-today-2"
  - "C-USE-today-3"
  - "C-USE-today-6"
  - "C-USE-today-7"
  - "C-USE-today-working-1"
  - "C-USE-today-working-3"
  - "C-USE-today-loading-1"
  - "C-USE-today-error-1"
  - "C-USE-today-not-a-work-block-1"
  - "D-USE-38"
  - "D-USE-43"
  - "D-USE-45"
  - "D-USE-49"
  - "D-USE-51"
waiver: "Today's frame: the index holds the layout and Next, and each of working, loading, error and not-a-work-block holds its own criteria; one screen, cited by its state files."
truth_files: "none: promotion carries work/today/"
qa: Q1
reviewers:
  - assay
focus:
  - "working at 1728 and 402, loading, error and not-a-work-block against work/today/captures/ (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/page.tsx"
  - "apps/web/app/(shell)/today/_components/desk/"
  - "apps/web/app/(shell)/today/_components/now/"
  - "apps/web/components/work/"
  - "apps/web/lib/data/use-today-work.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-057-today-frame/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-8"
  - "USE-10"
  - "USE-16"
  - "USE-55"
  - "USE-56"
out_of_scope:
  - "The week strip, the day column and the opened day: USE-58"
  - "Start, the running card, Prompt sent, bring back, Done and the reminder line's clock: USE-59"
  - "Folded, capped and Urgent tiers, the later Work block: USE-61; meetings: USE-62; Waiting and Linear's lines, offline: USE-63"
  - "+ Add ⌄ (USE-51's AddMenu): USE-61 mounts it; the To-dos tray on the phone: USE-19"
  - "Before Ready, go (Review the day at /today): Review the day's ticket and the day-records wiring"
criteria:
  - id: C1
    statement: "At 1728 the main column (720) shows \"Monday, 12 October\", 10:20 and + Add ⌄, the Work band \"Work 9:30 to 12:00 · …\", the Next strip (NEXT, emoji, title, Primary, Go ↵), the tiers with their squares and words, one item firing in place and Next lifted as the card with Start and Done, then To-dos under a rule"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-057-today-frame/evidence/working-1728.png"
  - id: C2
    statement: "At 402 during Work, Now shows the Work block header and the tiers with the trimmed meta and \"firing\" over \"5 min\"; no rail, Next strip or day column"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-057-today-frame/evidence/working-402.png"
  - id: C3
    statement: "?state=today-loading shows the real header and tabs over still skeleton rows in the tiers' rhythm; ?state=today-error shows RegionRetry with \"Today didn't load.\", \"Timers that were running keep their time; nothing is lost.\" and Try again"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-057-today-frame/evidence/loading-error-402.png"
  - id: C4
    statement: "At 1728 outside a Work block the band names the current block and the tiers stay"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-057-today-frame/evidence/not-a-work-block-1728.png"
  - id: C5
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C6
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — today-frame

## Build notes

Wave 2. USE-16 made `/today`'s page: `NowScreen` in `split:hidden` and a desk placeholder in `hidden split:block`. This ticket replaces the placeholder with the desk's Today and gives Now its Work-block body. Captures at `/today?state=<name>`; match `ux/work/today/captures/working-1728.png` and `working-402.png`. Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — work".

- **Decisions that apply:**
  - Layout (index): the content (1108 px) centred right of the rail; the main column at `--content-text` (720). Phone: Now's header, the To-dos tray line (USE-19), the Work block's `DayBlockHeader` ("9:30 to 12:00 · Kestrel weekly at 11:00", ···), the tiers, BottomNav.
  - D-USE-43, D-USE-45: Next is order only, Urgent, Primary, Secondary, Stretch, then tier order, the first neither firing nor done. Nothing in hand: Next lifts as the card (shaded `--color-surface`, no border, 22 px emoji, 17 px title, Start and Done at fixed width). The phone never pins Next (D-USE-61) and has no Next strip.
  - D-USE-49: firing is rust on grey; verdigris is only Taylor's hands. D-USE-38: tier squares step red, leaf, amber, slate, with their words.
  - D-USE-51: phone meta trims to client tile, project emoji, ID, priority chip, size chip; sub-issues fold as "› 2 sub-issues · 1 done".
  - Desk-only: the Next strip ("NEXT", emoji, title, tier word, **Go ↵**, which goes to Next as Enter does, D-USE-62).
  - Not a work block: the band names the current block; the tiers stay, quieter.
  - Error words: "Today didn't load."; "Timers that were running keep their time; nothing is lost."; "Try again".
- **Interfaces:** `useTodayWork(dateKey)` in `lib/data/` composes `useToday`, `useLinear` and `useClients` into `TodayWorkView { block; next: WorkNext; tiers: { tier; rows: WorkRowView[] }[]; todos }`, calling `resolveWorkNext`; `WorkRowView` is USE-10's view model. `TodayDesk`, `WorkBlockNow` (mounted by `NowScreen` when the current block is Work) and `NextCard` (static Start and Done that USE-59 wires).
- **Per path:** `today/page.tsx` swaps the desk placeholder for `TodayDesk`. Scenarios `today-working`, `today-loading`, `today-error`, `today-not-work` join the registry.
- **Gotchas:**
  - Firing minutes are whole minutes, from the derived clock; never seconds.
  - Hover on a row shades `--color-surface`; Next's shade is the same token, so Next on a hovered row is unchanged.
  - The To-dos section's rows use `PlannerItemRow`; a check goes through `writeSlots` with `doneAt`.
  - Run Prettier only on files written here.
- **Model:** Opus 5.5 at medium. A smaller model sorts Next in the view, moves the firing row to a "Firing" group, or switches trees with `useIsSplit`.
