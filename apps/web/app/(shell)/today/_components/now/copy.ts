import { formatClockFromMinutes } from "@syn/utils";

/**
 * Now's words (USE-16; day/now/words-and-access.md). No second person, no
 * count of what is left; times and lengths are the only numbers.
 */

/** "HH:MM" to the boards' clock, "7:10": twelve-hour, no meridiem. */
export function clockLabel(clock: string): string {
  const [hour = "0", minute = "0"] = clock.split(":");
  const text = formatClockFromMinutes(Number(hour) * 60 + Number(minute));
  return text.replace(/\s?[AP]M$/i, "");
}

export const NOW_COPY = {
  title: "Now",
  todos: "To-dos",
  span: (startsAt: string, endsAt: string) =>
    `${clockLabel(startsAt)} to ${clockLabel(endsAt)}`,
  length: (min: number | null) => (min === null ? null : `${min} min`),
  meta: (min: number | null, at: string | null) =>
    [min === null ? null : `${min} min`, at === null ? null : clockLabel(at)]
      .filter((part) => part !== null)
      .join(" · "),
  start: "Start",
  done: "Done",
  doneName: (title: string) => `Done, ${title}`,
  liftedName: (title: string) => `${title}, now`,
  boxName: (title: string, min: number | null) =>
    min === null ? title : `${title}, ${min} min`,
  rowName: (title: string) => `${title}, make current`,
  gripName: (title: string) => `Reorder ${title}`,
  blockMenu: (block: string) => `${block} options`,
  blockMenuTitle: (block: string) => `${block}, today`,
  seeTheWholeDay: "See the whole day",
  took: (min: number) => `Took ${min} min ·`,
  change: "Change",
  announceDone: (title: string, next: string | null) =>
    next === null ? `${title} done.` : `${title} done. ${next} is next.`,
  sheet: {
    planned: (title: string, min: number | null) =>
      min === null ? title : `${title} · planned ${min} min`,
    title: "Time taken",
    field: "Minutes",
    save: "Save",
    close: "Close",
  },
} as const;

/**
 * How long "Took <n> min · Change" stays after a Done: about six seconds,
 * N4's chip time (took-change.md [ASSUMPTION]).
 */
export const TOOK_LINE_MS = 6000;
