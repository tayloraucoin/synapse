import { z } from "zod";

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
