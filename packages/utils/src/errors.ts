/**
 * The one error base every layer throws — conventions §9A.
 *
 * Errors are typed, thrown deep, caught at the boundary, and logged once
 * through `@syn/observability`. `code` is the stable, greppable identity; the
 * message is for a log, never for a person — user-facing copy is written on
 * the surface, from the UX documents, not lifted out of an exception.
 */
export class AppError extends Error {
  readonly code: string;

  constructor(code: string, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AppError";
    this.code = code;
  }
}

/** Narrowing guard for the boundary handler. */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
