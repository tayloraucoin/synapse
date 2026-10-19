import type { Metadata } from "next";
import { ORIENT_COPY, OrientFrame } from "./_components";

export const metadata: Metadata = { title: ORIENT_COPY.title };

/**
 * `/orient`: the first screen of the morning (USE-12; D-USE-5, D-USE-9), on
 * fixtures through `useMorning` until the day-records wiring.
 *
 * THE OPEN IS THE WAKE. The frame stamps `orientedAt` once, at the open, and
 * the server keeps the first. A day already oriented, readied or closed goes
 * on through the entry tree (`resolveDayEntry`): Orient is shown once a day.
 *
 * Bare: no header, no rail, no tabs (`isFocusedPath`). The frame renders
 * `main` itself.
 */
export default function OrientPage() {
  return <OrientFrame />;
}
