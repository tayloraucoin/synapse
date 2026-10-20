---
target: specs/web/ux/account/morning-reading/words-and-access.md
status: approved
promoted:
---

# Settings › Morning reading — words, access, criteria

The second half of [`index.md`](index.md), split to keep each file under its cap.

## Words

Gloss. As drawn: the words changed on the canvas are the intent (D-USE-133). No second person, no counts, no red. The passage and link contents on the boards are `[placeholder]` ("Where the feet are", "Slow is a speed too", the untitled "Before the kettle boils…", "The long view", "A cup, not a race"; "Morning calm", "Ten minutes of stretching", `example.org`).

- Header: "Settings" (back), "Morning reading". The Settings list row: "Morning reading", with no second line (D-USE-132).
- Passages: "Passages", "Orient shows them in this order. Hold the grip to move one.", "Add a passage", "Off".
- Links: "Links", "Shown under the reading, in this order.", "Add a link", "Off".
- Off list: "Not in the morning reading. Turn one on to bring it back.", "Turn on", "Delete".
- Empty: "Nothing to read yet. A passage added here shows on Orient each morning."; "No links yet. A playlist or a page added here shows under the reading."
- Row menu: "Edit", "Move up", "Move down", "Turn off" with "Leaves Orient, kept under Off".
- Toast: "“<title>” is off. Orient no longer shows it." with "Undo". For a passage with no title: "That passage is off. Orient no longer shows it." [PROPOSED].
- Delete: "Delete “<title>”?", "It goes for good, words and all, and can’t be brought back. Left off, it stays here to turn on later.", "Keep it", "Delete". For no title: "Delete this passage?" [PROPOSED].
- Passage sheet: "Add a passage" or "Edit passage"; "Title", "Optional", the placeholder "Untitled"; "Passage", the placeholder "A few lines, a paragraph, a page."; "Save". Images (design only): "Images", "Up to four, above the words", "Add".
- Link sheet: "Add a link" or "Edit link"; "Title", the placeholder "What it is, in a few words"; "Link", the placeholder "https://", the hint "A web address or a Spotify link."; "Save". When the link cannot open: "That doesn’t open as a link. Paste the address from the browser or from Spotify’s Share."
- Discard: "Discard changes?", "The edits to “<title>” are not kept. The passage stays as it was.", "Keep editing", "Discard". For a new passage or link: "The new passage is not kept." or "The new link is not kept." [PROPOSED].
- Saved: "Saved" (`SaveStatus`). Save failed: "Not saved. The words are still here; Save tries again."
- Error: "Passages and links didn’t load. Orient still shows what was saved.", "Try again".
- Offline: "Offline. The reading shows as last saved; changes wait for a connection."; in a sheet: "Offline. The words stay here; Save waits for a connection."
- [PROPOSED] Limits, in the field's line, in ink: "Titles stop at 80 characters." and "A passage stops at 8,000 characters." These are the only numbers on the screen, and they are about the field, not the day.

## Access

Threshold. `[PROPOSED]` where the boards are silent.

- **Headings and order:** "Morning reading" is the page's h1; "Passages" and "Links" are h2. Tab order follows the layout: back, then each section's rows, add row and Off.
- **Rows:** a passage row is one button named "<title>, <first line>", or "<first line>" with no title, and it opens Edit. The grip is "Move <title>"; ··· is "More for <title>". A link row's name is "<title>, <host>".
- **Order without a drag:** ··· › "Move up" and "Move down" are the keyboard and switch path (D-USE-123). The first row has no Move up and the last no Move down. After a move, focus stays on the row's ··· and a polite announcement gives the new place in words ("Moved up, now after Where the feet are") rather than a count. A drag is never the only way.
- **Off:** "Off" is a disclosure button with `aria-expanded`. "Turn on" and "Delete" are named in full ("Turn on The long view", "Delete The long view").
- **Dialogs and sheets:** focus moves to the title on open and returns to what opened it. Escape and × close; with unsaved words Escape asks first. The delete dialog's first focus is "Keep it".
- **Fields:** each `Input` has its visible label; "Optional" is part of the Title label's description. The link line and the limit lines are tied to the field (`aria-describedby`, `aria-invalid`), and Save waits without hiding.
- **Announced (polite):** "Saved" from `SaveStatus`; the toast, with Undo reachable by keyboard while it shows; "Not saved." on a failed Save; the offline `StatusLine` once.
- **Not by colour alone:** waiting controls are faint and disabled (`aria-disabled`, and the `StatusLine` says why); the link line is words in ink with an icon.
- **Targets:** rows 56 px (`--spacing-row`); grip, ···, Turn on and Delete at least 44 × 44. Reduced motion: the lift and drop do not animate, and sheets fade in place.

## Instrumentation

None. Phase 1 sends no product events from Settings (as Connections). Never in any payload: passage words, titles, links or hosts.

## Criteria

Surface-wide here; each state's own criteria are in its file.

| ID                      | When                               | Then                                                                                                     | Evidence |
| ----------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------- | -------- |
| C-USE-morning-reading-1 | Settings opens                     | "Morning reading" is a row after Connections, with no second line, and opens `/settings/morning-reading` | capture  |
| C-USE-morning-reading-2 | Orient renders after a change here | It shows the active passages and links in this screen's order; off rows are absent                       | test     |
| C-USE-morning-reading-3 | Any write                          | It runs as the signed-in user through `ctx.rls.execute()`; another user's row is never read or written   | test     |
| C-USE-morning-reading-4 | The screen at 402                  | Four type sizes; passage text in Newsreader, everything else in Public Sans; nothing red                 | capture  |
| C-USE-morning-reading-5 | Keyboard only                      | Every action (open, edit, move, off, on, delete, save) is reachable without a pointer                    | manual   |
| C-USE-morning-reading-6 | Every key in the States table      | Reachable by `?state=` on the route and on `/dev/parts`                                                  | check    |
