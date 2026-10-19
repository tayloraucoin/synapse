---
id: USE-141
size: medium
objective: "Up at and Lights out open a 24-hour picker on the house tokens (a sheet on the phone, a popover from 1024) instead of the browser's own, usable by keyboard and screen reader"
slice_type: "a new reusable control in @syn/ui with its story, wired into one surface; risks a keyboard or screen-reader dead end and a value rounded behind the person's back"
non_negotiables:
  - "Match the Paper artboards set-my-days / time picker open, Up at (402) and / first week, picker open (popover) (1024)."
  - "No new dependency: Popover and Drawer from @syn/ui (radix-ui, vaul)."
  - "Two listboxes, Hour 0 to 23 and Minute by 5; the pick is a fill and a check, never colour alone."
  - "A typed minute is kept as typed; Escape or close restores the opening value; focus returns to the clock button."
  - "Only preset tokens (no raw colour, spacing or duration); a story before the feature uses it."
devs_call: "The component's name and props, and whether TimeField gains a mode or the picker is its own composed control."
cites:
  - "specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/states/time-picker.md"
  - "C-USE-set-my-days-time-picker-1"
  - "C-USE-set-my-days-time-picker-3"
  - "C-USE-set-my-days-time-picker-4"
  - "C-USE-set-my-days-time-picker-5"
  - "D-USE-39"
  - "D-USE-83"
truth_files: "none: the epic's own ux/ ledger was amended in the Design pass of 2026-10-19 (the cited states); it promotes to specs/web/ux/ with USE"
qa: Q1
reviewers:
  - assay
focus:
  - "keyboard and screen reader: listbox roles, arrows, Home/End, type-ahead, focus return (assay)"
  - "colour never the only signal of the pick (assay)"
operator_review: false
planned_paths:
  - "packages/ui/src/composed/control/time-picker/**"
  - "packages/ui/src/index.ts"
  - "packages/utils/src/time-picker.ts"
  - "packages/utils/src/time-picker.test.ts"
  - "packages/utils/src/index.ts"
  - "apps/web/app/(shell)/days/_components/time-picker.test.tsx"
  - "packages/ui/package.json"
  - "apps/web/app/(shell)/days/_components/day-parts.tsx"
  - "apps/web/app/(shell)/days/_components/copy.ts"
  - "apps/web/lib/fixtures/scenarios/set-up.ts"
depends_on: []
out_of_scope:
  - "Replacing TimeField elsewhere in the app (Now, the New block sheet): a later ticket"
criteria:
  - id: C1
    statement: "The picker's lists move by arrows, Page Up/Down, Home/End and digits; Done keeps, Escape restores; focus returns to the trigger"
    evidence: test
    command: "yarn workspace @syn/utils test"
  - id: C2
    statement: "Hour and Minute are listboxes with the pick aria-selected; a typed 7:03 is kept"
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: "?state=time-picker at 402 shows the sheet and at 1024 the popover, as the boards draw them"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-141-time-picker-24h/evidence/"
---

# Contract — USE-141 time-picker-24h

## Build notes

Fix 3 of Taylor's 2026-10-19 feedback: the native picker ignored the tokens and was never drawn. It bends Epic 1 §0.3 ("the native picker on both platforms") on Taylor's word; `TimeField`'s header names it.

- **Approach:** `TimePicker` in `packages/ui/src/composed/control/time-picker/`: a trigger (the clock, 44 px, "Choose a time for <label>"), a body of two `listbox` columns and Done, shown in `Drawer` below the 1024 break and `Popover` at it (`useMediaQuery` on `--breakpoint-split`, or the shell's existing hook). `BoundsField` keeps its typed input and puts the picker's trigger where the clock glyph is.
- **Checked 2026-10-19 [Secondary]:** shadcn/ui ships no time picker; community ones exist (Dice UI, 21st.dev), not adopted.
- **Interfaces:** `@syn/ui/time-picker` (`TimePicker`, `TimePickerProps`: `value`, `onChange`, `label`, `open?`, `onOpenChange?`, `minuteStep?`); `?state=time-picker`.
- **Tests:** the web and ui tests run in node with no DOM, so the keys are a pure function in `@syn/utils` (`timePickerKey`, tested there) and the roles are checked on the lists' static markup in the web test.
- **Per path:** time-picker/: component, copy, variants if any, story, index, test · index.ts and package.json: the export · day-parts.tsx: BoundsField's trigger · copy.ts: the words · set-up.ts: the scenario.
- **Gotchas:** the field's own overlay input must not swallow the trigger's click; keep the picker's value "HH:mm".
- **As built (2026-10-19):** `TimePicker` takes `renderField(trigger)` so the popover anchors under the whole field; Radix's `virtualRef` anchor left it at the page's corner. The field is now a typeable text input (`parseTypedClock`: "630" is 6:30, any minute kept) with the clock beside it, in place of the native `type="time"`. The pick previews in the field and Done commits; the first day's button label follows on Done. The readout uses the `heading` text size (22), not the board's 26. Planned paths gained `apps/web/lib/data/set-up-start.ts` (the `picker` start) and `day-view.tsx` (the scenario's open).
- **Model:** Opus 5.5; a smaller model tends to drop the listbox semantics for a scroll of buttons.
