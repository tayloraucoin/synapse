import type { IconValue } from "@syn/types";
import type { TodoInput } from "@syn/validators";

/**
 * A to-do's five types with their glyphs (type-open.md; D-USE-35), in the
 * drawn order. The glyph is `IconValue` data, not copy (R29); Other has
 * none and draws a small dot.
 */

export type TodoType = TodoInput["type"];

const emoji = (value: string): IconValue => ({ kind: "emoji", value });

export const TODO_TYPE_OPTIONS: readonly {
  value: TodoType;
  icon: IconValue | null;
  label: string;
}[] = [
  { value: "home", icon: emoji("🏠"), label: "Home" },
  { value: "errand", icon: emoji("🚗"), label: "Errand" },
  { value: "call", icon: emoji("📞"), label: "Call" },
  { value: "digital", icon: emoji("💻"), label: "Digital" },
  { value: "other", icon: null, label: "Other" },
];
