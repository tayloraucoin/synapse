// Placeholder. INF-9 writes the real service worker.
//
// It exists now so `next.config.ts`'s /sw.js headers have something to serve
// and so a stale registration from a previous deploy resolves to a no-op
// rather than a 404.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
