/**
 * Push-only service worker. NO CACHING.
 *
 * Phase 1 has no offline contract (cross-cutting §6.1: writes are blocked with
 * the standard line), so a cache here would serve stale days with nothing to
 * invalidate it and no story for what happens when two devices disagree.
 * Offline is a Phase 2 ticket that arrives with its own rules.
 *
 * Handles exactly two events: `push` shows the notification, and
 * `notificationclick` focuses an open tab or opens the deep link.
 */

self.addEventListener("push", function (event) {
  if (!event.data) return;

  let payload = {
    title: "Synapse",
    body: "",
    icon: null,
    badge: null,
    url: "/",
  };
  try {
    payload = { ...payload, ...event.data.json() };
  } catch {
    payload.title = event.data.text() || payload.title;
  }

  const options = {
    body: payload.body || undefined,
    icon: payload.icon || undefined,
    badge: payload.badge || undefined,
    data: { url: payload.url || "/" },
    // One tag, so items due at the same minute collapse into one notification
    // rather than stacking — official spec §8.2's grouping rule.
    tag: "syn-push",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  let url = event.notification.data?.url || "/";
  if (url.startsWith("/")) {
    url = self.location.origin + url;
  }

  event.waitUntil(
    (async function () {
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      // Focus an open window on that route before opening a second one: a
      // reminder should return you to the app you already have, not fork it.
      for (const client of windows) {
        if (client.url === url || client.url.startsWith(url)) {
          await client.focus();
          return;
        }
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow(url);
      }
    })(),
  );
});
