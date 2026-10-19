import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(appRoot, "../..");

const nextConfig: NextConfig = {
  /**
   * Next 16 rewrites an app's `AGENTS.md` and `CLAUDE.md` on every `next dev`.
   * One fact, one home: the instruction spine is the root `AGENTS.md`.
   */
  agentRules: false,

  // Workspace packages ship TypeScript source; the app compiles them.
  transpilePackages: ["@syn/constants", "@syn/ui"],

  experimental: {
    // Workspace packages use TypeScript ESM `.js` import specifiers.
    extensionAlias: {
      ".js": [".ts", ".tsx", ".js"],
    },
  },

  turbopack: {
    root: repoRoot,
  },
  outputFileTracingRoot: repoRoot,
};

export default nextConfig;
