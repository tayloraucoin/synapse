/**
 * TimePicker's words (USE-141; set-my-days states/time-picker.md). The
 * field's label names the dialog and the trigger; the lists are Hour and
 * Minute.
 */
export const TIME_PICKER_COPY = {
  choose: (label: string) => `Choose a time for ${label}`,
  hour: "Hour",
  minute: "Minute",
  helper: "24-hour. Any minute can be typed in the field.",
  done: "Done",
  close: "Close",
} as const;
