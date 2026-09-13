/**
 * The wind-down's one rule — UX v1.1 §7.1, §7.3: the devices-off marker
 * divides the block. Items at or after it are never ticked live; they read
 * *confirm in the morning* and are answered at the next day's pick.
 *
 * THE MARKER IS RECOGNISED BY SHAPE: the pinned, slotless, template-origin
 * `task_appointment` row in the block — the row `materializeDay` writes from
 * `users.devices_off_time` through the *Phone away* habit
 * (`library/placed-habits.ts`). [PROVISIONAL — a `marker` column would make
 * this a comparison; deferred to DYN-21.]
 */

export type WindDownItem = {
  id: string;
  pinned: boolean;
  templateSlotId: string | null;
  origin: string;
  type: string;
  scheduledStart: Date | null;
};

export function findDevicesOffMarker<T extends WindDownItem>(items: readonly T[]): T | null {
  return (
    items.find(
      (item) =>
        item.pinned &&
        item.templateSlotId === null &&
        item.origin === "template" &&
        item.type === "task_appointment",
    ) ?? null
  );
}

/** The devices-off instant for a day, from its marker; null without one. */
export function devicesOffInstant(items: readonly WindDownItem[]): Date | null {
  return findDevicesOffMarker(items)?.scheduledStart ?? null;
}

/** The items at or after the marker — the ones that wait for the morning. */
export function afterDevicesOff<T extends WindDownItem>(items: readonly T[]): T[] {
  const marker = findDevicesOffMarker(items);
  if (!marker || marker.scheduledStart === null) return [];
  const at = marker.scheduledStart.getTime();
  return items.filter(
    (item) =>
      item.id !== marker.id &&
      item.scheduledStart !== null &&
      item.scheduledStart.getTime() >= at,
  );
}
