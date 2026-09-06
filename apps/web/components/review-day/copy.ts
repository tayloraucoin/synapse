/**
 * RV-00, DR-01 and DR-07's strings — Epic 3 §1 and §2, and official spec §10.
 *
 * NOTHING HERE EVALUATES. Epic 3 §6's never-list is the test: no *failed*, no
 * *skipped*, no *streak*, no *great*, no *only*, no *just*, no *again*. A
 * review is a record of what happened, and a word that grades it turns the one
 * ceremony in the product into a report card.
 *
 * NO NUMBER APPEARS BEFORE THE DECISIONS. Every count on DR-01 is of things —
 * items done, items to decide — and the one percent lives in DR-07 alone.
 */
export const REVIEW_COPY = {
  /* ------------------------------------------------------------ RV-00 -- */
  title: "Review",
  today: "Today",
  thisWeek: "This week",
  closeOutToday: "Close out today",
  open: "Open",
  everyItemWasDone: "Every item was done.",
  nothingWasAssigned: "Nothing was assigned.",
  /** "7 of 9 done · 2 to decide" */
  todayStatus: (done: number, assigned: number, undone: number) =>
    `${done} of ${assigned} done · ${undone} to decide`,
  reviewedAt: (clock: string, percent: number) =>
    `Reviewed at ${clock} · ${percent}%`,
  /** "3 of 5 days reviewed" */
  weekStatus: (reviewed: number, planned: number) =>
    `${reviewed} of ${planned} days reviewed`,
  weekSoFar: (percent: number) => `${percent}% so far`,
  weekFinal: (percent: number) => `${percent}%`,
  pendingRow: (weekday: string, n: number) =>
    `${weekday} has ${n} ${n === 1 ? "item" : "items"} to decide`,
  pastWeeksAndDays: "Past weeks and days",
  loadError: "Couldn't load. Pull to try again.",

  /* ------------------------------------------------------------ DR-01 -- */
  toDecide: "To decide",
  cutWhenShifted: "Cut when shifted",
  doneSection: "Done",
  reflections: (rated: number, rateable: number) =>
    `Reflections · ${rated} of ${rateable}`,
  finishLater: "Finish later",
  finishReview: "Finish review",
  edit: "edit",

  /** "7 of 9 done · 2 moved · 1 not assigned · 1 cut when shifted" */
  summary: (parts: {
    done: number;
    assigned: number;
    moved: number;
    notAssigned: number;
    cut: number;
  }): string => {
    const out = [`${parts.done} of ${parts.assigned} done`];
    if (parts.moved > 0) out.push(`${parts.moved} moved`);
    if (parts.notAssigned > 0) out.push(`${parts.notAssigned} not assigned`);
    if (parts.cut > 0) out.push(`${parts.cut} cut when shifted`);
    return out.join(" · ");
  },
  nothingAssignedToday: "Nothing was assigned today.",
  closedAtPending: (clock: string, n: number) =>
    `Closed at ${clock} — ${n} to decide`,

  doneRow: (clock: string) => `done ${clock}`,
  doneRowMoved: (clock: string, planned: string) =>
    `done ${clock} · moved from ${planned}`,

  /**
   * A write that failed. Epic 3 DR-01's error state, and the promise it makes
   * is literal in Phase 1: the panels keep their state until a retry, because
   * nothing is thrown away on a failed request.
   */
  saveError:
    "Couldn't save the review. Your decisions are kept on this device — try again.",

  /* ------------------------------------------------------------ DR-07 -- */
  reviewed: "Reviewed",
  done: "Done",
  offScheduleFact: (moved: number, done: number) =>
    `Off-schedule: ${moved} of ${done} done.`,
  shiftedFact: (totalMin: number, count: number) =>
    `Shifted +${totalMin} min (${count} ${count === 1 ? "shift" : "shifts"}).`,
  carriedFact: (n: number) => `${n} carried to tomorrow.`,
  notAssignedFact: (n: number) => `${n} not assigned today.`,
  /** "By priority — high (5–7): 2.5 of 3 · mid (3–4): 1 of 2" */
  byPriority: (
    bands: ReadonlyArray<{ label: string; credit: number; counted: number }>,
  ) =>
    // `String` gives the decimal only where a half exists — 2.5 reads "2.5"
    // and 3 reads "3", which is the rule without a helper to enforce it.
    `By priority — ${bands
      .map((band) => `${band.label}: ${band.credit} of ${band.counted}`)
      .join(" · ")}`,
  bandHigh: "high (5–7)",
  bandMid: "mid (3–4)",
  bandLow: "low (1–2)",
} as const;
