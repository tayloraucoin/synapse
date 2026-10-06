import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

import { buildSupabaseEnvForNextConfig } from "@syn/auth";
import { buildDatabaseEnvForNextConfig } from "@syn/db/build-database-env-for-next-config";

import { getLocalDevOrigins } from "../../scripts/local-dev-origins.mjs";

import { env } from "./env";

const webRoot = path.dirname(fileURLToPath(import.meta.url));
loadEnvConfig(webRoot);

/**
 * THE TIER COLLAPSE. Runtime code reads canonical names
 * (`NEXT_PUBLIC_SUPABASE_URL`, `DATABASE_URL`); the environment holds
 * tier-specific ones (`..._STAGING`, `LOCAL_...`). These two builders pick the
 * right source for `DATABASE_ENVIRONMENT` and emit the canonical name, which
 * is what makes the browser client's literal reads work — Next can only inline
 * a literal.
 */
const supabaseEnv = buildSupabaseEnvForNextConfig();
const databaseEnv = buildDatabaseEnvForNextConfig();

/**
 * The version line on ST-00, stamped at build time.
 *
 * It is read from `package.json` here rather than from a Vercel variable
 * because the build is the only moment both facts are known and fixed. The
 * date is the build's, not the deploy's: "what am I running" is answered by
 * when it was compiled.
 *
 * `VERCEL_GIT_COMMIT_SHA` is deliberately NOT read — INF-8's precedent is that
 * every environment variable this app depends on is declared in `env.ts` and
 * listed for turbo, and a platform variable read here would be neither.
 */
const packageJson = JSON.parse(
  readFileSync(path.join(webRoot, "package.json"), "utf8"),
) as { version?: string };

const versionEnv = {
  NEXT_PUBLIC_APP_VERSION: packageJson.version ?? "0.0.0",
  NEXT_PUBLIC_BUILD_DATE: new Date().toISOString().slice(0, 10),
};

const nextConfig: NextConfig = {
  /**
   * Next 16 rewrites `apps/web/AGENTS.md` and `apps/web/CLAUDE.md` on every
   * `next dev`, which would make a generator a co-author of this repository's
   * instruction spine and would replace `CLAUDE.md`'s one-line `@AGENTS.md`
   * pointer with its own content. One fact, one home: the spine is the root
   * `AGENTS.md`, and its "Environment & tooling" section carries the Next 16
   * warning by hand.
   */
  agentRules: false,

  // Next 16 blocks cross-origin `/_next/*` in dev unless listed here. Phone and
  // LAN access through `yarn web:dev:local` needs these or React never hydrates.
  allowedDevOrigins: getLocalDevOrigins(),

  transpilePackages: [
    "@syn/api",
    "@syn/auth",
    "@syn/constants",
    "@syn/db",
    "@syn/hooks",
    "@syn/observability",
    "@syn/types",
    "@syn/ui",
    "@syn/utils",
    "@syn/validators",
  ],

  env: {
    ...supabaseEnv,
    ...databaseEnv,
    ...versionEnv,
    NEXT_PUBLIC_SITE_URL: env.siteUrl,
  },

  async headers() {
    return [
      {
        // The service worker must never be cached: a stale one keeps serving
        // an old app to a person who has already reloaded (cross-cutting §5.4).
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },

  experimental: {
    // Workspace packages use TypeScript ESM `.js` import specifiers.
    extensionAlias: {
      ".js": [".ts", ".tsx", ".js"],
    },
  },

  turbopack: {
    root: path.resolve(webRoot, "../.."),
  },
  outputFileTracingRoot: path.resolve(webRoot, "../.."),

  images: {
    // Next 16 blocks private-IP image optimisation by default (SSRF guard).
    // Needed when testing on a phone at http://<lan-ip>:3000.
    dangerouslyAllowLocalIP: env.NODE_ENV === "development",
    qualities: [75],
    localPatterns: [{ pathname: "/icons/**" }],
  },
};

export default nextConfig;
