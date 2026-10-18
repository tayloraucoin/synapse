# Synapse — components.md

Job: component (`packages/ui/src/`).

- Primary action: `Button` default (ink); `destructive` on Delete account only.
- Row state: `StateWord`, one word. System line: `StatusLine`, one at most, never `Alert`.
- Undo: `Toaster`, its one job; never a toast for a visible save.
- Empty, loading: `EmptyState` one sentence; `SkeletonRow`.
- Failure: `RegionRetry` per region (`detail`: a muted line, what is still true); `ErrorPage` per route.
- Sheet: `ResponsiveSheet`. Reading: `PassageCarousel`, `PassageReader` full screen.
- Review numbers: `BigNumber` with `FormulaSentence`. Category: `CategoryChip`.
- Firing: `FiringMark` `halo` beside its words. Linear: `LinearStatusShape` with its word; `LinearLine`.
- Running: `CountdownFace`, "over" beside the figure; `ProgressRing` (elapsed over plan), the count in words.
- Pick a day: `MonthGrid`.
- Tier heading: `GroupHeading` with a `HueSquare` and its word.
- Icon: `IconPicker`, a step in its sheet; `ColourPopover`.
- Day in time: `ScheduleAxis` 96/h; `ScheduleBullets`, "+n more".
- Way back: `Breadcrumb` "‹ <place>".
- No `dark:` colour classes.
