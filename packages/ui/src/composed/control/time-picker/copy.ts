/**
 * TimePicker's words (USE-141; set-my-days states/time-picker.md). The
 * field's label names the dialog and the trigger; the lists are Hour and
 * Minute.
 */
export const TIME_PICKER_COPY = {
  /** The clock's name carries the time, so it is heard again after Done. */
  choose: (label: string, time: string) =>
    time === "" ? `Choose a time for ${label}` : `Choose a time for ${label}, ${time}`,
  hour: "Hour",
  minute: "Minute",
  helper: "24-hour. Any minute can be typed in the field.",
  done: "Done",
  close: "Close",
} as const;
