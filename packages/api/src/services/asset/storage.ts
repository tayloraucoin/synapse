import { createAdminClient } from "@syn/auth";
import { parseAssetPath, toStorageKey, type AssetBucket } from "@syn/constants";

/**
 * ICON AND AVATAR OBJECTS, UNDER THE SERVICE ROLE.
 *
 * Storage has no equivalent of the RLS bridge: `ctx.rls` scopes SQL, not
 * objects, and the app never hands a person's JWT to the storage client. So
 * every object operation runs as the service role under a server-side check,
 * and the discipline is the same one `buildServiceRoleAuthContext` gives the
 * database — the bypass is named and greppable.
 *
 * IT IS NO LONGER THE ONLY ONE. SET-3 wrote this file as the single service-
 * role reach in `@syn/api`, and later tickets added their own, each for an
 * object class this file's `AssetBucket` grammar deliberately excludes:
 * `services/user/request-export.ts` and `delete-account.ts` (SET-10, the
 * `exports` bucket and the account-wide prefix sweep) and
 * `services/jobs/expire-exports.ts` (SYS-5). Plus the read route in
 * `apps/web`. **`grep -rn "createAdminClient()" packages/api/src apps/web` is
 * the list** — four files and one route — and it is the check to run, rather
 * than trusting this paragraph to stay current.
 *
 * THE AUTHORIZATION IS THE CALLER'S. Nothing here decides who may touch a
 * path; the services above do, by building every path from the session's user
 * id and never from input.
 */

export type SignedUpload = {
  /** The key inside the bucket — `<userId>/<uuid>.<ext>`, no bucket segment. */
  path: string;
  /** Where the browser PUTs the bytes. */
  uploadUrl: string;
  /** Bearer token the signed URL expects. */
  token: string;
};

/** `storageKey` is bucket-relative; see `toStorageKey` in `@syn/constants`. */
export async function createSignedUpload(
  bucket: AssetBucket,
  storageKey: string,
): Promise<SignedUpload> {
  const admin = createAdminClient();

  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUploadUrl(storageKey);

  if (error || !data) {
    throw new Error(
      `storage: could not sign an upload for ${bucket} (${error?.message ?? "no data"})`,
    );
  }

  return { path: data.path, uploadUrl: data.signedUrl, token: data.token };
}

/**
 * Best-effort delete. A replaced avatar's old object is orphaned bytes, not a
 * correctness problem: the row already points at the new one, so failing to
 * remove the old must never fail the operation the person actually asked for.
 * Returns whether it went, for the caller to log if it cares.
 */
export async function removeObject(storedPath: string): Promise<boolean> {
  const parsed = parseAssetPath(storedPath);
  if (!parsed) return false;

  try {
    const admin = createAdminClient();
    const { error } = await admin.storage
      .from(parsed.bucket)
      .remove([toStorageKey(parsed)]);
    return !error;
  } catch {
    return false;
  }
}
