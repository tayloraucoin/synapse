/**
 * Stage Emojibase's English dataset into `apps/web/public/emoji`
 * (v2 handoff §6.1 step 7, reuse CC).
 *
 * WHY WE SELF-HOST. Frimousse fetches emoji data from a CDN by default
 * (jsdelivr). Synapse's egress allowlist does not include it, the picker sits
 * inside the habit sheet, and a person's icon choices are not an occasion for
 * a third-party request. Pointing `emojibaseUrl` at our own origin removes the
 * request entirely, and the picker keeps working offline — which matters here,
 * because this is a PWA.
 *
 * WHY A COPY STEP RATHER THAN A COMMIT. The dataset is ~2MB of generated JSON.
 * Committing it would put a vendored build artifact in git and make emoji
 * updates a hand-edited diff; copying from the pinned `emojibase-data`
 * devDependency keeps the version in one place (package.json) and the output
 * ignored — `.gitignore` already carries `apps/web/public/emoji/`.
 *
 * Run explicitly from `web:dev` and `web:build` rather than via a pre-script:
 * Yarn Berry's pre/post handling is not something to rely on for a step whose
 * absence is a blank picker in production.
 *
 * Idempotent: safe to run on every build.
 */
import { cp, mkdir, rm, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");

/** Only `en` — there is no i18n surface in Phase 1. */
const LOCALE = "en";

const source = resolve(repoRoot, "node_modules/emojibase-data", LOCALE);
const destination = resolve(repoRoot, "apps/web/public/emoji", LOCALE);

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(source))) {
  // Loud, not silent: a missing dataset means the picker renders empty, and
  // that is a defect that must not reach a build log unnoticed.
  console.error(
    `[emoji-data] emojibase-data not found at ${source}. Run \`yarn install\`.`,
  );
  process.exit(1);
}

await rm(destination, { recursive: true, force: true });
await mkdir(dirname(destination), { recursive: true });
await cp(source, destination, { recursive: true });

console.log(`[emoji-data] staged ${LOCALE} → apps/web/public/emoji/${LOCALE}`);
