/**
 * Shared logger: `[namespace] step` with optional payload.
 *
 * Verbose `debugLog` when `NODE_ENV=development` or any of:
 * `SYN_LOG_DEBUG=1`, `NEXT_PUBLIC_SYN_LOG_DEBUG=1`
 * (override via the second argument to `createLogger`).
 *
 * Safe for Node (route handlers) and browser bundles that define `process.env`
 * (e.g. Next.js client inlining).
 *
 * Nothing a person wrote ever passes through here — no note, no reflection, no
 * reason text, no title. Synapse's promise is that only the person can see
 * their day; a log line is a place someone else could.
 */

const defaultDebug =
  process.env.NODE_ENV === "development" ||
  process.env.SYN_LOG_DEBUG === "1" ||
  process.env.NEXT_PUBLIC_SYN_LOG_DEBUG === "1";

export type LogPayload = Record<string, unknown>;

export function createLogger(
  namespace: string,
  debug: boolean = defaultDebug,
) {
  const log = (step: string, values?: unknown) => {
    if (values !== undefined && values !== null && values !== "") {
      console.log(`[${namespace}]`, step, values);
    } else {
      console.log(`[${namespace}]`, step);
    }
  };

  const debugLog = (step: string, values?: unknown) => {
    if (!debug) return;
    log(step, values);
  };

  return { log, debugLog };
}

/** One-off log without creating a logger instance. */
export function logStep(
  namespace: string,
  step: string,
  values?: LogPayload,
): void {
  createLogger(namespace).log(step, values);
}
