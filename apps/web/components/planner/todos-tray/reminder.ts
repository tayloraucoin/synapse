import { reminderBody } from "@syn/utils";
import { todayRoute } from "@/lib/routes";
import { REMINDER_PREVIEW_COPY as COPY } from "./copy";

/**
 * A to-do reminder's push payload (N4): the app's name, the to-do in its own
 * words, nothing added, and Now with the tray open on it. Sending it is the
 * to-dos-and-reminders wiring's (wave 3); the preview draws the same words.
 */
export interface TodoReminderPayload {
  title: string;
  body: string;
  url: string;
}

export function todoReminderPayload(todo: {
  id: string;
  title: string;
}): TodoReminderPayload {
  return {
    title: COPY.app,
    body: reminderBody(todo),
    url: todayRoute({ todo: todo.id }),
  };
}
