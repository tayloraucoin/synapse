import { and, eq, max } from "drizzle-orm";

import { reasons, type RlsClient } from "@syn/db";
import type { MissTier, ReasonView } from "@syn/types";
import { slugify } from "@syn/utils";

import { ensureReasonSet } from "./ensure-reason-set";
import { toView } from "./list-reasons";

/**
 * ST-06a's writes, and REV-2's *Keep this reason*.
 *
 * A KEY IS ASSIGNED ONCE AND NEVER CHANGES. `misses.reason_key` and
 * `shifts.reason_key` are text, so a record made under *Slept in* still says
 * `slept_in` after the person renames it to *Overslept* — the label is what
 * they see, the key is what happened. Recomputing the key on rename is the
 * single most tempting mistake here and it would silently orphan every past
 * miss from its reason.
 *
 * A STRUCTURAL ROW'S TIER IS LOCKED (ST-06). *Didn't do it* IS the
 * `chose_not_to` tier and *Other* has no tier of its own; letting either move
 * would make the three tier headings mean something different per account.
 * The label stays editable — a person may call it whatever they like.
 */
export class DuplicateReasonError extends Error {
  constructor() {
    super("duplicate_reason");
    this.name = "DuplicateReasonError";
  }
}

export class StructuralReasonError extends Error {
  constructor() {
    super("structural_reason");
    this.name = "StructuralReasonError";
  }
}

export async function createReason(
  rls: RlsClient,
  userId: string,
  input: { label: string; tier: MissTier },
): Promise<ReasonView> {
  await ensureReasonSet(rls, userId);

  return rls.execute(async (tx) => {
    const label = input.label.trim();

    const clash = await tx
      .select({ id: reasons.id })
      .from(reasons)
      .where(and(eq(reasons.userId, userId), eq(reasons.label, label)))
      .limit(1);

    if (clash.length > 0) throw new DuplicateReasonError();

    const key = await freeKey(tx, userId, label);

    // New rows sort after everything, including anything added before them.
    const [highest] = await tx
      .select({ value: max(reasons.sortOrder) })
      .from(reasons)
      .where(eq(reasons.userId, userId));

    const rows = await tx
      .insert(reasons)
      .values({
        userId,
        key,
        label,
        tier: input.tier,
        builtIn: false,
        structural: false,
        sortOrder: Number(highest?.value ?? 0) + 1,
      })
      .returning({
        key: reasons.key,
        label: reasons.label,
        tier: reasons.tier,
        builtIn: reasons.builtIn,
        structural: reasons.structural,
      });

    const row = rows[0];
    if (!row) throw new Error("reason insert returned no row");
    return toView(row);
  });
}

export async function updateReason(
  rls: RlsClient,
  userId: string,
  input: { key: string; label: string; tier: MissTier },
): Promise<ReasonView> {
  return rls.execute(async (tx) => {
    const [existing] = await tx
      .select({ structural: reasons.structural, tier: reasons.tier })
      .from(reasons)
      .where(and(eq(reasons.userId, userId), eq(reasons.key, input.key)))
      .limit(1);

    if (!existing) throw new Error("no such reason");

    // The label may always change; the tier may not, on a structural row.
    if (existing.structural && input.tier !== existing.tier) {
      throw new StructuralReasonError();
    }

    const label = input.label.trim();

    const clash = await tx
      .select({ key: reasons.key })
      .from(reasons)
      .where(and(eq(reasons.userId, userId), eq(reasons.label, label)))
      .limit(1);

    if (clash.length > 0 && clash[0]?.key !== input.key) {
      throw new DuplicateReasonError();
    }

    const rows = await tx
      .update(reasons)
      // `key` is deliberately absent from this patch. See the note above.
      .set({ label, tier: input.tier, updatedAt: new Date() })
      .where(and(eq(reasons.userId, userId), eq(reasons.key, input.key)))
      .returning({
        key: reasons.key,
        label: reasons.label,
        tier: reasons.tier,
        builtIn: reasons.builtIn,
        structural: reasons.structural,
      });

    const row = rows[0];
    if (!row) throw new Error("no such reason");
    return toView(row);
  });
}

export async function archiveReason(
  rls: RlsClient,
  userId: string,
  key: string,
  archived: boolean,
): Promise<{ key: string }> {
  return rls.execute(async (tx) => {
    const [existing] = await tx
      .select({ structural: reasons.structural })
      .from(reasons)
      .where(and(eq(reasons.userId, userId), eq(reasons.key, key)))
      .limit(1);

    if (!existing) throw new Error("no such reason");
    if (existing.structural && archived) throw new StructuralReasonError();

    await tx
      .update(reasons)
      .set({ archivedAt: archived ? new Date() : null, updatedAt: new Date() })
      .where(and(eq(reasons.userId, userId), eq(reasons.key, key)));

    return { key };
  });
}

/**
 * REV-2's *Keep this reason* — promote a one-off reason typed in a review into
 * the person's set.
 *
 * It is `createReason` with one difference: a label they already have is not
 * an error here. They typed it in a review, not in a form with a validation
 * message, and the right answer is the row they already have rather than a
 * complaint about a screen they are not on.
 */
export async function keepReason(
  rls: RlsClient,
  userId: string,
  input: { label: string; tier: MissTier },
): Promise<ReasonView> {
  try {
    return await createReason(rls, userId, input);
  } catch (error) {
    if (!(error instanceof DuplicateReasonError)) throw error;

    const rows = await rls.execute((tx) =>
      tx
        .select({
          key: reasons.key,
          label: reasons.label,
          tier: reasons.tier,
          builtIn: reasons.builtIn,
          structural: reasons.structural,
        })
        .from(reasons)
        .where(
          and(eq(reasons.userId, userId), eq(reasons.label, input.label.trim())),
        )
        .limit(1),
    );

    const row = rows[0];
    if (!row) throw error;
    return toView(row);
  }
}

/**
 * A slug of the label, with a numeric suffix on collision — `ran_long_2`.
 *
 * A label with no ASCII at all (only emoji, say) slugs to an empty string, so
 * `reason` is the fallback and the suffix loop does the rest.
 */
async function freeKey(
  tx: Parameters<Parameters<RlsClient["execute"]>[0]>[0],
  userId: string,
  label: string,
): Promise<string> {
  const base = slugify(label) || "reason";

  const taken = await tx
    .select({ key: reasons.key })
    .from(reasons)
    .where(eq(reasons.userId, userId));

  const keys = new Set(taken.map((row) => row.key));
  if (!keys.has(base)) return base;

  let suffix = 2;
  while (keys.has(`${base}_${suffix}`)) suffix += 1;
  return `${base}_${suffix}`;
}
