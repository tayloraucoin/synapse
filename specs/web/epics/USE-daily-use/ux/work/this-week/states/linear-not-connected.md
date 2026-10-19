---
target: specs/web/ux/work/this-week/states/linear-not-connected.md
status: approved
promoted:
boards:
  - name: "this-week / From Linear, not connected / 402 / light"
    page: "USE — work"
    at: [4338, 7200]
    note: "Notes · phone, editing and This week (row 6) @ x 4338"
    capture: specs/web/epics/USE-daily-use/ux/work/this-week/captures/linear-not-connected-402.png
rulings: [D-USE-40, D-USE-56, D-USE-101]
---

# This week on the phone — From Linear, not connected

The pool sheet's second tab while no Linear workspace is connected. `?state=linear-not-connected` [ASSUMPTION: key].

## What shows, top to bottom

- Behind, under the scrim: "‹ Week" and "Monday, 12 October".
- **The pool sheet** ([`../pool-sheet-anatomy.md`](../pool-sheet-anatomy.md)), top at 150: the grabber, "Pool" and ×.
- **Tabs:** "Pool" (muted) and **"Connect Linear"** (selected).
- No filters, no sync line, no list.
- **The explainer**, anchored under the tabs, not centred (A-08): "Linear isn't connected" (heading, semibold); "Connect a workspace to pull in the issues assigned to Taylor. Each workspace connects on its own; clients stay off unless turned on." (body, muted).
- **"Open Settings › Connections"**, a full-width 48 px primary button (`--color-primary`, `--radius-control`).

## What the person can do

- "Open Settings › Connections": Settings › Connections ([`../../../account/settings/states/connections.md`](../../../account/settings/states/connections.md)) [ASSUMPTION: the sheet closes; Back from Settings returns to This week's day].
- "Pool" switches back to the Pool tab; ×, a swipe down or the scrim closes the sheet.

## Words

"Connect Linear" · "Linear isn't connected" · "Connect a workspace to pull in the issues assigned to Taylor. Each workspace connects on its own; clients stay off unless turned on." · "Open Settings › Connections". "Taylor" is the fixture's name [placeholder]; the shipped line names the signed-in person, never "you" [ASSUMPTION, as `../../../day/block-view/states/work-add-to-a-tier.md`]. Gloss passed these.

## The notes on the boards

**Notes · phone, editing and This week (row 6) @ x 4338** — From Linear, not connected

The second tab reads Connect Linear; it explains and goes to Settings › Connections.

## Rulings

- D-USE-56: Linear not connected: the From Linear tab reads Connect Linear and goes to Settings › Connections.
- D-USE-101: the desk hides the Linear tab instead; the phone keeps this tab.
- D-USE-40: clients are optional, off by default ("clients stay off unless turned on").
- N6 "Week (Plan week)" table, "Linear not set": the same, now the phone's.

## Widths

Drawn at 402. 1024 and up: no Linear tab and no sync line (D-USE-101).

## Criteria

| ID                                     | When                                           | Then                                                                                                      | Evidence                                |
| -------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| C-USE-this-week-linear-not-connected-1 | No Linear workspace connected                  | The second tab reads "Connect Linear"; the explainer under the tabs; one button to Settings › Connections | `captures/linear-not-connected-402.png` |
| C-USE-this-week-linear-not-connected-2 | A workspace is connected and the sheet reopens | The tab reads "From Linear" ([`linear-connected.md`](linear-connected.md))                                | test                                    |
