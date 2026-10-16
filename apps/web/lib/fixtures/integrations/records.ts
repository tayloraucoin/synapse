import type {
  GoogleAccountView,
  GoogleCalendarView,
  LinearConnectionView,
  LinearIssueWriteInput,
  LinearProjectClientInput,
  LinearSnapshotPayload,
  LinearWriteView,
} from "@syn/validators";
import type { GoogleDayEvent } from "@/lib/data/google-bands";

/**
 * What the fixture server holds for Linear and Google (USE-56): the rows the
 * integration routers will read from. No credential has a field here, as
 * none has one on a view; the sync and the sender are wave 3's.
 */

/** One connected workspace and the snapshot its last sync stored. */
export interface LinearWorkspaceRecords {
  connection: LinearConnectionView;
  snapshot: LinearSnapshotPayload;
}

/**
 * One `linear_writes` row as the server keeps it: the view's columns, the
 * issue it goes to and what it sends. Reads return the view alone.
 */
export interface LinearOutboxRow extends LinearWriteView {
  connectionId: string;
  issueId: string;
  change: Omit<LinearIssueWriteInput, "workItemId">;
  /** How many times the sender has tried it. */
  sends: number;
}

export interface IntegrationRecords {
  linear: LinearWorkspaceRecords[];
  /** `linear_project_clients`: a project's client in a per-project workspace. */
  projectClients: LinearProjectClientInput[];
  outbox: LinearOutboxRow[];
  /** `work_items.linear_prev_state_id`: the state a check moved the issue from. */
  prevStateIds: Record<string, string>;
  googleAccounts: GoogleAccountView[];
  googleCalendars: GoogleCalendarView[];
  /** The calendars' events with the person's answer (USE-109); unset, none. */
  googleEvents?: GoogleDayEvent[];
}

export function noIntegrations(): IntegrationRecords {
  return {
    linear: [],
    projectClients: [],
    outbox: [],
    prevStateIds: {},
    googleAccounts: [],
    googleCalendars: [],
  };
}
