import type * as React from "react";
import { createElement } from "react";
import { AccountPart } from "./account-parts";
import { AddPart, type AddPartState } from "./add-parts";
import {
  BlockBandAndHeaderForms,
  TierAndItemForms,
  WorkRowForms,
} from "./day-parts";
import { IconPickerPart, type IconPickerPartState } from "./icon-picker-parts";
import { ItemSheetPart } from "./item-sheet-parts";
import { MealTopicPart, type MealTopicPartState } from "./meal-topic-parts";
import { NowPart, type NowPartState } from "./now-parts";
import { ITEM_SHEET_SCENARIOS } from "./scenarios/item-sheet";
import { OrientPart, type OrientPartState } from "./orient-parts";
import { ReviewPart, type ReviewPartState } from "./review-parts";
import { RunningPart, type RunningPartState } from "./running-parts";
import { TODO_SHEET_SCENARIOS } from "./scenarios/todo-sheet";
import { TodoSheetPart } from "./todo-sheet-parts";
import {
  TodosNotificationPart,
  TodosTrayPart,
  type TodosTrayPartState,
} from "./todos-parts";

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
// USE-31: Review the day's success frame and the tray open, `review-<state>`.
for (const state of ["success", "tray-open"] satisfies ReviewPartState[]) {
  registerPart(`review-${state}`, () => createElement(ReviewPart, { state }));
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
