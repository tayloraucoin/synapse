import type { NextConfig } from "next";
import path from "node:path";

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

  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  outputFileTracingRoot: path.resolve(__dirname, "../.."),
};

export default nextConfig;
