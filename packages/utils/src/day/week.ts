import { addDays } from "./wall-clock";

/**
 * Weeks start Monday, in the person's stored zone (cross-cutting §7.4).
 *
 * All of this is calendar arithmetic on a `YYYY-MM-DD` key, done in UTC — not
 * because the week has no zone, but because the key already carries it: the
 * key was computed in the person's zone, and asking "which Monday does this
 * date belong to" is a question about a calendar, not a clock.
 */

const MS_PER_DAY = 86_400_000;

function toUtc(dateKey: string): Date {
  const [year = "0", month = "1", day = "1"] = dateKey.split("-");
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

function toKey(at: Date): string {
  return `${at.getUTCFullYear()}-${String(at.getUTCMonth() + 1).padStart(2, "0")}-${String(at.getUTCDate()).padStart(2, "0")}`;
}

/** Monday = 0 … Sunday = 6 — the product's weekday index, not JavaScript's. */
export function weekdayIndex(dateKey: string): number {
  return (toUtc(dateKey).getUTCDay() + 6) % 7;
}

export function mondayOf(dateKey: string): string {
  return addDays(dateKey, -weekdayIndex(dateKey));
}

/**
 * The ISO week key, `YYYY-Www`.
 *
 * ISO's rule: a week belongs to the year containing its Thursday. That is why
 * 1 January 2026 — a Thursday-less tail of 2025's last week — is `2025-W01`
 * rather than `2026-W01`, and why this cannot be `Math.ceil(dayOfYear / 7)`.
 */
export function weekKeyOf(dateKey: string): string {
  const monday = toUtc(mondayOf(dateKey));
  const thursday = new Date(monday.getTime() + 3 * MS_PER_DAY);
  const year = thursday.getUTCFullYear();

  const firstThursday = (() => {
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const jan4Monday = new Date(
      jan4.getTime() - ((jan4.getUTCDay() + 6) % 7) * MS_PER_DAY,
    );
    return new Date(jan4Monday.getTime() + 3 * MS_PER_DAY);
  })();

  const week =
    Math.round((thursday.getTime() - firstThursday.getTime()) / (7 * MS_PER_DAY)) + 1;

  return `${year}-W${String(week).padStart(2, "0")}`;
}

/** The seven day keys of a week, Monday first. */
export function weekDates(weekKey: string): string[] {
  const [yearRaw = "0", weekRaw = "W01"] = weekKey.split("-");
  const year = Number(yearRaw);
  const week = Number(weekRaw.replace("W", ""));

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Monday = new Date(
    jan4.getTime() - ((jan4.getUTCDay() + 6) % 7) * MS_PER_DAY,
  );
  const monday = new Date(jan4Monday.getTime() + (week - 1) * 7 * MS_PER_DAY);

  return Array.from({ length: 7 }, (_, index) =>
    toKey(new Date(monday.getTime() + index * MS_PER_DAY)),
  );
}
