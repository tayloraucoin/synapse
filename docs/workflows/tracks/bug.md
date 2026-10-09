---
title: "Track: bug or issue"
description: "Read when something that worked, or should work, does not: reproduce it, find the cause, fix it, prove the fix, and trace how it got in."
layer: workflows
status: draft
thread: PR-19
role: Usher
date: 2026-10-05
last_reviewed: 2026-10-05
supersedes:
load_when: on request
---

# Bug or issue: something is on fire, or smouldering

> **In one line:** a bug starts from a symptom, not a plan. The thread first proves it can make the problem happen, then finds why, fixes the cause, proves the fix holds, and notes how the bug got past us.

## When it applies

Something behaves differently from what the UX truth, a ticket or plain expectation says. The cause is usually unknown at the start, which is what makes this track different from a one-off: the first half is investigation, and the size of the fix is not known until the cause is.

If the bug is live and hurting customers now, say so first. The thread stops the harm before anything else (turn the feature off, revert the change) and the full write-up follows `docs/runbooks/postmortem/`.

## Stages

| Stage        | What happens                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| 1. Reproduce | Make it happen on demand: the steps, the account or data, the environment. If it cannot be reproduced, say so and stop.   |
| 2. Diagnose  | Find the cause, not the nearest symptom. State it in two sentences with the file and line.                                |
| 3. Fix       | Change the cause. Keep the change as small as the cause allows.                                                           |
| 4. Prove     | A test that fails before the fix and passes after, for logic, data, money and auth. For UI, a capture of the fixed state. |
| 5. Trace     | Which ticket introduced it, and what in that ticket's criteria or review let it through.                                  |

The Fix and Prove stages follow [Build](../stages/build.md).

## Cast and QA

No lead role: the thread investigates and builds. Support by where the bug lives: Warden for auth, secrets or personal data; Mason for data and boundaries; Assay or Threshold for UI and access. The QA level follows where the bug lives, not how small the fix is: a one-line fix in billing is still Q3.

## The builder's own questions for this track

1. What did you see, and what did you expect? Ask for the exact message, a screenshot or a recording as an attachment.
2. Where: which app, page or action, and in which environment (local, staging, live)?
3. How often: every time, sometimes, once? Since when, if known?
4. Who is affected and how badly? **Live and hurting customers now**; **live but tolerable**; **not yet released**; **only seen locally**.
5. After the diagnosis, should the thread **stop and show you the cause before fixing** (recommended at Q3, or when the cause may be large), or **fix it straight away**?
6. Should the thread trace which ticket introduced it? Recommended yes for anything that reached a shared branch.
7. A formal ticket for the fix, or none?

## The trace

1. Find the commits that introduced the faulty lines. Each commit names its ticket.
2. Read that ticket's contract and as-built: was this behaviour a criterion? Was it proven, and how? Was it reviewed, and by whom?
3. Write one line into `docs/runbooks/postmortem/convention-log.md` when the answer points at a convention: a missing criterion type, a QA level set too low, a reviewer who should have been cast, a check that does not exist. That file is what gets read when conventions are next changed.

A bug that points at nothing (a plain mistake, caught and fixed) needs no log line.

## How it ends

The closing report, six lines at most, with the cause in one sentence, the fix, the proof, and the trace result. When the cause turns out to need more than one ticket or a new surface, the thread stops after Diagnose and prints an epic dump for the builder.

## What gets written

The fix and its test. With a ticket: the contract and, at Q2 and Q3, an as-built. A convention-log line when the trace found a gap.
