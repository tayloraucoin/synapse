---
size: medium
objective: "Taylor connects Google accounts read-only, turns each calendar on or off, and the week's events show on Today and the Week as bands, dashed when not answered and hidden when declined"
slice_type: "a read-only third-party integration with its own OAuth; risks a broader scope than ruled, a refresh token that dies after seven days, an event's answer misread, and a token outside the encrypted columns"
non_negotiables:
  - "Scopes are the narrower read-only pair only (D-USE-116): calendar.calendarlist.readonly and calendar.events.readonly; nothing is ever written to Google."
  - "Google's own OAuth client, separate from sign-in; never the sign-in's scopes and never include_granted_scopes."
  - "The refresh token is stored through token-crypto (USE-100) and read only by services/google; no output schema carries it."
  - "Payloads are parsed by zod in @syn/validators; a missing required field fails the sync with last_sync_error."
  - "Accepted shows as a band, tentative or not answered as a dashed band with Add to day, declined and cancelled are hidden."
  - "The callback checks state and PKCE as USE-100's does; rows are written inside ctx.rls.execute()."
devs_call: "The account's label (recommended: the primary calendar's summary, which needs no extra scope); the event payload's trimmed shape; whether working-location and birthday events are left out (recommended)."
cites:
  - "specs/web/epics/USE-daily-use/ux/dev-notes/google-calendar.md"
  - "D-USE-82"
truth_files: "none: behaviour is the ledger's; the bands are USE-109's, built on fixtures first"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/api/src/services/google/"
  - "packages/api/src/routers/google.ts"
  - "packages/api/src/routers/connections.ts"
  - "packages/api/src/services/planner/"
  - "packages/api/src/root.ts"
  - "packages/api/src/env.ts"
  - "packages/validators/src/google.ts"
  - "apps/web/app/api/integrations/google/"
  - "apps/web/lib/data/live/"
  - ".env.example"
depends_on:
  - "USE-100"
  - "USE-91"
  - "USE-109"
out_of_scope:
  - "Push for an event's start (D-USE-92: none)"
  - "Any write to Google, events.watch and syncToken: out of bounds"
criteria:
  - id: C1
    statement: "The authorize URL carries exactly the two read-only scopes, access_type=offline, prompt=consent select_account, state and an S256 code challenge"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "The event schema parses a recorded events.list response kept beside the test; the self attendee's accepted maps to a band, tentative and needsAction to a dashed band, declined and cancelled to hidden, and an event with no attendees to a band"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "An all-day event (start.date) and a timed one (start.dateTime) both land on the right date in the account's zone, with end exclusive"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "invalid_grant on refresh sets the account's last_sync_error (the Reconnect state) and keeps its last snapshot"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "planner.today and planner.week include enabled calendars' events for their dates; a calendar turned off drops out on the next read"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "Taylor connects a Google account, sees this week's meetings on Today and the Week, and a declined one is not shown"
    evidence: manual
    reason: "needs the Google Cloud client, consent screen In production, and 0016 on staging, all Taylor's"
  - id: C7
    statement: "The web app and the API type-check"
    evidence: check
    command: "yarn check-types"
id: USE-103
---

# Contract — google-calendar

## Build notes

The fixture's `writeCalendar`; the Google side of `readConnections`; and the events that the fixture's week and day reads carry. 0016 (USE-100) made `google_accounts`, `google_calendars` and `google_event_snapshots`.

- **Decisions that apply:**
  - D-USE-116: the narrower read-only pair, never the whole read-only calendar scope.
  - D-USE-82 and the dev note: several calendars, each on or off. An answered-yes event is a band; maybe or not answered is a dashed band with Add to day; no is hidden.
  - D-USE-92: no push for an event's start.
- **Facts** (copied from the platform research, checked 2026-10-13):
  - **Client:** a dedicated Web application OAuth client, best in its own Google Cloud project (a revoke removes every scope granted to a project). Taylor creates it.
    - Publishing status must be "In production": in Testing, refresh tokens expire 7 days after consent.
    - Calendar is a sensitive scope. Unverified, a person sees a warning and clicks through, which is fine for under 100 users. Record the console's label for the pair in the commit [NOT VERIFIED].
  - **Authorize:** `https://accounts.google.com/o/oauth2/v2/auth` with `client_id`, an exact `redirect_uri`, `response_type=code`, a space-delimited `scope` (`https://www.googleapis.com/auth/calendar.calendarlist.readonly https://www.googleapis.com/auth/calendar.events.readonly`), `access_type=offline`, `prompt=consent select_account`, `state`, and PKCE. Without `prompt=consent`, the refresh token comes only on the first authorization.
  - **Token:** `https://oauth2.googleapis.com/token`. Store `refresh_token_expires_in`, if present.
    - Loss: 100 refresh tokens per account per client (the oldest dies silently); six months unused; revocation. Any of these returns `invalid_grant`, which means Reconnect.
  - **Revoke:** `https://oauth2.googleapis.com/revoke` with the token (revoking the access token revokes the refresh token), then delete the row.
  - **Calendars:** `calendarList.list`. Keep `id`, `summaryOverride ?? summary`, `backgroundColor`, `primary`, `accessRole`, `hidden`, `deleted`. `enabled` defaults to `selected`.
  - **Events:** `GET https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events` with:
    - `timeMin` and `timeMax`, the week's edges in RFC 3339 with offset (an exclusive end bound and start bound respectively);
    - `singleEvents=true`, `orderBy=startTime`, `maxAttendees=1` (only the self row), `timeZone`;
    - `nextPageToken` followed; `maxResults` defaults to 250 and caps at 2,500.
    - No `syncToken`: it cannot combine with time bounds. `status` `cancelled` means deleted.
  - **Answer:** `attendees[]` where `self=true`, `responseStatus` in `accepted | tentative | needsAction | declined`. With no attendees, or `organizer.self`, treat it as accepted (judgment).
  - **Quotas:** 600 requests a minute per user. On 403 `usageLimits`, `userRateLimitExceeded`, or 403/429 `rateLimitExceeded`, back off exponentially (`min(2^n + jitter, 32–64 s)`).
- **Approach:** `services/google/` (`oauth.ts`, `sync.ts`, `client.ts`). Sync per account and week into `google_event_snapshots`, on the same cadence as Linear (focus after 2 minutes, every 5 minutes visible, Sync now). The day and week reads (USE-91) join the snapshot's events for enabled calendars. Routes under `apps/web/app/api/integrations/google/{start,callback}`. `google.toggleCalendar` and `google.disconnect`. Env: `GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET`.
- **QA note:** this ticket stores a token below Q3. C7 kept Q3 to two tickets; the crypto it uses is USE-100's, reviewed there. Flagged once at the gate.
- **Model:** Opus 5.5 at medium. A smaller model asks for `calendar.readonly` and reuses the sign-in client.
