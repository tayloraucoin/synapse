import { weekdayForDayKey } from "@syn/utils";

/** "Monday, 12 October": weekday, day, month; no year. Orient's date and Last night's. */
export function dateLabelOf(dateKey: string): string {
  const [, month = 1, day = 1] = dateKey.split("-").map(Number);
  const monthName = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, month - 1, 1, 12)));
  return `${weekdayForDayKey(dateKey)}, ${day} ${monthName}`;
}
