/**
 * @syn/observability — side-effectful dev/monitoring helpers (logging, tracing).
 *
 * Not @syn/utils: purity is not required here. I/O and env reads are intentional.
 *
 * There is no analytics module. Synapse has no product-event stream in Phase 1,
 * and the day's content is never an event payload in any phase.
 */

export { createLogger, logStep, type LogPayload } from "./logging";

export { isDev } from "./is-dev";

export { describeError } from "./describe-error";
