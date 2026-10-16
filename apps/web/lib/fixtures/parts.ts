import type * as React from "react";
import { createElement } from "react";
import { AccountPart } from "./account-parts";
import { AddPart, type AddPartState } from "./add-parts";
import { BlockViewPart } from "./block-view-parts";
import {
  BlockBandAndHeaderForms,
  TierAndItemForms,
  WorkRowForms,
} from "./day-parts";
import { DaysPart } from "./days-parts";
import { FromLinearPart, type FromLinearPartState } from "./from-linear-parts";
import { IconPickerPart, type IconPickerPartState } from "./icon-picker-parts";
import { ItemSheetPart } from "./item-sheet-parts";
import { MoveToPart, type MoveToPartState } from "./move-to-parts";
import { JournalPart, type JournalPartState } from "./journal-parts";
import { MealTopicPart, type MealTopicPartState } from "./meal-topic-parts";
import { NewBlockSheetPart } from "./new-block-parts";
import { NowPart, type NowPartState } from "./now-parts";
import { OrientPart, type OrientPartState } from "./orient-parts";
import { PlaceSheetPart } from "./place-sheet-parts";
import { PoolSheetPart } from "./pool-sheet-parts";
import { ReadyPart, type ReadyPartState } from "./ready-parts";
import {
  RailAddPart,
  ReviewPart,
  type RailAddPartState,
  type ReviewPartState,
} from "./review-parts";
import { RunningPart, type RunningPartState } from "./running-parts";
import { BLOCK_VIEW_SCENARIOS } from "./scenarios/block-view";
import { ITEM_SHEET_SCENARIOS } from "./scenarios/item-sheet";
import { NEW_BLOCK_SCENARIOS } from "./scenarios/new-block";
import {
  PLACE_SHEET_SCENARIOS,
  type PlaceSheetScenarioName,
} from "./scenarios/place-sheet";
import {
  POOL_SHEET_SCENARIOS,
  type PoolSheetScenarioName,
} from "./scenarios/pool-sheet";
import { DAYS_SCENARIOS } from "./scenarios/set-up";
import { SETTINGS_SCENARIOS } from "./scenarios/settings";
import {
  SPREAD_PHONE_SCENARIOS,
  type SpreadPhoneScenarioName,
} from "./scenarios/spread";
import { THIS_WEEK_DAY_SCENARIOS } from "./scenarios/this-week-day";
import {
  GESTURE_SCENARIOS,
  STEP_AWAY_SCENARIOS,
  TODAY_DESK_SCENARIOS,
} from "./scenarios/today-desk";
import { TODAY_EMPTY_SCENARIOS } from "./scenarios/today-empty";
import { TODAY_MEETING_SCENARIOS } from "./scenarios/today-meetings";
import { TODO_SHEET_SCENARIOS } from "./scenarios/todo-sheet";
import { WEEK_SCENARIOS } from "./scenarios/week";
import { SchedulePart, type SchedulePartState } from "./schedule-parts";
import { SettingsClientsPart } from "./settings-parts";
import { SpreadPhonePart } from "./spread-parts";
import { TodayDeskPart } from "./today-desk-parts";
import { TodoSheetPart } from "./todo-sheet-parts";
import {
  TodosNotificationPart,
  TodosTrayPart,
  type TodosTrayPartState,
} from "./todos-parts";
import { WeekPart } from "./week-parts";

/**
 * The parts registry (USE-7): the capture host `/dev/parts` renders a part
 * no screen holds yet by its `?state=` name. Each wave 2 ticket appends its
 * parts below with `registerPart`.
 */

export type PartRender = () => React.ReactNode;

const PARTS = new Map<string, PartRender>();

export function registerPart(name: string, render: PartRender): void {
  if (PARTS.has(name))
    throw new Error(`A part named "${name}" is registered twice.`);
  PARTS.set(name, render);
}

export function findPart(name: string): PartRender | undefined {
  return PARTS.get(name);
}

export function partNames(): string[] {
  return [...PARTS.keys()].sort();
}

/* ---- Registered parts: one line per part, added by its ticket ---- */
registerPart("work-row", () => createElement(WorkRowForms)); // USE-10
registerPart("tier-and-item", () => createElement(TierAndItemForms)); // USE-10
registerPart("block-band-and-header", () =>
  createElement(BlockBandAndHeaderForms),
); // USE-10
// USE-11: the icon picker's six drawn states, `icon-picker-<state>`.
for (const state of [
  "emoji-suggested",
  "no-name-yet",
  "icon-tab",
  "custom-colour",
  "bad-hex",
  "saved-colours",
] satisfies IconPickerPartState[]) {
  registerPart(`icon-picker-${state}`, () =>
    createElement(IconPickerPart, { state }),
  ); // USE-11
}
// USE-16: Now's states on Taylor's Monday, `now-<state>` (the /today scenarios).
for (const state of [
  "success",
  "done-next-lifts",
  "row-tapped",
  "took-change",
  "time-taken-sheet",
  "row-long-press", // USE-18
  "reordering", // USE-18
  "header-menu", // USE-17
  "behind", // USE-17
  "transition", // USE-17
  "before-ready-go", // USE-17
  "checklist-block", // USE-17
  "sunday-checklist", // USE-17
  "todos-block", // USE-21
  "offline", // USE-21
  "error-on-check", // USE-21
  "now-loading", // USE-21
  "now-partial-todos", // USE-21
  "now-partial-block", // USE-21
  "all-done-start-next", // USE-20
  "all-done-add-more", // USE-20
  "ahead", // USE-20
  "empty-break", // USE-20
  "empty-no-blocks", // USE-20
  "not-done-closed", // USE-25
  "not-done-open", // USE-25
  "not-done-do-now", // USE-26
  "last-block", // USE-25
  "all-done", // USE-25
] satisfies NowPartState[]) {
  registerPart(`now-${state}`, () => createElement(NowPart, { state })); // USE-16
}
// USE-23: the running card and a timed Done, `running-<state>` (the /today scenarios).
for (const state of [
  "counting-down",
  "over-under-a-minute",
  "over-a-minute-or-more",
  "paused",
  "timed-done",
  "timed-over-warning",
  "several-running", // USE-24
  "running-row-focused",
  "done-on-a-running-row",
  "done-well-over",
] satisfies RunningPartState[]) {
  registerPart(`running-${state}`, () => createElement(RunningPart, { state }));
}
// USE-83: the avatar menu and the Install sheet, by their scenario names.
for (const state of [
  "account-menu",
  "account-installed",
  "account-no-photo",
  "install-iphone",
  "install-android",
  "install-browser-prompt",
  "install-other-browser",
]) {
  registerPart(state, () => createElement(AccountPart)); // USE-83
}
// USE-84: the Profile sheet's states, taken with `&sheet=profile`.
for (const state of [
  "profile",
  "profile-no-photo",
  "profile-crop",
  "profile-uploading",
  "profile-not-saved",
]) {
  registerPart(state, () => createElement(AccountPart)); // USE-84
}
// USE-28: the To-do sheet over Now, taken with `&sheet=todo&id=`.
for (const state of Object.keys(TODO_SHEET_SCENARIOS)) {
  registerPart(state, () => createElement(TodoSheetPart)); // USE-28
}
// USE-12: Orient's states, `orient-<state>` (the /orient scenarios).
for (const state of [
  "success",
  "late",
  "empty",
  "loading",
  "error",
  "offline",
  "passage-open", // USE-13
  "last-night-open", // USE-13
] satisfies OrientPartState[]) {
  registerPart(`orient-${state}`, () => createElement(OrientPart, { state })); // USE-12
}
// USE-19: the to-do reminder on the lock screen (no app screen holds it).
registerPart("todos-notification", () => createElement(TodosNotificationPart)); // USE-19
// USE-19: the tray's states on Now, by their /today scenario names.
for (const state of [
  "todos-open",
  "todos-carried",
  "todos-empty",
  "from-a-reminder",
  "todos-loading",
  "todos-error",
  "todos-check-error",
  "todos-offline",
] satisfies TodosTrayPartState[]) {
  registerPart(state, () => createElement(TodosTrayPart, { state })); // USE-19
}
// USE-51: + Add and New task, by their scenario names.
for (const state of [
  "add-sheet",
  "add-menu",
  "add-new-task",
  "add-save-to-the-pool",
] satisfies AddPartState[]) {
  registerPart(state, () => createElement(AddPart, { state })); // USE-51
}
// USE-52: From Linear on a Work tier's add row, by its scenario names.
for (const state of [
  "from-linear-by-size",
  "from-linear",
  "from-linear-size-filter",
  "from-linear-no-match",
  "from-linear-loading",
  "from-linear-error",
] satisfies FromLinearPartState[]) {
  registerPart(state, () => createElement(FromLinearPart, { state })); // USE-52
}
// USE-31: Review the day's success frame and the tray open, `review-<state>`.
// USE-37: the edits' frames, `review-first-mornings` and the rest.
// USE-38: a late wake, `review-late` and `review-late-passed-open`.
// USE-34: the system states, `review-loading` to `review-offline`.
for (const state of [
  "success",
  "tray-open",
  "first-mornings",
  "first-edit",
  "after-swap-undo",
  "no-work",
  "late",
  "late-passed-open",
  "loading",
  "error",
  "partial-todos",
  "partial-day",
  "offline",
  // USE-40: the loose Sunday, `review-sunday-<state>` and `review-empty`.
  "sunday-nothing-set",
  "sunday-making-the-checklist",
  "sunday-checklist-and-plans",
  "sunday-now-line",
  "empty",
] satisfies ReviewPartState[]) {
  registerPart(`review-${state}`, () => createElement(ReviewPart, { state }));
}
// USE-43: the Ready, go welcome, `ready-<state>`.
for (const state of [
  "welcome",
  "first-go-ever",
  "late-wake",
  "checklist-day",
  "offline",
] satisfies ReadyPartState[]) {
  registerPart(`ready-${state}`, () => createElement(ReadyPart, { state }));
}
// USE-22: a meal's topics and the Meal topics sheet, by their scenario names.
for (const state of [
  "meal-pick-topic",
  "meal-topic-picked",
  "meal-topics-sheet",
] satisfies MealTopicPartState[]) {
  registerPart(state, () => createElement(MealTopicPart, { state })); // USE-22
}
// USE-64: the Item sheet over Now, taken with `&sheet=item&id=`.
for (const state of Object.keys(ITEM_SHEET_SCENARIOS)) {
  registerPart(state, () => createElement(ItemSheetPart)); // USE-64
}
// USE-69: Move to, in the Item sheet over Now, or the work menu's own sheet.
for (const [state, part] of [
  ["move-plain", "sheet"],
  ["move-pick-a-day", "sheet"],
  ["move-no-kind", "sheet"],
  ["move-linear", "sheet"],
  ["move-work", "work"],
  ["move-undo", "undo"],
] satisfies [string, MoveToPartState][]) {
  registerPart(state, () => createElement(MoveToPart, { state: part })); // USE-69
}
// USE-46: the New block sheet, opened on load by each scenario.
for (const state of Object.keys(NEW_BLOCK_SCENARIOS)) {
  registerPart(state, () => createElement(NewBlockSheetPart)); // USE-46
}
// USE-44: Close the day's states, `close-<state>` (the /day/…/journal scenarios).
for (const state of [
  "journal",
  "empty",
  "offline",
  "read-only",
  "nothing-written",
] satisfies JournalPartState[]) {
  registerPart(`close-${state}`, () => createElement(JournalPart, { state })); // USE-44
}
// USE-54: add from the rail over Review the day, `rail-<state>`.
for (const state of [
  "drag",
  "add-sheet",
  "add-preset-tier",
  "added-undo",
] satisfies RailAddPartState[]) {
  registerPart(`rail-${state}`, () => createElement(RailAddPart, { state }));
}
// USE-72: the Week, under the week scenarios' names.
for (const state of Object.keys(WEEK_SCENARIOS)) {
  registerPart(state, () => createElement(WeekPart));
}
// USE-39: Set my days, under its scenarios' names.
for (const state of Object.keys(DAYS_SCENARIOS)) {
  registerPart(state, () => createElement(DaysPart));
}
// USE-58: the desk's Today frame, under the today-desk scenarios' names.
for (const state of Object.keys(TODAY_DESK_SCENARIOS)) {
  registerPart(state, () => createElement(TodayDeskPart));
}
// USE-60: Step away, the ask and a session's Done, on the same frame.
for (const state of Object.keys(STEP_AWAY_SCENARIOS)) {
  registerPart(state, () => createElement(TodayDeskPart));
}
// USE-82: nothing planned and no work slotted, on the same frame.
for (const state of Object.keys(TODAY_EMPTY_SCENARIOS)) {
  registerPart(state, () => createElement(TodayDeskPart));
}
// USE-70: the row gestures, the swipe held and the work menu open.
for (const state of Object.keys(GESTURE_SCENARIOS)) {
  registerPart(state, () => createElement(TodayDeskPart));
}
// USE-27: Schedule's states, `schedule-<state>` (the drawn four by their names).
for (const state of [
  "during-go",
  "checks-and-running",
  "checklist-day",
  "meeting-inside-a-block",
  "schedule-empty",
  "schedule-loading",
  "schedule-error",
  "schedule-partial",
  "schedule-offline",
] satisfies SchedulePartState[]) {
  const name = state.startsWith("schedule-") ? state : `schedule-${state}`;
  registerPart(name, () => createElement(SchedulePart, { state }));
}
// USE-62: a meeting inside the Work block, on the same frame.
for (const state of Object.keys(TODAY_MEETING_SCENARIOS)) {
  registerPart(state, () => createElement(TodayDeskPart));
}
// USE-86: Connections with clients on and its two sheets, by their scenario names.
for (const state of Object.keys(SETTINGS_SCENARIOS)) {
  registerPart(state, () => createElement(SettingsClientsPart)); // USE-86
}
// USE-48: Block view from the day, under the block-view scenarios' names.
for (const state of Object.keys(BLOCK_VIEW_SCENARIOS)) {
  registerPart(state, () => createElement(BlockViewPart)); // USE-48
}
// USE-79: the phone's pool sheet, by its scenario names.
for (const state of Object.keys(POOL_SHEET_SCENARIOS)) {
  registerPart(state, () =>
    createElement(PoolSheetPart, { state: state as PoolSheetScenarioName }),
  );
}
// USE-78: Spread's full sheet and its Days and tier page, on the phone.
for (const state of Object.keys(SPREAD_PHONE_SCENARIOS)) {
  registerPart(state, () =>
    createElement(SpreadPhonePart, {
      state: state as SpreadPhoneScenarioName,
    }),
  );
}
// USE-80: the place sheet, placed with Undo and doesn't fit, on the phone.
for (const state of Object.keys(PLACE_SHEET_SCENARIOS)) {
  registerPart(state, () =>
    createElement(PlaceSheetPart, { state: state as PlaceSheetScenarioName }),
  );
}
// USE-81: This week's day with its work parts, on Set my days.
for (const state of Object.keys(THIS_WEEK_DAY_SCENARIOS)) {
  registerPart(state, () => createElement(DaysPart));
}
