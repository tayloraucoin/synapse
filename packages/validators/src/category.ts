import { z } from "zod";

import { CATEGORY_NAME_MAX } from "@syn/constants";

import { categoryKeySchema } from "./habit";

/**
 * CT-02's rules — Epic 1 §9: "Category name | 1–24, unique | *You already have
 * a category called this.*"
 *
 * UNIQUENESS IS NOT HERE, and cannot be: it is a fact about the person's other
 * categories, which a schema cannot see. The sheet pre-checks it against the
 * list it already loaded, and the procedure catches the unique-index violation
 * and returns CONFLICT with this same sentence — so the two paths say one
 * thing.
 */

export const categoryNameSchema = z
  .string()
  .trim()
  .min(1, "You already have a category called this.")
  .max(CATEGORY_NAME_MAX, "You already have a category called this.");

export const createCategoryInput = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(CATEGORY_NAME_MAX),
  colorKey: categoryKeySchema,
});

export type CreateCategoryInput = z.infer<typeof createCategoryInput>;

export const updateCategoryInput = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(CATEGORY_NAME_MAX),
  colorKey: categoryKeySchema,
});

export type UpdateCategoryInput = z.infer<typeof updateCategoryInput>;

export const categoryIdInput = z.object({ id: z.string().uuid() });

/** The duplicate-name sentence, so client and server never disagree. */
export const CATEGORY_NAME_TAKEN = "You already have a category called this.";
