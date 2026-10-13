---
target: specs/web/ux/day/block-view/states/partial.md
status: approved
promoted:
boards: []
not_drawn: "N/A: one block is one read; its header comes from the day already loaded and its rows load together (loading, error)"
rulings: []
---

# Block view — partial

`?state=partial`: N/A.

## What shows

Nothing of its own. A block's rows are one read: they load together ([`loading.md`](loading.md)) or fail together ([`error.md`](error.md)). The header never waits, since it paints from the day already loaded.

## Widths

Not drawn at any width.

## Criteria

| ID                         | When             | Then                                                                             | Evidence |
| -------------------------- | ---------------- | -------------------------------------------------------------------------------- | -------- |
| C-USE-block-view-partial-1 | `?state=partial` | Renders as `loading` [ASSUMPTION: the state key falls back rather than erroring] | test     |
