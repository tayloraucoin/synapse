import { z } from "zod";

import { dateKeySchema } from "./keys";

/**
 * The body a browser's `PushSubscription` serialises to — official spec §8.6.
 * The subscribe route (INF-9) parses this before it writes a delivery row; the
 * client leaf that calls `pushManager.subscribe()` sends exactly this shape.
 */
export const webPushSubscribeInput = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  userAgent: z.string().optional(),
  platform: z.enum(["ios", "android", "web"]),
});

export type WebPushSubscribeInput = z.infer<typeof webPushSubscribeInput>;

/**
 * N4's *Later*, posted by the service worker.
 *
 * The day key is all it carries. Which delivery to defer is derived on the
 * server from that day and the session — a payload that named a delivery id
 * would be asking a browser to identify a row it has no business knowing.
 */
export const snoozeInput = z.object({ date: dateKeySchema });
