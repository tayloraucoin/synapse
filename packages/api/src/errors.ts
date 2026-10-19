import { TRPCError } from "@trpc/server";

/**
 * A write the rules refuse, with the reason the client maps back to its
 * refusal class (USE-90). The reason rides on the error's `cause` and leaves
 * the server as `data.refusal` (`withRefusal`, in the error formatter), so a
 * surface shows the same refusal words live as on fixtures.
 *
 * Reasons are the fixture refusals' own: "invalid", "unknown", "duplicate",
 * "not-on-date", "past-day", "unknown-slot", "before-day", "after-day",
 * "ahead-of-now". The message is the schema's or the rule's words, shown as
 * they are.
 */
export class RefusalCause extends Error {
  readonly reason: string;

  constructor(reason: string, message: string) {
    super(message);
    this.name = "RefusalCause";
    this.reason = reason;
  }
}

/** A `BAD_REQUEST` carrying its reason: `throw refuse("duplicate", "…")`. */
export function refuse(reason: string, message: string): TRPCError {
  return new TRPCError({
    code: "BAD_REQUEST",
    message,
    cause: new RefusalCause(reason, message),
  });
}

/** The reason a refused error carries, or null for any other error. */
export function refusalReason(error: TRPCError): string | null {
  return error.cause instanceof RefusalCause ? error.cause.reason : null;
}

/** The error formatter's step: a refused error's shape gains `data.refusal`. */
export function withRefusal<Shape extends { data: object }>(
  shape: Shape,
  error: TRPCError,
): Shape & { data: { refusal: string | null } } {
  return { ...shape, data: { ...shape.data, refusal: refusalReason(error) } };
}
