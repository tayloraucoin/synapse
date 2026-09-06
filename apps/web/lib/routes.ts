/**
 * Route builders — the one home for every path in the app.
 *
 * Nothing else in `apps/web` writes a path string. A route that moves moves
 * here, and every link, redirect, notification deep-link, and test follows.
 * The map is cross-cutting §4.1; every entry there has a builder here.
 *
 * Builders take already-validated inputs. `dateRoute("2026-13-40")` will
 * happily produce a URL — validation belongs at the boundary that reads the
 * segment (`dateKeySchema` / `weekKeySchema` in `@syn/validators`), which is
 * where a bad value can be turned into a 404 rather than a broken link.
 */

/* ---------------------------------------------------------------- entry -- */

export function homeRoute(): string {
  return "/";
}

/* ----------------------------------------------------------------- auth -- */

/**
 * `next` is where to return after signing in. Callers pass an already
 * sanitised path (`sanitizeNextPath` from `@syn/utils`) — this builder
 * encodes, it does not validate.
 */
export function signInRoute(next?: string): string {
  return next ? `/signin?next=${encodeURIComponent(next)}` : "/signin";
}

export function signUpRoute(): string {
  return "/signup";
}

export function verifyRoute(next?: string): string {
  return next ? `/verify?next=${encodeURIComponent(next)}` : "/verify";
}

export function forgotRoute(): string {
  return "/forgot";
}

export function resetRoute(): string {
  return "/reset";
}

/** The shared invite link — AU-02 with the invite line. */
export function inviteRoute(): string {
  return "/invite";
}

export function logoutRoute(): string {
  return "/logout";
}

/** Supabase's OAuth/PKCE redirect target. */
export function authCallbackRoute(): string {
  return "/auth/callback";
}

/** Where every Supabase email link lands (token_hash flow). */
export function authConfirmRoute(): string {
  return "/auth/confirm";
}

/* --------------------------------------------------------------- assets -- */

/**
 * The session-gated read route for one stored image (SET-3).
 *
 * `storedPath` is the bucket-qualified path a row holds —
 * `icons/{user_id}/{uuid}.jpg` — so the URL is the path with one prefix. The
 * result is only ever resolvable by the owner's session; there is no public
 * URL for an icon or an avatar.
 *
 * Callers use `iconImageUrl` / `avatarImageUrl` in `lib/assets/icon-url.ts`
 * rather than this directly, so the null cases stay in one place.
 */
export function assetRoute(storedPath: string): string {
  return `/api/assets/${storedPath}`;
}

/* ---------------------------------------------------------------- setup -- */

/** FR-01…05. `step` is 1–5; the page 404s on anything else. */
export function setupRoute(step: number): string {
  return `/setup/${step}`;
}

/* ------------------------------------------------------------ execution -- */

export function todayRoute(): string {
  return "/today";
}

export function todayScheduleRoute(): string {
  return "/today/schedule";
}

/** A past or future day. `date` is `YYYY-MM-DD`. */
export function dayRoute(date: string): string {
  return `/day/${date}`;
}

export function dayScheduleRoute(date: string): string {
  return `/day/${date}/schedule`;
}

/** The item sheet, addressable because a notification deep-links to it. */
export function dayItemRoute(date: string, id: string): string {
  return `/day/${date}/item/${id}`;
}

/* --------------------------------------------------------------- review -- */

export function reviewRoute(): string {
  return "/review";
}

export function reviewDayRoute(date: string): string {
  return `/review/day/${date}`;
}

/** `week` is `YYYY-Www` (ISO week). */
export function reviewWeekRoute(week: string): string {
  return `/review/week/${week}`;
}

export function reviewWeekHabitRoute(week: string, id: string): string {
  return `/review/week/${week}/habit/${id}`;
}

export function reviewHistoryRoute(): string {
  return "/review/history";
}

/* ------------------------------------------------------------- settings -- */

export function settingsRoute(): string {
  return "/settings";
}

export function settingsAccountRoute(): string {
  return "/settings/account";
}

export function settingsHabitsRoute(): string {
  return "/settings/habits";
}

export function settingsHabitRoute(id: string): string {
  return `/settings/habits/${id}`;
}

export function settingsTemplatesRoute(): string {
  return "/settings/templates";
}

export function settingsTemplateRoute(id: string): string {
  return `/settings/templates/${id}`;
}

/** Without a week, the week build opens on the current one. */
export function settingsWeekRoute(week?: string): string {
  return week ? `/settings/week/${week}` : "/settings/week";
}

export function settingsCategoriesRoute(): string {
  return "/settings/categories";
}

export function settingsReasonsRoute(): string {
  return "/settings/reasons";
}

export function settingsNotificationsRoute(): string {
  return "/settings/notifications";
}

export function settingsDayRoute(): string {
  return "/settings/day";
}

export function settingsAppearanceRoute(): string {
  return "/settings/appearance";
}

export function settingsDataRoute(): string {
  return "/settings/data";
}

export function settingsShareRoute(): string {
  return "/settings/share";
}

export function settingsAboutRoute(): string {
  return "/settings/about";
}

/* ---------------------------------------------------------------- legal -- */

/**
 * The two legal pages — SYS-3.
 *
 * PUBLIC, AND OUTSIDE THE THREE ROUTE GROUPS. A privacy policy a person has to
 * sign in to read is not a privacy policy, and both the landing page's footer
 * and About link to them. They have no shell and no gate.
 */
export function legalPrivacyRoute(): string {
  return "/legal/privacy";
}

export function legalTermsRoute(): string {
  return "/legal/terms";
}

/* --------------------------------------------------------------- helper -- */

/** Append a status flag to a path that may already carry a query. */
export function withNotice(path: string, flag: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}notice=${encodeURIComponent(flag)}`;
}
