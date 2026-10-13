---
title: "Operator notes — Workflow at a desk (iterations 2 and 3)"
description: "Open when a USE line about Workflow at a desk needs tracing to Taylor's words: today first, the week in reach, Plan week, life reminders, clients, projects and Linear workspaces, size words, calendars, desktop push, the firing state."
layer: product
status: draft
thread: USE
role: Alembic
date: 2026-10-10
last_reviewed: 2026-10-10
supersedes:
load_when: spec, discovery
---

# Operator notes — Workflow at a desk

**Date:** 2026-10-10 [ASSUMPTION: iteration 3 was written on or just before the day it was handed over; iteration 2 is earlier, date not given] · **Operator:** Taylor · **Taken by:** the USE work thread (Vesper leading, Alembic's discipline) · **Session:** "Synapse Workflow Feedback iterations", pasted as written, handed over with the prompt-builder prompt; build on `feature/paper-ux`.

**Fed:** [`specs/web/epics/USE-daily-use/ux/narrative/06-work-at-a-desk.md`](../../../specs/web/epics/USE-daily-use/ux/narrative/06-work-at-a-desk.md), [`specs/web/epics/USE-daily-use/ux/day/overview.md`](../../../specs/web/epics/USE-daily-use/ux/day/overview.md)

**How this file departs from the template.** The paste is kept byte for byte, in two fenced blocks, instead of split into numbered atoms, because the prompt asked for a byte-faithful copy. The ￼ marks are images that did not come through the paste. Taylor's own framing, added on handing it over: both iterations were written before the USE Paper designs, so they are conversation starters, not a spec (paraphrase). Iteration 3 is the direction; iteration 2 is mostly superseded by it.

## Iteration 2 (not applied; mostly superseded by iteration 3)

<!-- prettier-ignore-start -->

```text
Synapse Workflow Feedback iterations   VERSION/ITERARTION 2 (not applied, and a lot of it depreciated for version 3 now)  
Feedback for getting the workflow feature into a workable state:

Sidebar:
* Sidebar needs to be the ShadCN component, with our branding applied. 
* Sidebar nav-items need icons (Lucide)
* Sidebar profile needs to be bottom of the sidebar, fixed
* Sidebar should be distinguishable from the dashboard page body. 

Views:
* I don't like that style of tabs for this context. Maybe its the best option, it could be that the "New view" button is not aligned and is confusing as text-only. 
* I think by default the views should start as: Working, Queue, All (because otherwise stranglers could occur). 
* I’m less concerned about “New” custom views right now, and want to get my default workflow down pact. 

Columns:
* I should be able to set a color for each column (match to what options Linear makes available).
￼
￼
* Each status/column should have a description. This is mainly to help any future AI features understand context better. 
* I like how Linear has groupings, like: backlog, un started, in progress, and done. So we can have In progress/In progress and In progress/Ongoing. Can we please replicate this? 
￼
* Having the groupings (like “Completed” in Linear) would remove the need to have “Closed tasks land here”. 
￼
* The current code as “In progress”, “Ongoing”, “Finish later”, and “Done” as columns for “Working”. I think instead I want: “Next up”, “In progress”, “Ongoing”, and “Changes requested” as this more accurately resembles the workflow. 
    * Maybe we also need a view for “Inactive” that as Blocked, Paused. 
    * I don’t like the language in Queue: “Later” and “Someday” are not helpful. Please match what I do in Linear. 
        * “Next up” or “Up next”—either or, your pick. 
* Each grouping should be able to have an emoji set to it, for better visualization. 

Data:
* I want to be able to connect to potentially multiple Linear accounts/spaces. So if I have a board per client, I should have each connected. 
* Creating a new task should provide me with an autocomplete to search within my available Linear connections. Maybe have a select above the autocomplete for setting a specific Linear connection/space—by default its empty (can autocomplete through any) but if set it will persist the next time its opened. Hold in store state so it refreshes on page refresh, and doesn't become fixated. 
* Importing projects + tasks from a Linear board will take nuance to handle correctly. 
    * It should start by looking for matches between space ticket status' (in progress, ongoing, etc.) and then do the import key match for any other without a match. I guess it would end up being a vertical list of status keys (left being the importing status) with a -> to the right select for what status to pair it to in the Synapse system. That will need to be synced in case it differs, and changes within our system (like changing ticket status) will move it to that status in their system. 
    * I like for new workflows to be able to import/adopt the status’ from Linear, so that could be “Match our columns to this projects Linear status” or something like that. 

Task:
* Our ticket fields are far fewer than Linear. We should include several more, and these should automatically sync with the Linear ticket (any change made in Synapse should appear in Linear, and vice versa—but that would require a manual sync button and/or a background worker or web socket):
    * “Where it stands” should just be “Description” 
    * Labels/Tags 
    * Priority 
    * Project (adopt this framework please of Project is a parent to tasks/issues)  
    * Etc
* I’m surprised that Linear doesn’t have some kind of “Level of effort” like field for how long/how hard a task is. Am I mistaken? 
* I’d like to see labels/tags in the ticket row. Maybe project too (including project emoji). 
* Firing flash looks good. 
* Oh, I like the next task feature. However, I think the design for that could be improved. 
    * Should there be something (or a modification to this) for when to jump back to something because the thread stopped firing? This is all about playing attentional pinball for me. Maybe even makes a noise like a ding when something higher up in priority finished. 
    * There is a “firing” toggle, but what about “has my attention right now”. That could be writing the next prompt, that could be reading a document, etc. 
* In Linear you cannot change the color of priority labels (only urgent changes color). I’d like to be able to have that set. 
* Maybe these are best as cards and not rows. 
* The firing time is good. Except that it appears that a task that is not firing is having the same value as the one above it that is. 
￼

General/Behavioural:
* I’m thinking about how this interface can ACTUALLY help my workflow, and what it can add that simply viewing my threads in Claude Code groupings can’t do. 
    * One is a cleaner view of what is in each column for each client/project, with a tier priority set. I should also be able to toggle based on client/project easily. 
    * Another is connecting to Claude Code threads so I can see my task board in relation to what threads are in progress and what is done, etc. Overall this entire thing is about maximizing my attention while I’m waiting for threads to finish, as I can look at a board and see immediately what my next available task is that is not in an AI process. 
        * This would require work, and would be important. 
        * I would also have to be able to add manual threads for general Claude threads. 
        * I should be able to toggle my tasks based on which I need AI for and which I don’t (for when session token limit is near). So maybe it’s either: Claude, Claude Code, Non-AI. 
        * Each task would need to have potentially multiple Claude Code threads within it, when its an AI task. Visually it probably looks like subtasks. I will need to quickly click to name these, as I would be copy and pasting from the thread name in Claude Code. 
        * I would want the threads in progress to be flashing like how Claude Code does. Really, just mimic it and keep up to date. 
            * Question: is this going to burn my Claude account tokens to keep this in sync? 
    * Think about this: If I were managing 3 full-time jobs, doing advanced juggling, what kind of interface GENUINELY HELPS me with this, and isn’t just a useless layer of noise? 
    * I think being able to set a view for “Today tasks” would be helpful. So a board can get noisy overall, but I want to be able to see whats on my plate for the day and get through it. 
        * As well, I want to be able to look ahead and set my goals per day in the week. This is a big limiting feature on Linear, where a board is just a board. Instead I want to be able to set one or many of each: Primary, Secondary, Stretch per day, and block them out per day of the week. 
            * If I don’t close out the tasks from yesterday, it greets me with stating what isn’t at least in the “In review” status column, and asks how I want things slotted between primary, secondary, and stretch for the day. Automatically it sets them all based on how they were set yesterday and today, and allows me to edit the priorities as needed.  
        * Maybe this is a view alongside Working, Queue, Inactive, and All. What would be the ideal order? 
        * I would need a “Plan week” mode where I would apply the tickets to days. Make sure to account for when a task takes more than 1 day. 
            * How do we handle task subtasks? Overall we should look into this in greater detail than we have. 
    * For me personally, I would value having a toggle for “Evening tasks” that help me see my board more for evening time, where I know what kind of things qualify for that—whether it be creative tasks, passion projects, etc. 
```

<!-- prettier-ignore-end -->

## Iteration 3 (the direction)

<!-- prettier-ignore-start -->

```text
VERSION/ITERARTION 3

So I'm just thinking about, like, the work task workflow as relating to the last dump that was in here that really we haven't even worked on yet, but I've just had an evolving perspective of how I functionally need this to work, like, in the next two days, and less about having it be perfect, perfect in every way. So there's already an ongoing work with Synapse from a daily checklist perspective, and I think let's just work within that for right now and just keep it simple before we get it advanced. So I just need to be able to have a workflow where I can go and set my primary and secondary tasks for each day, as well as any appointments or just, like, life task reminders. Just because when I'm waiting on AI, like prompts and stuff, I have time for small tasks during the day, as well as to have reminders for, like, whether it's stretching or body stuff throughout the day. Like, for example, I want at least one daily reminder for Kegels and one daily reminder for, what am I thinking, like stretching stuff. So yeah, having that built into it, and I want it to be able to import from Linear, as I've mentioned elsewhere. So that's like an optional thing. I can just set up a normal task, or I can reference to Linear. And internally, in terms of our data modeling, I want to make sure that we have the projects and issues slash tasks, along with subtasks, min tasks, properly modeled to model what Linear does, because, yeah, most of them will resemble that, and even life stuff will still use the same models, but they're just going to be, like, less dense with information and just have some kind of a type in there, or it's more, does it have a Linear, like, attachment ID or not. If it doesn't, then obviously it's just internal set task. So yeah, I think that's really the thing. And in terms of a user interface for that, I'm open to ideas, and then maybe that's like a conversation piece. And really, that's just the beauty of having the paper design step now, is that you can actually just give me multiple versions to consider, and we can talk through concepts. Yeah, so that feels pretty good. Yeah, and also being able to have a view where I can see all of my backlog — not even my backlog. It's just my whole, like, pipeline. So I want to be able to sync with different Linear accounts, because, for example, I'll want to have tickets within the ViewPoint workspace, as well as my own workspace, and as well as the Fiber workspace. Like, in theory, I could just have everything within my own, but that makes visibility with the other clients difficult, because I don't want to, like, show them everything that I'm working on outside of them, and also want to be able to assign them tickets and stuff. So being able to say which it's coming from, and then in my view, I should be able to easily toggle between clients. And I guess I can just connect, like, a certain client to a certain Linear board as well. That doesn't mean that necessarily that a space is equal to a client, because if it's in, say, my space as under the hello at TaylorRecoin.com email, then that could be any sorts of projects. But I think a project is attached to a certain client, so that's just kind of the data information hierarchy. So that's feeling pretty good. But yeah, just having a similar data model for what Linear tickets have, I think as long as that's there, including the estimates. So I've started to use with Linear the Fibonacci time for story points. I think that's helpful for me. In terms of the visibility for this, I think I would prefer having the number and a single word. I think that's just easier to remember. So, like, I don't know what the proper word would be for each, but I'm sure you'll be able to figure that out. Linear uses 1, 2, 3, 5, and 8 for their number sequence. So part of the iteration two notes that I had was very focused on prompts and, like, monitoring the AI threads. I think let's not really focus on that right now, just because I think it's just going to be more heavy than it's worth. And I want to get the foundation of the visual interface in place before that becomes a thing. This part will have to be both mobile and desktop spec, which the early experiments should actually run on desktop. So when we're doing it in paper, that's the view that will matter more. Because, yeah, all the rest of Synapse, we're doing it as iPhone first, but this part we're going to want to do as MacBook 16-inch as the specs, because I'll most often be using the workflow there. And yeah, we can easily just make it for mobile, mostly for, like, the CRUD of tasks and the setting it and less of the executing on. But yeah, that will all be there. And because I'll have the PWA set up that works on desktop as well, the push notifications will need to work on desktop as well. So I'll get little reminders for things, which will be sweet. Yeah, and ideally it could even sync to my calendar too, so if I have meetings and appointments, that's already in there. So that actually might be worth setting up right away. So I guess I would just, like, allow it to subscribe to potentially multiple calendars. Yeah, I think that's really just what I want it to be for now. Yeah, and I can update things. Maybe actually the one part to carry over with this is just, like, the firing state, because yeah, that's probably still going to be useful in order to have the visual representation of, like, yeah, this is pending. I think I would like to keep that part in. It's just the actual async nature of, like, hooking into actual cloud code things and not something that I just manually control. So I think that's probably everything that I need to think about. I think the layout for the day is good. The biggest thing is, like, right now the interface is made for looking at all these columns because it's not focused on the today part as much. Really what I'm focused on is, like, being able to view into today as the default view and then be able to, like, scroll, go out and look at the week, so I can essentially look and plan out my whole week. And yeah, there's, like, different ways I can approach that from a visual design standpoint, and that's where working with paper will be helpful. And I think a lot more of the focus is going to be, like, interviewing me, how I want that to work, like functionally, and then letting the design make one or many design versions in order to clear with me.
```

<!-- prettier-ignore-end -->

## Amendments

Each later round is a dated block below; the blocks above are never edited.

### 2026-10-10 — interview rounds 1 to 4 (the question tool; Vesper's recommended answer named on each)

Round 1:

1. Scope at the desk: picked "Whole day, work has room" (recommended).
2. What comes first: picked "Now, with the day beside" (recommended).
3. The week: picked "Plan week = This week at the desk" (recommended).
4. A task longer than a day: picked "Sessions on several days" (recommended).

Round 2:

5. What a client is: "So what I'm thinking is that a client for me are literally clients, as I juggle things. That won't be the case for everyone—so adding that as optional is key. Essentially I should be able to connect a client to a Linear space directly, or set a specific project from a space to a client (for my central hello@tayloraucoin.com space, vs. a FYBR Linear board)"
6. The client toggle: picked "Pipeline and planning, not today" (recommended).
7. The current Workflow board: "I want this to focus on TODAY in terms of what I see that day. I care most about seeing my primary(s) for the day, secondary(s) and stretch(s), plus my todos. I need to be able to turn on a firing toggle for tasks that involve ai (most)."
8. Where firing lives: picked "A state on today's items" (recommended).

Round 3:

9. Today's main area at the desk: picked "Tiers and to-dos, schedule beside" (recommended).
10. The whole-pipeline view: picked "Later; the pool is the pipeline" (recommended).
11. Which items fire: picked "Every work item, one tap" (recommended).
12. Daily body reminders: picked "Set time, plus offered while firing" (recommended).

Round 4:

13. Calendars: picked "Google, read-only, several" (recommended).
14. Sub-issues: picked "Checklist inside, slottable" (recommended).
15. The phone: picked "The day as designed, plus work editing" (recommended).
16. The first two build days: picked "Today at the desk", "Plan week at the desk" and "Linear: in, plus check-off out"; "Calendars and desktop push" was not picked.

### 2026-10-10 — canvas round 5 (on "USE — work"; rounds 2 to 4 are summarised in D-USE-41 to D-USE-43)

17. "I don't want the rows to move into a higher firing grouping—I want something to change on the element itself in its proper group when its firing. I don't mind the flashing to show its processing."
18. "I cannot really provide "back in..." estimates"
19. "Maybe how long it has been firing could be helpful. How does this intersect with the timer for how long the task in progress is going for? That will need action on and off to measure time."
20. "Can we have a pause and resume all tasks button … I can pause my timers like a lightswitch for when I have to step away. This helps me measure task times that it took more accurately."
21. "For the item in the Next spot, can that row in its natural grouping have an outline border or some other kind of identifier that its the next up? Row item level, not a special badge or something."
22. "The project emoji and name are close together in "today / one firing, one back, Next follows order / 1728 / light" and possibly others."

### 2026-10-10 — canvas round 6 and lock (on "USE — work", after round 5 was drawn)

23. "I don't really like green as the color for "prompt sent". intuitively I'd put some kind of dark orange/red-ish color. that to me says processing, please wait. maybe with grey in the element visible aesthetic somehow. You decide."
24. "These rows are a little tight on y padding between elements and border."
25. "I think I'd prefer a light greyscale shading on hover instead of a border, for the task items"
26. "Lock it after that. Arrange in whatever rows/order you think is best to show the screens and interactions, as you put into source material for referencing format—similar to day use and set up pages."
