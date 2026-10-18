---
size: small
objective: "The new shell shows SY-02's update line, A new version is ready. with Reload, when a new build's worker is waiting"
slice_type: "a status line mounted in the rebuilt shell; risks a line that never clears and a reload with no tap"
non_negotiables:
  - "Never a reload without the tap (lib/pwa/update-ready.ts)."
  - "The line has no dismiss: a new version is a fact (cross-cutting §5.4)."
  - "No second person, nothing red on the tabs (product-rules.md)."
devs_call: "Where the line sits in AppShell, and which of the legacy status-line sources come back with it."
cites:
  - "apps/web/_legacy/components/page-frame/shell-status-line.tsx"
truth_files:
  - "specs/web/ux/_global/system-states.md"
qa: Q1
reviewers: []
focus: []
operator_review: true
planned_paths:
  - "apps/web/app/(shell)/_components/"
depends_on:
  - "USE-107"
out_of_scope:
  - "The service worker and its cache: USE-107"
criteria:
  - id: C1
    statement: "With a new build's worker waiting, the shell shows A new version is ready. and Reload; the tap reloads into the new build"
    evidence: manual
    reason: "a service-worker journey; recorded through test:e2e once the harness loads"
  - id: C2
    statement: "The line's state is reachable by ?state= (canon C-P08)"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-114-update-line-in-shell/evidence/update-line-402.png"
  - id: C3
    statement: Taylor has looked this ticket over and approved it.
    evidence: manual
    reason: "operator_review: true; the builder defers it with what to look at"
id: USE-114
---

# Contract — update-line-in-shell

## Build notes

Found building USE-107 (2026-10-17). `lib/pwa/update-ready.ts` still publishes the waiting worker, but the only reader, `shell-status-line.tsx`, moved to `_legacy/` with the old app in USE-1, so nothing in the new shell renders the line. With USE-107, each build registers `/sw.js?build=<id>`, so the waiting worker now arrives on every deploy. Until this ships, the new worker activates only when every tab is closed. The copy already exists: `@syn/ui` status-line copy, `update: { text: "A new version is ready.", actionLabel: "Reload" }`. Placing a line in the shell is a surface decision, so Taylor looks at it.
