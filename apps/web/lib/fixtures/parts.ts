import type * as React from "react";

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
