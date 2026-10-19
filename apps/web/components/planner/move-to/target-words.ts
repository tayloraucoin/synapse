import type { MoveSubject, MoveTarget } from "@/lib/data/move-to";
import { MOVE_TO_COPY as COPY } from "./copy";

/**
 * A target's row and toast in Move to's words (USE-69): where it lands,
 * then its consequence (fits with the room left, or how far past its end),
 * said before the tap; the toast names where it went.
 */
export interface TargetWords {
  label: string;
  line: string;
  toast: string;
}

export function targetWords(
  target: MoveTarget,
  subject: MoveSubject,
  todayKey: string,
  /** The picked day is already set (no "follows the usual" line). */
  pickedSet = false,
): TargetWords {
  if (target.kind === "pool") {
    return { label: COPY.pool, line: COPY.poolLine, toast: COPY.toast.pool };
  }
  if (target.kind === "todos") {
    return {
      label: COPY.noKindRow(target.dateKey, subject.blockName),
      line: COPY.noKindLine(target.dateKey, pickedSet),
      toast: COPY.toast.todos(target.dateKey),
    };
  }
  if (target.kind === "none") {
    return {
      label: COPY.noKindRow(target.dateKey, "Work"),
      line: target.reason === "holds" ? COPY.holdsLine : COPY.noWorkLine,
      toast: "",
    };
  }

  const { fit, blockName: block, startsAt: start } = target;
  const lower =
    fit.fits && fit.freeMin !== null
      ? COPY.fitsFree(fit.freeMin)
      : fit.runsTo !== null && fit.overMin !== null
        ? COPY.runsPastLower(fit.runsTo, fit.overMin)
        : null;
  const work = subject.type === "work";
  const stays = (fitWords: string | null) =>
    work
      ? fitWords === null
        ? COPY.stays(subject.tier)
        : COPY.staysIn(subject.tier, fitWords)
      : "";

  if (target.when === "later") {
    return {
      label: COPY.blockRow(block, start, target.endsAt),
      line: work
        ? stays(lower)
        : fit.fits && fit.freeMin !== null
          ? COPY.goesAfter(target.after, fit.freeMin)
          : fit.runsTo !== null && fit.overMin !== null
            ? COPY.runsPast(fit.runsTo, fit.overMin)
            : COPY.goesAfter(target.after, 0),
      toast: COPY.toast.later(block, start),
    };
  }
  if (target.when === "tomorrow") {
    return {
      label: COPY.tomorrowRow(block, start),
      line: work
        ? COPY.dayTier(target.dateKey, subject.tier)
        : COPY.dayAtEnd(target.dateKey, block),
      toast: COPY.toast.tomorrow(block, start),
    };
  }
  return {
    label: COPY.pickedRow(target.dateKey, block, start),
    line: work
      ? stays(lower)
      : lower === null
        ? COPY.atEndAlone(block)
        : COPY.atEnd(block, lower),
    toast: COPY.toast.picked(COPY.pick.action(target.dateKey, todayKey)),
  };
}
