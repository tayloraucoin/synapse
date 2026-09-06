import { and, desc, eq, gt } from "drizzle-orm";
import { zipSync } from "fflate";

import { createAdminClient } from "@syn/auth";
import {
  EXPORTS_BUCKET,
  exportStorageKey,
  exportStoragePath,
} from "@syn/constants";
import { dataExports, type RlsClient } from "@syn/db";
import { createLogger } from "@syn/observability";

import { buildExportFiles, readAccountData } from "./build-export";

/**
 * *Export everything* — Epic 1 ST-10, official spec §7.6.
 *
 * IT RUNS INSIDE THE MUTATION. A personal dataset is kilobytes to a few
 * megabytes, so the whole pipeline — read, build, zip, upload — fits in one
 * request and the screen shows a result rather than a promise. A queue would be
 * a second system, a second failure mode, and a second place the person's data
 * sits, for a problem that does not exist at this size. The revisit trigger is
 * stated and small: an export over 30 seconds or 50 MB.
 *
 * THE ROW IS WRITTEN FIRST, `preparing`. If the process dies mid-build the row
 * is what tells the next visit that something was attempted, and the guard
 * below is what stops a person hammering the button into five parallel builds.
 *
 * THE UPLOAD IS THE ONE ADMIN CALL. Storage has no RLS bridge; the path is
 * built from the session's user id and never from input, which is the same
 * discipline `services/asset/storage.ts` states for icons and avatars.
 *
 * NOTHING PERSONAL IS LOGGED. The log lines below carry an export id, a byte
 * count and a duration — no email, no path, no title. That is a
 * non-negotiable of this slice, not a style preference.
 */

const log = createLogger("user/export");

/** A build younger than this is assumed still running, not stuck. */
const PREPARING_GRACE_MS = 5 * 60 * 1000;

/** Official spec §7.6 — a link lasts a day, and the screen says so. */
export const EXPORT_TTL_MS = 24 * 60 * 60 * 1000;
const EXPORT_TTL_SECONDS = EXPORT_TTL_MS / 1000;

export type ExportRow = typeof dataExports.$inferSelect;

/**
 * The newest row, which is what ST-10 renders.
 *
 * A `ready` row whose `expires_at` has passed is reported as `expired` without
 * waiting for the job: the screen must never offer a link that will 404, and
 * the job runs at most every fifteen minutes.
 */
export async function readLatestExport(
  rls: RlsClient,
  userId: string,
  now: Date = new Date(),
): Promise<ExportRow | null> {
  const rows = await rls.execute((tx) =>
    tx
      .select()
      .from(dataExports)
      .where(eq(dataExports.userId, userId))
      .orderBy(desc(dataExports.createdAt))
      .limit(1),
  );

  const row = rows[0];
  if (!row) return null;

  if (
    row.status === "ready" &&
    row.expiresAt !== null &&
    row.expiresAt.getTime() <= now.getTime()
  ) {
    return { ...row, status: "expired" };
  }

  return row;
}

export async function requestExport(
  rls: RlsClient,
  userId: string,
  now: Date = new Date(),
): Promise<ExportRow> {
  // Two rapid presses: the second gets the first's row rather than a second
  // build. Older than the grace period and it is treated as abandoned.
  const [inFlight] = await rls.execute((tx) =>
    tx
      .select()
      .from(dataExports)
      .where(
        and(
          eq(dataExports.userId, userId),
          eq(dataExports.status, "preparing"),
          gt(
            dataExports.createdAt,
            new Date(now.getTime() - PREPARING_GRACE_MS),
          ),
        ),
      )
      .limit(1),
  );

  if (inFlight) return inFlight;

  const [created] = await rls.execute((tx) =>
    tx.insert(dataExports).values({ userId, status: "preparing" }).returning(),
  );

  if (!created) throw new Error("export: insert returned no row");

  const startedAt = Date.now();

  try {
    const data = await readAccountData(rls, userId);
    const files = buildExportFiles(data, now);
    // `zipSync` is deflate by default. The whole archive is in memory, which is
    // the same bet the synchronous build makes and holds at the same size.
    const archive = zipSync(files, { level: 6 });

    const admin = createAdminClient();
    const { error } = await admin.storage
      .from(EXPORTS_BUCKET)
      .upload(exportStorageKey(userId, created.id), archive, {
        contentType: "application/zip",
        upsert: true,
      });

    if (error) throw new Error(`upload failed: ${error.message}`);

    const [ready] = await rls.execute((tx) =>
      tx
        .update(dataExports)
        .set({
          status: "ready",
          byteSize: archive.byteLength,
          storagePath: exportStoragePath(userId, created.id),
          // The row's expiry and the signed URL's are both measured from here,
          // so the sentence and the link agree.
          expiresAt: new Date(now.getTime() + EXPORT_TTL_MS),
          updatedAt: new Date(),
        })
        .where(eq(dataExports.id, created.id))
        .returning(),
    );

    if (!ready) throw new Error("export: update returned no row");

    log.log("export ready", {
      exportId: created.id,
      bytes: archive.byteLength,
      ms: Date.now() - startedAt,
    });

    return ready;
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : String(caught);

    // `error` is stored for diagnosis and never rendered — ST-10 has its own
    // sentence. The log line carries the id and the failure, nothing about the
    // person.
    log.log("export failed", { exportId: created.id, message });

    const [failed] = await rls.execute((tx) =>
      tx
        .update(dataExports)
        .set({ status: "failed", error: message, updatedAt: new Date() })
        .where(eq(dataExports.id, created.id))
        .returning(),
    );

    return failed ?? { ...created, status: "failed" };
  }
}

/**
 * A 24-hour signed URL, minted on demand.
 *
 * NEVER STORED, NEVER IN THE PAGE'S HTML. A URL that grants access to a
 * person's entire record must not be sitting in a server-rendered document, a
 * cache, or a row — it is created when the button is pressed and it is the only
 * thing the caller ever holds. A second press mints a second URL.
 *
 * The row is re-read under RLS, so an id belonging to someone else finds
 * nothing; there is no ownership check written here because there is no way to
 * write one that RLS has not already made redundant.
 */
export async function exportDownloadUrl(
  rls: RlsClient,
  userId: string,
  exportId: string,
  now: Date = new Date(),
): Promise<string | null> {
  const [row] = await rls.execute((tx) =>
    tx
      .select()
      .from(dataExports)
      .where(and(eq(dataExports.id, exportId), eq(dataExports.userId, userId)))
      .limit(1),
  );

  if (!row || row.status !== "ready" || row.storagePath === null) return null;
  if (row.expiresAt !== null && row.expiresAt.getTime() <= now.getTime()) {
    return null;
  }

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(EXPORTS_BUCKET)
    .createSignedUrl(exportStorageKey(userId, row.id), EXPORT_TTL_SECONDS, {
      download: `synapse-export-${row.id}.zip`,
    });

  if (error || !data) return null;
  return data.signedUrl;
}
