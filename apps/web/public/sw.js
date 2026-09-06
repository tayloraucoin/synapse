/**
 * Push-only service worker. NO CACHING.
 *
 * Phase 1 has no offline contract (cross-cutting §6.1: writes are blocked with
 * the standard line), so a cache here would serve stale days with nothing to
 * invalidate it and no story for what happens when two devices disagree.
 * Offline is a Phase 2 ticket that arrives with its own rules.
 *
 * Handles exactly three events: `push` shows the notification,
 * `notificationclick` focuses an open tab or opens the deep link, and `message`
 * answers the update line's *Reload*.
 */

/*
 * SY-02. The page raises *A new version is ready.* and, ONLY when the person
 * taps *Reload*, posts this message. There is no `skipWaiting()` at install
 * time on purpose: activating a new worker under someone mid-task swaps the
 * app out from under them, which is exactly what "never reload without a tap"
 * forbids. The page reloads itself on `controllerchange`.
 */
self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("push", function (event) {
  if (!event.data) return;

  let payload = {
    title: "Synapse",
    body: "",
    icon: null,
    badge: null,
    url: "/",
    actions: [],
    actionUrls: {},
  };
  try {
    payload = { ...payload, ...event.data.json() };
  } catch {
    payload.title = event.data.text() || payload.title;
  }

  event.waitUntil(
    (async function () {
      /*
       * FOREGROUND SUPPRESSION (Epic 2 §9, call 9).
       *
       * A notification about something happening on the screen a person is
       * already looking at is the app talking over itself: the row's state
       * word has already changed to *now* on the minute tick. So when a window
       * on this origin is focused, nothing is shown.
       *
       * A window that is OPEN BUT NOT FOCUSED still gets the notification —
       * a backgrounded tab is not somebody watching.
       */
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      if (windows.some((client) => client.focused)) return;

      const options = {
        body: payload.body || undefined,
        icon: payload.icon || undefined,
        badge: payload.badge || undefined,
        data: {
          url: payload.url || "/",
          actionUrls: payload.actionUrls || {},
          // N4's *Later* snoozes rather than navigating; this names what to
          // snooze so the worker does not have to parse it out of a URL.
          snoozeDate: payload.snoozeDate || null,
        },
        // Platform-permitting. Older iOS ignores these entirely, which is why
        // the body tap always lands correctly on its own.
        actions: payload.actions || [],
        // One tag, so items due at the same minute collapse into one
        // notification rather than stacking — official spec §8.2's grouping
        // rule. The job groups them into one payload; this is the backstop.
        tag: "syn-push",
        renotify: true,
      };

      await self.registration.showNotification(payload.title, options);
    })(),
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const data = event.notification.data || {};
  const actionUrls = data.actionUrls || {};

  /*
   * *LATER* SNOOZES AND OPENS NOTHING.
   *
   * Someone who taps *Later* has said "not now" — taking them to the review
   * anyway would be the opposite of what they asked for. `credentials:
   * "include"` sends the session cookie: this is a same-origin request from
   * the app's own worker, and the route authenticates it like any other.
   */
  if (event.action === "later" && data.snoozeDate) {
    event.waitUntil(
      fetch("/api/pwa/push/snooze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ date: data.snoozeDate }),
      }).catch(function () {
        // A failed snooze means the reminder simply does not come back. That
        // is the quiet direction, which is the right one to fail towards.
      }),
    );
    return;
  }

  /*
   * An action's own destination, or the body's.
   *
   * An action with no entry here falls back to the body tap rather than doing
   * nothing — a button that appears and then swallows the tap is worse than
   * one that lands somewhere sensible.
   */
  let url = (event.action && actionUrls[event.action]) || data.url || "/";
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
