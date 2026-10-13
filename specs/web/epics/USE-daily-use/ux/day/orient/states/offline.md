---
target: specs/web/ux/day/orient/states/offline.md
status: approved
promoted:
boards:
  - name: "orient / offline / 402 / light"
    page: "USE — daily use"
    at: [3374, 2640]
    note: "Note · success"
    capture: specs/web/epics/USE-daily-use/ux/day/orient/captures/offline-402.png
rulings: [D-USE-9, D-USE-14]
---

# Orient — offline

No connection. Its note is the "Note · success" at x 3374, y 3570.

## What shows, top to bottom

- The frame from cache, as success: greeting, the reading with dots and "Read all", the links.
- **Before the day:** `SaveStatus` reads "Waiting to save" in place of "Saved". "Grateful for" grown with its sample line; "Intention" mid-typing ("Ship the first Primary before lunch." [placeholder], `--color-input` border); "Today, as I see it" empty.
- "Read last night's reflections" and "Review the day" as success.

## What happens

- Typing still works; the lines are kept on the device and save when the connection is back, then `SaveStatus` returns to "Saved".
- Review the day still opens: the day is cached too.
- Links need the network; a tap opens the new tab, which fails on its own [ASSUMPTION: Orient adds nothing].
- The wake stamp: [ASSUMPTION] recorded on the device at the open and sent with the lines when back (`_global/offline-and-sync.md`).

## What the person can do

As success.

## Words

"Waiting to save" (`SaveStatus`). The built offline line ("Offline — you can look, but changes need a connection.") does not show: Orient's button no longer sets the day.

## The notes on the boards

**"orient / offline / 402 / light"**, note "Note · success" @ x 3374, y 3570:

> offline
>
> The frame from cache; typing still works. "Waiting to save" replaces "Saved" until the connection is back. Review the day still opens: the day is cached too.

## Rulings

- N3's offline row: the frame shows from cache; the lines save when the connection is back, with a quiet `SaveStatus` reading "Waiting to save".
- D-USE-9, D-USE-14 as success.

## Widths

Drawn at: 402. Not drawn at: the desk; as success (D-USE-39).

## Criteria

| ID                     | When                      | Then                                                                                   | Evidence                   |
| ---------------------- | ------------------------- | -------------------------------------------------------------------------------------- | -------------------------- |
| C-USE-orient-offline-1 | Offline at the first open | The frame shows from cache                                                             | `captures/offline-402.png` |
| C-USE-orient-offline-2 | A line is typed offline   | `SaveStatus` reads "Waiting to save", then "Saved" once back online, with nothing lost | test                       |
| C-USE-orient-offline-3 | "Review the day" offline  | Review the day opens from cache                                                        | test                       |
