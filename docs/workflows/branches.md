---
title: "Branches, in plain language"
description: "Read when the prompt builder asks whether work should stay on the current branch or get its own, or when someone who does not write code needs to know what a branch, a pull request and a merge mean here."
layer: workflows
status: draft
thread: PR-19
role: Usher
date: 2026-10-05
last_reviewed: 2026-10-07
supersedes:
load_when: on request
---

# Branches, in plain language

> **In one line:** by default all work lands on the branch you already have open. Ask for a separate branch only when you want that work reviewed, shipped or thrown away on its own.

## The three words

- **Branch.** A named copy of the project where changes pile up without touching anyone else's copy. `main` is the copy that ships.
- **Pull request (PR).** A request to fold one branch into another, shown as a page listing every change, where people can comment before it goes in.
- **Merge.** Folding the branch in. After a merge, the changes are part of the other branch.

## The question the builder asks

| Choice                              | What happens                                                                                                            | Pick it when                                                                                              |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Current branch** (default)        | The thread builds where you are. Several threads can work there at once. Nothing is created, switched or merged.        | Almost always. The work belongs with what you are already doing.                                          |
| **Its own branch and pull request** | The thread makes a separate folder and a branch named `agent/<id>`, builds only there, and reports the branch as ready. | Someone else must review it; it should ship separately; it is an experiment you may discard; it is risky. |

You can also ask later, in any build thread: say "on its own branch" before it starts, or "merge it back" when you want a separate branch folded into the one you have open.

## What you do, and what the agent does

| Step                         | Who       | Notes                                                                                    |
| ---------------------------- | --------- | ---------------------------------------------------------------------------------------- |
| Build and commit             | The agent | Every commit is labelled with the work's id, so the history reads as a list of outcomes. |
| Create a separate branch     | The agent | Only when you asked for one.                                                             |
| Push (send to GitHub)        | **You**   | Agents never push. The closing report tells you when a branch is ready.                  |
| Open the pull request, merge | **You**   | Reading the PR page is your last look before it ships.                                   |
| Fold a side branch back      | The agent | When you say "merge it back".                                                            |

If you do not use GitHub yourself, ask whoever owns the repository to push and merge for you; the closing report gives them everything they need.

## Running several threads at once

Threads on the current branch share one working copy. Each one commits only its own files and checks only its own files when it stops. When two threads need to change the same file, the second one waits or says so in its report. If that happens often for a piece of work, give that work its own branch.

**When a thread ends.** A thread remembers everything said in it, and every step it takes re-reads that whole memory, so a long thread costs more for each step than a short one. So every ticket gets a thread of its own, and so does its hardening: you say "build <id>" in one thread and, after you have looked at it, "harden <id>" in another; and side work with many steps (a dry run of a guide, a cold rehearsal, a long review) gets its own thread rather than running inside a build. Nothing is lost between threads: the ticket's folder holds the contract, the proofs and the notes, and a new thread picks up from there when you name the ticket.

**The size line.** When a thread stops, the message it ends with says how big it has grown, as `context about N k tokens`. Under 200k, carry on in it as usual. Over 200k, treat its report as its last word: do not come back to it after a break, and start a fresh thread for the next piece of work, naming the ticket to continue. Reopening a thread that size after a pause costs as much as several steps of real work before anything happens.

## When something looks wrong

- **"My change is not on the site."** It is on a branch that has not been merged, or not been pushed. Ask a thread: "where is `<id>` and what is left before it ships?"
- **"Two threads changed the same thing."** Tell either thread; it reconciles the two and reports what it kept.
- **"I want to undo this."** Say which work to undo. On its own branch, the branch is simply not merged. On a shared branch, the thread reverts that work's commits.
