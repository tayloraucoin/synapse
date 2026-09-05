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
