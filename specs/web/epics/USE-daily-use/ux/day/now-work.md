---
target: specs/web/ux/day/now-work.md
status: approved
promoted:
---

# A work block in go mode — day (a pointer)

The work block in go mode is specced in the work area, at both widths: [`../work/today/`](../work/today/index.md) (D-USE-40 to 58: the desk's Today, and the phone's Now with a Work block active, D-USE-50). This file holds no state of its own. It says where the intent pass's states (N4 "A work block in go mode") and step 8's frames on "USE — daily use" went.

## The intent states

| Intent state                      | Key                               | Now in                                                                                                                                                                                                                                        |
| --------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tiers                             | `success`                         | [`work/today/states/working.md`](../work/today/states/working.md)                                                                                                                                                                             |
| empty: not slotted                | `empty`                           | [`no-work-slotted.md`](../work/today/states/no-work-slotted.md)                                                                                                                                                                               |
| only Primary set                  | `primary-only`                    | [`primary-only.md`](../work/today/states/primary-only.md)                                                                                                                                                                                     |
| past a cap                        | `cap`                             | [`past-a-cap.md`](../work/today/states/past-a-cap.md)                                                                                                                                                                                         |
| Urgent above Primary              | —                                 | [`urgent-above-primary.md`](../work/today/states/urgent-above-primary.md)                                                                                                                                                                     |
| meeting lifted; meeting coming up | `meeting`                         | [`meeting-lifted.md`](../work/today/states/meeting-lifted.md), [`meeting-coming-up.md`](../work/today/states/meeting-coming-up.md); mechanics in [`../dev-notes/meeting-inside-a-work-block.md`](../dev-notes/meeting-inside-a-work-block.md) |
| Linear row; status                | `linear`                          | the work row in [`work/today/index.md`](../work/today/index.md); status in [`../interactions/linear-status/`](../interactions/linear-status/index.md); Waiting in [`waiting.md`](../work/today/states/waiting.md)                             |
| Linear updating, failed           | `linear-syncing`, `linear-failed` | [`linear-updating.md`](../work/today/states/linear-updating.md), [`linear-failed.md`](../work/today/states/linear-failed.md)                                                                                                                  |
| several work blocks               | `later-block`                     | [`later-work-block.md`](../work/today/states/later-work-block.md)                                                                                                                                                                             |
| loading, error, offline           | —                                 | [`loading.md`](../work/today/states/loading.md), [`error.md`](../work/today/states/error.md), [`offline.md`](../work/today/states/offline.md)                                                                                                 |

## Step 8's other frames

- Adding: [`../interactions/add/index.md`](../interactions/add/index.md). The item view's size and length: [`item-sheet/states/size-and-length.md`](item-sheet/states/size-and-length.md) and [`../dev-notes/size-and-length.md`](../dev-notes/size-and-length.md). Move to and moved with Undo: [`../interactions/move-to/`](../interactions/move-to/index.md).
- Several running, a Running row focused, Done on a Running row, done well over: the Running rows of a non-work block, [`running/`](running/index.md) and [`../dev-notes/several-running.md`](../dev-notes/several-running.md). Inside a Work block one item is in hand and the rest fire in place (D-USE-43, D-USE-44, D-USE-49).
- Colours: [`../dev-notes/colours-for-a-new-thread.md`](../dev-notes/colours-for-a-new-thread.md). The Schedule during go: [`schedule/`](schedule/index.md).
- Every frame, specced or superseded, with its ruling: [`../boards/use-daily-use/work-block.md`](../boards/use-daily-use/work-block.md), `work-block-cont.md`, `work-block-cont-2.md`, `schedule.md`.

Kept from the intent pass: an item never sits in two work blocks (refinement 6); designed as wired; Linear in and check-off out are in the first two build days (D-USE-40, D-USE-111), superseding note 42's "the Linear API later"; D-USE-2 changes the not-slotted line. For the non-work go mode and the timers: [`now/`](now/index.md), [`running/`](running/index.md).
