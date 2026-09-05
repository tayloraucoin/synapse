/**
 * Shared Prettier defaults for the Synapse monorepo.
 * Root `prettier.config.mjs` is the runtime entry; this module mirrors the same options.
 *
 * @type {import("prettier").Config}
 */
const config = {
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  printWidth: 80,
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
  importOrder: [
    "^server-only$",
    "<BUILTIN_MODULES>",
    "^react$",
    "^react/",
    "^next",
    "<THIRD_PARTY_MODULES>",
    "^@syn/",
    "^@/",
    "^[./]",
  ],
  importOrderTypeScriptVersion: "5.0.0",
};

export default config;
