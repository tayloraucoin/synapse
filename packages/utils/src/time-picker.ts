/**
 * The 24-hour time picker's pure parts (USE-141; set-my-days states/
 * time-picker.md): the options in each list, a clock split and joined, and
 * where a key moves a list's pick. The control in @syn/ui renders these;
 * keeping them here lets node tests prove the keyboard without a DOM.
 */

/** Hours as the list shows them, 0 to 23. */
export const PICKER_HOURS: readonly number[] = Array.from(
  { length: 24 },
  (_, hour) => hour,
);

/** Minutes in steps (5 by default): 0, 5 … 55. */
export function pickerMinutes(step = 5): number[] {
  const size = Math.max(1, Math.min(60, Math.floor(step)));
  return Array.from({ length: Math.ceil(60 / size) }, (_, i) => i * size);
}

/** "07:03" to { hour: 7, minute: 3 }; null for anything else. */
export function splitClock(
  value: string | null | undefined,
): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

/** { 7, 3 } to "07:03", the value every TimeField carries. */
export function joinClock(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** The keys a list answers; anything else leaves it alone. */
export type PickerKey =
  | "ArrowUp"
  | "ArrowDown"
  | "PageUp"
  | "PageDown"
  | "Home"
  | "End";

const PAGE = 5;

/**
 * Where a key moves a list's pick, by index; null when the key is not the
 * list's. With no pick yet, a move starts from the top (Home) or the end.
 * Moves stop at the ends: a clock list never wraps from 23 to 0.
 */
export function pickerKeyMove(
  index: number | null,
  count: number,
  key: string,
): number | null {
  if (count <= 0) return null;
  const last = count - 1;
  const from = index ?? -1;
  switch (key as PickerKey) {
    case "ArrowDown":
      return Math.min(last, from + 1);
    case "ArrowUp":
      return index === null ? last : Math.max(0, from - 1);
    case "PageDown":
      return Math.min(last, Math.max(0, from) + PAGE);
    case "PageUp":
      return index === null ? 0 : Math.max(0, from - PAGE);
    case "Home":
      return 0;
    case "End":
      return last;
    default:
      return null;
  }
}

/**
 * Digits typed ahead into a list ("1", then "17"): the option they name
 * exactly, else the first that starts with them; null when none does.
 */
export function pickerTypeAhead(
  options: readonly number[],
  typed: string,
): number | null {
  if (!/^\d+$/.test(typed)) return null;
  const exact = options.indexOf(Number(typed));
  if (exact !== -1) return exact;
  const index = options.findIndex((option) =>
    String(option).startsWith(typed),
  );
  return index === -1 ? null : index;
}

/**
 * What a person typed in a time field, read as "HH:mm": "6:30", "06:30",
 * "630", "0630", "6" or "18.15"; null when it is not a time, so the field
 * puts its own value back. Any minute is kept as typed.
 */
export function parseTypedClock(typed: string): string | null {
  const text = typed.trim().replace(/[.h]/g, ":");
  const parts = text.includes(":")
    ? text.split(":")
    : text.length <= 2
      ? [text, "0"]
      : [text.slice(0, -2), text.slice(-2)];
  if (parts.length !== 2 || !parts.every((part) => /^\d{1,2}$/.test(part))) {
    return null;
  }
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  return hour > 23 || minute > 59 ? null : joinClock(hour, minute);
}

