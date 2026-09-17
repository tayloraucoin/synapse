"use client";

import * as React from "react";

import { Text } from "@syn/ui";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";

/**
 * Screen 9 — *Your routine, ranked*, as a PLACEHOLDER (UX v1.2 §4.9; RUN-8).
 *
 * v1.2 splits v1.1's screen 8 in two: the landscape (8) and the ranking with
 * versions (9, RUN-10). Until RUN-10 ships, the number must still render a
 * screen with a way through — a sequence that 404s in the middle is a
 * person stranded — so this is the heading and *Continue*, nothing else.
 */
export function Step9Ranked() {
  return (
    <FactScreen step={9} heading={COPY.step9Heading} save={null}>
      <Text as="p" tone="secondary">
        {COPY.step9Placeholder}
      </Text>
    </FactScreen>
  );
}
