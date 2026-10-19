import { describe, expect, it } from "vitest";
import { z } from "zod";
import * as google from "./google";
import * as linear from "./linear";
import { editBlockItemInput, slotUpdateInput } from "./planner";
import { clientOrderInput, editWorkItemInput } from "./work";

/** USE-32's criteria, one `describe` each (the contract's C1 to C3). */

const ID = "5b0f7d0e-3c1a-4f7b-9a3e-0d6c2b1e8f40";
const ID2 = "9c2e4a61-7b3d-4e8f-a1c5-2f6d8b0e4a73";

function messages(result: z.SafeParseReturnType<unknown, unknown>) {
  return result.success ? [] : result.error.issues.map((i) => i.message);
}

/** Every object key a schema can carry, at any depth. */
function keysOf(
  schema: z.ZodTypeAny,
  seen = new Set<z.ZodTypeAny>(),
): string[] {
  if (seen.has(schema)) return [];
  seen.add(schema);
  const def = schema._def as Record<string, unknown>;
  if (schema instanceof z.ZodObject) {
    return Object.entries(schema.shape as Record<string, z.ZodTypeAny>).flatMap(
      ([key, inner]) => [key, ...keysOf(inner, seen)],
    );
  }
  const inner = [
    def.schema,
    def.innerType,
    def.type,
    def.left,
    def.right,
    ...((def.options as z.ZodTypeAny[] | undefined) ?? []),
  ].filter((part): part is z.ZodTypeAny => part instanceof z.ZodType);
  return inner.flatMap((part) => keysOf(part, seen));
}

const exported: [string, z.ZodTypeAny][] = [];
for (const [name, value] of Object.entries({ ...linear, ...google })) {
  if (value instanceof z.ZodType) exported.push([name, value]);
}

describe("C1: no exported Linear or Google schema has a token, secret or refresh key, at any depth", () => {
  it("walks a real set of schemas", () => {
    expect(exported.length).toBeGreaterThanOrEqual(15);
    expect(keysOf(linear.linearSnapshotPayload)).toContain("assignedToMe");
  });

  it.each(exported)("%s", (_name, schema) => {
    const banned = keysOf(schema).filter((key) =>
      /token|secret|refresh/i.test(key),
    );
    expect(banned).toEqual([]);
  });

  it("drops a token sent on a connection row", () => {
    const parsed = linear.linearConnectionView.parse({
      id: ID,
      organizationName: "Lighthouse",
      urlKey: "lighthouse",
      logoUrl: null,
      clientId: null,
      perProject: true,
      lastSyncedAt: null,
      lastSyncError: null,
      accessToken: "ciphertext",
      refreshToken: "ciphertext",
    });
    expect(Object.keys(parsed)).not.toContain("accessToken");
    expect(Object.keys(parsed)).not.toContain("refreshToken");
  });
});

describe("C2: the edit inputs refuse what 0012 refuses, in the UX's words", () => {
  it("slotUpdateInput takes USE-16's fields and USE-32's beside them", () => {
    const parsed = slotUpdateInput.parse({
      id: ID,
      doneAt: "2026-10-13T09:00:00.000Z",
      tookMin: 25,
      sortOrder: 2,
      skipped: false,
      blockId: ID2,
      tier: "primary",
      sessions: "all",
      onDate: "2026-10-14",
      lengthMin: 45,
    });
    expect(parsed).toMatchObject({
      tier: "primary",
      sessions: "all",
      onDate: "2026-10-14",
      lengthMin: 45,
    });
    expect(slotUpdateInput.safeParse({ id: ID, doneAt: null }).success).toBe(
      true,
    );
  });

  it("slotUpdateInput refuses a sessions choice with no tier", () => {
    expect(
      messages(slotUpdateInput.safeParse({ id: ID, sessions: "this" })),
    ).toEqual(["Choose a tier to move the sessions to."]);
    expect(
      messages(
        slotUpdateInput.safeParse({ id: ID, sessions: "all", tier: null }),
      ),
    ).toEqual(["Choose a tier to move the sessions to."]);
  });

  it("slotUpdateInput refuses what 0012's slot checks refuse", () => {
    expect(slotUpdateInput.safeParse({ id: ID, tookMin: -1 }).success).toBe(
      false,
    );
    expect(slotUpdateInput.safeParse({ id: ID, lengthMin: 0 }).success).toBe(
      false,
    );
  });

  it("editWorkItemInput refuses a shortest length above the longest", () => {
    expect(
      messages(
        editWorkItemInput.safeParse({
          id: ID,
          lengthMinMin: 90,
          lengthMaxMin: 60,
        }),
      ),
    ).toEqual(["The longest is at least the shortest."]);
    expect(
      editWorkItemInput.safeParse({ id: ID, lengthMinMin: 90 }).success,
    ).toBe(true);
    expect(
      messages(editWorkItemInput.safeParse({ id: ID, title: " " })),
    ).toEqual(["Name needed"]);
  });

  it("editBlockItemInput refuses a transition with its time or length cleared", () => {
    expect(
      messages(
        editBlockItemInput.safeParse({
          id: ID,
          isTransition: true,
          lengthMin: null,
        }),
      ),
    ).toEqual(["A transition needs a start and a length."]);
    expect(
      editBlockItemInput.safeParse({ id: ID, title: "Walk" }).success,
    ).toBe(true);
  });

  it("clientOrderInput takes each client once", () => {
    expect(messages(clientOrderInput.safeParse({ ids: [ID, ID] }))).toEqual([
      "Each client once.",
    ]);
  });

  it("linearIssueWriteInput takes exactly one change", () => {
    expect(
      linear.linearIssueWriteInput.safeParse({ workItemId: ID, estimate: 3 })
        .success,
    ).toBe(true);
    expect(
      linear.linearIssueWriteInput.safeParse({
        workItemId: ID,
        description: null,
      }).success,
    ).toBe(true);
    expect(
      messages(linear.linearIssueWriteInput.safeParse({ workItemId: ID })),
    ).toEqual(["Change one thing at a time."]);
    expect(
      messages(
        linear.linearIssueWriteInput.safeParse({
          workItemId: ID,
          stateId: "s",
          priority: 1,
        }),
      ),
    ).toEqual(["Change one thing at a time."]);
  });
});

const issue = {
  id: "issue-1",
  identifier: "KES-42",
  title: "Portal sign-in",
  description: null,
  url: "https://linear.app/lighthouse/issue/KES-42",
  stateId: "progress",
  priority: 1,
  estimate: null,
  dueDate: null,
  labels: [{ name: "Bug", color: "#eb5757" }],
  projectId: null,
  teamId: "lh",
  parentId: null,
  assignedToMe: true,
};

const states = linear.LINEAR_STATE_TYPES.map((type, index) => ({
  id: `s-${type}`,
  name: type,
  type,
  position: index,
  color: "#95a2b3",
  teamId: "lh",
}));

const payload = {
  issues: [issue],
  subIssues: [],
  teams: [{ id: "lh", key: "KES", name: "Kestrel", icon: null }],
  projects: [{ id: "p", name: "Portal", icon: null, color: "#5e6ad2" }],
  states,
};

describe("C3: Linear's payload is parsed, never trusted", () => {
  it("strips an unknown field, at the top and inside an issue", () => {
    const parsed = linear.linearSnapshotPayload.parse({
      ...payload,
      cursor: "abc",
      issues: [{ ...issue, sortOrder: -12.5, team: { id: "lh" } }],
    });
    expect(parsed).not.toHaveProperty("cursor");
    expect(parsed.issues[0]).not.toHaveProperty("sortOrder");
    expect(parsed.issues[0]).not.toHaveProperty("team");
  });

  it.each(["identifier", "stateId"] as const)(
    "refuses an issue with no %s",
    (key) => {
      const broken: Record<string, unknown> = { ...issue };
      delete broken[key];
      expect(
        linear.linearSnapshotPayload.safeParse({ ...payload, issues: [broken] })
          .success,
      ).toBe(false);
    },
  );

  it("accepts the seven state types, triage and duplicate among them", () => {
    const parsed = linear.linearSnapshotPayload.parse(payload);
    expect(parsed.states.map((state) => state.type)).toEqual([
      "triage",
      "backlog",
      "unstarted",
      "started",
      "completed",
      "canceled",
      "duplicate",
    ]);
    expect(
      linear.linearWorkflowStateSchema.safeParse({
        ...states[0],
        type: "archived",
      }).success,
    ).toBe(false);
  });

  it("refuses a priority outside 0 to 4", () => {
    expect(
      linear.linearIssueSchema.safeParse({ ...issue, priority: 5 }).success,
    ).toBe(false);
  });
});
