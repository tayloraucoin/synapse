"use client";

import type * as React from "react";
import { Text } from "@syn/ui";
import { NOW_COPY as COPY } from "./copy";

/**
 * "Took 10 min · Change" under a row just done (D-USE-13): the planned
 * length is already recorded; Change opens the time-taken sheet. Reachable
 * by keyboard while it shows.
 */
export function TookLine({
  min,
  onChange,
  changeRef,
}: {
  min: number;
  onChange: () => void;
  changeRef?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <p className="flex items-baseline gap-(--space-1)">
      <Text as="span" variant="caption" className="tabular-nums">
        {COPY.took(min)}
      </Text>
      <button
        ref={changeRef}
        type="button"
        onClick={onChange}
        className="text-accent-text cursor-pointer rounded-(--radius-control) text-(length:--fs-caption) leading-(--lh-caption) font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {COPY.change}
      </button>
    </p>
  );
}
