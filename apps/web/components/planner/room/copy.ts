import { clockLabel } from "../day-column/copy";

/**
 * Make room's and A later start's words (USE-41; make-room/states/sheet.md,
 * later-start/states/cut-some.md and slide.md), as drawn. No second person
 * ("Up at 8:10"), nothing missed or late; minutes are lengths, and every
 * figure in them is the engine's.
 */

/** "70 min": the sheets count in minutes, as drawn, past an hour too. */
const lengthWords = (minutes: number) => `${minutes} min`;

/** "Wellness and Training", "Meditate, Journal and Cold bath". */
function joined(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

const sentence = (text: string) =>
  text.length === 0 ? text : `${text[0]!.toUpperCase()}${text.slice(1)}`;

export const ROOM_COPY = {
  close: "Close",
  length: lengthWords,

  makeRoom: {
    /** "Adding Foam roll, 10 min at 8:45" */
    scope: (title: string, lengthMin: number, at: string | null) =>
      `Adding ${title}, ${lengthWords(lengthMin)}${at ? ` at ${clockLabel(at)}` : ""}`,
    /** "Make room for 10 min" */
    title: (lengthMin: number) => `Make room for ${lengthWords(lengthMin)}`,
    sources: "Where the minutes come from",
    fromBlock: (block: string) => `From ${block}`,
    fromOthers: "From other blocks",
    /** "35 min, now 28 min" */
    itemLine: (lengthMin: number, nowMin: number | null) =>
      nowMin === null
        ? lengthWords(lengthMin)
        : `${lengthWords(lengthMin)}, now ${lengthWords(nowMin)}`,
    /** "Gap before Breakfast"; a gap inside a block [ASSUMPTION]: "Free time in Training". */
    gapBefore: (block: string) => `Gap before ${block}`,
    gapIn: (block: string) => `Free time in ${block}`,
    gapAtEnd: (block: string) => `Free time after ${block}`,
    /** "3 min free" */
    free: (minutes: number) => `${lengthWords(minutes)} free`,
    /** Why a row never gives (D-USE-11): travel as drawn; the rest [ASSUMPTION]. */
    locked: {
      travel: "Travel time stays as it is",
      set_time: "At a set time, stays as it is",
      day_event: "At a set time, stays as it is",
      orient: "Orient stays as it is",
      done: "Done today, stays as it is",
    },
    /** The other blocks' rows name their block [ASSUMPTION]. */
    inBlock: (line: string, block: string) => `${block} · ${line}`,
    stepper: (title: string) => `Minutes from ${title}`,
    /** "10 of 10 min found" counts minutes, a length. */
    found: (found: number, needed: number) =>
      `${found} of ${lengthWords(needed)} found`,
    decide: "Decide for me",
    decideLater: "Not available yet",
    apply: "Make room",
    /** The Toaster [ASSUMPTION: no words drawn]. "Foam roll added to Training. Workout: gym gave 7 min." */
    placed: (
      title: string,
      block: string,
      gave: readonly { name: string; minutes: number }[],
    ) => {
      const head = `${title} added to ${block}.`;
      if (gave.length === 0) return head;
      const parts = gave.map(
        (part) => `${part.name} gave ${lengthWords(part.minutes)}`,
      );
      return `${head} ${sentence(joined(parts))}.`;
    },
    /** Names a gap gives under, in a Toaster. */
    gapGave: {
      after: (block: string) => `the gap before ${block}`,
      inside: (block: string) => `free time in ${block}`,
    },
  },

  later: {
    /** "Up at 8:10 · planned from 7:00" */
    scope: (wokeAt: string, upAt: string) =>
      `Up at ${clockLabel(wokeAt)} · planned from ${clockLabel(upAt)}`,
    title: "A later start",
    /** "The morning is 70 min short. Cut some, or slide the day back." */
    line: (short: number) =>
      `The morning is ${lengthWords(short)} short. Cut some, or slide the day back.`,
    ways: "How to fit the morning",
    cut: "Cut some",
    slide: "Slide the day back",
    /** "Wellness · 7:05 to 8:00" */
    blockHead: (name: string, startsAt: string, endsAt: string) =>
      `${name} · ${clockLabel(startsAt)} to ${clockLabel(endsAt)}`,
    cutBlock: "Cut the block",
    cutBlockLabel: (name: string) => `Cut ${name}`,
    swap: "Swap for a shorter one",
    /** "Drive there and home go with the workout"; one drive [ASSUMPTION]. */
    travel: (count: number, goesWith: string) =>
      count > 1
        ? `Drive there and home go with the ${goesWith}`
        : `The drive goes with the ${goesWith}`,
    showLater: "Show later blocks",
    /** "25 of 70 min cut. The rest slides: Breakfast 9:45, Work 10:15." */
    cutFoot: (
      cut: number,
      short: number,
      slides: readonly { name: string; at: string }[],
    ) =>
      slides.length === 0
        ? `${cut} of ${lengthWords(short)} cut.`
        : `${cut} of ${lengthWords(short)} cut. The rest slides: ${slides
            .map((slide) => `${slide.name} ${clockLabel(slide.at)}`)
            .join(", ")}.`,
    notNow: "Not now",
    applyCut: "Cut these, slide the rest",
    /** "Everything keeps its length, 70 min later" */
    slideHead: (minutes: number) =>
      `Everything keeps its length, ${lengthWords(minutes)} later`,
    /** A row's name for assistive tech: "Wellness, from 7:05 to 8:15". */
    slideRow: (name: string, from: string, to: string) =>
      `${name}, from ${clockLabel(from)} to ${clockLabel(to)}`,
    /** "At a set time, stays at 11:00. Work splits around it." */
    setTime: (at: string, block: string) =>
      `At a set time, stays at ${clockLabel(at)}. ${block} splits around it.`,
    /** "The day ends 70 min later: Lights out at 23:40." */
    slideFoot: (minutes: number, endsAt: string) =>
      `The day ends ${lengthWords(minutes)} later: Lights out at ${clockLabel(endsAt)}.`,
    /** A slide that would pass midnight [ASSUMPTION]: nothing to apply. */
    pastMidnight: "The day would run past midnight. Cut some first.",
    applySlide: "Slide the day back",
    /** The Toasters [ASSUMPTION: no words drawn]. */
    cutDone: (names: readonly string[], stillShort: number) =>
      stillShort === 0
        ? `${joined(names)} off today.`
        : `${joined(names)} off today. The rest slides ${lengthWords(stillShort)}.`,
    slid: (minutes: number) => `The day slides ${lengthWords(minutes)}.`,
  },
} as const;
