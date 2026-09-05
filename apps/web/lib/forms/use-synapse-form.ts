"use client";

import {
  useZodForm,
  type UseZodFormProps,
} from "@syn/hooks";
import type { FieldValues, UseFormReturn } from "react-hook-form";

/**
 * Every form in Synapse. `useZodForm` in `@syn/hooks` keeps Conscious
 * Connections' blur-first defaults, verbatim; this wrapper applies Synapse's
 * rule at the call site.
 *
 * SUBMIT-FIRST, THEN LIVE — Epic 1 §0.3, v2 handoff D6. Nothing is marked
 * wrong while a person is still typing it; after they submit, each field
 * corrects itself as they fix it. Blur-first would flag a half-typed email the
 * moment they tabbed away to check something, which is the product telling
 * someone off for reading.
 */
export function useSynapseForm<TFieldValues extends FieldValues>(
  props: UseZodFormProps<TFieldValues>,
): UseFormReturn<TFieldValues> {
  return useZodForm<TFieldValues>({
    ...props,
    mode: props.mode ?? "onSubmit",
    reValidateMode: props.reValidateMode ?? "onChange",
  });
}

export { fieldErrorProps, visibleFieldError } from "@syn/hooks";
