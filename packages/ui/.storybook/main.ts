import path from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import { mergeConfig } from "vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Uses @storybook/react-vite (not @storybook/nextjs) because Next 16 removed
 * `next/config`, which Storybook 8's Next preset still requires.
 * `next/link` is aliased to `.storybook/next-link-mock.tsx` for the components
 * that link.
 */
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-themes"],
  staticDirs: [{ from: "../../../apps/web/public", to: "/" }],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [tailwindcss()],
      resolve: {
        alias: {
          "next/link": path.resolve(dirname, "./next-link-mock.tsx"),
        },
      },
    });
  },
};

export default config;
