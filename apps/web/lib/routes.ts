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

/**
 * Today; on the phone, Now. `todo` opens the To-dos tray on that to-do
 * (`?todo=<id>`, read by `TODAY_TODO_PARAM`): a reminder's tap lands here (N4).
 */
export function todayRoute(
  params: { todo?: string; date?: string } = {},
): string {
  const query = new URLSearchParams();
  if (params.todo) query.set(TODAY_TODO_PARAM, params.todo);
  // Another date, opened from the Week for planning (USE-58; D-USE-41).
  if (params.date) query.set(TODAY_DATE_PARAM, params.date);
  const search = query.toString();
  return search ? `/today?${search}` : "/today";
}

/** The query key `todayRoute({ todo })` writes and Now reads (nuqs). */
export const TODAY_TODO_PARAM = "todo";

/**
 * The query key `todayRoute({ date })` writes: the desk's Today on another
 * date, planning (opened-day.md [ASSUMPTION: `/today?date=`, one route for
 * doing and planning a day]). Today's own date is never written.
 */
export const TODAY_DATE_PARAM = "date";

/** Today's timeline: the rail's Schedule and the phone's Schedule tab. */
export function todayScheduleRoute(): string {
  return "/today/schedule";
}

/**
 * A block on today's date: the Block view, from Now's Edit block, Review the
 * day and Schedule (block-view/index.md, `/today/block/{id}` [PROPOSED]).
 * `from` says where it was opened (USE-48): the breadcrumb goes back there,
 * and from Schedule the tabs show with Schedule selected; unset is Now.
 */
export type TodayBlockFrom = "review" | "schedule";

/** The query key `todayBlockRoute`'s `from` writes. */
export const TODAY_BLOCK_FROM_PARAM = "from";

export function todayBlockRoute(
  blockId: string,
  from?: TodayBlockFrom,
): string {
  const path = `/today/block/${encodeURIComponent(blockId)}`;
  return from === undefined
    ? path
    : `${path}?${TODAY_BLOCK_FROM_PARAM}=${from}`;
}

/** Whether a path is a Block view from the day. */
export function isTodayBlockPath(pathname: string): boolean {
  return pathname.startsWith("/today/block/");
}

/**
 * A path with the current query kept under its own (`?state=` travels), the
 * path's own keys winning: `withSearch(todayBlockRoute(id, "review"),
 * "?state=success")` is `…?state=success&from=review`.
 */
export function withSearch(path: string, search: string): string {
  const [base = "", own = ""] = path.split("?");
  const query = new URLSearchParams(search);
  for (const [key, value] of new URLSearchParams(own)) query.set(key, value);
  const joined = query.toString();
  return joined ? `${base}?${joined}` : base;
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

/* ---------------------------------------------------------------- a day -- */

/**
 * Close the day on a date (USE-44; `/day/{date}/journal`): the Wind-down
 * block's Journal item opens it. `from: "review"` is a past day opened from
 * Review, read only.
 */
export function journalRoute(
  date: string,
  params: { from?: "review" } = {},
): string {
  const path = `/day/${encodeURIComponent(date)}/journal`;
  return params.from ? `${path}?from=${params.from}` : path;
}

/** Whether a path is Close the day's: a focused screen, no rail, no tabs. */
export function isJournalPath(pathname: string): boolean {
  return /^\/day\/\d{4}-\d{2}-\d{2}\/journal\/?$/.test(pathname);
}

/**
 * A date as Schedule draws it (D-USE-74): the Tomorrow peek's See it.
 * [ASSUMPTION: `?date=` on Schedule until its own ticket names the route.]
 */
export function scheduleDateRoute(date: string): string {
  return `${todayScheduleRoute()}?${SCHEDULE_DATE_PARAM}=${encodeURIComponent(date)}`;
}

/** The query key `scheduleDateRoute` writes. */
export const SCHEDULE_DATE_PARAM = "date";

/* ----------------------------------------------------------------- week -- */

/**
 * The desk's Week (D-USE-93); below 1024 the phone reaches it through Set my
 * days. `week` is an ISO week key (`2026-W43`); absent is this week (USE-72).
 */
export function weekRoute(params: { week?: string } = {}): string {
  return params.week ? `/week?week=${params.week}` : "/week";
}

/* --------------------------------------------------------------- review -- */

/** The phone's Review tab. */
export function reviewRoute(): string {
  return "/review";
}

/* -------------------------------------------------------------- account -- */

/**
 * Set my days (USE-39): the avatar menu's first row opens it on the week.
 * `week` is "usual", "this" or an ISO week key; `day` opens one day, as its
 * weekday (Monday 0, the New block sheet's own param) or a date key, which
 * names its week too. `copy: "picker"` lands on that day with Copy from's
 * picker open (USE-110: Review the day's Copy another day, D-USE-68).
 */
/** Set my days' param that opens Copy from's picker on landing. */
export const DAYS_COPY_PARAM = "copy";

export function daysRoute(
  params: {
    week?: string;
    day?: string | number;
    block?: string;
    copy?: "picker";
  } = {},
): string {
  const query = new URLSearchParams();
  if (params.week) query.set("week", params.week);
  if (params.day !== undefined && params.day !== "") {
    query.set("day", String(params.day));
  }
  // Open This week scrolls to a block (USE-37) [ASSUMPTION: `&block=`].
  if (params.block) query.set("block", params.block);
  if (params.copy) query.set(DAYS_COPY_PARAM, params.copy);
  const search = query.toString();
  return search ? `/days?${search}` : "/days";
}

/** The weekday keys `daysBlockRoute` writes, Monday 0. */
export const DAYS_BLOCK_WEEKDAYS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

/** The query keys `daysBlockRoute` writes. */
export const DAYS_BLOCK_PARAMS = { weekday: "weekday", date: "date" } as const;

/**
 * A block in Set my days, editing (USE-49; block-view/by-kind.md): the usual
 * weekday's (`?weekday=mon`, Monday 0 as `daysRoute`'s `day`) or This week's
 * date (`?date=2026-10-15`), which makes every change that date's only.
 */
export function daysBlockRoute(
  blockId: string,
  on: { weekday: number } | { date: string },
): string {
  const query = new URLSearchParams();
  if ("date" in on) query.set(DAYS_BLOCK_PARAMS.date, on.date);
  else {
    query.set(
      DAYS_BLOCK_PARAMS.weekday,
      DAYS_BLOCK_WEEKDAYS[on.weekday] ?? DAYS_BLOCK_WEEKDAYS[0],
    );
  }
  return `${daysRoute()}/block/${encodeURIComponent(blockId)}?${query.toString()}`;
}

/**
 * Settings (USE-85): the avatar menu's last row, the list of Connections and
 * sign out. `section` opens it at one part, as the To-do sheet's Settings
 * does at Notifications [ASSUMPTION: no Notifications section yet; the list
 * opens as it is].
 */
export function settingsRoute(section?: "notifications"): string {
  return section ? `/settings#${section}` : "/settings";
}

/**
 * Settings › Connections (USE-85): Google calendars, Linear workspaces,
 * clients. Connect Linear on the pool sheet and the Item sheet lands here.
 */
export function connectionsRoute(options: { failed?: "linear" } = {}): string {
  const path = `${settingsRoute()}/connections`;
  return options.failed
    ? `${path}?${CONNECT_FAILED_PARAM}=${options.failed}`
    : path;
}

/**
 * `?failed=linear` on Connections (USE-100): the OAuth callback refused or
 * failed, so the Add row opens on "Not connected. Try again." Cleared once
 * read.
 */
export const CONNECT_FAILED_PARAM = "failed";

/**
 * Linear connect's start (USE-100): sets the connect cookie and redirects
 * to Linear's consent screen. `returnTo` is where a finished connect lands
 * (Connections by default; only a path on this site).
 */
export function linearConnectStartRoute(returnTo?: string): string {
  const path = "/api/integrations/linear/start";
  return returnTo ? `${path}?return=${encodeURIComponent(returnTo)}` : path;
}

/** Linear connect's callback: the OAuth app's registered redirect URI, on the site's origin. */
export function linearConnectCallbackRoute(): string {
  return "/api/integrations/linear/callback";
}

/**
 * The sheets a screen opens over itself by `?sheet=` (the shell's sheet host).
 * The value names the sheet; the path stays the screen beneath.
 */
export type SheetName =
  "install" | "profile" | "meal-topics" | "item" | "todo" | "add" | "new-block";

/** `path` with `?sheet=<name>` set, keeping its other query. */
export function sheetRoute(path: string, sheet: SheetName): string {
  const [base = "", search = ""] = path.split("?");
  const query = new URLSearchParams(search);
  query.set("sheet", sheet);
  return `${base}?${query.toString()}`;
}

/**
 * The Item sheet on one item over `path` (`?sheet=item&id=`; day/item-sheet,
 * its own ticket builds it). Swap opens it on its Swap view
 * [ASSUMPTION: `&view=swap`].
 */
export function itemSheetRoute(
  path: string,
  id: string,
  view?: "swap",
): string {
  const [base = "", search = ""] = sheetRoute(path, "item").split("?");
  const query = new URLSearchParams(search);
  query.set("id", id);
  if (view) query.set("view", view);
  else query.delete("view");
  return `${base}?${query.toString()}`;
}

/**
 * The Block panel on one block's date over `path` (D-USE-41, D-USE-77): the
 * Week's Time lens (USE-73) and Today's day column set it, USE-76 draws the
 * panel. The path's own query is kept, so `?state=` travels. [ASSUMPTION]
 * `?panel=block&block=<id>&on=<date>`, not the drawn `&id=&date=`: `id` is
 * the Item sheet's, which opens over the panel from a row, and `date` is
 * Today's opened date (`TODAY_DATE_PARAM`).
 */
export function blockPanelRoute(
  path: string,
  id: string,
  date: string,
): string {
  const [base = "", search = ""] = path.split("?");
  const query = new URLSearchParams(search);
  query.set(BLOCK_PANEL_PARAMS.panel, "block");
  query.set(BLOCK_PANEL_PARAMS.block, id);
  query.set(BLOCK_PANEL_PARAMS.on, date);
  return `${base}?${query.toString()}`;
}

/** The query keys `blockPanelRoute` writes and the Block panel reads (nuqs). */
export const BLOCK_PANEL_PARAMS = {
  panel: "panel",
  block: "block",
  on: "on",
} as const;

/**
 * The To-do sheet over `path` (USE-28): one to-do by `id`, or a new one
 * (`&new=1`, "+ Add" › To-do) created once a title is typed.
 */
export function todoSheetRoute(
  path: string,
  target: { id: string } | { new: true },
): string {
  const [base = "", search = ""] = sheetRoute(path, "todo").split("?");
  const query = new URLSearchParams(search);
  if ("id" in target) {
    query.set("id", target.id);
    query.delete("new");
  } else {
    query.set("new", "1");
    query.delete("id");
  }
  return `${base}?${query.toString()}`;
}

/**
 * The add sheet over `path` (`?sheet=add`; add-from-the-rail, USE-54 builds
 * it): from the rail + at a time (`&at=HH:MM`), or from an empty Work
 * block's "Add to Primary" preset to its tier (`&tier=&block=`; USE-37).
 */
export function addSheetRoute(
  path: string,
  preset: { at?: string; tier?: "primary" | "secondary"; block?: string },
): string {
  const [base = "", search = ""] = sheetRoute(path, "add").split("?");
  const query = new URLSearchParams(search);
  for (const key of ["at", "tier", "block"] as const) {
    const value = preset[key];
    if (value) query.set(key, value);
    else query.delete(key);
  }
  return `${base}?${query.toString()}`;
}

/**
 * The New block sheet over `path` (USE-46; `?sheet=new-block`): on Set my
 * days' open day (`week`, `day`, the same params `daysRoute` takes), at a
 * tapped time (`&at=HH:MM`) or the first free one, as a block or, from the
 * + menu's Transition, a transition (`&mode=transition`).
 */
export function newBlockSheetRoute(
  path: string,
  start: { week?: string; day?: number; at?: string; mode?: "transition" },
): string {
  const [base = "", search = ""] = sheetRoute(path, "new-block").split("?");
  const query = new URLSearchParams(search);
  const values = {
    week: start.week,
    day: start.day === undefined ? undefined : String(start.day),
    at: start.at,
    mode: start.mode,
  };
  for (const [key, value] of Object.entries(values)) {
    if (value) query.set(key, value);
    else query.delete(key);
  }
  return `${base}?${query.toString()}`;
}

/** The Install sheet over `path` (USE-83): the menu's row and the offer's How. */
export function installSheetRoute(path: string): string {
  return sheetRoute(path, "install");
}

/** The Meal topics sheet over `path` (USE-22): Edit topics on a meal, the avatar menu's row. */
export function mealTopicsSheetRoute(path: string): string {
  return sheetRoute(path, "meal-topics");
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
