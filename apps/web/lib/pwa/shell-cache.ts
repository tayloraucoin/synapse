/**
 * The app shell's cache (USE-107), named by `public/sw.js`: one
 * `syn-shell-<build>` cache per build. The worker deletes the old builds' on
 * `activate`; this deletes all of them at sign-out, because a cached shell
 * document is the signed-in page and must not outlive the session.
 */
export const SHELL_CACHE_PREFIX = "syn-shell-";

export async function clearShellCache(): Promise<void> {
  if (typeof caches === "undefined") return;
  const names = await caches.keys();
  await Promise.all(
    names
      .filter((name) => name.startsWith(SHELL_CACHE_PREFIX))
      .map((name) => caches.delete(name)),
  );
}
