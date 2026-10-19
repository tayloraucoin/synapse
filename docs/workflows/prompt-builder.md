---
title: "The prompt builder: the front door of every piece of work"
description: "Attach, or run as /tk-prompt, whenever work is about to start: it interviews the operator, settles the track, the cast, the QA level, the pace, the involvement and the branch, then prints the prompt, what to expect, and any research prompts. It saves nothing."
layer: workflows
status: draft
thread: PR-19
role: Usher
date: 2026-10-05
last_reviewed: 2026-10-08
supersedes:
load_when: on request
---

# The prompt builder

> **In one line:** every task starts here.

You describe the work in your own words; the builder asks what it needs to know, up front and all at once, then prints:

- one prompt ready to paste into a new thread;
- a short forecast of what that thread will cost you;
- a prompt for each research thread the work needs.

The questions are asked now so that nobody is asked small questions later.

**How it runs.** Type `/tk-prompt`, or attach this file and say "build the prompt for: …", or simply describe work in a thread that has no ticket yet. The agent reading this file is the builder for that conversation. It writes no file: everything it produces is printed in the thread for the operator to copy.

**Who it serves.** Anyone on the team, technical or not. Every question explains its options in plain language, so that the choice teaches the operator what it means.

---

## 0. Read first

| Read                                                        | Why                                                                        |
| ----------------------------------------------------------- | -------------------------------------------------------------------------- |
| `toolkit.json`                                              | The apps and their prefixes; the reviewer map used as evidence for QA      |
| `specs/_status.md`                                          | What is already in flight, so the dump is routed into it and not beside it |
| [`tracks/README.md`](tracks/README.md), then the track file | The tracks, how to tell them apart, and the chosen track's own questions   |
| [`qa-levels.md`](qa-levels.md)                              | The four levels and how reviewers are chosen                               |
| [`prompt-standard.md`](prompt-standard.md)                  | The checklist the printed prompt must pass                                 |
| `docs/roles/README.md` and the department `README.md` files | The cast available, by description                                         |
| `docs/_generated/directory-map.md`                          | To name a file to attach by its one-line description, without opening it   |

Do not read role bodies, the canon or research files here. The builder chooses files; the thread it launches reads them.

## 1. Restate the dump

Write back, in three lines: what changes, for whom, and where (which app, or the repo itself). Label every inference `[ASSUMPTION: …]`.

## 2. The fast lane

Some work needs no new thread: a question the repo answers, a typo, a one-line fix, a small doc edit. If the work is Q0 and this thread can finish it in a few minutes, say so and ask one question: **do it here now**, or **build a prompt anyway**. On "here", do the work and stop. The front door must never be slower than not using it.

## 3. The interview

**How to ask.**

- Use the question tool: each question offers a few options, the recommended one first and marked "(Recommended)", and the operator can always type their own answer.
- Ask in rounds, several questions per round, as many rounds as the work needs. Never stop at a fixed number: a thin interview produces a thin prompt and questions later.
- Ask only what the dump has not answered. Where the dump did answer, show the answer you inferred as the recommended option so the operator confirms it in one click.
- Every option's description says what will happen if it is chosen, in words a non-technical operator understands.
- Invent nothing silently. An answer the operator does not have becomes `[NEEDS DECISION]` in the prompt.

**Round A: what this is.**

| #   | Question                    | Options and what to tell the operator                                                                                                        |
| --- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | Which track?                | The track you recommend, then the one or two it could be mistaken for, each with the one line from `tracks/README.md` that tells them apart. |
| A2  | Which app?                  | The apps in `toolkit.json`, plus "across apps" and "the repo itself". Skip when the dump says.                                               |
| A3  | Who leads and who supports? | The cast you recommend, each role with the one thing it is there for; "change the lead"; "add or remove support".                            |

**Round B: how carefully, how fast, how hands-on.**

| #   | Question                           | Options and what to tell the operator                                                                                                                                                                        |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| B1  | QA level, and who reviews?         | The level you recommend with its reviewers and what each will look at, then one level lighter and one heavier, each with what it adds or removes and a rough cost (see below).                               |
| B2  | Any part that needs a deeper look? | Parts you would flag (for example "the webhook handling: every event type handled"), "none", or the operator names their own. Each becomes a `focus` line ([`qa-levels.md`](qa-levels.md)).                  |
| B3  | Pace?                              | **Fast**: the quickest reasonable route, lighter interview downstream, QA not above what you chose. **Balanced** (usual default). **Careful**: the deepest model throughout and more checking between steps. |
| B4  | How involved do you want to be?    | See "The involvement question" below. Always show how many stops to expect.                                                                                                                                  |

**B1 is often the meatiest question.** Work with more than one ticket or stage rarely has one level:

- For an epic, ask for the **default** level and for the parts the operator already knows are critical. Say plainly that every ticket gets its own level, reviewers and focus at the Tickets stage, shown as one table to confirm.
- For work with stages but no tickets (an exploration, a product spec), say which stages are checked by the operator's own approval and which, if any, get a reviewer.
- When you already know the pieces, show the recommendation as a small table (piece, level, reviewers, focus) above the question and ask "confirm all" or "change some".

**The involvement question (B4).** The operator may not know what the options mean in practice, so say it:

| Option                | What it means in practice                                                                                                                                                                                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Autonomous**        | The thread decides everything that can be undone, writes down what it assumed, and you hear from it once, at the end. It still stops for what only a person can do: a choice that cannot be undone, spending money, a credential, growing scope, the merge.                               |
| **Check in at gates** | The thread works on its own between a few named stopping points and waits for you at each. Name them for this work. For an epic: the brief, the UX spec, the technical calls, the ticket list. For a build: the plan and file list before it starts, and what was built before it closes. |
| **Decide together**   | The thread brings you each meaningful choice as it comes up, with options and a recommendation. Slowest, and the most of your time; for work where being wrong is expensive.                                                                                                              |

**Round C: logistics.**

| #   | Question                                    | Options and what to tell the operator                                                                                                                                                             |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Where should the work land?                 | **Current branch** (default): it joins what you already have open. **Its own branch and pull request**: reviewed, shipped or discarded separately. Link [`branches.md`](branches.md).             |
| C2  | A formal ticket?                            | Only for tracks where the ticket is optional. **Ticket and contract**: written criteria and a record of what was built. **No ticket**: the prompt is the brief and the closing report the record. |
| C3  | What will you attach from outside the repo? | The builder already knows the repo's files. Ask what exists elsewhere: screenshots, recordings, a client email, brand files, exports, a link. Name what this track usually needs.                 |

**Round D: the track's own questions.** Each track file lists them. Ask every one the dump has not answered, in as many rounds as it takes.

## 4. Choose the files, one reason each

Take the track's and the stage's "Loads" lists as the ceiling; attach only what this work needs.

- Exact paths that exist. Use the directory map's descriptions to pick; never guess a name.
- References through `docs/references/README.md`, at most three, only in UX and build prompts.
- A `docs/research/` file only in a Frame, Research or UX prompt, labelled `[research: <why>]`, and only when nothing distilled covers the topic. Never in a build prompt.
- The living UX truth for the area when it exists. When it does not, say so: the track decides whether the work writes it.
- List the outside attachments from C3 by name, each with what the thread should take from it.
- When the Design stage was chosen, the Paper file and page the operator named, or "the stage asks" when they did not.

## 5. Research: here, or in its own thread

List what the work cannot decide without facts it does not have. Each gap is one question.

| Do it in the working thread when                                        | Hand it to a research thread when                                                     |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| One or two lookups answer it: the repo, a library's docs, a vendor page | It needs several outside sources weighed against each other                           |
| The answer is a fact, not a judgment                                    | It is a comparison, a market read, a legal or behavioural question, or current prices |
| Being slightly wrong is cheap to fix later                              | The answer shapes the UX spec, the data model or a choice that is hard to undo        |

For each gap that goes to a research thread, print a block in this form:

```
This work needs research on <topic>, which the repo does not hold.
Open a Claude research thread on <model>, as <role(s)>, and paste the prompt below.
When it finishes, save the result as <filename> in <directory>.

<the research prompt: the one question, what a good answer contains, the evidence rules, what is not wanted>
```

The directory comes from the track file. State whether the main prompt waits for the research or can start alongside it.

## 6. Venue, model and thread plan

| Thread                                                   | Venue                                                                               |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Anything that reads or writes repo files, or runs checks | Claude Code, in the repo                                                            |
| Research with web sources                                | A Claude research thread                                                            |
| The Design stage                                         | Claude Code with Paper Desktop open on the operator's machine, the operator present |

State the model; do not ask. Name a minimum and a recommended model with the failure mode of choosing down, from the Answer table in `docs/research/engineering/model-selection-claude-code.md`: a ticket build, UI or not, Opus 5.5 at medium as both minimum and recommended (ledger PR-22) until a calibration moves it; shaping, review, research, audits and hardening, Opus 5.5 at the floor. Fable 5.1 is never a default; name it only when the operator does. Pin the effort at thread start; never switch model or effort mid-thread. Then write the thread plan: where the work starts, where it splits into further threads, and that each thread will tell the operator when to open the next. A dry-run or cold-rehearsal thread names its own model, and for that one thread the builder asks the operator which, since a smaller model often serves there.

## 7. Print three things, save nothing

**1. The prompt,** in the standard's shape ([`prompt-standard.md`](prompt-standard.md)). It carries the answers from the interview as instructions: the track, the cast, the QA level with reviewers and focus, the pace, the involvement and its named stopping points, the branch, the ticket choice, the attachments. Keep it under a page: the thread reads the files, the prompt only points.

**2. What to expect.** Estimates, labelled as estimates. Use this block:

```
What to expect (estimates, not promises)
- Thread plan: <starts here; then …>
- Effort          <0.0–7.0>  <one line why>
- Wall time       <0.0–7.0>  <about how long, as a range>
- Token cost      <0.0–7.0>  <what drives it: threads, reviewers, model>
- Risk            <0.0–7.0>  <what could go wrong and how it is caught>
- Your attention  <0.0–7.0>  <how many stops, and what each asks of you>
```

Anchors for the scale: 1 is a few minutes in one thread; 3 is one build thread of about an hour; 5 is a day's batch across several threads with reviews; 7 is a multi-day epic. Time and cost are guesses from the shape of the work; say what would make them wrong.

**3. Research prompts,** one block per gap, in the form in section 5.

Close with one line: "Open a new thread, attach what you listed, and paste the prompt above."

## 8. Check it

Check the prompt against the standard before printing. Print only the rows that fail, with the fix applied; when every row passes, print "Standard: all rows pass".

---

## Two desk walks

**"The Stripe webhook sometimes processes the same event twice."** Restated: a duplicate-processing bug in billing, in `web`. Fast lane: no, it is money. Round A: track Bug; app `web`; no lead role, Warden and Mason in support. Round B: Q3 recommended because the path is billing, reviewers Warden (replay and signature) and Vigil (the criteria), focus "every event type is idempotent"; pace Careful; involvement "check in at gates" with two stops (the diagnosis before the fix, the proof before closing). Round C: current branch; formal ticket recommended at Q3; attachments: the Stripe dashboard event log, any error report. Round D (bug track): what was seen and how often; is it live for customers; should the thread trace which ticket introduced it. Research: none. Prints: the prompt; the forecast (effort 3, wall time 3, token cost 4 because of two reviewers, risk 5, attention 2).

**"I want to try three different onboarding flows with a couple of clients before we commit."** Restated: early product exploration, in `web`, nothing settled. Round A: track Feature exploration; lead Vesper, support Compass. Round B: Q1 on the experimental pages, the operator's own review as the check; pace Fast; involvement "decide together" for the directions, autonomous for the build. Round C: its own branch recommended (it may be discarded); no ticket; attachments: client notes, any sketches. Round D (exploration track): canvas or all in code; the three variants and how they differ; feedback comments, a review form or both; an admin view of results; who sees it. Research: one gap (how comparable products sequence first-run) goes to a research thread and can run alongside. Prints: the prompt, the forecast, one research block.
