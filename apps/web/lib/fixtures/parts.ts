import type * as React from "react";
import { createElement } from "react";
import {
  BlockBandAndHeaderForms,
  TierAndItemForms,
  WorkRowForms,
} from "./day-parts";
import { AccountPart } from "./account-parts";
import { AddPart, type AddPartState } from "./add-parts";
import { IconPickerPart, type IconPickerPartState } from "./icon-picker-parts";
import { NowPart, type NowPartState } from "./now-parts";
import { OrientPart, type OrientPartState } from "./orient-parts";
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
] satisfies NowPartState[]) {
  registerPart(`now-${state}`, () => createElement(NowPart, { state })); // USE-16
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
registerPart("todos-notification", () =>
  createElement(TodosNotificationPart),
); // USE-19
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
