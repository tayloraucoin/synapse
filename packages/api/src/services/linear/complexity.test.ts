import { describe, expect, it } from "vitest";
import { LINEAR_QUERY_CAP, linearQueryComplexity } from "./complexity";
import { ASSIGNED_ISSUES, ISSUES_BY_ID, TEAM_STATES } from "./documents";

/**
 * USE-101 C5: each query document's cost by Linear's rule (a property 0.1,
 * an object 1, a connection its children times its page size) stays under
 * the 10,000 points one query may cost.
 */

describe("the documents' complexity (C-USE-101-5)", () => {
  it("counts by Linear's rule", () => {
    // 2 properties; an object of 2; a connection of 10 nodes of 3.
    expect(
      linearQueryComplexity(
        "query { a b c { d e } f(first: 10) { nodes { g h i } } }",
      ),
    ).toBe(0.2 + (1 + 0.2) + (1 + 10 * (1 + 0.3)));
  });

  it("expands a fragment where it is spread", () => {
    expect(
      linearQueryComplexity(
        "query Q($x: String) { a(first: 2, after: $x) { ...F } }\nfragment F on A { b c }",
      ),
    ).toBe(1 + 2 * 0.2);
  });

  it.each([
    ["AssignedIssues", ASSIGNED_ISSUES],
    ["IssuesById", ISSUES_BY_ID],
    ["TeamStates", TEAM_STATES],
  ])("%s stays under 10,000 points", (_name, document) => {
    const cost = linearQueryComplexity(document);
    expect(cost).toBeGreaterThan(0);
    expect(cost).toBeLessThan(LINEAR_QUERY_CAP);
  });
});
