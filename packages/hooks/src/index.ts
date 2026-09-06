/**
 * @syn/hooks — headless React hooks, shared by the web app and the future Expo
 * app.
 *
 * PLATFORM-PURE. No `next/*`, no DOM, no Supabase client, no tRPC client
 * instance. `AppRouter` may be imported as a TYPE only — that edge is allowed
 * by the boundaries lint precisely because a type import compiles to nothing.
 * A hook here that touched `window` would be a hook the Expo app has to
 * rewrite, which is the whole thing this package exists to prevent.
 *
 * A hook that needs the DOM is web-only and belongs in `@syn/ui`'s `lib/`
 * (like `useMediaQuery`) or in `apps/web/lib/hooks/`.
 */

export {
  fieldErrorProps,
  useZodForm,
  visibleFieldError,
  type UseZodFormProps,
} from "./use-zod-form";

export {
  useDerivedItems,
  type DerivableItem,
  type DerivedDayInput,
} from "./use-derived-items";
