/**
 * Calendar API v3, read-only (USE-103): the calendar list and one calendar's
 * events for a week. Every page is parsed by `@syn/validators` before it is
 * returned; a page that does not parse throws `GooglePayloadError`, and the
 * sync keeps the last snapshot.
 *
 * Quotas: 600 requests a minute per user. A 403 `usageLimits`,
 * `userRateLimitExceeded` or `rateLimitExceeded`, or a 429, is retried with
 * exponential backoff, `min(2^n s + jitter, 32 s)`, up to five tries.
 * No `syncToken`: it cannot combine with time bounds.
 */
import { z } from "zod";
import {
  googleCalendarListEntry,
  googleEventItem,
  type GoogleCalendarListEntry,
  type GoogleEventItem,
} from "@syn/validators";
import type { FetchLike } from "./oauth";

export const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

/** One page of a list: its items, parsed by `@syn/validators`, and Google's cursor. */
function pageOf<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    items: z.array(item).default([]),
    nextPageToken: z.string().optional(),
  });
}

export const googleCalendarListPage = pageOf(googleCalendarListEntry);
export const googleEventsPage = pageOf(googleEventItem);

const RATE_REASONS = new Set([
  "usageLimits",
  "userRateLimitExceeded",
  "rateLimitExceeded",
]);
const MAX_TRIES = 5;
const MAX_DELAY_MS = 32_000;

/** A Calendar API call that did not succeed; the status and Google's reason, never a body. */
export class GoogleApiError extends Error {
  readonly status: number;
  readonly reason: string | null;
  constructor(status: number, reason: string | null) {
    super(`Google Calendar answered ${status}${reason ? ` (${reason})` : ""}.`);
    this.name = "GoogleApiError";
    this.status = status;
    this.reason = reason;
  }
}

/** A response that does not match the schema: a field the sync needs is missing. */
export class GooglePayloadError extends Error {
  constructor(what: string) {
    super(`Google's ${what} did not parse.`);
    this.name = "GooglePayloadError";
  }
}

export interface GoogleClientDeps {
  fetch: FetchLike;
  /** Waits between retries; a test passes one that resolves at once. */
  sleep?: (ms: number) => Promise<void>;
  random?: () => number;
}

const realSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

function reasonOf(body: unknown): string | null {
  const error = (body as { error?: { errors?: { reason?: unknown }[] } })
    ?.error;
  const reason = error?.errors?.[0]?.reason;
  return typeof reason === "string" ? reason : null;
}

function isRateLimited(status: number, reason: string | null): boolean {
  if (status === 429) return true;
  return status === 403 && reason !== null && RATE_REASONS.has(reason);
}

export function createGoogleCalendarClient(
  accessToken: string,
  deps: GoogleClientDeps,
) {
  const sleep = deps.sleep ?? realSleep;
  const random = deps.random ?? Math.random;

  async function getJson(url: URL): Promise<unknown> {
    for (let attempt = 0; ; attempt += 1) {
      const response = await deps.fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const body: unknown = await response.json().catch(() => null);
      if (response.ok) return body;
      const reason = reasonOf(body);
      if (isRateLimited(response.status, reason) && attempt + 1 < MAX_TRIES) {
        await sleep(
          Math.min(2 ** attempt * 1000 + random() * 1000, MAX_DELAY_MS),
        );
        continue;
      }
      throw new GoogleApiError(response.status, reason);
    }
  }

  async function allPages<T>(
    build: (pageToken: string | undefined) => URL,
    schema: z.ZodType<
      { items: T[]; nextPageToken?: string },
      z.ZodTypeDef,
      unknown
    >,
    what: string,
  ): Promise<T[]> {
    const items: T[] = [];
    let pageToken: string | undefined;
    do {
      const parsed = schema.safeParse(await getJson(build(pageToken)));
      if (!parsed.success) throw new GooglePayloadError(what);
      items.push(...parsed.data.items);
      pageToken = parsed.data.nextPageToken;
    } while (pageToken);
    return items;
  }

  return {
    /** `calendarList.list`, every page, deleted and hidden ones included (the sync drops them). */
    listCalendars(): Promise<GoogleCalendarListEntry[]> {
      return allPages(
        (pageToken) => {
          const url = new URL(`${GOOGLE_CALENDAR_API}/users/me/calendarList`);
          url.searchParams.set("showDeleted", "true");
          url.searchParams.set("showHidden", "true");
          if (pageToken) url.searchParams.set("pageToken", pageToken);
          return url;
        },
        googleCalendarListPage,
        "calendar list",
      );
    },

    /** One calendar's events in `[timeMin, timeMax)`, each occurrence of a repeating one apart. */
    listEvents(input: {
      calendarId: string;
      timeMin: string;
      timeMax: string;
      timeZone: string;
    }): Promise<GoogleEventItem[]> {
      return allPages(
        (pageToken) => {
          const url = new URL(
            `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(input.calendarId)}/events`,
          );
          url.searchParams.set("timeMin", input.timeMin);
          url.searchParams.set("timeMax", input.timeMax);
          url.searchParams.set("singleEvents", "true");
          url.searchParams.set("orderBy", "startTime");
          url.searchParams.set("maxAttendees", "1");
          url.searchParams.set("maxResults", "2500");
          url.searchParams.set("timeZone", input.timeZone);
          if (pageToken) url.searchParams.set("pageToken", pageToken);
          return url;
        },
        googleEventsPage,
        "events",
      );
    },
  };
}

export type GoogleCalendarClient = ReturnType<
  typeof createGoogleCalendarClient
>;
