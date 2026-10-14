import type * as React from "react";
import { createElement } from "react";
import {
  BlockBandAndHeaderForms,
  TierAndItemForms,
  WorkRowForms,
} from "./day-parts";
import { IconPickerPart, type IconPickerPartState } from "./icon-picker-parts";

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
