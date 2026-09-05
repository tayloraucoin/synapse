# INF-2 — Leaf packages: `types`, `constants`, `utils`, `validators`, `observability`

**Epic:** INF — Infrastructure · **Phase 1** · Size: M
**Slice type:** Package skeletons and the platform-purity rule — the failure class is a web-only import sneaking into a package the future Expo app must consume unchanged.

**Status:** Complete (2026-09-04)

---

## Outcome

Five platform-pure workspaces exist, each with CC's package template (single barrel, `type: module`, `lint` + `check-types` scripts, `@syn/config` devDependency, no "just in case" deps) and the first real content Synapse needs: the domain and UI-state unions from the v2 handoff §3.5 in `@syn/types`, the runtime limits and storage-key registry in `@syn/constants`, time and string helpers in `@syn/utils`, the auth-credentials and preference schemas in `@syn/validators`, and CC's logger in `@syn/observability`. Nothing imports `next/*` or the DOM. Nothing in this ticket has a surface, a table, or a procedure.

## Why / intent

- **CC `codebase-conventions.md` §4 (universal package rules), §4.6–§4.10 (each leaf), §5 (the util/lib/constants hierarchy), §6 (import matrix), §4A (platform split).** Rule 5 of the ten: shared packages are React-Native-portable by construction.
- **v2 handoff §3.5** fixes the type unions every component contract references; README § Handoff path remap sends them to `packages/types/src/domain/`.
- **What this slice is NOT (binding):** no `@syn/hooks` (INF-8, because CC's hooks depend on the `AppRouter` type), no `@syn/db` (INF-5), no `@syn/ui` content (INF-3).
- **Ground truth:** `packages/config` and an emptied `packages/ui` exist from INF-1; nothing else.

**Rulings this slice makes (labelled, logged):**

- **Zod stays on v3 (`^3.24`).** CC pins v3; `@t3-oss/env-nextjs`, `@hookform/resolvers`, and CC's `useZodForm` are validated against it. `taylor-aucoin` is on zod 4 and is not the reference here. `[REVISIT: when CC moves.]` Logged.
- **`@syn/observability` is CC's logger with the env flag renamed** (`SYN_LOG_DEBUG` / `NEXT_PUBLIC_SYN_LOG_DEBUG`), the `describe-error` helper, and `is-dev`; the marketing transport diagnostics and analytics modules are dropped. Logged.
- **Time helpers take an explicit `timeZone`.** Synapse shows times in the day's stored zone, not the viewer's (cross-cutting §7.3), so `formatClock(date, timeZone, locale?)` is the primitive; CC's viewer-local `formatClockTime` is not copied. Logged.

## Behaviour & states

**No surface.**

### `packages/types` (`@syn/types`)

- `package.json`: copy CC `packages/types/package.json`, rename.
- `src/index.ts`: CC's header comment (membership test, naming rule) + the exports below.
- `src/auth-context.ts`: `AuthContextRole = "guest" | "service_role"` and `interface AuthContext { userId: string; role: AuthContextRole }`. (CC has `admin | super_admin`; Synapse has no admin role over user data — README non-negotiables.)
- `src/domain/domain.ts`, `src/domain/ui-state.ts`, `src/domain/view.ts`: the three blocks from the v2 handoff §3.5, verbatim. If the handoff file is not on disk (README § known-stale), transcribe from the official spec §3 (schema unions) and §5.9 + Epic 2 §2 (`ItemState`) and log a DEVIATIONS line naming the source used.

### `packages/constants` (`@syn/constants`)

- `package.json`: CC's, renamed.
- `src/index.ts` barrel with CC's constant-vs-type header.
- `src/storage-keys.ts`: `STORAGE_KEYS = { THEME: "syn:theme", DISMISSED_PREFIX: "syn:dismissed:", DRAFT_PREFIX: "syn:draft:", INSTALL_DISMISSED_UNTIL: "syn:install-dismissed-until" } as const`.
- `src/limits.ts`: the validation bounds from Epic 1 §9 as named constants (`HABIT_TITLE_MAX = 60`, `TEMPLATE_NAME_MAX = 40`, `CATEGORY_NAME_MAX = 24`, `REASON_LABEL_MAX = 40`, `PREFLIGHT_NOTE_MAX = 280`, `REFLECTION_AXIS_MAX = 24`, `REFLECTION_AXES_MAX = 2`, `QUANTITY_UNIT_MAX = 16`, `DURATION_MIN = 1`, `DURATION_MAX = 480`, `PRIORITY_MIN = 1`, `PRIORITY_MAX = 7`, `WEEKLY_TARGET_MAX = 7`, `SHIFT_MIN = 5`, `SHIFT_MAX = 600`, `CAPACITY_MIN = 5`, `CAPACITY_MAX = 1440`, `PASSWORD_MIN = 8`, `DISPLAY_NAME_MAX = 40`, `NOTE_MAX = 500`, `FEEDBACK_MAX = 1000`, `OTHER_REASON_MAX = 80`).
- `src/motion.ts`: `DURATION_STATE_MS = 120`, `DURATION_SHEET_MS = 200`, `UNDO_SHORT_MS = 5000`, `UNDO_LONG_MS = 10000`, `SHIFT_UNDO_WINDOW_MS = 600000`.
- `src/user-images.ts`: copy CC's (`USER_IMAGE_MIME_TYPES`, `USER_IMAGE_ACCEPT_ATTRIBUTE`, `USER_IMAGE_MAX_BYTES` = 5 MB).
- `src/contact.ts`: `VAPID_MAILTO_SUBJECT` placeholder `mailto:` `[NEEDS VALUE AT BUILD]` — Taylor supplies the address; leave the constant with a TODO and no invented email.
- `src/brand.ts`: `SITE_NAME = "Synapse"`.

### `packages/utils` (`@syn/utils`)

- `package.json`: CC's, renamed. No dependencies.
- `src/index.ts` barrel.
- `src/string.ts`: copy CC's `firstNonEmpty`, `truncate`, `pluralize`, `withTrailingGap` if present; add `getInitials(name, max = 2)`.
- `src/time.ts` (new; grouped by domain, no `helpers.ts`): `formatClock(date: Date, timeZone: string, locale?: string): string` (hour numeric, minute 2-digit, `timeZone`), `formatWindow(start, end, timeZone, locale?)` → `"1:00–4:00"`, `formatElapsed(seconds): string` (mm:ss under an hour, h:mm:ss after — v2 handoff §12 call 8), `formatCalendarDay(date, timeZone, style: "short" | "long")` (pinned locale for SSR parity — CC's rule), `toDateKey(date, timeZone): "YYYY-MM-DD"`, `minutesFromDayStart(date, dayStart, timeZone)`.
- `src/path.ts`: copy CC's `sanitizeNextPath`.
- `src/errors.ts`: `AppError` base with `code`, per CC §9A.
- `src/number.ts`: `clamp`, `roundToStep`.
- No `scroll.ts` (CC's known web-only leaf is not carried).

### `packages/validators` (`@syn/validators`)

- `package.json`: CC's, renamed; dependencies `@syn/constants`, `zod ^3.24`.
- `src/index.ts` barrel.
- `src/auth-credentials.ts`: `emailSchema`, `passwordSchema` (min `PASSWORD_MIN`), `signInInput`, `signUpInput` (`displayName` 1–40, email, password), `forgotPasswordInput`, `resetPasswordInput` (password + confirm, `refine` equal) with the exact error strings from Epic 1 §9 as `message`.
- `src/preferences.ts`: `themePreferenceSchema = z.enum(["system","light","dark"])`, `timezoneSchema` (IANA string, `refine` via `Intl.supportedValuesOf("timeZone")` when available), `clockTimeSchema` (`HH:mm`).
- `src/push.ts`: copy the `subscribeBodySchema` shape from CC's push subscribe route as `webPushSubscribeInput`.
- Export both the schema and its `z.infer` type for each.

### `packages/observability` (`@syn/observability`)

- Copy CC's `packages/observability/{package.json,src/index.ts,src/logging.ts,src/is-dev.ts,src/describe-error.ts}`; rename; env flags → `SYN_LOG_DEBUG`, `NEXT_PUBLIC_SYN_LOG_DEBUG`; delete `analytics.ts` and `marketing-transport-env.ts` and their exports.

### Common to all five

- `tsconfig.json`: extends `@syn/config/tsconfig/base.json` with CC's leaf overrides (`outDir: dist`, `module: ESNext`, `moduleResolution: Bundler`); `include: ["src"]`.
- `eslint.config.mjs`: `import { config } from "@syn/config/eslint/base"; export default config;`.
- Root `tsconfig.json` references gain the five paths.

**States (exhaustive):** each package `yarn check-types` passes standalone · `yarn lint:boundaries` passes · no package imports `next`, `react-dom`, or a DOM global (`window`, `document`, `navigator`, `localStorage`).

## Non-negotiables (this slice)

- **Platform-pure.** Any `next/*`, DOM, or Node-only built-in in these five packages is a defect.
- **A `const` is never a type; a `type` is never a constant** (CC §4.8).
- **Grouped by domain, never one-file-per-function; `helpers.ts`/`misc.ts`/`utils.ts` files are banned** (CC §5.3).
- **Schema unions keep schema spelling; presentational unions are kebab-case** (v2 handoff §3.2 R8).

## Data & AI

**Schema changes: none.** **Tables:** none. **Placement:** CC §4.6–§4.10; the domain-type files per README path remap. **tRPC / validators:** the three validator modules above; no procedures. **AI notes: None.** **Instrumentation: none.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable)

1. `packages/{types,constants,utils,validators,observability}` exist, each named `@syn/<name>`, each with a single `src/index.ts` barrel and no `"./*"` export.
2. `@syn/types` exports `AuthContext`, `AuthContextRole`, and every union named in the v2 handoff §3.5 (`ItemType`, `TimeMode`, `Scheduling`, `AssignmentState`, `CompletionState`, `MissTier`, `ItemOrigin`, `CategoryKey`, `IconValue`, `TimerSessionSource`, `ItemState`, `MultitaskPosition`, `StateWordKind`, `DayMode`, `Layout`, `SaveStatus`, `ReviewMode`, `DecisionState`, `StripState`, `TimerStatus`, `StatusLineVariant`, `PermissionState`, `ShiftStep`) and the view interfaces (`CategoryView`, `DayItemView`, `SlotView`, `HabitSummaryView`, `TemplateSummaryView`, `ReasonView`).
3. `grep -rE "from ['\"](next|react-dom)|window\.|document\.|navigator\.|localStorage" packages/{types,constants,utils,validators,observability}/src` returns nothing.
4. `formatClock(new Date("2026-09-04T14:32:00Z"), "America/Vancouver", "en-US")` returns `"7:32 AM"`; `formatElapsed(3661)` returns `"1:01:01"`; `formatElapsed(59)` returns `"0:59"`.
5. `yarn lint`, `yarn lint:boundaries`, `yarn check-types` pass; `yarn build` still passes.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `Intl.DateTimeFormat` with `timeZone` is available in Node 22 and every target browser; no date library is needed for formatting. Arithmetic across DST (cross-cutting §7.2) is a tech-spec concern and may justify `date-fns` + `@date-fns/tz` later — not here.
- CC exports `$inferSelect` row types from `@cc/db`, never from `@cc/types`; keep `@syn/types` free of anything derivable from the schema.

## Dev's call

Exact helper signatures beyond those named · whether `formatCalendarDay` pins `en-US` or takes a locale with an `en-US` default (CC pins).

## Out of scope

- **`@syn/hooks`** — INF-8. **`@syn/db`** — INF-5. **Domain validators for habits, templates, days** — the feature epics' tech spec.

## Depends on

- **INF-1** — the `@syn` scope, `packages/config`, and the boundaries lint. Complete in `PROGRESS.md`.

## Recommended execution

**Sonnet** — precise transcription against CC's files and the handoff's type blocks. The one risk is purity; the grep criterion catches it. Opus is not needed unless the handoff file is missing and the unions must be reconstructed from the official spec.

---

### Build kickoff (paste into the session)

> Build **INF-2 — Leaf packages** (attached spec). Model: **Sonnet**. **Five platform-pure workspaces in CC's template; the v2 handoff §3.5 unions in `@syn/types`; nothing web-bound.**
> Attach/read first, in order: this spec · `docs/specs/infrastructure/README.md` (path remap) · CC `codebase-conventions.md` §4, §4A, §5, §6 · CC `packages/{types,constants,utils,validators,observability}/**` · `docs/ux/synapse_ui_component_needs_and_handoff_v2.md` §3.5 (or the official spec §3 + §5.9 if absent) · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Copy CC's package template exactly; add only the content named. No DOM, no `next/*`. Close in three places; run `yarn lint && yarn lint:boundaries && yarn check-types && yarn build`.
