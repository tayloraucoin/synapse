/**
 * The curated glyph set — the `IconValue` kind "curated" resolves against this
 * table (v2 handoff §5.4 `CuratedIconGrid`, §11 "content, not a decision").
 *
 * PLACEMENT DIVERGENCE: the handoff filed this as
 * `components/icon-picker/curated-icons.ts`, in the app. It lives here because
 * two consumers need it and one of them is lower in the layer graph —
 * `ItemIcon` (in `@syn/ui`) renders a saved curated icon everywhere an item
 * appears, and `@syn/ui` may not import from `apps/web`. One table, one home;
 * the picker imports it from here.
 *
 * WHY A STATIC IMPORT MAP: a saved icon is a *name*, and a name has to become
 * a component. `lucide-react`'s dynamic import map ships the whole catalogue
 * to the browser; naming eighty imports ships eighty. The grid and the row
 * both read this table, so the set a person can pick from and the set the app
 * can render are the same set by construction.
 *
 * Labels are the accessible name in the picker (`CuratedIconGrid`), not
 * decoration — `ItemIcon` is always `aria-hidden`, because the item's title
 * already carries the meaning.
 */
import {
  AlarmClock,
  Anchor,
  Apple,
  Backpack,
  Bath,
  Bed,
  Bike,
  Bird,
  BookOpen,
  Brain,
  Briefcase,
  Brush,
  Bus,
  Camera,
  Car,
  Carrot,
  Cat,
  ChefHat,
  ClipboardList,
  Code,
  Coffee,
  Compass,
  Dices,
  Dog,
  Droplets,
  Dumbbell,
  Film,
  Flag,
  Flame,
  Flower2,
  Footprints,
  Gamepad2,
  Gift,
  GlassWater,
  GraduationCap,
  Guitar,
  HandHeart,
  Headphones,
  Heart,
  HeartPulse,
  Highlighter,
  Home,
  Hourglass,
  Languages,
  Laptop,
  Leaf,
  Library,
  ListChecks,
  Mail,
  // Aliased: the bare name would shadow the global `Map` constructor used below.
  Map as MapGlyph,
  MessageCircle,
  Mic,
  Moon,
  Mountain,
  Music,
  Newspaper,
  NotebookPen,
  Paintbrush,
  Palette,
  Pencil,
  Phone,
  PiggyBank,
  Pill,
  Plane,
  Puzzle,
  Salad,
  Scissors,
  Shirt,
  ShoppingCart,
  ShowerHead,
  Snowflake,
  Sofa,
  Sparkles,
  Sprout,
  Star,
  Stethoscope,
  Sun,
  Sunrise,
  Target,
  Tent,
  Timer,
  TreePine,
  Trophy,
  Users,
  Utensils,
  Wallet,
  Waves,
  Wind,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface CuratedGlyph {
  /** The stored value of an `IconValue` of kind "curated". */
  name: string;
  /** The accessible label in the picker. */
  label: string;
  /** The picker's section. */
  group: string;
  Icon: LucideIcon;
}

export const CURATED_GLYPHS: readonly CuratedGlyph[] = [
  // Movement
  { name: "dumbbell", label: "Weights", group: "Movement", Icon: Dumbbell },
  { name: "bike", label: "Bike", group: "Movement", Icon: Bike },
  { name: "footprints", label: "Walk", group: "Movement", Icon: Footprints },
  { name: "waves", label: "Swim", group: "Movement", Icon: Waves },
  { name: "mountain", label: "Hike", group: "Movement", Icon: Mountain },
  { name: "target", label: "Target", group: "Movement", Icon: Target },
  { name: "trophy", label: "Trophy", group: "Movement", Icon: Trophy },
  { name: "flag", label: "Flag", group: "Movement", Icon: Flag },

  // Rest
  { name: "bed", label: "Bed", group: "Rest", Icon: Bed },
  { name: "moon", label: "Moon", group: "Rest", Icon: Moon },
  { name: "sunrise", label: "Sunrise", group: "Rest", Icon: Sunrise },
  { name: "sun", label: "Sun", group: "Rest", Icon: Sun },
  { name: "alarm-clock", label: "Alarm", group: "Rest", Icon: AlarmClock },
  { name: "hourglass", label: "Hourglass", group: "Rest", Icon: Hourglass },
  { name: "timer", label: "Timer", group: "Rest", Icon: Timer },
  { name: "bath", label: "Bath", group: "Rest", Icon: Bath },
  { name: "shower-head", label: "Shower", group: "Rest", Icon: ShowerHead },

  // Mind
  { name: "book-open", label: "Book", group: "Mind", Icon: BookOpen },
  { name: "brain", label: "Brain", group: "Mind", Icon: Brain },
  { name: "pencil", label: "Pencil", group: "Mind", Icon: Pencil },
  {
    name: "notebook-pen",
    label: "Notebook",
    group: "Mind",
    Icon: NotebookPen,
  },
  {
    name: "highlighter",
    label: "Highlighter",
    group: "Mind",
    Icon: Highlighter,
  },
  { name: "languages", label: "Languages", group: "Mind", Icon: Languages },
  {
    name: "graduation-cap",
    label: "Study",
    group: "Mind",
    Icon: GraduationCap,
  },
  { name: "library", label: "Library", group: "Mind", Icon: Library },
  { name: "newspaper", label: "News", group: "Mind", Icon: Newspaper },
  { name: "puzzle", label: "Puzzle", group: "Mind", Icon: Puzzle },
  { name: "compass", label: "Compass", group: "Mind", Icon: Compass },

  // Making
  { name: "brush", label: "Brush", group: "Making", Icon: Brush },
  { name: "paintbrush", label: "Paint", group: "Making", Icon: Paintbrush },
  { name: "palette", label: "Palette", group: "Making", Icon: Palette },
  { name: "camera", label: "Camera", group: "Making", Icon: Camera },
  { name: "music", label: "Music", group: "Making", Icon: Music },
  { name: "guitar", label: "Guitar", group: "Making", Icon: Guitar },
  { name: "mic", label: "Microphone", group: "Making", Icon: Mic },
  { name: "headphones", label: "Headphones", group: "Making", Icon: Headphones },
  { name: "film", label: "Film", group: "Making", Icon: Film },
  { name: "scissors", label: "Scissors", group: "Making", Icon: Scissors },
  { name: "sparkles", label: "Sparkles", group: "Making", Icon: Sparkles },

  // Work
  { name: "laptop", label: "Laptop", group: "Work", Icon: Laptop },
  { name: "code", label: "Code", group: "Work", Icon: Code },
  { name: "briefcase", label: "Briefcase", group: "Work", Icon: Briefcase },
  {
    name: "clipboard-list",
    label: "Clipboard",
    group: "Work",
    Icon: ClipboardList,
  },
  { name: "list-checks", label: "Checklist", group: "Work", Icon: ListChecks },
  { name: "mail", label: "Mail", group: "Work", Icon: Mail },
  { name: "phone", label: "Phone", group: "Work", Icon: Phone },
  {
    name: "message-circle",
    label: "Message",
    group: "Work",
    Icon: MessageCircle,
  },
  { name: "wallet", label: "Wallet", group: "Work", Icon: Wallet },
  { name: "piggy-bank", label: "Savings", group: "Work", Icon: PiggyBank },

  // Home
  { name: "home", label: "Home", group: "Home", Icon: Home },
  { name: "sofa", label: "Sofa", group: "Home", Icon: Sofa },
  { name: "shirt", label: "Laundry", group: "Home", Icon: Shirt },
  { name: "wrench", label: "Repair", group: "Home", Icon: Wrench },
  {
    name: "shopping-cart",
    label: "Shopping",
    group: "Home",
    Icon: ShoppingCart,
  },
  { name: "gift", label: "Gift", group: "Home", Icon: Gift },
  { name: "backpack", label: "Backpack", group: "Home", Icon: Backpack },

  // Table
  { name: "utensils", label: "Meal", group: "Table", Icon: Utensils },
  { name: "chef-hat", label: "Cooking", group: "Table", Icon: ChefHat },
  { name: "coffee", label: "Coffee", group: "Table", Icon: Coffee },
  { name: "glass-water", label: "Water", group: "Table", Icon: GlassWater },
  { name: "droplets", label: "Drink", group: "Table", Icon: Droplets },
  { name: "apple", label: "Fruit", group: "Table", Icon: Apple },
  { name: "carrot", label: "Vegetable", group: "Table", Icon: Carrot },
  { name: "salad", label: "Salad", group: "Table", Icon: Salad },

  // Care
  { name: "heart", label: "Heart", group: "Care", Icon: Heart },
  { name: "heart-pulse", label: "Health", group: "Care", Icon: HeartPulse },
  { name: "pill", label: "Medication", group: "Care", Icon: Pill },
  {
    name: "stethoscope",
    label: "Appointment",
    group: "Care",
    Icon: Stethoscope,
  },
  { name: "hand-heart", label: "Care", group: "Care", Icon: HandHeart },
  { name: "users", label: "People", group: "Care", Icon: Users },
  { name: "dog", label: "Dog", group: "Care", Icon: Dog },
  { name: "cat", label: "Cat", group: "Care", Icon: Cat },
  { name: "bird", label: "Bird", group: "Care", Icon: Bird },

  // Outside
  { name: "leaf", label: "Leaf", group: "Outside", Icon: Leaf },
  { name: "sprout", label: "Garden", group: "Outside", Icon: Sprout },
  { name: "flower-2", label: "Flower", group: "Outside", Icon: Flower2 },
  { name: "tree-pine", label: "Tree", group: "Outside", Icon: TreePine },
  { name: "tent", label: "Camp", group: "Outside", Icon: Tent },
  { name: "map", label: "Map", group: "Outside", Icon: MapGlyph },
  { name: "plane", label: "Plane", group: "Outside", Icon: Plane },
  { name: "car", label: "Car", group: "Outside", Icon: Car },
  { name: "bus", label: "Bus", group: "Outside", Icon: Bus },
  { name: "anchor", label: "Anchor", group: "Outside", Icon: Anchor },
  { name: "wind", label: "Wind", group: "Outside", Icon: Wind },
  { name: "snowflake", label: "Snow", group: "Outside", Icon: Snowflake },
  { name: "flame", label: "Fire", group: "Outside", Icon: Flame },
  { name: "star", label: "Star", group: "Outside", Icon: Star },
  { name: "dices", label: "Games", group: "Outside", Icon: Dices },
  { name: "gamepad-2", label: "Gaming", group: "Outside", Icon: Gamepad2 },
];

const BY_NAME = new Map(CURATED_GLYPHS.map((glyph) => [glyph.name, glyph]));

/** Returns the glyph, or undefined when a stored name is no longer curated. */
export function getCuratedGlyph(name: string): CuratedGlyph | undefined {
  return BY_NAME.get(name);
}
