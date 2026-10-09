/**
 * Import-boundary rules for the Synapse monorepo (conventions §6.2).
 *
 * Enforced via eslint-plugin-boundaries at the repo root (eslint.config.mjs).
 * Layer order (low → high):
 *   config → (constants, types, observability) → utils → validators → db → auth → api → hooks → ui → apps
 *
 * Footnotes encoded:
 * - hooks → api: AppRouter type imports only (not runtime)
 * - apps → db: allowed (server code only — not enforceable at lint time)
 * - apps/* → apps/*: hard ban
 * - packages/* → apps/*: hard ban
 * - Restricted third-party deps (checkAllOrigins): drizzle/postgres → data layers;
 *   web-push → @syn/api; frimousse → @syn/ui; @supabase/* → @syn/auth, with
 *   one named file exception (RESTRICTED_EXTERNAL_EXCEPTIONS)
 *
 * Phase 1 has no AI package. `@syn/ai` does not exist and is not anticipated here.
 *
 * @syn/observability sits at the utils tier.
 *
 * Zones are matched by path pattern, so a package folder that does not exist
 * yet is simply never matched — every later package is born under this rule.
 */

import boundaries from "eslint-plugin-boundaries";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

const configDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(configDir, "../../..");

const APP_TYPES = ["app-web", "app-mobile"];

/** Yarn workspaces symlink @syn/* into node_modules — match both paths. */
function workspacePackage(type, folder) {
  return {
    type,
    pattern: [`packages/${folder}/**`, `node_modules/@syn/${folder}/**`],
    mode: "full",
  };
}

function workspaceApp(type, folder) {
  return {
    type,
    pattern: [`apps/${folder}/**`, `node_modules/${folder}/**`],
    mode: "full",
  };
}

/** conventions §6.2 — each package may import only these lower-layer types */
const PACKAGE_IMPORTS = {
  config: [],
  constants: ["config"],
  types: ["config"],
  observability: ["config", "constants", "types"],
  utils: ["config", "constants", "types", "observability"],
  validators: ["config", "constants", "types", "utils"],
  db: ["config", "constants", "types", "utils"],
  auth: ["config", "constants", "types", "utils", "db"],
  api: [
    "config",
    "constants",
    "types",
    "observability",
    "utils",
    "validators",
    "db",
    "auth",
  ],
  hooks: ["config", "constants", "types", "utils", "validators"],
  // ui → hooks: the HEADLESS hooks only (`useOptimisticValue`, RUN-7 / TD-18).
  // The conventions' "NOT hooks-data" stands — a hook that binds transport
  // lives in apps/web/lib/hooks and never reaches here.
  ui: ["config", "constants", "types", "utils", "validators", "hooks"],
};

const APP_IMPORTS = [
  "config",
  "constants",
  "types",
  "observability",
  "utils",
  "validators",
  "db",
  "auth",
  "api",
  "hooks",
  "ui",
];

function buildDependencyRules() {
  const rules = [
    {
      allow: { dependency: { relationship: { to: "internal" } } },
    },
    {
      allow: {
        from: { type: "{{to.type}}" },
        to: { type: "{{from.type}}" },
      },
    },
    {
      allow: { to: { isUnknown: true } },
    },
  ];

  for (const [from, allowed] of Object.entries(PACKAGE_IMPORTS)) {
    if (allowed.length > 0) {
      rules.push({
        from: { type: from },
        allow: { to: { type: allowed } },
      });
    }
  }

  rules.push({
    from: { type: "hooks" },
    allow: { to: { type: "api" }, dependency: { kind: "type" } },
  });

  for (const appType of APP_TYPES) {
    rules.push({
      from: { type: appType },
      allow: { to: { type: APP_IMPORTS } },
    });
    for (const otherApp of APP_TYPES) {
      if (otherApp !== appType) {
        rules.push({
          from: { type: appType },
          disallow: { to: { type: otherApp } },
        });
      }
    }
  }

  const packageTypes = Object.keys(PACKAGE_IMPORTS);
  rules.push({
    from: { type: packageTypes },
    disallow: { to: { type: APP_TYPES } },
  });

  return rules;
}

const ALL_ZONE_TYPES = [...Object.keys(PACKAGE_IMPORTS), ...APP_TYPES];

/**
 * Infra SDKs restricted to owning zones. The web app may import drizzle-orm
 * (direct Drizzle in server code); leaf packages (ui, hooks, validators, …) may not.
 */
const RESTRICTED_EXTERNAL = [
  { module: "drizzle-orm", owners: ["db", "api", "app-web"] },
  { module: "postgres", owners: ["db"] },
  { module: "drizzle-kit", owners: ["db"] },
  { module: "web-push", owners: ["api"] },
  // The auth SDKs stay behind @syn/auth: every Supabase client, session and
  // identity type is reached through it (MIG-7). Callers take `AuthUser` and
  // `AuthClient` from @syn/auth, never from the vendor.
  { module: "@supabase/*", owners: ["auth"] },
  // Rendering engines stay behind @syn/ui's re-skin: the emoji picker, the
  // sortable (dnd-kit) and the passage editor (tiptap + its Markdown bridge).
  // An app or a service reaching for one directly would be a platform-bound
  // dependency escaping the one place that owns rendering (UX v1.2 TD-16).
  { module: "frimousse", owners: ["ui"] },
  { module: "@dnd-kit/*", owners: ["ui"] },
  { module: "@tiptap/*", owners: ["ui"] },
  { module: "tiptap-markdown", owners: ["ui"] },
];

/**
 * A file that may import one restricted module its zone does not own. Each is
 * named here and nowhere else, and a mason and a warden reviewer glob in
 * toolkit.json reach it (MIG-7). The override drops only that module's
 * restriction for that file; every other boundary rule still applies to it.
 */
const RESTRICTED_EXTERNAL_EXCEPTIONS = [
  {
    // The local auth mirror's seeder: creates the dev account through the
    // GoTrue admin API with the service-role key. It lives in @syn/db (the
    // mirror is the database package's), which may not import @syn/auth, and
    // its tier default (`local`) is the database's, not auth's.
    file: "packages/db/scripts/seed-users.ts",
    module: "@supabase/*",
  },
];

/**
 * `flag-as-external.inNodeModules` is false so workspace packages resolved
 * through the Yarn symlink keep their element type. That also stops genuine
 * third-party packages from being flagged external, which would silently
 * disable every RESTRICTED_EXTERNAL rule below. Flagging the restricted
 * modules by source pattern restores the check for exactly those modules,
 * subpath imports included.
 */
const RESTRICTED_EXTERNAL_SOURCE_PATTERNS = RESTRICTED_EXTERNAL.flatMap(
  ({ module }) => [module, `${module}/**`],
);

function buildExternalDependencyRules(exemptModule) {
  const rules = [
    {
      allow: {
        to: { origin: "external" },
      },
    },
  ];

  for (const { module, owners } of RESTRICTED_EXTERNAL) {
    if (module === exemptModule) continue;
    const disallowedFrom = ALL_ZONE_TYPES.filter(
      (type) => !owners.includes(type),
    );
    for (const fromType of disallowedFrom) {
      rules.push({
        from: { type: fromType },
        disallow: {
          to: { origin: "external" },
          dependency: { module },
        },
        message: `{{from.type}} must not import external "${module}" (owners: ${owners.join(", ")}) — codebase-conventions §6.`,
      });
    }
  }

  return rules;
}

/** The rule's full setting; `exemptModule` drops one restriction (an exception). */
function buildDependenciesRule(exemptModule) {
  return [
    "error",
    {
      default: "disallow",
      checkAllOrigins: true,
      message:
        "{{from.type}} must not import {{to.type}} (codebase-conventions §6.2). Refactor — do not suppress.",
      rules: [
        ...buildDependencyRules(),
        ...buildExternalDependencyRules(exemptModule),
      ],
    },
  ];
}

/** @type {import("eslint").Linter.Config[]} */
export const boundariesConfig = [
  {
    files: [
      "packages/**/*.{ts,tsx,js,jsx,mjs,cjs}",
      "apps/**/*.{ts,tsx,js,jsx,mjs,cjs}",
    ],
    plugins: { boundaries },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    settings: {
      "boundaries/root-path": repoRoot,
      // Without this, eslint-import-resolver-node only tries .js/.json/.node,
      // every `@syn/*` specifier resolves to null, and the whole rule set
      // silently passes on `isUnknown`. Workspace entry points are .ts.
      "import/resolver": {
        node: {
          extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"],
        },
      },
      "boundaries/include": [
        "packages/**/*",
        "apps/**/*",
        "node_modules/@syn/**/*",
        "node_modules/web/**/*",
        "node_modules/mobile/**/*",
      ],
      "boundaries/ignore": [
        "**/.next/**",
        "**/storybook-static/**",
        "**/dist/**",
        "**/*.d.ts",
        "packages/db/migrations/**",
      ],
      "boundaries/flag-as-external": {
        unresolvableAlias: true,
        // false, so a `@syn/*` import — which Yarn resolves through the
        // node_modules symlink — stays local and keeps matching its element
        // zone. The cost is that genuine third-party packages are not flagged
        // external either, which is what customSourcePatterns below restores
        // for exactly the modules the import matrix restricts.
        inNodeModules: false,
        outsideRootPath: false,
        customSourcePatterns: RESTRICTED_EXTERNAL_SOURCE_PATTERNS,
      },
      "boundaries/elements": [
        workspaceApp("app-web", "web"),
        workspaceApp("app-mobile", "mobile"),
        workspacePackage("config", "config"),
        workspacePackage("constants", "constants"),
        workspacePackage("types", "types"),
        workspacePackage("observability", "observability"),
        workspacePackage("utils", "utils"),
        workspacePackage("validators", "validators"),
        workspacePackage("db", "db"),
        workspacePackage("auth", "auth"),
        workspacePackage("api", "api"),
        workspacePackage("hooks", "hooks"),
        workspacePackage("ui", "ui"),
      ],
    },
    rules: {
      "boundaries/dependencies": buildDependenciesRule(),
    },
  },
  ...RESTRICTED_EXTERNAL_EXCEPTIONS.map(({ file, module }) => ({
    files: [file],
    rules: {
      "boundaries/dependencies": buildDependenciesRule(module),
    },
  })),
];
