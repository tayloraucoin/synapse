---
target: specs/web/ux/account/profile-sheet/words-and-access.md
status: approved
promoted:
---

# Profile sheet — words, access, criteria

The second half of [`index.md`](index.md), split to keep each file under its cap.

## Words

Gloss, as drawn and finished. State-only strings sit in each state file. No second person; no numbers.

- Title: "Profile". Labels: "Name", "Email". Photo control: "Change photo" (no photo: "Add photo"). Primary: "Save".
- Crop step: back link "Profile"; heading "Crop photo"; hint "Drag to move, pinch or slide to zoom."; primary "Use photo".
- Uploading: "Uploading". Failure: "Not saved. Try again."
- The name and email are the account's ("Taylor Aucoin", "taylor@example.com" on the boards are `[placeholder]`). The Name input has no placeholder text; its visible label names it (A-16).

## Access

Threshold. `[PROPOSED]` where the boards are silent.

- **The sheet:** a dialog labelled by its title "Profile". On open, focus moves to the title; Tab runs ×, Change photo (or Add photo), Name, Save. Escape and × close; focus returns to the avatar that opened the menu.
- **Names:** × "Close"; the photo is an image named "Profile photo" (decorative when it is the initial, which the name beside the sheet already gives); Change photo "Change photo"; Add photo "Add photo"; Name and Email by their visible labels (the email read as text, not a field).
- **Save faded:** `aria-disabled="true"`, not `disabled`, so it stays reachable; its description says why: "Nothing to save yet" [PROPOSED]. Faded is shown by ink at a lower strength, never by colour alone: the description carries it.
- **Crop step:** the back link "Back to Profile"; the heading "Crop photo" takes focus on entry. The cropper is one focusable region named "Photo crop": arrow keys move the image, + and − zoom [PROPOSED]. The slider is named "Zoom" with its value as a percentage of the range. The hint is its description. "Use photo" ends the step.
- **Announced (polite):** "Uploading" when the upload starts and "Photo updated" when it lands [PROPOSED, words by Gloss]; "Not saved. Try again." on a failure, tied to Save by `aria-describedby`. Focus stays where it was.
- **Busy:** while uploading, the photo region is `aria-busy="true"`; the name stays editable.
- **Not colour alone:** the not saved line has an icon and words, in ink, never red.
- **Targets:** every control at least 44 × 44. Reduced motion: the sheet fades in place instead of sliding; the crop step swaps with no slide.

## Instrumentation

None named by the narrative or the log [ASSUMPTION: Phase 1 sends no product events from this sheet]. Never in any payload or log line: the name, the email, the photo or its file name.

## Criteria

| ID                    | When                                                  | Then                                                                      | Evidence                     |
| --------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------- |
| C-USE-profile-sheet-1 | "Profile" in the avatar menu                          | The sheet opens: ×, "Profile", the photo, Change photo, Name, Email, Save | `captures/default-402.png`   |
| C-USE-profile-sheet-2 | Nothing has changed                                   | Save is faded and does nothing; it is reachable with its reason           | `captures/default-402.png`   |
| C-USE-profile-sheet-3 | The name changes and Save is tapped                   | The name saves and the avatar menu's Who shows it                         | manual                       |
| C-USE-profile-sheet-4 | A photo is picked and cropped                         | "Use photo" uploads at once; no Save needed                               | `captures/crop-402.png`      |
| C-USE-profile-sheet-5 | A save or upload fails, or offline                    | "Not saved. Try again." above Save; the typed name and the old photo stay | `captures/not-saved-402.png` |
| C-USE-profile-sheet-6 | Signed out, `?sheet=profile`                          | The sign-in screen, then back to the sheet                                | manual                       |
| C-USE-profile-sheet-7 | No Remove photo anywhere                              | The sheet offers Change photo or Add photo only                           | `captures/default-402.png`   |
| C-USE-profile-sheet-8 | `?sheet=profile` with each `?state=` key of `states/` | That state renders (canon C-P08)                                          | capture                      |

## Decisions and open items

- D-USE-37 (step 12 round 1 approved as drawn: the crop step, Save faded until a change, no Remove photo; marks standing), D-USE-39 (sheets at the desk), D-USE-49 (lock), D-USE-58 (dark at the theme pass), D-USE-60 and D-USE-89 (the right-side panel at the desk).
- Open carried here: the profile sheet's half of "Step 12 round 1: avatar menu, profile sheet, install sheet" (`../../day/open/open-7.md`), including its "[NEEDS DECISION] at handoff: `account/profile-sheet.md` gains the crop step and Save's faded state", decided as drawn by D-USE-37.
