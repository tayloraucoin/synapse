---
id: "USE-22"
size: medium
objective: 'A meal on Now offers "Watching while eating": the saved topics as chips led by their icons, a pick filling one chip in ink and showing a LinkCallout "Open in YouTube" for that topic, and Edit topics opening the Meal topics sheet, where topics are listed, added, edited with the icon picker, reordered and deleted with Undo, on fixtures'
slice_type: "a block form plus a list-editing sheet; risks a YouTube link offered before a pick, a pick that leaks into the next meal, a link built wrong for its kind, red or a YouTube logo on the callout, and a second icon picker"
non_negotiables:
  - "No link until a topic is picked; a pick holds for this meal only and the next meal starts with none (D-USE-72)."
  - "The callout opens the topic's playlist, channel or search on youtube.com from a pure mealTopicUrl in @syn/utils; no red, no YouTube logo."
  - "Topics are mealTopicRecord through useMealTopics on fixtures, writes through mealTopicInput; the order in the sheet is the chips' order."
  - "The icon tile opens USE-11's IconPickerStep as a step inside the sheet with back on the left; never a second picker or a second sheet."
  - "A meal's card carries Done alone, full width; no Start."
  - "Only @syn/ui components (LinkCallout, ResponsiveSheet, SortableList, Toaster) and preset tokens; colour never alone."
devs_call: "The edit form's layout (not drawn: name, one link of a kind and its value, the icon tile); swipe-to-delete's threshold; where the device keeps the pick (by date and block)."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/meal-topics.md"
  - "specs/web/epics/USE-daily-use/ux/day/now/states/meal-pick-topic.md"
  - "specs/web/epics/USE-daily-use/ux/day/now/states/meal-topic-picked.md"
  - "C-USE-meal-topics-1"
  - "C-USE-meal-topics-2"
  - "C-USE-meal-topics-3"
  - "C-USE-now-meal-pick-topic-1"
  - "C-USE-now-meal-pick-topic-2"
  - "C-USE-now-meal-topic-picked-1"
  - "C-USE-now-meal-topic-picked-3"
  - "C-USE-now-meal-topic-picked-4"
waiver: "The Meal topics sheet with the two Now states that open it; the chips and the sheet read and write the same topics."
truth_files: "none: an epic proposal; promotion carries day/now/ and interactions/meal-topics.md"
qa: Q1
reviewers:
  - assay
focus:
  - "the two meal states and the sheet at 402: no link before a pick, no red, chips led by icons (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/_components/"
  - "apps/web/app/(shell)/_components/sheet-host.tsx"
  - "apps/web/components/planner/"
  - "apps/web/lib/data/use-meal-topics.ts"
  - "apps/web/lib/data/meal-topics.test.ts"
  - "apps/web/lib/fixtures/"
  - "apps/web/lib/routes.ts"
  - "packages/utils/src/planner/meal-topic.ts"
  - "packages/utils/src/planner/meal-topic.test.ts"
  - "packages/utils/src/planner/index.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-022-meal-topics/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-11"
  - "USE-16"
  - "USE-17"
out_of_scope:
  - "The avatar menu's Meal topics entry: the avatar-menu ticket; it opens ?sheet=meal-topics"
  - "Edit topics on a meal block's editor and the New block sheet's Meal: their tickets"
  - "Leaving a topic out of one meal in its block view: the block view's ticket; Now offers every saved topic until then"
  - "Real writes: the wiring (wave 3)"
criteria:
  - id: C1
    statement: 'Breakfast at 9:02 with nothing picked: the meal glyph header, the card with Done alone, "Watching while eating" with Edit topics, "Pick one before opening YouTube." and four outlined chips each led by its icon; no link'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-022-meal-topics/evidence/meal-pick-topic-402.png"
  - id: C2
    statement: 'Agent workflows picked: its chip filled in ink, "Picked for this meal. Tap another to change.", and a LinkCallout with the play tile, "Open in YouTube", "Agent workflows · saved playlist" and ↗; no red, no logo'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-022-meal-topics/evidence/meal-topic-picked-402.png"
  - id: C3
    statement: 'Edit topics opens the sheet over a scrim: × on the left, "Meal topics", its line, each topic with its icon on a kind chip, name, "Playlist · …", "Channel · …" or "Search · …" and a grip, then Add a topic; the canvas caption is not shipped'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-022-meal-topics/evidence/meal-topics-sheet-402.png"
  - id: C4
    statement: "mealTopicUrl returns the playlist URL as saved, https://www.youtube.com/@<handle> for a channel and a youtube.com results URL with the words encoded for a search"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "A pick on Breakfast is gone on Lunch; a topic's icon changed in the sheet shows on its chip; a drag reorders the chips; a delete removes the topic and Undo restores it in place"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "The web app and @syn/utils type-check"
    evidence: check
    command: "yarn check-types"
  - id: C7
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — meal-topics

## Build notes

After USE-17 (the meal block form) and USE-11 (the picker). Captures to match: `ux/day/now/captures/{meal-pick-topic,meal-topic-picked}-402.png` and `ux/interactions/captures/meal-topics-with-icons-402.png`; Paper `01M49AX02VV4SSBKNCN6NRTS6Y`, "USE — daily use", the frame "meal-topics sheet / with icons" (x 964, y 12390).

- **Decisions that apply:**
  - D-USE-28: meal blocks carry "Watching while eating" topic chips, picked before a LinkCallout opens YouTube, kept in a Meal topics sheet.
  - D-USE-30: meal topics take an icon (emoji or line icon, the step 11 picker); the icon leads the chips too.
  - D-USE-72: the pick shows on every meal block and resets each meal. A meal with no topics shows "Watching while eating" with Edit topics alone [ASSUMPTION].
  - D-USE-74: the sheet's closing caption is a canvas pointer, not shipped.
  - The sheet: tap a topic to edit its icon, name and link; swipe left to delete, Undo in the toast [ASSUMPTION, the house pattern]; drag the grip to reorder; Add a topic adds a row to fill; × closes onto the meal and a change shows on the chips at once.
  - Words: "Watching while eating", "Edit topics", "Pick one before opening YouTube.", "Picked for this meal. Tap another to change.", "Open in YouTube", "<topic> · saved playlist" (or "· channel", "· search"), "Meal topics", "Things worth watching while cooking and eating. Each opens a saved playlist, a channel, or a YouTube search.", "Playlist · <url>", "Channel · <handle>", "Search · \"<words>\"", "Add a topic".
- **Interfaces:**
  - `@syn/utils` `planner/meal-topic.ts`: `mealTopicUrl({ linkKind; linkValue }): string`.
  - `lib/data/use-meal-topics.ts`: `useMealTopics()` with `add`, `update`, `remove`, `restore`, `reorder` over new fixture calls `listMealTopics`, `writeMealTopic`, `removeMealTopic`.
  - `components/planner/`: `MealTopicChips`, `MealTopicsSheet` (opened by `?sheet=meal-topics`, `routes.ts` `mealTopicsSheet()`), `MealTopicEditStep`.
  - `(shell)/_components/sheet-host.tsx`: one host that reads `?sheet=` and mounts the sheet; create it if absent, else add the `meal-topics` case.
  - The default scenario gains four topics: Agent workflows (robot, blue, playlist), Strength training (dumbbell, rose, channel), Roman history (classical building, amber, search "roman history documentary"), Cooking basics (green, search "simple weeknight cooking"). Scenarios: `meal-pick-topic`, `meal-topic-picked`, `meal-topics-sheet`.
- **Per path:** `meal-topic.test.ts` holds C4; `meal-topics.test.ts` holds C5 against the fixture server and the pick store.
- **Gotchas:**
  - The callout opens outside the app in a new tab (`rel="noopener"`); the URL is built, never typed by hand.
  - USE-28 also writes `sheet-host.tsx`; whichever lands second adds its case.
  - Tapping the picked chip again keeps it picked; a pick is changed, not cleared.
- **Model:** Opus 5.5 at medium. A smaller model shows the link before a pick or keeps yesterday's pick.
