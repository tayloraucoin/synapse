# Synapse — tokens.md

One role per token (the brand kit, WEB-1; full table in `docs/ai-guides/brand-tokens.md`):

- `background` `surface` `foreground` `muted-foreground` `border` `input`: ink on paper; flip by theme.
- `primary`: the one filled button, ink. `now`, `ring`: this moment (D-P02); `link` for its words.
- `accent` (bridge): `surface`, the hover fill (G-04 closed).
- `off-schedule` `off-schedule-text`: off schedule only. `destructive` `destructive-text`: Delete account, and danger past a plan beside "over" or "of <plan>" (D-USE-29).
- `alert`: needs you now (Urgent, Blocked, Paused); `firing-text`: the firing words; `warning-text`: a little over or due soon (D-USE-49, D-USE-79). Named bends of P-A04, each beside its word.
- `category-<hue>-chip` `-dot`: a category, always beside its name; `yellow` is Life's ninth hue (dot 2.3:1, a named exception).
- `block-<kind>`: planning surfaces only; never `/today` or Schedule.
- Legacy aliases (`paper`, `ink`, `hairline`, `text-*`, `edge`, `fill-muted`, `accent-text`): a role each, until a codemod retires them.

**Type:** `Text` variants on the kit ramp; `review-*` per D-P01; `--fs-timer` the timer only.
**Space:** `--space-1` `2` `3` `4` `6` `8` `12`; widths `--content-text`, `--content-canvas`, `--measure`.
**Radius:** `--radius-control` controls and chips, `--radius-sheet` sheets; no pill.
**Elevation:** none; `border` separates, `--scrim` dims behind a sheet.
**Motion:** `--dur-state`, `--dur-sheet`; `--dur-breathe` the firing mark; `--dur-pulse` (`animate-held`) the paused running figure, `motion-safe:` only.
**Breaks:** `--breakpoint-wide` 768 for sheets (`wide:`, `useIsWide`); `--breakpoint-split` 1024 for the desk, rail vs tabs (`split:`, `useIsSplit`, D-USE-93). No third.
