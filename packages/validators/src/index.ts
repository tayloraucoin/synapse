/**
 * @syn/validators — Zod schemas for forms and tRPC I/O.
 *
 * Pattern (conventions §4.6):
 * - Export both the schema and its z.infer type from the same module.
 * - One definition shared by the form (zodResolver) and the tRPC mutation.
 * - Platform-agnostic only (no next/*, DOM, or Node-only imports).
 * - Error messages are the UX documents' copy, verbatim — a message written
 *   twice is a message that drifts.
 */

export {
  accountFormSchema,
  dayTimeFormSchema,
  passwordChangeSchema,
  type AccountFormInput,
  type DayTimeFormInput,
  type PasswordChangeInput,
} from "./account";

export {
  deferItemInput,
  itemIdInput,
  rateItemInput,
  setDoneInput,
  setNoteInput,
  setQuantityInput,
  setWakeTimeInput,
  type SetDoneInput,
} from "./item";

export {
  notificationKindSchema,
  setNotificationPrefInput,
  type SetNotificationPrefInput,
} from "./notification";

export {
  decideInput,
  decisionInput,
  reviewDayInput,
  reviewHistoryInput,
  reviewWeekInput,
  type DecideInput,
} from "./review";

export {
  missTierSchema,
  reasonArchiveInput,
  reasonFormSchema,
  reasonKeyInput,
  reasonUpdateInput,
  type ReasonFormInput,
} from "./reason";

export {
  displayNameSchema,
  emailSchema,
  forgotPasswordInput,
  passwordSchema,
  resetPasswordInput,
  signInInput,
  signUpInput,
  type DisplayName,
  type Email,
  type ForgotPasswordInput,
  type Password,
  type ResetPasswordInput,
  type SignInInput,
  type SignUpInput,
} from "./auth-credentials";

export {
  assetKindSchema,
  createUploadUrlInput,
  imageContentTypeSchema,
  setAvatarInput,
  type AssetKindInput,
  type CreateUploadUrlInput,
  type SetAvatarInput,
} from "./asset";

export {
  CATEGORY_NAME_TAKEN,
  categoryIdInput,
  categoryNameSchema,
  createCategoryInput,
  updateCategoryInput,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "./category";

export {
  categoryKeySchema,
  createFromStarterSetInput,
  createHabitInput,
  habitFormSchema,
  habitIdInput,
  habitTypeSchema,
  iconValueSchema,
  listHabitsInput,
  slotsOutsideRangeInput,
  updateHabitInput,
  type CreateFromStarterSetInput,
  type HabitFormInput,
  type HabitTypeInput,
  type IconValueInput,
  type UpdateHabitInput,
} from "./habit";

export { getDayInput, type GetDayInput } from "./day";

export {
  dateKeySchema,
  weekKeySchema,
  type DateKey,
  type WeekKey,
} from "./keys";

export {
  clockTimeSchema,
  dayCloseTimeSchema,
  themePreferenceSchema,
  timezoneSchema,
  type ClockTime,
  type ThemePreference,
  type Timezone,
} from "./preferences";

export {
  snoozeInput,
  webPushSubscribeInput,
  type WebPushSubscribeInput,
} from "./push";

export {
  manualSessionInput,
  restorePayloadInput,
  sessionIdInput,
  updateSessionInput,
} from "./timer";

export {
  discardTemplateInput,
  listTemplatesInput,
  moveSlotInput,
  restoreSlotInput,
  schedulingSchema,
  slotFormSchema,
  slotIdInput,
  templateIdInput,
  templateLeaveSchema,
  templatePatchSchema,
  timeModeSchema,
  weekdaySchema,
  type RestoreSlotInput,
  type SlotFormInput,
  type TemplatePatchInput,
} from "./template";

export {
  updatePreferencesInput,
  type UpdatePreferencesInput,
} from "./user";

export {
  applyChangesInput,
  applyTemplateInput,
  changeAnchorInput,
  copyWeekInput,
  dayDateInput,
  oneOffFormSchema,
  removeOneOffInput,
  weekInput,
  type OneOffFormInput,
} from "./week";
