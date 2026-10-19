import {
  googleAccountView,
  googleCalendarView,
  linearConnectionView,
  type GoogleAccountView,
  type GoogleCalendarView,
} from "@syn/validators";
import type { FixtureRecords } from "../records";
import { noIntegrations } from "./records";
import { integrationId } from "./workspaces";

/**
 * Settings › Connections' Add rows on fixtures (USE-85): a connect that
 * stands for Google's or Linear's sign-in coming back. No OAuth, no
 * redirect, nothing written to either: the new account's calendars join
 * each off (connecting.md), a new workspace joins "Connected" with an empty
 * snapshot until its first sync. The scopes Google would be asked for are
 * named here, read-only (D-USE-116); the connect ticket asks for them.
 */

export type ConnectKind = "google" | "linear";

/** What the Google connect would ask for, and nothing more (D-USE-116). */
export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
  "https://www.googleapis.com/auth/calendar.events.readonly",
] as const;

/** The calendar list alone, so it can fail apart from Linear (error.md). */
export interface GoogleCalendarsRecords {
  accounts: GoogleAccountView[];
  calendars: GoogleCalendarView[];
}

const NEW_ACCOUNTS = [
  ["work@example.com", "Work [placeholder]", "Work [placeholder]"],
  ["studio@example.com", "Studio [placeholder]", "Studio [placeholder]"],
] as const;

const NEW_WORKSPACES = [
  ["Studio [placeholder]", "studio"],
  ["Harbor [placeholder]", "harbor"],
] as const;

export function readGoogleCalendars(
  records: FixtureRecords,
): GoogleCalendarsRecords {
  const data = records.integrations ?? noIntegrations();
  return structuredClone({
    accounts: data.googleAccounts,
    calendars: data.googleCalendars,
  });
}

/** The connect coming back: one account or one workspace, added. */
export function connectFixture(
  records: FixtureRecords,
  kind: ConnectKind,
  at: string,
): void {
  const data = (records.integrations ??= noIntegrations());
  if (kind === "google") {
    const n = data.googleAccounts.length;
    const [email, label, calendar] = NEW_ACCOUNTS[n % NEW_ACCOUNTS.length]!;
    const account = googleAccountView.parse({
      id: integrationId(2, 10 + n),
      email,
      label,
    });
    data.googleAccounts.push(account);
    data.googleCalendars.push(
      googleCalendarView.parse({
        id: integrationId(3, 10 + data.googleCalendars.length),
        accountId: account.id,
        name: calendar,
        color: "#7986cb",
        primary: true,
        enabled: false,
      }),
    );
    return;
  }
  const n = data.linear.length;
  const [organizationName, urlKey] = NEW_WORKSPACES[n % NEW_WORKSPACES.length]!;
  data.linear.push({
    connection: linearConnectionView.parse({
      id: integrationId(1, 10 + n),
      organizationName,
      urlKey,
      logoUrl: null,
      clientId: null,
      perProject: false,
      lastSyncedAt: at,
      lastSyncError: null,
    }),
    snapshot: {
      issues: [],
      subIssues: [],
      teams: [],
      projects: [],
      states: [],
    },
  });
}
