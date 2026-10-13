---
target: specs/web/ux/day/orient/states/empty.md
status: approved
promoted:
boards:
  - name: "orient / empty / 402 / light"
    page: "USE — daily use"
    at: [1928, 2640]
    note: "Note · success"
    capture: specs/web/epics/USE-daily-use/ux/day/orient/captures/empty-402.png
rulings: [D-USE-9, D-USE-14, D-USE-63]
---

# Orient — empty: no passages yet

No passages are set, and no evening was written last night. Its note is the "Note · success" at x 1928, y 3570.

## What shows, top to bottom

- Status bar and greeting as success.
- **In place of the carousel:** one quiet line between two `--color-border` hairlines (16 px above and below, 4 px gap), in the serif at reading size, `--color-muted-foreground`: "Nothing to read yet. A passage shows up here once one is added." [placeholder]. No dots, no "Read all".
- **Links stay:** the two `LinkCallout`s as success.
- **Before the day:** as success ("Saved", "Grateful for" grown with its sample line, "Intention" and "Today, as I see it" empty).
- **No "Read last night's reflections":** with no evening written, it goes too.
- "Review the day" as success.

## What the person can do

As success, less "Read all" and the reflections.

## Words

"Nothing to read yet. A passage shows up here once one is added." [placeholder until Gloss]. The built line is "Nothing to read yet. A passage, or tonight's journal, shows up here tomorrow." The board's line is used, since last night's journal no longer shows in the reading's place (D-USE-9 moved it below the lines) (D-USE-63).

## The notes on the boards

**"orient / empty / 402 / light"**, note "Note · success" @ x 1928, y 3570:

> empty · no passages yet
>
> One quiet line where the reading sits. With no evening written yet, "Read last night's reflections" goes too. [ASSUMPTION: links are their own setting and stay]

## Rulings

- N3's "no passages yet: the carousel is absent; the textareas and the button remain" holds; the board adds the quiet line in its place.
- D-USE-9, D-USE-14 as success. The reflections row exists only when there is an evening to read.
- [ASSUMPTION, from the note] links are their own setting and stay when there are no passages. With no links either, nothing is drawn and no gap is left.

## Widths

Drawn at: 402. Not drawn at: the desk; as success (D-USE-39).

## Criteria

| ID                   | When                   | Then                                                                | Evidence                 |
| -------------------- | ---------------------- | ------------------------------------------------------------------- | ------------------------ |
| C-USE-orient-empty-1 | No passages are set    | The quiet line shows where the reading sits; no dots, no "Read all" | `captures/empty-402.png` |
| C-USE-orient-empty-2 | No evening was written | "Read last night's reflections" is absent                           | `captures/empty-402.png` |
| C-USE-orient-empty-3 | No passages, links set | The links still show                                                | `captures/empty-402.png` |
