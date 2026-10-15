"use client";

import * as React from "react";
import { isIOS, isPWA } from "./install-detection";

/**
 * Whether a to-do's reminder can arrive on this device (USE-28; todo-sheet
 * not-installed.md, notifications-off.md): the To-do sheet offers the switch
 * only where one can.
 *
 * THE ORDER IS THE RULE, as `permission-state.ts`'s: an iPhone browser cannot
 * be sent a reminder at all, so it is told to install before anything is
 * said about notifications. Anywhere else a reminder needs notifications
 * allowed; until they are, the row points to Settings [ASSUMPTION, as
 * not-installed.md: Android and the desk can notify from the browser once
 * allowed, so they read notifications-off until then].
 *
 * READ ON THE DEVICE, AFTER MOUNT. Until then `known` is false and the row
 * shows no control, so the first frame never offers what the device cannot do.
 */

export type ReminderAvailability =
  "available" | "not-installed" | "notifications-off";

/** `Notification.permission`, or `unsupported` where there is none. */
export type ReminderPermission = NotificationPermission | "unsupported";

export interface ReminderDevice {
  ios: boolean;
  /** Running from the home screen. */
  standalone: boolean;
  permission: ReminderPermission;
}

export function reminderAvailability(
  device: ReminderDevice,
): ReminderAvailability {
  if (device.ios && !device.standalone) return "not-installed";
  return device.permission === "granted" ? "available" : "notifications-off";
}

/** The device in hand. Client only. */
export function readReminderDevice(): ReminderDevice {
  return {
    ios: isIOS(),
    standalone: isPWA(),
    permission:
      typeof Notification === "undefined"
        ? "unsupported"
        : Notification.permission,
  };
}

/**
 * The availability on this device, a scenario's `device` laid over it so a
 * capture stands on any phone (`?state=`). Re-read when the page is shown
 * again, so the switch comes back once notifications are turned on.
 */
export function useReminderAvailability(override?: Partial<ReminderDevice>): {
  known: boolean;
  availability: ReminderAvailability;
} {
  const [device, setDevice] = React.useState<ReminderDevice | null>(null);

  React.useEffect(() => {
    const read = () => setDevice(readReminderDevice());
    read();
    const onVisible = () => {
      if (document.visibilityState === "visible") read();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  if (device === null) return { known: false, availability: "available" };
  return {
    known: true,
    availability: reminderAvailability({ ...device, ...override }),
  };
}
