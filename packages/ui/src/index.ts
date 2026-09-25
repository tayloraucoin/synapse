/**
 * @syn/ui — the web component library. Storybook-first.
 *
 * This is the one web-only package: it may reach for the DOM, and nothing else
 * shared may. That is what makes the future Expo app a re-skin — logic stays
 * platform-pure in `@syn/{types,constants,utils,validators,hooks}`, and only
 * this package is rebuilt.
 *
 * Every export is enumerated here and mirrored by an explicit subpath in
 * package.json. There is no `"./*"` wildcard export.
 */

export { cn } from "./lib/cn";
export { useIsWide, useMediaQuery } from "./lib/use-media-query";
export { usePrefersReducedMotion } from "./hooks/use-prefers-reduced-motion";
export { useAppTheme } from "./hooks/use-theme";
export { ThemeProvider } from "./providers/theme-provider";

export {
  THEME_CONTROL_COPY,
  THEME_OPTIONS,
  ThemeControl,
  type ThemeControlProps,
  type ThemeOption,
} from "./composed/control/theme-control";

export {
  ACCENT_STEPS,
  CATEGORY_AUTHORED_STEPS,
  CATEGORY_DERIVED_STEPS,
  CATEGORY_KEYS,
  CATEGORY_STEPS,
  DESTRUCTIVE_TOKEN,
  NEUTRAL_STEPS,
  SEMANTIC_TOKENS,
  VIOLET_STEPS,
  accentToken,
  categoryToken,
  neutralToken,
  violetToken,
  type AccentStep,
  type CategoryStep,
  type NeutralStep,
} from "./branding";

export {
  Button,
  buttonVariants,
  type ButtonProps,
} from "./primitives/control/button";
export {
  Checkbox,
  CheckboxField,
  type CheckboxFieldClasses,
  type CheckboxFieldProps,
} from "./primitives/control/checkbox";
export {
  Input,
  inputSkin,
  inputVariants,
  type InputClasses,
  type InputMode,
  type InputProps,
} from "./primitives/control/input";
export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
  inputGroupAddonVariants,
  inputGroupButtonVariants,
} from "./primitives/control/input-group";
export {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "./primitives/control/native-select";
export {
  RadioGroup,
  RadioGroupItem,
} from "./primitives/control/radio-group";
export {
  Select,
  SelectContent,
  SelectField,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type SelectFieldClasses,
  type SelectFieldProps,
  type SelectOption,
} from "./primitives/control/select";
export {
  Switch,
  type SwitchProps,
} from "./primitives/control/switch";
export {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  tabsListVariants,
} from "./primitives/control/tabs";
export {
  Textarea,
  type TextareaClasses,
  type TextareaProps,
} from "./primitives/control/textarea";
export {
  ToggleGroup,
  ToggleGroupItem,
  toggleVariants,
} from "./primitives/control/toggle-group";
export {
  Avatar,
  type AvatarProps,
  type AvatarSize,
} from "./primitives/display/avatar";
export {
  Badge,
  badgeVariants,
} from "./primitives/display/badge";
export {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  emptyMediaVariants,
} from "./primitives/display/empty";
export {
  HelperText,
  type HelperTextClasses,
  type HelperTextProps,
} from "./primitives/display/helper-text";
export {
  Kbd,
  KbdGroup,
} from "./primitives/display/kbd";
export {
  Label,
} from "./primitives/display/label";
export {
  Skeleton,
} from "./primitives/display/skeleton";
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
  ConfirmDialog,
  type ConfirmDialogClasses,
  type ConfirmDialogProps,
} from "./primitives/feedback/alert-dialog";
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPanel,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  type DialogPanelClasses,
  type DialogPanelProps,
} from "./primitives/feedback/dialog";
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./primitives/feedback/dropdown-menu";
export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./primitives/feedback/popover";
export {
  Spinner,
} from "./primitives/feedback/spinner";
export {
  Toaster,
  toast,
  toastUndo,
  type ToastUndoOptions,
  type ToasterProps,
} from "./primitives/feedback/toaster";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./primitives/feedback/tooltip";
export {
  Collapsible,
  CollapsibleContent,
  CollapsiblePanel,
  CollapsibleTrigger,
  type CollapsiblePanelClasses,
  type CollapsiblePanelProps,
} from "./primitives/layout/collapsible";
export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "./primitives/layout/drawer";
export {
  Separator,
} from "./primitives/layout/separator";
export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardSummary,
  CardTitle,
  type CardSummaryClasses,
  type CardSummaryProps,
} from "./primitives/layout/card";
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetTitle,
  SheetTrigger,
  type SheetPanelClasses,
  type SheetPanelProps,
} from "./primitives/layout/sheet";
export {
  BottomNav,
  BottomNavItem,
  BottomNavList,
  bottomNavItemVariants,
  type BottomNavClasses,
  type BottomNavItemProps,
  type BottomNavItemVariantProps,
} from "./primitives/navigation/bottom-nav";
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  sidebarMenuButtonVariants,
  useSidebar,
} from "./primitives/navigation/sidebar";
export {
  Caption,
  Heading,
  Meta,
  REVIEW_TEXT_VARIANTS,
  TEXT_TONES,
  TEXT_VARIANTS,
  Text,
  inferVariantFromElement,
  textVariants,
  type TextClasses,
  type TextProps,
  type TextTone,
  type TextVariant,
} from "./primitives/typography/text";

/* ---- composed: display ---- */
export {
  BigNumber,
  FactLine,
  FormulaSentence,
  type BigNumberProps,
  type FactLineProps,
  type FormulaSentenceProps,
  type FormulaTerm,
} from "./composed/display/big-number";
export {
  CategoryBar,
  type CategoryBarProps,
  type CategorySegment,
} from "./composed/display/category-bar";
export {
  DAY_HEADER_COPY,
  DayHeader,
  type DayHeaderProps,
} from "./composed/display/day-header";
export {
  DayOutcomeRow,
  ShiftRow,
  WeekRow,
  type DayOutcomeRowProps,
  type ShiftRowProps,
  type WeekRowProps,
} from "./composed/display/day-outcome-row";
/* ---- UX v1.1 (DYN-7): the block model's composites ---- */
export {
  BLOCK_HEADER_COPY,
  BLOCK_KIND_WORDS,
  BlockHeader,
  type BlockHeaderProps,
} from "./composed/display/block-header";
export {
  BlockBand,
  bandVariants,
  type BandVariants,
  type BlockBandProps,
} from "./composed/display/block-band";
export { GapBand, type GapBandProps } from "./composed/display/gap-band";
export {
  BUDGET_LINE_COPY,
  BudgetLine,
  budgetStateFor,
  type BudgetLineProps,
} from "./composed/display/budget-line";
export {
  SLOT_ROW_COPY,
  SlotRow,
  type SlotRowProps,
} from "./composed/display/slot-row";
export {
  DecidedLine,
  type DecidedLineProps,
} from "./composed/display/decided-line";
export {
  ExpanderSection,
  type ExpanderSectionProps,
} from "./composed/display/expander-section";
export {
  HabitStrip,
  StripSquare,
  type HabitStripProps,
  type StripSize,
  type StripSquareProps,
} from "./composed/display/habit-strip";
export {
  ITEM_ROW_COPY,
  ItemRow,
  isDoneState,
  isFadedState,
  isUntickableState,
  itemRowVariants,
  stateWordFor,
  type ItemRowClasses,
  type ItemRowProps,
  type ItemRowVariant,
  type ItemRowVariantProps,
} from "./composed/display/item-row";
export {
  MultitaskGroup,
  type MultitaskGroupProps,
} from "./composed/display/multitask-group";
export { NowLine, type NowLineProps } from "./composed/display/now-line";
export {
  PreflightNote,
  type PreflightNoteProps,
} from "./composed/display/preflight-note";
export {
  ReviewRegion,
  type ReviewRegionProps,
} from "./composed/display/review-region";
export {
  BandLabelPlacementContext,
  SCHEDULE_GUTTER_PX,
  ScheduleAxis,
  type BandLabelPlacement,
  type ScheduleAxisProps,
} from "./composed/display/schedule-axis";
export {
  ScheduleBlock,
  scheduleBlockVariants,
  type ScheduleBlockProps,
  type ScheduleBlockSize,
  type ScheduleBlockVariants,
} from "./composed/display/schedule-block";
export {
  GhostBlock,
  ShiftBand,
  WindowSpan,
  type GhostBlockProps,
  type ShiftBandProps,
  type WindowSpanProps,
} from "./composed/display/schedule-overlays";
export {
  SessionRow,
  type SessionRowProps,
} from "./composed/display/session-row";
export {
  STATE_WORDS,
  STATE_WORDS_WITH_DOT,
  STATE_WORDS_WITH_TEXT,
  StateWord,
  type StateWordProps,
} from "./composed/display/state-word";
export {
  TemplateUsageRow,
  type TemplateUsageRowProps,
} from "./composed/display/template-usage-row";
export {
  TimerDisplay,
  type TimerDisplayProps,
} from "./composed/display/timer-display";
export {
  ARCHIVED_SECTION_COPY,
  ArchivedSection,
  type ArchivedSectionProps,
} from "./composed/display/archived-section";
export {
  CategoryChip,
  type CategoryChipProps,
} from "./composed/display/category-chip";
export {
  GroupHeading,
  type GroupHeadingProps,
} from "./composed/display/group-heading";
export {
  CURATED_GLYPHS,
  ItemIcon,
  PinGlyph,
  getCuratedGlyph,
  type CuratedGlyph,
  type ItemIconProps,
  type ItemIconSize,
  type PinGlyphProps,
} from "./composed/display/item-icon";
export {
  ListRow,
  listRowSurfaceVariants,
  type ListRowClasses,
  type ListRowProps,
  type ListRowSurfaceVariants,
} from "./composed/display/list-row";
export {
  EmojiSlot,
  isIconValue,
  type EmojiSlotProps,
  type EmojiSlotSize,
} from "./composed/display/emoji-slot";
export {
  PRIORITY_MARK_COPY,
  PriorityMark,
  type PriorityMarkProps,
  type PriorityMarkValue,
} from "./composed/display/priority-mark";
export {
  PASSAGE_CAROUSEL_COPY,
  PassageCarousel,
  type PassageCarouselProps,
  type PassageSlide,
} from "./composed/display/passage-carousel";
export {
  SelectRow,
  SelectRowList,
  type SelectRowListProps,
  type SelectRowProps,
} from "./composed/control/select-row";
export {
  SORTABLE_LIST_COPY,
  SortableHandle,
  SortableList,
  type SortableHandleProps,
  type SortableItem,
  type SortableListProps,
  type SortableRenderState,
} from "./composed/control/sortable-list";
export {
  RANGE_EDITOR_COPY,
  RangeEditor,
  type RangeEditorProps,
  type RangeEditorValue,
} from "./composed/control/range-editor";
export {
  RICH_TEXT_EDITOR_COPY,
  RichTextEditor,
  type RichTextEditorProps,
} from "./composed/control/rich-text-editor";
export {
  TAG_INPUT_COPY,
  TagInput,
  type TagInputProps,
} from "./composed/control/tag-input";
export {
  EmojiSlotButton,
  type EmojiSlotButtonProps,
} from "./composed/control/emoji-slot-button";
export {
  SettingsRow,
  type SettingsRowProps,
} from "./composed/display/settings-row";
export { Tag, type TagProps, type TagTone } from "./composed/display/tag";
export {
  TimeText,
  type TimeTextMode,
  type TimeTextProps,
} from "./composed/display/time-text";
export {
  TRUST_LINE_COPY,
  TrustLine,
  type TrustLineProps,
} from "./composed/display/trust-line";

/* ---- composed: layout & navigation ---- */
export {
  ActionRowSheet,
  type ActionRow,
  type ActionRowSheetProps,
} from "./composed/layout/action-row-sheet";
export { AuthFrame, type AuthFrameProps } from "./composed/layout/auth-frame";
export {
  ERROR_PAGE_COPY,
  ErrorPage,
  type ErrorPageProps,
} from "./composed/layout/error-page";
export {
  ResponsiveSheet,
  type ResponsiveSheetClasses,
  type ResponsiveSheetProps,
} from "./composed/layout/responsive-sheet";
export {
  ScreenFrame,
  type ScreenFrameProps,
} from "./composed/layout/screen-frame";
export {
  STEP_FRAME_SKELETON_COPY,
  StepFrame,
  StepFrameSkeleton,
  type StepFrameCopy,
  type StepFrameProps,
  type StepFrameSkeletonProps,
} from "./composed/layout/step-frame";
export {
  AppHeader,
  type AppHeaderClasses,
  type AppHeaderProps,
} from "./composed/navigation/app-header";

/* ---- composed: feedback ---- */
export {
  DISCARD_DIALOG_COPY,
  DiscardDialog,
  type DiscardDialogProps,
} from "./composed/feedback/discard-dialog";
export {
  EmptyState,
  type EmptyStateAction,
  type EmptyStateProps,
} from "./composed/feedback/empty-state";
export {
  InlineQuestionRow,
  type InlineQuestionAction,
  type InlineQuestionRowProps,
} from "./composed/feedback/inline-question-row";
export {
  LoadingText,
  type LoadingTextProps,
} from "./composed/feedback/loading-text";
export {
  RegionRetry,
  type RegionRetryProps,
} from "./composed/feedback/region-retry";
export {
  SAVE_STATUS_COPY,
  SaveStatusText,
  type SaveStatusTextProps,
} from "./composed/feedback/save-status";
export {
  SkeletonBlock,
  SkeletonRow,
  type SkeletonBlockProps,
  type SkeletonRowProps,
} from "./composed/feedback/skeleton-row";
export {
  InstallLine,
  PermissionLine,
  STATUS_LINE_COPY,
  StatusLine,
  TimezoneLine,
  UpdateLine,
  pendingReviewText,
  timezoneMismatchText,
  type InstallLineProps,
  type PermissionLineProps,
  type StatusLineCopyEntry,
  type StatusLineProps,
  type TimezoneLineProps,
  type UpdateLineProps,
} from "./composed/feedback/status-line";
export {
  ShortcutsDialog,
  type Shortcut,
  type ShortcutsDialogProps,
} from "./composed/feedback/shortcuts-dialog";
export {
  ThreeOptionDialog,
  type ThreeOptionDialogOption,
  type ThreeOptionDialogProps,
} from "./composed/feedback/three-option-dialog";
export {
  TypedConfirmDialog,
  type TypedConfirmDialogProps,
} from "./composed/feedback/typed-confirm-dialog";

/* ---- composed: control ---- */
export {
  DECISION_PANEL_COPY,
  DecisionPanel,
  TRADED_UP_PHRASE,
  TRADED_UP_REASON_KEY,
  WEIGHT_PHRASE,
  type Decision,
  type DecisionPanelProps,
  type DecisionVerdict,
} from "./composed/control/decision-panel";
export {
  DayCompleteAction,
  type DayCompleteActionProps,
} from "./composed/control/day-complete-action";
export {
  OverflowCutList,
  type OverflowCutListProps,
  type OverflowItem,
} from "./composed/control/overflow-cut-list";
export {
  ReflectionBlock,
  type ReflectionAxis,
  type ReflectionBlockProps,
} from "./composed/control/reflection-block";
export {
  TimerControl,
  type TimerControlProps,
} from "./composed/control/timer-control";
export {
  ChipPicker,
  type ChipPickerOption,
  type ChipPickerProps,
} from "./composed/control/chip-picker";
export {
  ColorSwatchRow,
  type ColorSwatchRowProps,
  type ColorSwatchValue,
} from "./composed/control/color-swatch-row";
export {
  CountStepper,
  type CountStepperProps,
} from "./composed/control/count-stepper";
export {
  CuratedIconGrid,
  type CuratedIconGridProps,
} from "./composed/control/curated-icon-grid";
export { DateField, type DateFieldProps } from "./composed/control/date-field";
export {
  EmojiPicker,
  type EmojiPickerProps,
} from "./composed/control/emoji-picker";
export {
  EllipsesMenu,
  type EllipsesMenuItem,
  type EllipsesMenuProps,
} from "./composed/control/ellipses-menu";
export {
  ImageCropper,
  type ImageCropperProps,
} from "./composed/control/image-cropper";
export {
  LargeTargetRow,
  type LargeTargetOption,
  type LargeTargetRowProps,
} from "./composed/control/large-target-row";
/* ---- UX v1.1 (DYN-7): the drag layer and the confirm rows ---- */
export {
  DRAG_LAYER_COPY,
  DragLayer,
  type DragIntent,
  type DragLayerBlock,
  type DragLayerItem,
  type DragLayerProps,
} from "./composed/control/drag-layer";
export {
  CONFIRM_YESTERDAY_COPY,
  ConfirmYesterdayRows,
  type ConfirmYesterdayRowsProps,
} from "./composed/control/confirm-yesterday-rows";
export {
  MINUTES_STEPPER_COPY,
  MinutesStepper,
  type MinutesStepperProps,
} from "./composed/control/minutes-stepper";
export {
  NotificationRow,
  type NotificationRowProps,
  type NotificationRowValue,
} from "./composed/control/notification-row";
export {
  NumberUnitInput,
  type NumberUnitChip,
  type NumberUnitInputProps,
} from "./composed/control/number-unit-input";
export {
  OAuthButton,
  type OAuthButtonProps,
} from "./composed/control/oauth-button";
export {
  PICKER_LIST_COPY,
  PickerList,
  type PickerListGroup,
  type PickerListItem,
  type PickerListProps,
} from "./composed/control/picker-list";
export {
  QuickChipRow,
  type QuickChip,
  type QuickChipRowProps,
} from "./composed/control/quick-chip-row";
export {
  RangeInput,
  type RangeInputProps,
  type RangeValue,
} from "./composed/control/range-input";
export {
  OTHER_REASON_KEY,
  ReasonChips,
  type ReasonChipsProps,
} from "./composed/control/reason-chips";
export {
  SearchField,
  type SearchFieldClasses,
  type SearchFieldProps,
} from "./composed/control/search-field";
export {
  SegmentedControl,
  type SegmentedControlClasses,
  type SegmentedControlOption,
  type SegmentedControlProps,
} from "./composed/control/segmented-control";
export {
  Stepper17,
  stepper17CellVariants,
  type Stepper17Classes,
  type Stepper17Props,
  type Stepper17Value,
} from "./composed/control/stepper-17";
export {
  TextDisclosureButton,
  type TextDisclosureButtonClasses,
  type TextDisclosureButtonProps,
} from "./composed/control/text-disclosure-button";
export {
  InfoDisclosure,
  type InfoDisclosureClasses,
  type InfoDisclosureItem,
  type InfoDisclosureProps,
} from "./composed/control/info-disclosure";
export {
  TIERS_WITH_REASONS,
  TIER_RADIO_ROWS_COPY,
  TIER_ROWS,
  TierRadioRows,
  type TierCopy,
  type TierRadioRowsProps,
} from "./composed/control/tier-radio-rows";
export { TimeField, type TimeFieldProps } from "./composed/control/time-field";
export {
  TimezoneSelect,
  type TimezoneRegion,
  type TimezoneSelectProps,
  type TimezoneZone,
} from "./composed/control/timezone-select";
export {
  WeekdayChips,
  type Weekday,
  type WeekdayChipsProps,
  type WeekdayIndexing,
} from "./composed/control/weekday-chips";
