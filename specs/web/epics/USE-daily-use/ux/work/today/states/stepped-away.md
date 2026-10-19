---
target: specs/web/ux/work/today/states/stepped-away.md
status: approved
promoted:
boards:
  - name: "today / stepped away / 1728 / light"
    page: "USE — work"
    at: [7232, 0]
    note: "Note · today / stepped away"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/stepped-away-1728.png
  - name: "phone-today / stepped away, Resume all / 402 / light"
    page: "USE — work"
    at: [1928, 5760]
    note: "Notes · phone, Today (row 5) @ x 1928"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/stepped-away-402.png
rulings: [D-USE-44, D-USE-46, D-USE-52, D-USE-62]
---

# Today — stepped away

The flow is [step-away](../../../interactions/step-away.md); this file is how Today looks while it holds.

## What shows, top to bottom

**Desk (1728, 10:51):** the header shows the time and + Add; Step away is gone. Under the title, above the Work band, the **stepped-away bar** (surface grey, full column width): the pause glyph, "Stepped away at 10:42", on the right "Work time held · firing keeps counting" and **Resume all** (primary, ink). The band reads "…in 9 min". The strip still names the SMS copy, "Secondary", Go. [Portal sign-in] fires on ("firing · 35 min"). [Case studies] is the **held card**: the edge drops from verdigris to the hairline, "WORK TIME · PAUSED" in muted ink, the clock "1:03:00" in muted ink, "left of 2 h · worked 57 min"; **Resume**, Prompt sent, Done. The held card keeps the lift; Next stays a shaded row (shading unchanged).

**Phone (402, 10:51):** the bar sits under the Work block header: pause glyph, "Stepped away at 10:42", "Work time held · firing keeps counting" under it, Resume all on the right (D-USE-52). The pill beside ··· is gone. The held card as at the desk, "left of 2 h · worked 57 min since 9:23", Resume, Prompt sent, Done.

## What the person can do

Resume all (resumes exactly what Step away paused, clears the bar); Resume on the card (that card only; the bar clears when nothing else is held); Prompt sent and Done still work; bring firing items back.

## Words

"Stepped away at 10:42"; "Work time held · firing keeps counting" [PROPOSED wording, to Gloss]; "Resume all"; "WORK TIME · PAUSED"; "Resume".

## The notes on the boards

**Note · today / stepped away** — today / stepped away / 1728 / light — round 5, new (D-USE-44, D-USE-46)

Step away is a light switch for work time. Pressed at 10:42, it paused every running work timer at once (here, [Case studies] at 57 min worked); firing time keeps counting, because the AI keeps working ([Portal sign-in] reads "firing · 35 min"). The header button gives way to a quiet bar under the title: "Stepped away at 10:42", "Work time held · firing keeps counting" and Resume all [PROPOSED wording, to Gloss]. Resume all resumes exactly the timers Step away paused, nothing else. The paused card reads WORK TIME · PAUSED in muted ink, its edge drops from verdigris to the hairline, and Pause becomes Resume, which resumes that one card and clears the bar when nothing else is held. Prompt sent and Done still work while stepped away. Next and its shading are unchanged. [NEEDS DECISION] Whether a long step away (past the block's end) asks anything on return; default: no, the bar just waits.

**Notes · phone, Today (row 5) @ x 1928** — Stepped away, Resume all

The quiet bar under the block header: "Stepped away at 10:42", "Work time held · firing keeps counting" [PROPOSED, to Gloss], Resume all. The held card reads WORK TIME · PAUSED, edge to hairline, Pause becomes Resume. Prompt sent and Done still work.

## Rulings

- D-USE-44, D-USE-46: Step away pauses every running work timer; firing counts on; Resume all resumes exactly those.
- D-USE-52: on the phone the bar sits under the block header.
- D-USE-62: a step away past the block's end asks nothing on return; the bar waits. The note's [NEEDS DECISION] is closed.

## Widths

Drawn at 1728 and 402.

## Criteria

| ID                         | When                         | Then                                                                                        | Evidence                         |
| -------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| C-USE-today-stepped-away-1 | Step away                    | Every running work timer pauses; firing times keep counting; the bar shows the time pressed | `captures/stepped-away-1728.png` |
| C-USE-today-stepped-away-2 | Resume on the one held card  | That card resumes and the bar clears                                                        | `captures/stepped-away-402.png`  |
| C-USE-today-stepped-away-3 | Return after the block's end | Nothing is asked; the bar waits                                                             | manual                           |
