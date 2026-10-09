# Synapse — components.md

Inventory: `packages/ui/src/`, stories beside.

| Job            | Component                                                    |
| -------------- | ------------------------------------------------------------ |
| Primary action | `Button` default (ink); `destructive` on Delete account only |
| A row's state  | `StateWord`, one word                                        |
| A system line  | `StatusLine`, one at most; never an `Alert`                  |
| Undo           | `Toaster`, its one job                                       |
| Empty, loading | `EmptyState` one sentence; `SkeletonRow`                     |
| Failure        | `RegionRetry` per region; `ErrorPage` per route              |
| Sheet          | `ResponsiveSheet`                                            |
| Review numbers | `BigNumber` with `FormulaSentence`                           |
| Category       | `CategoryChip`                                               |

Forbidden: a toast confirming a visible save; `dark:` colour classes.
