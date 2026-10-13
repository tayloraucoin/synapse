"use client";

import { BLOCKS_PRIMER_COPY, BlocksPrimer } from "@/components/blocks-primer";

import { FactScreen } from "./fact-screen";

/**
 * Screen 2 — *Days are built in blocks.* (UX v1.3 §4.2, R47; DAY-8).
 *
 * One read: the example day and the legend, then *Continue*. Nothing to
 * save and no skip — "the screen is one read". The primer lives in
 * `components/blocks-primer/` because Settings may show it later as *How
 * days are built* `[REVISIT — not in v1.3's Settings list; the folder is the
 * seam]`.
 */
export function Step2Blocks() {
  return (
    <FactScreen
      step={2}
      heading={BLOCKS_PRIMER_COPY.heading}
      body={BLOCKS_PRIMER_COPY.body}
      save={null}
      skippable={false}
    >
      <BlocksPrimer />
    </FactScreen>
  );
}
