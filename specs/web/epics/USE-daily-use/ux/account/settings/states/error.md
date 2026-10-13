---
target: specs/web/ux/account/settings/states/error.md
status: approved
promoted:
boards: []
not_drawn: "Not drawn on any page; a calendar list or Connections that fails to load, or a change not saved"
rulings: [D-USE-57]
---

# Settings › Connections — error

`?state=error`.

## What shows

Not drawn. [ASSUMPTION] for each, as the defaults, in ink with an alert icon, never red:

- **Connections fails to load:** under the title, "Connections didn't load." with "Try again" (D-USE-57's "Today didn't load." form).
- **A calendar list fails to load** for a connected Google account: in the Google Calendar section, under the account line, "Calendars didn't load." with "Try again"; the explainer and "Add a Google account" stay. The events already on the day stay.
- **A change not saved** (a switch, a reorder, a project's client, the client sheet's Save): the change springs back and "Not saved. Try again." shows under that row, or above Save on the client sheet, everything typed kept (N2's form).

## Rulings

None rules this state for Connections; D-USE-57 and N2 give the forms borrowed.

## Widths

Not drawn at any width; the same at every width.

## Criteria

| ID                     | When                            | Then                                                                                         | Evidence |
| ---------------------- | ------------------------------- | -------------------------------------------------------------------------------------------- | -------- |
| C-USE-settings-error-1 | The calendar list fails to load | "Calendars didn't load." with Try again in the Google section; the rest of Connections works | manual   |
| C-USE-settings-error-2 | A change fails to save          | It reverts with "Not saved. Try again." beside it, in ink                                    | test     |
