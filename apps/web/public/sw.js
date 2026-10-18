/**
 * The push worker, and the app shell's cache (USE-107, C4).
 *
 * Offline is two tickets: USE-106 persists the data in IndexedDB, and this
 * worker keeps the shell that data fills, so the installed app opens with no
 * signal. It caches only two things, both same-origin GETs:
 *
 * - shell documents (the signed-in tabs below): network first, the cached copy
 *   only when the network fails;
 * - `/_next/static/*`: cache first in a build, where every name is hashed;
 *   network first in development, where they are not.
 *
 * Everything else passes through untouched: `/api/*` and every tRPC call, the
 * auth routes, RSC fetches, other origins. A request the worker does not
 * claim never reaches the cache.
 *
 * EACH BUILD HAS ITS OWN CACHE. The registration leaf registers
 * `/sw.js?build=<id>`, a new URL per build, which installs a new worker that
 * waits behind the old one (SY-02's update line); `activate` deletes every
 * other shell cache. Sign-out deletes them too (`lib/pwa/shell-cache.ts`).
 *
 * Handles `install` and `activate` (the cache), `fetch`, `push`,
 * `notificationclick` and `message`.
 */

const BUILD = new URL(self.location.href).searchParams.get("build") || "none";
const DEV = BUILD === "dev";
const CACHE_PREFIX = "syn-shell-";
const CACHE = CACHE_PREFIX + BUILD;

/** The document opened with no signal when its own path was never cached. */
const SHELL_HOME = "/today";

/** The signed-in tabs (`app/(shell)/`). Auth routes are never on this list. */
const SHELL_ROOTS = [
  "/today",
  "/day",
  "/days",
  "/week",
  "/orient",
  "/review",
  "/settings",
];

function isShellPath(pathname) {
  return SHELL_ROOTS.some(function (root) {
    return pathname === root || pathname.startsWith(root + "/");
  });
}

/*
 * What may be stored. A redirect (signed out, sent to /signin) or an error is
 * never the shell. A static asset marked private is never stored. Shell
 * documents are the exception to that last rule on purpose: Next marks every
 * signed-in page `private, no-store`, and the signed-in page IS the shell
 * [ASSUMPTION: the copy lives on this device only, like USE-106's IndexedDB
 * copy, and sign-out deletes both].
 */
function storable(response, isDocument) {
  if (!response || !response.ok || response.status !== 200) return false;
  if (response.type !== "basic" || response.redirected) return false;
  if (isDocument) return true;
  const cacheControl = response.headers.get("Cache-Control") || "";
  return !/private/i.test(cacheControl);
}

/** A document is stored under its path alone: `?date=` and `?state=` share one. */
function documentKey(url) {
  return new URL(url).origin + new URL(url).pathname;
}

/*
 * INSTALL: the home document and the static files it names, read from its
 * HTML, so the very first visit can reopen offline. A failure here (offline,
 * signed out) leaves the cache to fill on fetch rather than failing the
 * install, which would hold the update line back for no gain.
 */
self.addEventListener("install", function (event) {
  event.waitUntil(
    (async function () {
      try {
        const cache = await caches.open(CACHE);
        const response = await fetch(SHELL_HOME, {
          credentials: "same-origin",
        });
        if (!storable(response, true)) return;
        const html = await response.clone().text();
        await cache.put(documentKey(response.url), response);
        const assets = html.match(/\/_next\/static\/[^"'\s)\\]+/g) || [];
        const unique = Array.from(new Set(assets));
        await Promise.all(
          unique.map(function (path) {
            return fetch(path)
              .then(function (asset) {
                if (storable(asset, false)) return cache.put(path, asset);
              })
              .catch(function () {});
          }),
        );
      } catch {
        // Filled on fetch instead.
      }
    })(),
  );
});

/*
 * ACTIVATE: every shell cache but this build's is deleted, then the worker
 * takes the open pages, so the first visit's later requests are cached too.
 * Only `syn-shell-*` caches are touched.
 */
self.addEventListener("activate", function (event) {
  event.waitUntil(
    (async function () {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter(function (name) {
            return name.startsWith(CACHE_PREFIX) && name !== CACHE;
          })
          .map(function (name) {
            return caches.delete(name);
          }),
      );
      await self.clients.claim();
    })(),
  );
});

async function networkFirstDocument(request) {
  const cache = await caches.open(CACHE);
  const key = documentKey(request.url);
  try {
    const response = await fetch(request);
    if (storable(response, true)) await cache.put(key, response.clone());
    return response;
  } catch (error) {
    const cached =
      (await cache.match(key)) ||
      (await cache.match(self.location.origin + SHELL_HOME));
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirstStatic(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (storable(response, false)) await cache.put(request, response.clone());
  return response;
}

async function networkFirstStatic(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (storable(response, false)) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

/*
 * FETCH: a request is claimed only when it is a same-origin GET for a shell
 * document or a static file. Not calling `respondWith` hands it to the
 * network exactly as if there were no worker.
 */
self.addEventListener("fetch", function (event) {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    if (!isShellPath(url.pathname)) return;
    event.respondWith(networkFirstDocument(request));
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      DEV ? networkFirstStatic(request) : cacheFirstStatic(request),
    );
  }
});

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
