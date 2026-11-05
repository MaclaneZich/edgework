import {
  BookOpen,
  Calculator,
  CalendarDays,
  CandlestickChart,
  Code2,
  Hourglass,
  LayoutDashboard,
  Library,
  Mic,
  MessagesSquare,
  NotebookPen,
  Puzzle,
  RotateCcw,
  Settings,
  Sigma,
  Sparkles,
  Target,
  Timer,
  TriangleAlert,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Keyboard shortcut after pressing "g". */
  key?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    title: "Learn",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard, key: "d" },
      { href: "/modules", label: "Modules", icon: BookOpen, key: "m" },
      { href: "/smart", label: "Smart Session", icon: Sparkles, key: "s" },
      { href: "/brainteasers", label: "Brainteasers", icon: Puzzle, key: "b" },
    ],
  },
  {
    title: "Train",
    items: [
      { href: "/mock", label: "Test Simulator", icon: Timer, key: "t" },
      { href: "/mental-math", label: "Mental Math", icon: Calculator, key: "n" },
      { href: "/market-making", label: "Market Making", icon: CandlestickChart, key: "k" },
      { href: "/speak", label: "Speak It Out", icon: Mic, key: "v" },
      { href: "/interview", label: "Interview Sim", icon: MessagesSquare, key: "i" },
      { href: "/coding", label: "Coding Warmup", icon: Code2, key: "c" },
    ],
  },
  {
    title: "Review",
    items: [
      { href: "/redo", label: "Redo Queue", icon: RotateCcw, key: "r" },
      { href: "/errors", label: "Error Log", icon: TriangleAlert, key: "e" },
      { href: "/notes", label: "Notebook", icon: NotebookPen, key: "o" },
      { href: "/calibration", label: "Calibration", icon: Target, key: "l" },
      { href: "/formulas", label: "Formula Sheet", icon: Sigma, key: "f" },
    ],
  },
  {
    title: "Plan",
    items: [
      { href: "/schedule", label: "Schedule", icon: CalendarDays, key: "p" },
      { href: "/timer", label: "Study Timer", icon: Hourglass, key: "h" },
      { href: "/achievements", label: "Achievements", icon: Trophy, key: "a" },
      { href: "/reading", label: "Further Reading", icon: Library, key: "u" },
      { href: "/settings", label: "Settings", icon: Settings, key: "," },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV.flatMap((g) => g.items);
