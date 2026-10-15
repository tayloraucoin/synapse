# Synapse — components.md

Inventory: `packages/ui/src/`, stories beside.

| Job            | Component                                                        |
| -------------- | ---------------------------------------------------------------- |
| Primary action | `Button` default (ink); `destructive` on Delete account only     |
| A row's state  | `StateWord`, one word                                            |
| A system line  | `StatusLine`, one at most; never an `Alert`                      |
| Undo           | `Toaster`, its one job                                           |
| Empty, loading | `EmptyState` one sentence; `SkeletonRow`                         |
| Failure        | `RegionRetry` per region; `ErrorPage` per route                  |
| Sheet          | `ResponsiveSheet`                                                |
| Reading        | `PassageCarousel` clamped; `PassageReader` full screen           |
| Review numbers | `BigNumber` with `FormulaSentence`                               |
| Category       | `CategoryChip`                                                   |
| Firing         | `FiringMark` `halo`: clay dot, grey halo, beside its words       |
| Linear status  | `LinearStatusShape` (Linear's colour, its word); `LinearLine`    |
| Running clock  | `CountdownFace`; "over" always beside the figure                 |
| Running row    | `ProgressRing` (elapsed over plan), the count in its words       |
| Pick a day     | `MonthGrid`: past faded and closed, today ringed, picked filled  |
| Tier heading   | `GroupHeading` `leading` with a `HueSquare`, beside its word     |
| Icon           | `IconPicker`, a step in its sheet; `ColourPopover` for custom    |
| Day in time    | `ScheduleAxis` at 96/h; `ScheduleBullets` fixed cells, "+n more" |
| Way back       | `Breadcrumb` "‹ <place>" on a focused screen                     |

Forbidden: a toast confirming a visible save; `dark:` colour classes.
