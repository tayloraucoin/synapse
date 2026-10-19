---
target: specs/web/ux/day/schedule/states/error.md
status: approved
promoted:
boards: []
not_drawn: "No Schedule frame draws an error; the living truth has no Schedule surface file yet"
rulings: [D-USE-69]
---

# Schedule — error

The day did not load. The surface is [`../index.md`](../index.md). `?state=error`.

## What shows

Not drawn. The built Schedule's last spec reads "error (as LS-01)" (imported SC-01); a render error is the living truth's error page (`specs/web/ux/_global/system-states.md`, "Something went wrong on this screen."). A failed fetch is Review the day's drawn error (`../../review-the-day/states/error.md`).

Decided (D-USE-77): as Review the day's error: the title and a hairline; the tray loads on its own ([`partial.md`](partial.md)); in the column a `RegionRetry`, "The day didn't load." (body, semibold), "Nothing is lost. The plan is still there once it loads." (label, muted) [placeholder], "Try again" (secondary `Button`).

## What the person can do

Try again (the frame goes to [`loading.md`](loading.md)); the tray; the tabs.

## Words

"The day didn't load." · "Nothing is lost. The plan is still there once it loads." [placeholder] · "Try again".

## Widths

Not drawn. Desk: [`../index.md`](../index.md) › Platforms.

## Criteria

| ID                     | When                  | Then                                                             | Evidence |
| ---------------------- | --------------------- | ---------------------------------------------------------------- | -------- |
| C-USE-schedule-error-1 | The day fails to load | `RegionRetry` in the column; Try again reloads it; no code shown | manual   |
