/**
 * The Ready, go hand-off's cross-fades (USE-43; interactions/ready-go/, the
 * dev note): Review the day to the welcome, and the welcome to Now, as
 * opacity cross-fades on the View Transitions API at `--dur-sheet`
 * (`app/globals.css`), with no new dependency. Without the API, a plain
 * route change.
 *
 * NO MOTION FROM THE KEYBOARD (C-P11, A-15), or under reduced motion: the
 * route changes at once, and the welcome lands with its sections in place.
 *
 * The transition's new picture is taken once the screen arriving says it is
 * drawn (`arrived`), so the fade never lands on a blank frame; a screen that
 * never says so is taken after `SETTLE_MS` at most.
 */

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => Promise<void>) => unknown;
};

/** The longest a fade waits for the screen arriving; never seen in practice. */
const SETTLE_MS = 600;

let settle: (() => void) | null = null;
let still = false;

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Goes on with `push`, faded unless `keyboard` (a click with no pointer,
 * `event.detail === 0`), reduced motion or no API.
 */
export function fadeNavigate(push: () => void, { keyboard = false } = {}) {
  const doc = document as ViewTransitionDocument;
  still = keyboard || reducedMotion();
  if (still || typeof doc.startViewTransition !== "function") {
    push();
    return;
  }
  doc.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        const done = () => {
          settle = null;
          resolve();
        };
        settle = done;
        push();
        window.setTimeout(done, SETTLE_MS);
      }),
  );
}

/** The arriving screen is drawn: the fade's new picture can be taken. */
export function arrived() {
  settle?.();
}

/** Whether the screen arriving lands still (keyboard, reduced motion); read once. */
export function takeStill(): boolean {
  const value = still;
  still = false;
  return value;
}
