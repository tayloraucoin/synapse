import { STORAGE_KEYS } from "@syn/constants";

/**
 * FR-03's template id, kept for the browser session.
 *
 * THE ONE PIECE OF FIRST-RUN STATE NOT ON THE ACCOUNT, which the ticket
 * permits by name. It exists so stepping back and forward through the sequence
 * reopens the template that was started rather than leaving a trail of empty
 * *Morning* rows; it is not progress, and losing it costs one extra template a
 * person can archive.
 *
 * Every access is wrapped: private mode and disabled site data both make
 * `sessionStorage` throw on the property itself, not just on the call, and a
 * setup sequence that white-screens because storage is off would be a worse
 * failure than the one being guarded against.
 */
export function readSetupTemplateId(): string | null {
  try {
    return window.sessionStorage.getItem(STORAGE_KEYS.SETUP_TEMPLATE_ID);
  } catch {
    return null;
  }
}

export function rememberSetupTemplateId(id: string): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEYS.SETUP_TEMPLATE_ID, id);
  } catch {
    // The step still works; a return trip creates a second template.
  }
}

export function forgetSetupTemplateId(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEYS.SETUP_TEMPLATE_ID);
  } catch {
    // Nothing to clean up if it could never be written.
  }
}
