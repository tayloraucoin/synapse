---
title: "Operator notes — Synapse as a daily tool (day-to-day use)"
description: "Open when a USE brief, narrative or spec line needs tracing to what Taylor said about using Synapse daily: waking, Orient, reviewing and adjusting the day, go mode, work tiers, building each weekday, the Passion Planner."
layer: product
status: draft
thread: USE
role: Alembic
date: 2026-10-09
last_reviewed: 2026-10-09
supersedes:
load_when: spec, discovery
---

# Operator notes — Synapse as a daily tool

**Date:** 2026-10-09 [ASSUMPTION: the dump was spoken on or just before the day it was handed to this thread] · **Operator:** Taylor · **Taken by:** the USE Frame and narrative thread (Vesper leading, Alembic's discipline) · **Session:** a spoken brain dump on using Synapse daily, handed over with the prompt-builder prompt, and a photo of the Passion Planner weekly spread ([`refs/passion-planner-weekly-spread.jpg`](../../../specs/web/epics/USE-daily-use/refs/passion-planner-weekly-spread.jpg)); build at `b83158c` on `feature/paper-ux`.

**Fed:** [`specs/web/epics/USE-daily-use/brief.md`](../../../specs/web/epics/USE-daily-use/brief.md), [`specs/web/epics/USE-daily-use/research/what-exists.md`](../../../specs/web/epics/USE-daily-use/research/what-exists.md), [`specs/web/epics/USE-daily-use/ux/narrative/`](../../../specs/web/epics/USE-daily-use/ux/narrative/01-the-day.md)

Numbering runs on through the file, so a later file can cite a line as "note 57".

## Why the shift

1. "I really just need to start using this for myself daily."
2. Time away "the past week or two" gave the insight: "I'm building this traditionally, like it needs to be a self-serve … classic onboarding process for a normal app."
3. "Okay, wait, I'm the user here. So I just need to have whatever way I need to get the data in there, but actually make the day-to-day useful part right now."
4. "I've just been too hyper-fixated on the onboarding, and instead I need to shift my focus to the actual day-to-day use."
5. "I can just get the data in … through whatever forms I want."
6. Getting the data in this way "will probably end up … be a way of getting a better UX anyway, just from using the data in this manner."
7. "There's already a lot of stuff in the code base. So I think you need to deeply study that."
8. "I'm just going to riff off the way I see myself using this each day … envision myself as the user."

## Waking up

9. Keeps the phone "in the bathroom drawer … so that it makes me get up and out of bed in order to chase the dopamine that is my phone, and get going."
10. "I take a pee, I weigh myself, and then I … start the cold bath. And then I go and meditate" is "right now my focus."
11. "I basically have like 10 minutes before I have to get into the cold bath." [ASSUMPTION: the bath is started filling first, and those ten minutes are when Synapse is opened.]
12. "When I take my phone, I want to have used my Bloom blocking device for most of my other apps … be locked out where I'm only using Synapse and maybe one or two other things."
13. "I want it to basically greet me with the morning and have … the Orient in the app right now … you can just look at what's in Orient now."
14. "Being able to have my emotions calibrated with that."
15. "I guess I would take my weight in there, but that shouldn't be the responsibility of Synapse."

## Checking off, and a default for each day

16. After the cold bath: "I want to start checking off the things that I'm doing and see where I am on my schedule for that day."
17. "Let's say that I do meditation three days a week and … another activity one day, another activity one day."
18. "If it's Monday, I have a default one set for Monday … But I also can change it. Like maybe my emotions just want to do this and I'll switch this in this day."
19. "I think the way that I've got things designed so far is what I would keep with." [ASSUMPTION: this means Orient and the day of blocks as built, not the first-run onboarding of notes 2 to 4.]

## Reviewing the day: the whole day and one block

20. "Picturing myself on the toilet. So I read the Orient, I'm like, yes, get my emotions in the right place. And then review your day … here's everything that I have in here."
21. "Remember it's broken up into blocks. So I would probably want to look at the day as a whole."
22. "If I want to click on any individual block, I can just … have that be … a child page of it … and be able to navigate with a breadcrumb back to … viewing the whole day."
23. The whole day has "a vertical line on the left with the time in there … not every line has a number to it."
24. "There's a whole bunch of stuff that's a couple minutes long when it comes to especially the wellness block. But maybe we just show the wellness block as a whole and just have bullet points of some kind in there."
25. "Maybe it has to even go grid style … bullet points just because it's only going to be so tall. It's only going to be an hour's worth." "It doesn't need to show everything."
26. "If I want to just click on the wellness block, then it opens up to be taller and can properly show the slotting in there."
27. "Maybe you can see … six to eight hours worth of content, just in the vertical space on the phone."
28. "Please be building all of this for mobile first. All of our designs will only start on mobile to begin with."
29. Inside the wellness block: "the whole thing's only an hour. So it's spread out … use your best design skills to make that … it's bigger for sure, cause it's over a different stretch of time."
30. "Sometimes it's going to be reorder. Sometimes it's going to be swap something out."
31. Began an idea that was "a little bit advanced for this", then set it aside: "let's just get the standard UI done." (paraphrase) [ASSUMPTION: the advanced idea was never named; nothing is carried from it.]

## A default per weekday, from the gym schedule

32. "It's the stuff that is currently slotted for those days … my default for say a Monday and then it's different than a Tuesday … each day of the week separately for now."
33. "I'm not going to use day templates as much right now just because all of the days are kind of different in their own way right now."
34. "It's basically based off of my gym schedule. My gym schedule creates the different cadence in scheduling."
35. "Monday and Tuesday are go to the gym, the YMCA, right away. And then Wednesday is an off day where I just have to do abs at home and ideally yoga. And then Thursday, Friday are at home workouts."
36. "I need to figure out exactly how the physio and everything fits into this better."
37. "That's part of the whole purpose of this thing, is just being able to get excited in the dopamine rush of checking things off as I go."
38. "Sitting on the toilet, read the Orient, see … here's my day ahead, be able to swap anything out."

## Work comes into the day

39. "The one difference now is that we're going to include work tasks in this."
40. On the workflow feature: "let's just consider that a very beta … experiment. That's not going to be the forward-facing UI or workflow, pretty likely. There'll be aspects of it that will translate, but it's going to go through a bit of a revamp."
41. "Right now, I just want to focus on … checklists. So just working through it like anything else."
42. "Once I get the UI and the workflow working well, I'll be able to connect those workflow things into Linear tickets. So we're going to add API integration for that, but consider that something after."
43. "Think about … from a design standpoint, what the Linear stuff will be. So if it's connected to a ticket, what information are we showing on that for the checkbox item?"
44. "There's which client slash project … as long as I see the project, I'll know what that is."
45. "I have my primary task for the day … up to two primary tasks. And then … up to three or four secondary tasks. It really just depends on the day." "And then there's stretch."
46. "Any general to-dos that I would set … just daytime life stuff, where it's like, if I need to call a mechanic or do this or that … stuff that I will remind myself of during the day."
47. "I can set reminders for each of those, because it's not quite the same."

## Ready, go

48. "The day's all built into blocks. So basically the point is I'm just reviewing it and able to lock that in, like, okay, ready, go."
49. "I basically just orient myself, I get my emotions in a good place, I look over what my day is gonna be, I make any adjustments as needed, and I'm like ready, set, go. And now it's in gamify mode."

## Go mode

50. Then: "I would get off the toilet, I'd weigh myself … drink some water, go in the room, meditate. The timer's on my phone."
51. "Don't worry about building a timer in there for this version." Then, at once: "but even maybe that's a thing, because that's not out of the realm of technical complexity … when I start something."
52. "When I click on one of the items in the go mode, where it's like, here's your current thing that you're actively on."
53. "It could visually look similar to … approving the day, where you're seeing a vertical list of line items, kind of like in Google Calendar. By far, Google Calendar is the closest example … from a formatting structure standpoint."
54. "I really want each line item to either have an emoji or an icon, literally like how Notion has it … and for the icon, you can set a hex code, or a preset number of colors."
55. "There should be … a grouping box around the block itself."
56. "If I'm in the wellness block, that's my active state. I don't want to see anything in my view that's outside of the block that I'm in."
57. "The only thing that would be in there would be … my little transition blocks. So for example, if I had drive to the gym in there as a transition block, that doesn't take me out of … the parent block of being in wellness."
58. "These transition blocks can also happen in between primary blocks."
59. "A transition state could be making breakfast and everything I need to do after the gym before I start work. Or maybe we just include that as part of the wellness block, I don't know. I consider that transition blocks and I think it's cleaner to think of it that way."
60. "I can hit start, or I can say mark as done. Or I guess it might be edit, I don't know. But let's just assume those are the main two."
61. "If I go start now, then a timer is going to go, and there's an estimated range that's already built in, and it's the ideal time that I have it scheduled for. And so I'm just seeing a countdown for that."
62. "I don't want it to start blaring off with an alarm after, but maybe just have it go into how much time over is it … that can be massaged over time, but let's just get something working."
63. "When it says mark as done, maybe I have an optional thing to say, how long did it take me? … if I'm not using timer mode, then it's like, okay, I can just put that in. But I should also be able to skip that."
64. "When I'm finished the wellness block … I just get the option: okay, complete wellness block, move into the next block."
65. "Then I just move to the next block and just check, check, check … the whole flow each day is just, I'm checking things off on this thing one after another." "I think we can consider that making sense throughout each part of the day."

## Wellness repeats; work is slotted

66. "The wellness block is going to be consistent and I'm pre-scheduling that per week. So every Monday to Friday should be the same in theory. And I can make day-to-day adjustments and exchanges, but the structure is the same every week."
67. "The work stuff is very different because it's going to be different all the time. So every day essentially is empty until I slot it."
68. "Just like how I'm planning out my week in a journal … my workbook, that's what this is going to be."
69. "I'll also attach pictures of how this is in the planner. I love this design, and I would not be opposed to this being part of the desktop version, and it's an inspiration overall to how we build this thing."
70. "From a work standpoint, it's just saying what my primary things are and my secondary. Unless I have meetings, which I can very well put into that."
71. "Meetings can either be for work or not for work. Scheduled in, or appointments, for that matter."
72. "With work, it's just a matter of moving through from primary to secondary … I just check it off when it's done."
73. "We'll start with a simplistic version that I can iterate with over time. But even for me, just planning out my primary and secondary things per day, that's helpful enough."
74. "When I have this data all in place, I'll be able to track my habits and just build iterative, helpful features to this."

## Building a day

75. "My default for each day would be the most helpful thing right now. So I would just build my Monday. It's like, add a block here."
76. "Whether it's first time uploading or editing what I've already got, I would in the mobile go into the hamburger menu in the top right. Or maybe it's my profile picture, maybe that's a better design pattern, you tell me."
77. "It opens to the drop down and it's like, set my days, or whatever."
78. "I need to … pick a day per week. So let's say, set your Monday, your Tuesday."
79. "I should be able to duplicate a day. So like copy from Monday … so it's just faster, so I can just make the adjustments … for the next day."
80. "I'm open to different UI approaches."
81. "The first thing is, what time do you wake up and go to sleep? I think that's the most important thing."
82. "I don't even want to say what time do you want to start work. I kind of just want to be like, add a block."
83. "We know the parameters, the top and the bottom. So if I'm looking at the day, kind of like a Google Calendar … I want to be able to find the spot on the time calendar on the left and hit a plus. Or maybe there's a plus button in the bottom right."
84. "It gives me the option to … add a block … probably only add a block. Cause if I want to add to the block, I would tap on the block itself and then add more to it."
85. "I'm setting the blocks first."
86. "If I'm waking up at seven, it should just automatically build in there, until 7:05 or whatever, Orient. So always make that mandatory … for now, users can't take that out. So your day kind of starts … five minutes after your wake up."
87. "Then I can just start adding from there, building out these blocks and just adding checklists within it."
88. "That's a better way that I just want to use this right now, rather than … the way it's built right now, where it's like, what all things do you want to do in life? And it just feels overwhelming to choose from a thousand things."
89. "Let me just put what's in my schedule right now and just get that going. Cause I don't need to figure out a lot of this. I actually just need to be consistent with what I already have set up."

## Work hours, meals, breaks

90. "For work, it's like, here are the hours that I'd be working, and that's the work block set."
91. "I'd schedule my meals in here."
92. "I look at meal as a subtype of a transition block, because you're not doing something … it's a chore in a way. It's like you have to eat."
93. "So I can see all my working blocks … if I want to schedule a stretch break in between my two afternoon blocks … that's something I want to be doing all the time, and I need to prompt myself to do it." [ASSUMPTION: "two afternoon blocks" are two work blocks.]
94. "I would finish a day, and then … copy it to the next day and then just make edits to that where I want to."
95. "An obvious edit would be to change the workout. So I can name, like, hey, this is workout gym. So I have a list of different workouts and I can add it in there."
96. "I'm trying not to overcomplicate it, but I think that's enough for me to really get going."
97. "Once this is solid, I can look at how to look at the data afterwards, but let's just make sure that the day-to-day functioning of this is working well."

## The platform

98. "This will be a Vercel web app that has PWA capabilities. Maybe even design the download/add app instructions into it (iPhone, Android)."
99. "Consider iPhone spec the default device in Paper frames. Do not make desktop unless I ask you to."
100.  "FYI the weekly notebook I referred to before is the Passion Planner notebook."

## How this should be worked (said to the prompt builder)

101. "Don't feel like you have the responsibility of noting down every detail I provided — that level of contextual nuance needs to be read as a whole."
102. "I want to create the UX spec from this, review it, make any changes, and then get it made into Paper. I will end up doing refinement with you and in Paper directly. Afterwards we'll move it to development, but I expect the process in Paper will take a bit."
103. "A different type of UX spec … a human-readable spec that I would ideally be able to read in the docs app … expressive and specific about the UI it plans to use, so I can mentally visualize it as I read … notes for edge cases, user stories, or whatever you think you would ultimately be creating in Paper."
104. "Once that is reviewed, refined, and approved, you could make the UX spec that is closer to what is there today … more AI-readable … but do not let there be a slip of the emotion/insight/context provided from the human-readable UX version. Maybe some steps/stages even read both to make sure the holistic is met."
105. Wants the practice changes kept migratable to PEM, in one docs folder of PEM adaptations that a PEM sync reads instead of exploring the whole codebase, built into the conventions. (paraphrase)
106. Wants a folder of operator notes for "long mental thought trains that can't be easily replicated, and should be logged," taken as "bullet points in order … using exact wording whenever possible, but cleaned up." (partly paraphrase)
107. Paper file: Synapse, `https://app.paper.design/file/01M49AX02VV4SSBKNCN6NRTS6Y/p-2-0`.

## At the start of this thread (2026-10-09)

108. "Note some updates to the docs dir, to better reflect the PEM conventions."
109. "Yes I want to see some screen variation concepts."
110. "Yes I want to move screen by screen when we get to the Paper stage."
111. Attached the Passion Planner weekly spread (week 42, Oct 12 to 18): a column per weekday with a "today's focus" box and half-hour lines from 6:00 to 10:30, "this week's focus", "good things that happened", and personal and work to-do lists with "priority" and "top priority" columns. (paraphrase of the photo)

## Amendments

Each later round is a dated block below; earlier lines are never edited. A block says what it changes, by the line number it refers to.

### 2026-10-09 — Stop 1, checking the notes

1. "Yes, that and meditation. Consider the first 5 minutes always dedicated to orient." (refers to Waking up, note 11)
2. "Don't delete onboarding, but don't focus on it now." (refers to Checking off, note 19)
3. "Just focused on getting something functionally useful for myself." (refers to Reviewing the day, note 31)
4. "Yes, basically work blocks. I often think of each block as separated by meals, so that's how I set it up. I'll have several work blocks in a day." (refers to Work hours, meals, breaks, note 93)
5. "Yeah, you got it." Confirms the go-mode timer as a countdown with an over-time readout and no alarm. (refers to Go mode, note 51)
6. Notes 108 to 110 are answers given up front to questions the interview would have asked. (paraphrase)
7. On the product rules: "Don't hold stuff like that as hard rules. I'm experimenting to build this." (refers to notes 37, 49 and 62, and the product-rules file generally)

### 2026-10-09 — Stop 2, the study and the brief

1. On the appetite: "It will be done faster. I'll have about two days next week. I also can't go through my entire Claude Max tokens wallet. This shouldn't take that much. I'm not interested in hardening. Testing/QA will be limited to only UI audit." (refers to the brief's recommended ten build days)
2. On the success window of two working weeks, judged by whether the paper planner or the phone timer still runs the day: "Exactly."

### 2026-10-09 — Narrative interview, rounds 1 to 4

Taylor took the recommended answer on all sixteen questions, through the question tool (paraphrase of each choice):

1. "Set my days" lives in a menu that opens from the header avatar, with Install the app and Settings. (refers to note 76)
2. Editing a weekday: seven day chips across the top; the chosen day below as a calendar column; "Up at" and "Lights out" asked first, as its top and bottom; Orient locked for the first five minutes. (notes 78, 81, 86)
3. A block is added by tapping an empty time on the rail, or with a + at the bottom right. (note 83)
4. Copying is "Copy from…" into this day; an empty day offers it first. (note 79)
5. Two kinds: a block, and a transition that can sit between blocks or inside one; a meal is a transition marked as a meal; Orient is a locked block. (notes 57–59, 92)
6. The whole-day view shows a block's items as icon-and-name bullets in a grid, with a "+n more" cut. (notes 24–25)
7. A block's own view is the calendar stretched to that block's span, with a breadcrumb back. (notes 22, 26, 29)
8. Reorder by a drag handle; swap from the item sheet, picking from the library by kind; icons from a Notion-style picker, with a preset colour or a hex. (notes 30, 54, 95)
9. Orient, then Review the day, then "Ready, go". Go mode lives on the List tab, and Schedule stays the whole day. (notes 20, 48–49)
10. Go mode shows only the active block, the current item lifted with Start and Done, the rest of the block below. (notes 52, 55–56)
11. The countdown runs from the planned length, then reads "n min over" in plain ink, with no sound. Done without a timer offers an optional "Took how long?" that fades. (notes 61–63)
12. A finished block shows a calm close card with what's next and one button to start it; anything left unchecked stays as not done. (note 64)
13. Work sits in three sections, Primary, Secondary and Stretch, with soft caps (2, 4). Meetings and appointments are items pinned to a time, tagged Work or Personal. (notes 45, 70–71)
14. To-dos sit in a tray above the day, each with an optional reminder. (notes 46–47)
15. A Linear item shows the project, the issue ID and the status (a shape and a word); its sheet adds priority, assignee and "Open in Linear". (notes 43–44)
16. Install guidance is in the avatar menu, and offered once after the first day is set. (note 98)

### 2026-10-09 — Narrative refinement, round 1

1. On part 1: "Feels a little too story-driven, a tad more interaction mapping."
2. "The wellness blocks should persist each week. So I shouldn't have to set those each week. The work blocks I will. Essentially work blocks should be the main things to reschedule each week — plus slot any specific appointments, social events, etc." (refers to notes 66–67)
3. On part 2: "I should also be able to set profile basics, like name and profile image. User auth should be required to view."
4. On part 5: "Yes, approved." And: "Please make sure that the first-wake orient -> day review + swap -> enter go mode is clearly done. That is where the screen by screen will begin. I like how you have the overview level items covered as a starting point though."
5. Physio: "I will end up adding this as a type of training block." (refers to note 36)
6. Work tiers: "Tiers belong to the day."
7. Workouts from the library's workout kind through Swap: "Sure." (refers to note 95)
8. The stretch break: "I think a stretch break is like a small training block. We can also just have a true break that can be a small wellness block like a walk. That is a small nuance to handle later. I guess a break could be unfilled so that it's an actual break — depending on the person." (refers to note 93)
9. Monday's assumed times: "Not sure what you mean, but okay."
10. Weekends: "Yeah, weekends are the same. Sundays in particular will often have less formal schedule and more of a general checklist that should have easy drag-and-drop reorder and check off, etc."
11. Linear check-off staying local until the API work: "Yes, but for the design, please factor that in as the design is the source of truth." (refers to note 42)
12. "Continue to the next step — generate Paper files?"
