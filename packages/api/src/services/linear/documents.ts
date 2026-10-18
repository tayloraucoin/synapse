/**
 * The sync's three GraphQL documents (USE-101), each selection checked
 * against Linear's published SDK schema on 2026-10-17. The page sizes keep
 * every document under Linear's 10,000-point cap for one query
 * (`complexity.test.ts`, C5); each sync is a full snapshot, since Linear
 * documents no `updatedAt` filter.
 *
 * - `ASSIGNED_ISSUES`: Taylor's open assigned issues (closed ones are read
 *   by id), each with its first page of sub-issues.
 * - `ISSUES_BY_ID`: the issues placed in Synapse, read by id whatever their
 *   state, so a placed issue closed in Linear is seen (D-USE-115).
 * - `TEAM_STATES`: every team and its workflow states, for the status sheet
 *   and the fill (C-USE-linear-status-1).
 */

export const ISSUES_PAGE = 25;
export const CHILDREN_PAGE = 10;
export const LABELS_PAGE = 5;
export const TEAMS_PAGE = 25;
export const STATES_PAGE = 50;

/** D-USE-115: these state types are closed. */
export const CLOSED_STATE_TYPES = ["completed", "canceled", "duplicate"];

const ISSUE_FIELDS = `
fragment IssueFields on Issue {
  id
  identifier
  title
  description
  url
  priority
  estimate
  dueDate
  state { id }
  team { id }
  project { id name icon color }
  parent { id }
  assignee { id }
  labels(first: ${LABELS_PAGE}) { nodes { name color } }
}`;

export const ASSIGNED_ISSUES = `
query AssignedIssues($after: String) {
  viewer {
    id
    assignedIssues(
      first: ${ISSUES_PAGE}
      after: $after
      filter: { state: { type: { nin: ["completed", "canceled", "duplicate"] } } }
    ) {
      nodes {
        ...IssueFields
        children(first: ${CHILDREN_PAGE}) { nodes { ...IssueFields } }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
}
${ISSUE_FIELDS}`;

export const ISSUES_BY_ID = `
query IssuesById($ids: [ID!]!, $after: String) {
  viewer { id }
  issues(first: ${ISSUES_PAGE}, after: $after, filter: { id: { in: $ids } }) {
    nodes {
      ...IssueFields
      children(first: ${CHILDREN_PAGE}) { nodes { ...IssueFields } }
    }
    pageInfo { hasNextPage endCursor }
  }
}
${ISSUE_FIELDS}`;

export const TEAM_STATES = `
query TeamStates($after: String) {
  teams(first: ${TEAMS_PAGE}, after: $after) {
    nodes {
      id
      key
      name
      icon
      states(first: ${STATES_PAGE}) { nodes { id name type position color } }
    }
    pageInfo { hasNextPage endCursor }
  }
}`;
