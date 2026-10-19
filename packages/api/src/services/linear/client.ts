/**
 * Linear's GraphQL API, read-only (USE-101): the three documents in
 * `documents.ts`, every page followed on `endCursor`, every page's `data`
 * parsed by `@syn/validators` before it is returned. The one write,
 * `updateIssue`, is the outbox's (USE-102).
 *
 * RATE LIMITS. Over a limit Linear answers with an error coded
 * `RATELIMITED` (HTTP 400). The client never retries it: it throws
 * `LinearRateLimited` with the reset time from the `X-RateLimit-*-Reset`
 * headers (UTC epoch ms), and the sync waits until then.
 */
import type { z } from "zod";
import {
  linearAssignedIssuesData,
  linearIssuesByIdData,
  linearIssueUpdateData,
  linearTeamStatesData,
  type LinearApiIssueWithChildren,
} from "@syn/validators";
import {
  ASSIGNED_ISSUES,
  ISSUE_UPDATE,
  ISSUES_BY_ID,
  ISSUES_PAGE,
  TEAM_STATES,
} from "./documents";
import { LINEAR_GRAPHQL_URL, type FetchLike } from "./oauth";

/** With no reset header, wait out Linear's hourly window [ASSUMPTION]. */
const DEFAULT_RESET_MS = 60 * 60_000;

const RESET_HEADERS = [
  "X-RateLimit-Requests-Reset",
  "X-RateLimit-Complexity-Reset",
  "X-RateLimit-Endpoint-Requests-Reset",
];

export class LinearRateLimited extends Error {
  readonly resetAt: Date;
  constructor(resetAt: Date) {
    super(`Linear rate limited the call until ${resetAt.toISOString()}.`);
    this.name = "LinearRateLimited";
    this.resetAt = resetAt;
  }
}

/** Linear refused the access token: refresh once and try again. */
export class LinearUnauthorized extends Error {
  constructor() {
    super("Linear refused the access token.");
    this.name = "LinearUnauthorized";
  }
}

/** A call that did not succeed; the status and Linear's error code, never a body. */
export class LinearApiError extends Error {
  readonly status: number;
  readonly code: string | null;
  constructor(status: number, code: string | null) {
    super(`Linear answered ${status}${code ? ` (${code})` : ""}.`);
    this.name = "LinearApiError";
    this.status = status;
    this.code = code;
  }
}

/** A response that does not match the schema: a field the sync needs is missing. */
export class LinearPayloadError extends Error {
  constructor(what: string) {
    super(`Linear's ${what} did not parse.`);
    this.name = "LinearPayloadError";
  }
}

interface GraphqlBody {
  data?: unknown;
  errors?: { extensions?: { code?: unknown } }[];
}

function codesOf(body: GraphqlBody | null): string[] {
  return (body?.errors ?? [])
    .map((error) => error.extensions?.code)
    .filter((code): code is string => typeof code === "string");
}

function resetOf(headers: Headers, now: Date): Date {
  const resets = RESET_HEADERS.map((name) => Number(headers.get(name))).filter(
    (value) => Number.isFinite(value) && value > 0,
  );
  return new Date(
    resets.length > 0 ? Math.max(...resets) : now.getTime() + DEFAULT_RESET_MS,
  );
}

export interface LinearClientDeps {
  fetch: FetchLike;
  now?: () => Date;
}

export function createLinearClient(
  accessToken: string,
  deps: LinearClientDeps,
) {
  const now = deps.now ?? (() => new Date());

  async function request<S extends z.ZodTypeAny>(
    query: string,
    variables: Record<string, unknown>,
    schema: S,
    what: string,
  ): Promise<z.output<S>> {
    const response = await deps.fetch(LINEAR_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query, variables }),
    });
    const body = (await response
      .json()
      .catch(() => null)) as GraphqlBody | null;
    const codes = codesOf(body);
    if (codes.includes("RATELIMITED")) {
      throw new LinearRateLimited(resetOf(response.headers, now()));
    }
    if (response.status === 401 || codes.includes("AUTHENTICATION_ERROR")) {
      throw new LinearUnauthorized();
    }
    if (!response.ok || (body?.errors?.length ?? 0) > 0) {
      throw new LinearApiError(response.status, codes[0] ?? null);
    }
    const parsed = schema.safeParse(body?.data);
    if (!parsed.success) throw new LinearPayloadError(what);
    return parsed.data;
  }

  return {
    /** Every open issue assigned to Taylor, and Taylor's Linear user id. */
    async assignedIssues(): Promise<{
      viewerId: string;
      issues: LinearApiIssueWithChildren[];
    }> {
      const issues: LinearApiIssueWithChildren[] = [];
      let viewerId = "";
      let after: string | null = null;
      do {
        const data: z.output<typeof linearAssignedIssuesData> = await request(
          ASSIGNED_ISSUES,
          { after },
          linearAssignedIssuesData,
          "assigned issues",
        );
        viewerId = data.viewer.id;
        issues.push(...data.viewer.assignedIssues.nodes);
        const page = data.viewer.assignedIssues.pageInfo;
        after = page.hasNextPage ? page.endCursor : null;
      } while (after);
      return { viewerId, issues };
    },

    /** The named issues whatever their state, a page of ids at a time. */
    async issuesById(
      ids: readonly string[],
    ): Promise<LinearApiIssueWithChildren[]> {
      const issues: LinearApiIssueWithChildren[] = [];
      for (let start = 0; start < ids.length; start += ISSUES_PAGE) {
        const chunk = ids.slice(start, start + ISSUES_PAGE);
        let after: string | null = null;
        do {
          const data: z.output<typeof linearIssuesByIdData> = await request(
            ISSUES_BY_ID,
            { ids: chunk, after },
            linearIssuesByIdData,
            "placed issues",
          );
          issues.push(...data.issues.nodes);
          after = data.issues.pageInfo.hasNextPage
            ? data.issues.pageInfo.endCursor
            : null;
        } while (after);
      }
      return issues;
    },

    /** Every team the grant can see, with its workflow states. */
    async teamStates() {
      const teams: z.output<typeof linearTeamStatesData>["teams"]["nodes"] = [];
      let after: string | null = null;
      do {
        const data: z.output<typeof linearTeamStatesData> = await request(
          TEAM_STATES,
          { after },
          linearTeamStatesData,
          "team states",
        );
        teams.push(...data.teams.nodes);
        after = data.teams.pageInfo.hasNextPage
          ? data.teams.pageInfo.endCursor
          : null;
      } while (after);
      return teams;
    },

    /**
     * One outbox row's change on one issue (USE-102). `success: false` is a
     * refusal: Linear documents no code for it.
     */
    async updateIssue(id: string, input: LinearIssueUpdate): Promise<void> {
      const data = await request(
        ISSUE_UPDATE,
        { id, input },
        linearIssueUpdateData,
        "issue update",
      );
      if (!data.issueUpdate.success) throw new LinearApiError(200, null);
    },
  };
}

/** The fields the outbox writes (D-USE-113), as `IssueUpdateInput` names them. */
export interface LinearIssueUpdate {
  stateId?: string;
  priority?: number;
  description?: string | null;
  estimate?: number | null;
}

export type LinearClient = ReturnType<typeof createLinearClient>;
