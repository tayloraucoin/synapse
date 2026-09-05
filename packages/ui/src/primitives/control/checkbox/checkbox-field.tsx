/**
 * CheckboxField — a checkbox with its label, as one target.
 *
 * The whole row is the label, so the 20px visual mark sits inside a target the
 * width of the text — which is the accessible-target rule met by geometry
 * rather than by padding a small box.
 *
 * Prefer this over hand-rolling `<label> + <Checkbox> + <Text>` in a feature:
 * a checkbox whose label is not wired is a checkbox with a 20px target.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../typography/text";
import { Checkbox } from "./checkbox";

export interface CheckboxFieldClasses {
  root?: string;
  checkbox?: string;
  label?: string;
}

export interface CheckboxFieldProps
  extends Omit<React.ComponentProps<typeof Checkbox>, "children"> {
  children: React.ReactNode;
  classes?: CheckboxFieldClasses;
}

function CheckboxField({
  id,
  children,
  classes,
  className,
  ...checkboxProps
}: CheckboxFieldProps) {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;

  return (
    <label
      htmlFor={fieldId}
      className={cn(
        "flex min-h-(--target) cursor-pointer items-start gap-(--space-3) py-(--space-2)",
        classes?.root,
      )}
    >
      <Checkbox
        id={fieldId}
        className={cn("mt-0.5", classes?.checkbox, className)}
        {...checkboxProps}
      />
      <Text as="span" variant="body" className={cn("text-pretty", classes?.label)}>
        {children}
      </Text>
    </label>
  );
}

export { CheckboxField };
