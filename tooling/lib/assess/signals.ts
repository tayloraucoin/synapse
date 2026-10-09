/**
 * The seventeen signals in table order (assess.md): S1, S2, C1 to C5, V1 to V5,
 * P1 to P5. V5 reads the toolkit checkout's reviewer globs, so the list is
 * built per toolkit root; SIGNALS is the list for the checkout this file sits in.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import { C1, C2, C3, C4, C5 } from "./checks.ts";
import { makeV5, readToolkitGlobs, V1, V2, V3, V4 } from "./conventions.ts";
import { P1, P2, P3, P4, P5 } from "./process.ts";
import type { Repo } from "./repo.ts";
import { S1, S2 } from "./shape.ts";
import type { Signal, SignalResult } from "./signal.ts";

/** The toolkit checkout this file sits in. */
export const OWN_TOOLKIT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

export function buildSignals(toolkitRoot: string = OWN_TOOLKIT): Signal[] {
  return [
    S1,
    S2,
    C1,
    C2,
    C3,
    C4,
    C5,
    V1,
    V2,
    V3,
    V4,
    makeV5(readToolkitGlobs(toolkitRoot)),
    P1,
    P2,
    P3,
    P4,
    P5,
  ];
}

export const SIGNALS: Signal[] = buildSignals();

export function measureSignals(
  repo: Repo,
  signals: Signal[] = SIGNALS,
): SignalResult[] {
  return signals.map((signal) => {
    try {
      return { id: signal.id, ...signal.measure(repo) };
    } catch (error) {
      return {
        id: signal.id,
        value: null,
        score: null,
        evidence: `detector failed: ${(error as Error).message}`,
      };
    }
  });
}
