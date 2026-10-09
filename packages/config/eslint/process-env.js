/**
 * The env seam (MIG-6): each workspace reads its environment in one `env.ts`,
 * at the workspace root or in `src/`, and nowhere else.
 *
 * The rule is an error so ESLint's bulk suppressions can hold today's readers
 * (one `eslint-suppressions.json` per workspace, committed); the counts there
 * only fall, as each module folder's reads move behind its `env.ts`.
 *
 * Two files are exempt by name (apps/web/AGENTS.md): they read canonical
 * `NEXT_PUBLIC_*` names as literals, because Next inlines nothing else into
 * a browser bundle. Inside them, any other name is still an error (Warden):
 * `next.config.ts` puts server values in `env:`, which Next would inline.
 */

const MESSAGE =
  "Read the environment through this workspace's env.ts (MIG-6, the env seam).";

const PUBLIC_NAME = /^NEXT_PUBLIC_[A-Z0-9_]+$|^NODE_ENV$/;

/** In an exempt file: only a literal `NEXT_PUBLIC_*` (or `NODE_ENV`) read. */
const publicNamesOnly = {
  meta: {
    type: "problem",
    schema: [],
    messages: {
      notPublic:
        "This file may read only literal NEXT_PUBLIC_* names (and NODE_ENV); anything else could reach the browser bundle.",
    },
  },
  create(context) {
    return {
      "MemberExpression[object.name='process'][property.name='env']"(node) {
        const parent = node.parent;
        const name =
          parent.type === "MemberExpression" && parent.object === node
            ? parent.computed
              ? parent.property.type === "Literal"
                ? parent.property.value
                : null
              : parent.property.name
            : null;
        if (typeof name !== "string" || !PUBLIC_NAME.test(name)) {
          context.report({
            node: parent.object === node ? parent : node,
            messageId: "notPublic",
          });
        }
      },
    };
  },
};

const envSeamPlugin = { rules: { "public-names-only": publicNamesOnly } };

/** @type {import("eslint").Linter.Config[]} */
export const processEnvConfig = [
  {
    plugins: { "env-seam": envSeamPlugin },
    rules: {
      "no-restricted-properties": [
        "error",
        { object: "process", property: "env", message: MESSAGE },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: ["process", "node:process"].map((name) => ({
            name,
            importNames: ["env"],
            message: MESSAGE,
          })),
        },
      ],
    },
  },
  {
    // The seam itself: the workspace's own env.ts.
    files: ["env.ts", "src/env.ts"],
    rules: { "no-restricted-properties": "off" },
  },
  {
    // The two documented NEXT_PUBLIC_* literal readers (apps/web/AGENTS.md).
    files: ["lib/clients/supabase/client.ts", "lib/trpc/provider.tsx"],
    rules: {
      "no-restricted-properties": "off",
      "env-seam/public-names-only": "error",
    },
  },
];
