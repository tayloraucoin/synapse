---
source:
  - docs/ux/ux-spec-v1.md §10.1–§10.5; ux-spec-v1.1.md §12; ux-spec-v1.2.md §12.1–§12.3; ux-spec-v1.3.md §12.1–§12.3
  - docs/ux/workflow-ux-spec-v0.1.md §7, §8; epic2_in_use_ux_architecture.md §0.3; epic3_review_ux_architecture.md §0.3, §6
  - code 3b252e7 (the copy.ts files under apps/web and packages/ui)
status: approved
promoted: 2026-10-09
---

# copy-register — _global

A rules file: the voice every string is written in, and the words it never uses.

## Job

Give the product a notebook's voice, not a personality: plain, present, specific, stating what is. The person reads it rushed on the tabs and reflective in Review; the register bends by surface and never pressures.

## Layout and components

Strings live in a `copy.ts` beside each feature and in `@syn/ui` for shared composites; nothing is inline. Emoji appear only in the constants that seed the person's own things.

## States

| Case                | What shows                                                                                                                                                                                                                                             | What the person can do | Evidence                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | ---------------------------------------------- |
| Register            | Sentence case; full stops on sentences, none on labels; no exclamation marks; no emoji in the app's voice; a button says what happens and a confirmation reuses its verb                                                                               | —                      | seen (`copy.ts` files)                         |
| Second person       | Never on the execution tabs and never in chrome. Allowed where the words are the person's own (the orient frame's content, the journal), inside a sheet the person opened, and on the landing page                                                     | —                      | inferred: v1.1 §12.1; landing copy             |
| Questions           | None on the tabs; allowed inside a sheet or dialog the person opened (_Switch to Europe/London?_, _Discard changes?_)                                                                                                                                  | —                      | inferred: zone-switch copy.ts                  |
| Numbers             | Only times and durations on the tabs; the one count the tabs ever carry is the pending-review line's _3 items to review_ in the status line; adherence appears only in Review with its arithmetic in words; no count on a Workflow column, lane or tab | —                      | inferred: status-line copy.ts, workflow §2     |
| Tabs                | _now · soon · open · closing · moved · done · from Thu · not assigned today · cut when shifted · multitask · Start · Stop · Pause · Resume · Done · Undo · Not today · Adjust the day · Add a one-off · Day Complete_                                  | —                      | inferred: Epic 2 §0.3 as amended by v1.1 §12.2 |
| Sheets and forms    | A visible label above every field; optional fields say _optional_; validation on submit then live; errors are a sentence under the field, ink, no red; _Couldn't save. Try again._ for a failed write                                                  | —                      | inferred: Epic 1 §0.3; copy.ts files           |
| Review              | Outcome words only: _done · moved · missed · not counted · counts half · counts as missed · traded up · pending · carried · not assigned · cut when shifted · so far · edited_; integers for percentages, decimals for halves                          | —                      | inferred: Epic 3 §6                            |
| Workflow            | The noun is _Task_; _firing_, _next_, _back · 3 min_, _Closed earlier_; never _overdue_, _waiting on you_, _stale_, _idle_, _behind_, a count, or a badge                                                                                              | —                      | seen (board)                                   |
| Status lines        | One fact, no question, as `shell.md` quotes them; the late offer states a fact (_Up later than planned_) and is the one quiet offer                                                                                                                    | —                      | seen                                           |
| Dialogs             | Title is the question or the fact; the cancel names the outcome of not acting (_Keep_, _Keep editing_); the destructive word appears only on Delete account, typed                                                                                     | —                      | inferred: zone-switch, delete copy             |
| Toasts              | Past tense plus _Undo_: _Applied Morning A_, _Removed Stretch_                                                                                                                                                                                         | —                      | inferred: toaster.tsx, call sites              |
| Errors and system   | A sentence and a door; never a code, a stack, _oops_, _unfortunately_ or an apology (_Signed out_ is a statement)                                                                                                                                      | —                      | seen (not-found, session dialog)               |
| Notifications       | A scheduled fact in the person's own words; never a miss, a streak, a percentage or how long since the app was opened                                                                                                                                  | —                      | inferred: product-rules.md                     |
| Marketing (landing) | The one surface that addresses the reader and explains; the same vocabulary; the trust line verbatim                                                                                                                                                   | —                      | seen (`/`)                                     |

Vocabulary, say and not (v1 §10.2 as amended):

| Say                                                                              | Not                                                                                  |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Habit · Task · Deep work · Step · Workout · Fixture · One-off · Activity         | Activity (as a heading), routine item, to-do, hobby                                  |
| Block · Routine · Template · Day plan · Day A · Focus                            | Day part, variant, preset, day type, project                                         |
| Fixed · Flexible · Pin                                                           | Hard · Soft · anchor (in copy)                                                       |
| Set the day · Adjust the day · Do now · Not assigned today · Not confirmed       | Confirm, lock, shift, trim, skipped, cut, missed (as a clock's verdict)              |
| Slept in · Ran long · Something came up                                          | Late, behind, overslept                                                              |
| Moved · Shortened · Missed · Something came up · Planned it wrong · Didn't do it | Rescheduled, delayed, failed, excused, lazy                                          |
| Done · Start · Stop · Pause · Resume · Reminder · Archive                        | Complete, begin, end, track, notification, delete                                    |
| Work on this day · After work · Free time · Usually · To open                    | Work-day type, transition, activity, most weeks, integration, Spotify (in a heading) |
| Only you can see your data                                                       | Private, secure, encrypted                                                           |

Never: _you failed_, _you're behind_, _don't break_, _streak_, _keep it up_, _great job_, _oops_, _unfortunately_, _we_, _late_, _behind_, _catch up_, _on track_, _day 12_, _good morning_ in the app's voice, _doesn't fit_, _too much_, _over budget_, _pep talk_, _balance_, _four days in a row_, any adjective about the person, any sentence about how the person is doing.

## Words

This file is the words. The one line that comments on behaviour is the orient frame's skipped-gratitude line, once, without a subject, never two mornings running, switchable off.

## Access

Every icon-only control carries a text name in the same register (_Dismiss_, _Back_, _Settings_); hidden text completes a mark (_items waiting_); labels, not placeholders, name fields.

## Instrumentation

None today.

## Criteria

| ID                    | When                                                             | Then                                                                      | Evidence |
| --------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------- | -------- |
| C-WEB-copy-register-1 | Grep every `copy.ts` for `!`, an emoji, and the never-list words | No match in the app's voice; emoji only in seed constants                 | check    |
| C-WEB-copy-register-2 | Grep the tab, status-line and chrome copy for _you_ and _?_      | No match outside a sheet, the orient content, the journal and the landing | check    |
| C-WEB-copy-register-3 | Any new string                                                   | It uses the say column, never the not column                              | manual   |

## Decisions and open items

D-WEB-1 to D-WEB-3. Open 7 in `overview.md` (the setup line's verb).
