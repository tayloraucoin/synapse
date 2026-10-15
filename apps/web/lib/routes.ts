/**
 * Route builders — the one home for every path in the app.
 *
 * Nothing else in `apps/web` writes a path string. A route that moves moves
 * here, and every link, redirect, notification deep-link, and test follows.
 * The map is cross-cutting §4.1; every entry there has a builder here.
 *
 * Cut to the live routes by the legacy move (USE-1): the old app's builders
 * went with its pages. USE's routes are added here as each surface lands.
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

/* ---------------------------------------------------------------- today -- */

export function todayRoute(): string {
  return "/today";
}

/** Today's timeline: the rail's Schedule and the phone's Schedule tab. */
export function todayScheduleRoute(): string {
  return "/today/schedule";
}

/**
 * The two focused screens the shell already knows (USE-4): no rail, no tabs.
 * Their pages land with their own tickets; each new focused path joins
 * `isFocusedPath` in the shell's `nav-items.ts`.
 */
export function orientRoute(): string {
  return "/orient";
}

export function todayReviewRoute(): string {
  return "/today/review";
}

/** The welcome after Ready, go (USE-20 builds it): Start goes on to Now. */
export function todayReadyRoute(): string {
  return "/today/ready";
}

/* ----------------------------------------------------------------- week -- */

/** The desk's Week (D-USE-93); below 1024 the phone reaches it through Set my days. */
export function weekRoute(): string {
  return "/week";
}

/* --------------------------------------------------------------- review -- */

/** The phone's Review tab. */
export function reviewRoute(): string {
  return "/review";
}

/* -------------------------------------------------------------- account -- */

/**
 * Set my days (USE-39 builds the page): the avatar menu's first row. The
 * params are USE-39's; the menu opens it on the week.
 */
export function daysRoute(params: { week?: string; day?: string } = {}): string {
  const query = new URLSearchParams();
  if (params.week) query.set("week", params.week);
  if (params.day) query.set("day", params.day);
  const search = query.toString();
  return search ? `/days?${search}` : "/days";
}

/** Settings (USE-85 builds it): the avatar menu's last row. */
export function settingsRoute(): string {
  return "/settings";
}

/**
 * The sheets a screen opens over itself by `?sheet=` (the shell's sheet host).
 * The value names the sheet; the path stays the screen beneath.
 */
export type SheetName = "install" | "profile" | "meal-topics";

/** `path` with `?sheet=<name>` set, keeping its other query. */
export function sheetRoute(path: string, sheet: SheetName): string {
  const [base = "", search = ""] = path.split("?");
  const query = new URLSearchParams(search);
  query.set("sheet", sheet);
  return `${base}?${query.toString()}`;
}

/** The Install sheet over `path` (USE-83): the menu's row and the offer's How. */
export function installSheetRoute(path: string): string {
  return sheetRoute(path, "install");
}

/** The Profile sheet over `path` (USE-84): the avatar menu's "Profile". */
export function profileSheetRoute(path: string): string {
  return sheetRoute(path, "profile");
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

/* ------------------------------------------------------------------ dev -- */

/**
 * The capture host for parts no screen holds yet (USE-7). `state` names one
 * registered part; none lists them all. Not found in a production build.
 */
export function devPartsRoute(state?: string): string {
  return state ? `/dev/parts?state=${encodeURIComponent(state)}` : "/dev/parts";
}

/* --------------------------------------------------------------- helper -- */

/** Append a status flag to a path that may already carry a query. */
export function withNotice(path: string, flag: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}notice=${encodeURIComponent(flag)}`;
}
