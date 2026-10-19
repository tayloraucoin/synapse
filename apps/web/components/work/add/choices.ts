import {
  AddEventIcon,
  AddTodoIcon,
  FromPoolIcon,
  TaskToTierIcon,
  type LucideIcon,
} from "@syn/ui";
import { ADD_COPY as COPY } from "./copy";

/**
 * The four, in this order, at both widths (D-USE-54, C-USE-add-1): the
 * phone's Add sheet and the desk's + Add menu both map this one list, so
 * neither can reorder it. The keys are the desk menu's [PROPOSED] letters.
 */
export type AddChoice = "task" | "pool" | "todo" | "event";

export interface AddChoiceView {
  choice: AddChoice;
  label: string;
  line: string;
  Icon: LucideIcon;
  key: "T" | "P" | "D" | "E";
}

export function addChoices(personName: string): AddChoiceView[] {
  return [
    {
      choice: "task",
      label: COPY.choices.task.label,
      line: COPY.choices.task.line,
      Icon: TaskToTierIcon,
      key: "T",
    },
    {
      choice: "pool",
      label: COPY.choices.pool.label,
      line: COPY.choices.pool.line(personName),
      Icon: FromPoolIcon,
      key: "P",
    },
    {
      choice: "todo",
      label: COPY.choices.todo.label,
      line: COPY.choices.todo.line,
      Icon: AddTodoIcon,
      key: "D",
    },
    {
      choice: "event",
      label: COPY.choices.event.label,
      line: COPY.choices.event.line,
      Icon: AddEventIcon,
      key: "E",
    },
  ];
}

/** "Task to a tier, new work in Urgent, Primary, Secondary or Stretch". */
export function choiceName(view: AddChoiceView): string {
  return `${view.label}, ${view.line.charAt(0).toLowerCase()}${view.line.slice(1)}`;
}
