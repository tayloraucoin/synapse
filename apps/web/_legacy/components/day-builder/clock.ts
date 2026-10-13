import { clockFromMinutes, clockToMinutes, formatClockFromMinutes } from "@syn/utils";

/**
 * The builder's clock helpers — the views carry display clocks ("9:00",
 * "9:00 AM"); the fields and the arithmetic want "HH:mm" and minutes.
 */

/** "9:00" / "9:00 AM" / "09:00:00" → "09:00". Null stays null. */
export function toInputClock(clock: string | null | undefined): string | null {
  if (clock === null || clock === undefined || clock === "") return null;
  const pm = /PM$/i.test(clock);
  const am = /AM$/i.test(clock);
  const [hour = "0", minute = "00"] = clock.replace(/\s?[AP]M$/i, "").split(":");
  let h = Number(hour);
  if (pm && h < 12) h += 12;
  if (am && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${minute.slice(0, 2)}`;
}

/** "HH:mm" → minutes from midnight; null stays null. */
export function minutesOf(clock: string | null | undefined): number | null {
  const input = toInputClock(clock);
  return input === null ? null : clockToMinutes(input);
}

/** Minutes → "9:00" as the lines read it. */
export const display = (minutes: number): string => formatClockFromMinutes(minutes);

/** Minutes → "HH:mm" as a field holds it. */
export const input = (minutes: number): string => clockFromMinutes(minutes);

/** "2 h" · "1 h 30" · "45 min" */
export function spanLabel(minutes: number): string {
  const total = Math.max(0, minutes);
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${rest}`;
}

/** The letter of *Day A* — for *Getting ready A*; the whole name when there is none. */
export function letterOf(planName: string): string {
  const match = /^Day\s+([A-Z]+)$/i.exec(planName.trim());
  return match?.[1]?.toUpperCase() ?? planName.trim();
}

export const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const WEEKDAY_LONG = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
