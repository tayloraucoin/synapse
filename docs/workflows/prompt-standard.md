---
title: "The prompt standard: what every printed prompt carries"
description: "Read before writing or checking any prompt that opens a thread, by the prompt builder, a stage file or a person: the checklist a prompt must pass, the forecast printed with it, and the kickoff block for build threads."
layer: workflows
status: draft
thread: PR-19
role: Usher
date: 2026-10-05
last_reviewed: 2026-10-07
supersedes:
load_when: on request
---

# The prompt standard

> **In one line:** a prompt is the whole brief for one thread. It says where it runs and on which model, who plays, what is attached and why, what it must produce, how carefully it is checked, how often it stops for the operator, and what is not wanted. Prompts are printed in the thread and never saved as files.

## The checklist

A prompt passes when every row holds. The builder and every stage check before printing; they print only failing rows with the fix applied, or "Standard: all rows pass".

| #   | Item              | What passes                                                                                                                                                                                            |
| --- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Venue and model   | The first line is `Venue: Claude Code, in <repo>` or `Venue: Claude research thread`, then the minimum and recommended model, the effort, and the failure mode of choosing down. Nothing precedes it.  |
| 2   | Track and stage   | Names the track and the stage this thread runs, by file path.                                                                                                                                          |
| 3   | Role              | Names one lead role by file path and says to read it first. Build threads name no lead role.                                                                                                           |
| 4   | Support           | Names each supporting role and the one function it is consulted for. "Consult, never co-pilot."                                                                                                        |
| 5   | Attached          | Every repo file to read, each with one reason, with exact paths that exist; then the outside attachments the operator said they would add, each with what to take from it.                             |
| 6   | Decision served   | One sentence: what the thread decides or produces, and who acts on it.                                                                                                                                 |
| 7   | The ask           | Numbered steps, each ending in something checkable. Interview stages say "ask every question the output needs, in rounds, each with a recommended answer; nothing invented silently".                  |
| 8   | QA                | The level; the reviewers and what each looks at; every `focus` line. For an epic: the default level, and that each ticket's level is confirmed at the Tickets gate.                                    |
| 9   | Involvement, pace | The involvement the operator chose, with its stopping points named for this work; the pace.                                                                                                            |
| 10  | Branch and ticket | "Current branch" or "on its own branch"; "with a ticket" or "no ticket".                                                                                                                               |
| 11  | Writes            | Exact output paths and the template each comes from; or "nothing is written".                                                                                                                          |
| 12  | Gate and handoff  | What passes the thread (a check by name, or the operator), and what it prints at the end: the next prompt, the closing report, or the findings. Never a file of prompts.                               |
| 13  | Evidence rules    | Verified, secondary or judgment labels; dates on tool behaviour and prices; estimates labelled as estimates; not found is marked, never filled.                                                        |
| 14  | Not wanted        | The three to five things this thread must not do.                                                                                                                                                      |
| 15  | Standing rules    | Open markers are `[ASSUMPTION: …]`, `[NEEDS DECISION]`, `[NEEDS DECISION — BLOCKING]`, `[PROPOSED]`; no emoji; synthetic data in every example; a `docs/research/` file only in Frame, Research or UX. |

## The forecast, printed under the prompt

```
What to expect (estimates, not promises)
- Thread plan: <starts here; then …>
- Effort          <0.0–7.0>  <one line why>
- Wall time       <0.0–7.0>  <about how long, as a range>
- Token cost      <0.0–7.0>  <what drives it: threads, reviewers, model>
- Risk            <0.0–7.0>  <what could go wrong and how it is caught>
- Your attention  <0.0–7.0>  <how many stops, and what each asks of you>
```

Anchors: 1 is a few minutes in one thread; 3 is one build thread of about an hour; 5 is a day's batch across several threads with reviews; 7 is a multi-day epic. Time and cost are guesses from the shape of the work; say what would make them wrong.

## The research block

For each knowledge gap that needs its own thread (the rule is in `prompt-builder.md` §5):

```
This work needs research on <topic>, which the repo does not hold.
Open a Claude research thread on <model>, as <role(s)>, and paste the prompt below.
When it finishes, save the result as <filename> in <directory>.

<the research prompt>
```

## The kickoff block (build threads only)

A build prompt ends with this block, filled in:

```
Kickoff
- Work: <ticket id and folder, with contract.md to read first> | <no ticket: this prompt is the brief>
- Branch: <the operator's current branch | on its own branch>
- QA: <level>; reviewers: <roles, or none>; focus: <named parts, or none>
- Involvement: <autonomous | check in at: … | decide together>
- UX truth: <files to update or create, or none: reason>
- Do not: push; widen settings; switch branches unless told above; commit files that are not this work's
- Done: criteria pass at the level, one yarn verify, the closing report
```

## Loads by stage

| Stage     | Loads, beyond the role                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------- |
| Frame     | brief template; the area's living truth; any earlier epic on the area; at most 2 research files               |
| Research  | the research-note template; the gap, exactly as asked; the sources the gap names                              |
| UX        | canon; the product's design files when they exist; at most 3 references; the area's truth; the research notes |
| Technical | approved UX files; codebase conventions; the tech stack; the reviewer rows in `toolkit.json`                  |
| Tickets   | technical notes; the approved UX files; the contract template; `qa-levels.md`; `yarn status --epic`           |
| Build     | the contract or the prompt; the one cited surface; path rules fire on touch; never a research file            |
