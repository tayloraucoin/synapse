/**
 * Linear's service (USE-100): the connect, the tokens and the disconnect;
 * USE-101 adds the sync and the read; USE-102 the outbox.
 * What leaves this folder is a URL, a cookie value, an outcome, or (inside
 * `@syn/api` only) an access token for a call to Linear. No ciphertext, no
 * key and no token is in any router's output.
 */
export { handleLinearCallback, type LinearCallbackOutcome } from "./callback";
export {
  disconnectLinearConnection,
  finishLinearConnect,
  linearTokensFor,
  readLinearFor,
  retryLinearWriteFor,
  sendDueLinearWritesFor,
  startLinearConnect,
  syncLinearNow,
  writeLinearDoneFor,
  writeLinearIssueFor,
} from "./entry";
export { LINEAR_SEND_DUE_MS } from "./outbox";
export { readLinearSnapshots } from "./read";
export {
  isLocalPath,
  LINEAR_OAUTH_COOKIE,
  LINEAR_OAUTH_COOKIE_OPTIONS,
} from "./oauth-cookie";
export { LinearReconnectNeeded } from "./refresh";
export { LinearConnectionMissing } from "./token-store";
