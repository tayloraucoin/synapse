import { createAdminClient } from "@syn/auth";
import {
  USER_IMAGE_MIME_TYPES,
  parseAssetPath,
  toStorageKey,
} from "@syn/constants";
import { createLogger } from "@syn/observability";

import { getRequestAuthContextFromRequest } from "@/lib/auth/get-request-context";

export const runtime = "nodejs";

const log = createLogger("web/assets");

/**
 * The read rail for icons and avatars — a session-gated stream, not a signed
 * read URL.
 *
 * WHY A ROUTE AND NOT A SIGNED URL. A stored path becomes an `<img src>` with
 * no round trip to mint anything, the browser caches it for the session, and
 * the URL is worthless to anyone without the cookie. Signing instead would
 * cost a batch-signing call on every list render — every habit in the library,
 * every item on a day — and produce URLs that expire while the page is still
 * open. See the SET-3 entry in the Epic 1 TECHNICAL-DECISIONS log.
 *
 * THE SECOND OF EXACTLY TWO ADMIN-CLIENT CALL SITES. Storage has no RLS bridge
 * and the app never hands a person's JWT to the storage client, so the read
 * runs as the service role behind the check below. The other call site is
 * `@syn/api`'s `services/asset/storage.ts`.
 *
 * A FOREIGN PATH IS 404, NEVER 403. A 403 would confirm that the object
 * exists, which is exactly what a probe is asking. Not-found and not-yours are
 * deliberately the same answer.
 */

/** Empty bodies: an image request has no reader for a sentence. */
const NOT_FOUND = new Response(null, { status: 404 });
const UNAUTHORIZED = new Response(null, { status: 401 });

function resolveContentType(blobType: string | undefined): string {
  if (
    blobType &&
    (USER_IMAGE_MIME_TYPES as readonly string[]).includes(blobType)
  ) {
    return blobType;
  }
  // With `nosniff` set, an unexpected type simply fails to render — which is
  // the correct failure for bytes we cannot vouch for.
  return "application/octet-stream";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bucket: string; path: string[] }> },
): Promise<Response> {
  const { bucket, path } = await params;

  // The URL is the stored path with one prefix, so re-assembling it and
  // parsing it with the same grammar the writer used is the whole validation:
  // a readable bucket, exactly three segments, and a file name that cannot
  // climb out of the owner's folder. `exports` fails here, which is why a data
  // export is not reachable through this route.
  const parsed = parseAssetPath([bucket, ...path].join("/"));
  if (!parsed) {
    return NOT_FOUND;
  }

  const auth = await getRequestAuthContextFromRequest(request);
  if (!auth) {
    return UNAUTHORIZED;
  }

  if (parsed.userId !== auth.authContext.userId) {
    return NOT_FOUND;
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage
      .from(parsed.bucket)
      .download(toStorageKey(parsed));

    if (error || !data) {
      return NOT_FOUND;
    }

    const body = await data.arrayBuffer();

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": resolveContentType(data.type),
        "Content-Length": String(body.byteLength),
        // Private: a shared cache must never hold one person's icon. The path
        // carries a uuid and a replaced image is a new path, so `immutable` is
        // safe — the bytes at this URL never change.
        "Cache-Control": "private, max-age=86400, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (caught) {
    // The fault, never the path's owner or the bytes.
    log.log("asset read failed", {
      bucket: parsed.bucket,
      message: caught instanceof Error ? caught.message : String(caught),
    });
    return NOT_FOUND;
  }
}
