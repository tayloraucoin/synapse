---
target: specs/web/ux/day/close-the-day/states/offline.md
status: approved
promoted:
boards: []
not_drawn: "Built in DYN-18 and unchanged by USE: the fields keep their text and the status reads Saving on this device"
rulings: [D-USE-73]
---

# Close the day — offline

`?state=offline`. Writing with no connection.

## What shows

As [`journal.md`](journal.md); the status under the last field reads "Saving on this device" instead of "Saved" (built, DYN-18), and the offline line reads "Offline. The words stay on this phone until back online." (D-USE-75; the built line used the second person). The fields hold their text. Phase 1 has no local queue for the journal: the status and the retry are the honest state (DYN-18's ruling). The built offline line says "your" and is reworded at build ([`../built-and-words.md`](../built-and-words.md), Words).

[ASSUMPTION] The Tomorrow peek shows what the phone already has of tomorrow, or is hidden when it has nothing.

## Widths

Not drawn at any width; as [`journal.md`](journal.md).

## Criteria

| ID                            | When            | Then                                                                           | Evidence |
| ----------------------------- | --------------- | ------------------------------------------------------------------------------ | -------- |
| C-USE-close-the-day-offline-1 | Writing offline | The text stays; the status reads "Saving on this device"; back online it saves | test     |
