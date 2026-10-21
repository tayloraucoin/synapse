import { occursOn, parseRule, usualDay } from "@syn/utils";
import type {
  BlockItemRecord,
  BlockRecord,
  SetUpDayRead,
} from "@syn/validators";
import { pendingId } from "./optimistic-day";
import type { PlannerCall } from "./use-planner-writes";
import type { WeekRecords } from "./week-records";

/**
 * A planner write as the week will read once it lands (USE-148): what the
 * planner mutation's `onMutate` writes into every cached week, so Set my
 * days shows a change at once instead of after the round trip. An error
 * puts the cache back; the server's answer settles it either way.
 *
 * New blocks, a weekday's or a date's bounds, block edits, and items added,
 * changed, removed and reordered (every date's, not a date's own). Any other
 * write, and a dated change, returns null: the cache waits for the server.
 * A new row carries a stand-in id until then; nothing routes on it.
 */

function stamps(now: Date) {
  const at = now.toISOString();
  return { id: pendingId(), createdAt: at, updatedAt: at };
}

/** Whether a block runs on a day of this week. */
function runsOn(
  block: Pick<BlockRecord, "rrule" | "onDate">,
  day: SetUpDayRead,
): boolean {
  if (day.date === null) return usualDay([block], day.weekday).length > 0;
  if (block.onDate !== null) return block.onDate === day.date;
  if (block.rrule === null) return false;
  const parsed = parseRule(block.rrule);
  return parsed.ok && occursOn(parsed.rule, day.date);
}

function mapDays(
  week: WeekRecords,
  change: (day: SetUpDayRead) => SetUpDayRead,
): WeekRecords {
  return { ...week, days: week.days.map(change) };
}

/** Keys an input left out stay as they were; null clears. */
function patched<T extends object>(row: T, patch: Partial<T>): T {
  const next = { ...row };
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) (next as Record<string, unknown>)[key] = value;
  }
  return next;
}

export function applyOptimistic(
  call: PlannerCall,
  week: WeekRecords,
  now: Date,
): WeekRecords | null {
  switch (call.method) {
    case "createBlock": {
      const [input] = call.args;
      const block: BlockRecord = {
        ...stamps(now),
        kind: input.kind,
        name: input.name,
        icon: input.icon ?? null,
        color: input.color ?? null,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        rrule: input.rrule ?? null,
        onDate: input.onDate ?? null,
        fill: input.fill ?? null,
        checklist: input.checklist ?? false,
        meal: input.meal ?? false,
        notify: input.notify ?? false,
        archivedAt: null,
      };
      return mapDays(week, (day) =>
        runsOn(block, day) ? { ...day, blocks: [...day.blocks, block] } : day,
      );
    }

    case "writeBounds": {
      const [input] = call.args;
      const weekday = input.weekday ?? null;
      const onDate = input.onDate ?? null;
      return mapDays(week, (day) => {
        const hits =
          onDate !== null
            ? day.date === onDate
            : day.weekday === weekday &&
              (day.date === null || day.bounds?.onDate == null);
        if (!hits) return day;
        const bounds = day.bounds ?? {
          ...stamps(now),
          weekday,
          onDate,
          upAt: input.upAt,
          lightsOut: input.lightsOut,
        };
        return {
          ...day,
          bounds: { ...bounds, upAt: input.upAt, lightsOut: input.lightsOut },
        };
      });
    }

    case "editBlock": {
      const [{ id, ...patch }] = call.args;
      return mapDays(week, (day) =>
        day.blocks.some((block) => block.id === id)
          ? {
              ...day,
              blocks: day.blocks.map((block) =>
                block.id === id
                  ? patched(block, patch as Partial<BlockRecord>)
                  : block,
              ),
            }
          : day,
      );
    }

    case "removeBlock": {
      // Delete block (USE-158): gone from that weekday's days at once.
      const [{ id, weekday }] = call.args;
      return mapDays(week, (day) =>
        day.weekday === weekday && day.blocks.some((block) => block.id === id)
          ? {
              ...day,
              blocks: day.blocks.filter((block) => block.id !== id),
              items: day.items.filter((item) => item.blockId !== id),
            }
          : day,
      );
    }

    case "writeBlockItem": {
      const [input] = call.args;
      if (input.onDate != null) return null;
      const item: BlockItemRecord = {
        ...stamps(now),
        blockId: input.blockId,
        title: input.title,
        icon: input.icon ?? null,
        isTransition: input.isTransition ?? false,
        atTime: input.atTime ?? null,
        lengthMin: input.lengthMin ?? null,
        meal: input.meal ?? false,
        onDate: null,
        sortOrder: input.sortOrder,
      };
      return mapDays(week, (day) =>
        day.blocks.some((block) => block.id === input.blockId)
          ? { ...day, items: [...day.items, item] }
          : day,
      );
    }

    case "editBlockItem": {
      const [{ id, ...patch }] = call.args;
      return mapDays(week, (day) => ({
        ...day,
        items: day.items.map((item) =>
          item.id === id
            ? patched(item, patch as Partial<BlockItemRecord>)
            : item,
        ),
      }));
    }

    case "removeBlockItem": {
      const [input] = call.args;
      if (input.date !== undefined) return null;
      return mapDays(week, (day) => ({
        ...day,
        items: day.items.filter((item) => item.id !== input.id),
      }));
    }

    case "reorderItems": {
      const [input] = call.args;
      if (input.date !== undefined) return null;
      const order = new Map(input.ids.map((id, index) => [id, index]));
      return mapDays(week, (day) => ({
        ...day,
        items: day.items.map((item) => {
          const at = order.get(item.id);
          return at === undefined ? item : { ...item, sortOrder: at };
        }),
      }));
    }

    default:
      return null;
  }
}
