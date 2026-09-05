import { config } from "@syn/config/eslint/react-internal";

/** @type {import("eslint").Linter.Config[]} */
export default [{ ignores: ["storybook-static/**"] }, ...config];
