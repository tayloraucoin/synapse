"use client";

import { Text } from "@syn/ui";
import { PlannerItemRow } from "@/components/planner";

/**
 * Every work item firing, on the phone (USE-59; everything-firing.md,
 * D-USE-53): a surface card under the Work header, "Everything is firing."
 * over "To-dos, while it all fires", then the undone to-dos as box rows. It
 * holds the reminder, so the reminder line hides. Only the minutes change as
 * it runs long. Props only.
 */
export interface AllFiringCardProps {
  title: string;
  lead: string;
  todos: {
    id: string;
    title: string;
    emoji: string | null;
    checked: boolean;
    meta: string | null;
  }[];
  onCheckedChange?: (id: string, checked: boolean) => void;
}

export function AllFiringCard({
  title,
  lead,
  todos,
  onCheckedChange,
}: AllFiringCardProps) {
  return (
    <section
      aria-label={title}
      data-all-firing-card
      className="bg-surface flex flex-col gap-(--space-1) rounded-(--radius-sheet) px-(--space-3) py-(--space-3)"
    >
      <Text as="p" variant="body" weight={600}>
        {title}
      </Text>
      <Text as="p" variant="secondary" tone="muted">
        {lead}
      </Text>
      <ul className="flex flex-col">
        {todos.map((todo) => (
          <li key={todo.id}>
            <PlannerItemRow item={todo} onCheckedChange={onCheckedChange} />
          </li>
        ))}
      </ul>
    </section>
  );
}
