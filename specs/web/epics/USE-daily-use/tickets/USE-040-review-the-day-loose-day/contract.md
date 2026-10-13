---
id: "USE-40"
size: small
objective: "A day with nothing set opens under its title with Make a checklist and Plan with blocks; Make a checklist types a list where Return adds the next row; a checklist with no span sits in an All day strip above the rail beside timed blocks; and the now-line marks the moment in verdigris on the timed day"
slice_type: "an empty day's ask, a checklist written for today on fixtures, and the now-line; risks the superseded Saturday frame shipping, Ready, go offered before a choice, a checklist that reaches the usual week, verdigris used for anything but now, and the line drifting from the clock"
non_negotiables:
  - "Every day with nothing set shows the Sunday frame (D-USE-68); the Saturday \"Set Saturday\" frame is not built."
  - "No Ready, go until a choice is made; once a checklist exists, Ready, go shows."
  - "A checklist made here is today's only, a dated block of kind checklist with its items; the usual week is untouched."
  - "Verdigris (--color-now) is the now-line and its tag only, and the tag carries its time in text."
  - "Only @syn/ui components and preset tokens; no count, no second person."
devs_call: "How Return keeps focus in the new row; the All day strip's two-column box grid; how often the now-line moves (each minute)."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/sunday-nothing-set.md"
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/sunday-making-the-checklist.md"
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/sunday-checklist-and-plans.md"
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/sunday-now-line.md"
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/empty.md"
  - "C-USE-review-the-day-sunday-nothing-set-1"
  - "C-USE-review-the-day-sunday-making-the-checklist-1"
  - "C-USE-review-the-day-sunday-making-the-checklist-2"
  - "C-USE-review-the-day-sunday-checklist-and-plans-1"
  - "C-USE-review-the-day-sunday-checklist-and-plans-2"
  - "C-USE-review-the-day-sunday-now-line-1"
  - "C-USE-review-the-day-sunday-now-line-2"
  - "D-USE-28"
  - "D-USE-30"
waiver: "Review the day's loose-day states, one surface: the ask, typing the list, the list beside a set time and the now-line drawn on it; empty.md is kept as the record D-USE-68 superseded"
truth_files: "none: promotion carries day/review-the-day/"
qa: Q1
reviewers:
  - assay
focus:
  - "the four Sunday frames at 402 against review-the-day/captures/: Make a checklist outlined in ink, the All day strip, verdigris on the now-line only (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/review/"
  - "apps/web/components/planner/day-column/"
  - "apps/web/components/planner/all-day-strip/"
  - "apps/web/lib/data/"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-040-review-the-day-loose-day/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-31"
out_of_scope:
  - "Plan with blocks and Copy another day's landings: Set my days' tickets (this one links to them)"
  - "Now on a checklist day and the checklist in Block view: Now's and Block view's tickets"
  - "Dragging rows to reorder: Block view's ticket"
criteria:
  - id: C1
    statement: "A day with no blocks shows ‹ Orient over \"Sunday, 18 October\", \"Nothing set for Sunday.\" and its line, Make a checklist outlined in ink, Plan with blocks, Copy another day, the tray, and no Ready, go"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-040-review-the-day-loose-day/evidence/sunday-nothing-set-402.png"
  - id: C2
    statement: "Making the checklist shows \"Sunday\" with \"Checklist · all day\" and Set a time, kept rows with checkboxes, the typed row with a dashed box, the helper line, and Ready, go on its fade"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-040-review-the-day-loose-day/evidence/sunday-making-the-checklist-402.png"
  - id: C3
    statement: "A checklist with no span sits in the All day strip above the rail with its Checklist tag and boxes, while Lunch with Sam sits on the rail at 13:00 with its lock"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-040-review-the-day-loose-day/evidence/sunday-checklist-and-plans-402.png"
  - id: C4
    statement: "At 11:20 a verdigris tag reads \"11:20\" in the rail with a faint line across, the \"11\" under it hidden, and nothing else on the page is verdigris"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-040-review-the-day-loose-day/evidence/sunday-now-line-402.png"
  - id: C5
    statement: "Through the fixtures, Make a checklist writes one dated checklist block for today, Return adds the typed row as an item, Set a time gives the block a span with its items kept, and no usual-week record changes"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C7
    statement: "It lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — review-the-day-loose-day

## Build notes

After USE-31. Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — daily use", rows "Review the day (cont.)" and "Archive 3". Captures to match: `ux/day/review-the-day/captures/sunday-{nothing-set,making-the-checklist,checklist-and-plans,now-line}-402.png`. Take ours at `/today/review?state=review-sunday-<name>`. `?state=review-empty` resolves to the nothing-set frame.

- **Decisions that apply:**
  - D-USE-28: an empty day offers Make a checklist or Plan with blocks. A checklist with no span sits in an "All day" strip above the rail with a Checklist tag.
  - D-USE-30: the choice sits under the title, not centred. A now-line runs across every timed day view: a time tag in the rail and a faint line over the content.
  - D-USE-68: the Sunday frame wins for every day with nothing set.
  - D-USE-69: the tray stays pinned on these frames, and the axis keeps 96 px an hour (the frame drew 80).
  - D-USE-34: Checklist is a block kind.
  - Words: "Nothing set for <Weekday>."; "A loose day can be one list, done in any order."; "Make a checklist" / "Things to get through today. No times."; "Plan with blocks" / "Times on the rail, like a weekday."; "Copy another day"; "<Weekday>"; "Checklist · all day"; "Set a time"; "Return adds the next one. Drag to reorder later."; "All day"; "Checklist".
  - Cards: full width, 12 px apart, a 20 px line icon (list or layout), Make a checklist with a 1.5 px `--color-foreground` outline, Plan with blocks with a hairline. The now-tag is a solid `--color-now` pill with the time in `--color-primary-foreground`.
- **Interfaces:**
  - Fixtures: `writeChecklist(dateKey)`, `addChecklistItem(blockId, title)` and `setBlockSpan(blockId, startsAt, endsAt)`, each writing dated records parsed by USE-3's schemas.
  - Scenarios: `review-sunday-nothing-set`, `-making-the-checklist`, `-checklist-and-plans` and `-now-line` (now 11:20).
  - `AllDayStrip` in `components/planner/` takes props only.
  - The now-line composes `@syn/ui`'s `NowLine`; Schedule and Block view reuse it.
- **Gotchas:**
  - The checklist takes the day's name as its title.
  - Plan with blocks and Copy another day are links. Their landings are other tickets', so Ready, go stays hidden there.
  - The column opens scrolled to the now-line when now falls in the day.
- **Model:** Opus 5.5 at medium. A smaller model builds the Saturday frame too, writes the checklist to the usual Sunday, or tints other parts verdigris.
