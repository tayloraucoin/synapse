import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type FieldPath,
  type FieldValues,
  type FormState,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form";
import type { z } from "zod";

const BLUR_FIRST_DEFAULTS = {
  mode: "onBlur",
  reValidateMode: "onChange",
} as const satisfies Pick<UseFormProps<FieldValues>, "mode" | "reValidateMode">;

type VisibleFieldErrorFormState<TFieldValues extends FieldValues> = Pick<
  FormState<TFieldValues>,
  "errors" | "touchedFields" | "isSubmitted"
>;

/** Error message for a field — only after blur or form submit, never mid-typing. */
export function visibleFieldError<
  TFieldValues extends FieldValues,
  TFieldName extends FieldPath<TFieldValues>,
>(
  formState: VisibleFieldErrorFormState<TFieldValues>,
  name: TFieldName,
): string | undefined {
  const fieldError = formState.errors[name];
  const message = fieldError?.message;
  if (typeof message !== "string" || !message) return undefined;
  const isTouched = Boolean(
    (formState.touchedFields as Record<string, boolean | undefined>)[name],
  );
  if (isTouched || formState.isSubmitted) return message;
  return undefined;
}

/** Spread onto Input, Textarea, or SelectField for blur-first error display. */
export function fieldErrorProps<
  TFieldValues extends FieldValues,
  TFieldName extends FieldPath<TFieldValues>,
>(
  formState: VisibleFieldErrorFormState<TFieldValues>,
  name: TFieldName,
): { error?: string } {
  const error = visibleFieldError(formState, name);
  return error ? { error } : {};
}

export type UseZodFormProps<TFieldValues extends FieldValues> = Omit<
  UseFormProps<TFieldValues>,
  "resolver" | "mode" | "reValidateMode"
> & {
  schema: z.ZodType<TFieldValues>;
  mode?: UseFormProps<TFieldValues>["mode"];
  reValidateMode?: UseFormProps<TFieldValues>["reValidateMode"];
};

/** Zod-backed form with blur-first validation defaults. */
export function useZodForm<TFieldValues extends FieldValues>(
  props: UseZodFormProps<TFieldValues>,
): UseFormReturn<TFieldValues> {
  const { schema, mode, reValidateMode, ...rest } = props;

  return useForm<TFieldValues>({
    ...rest,
    mode: mode ?? BLUR_FIRST_DEFAULTS.mode,
    reValidateMode: reValidateMode ?? BLUR_FIRST_DEFAULTS.reValidateMode,
    resolver: zodResolver(schema),
  });
}
