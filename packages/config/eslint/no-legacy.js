/**
 * The legacy seam (USE-1): the old app sits in `_legacy/` folders that nothing
 * builds, lints or imports. A live file that reaches into one is an error, so
 * a later ticket cannot quietly lean on code nobody type-checks any more.
 *
 * Its own rule, not a `no-restricted-imports` pattern: that rule already
 * carries the env seam's config (process-env.js), and a second entry would
 * replace it rather than add to it.
 */

const LEGACY_SEGMENT = /(^|\/)_legacy(\/|$)/;

const MESSAGE =
  "{{source}} is legacy (USE-1). git mv the file back out of _legacy/ and own it from then on; never import from _legacy/.";

const noLegacyImport = {
  meta: {
    type: "problem",
    schema: [],
    messages: { legacy: MESSAGE },
  },
  create(context) {
    function check(node, source) {
      if (
        source &&
        source.type === "Literal" &&
        typeof source.value === "string" &&
        LEGACY_SEGMENT.test(source.value)
      ) {
        context.report({
          node,
          messageId: "legacy",
          data: { source: source.value },
        });
      }
    }
    return {
      ImportDeclaration: (node) => check(node, node.source),
      ExportNamedDeclaration: (node) => check(node, node.source),
      ExportAllDeclaration: (node) => check(node, node.source),
      ImportExpression: (node) => check(node, node.source),
      "CallExpression[callee.name='require']": (node) =>
        check(node, node.arguments[0]),
    };
  },
};

/** @type {import("eslint").Linter.Config[]} */
export const noLegacyConfig = [
  {
    plugins: { legacy: { rules: { "no-import": noLegacyImport } } },
    rules: { "legacy/no-import": "error" },
  },
  {
    // Global: nothing under a _legacy/ folder is linted.
    ignores: ["**/_legacy/**"],
  },
];
