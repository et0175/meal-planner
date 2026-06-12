"use client";

import {
  Apple,
  BookOpen,
  Calculator,
  CalendarDays,
  ChefHat,
  ClipboardList,
  Download,
  Edit2,
  Flame,
  Heart,
  LayoutGrid,
  LayoutList,
  Leaf,
  Link,
  Minus,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShoppingBasket,
  Sparkles,
  Trash2,
  UserRound,
  Utensils,
  X
} from "lucide-react";
import { useMemo, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
type View = "planner" | "products" | "analyser" | "recipes" | "diets" | "profile" | "shopping";
type ItemKind = "product" | "recipe";
type Macro = { calories: number; protein: number; fat: number; carbs: number };
type Ingredient = { name: string; amount: number; unit: string };

type CatalogItem = {
  id: string;
  kind: ItemKind;
  name: string;
  category: string;
  serving: string;
  servingG?: number; // grams per serving, used by Products Analyser for g/ml scaling
  image: string;
  diets: string[];
  macros: Macro;
  thisWeek?: boolean;
  nextWeek?: boolean;
  favorite?: boolean;
  mine?: boolean;
  ingredients?: Ingredient[];
};

type AnalyserRow = { id: string; productSearch: string; itemId: string; unit: string; qty: number; thisWeek: boolean; nextWeek: boolean };

type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";
type SummaryRow = { id: string; itemId: string; itemSearch: string; unit: "servings" | "g"; meal: MealSlot };
type Assignment = { uid: string; itemId: string; day: string; meal: MealSlot; servings: number };
type ShoppingLine = { name: string; amount: number; unit: string };
type ShoppingCategory = { category: string; lines: ShoppingLine[] };
type MealLogEntry = { id: string; itemId: string; servings: number; date: string };

type FormDraft = {
  name: string;
  kind: ItemKind;
  category: string;
  serving: string;
  image: string;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  diets: string[];
  ingredients: { name: string; amount: string; unit: string }[];
};

type Diet = { name: string; split: string | null; note: string };

// ── Diet catalogue ──────────────────────────────────────────────────────────────
const DIET_LIST: Diet[] = [
  {
    name: "Mediterranean",
    split: "20% protein / 35% fat / 45% carbs",
    note: "Vegetables, fish, olive oil, beans, grains, and flexible home cooking."
  },
  {
    name: "Plant-based",
    split: "15% protein / 30% fat / 55% carbs",
    note: "Whole foods from plants — vegetables, fruits, legumes, grains, and nuts."
  },
  {
    name: "MIND",
    split: "18% protein / 30% fat / 52% carbs",
    note: "A hybrid of Mediterranean and DASH focused on brain-healthy foods: berries, leafy greens, fish, nuts, and olive oil."
  },
  {
    name: "DASH",
    split: "18% protein / 27% fat / 55% carbs",
    note: "A sodium-aware pattern with fruits, low-fat dairy, legumes, and whole grains."
  },
  {
    name: "Paleo",
    split: "28% protein / 40% fat / 32% carbs",
    note: "Whole, unprocessed foods: lean meats, fish, fruits, vegetables, nuts, and seeds. No grains or dairy."
  },
  {
    name: "WeightWatchers",
    split: "25% protein / 25% fat / 50% carbs",
    note: "A flexible points-based system rewarding low-calorie-dense foods; emphasises lean proteins, fruits, and vegetables."
  },
  {
    name: "Intermittent fasting",
    split: null,
    note: "A timing strategy — the eating window (typically 8 h) determines when, not what, to eat. Macro balance is individual."
  },
  {
    name: "Keto",
    split: "25% protein / 65% fat / 10% carbs",
    note: "A very low-carb pattern; meal planning depends heavily on product compatibility."
  },
  {
    name: "Volumetrics",
    split: "20% protein / 20% fat / 60% carbs",
    note: "Prioritises high-volume, low-calorie-dense foods — soups, salads, non-starchy vegetables — to achieve satiety on fewer calories."
  },
  {
    name: "Protein-focused",
    split: "30% protein / 30% fat / 40% carbs",
    note: "Higher-protein meals for satiety, training support, or body-recomposition goals."
  },
  {
    name: "Healthy fats",
    split: "20% protein / 40% fat / 40% carbs",
    note: "Emphasises unsaturated fats from avocado, olive oil, nuts, and fatty fish to support cardiovascular and hormonal health."
  },
  {
    name: "Hydration-focused",
    split: null,
    note: "Centres on water-rich foods (cucumbers, watermelon, soups) and adequate fluid intake alongside a balanced base diet."
  }
];

const ALL_DIET_NAMES = DIET_LIST.map((d) => d.name);

const PRODUCT_CATEGORIES = [
  "Dairy","Fish","Meat","Grains","Produce","Legumes","Nuts & Seeds","Beverages","Other"
];
const RECIPE_CATEGORIES = [
  "Appetizers","Salads","Sandwiches","Breakfasts","Soups","Main courses",
  "Snacks","Sauces","Desserts","Baked dishes","Drinks","Low-calorie","Kid-friendly"
];
const PRODUCT_UNITS = ["g", "ml", "pc", "tbsp", "tsp", "serving"];

const viewConfig = [
  { id: "planner", label: "Planner", icon: CalendarDays },
  { id: "products", label: "All products", icon: Apple },
  { id: "analyser", label: "Products analyser", icon: Calculator },
  { id: "recipes", label: "Recipes", icon: ChefHat },
  { id: "diets", label: "Diets", icon: Leaf },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "shopping", label: "Shopping list", icon: ShoppingBasket }
] as const;

const GROCERY_CATEGORY_ORDER = ["Produce","Dairy","Meat","Fish","Grains","Legumes","Nuts & Seeds","Beverages","Condiments","Other"];
const MEAL_SLOTS: { id: MealSlot; label: string }[] = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "snack", label: "Snacks" },
];

// ── Seed items ──────────────────────────────────────────────────────────────────
const seedItems: CatalogItem[] = [
  {
    id: "p-greek-yogurt",
    kind: "product",
    name: "Greek yogurt",
    category: "Dairy",
    serving: "200 g",
    servingG: 200,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=480&q=80",
    diets: ["Mediterranean", "Protein-focused", "DASH"],
    macros: { calories: 146, protein: 20, fat: 4, carbs: 8 },
    thisWeek: true,
    ingredients: [{ name: "Greek yogurt", amount: 200, unit: "g" }]
  },
  {
    id: "p-salmon",
    kind: "product",
    name: "Atlantic salmon",
    category: "Fish",
    serving: "150 g",
    servingG: 150,
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=480&q=80",
    diets: ["Mediterranean", "Keto", "Healthy fats"],
    macros: { calories: 312, protein: 34, fat: 18, carbs: 0 },
    thisWeek: true,
    ingredients: [{ name: "Atlantic salmon", amount: 150, unit: "g" }]
  },
  {
    id: "p-quinoa",
    kind: "product",
    name: "Cooked quinoa",
    category: "Grains",
    serving: "180 g",
    servingG: 180,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=480&q=80",
    diets: ["Plant-based", "Mediterranean", "DASH"],
    macros: { calories: 222, protein: 8, fat: 4, carbs: 39 },
    ingredients: [{ name: "Cooked quinoa", amount: 180, unit: "g" }]
  },
  {
    id: "p-avocado",
    kind: "product",
    name: "Avocado",
    category: "Produce",
    serving: "1 medium",
    servingG: 150,
    image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=480&q=80",
    diets: ["Plant-based", "Keto", "Healthy fats"],
    macros: { calories: 240, protein: 3, fat: 22, carbs: 13 },
    ingredients: [{ name: "Avocado", amount: 1, unit: "pc" }]
  },
  {
    id: "p-my-granola",
    kind: "product",
    name: "Homemade granola",
    category: "Grains",
    serving: "60 g",
    servingG: 60,
    image: "https://images.unsplash.com/photo-1571748982800-fa51082c2224?auto=format&fit=crop&w=480&q=80",
    diets: ["Plant-based", "Volumetrics"],
    macros: { calories: 268, protein: 7, fat: 11, carbs: 36 },
    mine: true,
    ingredients: [{ name: "Homemade granola", amount: 60, unit: "g" }]
  },
  {
    id: "r-oats",
    kind: "recipe",
    name: "Berry overnight oats",
    category: "Breakfasts",
    serving: "1 jar",
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=480&q=80",
    diets: ["Plant-based", "DASH", "Volumetrics"],
    macros: { calories: 384, protein: 18, fat: 11, carbs: 56 },
    thisWeek: true,
    favorite: true,
    ingredients: [
      { name: "Rolled oats", amount: 70, unit: "g" },
      { name: "Greek yogurt", amount: 120, unit: "g" },
      { name: "Blueberries", amount: 90, unit: "g" }
    ]
  },
  {
    id: "r-lentil",
    kind: "recipe",
    name: "Lentil tomato soup",
    category: "Soups",
    serving: "1 bowl",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=480&q=80",
    diets: ["Plant-based", "Mediterranean", "Volumetrics"],
    macros: { calories: 338, protein: 20, fat: 7, carbs: 49 },
    thisWeek: true,
    favorite: false,
    ingredients: [
      { name: "Red lentils", amount: 85, unit: "g" },
      { name: "Tomatoes", amount: 240, unit: "g" },
      { name: "Vegetable broth", amount: 320, unit: "ml" }
    ]
  },
  {
    id: "r-chicken-bowl",
    kind: "recipe",
    name: "Chicken quinoa bowl",
    category: "Main courses",
    serving: "1 bowl",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=480&q=80",
    diets: ["Protein-focused", "Mediterranean", "DASH"],
    macros: { calories: 528, protein: 42, fat: 17, carbs: 52 },
    thisWeek: true,
    favorite: true,
    ingredients: [
      { name: "Chicken breast", amount: 140, unit: "g" },
      { name: "Cooked quinoa", amount: 160, unit: "g" },
      { name: "Mixed greens", amount: 80, unit: "g" }
    ]
  },
  {
    id: "r-citrus-salad",
    kind: "recipe",
    name: "Citrus avocado salad",
    category: "Salads",
    serving: "1 plate",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=480&q=80",
    diets: ["Plant-based", "Mediterranean", "Healthy fats"],
    macros: { calories: 286, protein: 7, fat: 19, carbs: 27 },
    favorite: false,
    ingredients: [
      { name: "Avocado", amount: 0.5, unit: "pc" },
      { name: "Orange", amount: 1, unit: "pc" },
      { name: "Spinach", amount: 90, unit: "g" }
    ]
  },
  {
    id: "r-my-pesto",
    kind: "recipe",
    name: "My pesto pasta",
    category: "Main courses",
    serving: "1 plate",
    image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=480&q=80",
    diets: ["Mediterranean", "Healthy fats"],
    macros: { calories: 520, protein: 18, fat: 22, carbs: 64 },
    favorite: false,
    mine: true,
    ingredients: [
      { name: "Pasta", amount: 90, unit: "g" },
      { name: "Pesto", amount: 40, unit: "g" },
      { name: "Cherry tomatoes", amount: 120, unit: "g" }
    ]
  }
];

// ── Mock import pool ────────────────────────────────────────────────────────────
const MOCK_IMPORTS = [
  {
    name: "Shakshuka",
    category: "Breakfasts",
    serving: "1 pan",
    image: "https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=480&q=80",
    diets: ["Mediterranean", "Plant-based"],
    macros: { calories: 310, protein: 18, fat: 14, carbs: 28 },
    ingredients: [
      { name: "Eggs", amount: 2, unit: "pc" },
      { name: "Tomato sauce", amount: 200, unit: "ml" },
      { name: "Bell pepper", amount: 1, unit: "pc" }
    ]
  },
  {
    name: "Tuna niçoise",
    category: "Salads",
    serving: "1 plate",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=480&q=80",
    diets: ["Mediterranean", "Healthy fats", "Protein-focused"],
    macros: { calories: 390, protein: 30, fat: 18, carbs: 22 },
    ingredients: [
      { name: "Canned tuna", amount: 140, unit: "g" },
      { name: "Green beans", amount: 100, unit: "g" },
      { name: "Cherry tomatoes", amount: 80, unit: "g" }
    ]
  },
  {
    name: "Black bean tacos",
    category: "Main courses",
    serving: "2 tacos",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=480&q=80",
    diets: ["Plant-based", "Mediterranean"],
    macros: { calories: 445, protein: 16, fat: 12, carbs: 68 },
    ingredients: [
      { name: "Black beans", amount: 150, unit: "g" },
      { name: "Corn tortillas", amount: 2, unit: "pc" },
      { name: "Avocado", amount: 0.5, unit: "pc" }
    ]
  }
];
let importCycle = 0;

// ── Helpers ─────────────────────────────────────────────────────────────────────
// Fix: use local date components to avoid UTC-offset day shift
function inputDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() - day + 1);
  return copy;
}

function addDays(date: Date, n: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function dateRange(start: string, end: string) {
  const first = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);
  const total = Math.max(0, Math.round((last.getTime() - first.getTime()) / 86400000));
  return Array.from({ length: total + 1 }, (_, i) => inputDate(addDays(first, i)));
}

function dayLabel(day: string) {
  return new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(
    new Date(`${day}T00:00:00`)
  );
}

function moneyRound(v: number) {
  return Math.round(v * 10) / 10;
}

function addMacro(a: Macro, b: Macro, mult = 1): Macro {
  return {
    calories: a.calories + b.calories * mult,
    protein: a.protein + b.protein * mult,
    fat: a.fat + b.fat * mult,
    carbs: a.carbs + b.carbs * mult
  };
}

function zeroMacro(): Macro {
  return { calories: 0, protein: 0, fat: 0, carbs: 0 };
}

function fmt(v: number, s = "g") {
  return `${moneyRound(v)}${s}`;
}

function newId() {
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function emptyForm(kind: ItemKind = "recipe"): FormDraft {
  return {
    name: "", kind, category: "", serving: "", image: "",
    calories: "", protein: "", fat: "", carbs: "",
    diets: [], ingredients: [{ name: "", amount: "", unit: "g" }]
  };
}

function formFromItem(item: CatalogItem): FormDraft {
  return {
    name: item.name, kind: item.kind, category: item.category,
    serving: item.serving, image: item.image,
    calories: String(item.macros.calories), protein: String(item.macros.protein),
    fat: String(item.macros.fat), carbs: String(item.macros.carbs),
    diets: [...item.diets],
    ingredients: (item.ingredients ?? []).map((i) => ({
      name: i.name, amount: String(i.amount), unit: i.unit
    }))
  };
}

// ── Component ───────────────────────────────────────────────────────────────────
export default function Home() {
  const weekStart = useMemo(() => startOfWeek(new Date()), []);
  const today = useMemo(() => inputDate(new Date()), []);

  // View
  const [activeView, setActiveView] = useState<View>("planner");

  // Catalog filters — all reset on view switch
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [dietFilter, setDietFilter] = useState("All");
  const [showFavorites, setShowFavorites] = useState(false);
  const [showMine, setShowMine] = useState(false);
  const [showThisWeek, setShowThisWeek] = useState(false);
  const [showNextWeek, setShowNextWeek] = useState(false);
  const [productsViewMode, setProductsViewMode] = useState<"cards" | "list">("cards");

  // Products Analyser
  const [analyserRows, setAnalyserRows] = useState<AnalyserRow[]>([]);

  // Items
  const [items, setItems] = useState(seedItems);

  // Modals
  const [detailItem, setDetailItem] = useState<CatalogItem | null>(null);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formDraft, setFormDraft] = useState<FormDraft>(emptyForm());
  const [showImport, setShowImport] = useState(false);
  const [importUrl, setImportUrl] = useState("");

  // Planner
  const [selectedWeekMonday, setSelectedWeekMonday] = useState(() => startOfWeek(new Date()));
  const [plannerViewMode, setPlannerViewMode] = useState<"summary" | "cards" | "calendar">("summary");
  const [summaryRows, setSummaryRows] = useState<SummaryRow[]>([
    { id: "sr-oats", itemId: "r-oats", itemSearch: "Berry overnight oats", unit: "servings", meal: "breakfast" },
    { id: "sr-chicken", itemId: "r-chicken-bowl", itemSearch: "Chicken quinoa bowl", unit: "servings", meal: "lunch" },
    { id: "sr-lentil", itemId: "r-lentil", itemSearch: "Lentil tomato soup", unit: "servings", meal: "dinner" }
  ]);
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const monday = startOfWeek(new Date());
    const mon = inputDate(monday);
    const tue = inputDate(addDays(monday, 1));
    return [
      { uid: "seed-1", itemId: "r-oats", day: mon, meal: "breakfast", servings: 1 },
      { uid: "seed-2", itemId: "r-chicken-bowl", day: mon, meal: "lunch", servings: 2 },
      { uid: "seed-3", itemId: "r-lentil", day: tue, meal: "dinner", servings: 1 }
    ];
  });
  const [dragUid, setDragUid] = useState<string | null>(null);
  const [addingMeal, setAddingMeal] = useState<{ day: string; meal: MealSlot } | null>(null);
  const [addingMealSearch, setAddingMealSearch] = useState("");

  // Shopping list
  const [shopFrom, setShopFrom] = useState(inputDate(weekStart));
  const [shopTo, setShopTo] = useState(inputDate(addDays(weekStart, 6)));

  // Profile
  const [profile, setProfile] = useState({
    diet: "Mediterranean",
    calories: 2100,
    protein: 25,
    fat: 30,
    carbs: 45,
    language: "English",
    units: "Metric",
    gender: "",
    age: "",
    weight: ""
  });

  // Meal log
  const [mealLog, setMealLog] = useState<MealLogEntry[]>([]);
  const [logItemId, setLogItemId] = useState("");
  const [logServings, setLogServings] = useState("1");

  // ── Computed ─────────────────────────────────────────────────────────────────
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => inputDate(addDays(selectedWeekMonday, i))),
    [selectedWeekMonday]
  );
  const itemById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  // Category list is view-specific and excludes the redundant "product"/"recipe" type keys
  const categories = useMemo(() => {
    if (activeView !== "products" && activeView !== "recipes") return ["All"];
    const kind: ItemKind = activeView === "products" ? "product" : "recipe";
    return ["All", ...Array.from(new Set(items.filter((i) => i.kind === kind).map((i) => i.category)))];
  }, [items, activeView]);

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.diets.join(" ").toLowerCase().includes(query);
      const matchCat = category === "All" || item.category === category;
      const matchDiet = dietFilter === "All" || item.diets.includes(dietFilter);
      const matchFav = !showFavorites || item.favorite;
      const matchMine = !showMine || item.mine;
      // Week filters only apply in the products view
      const matchThisWeek = activeView !== "products" || !showThisWeek || item.thisWeek;
      const matchNextWeek = activeView !== "products" || !showNextWeek || item.nextWeek;
      return matchSearch && matchCat && matchDiet && matchFav && matchMine && matchThisWeek && matchNextWeek;
    });
  }, [items, search, category, dietFilter, showFavorites, showMine, showThisWeek, showNextWeek, activeView]);

  const plannedMacro = assignments.reduce((acc, a) => {
    const item = itemById.get(a.itemId);
    return item ? addMacro(acc, item.macros, a.servings) : acc;
  }, zeroMacro());

  const macroTotal = profile.protein + profile.fat + profile.carbs;

  const todayLog = mealLog.filter((e) => e.date === today);
  const todayMacro = todayLog.reduce((acc, e) => {
    const item = itemById.get(e.itemId);
    return item ? addMacro(acc, item.macros, e.servings) : acc;
  }, zeroMacro());

  // ── Navigation ───────────────────────────────────────────────────────────────
  // Fix: reset all filters when switching views so search never bleeds across
  function switchView(view: View) {
    setActiveView(view);
    setSearch("");
    setCategory("All");
    setDietFilter("All");
    setShowFavorites(false);
    setShowMine(false);
    setShowThisWeek(false);
    setShowNextWeek(false);
  }

  // ── Planner helpers ──────────────────────────────────────────────────────────
  function prevWeek() { setSelectedWeekMonday((d) => addDays(d, -7)); }
  function nextWeek() { setSelectedWeekMonday((d) => addDays(d, 7)); }
  function goToThisWeek() { setSelectedWeekMonday(startOfWeek(new Date())); }

  function getMealServings(itemId: string, day: string, meal: MealSlot): number {
    return assignments.find((a) => a.itemId === itemId && a.day === day && a.meal === meal)?.servings ?? 0;
  }

  function setMealServings(itemId: string, day: string, meal: MealSlot, servings: number) {
    setAssignments((cur) => {
      const rest = cur.filter((a) => !(a.itemId === itemId && a.day === day && a.meal === meal));
      if (servings <= 0) return rest;
      return [...rest, { uid: newId(), itemId, day, meal, servings }];
    });
  }

  function addSummaryRow(meal: MealSlot) {
    setSummaryRows((cur) => [...cur, { id: newId(), itemId: "", itemSearch: "", unit: "servings", meal }]);
  }

  function removeSummaryRow(rowId: string) {
    const row = summaryRows.find((r) => r.id === rowId);
    if (row?.itemId) setAssignments((cur) => cur.filter((a) => !(a.itemId === row.itemId && a.meal === row.meal)));
    setSummaryRows((cur) => cur.filter((r) => r.id !== rowId));
  }

  function addToSummary(itemId: string, meal: MealSlot) {
    if (summaryRows.some((r) => r.itemId === itemId && r.meal === meal)) return;
    const item = items.find((i) => i.id === itemId);
    setSummaryRows((cur) => [...cur, { id: newId(), itemId, itemSearch: item?.name ?? "", unit: "servings", meal }]);
  }

  function addMealToSlot(itemId: string, day: string, meal: MealSlot) {
    addToSummary(itemId, meal);
    setAssignments((cur) => [...cur, { uid: newId(), itemId, day, meal, servings: 1 }]);
  }

  function removeAssignment(uid: string) {
    setAssignments((cur) => cur.filter((a) => a.uid !== uid));
  }

  function handleDropToSlot(targetDay: string, targetMeal: MealSlot, uid: string) {
    setAssignments((cur) => cur.map((a) => a.uid === uid ? { ...a, day: targetDay, meal: targetMeal } : a));
    setDragUid(null);
  }

  function toggleThisWeek(itemId: string) {
    const target = items.find((i) => i.id === itemId);
    if (!target) return;
    setItems((cur) => cur.map((i) => (i.id === itemId ? { ...i, thisWeek: !i.thisWeek } : i)));
    if (!target.thisWeek) addToSummary(itemId, "lunch");
  }

  function toggleNextWeek(itemId: string) {
    setItems((cur) => cur.map((i) => (i.id === itemId ? { ...i, nextWeek: !i.nextWeek } : i)));
  }

  function toggleFavorite(itemId: string) {
    setItems((cur) => cur.map((i) => (i.id === itemId ? { ...i, favorite: !i.favorite } : i)));
    setDetailItem((prev) => (prev?.id === itemId ? { ...prev, favorite: !prev.favorite } : prev));
  }

  function toggleDietTag(itemId: string, diet: string) {
    setItems((cur) =>
      cur.map((i) => {
        if (i.id !== itemId) return i;
        const diets = i.diets.includes(diet) ? i.diets.filter((d) => d !== diet) : [...i.diets, diet];
        return { ...i, diets };
      })
    );
    setDetailItem((prev) => {
      if (!prev || prev.id !== itemId) return prev;
      const diets = prev.diets.includes(diet) ? prev.diets.filter((d) => d !== diet) : [...prev.diets, diet];
      return { ...prev, diets };
    });
  }

  function dayMacro(day: string) {
    return assignments
      .filter((a) => a.day === day)
      .reduce((acc, a) => {
        const item = itemById.get(a.itemId);
        return item ? addMacro(acc, item.macros, a.servings) : acc;
      }, zeroMacro());
  }

  function categorizeIngredient(name: string): string {
    const n = name.toLowerCase();
    const match = items.find((i) => i.kind === "product" && i.name.toLowerCase() === n);
    if (match) return match.category;
    if (/chicken|beef|pork|turkey|lamb/.test(n)) return "Meat";
    if (/salmon|tuna|fish|shrimp/.test(n)) return "Fish";
    if (/yogurt|milk|cheese|butter|cream/.test(n)) return "Dairy";
    if (/oats?|quinoa|pasta|rice|bread|grain|tortilla/.test(n)) return "Grains";
    if (/lentil|bean|chickpea/.test(n)) return "Legumes";
    if (/spinach|tomato|avocado|orange|blueberr|greens|pepper/.test(n)) return "Produce";
    if (/nut|seed|almond|walnut/.test(n)) return "Nuts & Seeds";
    if (/broth|stock|juice/.test(n)) return "Beverages";
    if (/pesto|sauce|oil|vinegar/.test(n)) return "Condiments";
    return "Other";
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  function openAddForm(kind: ItemKind) {
    setEditingItem(null);
    setFormDraft(emptyForm(kind));
    setShowForm(true);
  }

  function openEditForm(item: CatalogItem) {
    setDetailItem(null);
    setEditingItem(item);
    setFormDraft(formFromItem(item));
    setShowForm(true);
  }

  function saveForm() {
    const macros: Macro = {
      calories: Number(formDraft.calories) || 0,
      protein: Number(formDraft.protein) || 0,
      fat: Number(formDraft.fat) || 0,
      carbs: Number(formDraft.carbs) || 0
    };
    const ingredients = formDraft.ingredients
      .filter((i) => i.name.trim())
      .map((i) => ({ name: i.name, amount: Number(i.amount) || 0, unit: i.unit }));

    if (editingItem) {
      setItems((cur) =>
        cur.map((i) =>
          i.id === editingItem.id
            ? { ...i, name: formDraft.name, category: formDraft.category, serving: formDraft.serving, image: formDraft.image, macros, diets: formDraft.diets, ingredients }
            : i
        )
      );
    } else {
      const newItem: CatalogItem = {
        id: newId(),
        kind: formDraft.kind,
        name: formDraft.name || "Unnamed",
        category: formDraft.category || "Other",
        serving: formDraft.serving || "1 serving",
        image: formDraft.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=480&q=80",
        diets: formDraft.diets,
        macros,
        mine: true,
        ingredients
      };
      setItems((cur) => [...cur, newItem]);
    }
    setShowForm(false);
  }

  function deleteItem(itemId: string) {
    if (detailItem?.id === itemId) setDetailItem(null);
    setSummaryRows((cur) => cur.filter((r) => r.itemId !== itemId));
    setAssignments((cur) => cur.filter((a) => a.itemId !== itemId));
    setItems((cur) => cur.filter((i) => i.id !== itemId));
    setMealLog((cur) => cur.filter((e) => e.itemId !== itemId));
  }

  // ── Import ────────────────────────────────────────────────────────────────────
  function doImport() {
    const mock = MOCK_IMPORTS[importCycle % MOCK_IMPORTS.length];
    importCycle++;
    setItems((cur) => [...cur, { id: newId(), kind: "recipe", ...mock, weekly: false, favorite: false, mine: true }]);
    setShowImport(false);
    setImportUrl("");
    switchView("recipes");
  }

  // ── Meal log ──────────────────────────────────────────────────────────────────
  function addMealLog() {
    if (!logItemId) return;
    setMealLog((cur) => [
      ...cur,
      { id: newId(), itemId: logItemId, servings: Number(logServings) || 1, date: today }
    ]);
    setLogItemId("");
    setLogServings("1");
  }

  // ── Render helpers ────────────────────────────────────────────────────────────
  function renderMacroStrip(macros: Macro, compact = false) {
    return (
      <div className={compact ? "macro-strip compact" : "macro-strip"}>
        <span><Flame size={15} /> {Math.round(macros.calories)} kcal</span>
        <span>{fmt(macros.protein)} protein</span>
        <span>{fmt(macros.fat)} fat</span>
        <span>{fmt(macros.carbs)} carbs</span>
      </div>
    );
  }

  function renderItemCard(item: CatalogItem) {
    return (
      <article className="item-card" key={item.id}>
        <img src={item.image} alt="" style={{ cursor: "pointer" }} onClick={() => setDetailItem(item)} />
        <div className="item-body">
          <div className="item-title-row">
            <div style={{ minWidth: 0 }}>
              <p className="eyebrow">{item.kind === "recipe" ? "Recipe" : "Product"} / {item.category}</p>
              <h3 style={{ cursor: "pointer" }} onClick={() => setDetailItem(item)}>{item.name}</h3>
            </div>
            <span
              className={item.favorite ? "icon-pill fav-active" : "icon-pill"}
              title={item.favorite ? "Remove favorite" : "Add to favorites"}
              onClick={() => toggleFavorite(item.id)}
              style={{ cursor: "pointer", flexShrink: 0 }}
            >
              <Heart size={15} fill={item.favorite ? "currentColor" : "none"} />
            </span>
          </div>
          <p className="muted">{item.serving}</p>
          {renderMacroStrip(item.macros, true)}
          <div className="tag-row">
            {item.diets.slice(0, 3).map((d) => <span key={d}>{d}</span>)}
          </div>
          <div className="button-row">
              <button className={item.thisWeek ? "soft-button active" : "soft-button"} onClick={() => toggleThisWeek(item.id)}>
                <Sparkles size={16} /> This week
              </button>
              <button className={item.nextWeek ? "soft-button active" : "soft-button"} onClick={() => toggleNextWeek(item.id)}>
                <CalendarDays size={16} /> Next week
              </button>
              <button className="dark-button" onClick={() => addToSummary(item.id, "lunch")}>
                <Plus size={16} /> Add to plan
              </button>
              {item.mine && (
                <>
                  <button className="icon-button" title="Edit" onClick={() => openEditForm(item)}><Edit2 size={15} /></button>
                  <button className="icon-button" title="Delete" onClick={() => deleteItem(item.id)}><Trash2 size={15} /></button>
                </>
              )}
            </div>
        </div>
      </article>
    );
  }

  // ── Detail modal ──────────────────────────────────────────────────────────────
  function renderDetailModal() {
    if (!detailItem) return null;
    const item = itemById.get(detailItem.id) ?? detailItem;
    return (
      <div className="modal-overlay" onClick={() => setDetailItem(null)}>
        <div className="modal detail-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <p className="eyebrow">{item.kind === "recipe" ? "Recipe" : "Product"} / {item.category}</p>
              <h2>{item.name}</h2>
            </div>
            <button className="icon-button" onClick={() => setDetailItem(null)}><X size={18} /></button>
          </div>
          <img className="detail-image" src={item.image} alt="" />
          <div className="detail-meta">
            <div><p className="eyebrow">Serving</p><strong>{item.serving}</strong></div>
            <div><p className="eyebrow">Calories</p><strong>{item.macros.calories} kcal</strong></div>
          </div>
          {renderMacroStrip(item.macros)}
          {item.ingredients && item.ingredients.length > 0 && (
            <>
              <p className="eyebrow" style={{ marginTop: 16, marginBottom: 8 }}>Ingredients</p>
              <div className="ingredient-list">
                {item.ingredients.map((ing, i) => (
                  <div className="ingredient-row" key={i}>
                    <span>{ing.name}</span>
                    <strong>{ing.amount} {ing.unit}</strong>
                  </div>
                ))}
              </div>
            </>
          )}
          <p className="eyebrow" style={{ marginTop: 16, marginBottom: 8 }}>Diet compatibility — click to toggle</p>
          <div className="tag-row">
            {ALL_DIET_NAMES.map((d) => (
              <span
                key={d}
                className={item.diets.includes(d) ? "diet-toggle active" : "diet-toggle"}
                onClick={() => toggleDietTag(item.id, d)}
              >
                {d}
              </span>
            ))}
          </div>
          <div className="modal-actions">
            <button className="soft-button" onClick={() => { addToSummary(item.id, "lunch"); setDetailItem(null); }}>
              <Plus size={16} /> Add to plan
            </button>
            <button
              className={item.favorite ? "soft-button active" : "soft-button"}
              onClick={() => toggleFavorite(item.id)}
            >
              <Heart size={16} fill={item.favorite ? "currentColor" : "none"} />
              {item.favorite ? "Unfavorite" : "Favorite"}
            </button>
            {item.mine && (
              <button className="soft-button" onClick={() => openEditForm(item)}>
                <Edit2 size={16} /> Edit
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Add / Edit form modal ─────────────────────────────────────────────────────
  function renderFormModal() {
    if (!showForm) return null;
    const isEdit = Boolean(editingItem);
    const catList = formDraft.kind === "product" ? PRODUCT_CATEGORIES : RECIPE_CATEGORIES;

    return (
      <div className="modal-overlay" onClick={() => setShowForm(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{isEdit ? `Edit — ${editingItem!.name}` : `Add ${formDraft.kind}`}</h2>
            <button className="icon-button" onClick={() => setShowForm(false)}><X size={18} /></button>
          </div>
          <div className="form-grid">
            <label>
              Name
              <input value={formDraft.name} onChange={(e) => setFormDraft((d) => ({ ...d, name: e.target.value }))} />
            </label>
            {!isEdit && (
              <label>
                Kind
                <select value={formDraft.kind} onChange={(e) => setFormDraft((d) => ({ ...d, kind: e.target.value as ItemKind }))}>
                  <option value="product">Product</option>
                  <option value="recipe">Recipe</option>
                </select>
              </label>
            )}
            <label>
              Category
              <select value={formDraft.category} onChange={(e) => setFormDraft((d) => ({ ...d, category: e.target.value }))}>
                <option value="">— select —</option>
                {catList.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label>
              Serving (e.g. "200 g")
              <input value={formDraft.serving} onChange={(e) => setFormDraft((d) => ({ ...d, serving: e.target.value }))} />
            </label>
            <label>
              Image URL
              <input value={formDraft.image} placeholder="https://..." onChange={(e) => setFormDraft((d) => ({ ...d, image: e.target.value }))} />
            </label>
            <div className="macros-row">
              {(["calories", "protein", "fat", "carbs"] as const).map((k) => (
                <label key={k}>
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                  <input
                    type="number"
                    value={formDraft[k]}
                    onChange={(e) => setFormDraft((d) => ({ ...d, [k]: e.target.value }))}
                  />
                </label>
              ))}
            </div>
            <div>
              <p className="eyebrow" style={{ marginBottom: 8 }}>Diets</p>
              <div className="tag-row">
                {ALL_DIET_NAMES.map((d) => (
                  <span
                    key={d}
                    className={formDraft.diets.includes(d) ? "diet-toggle active" : "diet-toggle"}
                    onClick={() =>
                      setFormDraft((fd) => ({
                        ...fd,
                        diets: fd.diets.includes(d) ? fd.diets.filter((x) => x !== d) : [...fd.diets, d]
                      }))
                    }
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <p className="eyebrow" style={{ marginBottom: 0 }}>Ingredients</p>
                <button
                  className="soft-button"
                  style={{ minHeight: 28, padding: "0 10px", fontSize: "0.8rem" }}
                  onClick={() => setFormDraft((d) => ({ ...d, ingredients: [...d.ingredients, { name: "", amount: "", unit: "g" }] }))}
                >
                  <Plus size={14} /> Add row
                </button>
              </div>
              {formDraft.ingredients.map((ing, i) => (
                <div key={i} className="ingredient-form-row">
                  <input
                    placeholder="Name"
                    value={ing.name}
                    onChange={(e) =>
                      setFormDraft((d) => ({ ...d, ingredients: d.ingredients.map((x, j) => j === i ? { ...x, name: e.target.value } : x) }))
                    }
                  />
                  <input
                    placeholder="Amount"
                    value={ing.amount}
                    onChange={(e) =>
                      setFormDraft((d) => ({ ...d, ingredients: d.ingredients.map((x, j) => j === i ? { ...x, amount: e.target.value } : x) }))
                    }
                  />
                  <input
                    placeholder="Unit"
                    value={ing.unit}
                    onChange={(e) =>
                      setFormDraft((d) => ({ ...d, ingredients: d.ingredients.map((x, j) => j === i ? { ...x, unit: e.target.value } : x) }))
                    }
                  />
                  <button
                    className="icon-button tiny"
                    onClick={() => setFormDraft((d) => ({ ...d, ingredients: d.ingredients.filter((_, j) => j !== i) }))}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button className="soft-button" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="dark-button" onClick={saveForm}>{isEdit ? "Save changes" : "Add"}</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Import modal ──────────────────────────────────────────────────────────────
  function renderImportModal() {
    if (!showImport) return null;
    return (
      <div className="modal-overlay" onClick={() => setShowImport(false)}>
        <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Import recipe</h2>
            <button className="icon-button" onClick={() => setShowImport(false)}><X size={18} /></button>
          </div>
          <p className="muted">Paste a URL from a recipe website, YouTube video, or leave blank to import a sample recipe.</p>
          <label>
            URL
            <input value={importUrl} onChange={(e) => setImportUrl(e.target.value)} placeholder="https://..." />
          </label>
          <div className="modal-actions" style={{ marginTop: 20 }}>
            <button className="soft-button" onClick={() => setShowImport(false)}>Cancel</button>
            <button className="dark-button" onClick={doImport}>
              <Download size={16} /> Parse &amp; import
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Products table row (list view) ────────────────────────────────────────────
  function renderProductTableRow(item: CatalogItem) {
    return (
      <tr key={item.id} className="catalog-table-row">
        <td>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src={item.image}
              alt=""
              style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6, cursor: "pointer", flexShrink: 0 }}
              onClick={() => setDetailItem(item)}
            />
            <span style={{ cursor: "pointer", fontWeight: 600 }} onClick={() => setDetailItem(item)}>
              {item.name}
            </span>
          </div>
        </td>
        <td><span className="muted">{item.category}</span></td>
        <td><span className="muted">{item.serving}</span></td>
        <td className="num-cell">{fmt(item.macros.protein)}</td>
        <td className="num-cell">{fmt(item.macros.fat)}</td>
        <td className="num-cell">{fmt(item.macros.carbs)}</td>
        <td className="num-cell">{item.macros.calories} kcal</td>
        <td>
          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <span
              className={item.thisWeek ? "diet-toggle active" : "diet-toggle"}
              style={{ padding: "4px 10px", fontSize: "0.8rem" }}
              onClick={() => toggleThisWeek(item.id)}
            >
              This week
            </span>
            <span
              className={item.nextWeek ? "diet-toggle active" : "diet-toggle"}
              style={{ padding: "4px 10px", fontSize: "0.8rem" }}
              onClick={() => toggleNextWeek(item.id)}
            >
              Next week
            </span>
            <button
              className="dark-button"
              style={{ minHeight: 30, padding: "0 10px", fontSize: "0.8rem" }}
              onClick={() => addToSummary(item.id, "lunch")}
            >
              <Plus size={14} /> Summary
            </button>
            {item.mine && (
              <>
                <button className="icon-button" title="Edit" onClick={() => openEditForm(item)}><Edit2 size={15} /></button>
                <button className="icon-button" title="Delete" onClick={() => deleteItem(item.id)}><Trash2 size={15} /></button>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  }

  // ── Products Analyser view ────────────────────────────────────────────────────
  function renderAnalyserView() {
    const products = items.filter((i) => i.kind === "product");

    function addRow() {
      setAnalyserRows((cur) => [
        ...cur,
        { id: newId(), productSearch: "", itemId: "", unit: "g", qty: 100, thisWeek: false, nextWeek: false }
      ]);
    }

    function updateRow(id: string, patch: Partial<AnalyserRow>) {
      setAnalyserRows((cur) => cur.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    }

    function removeRow(id: string) {
      setAnalyserRows((cur) => cur.filter((r) => r.id !== id));
    }

    function rowScale(row: AnalyserRow): number {
      const item = itemById.get(row.itemId);
      if (!item) return 0;
      if (row.unit === "g" || row.unit === "ml") {
        return row.qty / (item.servingG ?? 100);
      }
      return row.qty;
    }

    function scaledMacro(row: AnalyserRow): Macro {
      const item = itemById.get(row.itemId);
      if (!item) return zeroMacro();
      const s = rowScale(row);
      return {
        calories: item.macros.calories * s,
        protein: item.macros.protein * s,
        fat: item.macros.fat * s,
        carbs: item.macros.carbs * s
      };
    }

    const rowResults = analyserRows.map((row) => ({ row, macros: scaledMacro(row) }));
    const totals = rowResults.reduce((acc, r) => addMacro(acc, r.macros), zeroMacro());

    const totalGrams = analyserRows.reduce((sum, row) => {
      const item = itemById.get(row.itemId);
      if (!item) return sum;
      if (row.unit === "g" || row.unit === "ml") return sum + row.qty;
      return item.servingG ? sum + row.qty * item.servingG : sum;
    }, 0);

    const per100g: Macro | null =
      totalGrams > 0
        ? {
            calories: (totals.calories / totalGrams) * 100,
            protein: (totals.protein / totalGrams) * 100,
            fat: (totals.fat / totalGrams) * 100,
            carbs: (totals.carbs / totalGrams) * 100
          }
        : null;

    return (
      <section className="analyser-view">
        <div className="control-band">
          <button className="dark-button" onClick={addRow}>
            <Plus size={16} /> Add row
          </button>
          <button className="soft-button" onClick={() => openAddForm("product")}>
            <Plus size={16} /> New product
          </button>
          {analyserRows.length > 0 && (
            <button className="soft-button" onClick={() => setAnalyserRows([])}>
              <Trash2 size={15} /> Clear all
            </button>
          )}
        </div>

        {analyserRows.length === 0 ? (
          <div className="analyser-empty">
            <Calculator size={40} style={{ color: "var(--muted)", marginBottom: 12 }} />
            <p className="muted">No products added yet.</p>
            <p className="muted" style={{ fontSize: "0.85rem" }}>Click &ldquo;Add row&rdquo; to start analysing nutritional content.</p>
          </div>
        ) : (
          <div className="analyser-table-wrap">
            <table className="analyser-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Unit</th>
                  <th>Qty</th>
                  <th>Protein</th>
                  <th>Fat</th>
                  <th>Carbs</th>
                  <th>kcal</th>
                  <th className="center-cell">This week</th>
                  <th className="center-cell">Next week</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rowResults.map(({ row, macros }) => (
                  <tr key={row.id}>
                    <td>
                      <input
                        list={`al-${row.id}`}
                        placeholder="Type to search…"
                        value={row.productSearch}
                        onChange={(e) => {
                          const val = e.target.value;
                          const found = products.find((p) => p.name === val);
                          updateRow(row.id, { productSearch: val, itemId: found?.id ?? "" });
                        }}
                      />
                      <datalist id={`al-${row.id}`}>
                        {products.map((p) => (
                          <option key={p.id} value={p.name} />
                        ))}
                      </datalist>
                    </td>
                    <td>
                      <select
                        value={row.unit}
                        onChange={(e) => updateRow(row.id, { unit: e.target.value })}
                      >
                        {PRODUCT_UNITS.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={row.qty}
                        onChange={(e) =>
                          updateRow(row.id, { qty: Math.max(0, Number(e.target.value) || 0) })
                        }
                      />
                    </td>
                    <td className="num-cell">{row.itemId ? fmt(macros.protein) : "—"}</td>
                    <td className="num-cell">{row.itemId ? fmt(macros.fat) : "—"}</td>
                    <td className="num-cell">{row.itemId ? fmt(macros.carbs) : "—"}</td>
                    <td className="num-cell">{row.itemId ? Math.round(macros.calories) : "—"}</td>
                    <td className="center-cell">
                      <span
                        className={row.thisWeek ? "diet-toggle active" : "diet-toggle"}
                        style={{ padding: "3px 8px", fontSize: "0.78rem", display: "inline-block" }}
                        onClick={() => updateRow(row.id, { thisWeek: !row.thisWeek })}
                      >
                        ✓
                      </span>
                    </td>
                    <td className="center-cell">
                      <span
                        className={row.nextWeek ? "diet-toggle active" : "diet-toggle"}
                        style={{ padding: "3px 8px", fontSize: "0.78rem", display: "inline-block" }}
                        onClick={() => updateRow(row.id, { nextWeek: !row.nextWeek })}
                      >
                        ✓
                      </span>
                    </td>
                    <td>
                      <button className="icon-button tiny" onClick={() => removeRow(row.id)}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="totals-row">
                  <td colSpan={3}><strong>Total</strong></td>
                  <td className="num-cell"><strong>{fmt(totals.protein)}</strong></td>
                  <td className="num-cell"><strong>{fmt(totals.fat)}</strong></td>
                  <td className="num-cell"><strong>{fmt(totals.carbs)}</strong></td>
                  <td className="num-cell"><strong>{Math.round(totals.calories)} kcal</strong></td>
                  <td colSpan={3}></td>
                </tr>
                {per100g && (
                  <tr className="per100-row">
                    <td colSpan={3}><span className="muted">Per 100 g</span></td>
                    <td className="num-cell"><span className="muted">{fmt(per100g.protein)}</span></td>
                    <td className="num-cell"><span className="muted">{fmt(per100g.fat)}</span></td>
                    <td className="num-cell"><span className="muted">{fmt(per100g.carbs)}</span></td>
                    <td className="num-cell"><span className="muted">{Math.round(per100g.calories)} kcal</span></td>
                    <td colSpan={3}></td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>
        )}
      </section>
    );
  }

  // ── Planner view ──────────────────────────────────────────────────────────────
  function renderDayCards() {
    return (
      <div className="days-panel">
        {days.map((day) => {
          const macros = dayMacro(day);
          return (
            <article className="day-card" key={day}>
              <div className="day-card-head">
                <p className="eyebrow">{new Intl.DateTimeFormat("en", { weekday: "short" }).format(new Date(`${day}T00:00:00`))}</p>
                <h2>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${day}T00:00:00`))}</h2>
              </div>
              {macros.calories > 0 && renderMacroStrip(macros, true)}
              {MEAL_SLOTS.map((slot) => {
                const slotAssignments = assignments.filter((a) => a.day === day && a.meal === slot.id);
                const isAdding = addingMeal?.day === day && addingMeal?.meal === slot.id;
                return (
                  <div
                    key={slot.id}
                    className="meal-slot"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragUid) handleDropToSlot(day, slot.id, dragUid);
                    }}
                  >
                    <div className="meal-slot-head">
                      <span>{slot.label}</span>
                      {slotAssignments.length > 0 && (
                        <span className="muted" style={{ fontSize: "0.75rem" }}>
                          {Math.round(slotAssignments.reduce((s, a) => s + (itemById.get(a.itemId)?.macros.calories ?? 0) * a.servings, 0))} kcal
                        </span>
                      )}
                    </div>
                    <div className="day-items">
                      {slotAssignments.map((a) => {
                        const item = itemById.get(a.itemId);
                        if (!item) return null;
                        return (
                          <div
                            className={dragUid === a.uid ? "planned-item dragging" : "planned-item"}
                            key={a.uid}
                            draggable
                            onDragStart={(e) => { setDragUid(a.uid); e.dataTransfer.effectAllowed = "move"; }}
                            onDragEnd={() => setDragUid(null)}
                          >
                            <img src={item.image} alt="" />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <strong>{item.name}</strong>
                              <small>{Math.round(item.macros.calories * a.servings)} kcal · {a.servings}×</small>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                              <button className="icon-button tiny" onClick={() => { const s = a.servings + 0.5; setAssignments((cur) => cur.map((x) => x.uid === a.uid ? { ...x, servings: s } : x)); }}><Plus size={12} /></button>
                              <button className="icon-button tiny" onClick={() => { const s = a.servings - 0.5; if (s <= 0) removeAssignment(a.uid); else setAssignments((cur) => cur.map((x) => x.uid === a.uid ? { ...x, servings: s } : x)); }}><Minus size={12} /></button>
                            </div>
                            <button className="icon-button tiny" onClick={() => removeAssignment(a.uid)} title="Remove"><X size={12} /></button>
                          </div>
                        );
                      })}
                    </div>
                    {isAdding ? (
                      <div className="slot-add-row">
                        <input
                          autoFocus
                          list="plan-items-list"
                          placeholder="Search…"
                          value={addingMealSearch}
                          onChange={(e) => {
                            setAddingMealSearch(e.target.value);
                            const found = items.find((i) => i.name === e.target.value);
                            if (found) {
                              addMealToSlot(found.id, day, slot.id);
                              setAddingMeal(null);
                              setAddingMealSearch("");
                            }
                          }}
                          onBlur={() => { setAddingMeal(null); setAddingMealSearch(""); }}
                          onKeyDown={(e) => { if (e.key === "Escape") { setAddingMeal(null); setAddingMealSearch(""); } }}
                        />
                      </div>
                    ) : (
                      <button
                        className="slot-add-btn"
                        onClick={() => { setAddingMeal({ day, meal: slot.id }); setAddingMealSearch(""); }}
                      >
                        <Plus size={13} /> Add
                      </button>
                    )}
                  </div>
                );
              })}
            </article>
          );
        })}
      </div>
    );
  }

  function renderCalendarGrid() {
    return (
      <div className="calendar-grid">
        {days.map((day) => {
          const dayAssignments = assignments.filter((a) => a.day === day);
          const macros = dayMacro(day);
          return (
            <div className="calendar-day" key={day}>
              <div className="calendar-day-head">
                <strong>{new Intl.DateTimeFormat("en", { weekday: "short" }).format(new Date(`${day}T00:00:00`))}</strong>
                <small>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${day}T00:00:00`))}</small>
                {macros.calories > 0 && <span className="muted" style={{ fontSize: "0.75rem" }}>{Math.round(macros.calories)} kcal</span>}
              </div>
              <div className="calendar-day-items">
                {dayAssignments.map((a) => {
                  const item = itemById.get(a.itemId);
                  if (!item) return null;
                  return (
                    <div className="calendar-item" key={a.uid}>
                      <img src={item.image} alt="" />
                      <div>
                        <span>{item.name}</span>
                        <small>{a.servings}×</small>
                      </div>
                    </div>
                  );
                })}
                {dayAssignments.length === 0 && <p className="empty" style={{ fontSize: "0.8rem", padding: "8px 0" }}>—</p>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderPlannerView() {
    const weekLabel = `${new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${days[0]}T00:00:00`))} – ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${days[6]}T00:00:00`))}`;

    return (
      <section className="planner-view">
        {/* Week navigation */}
        <div className="week-nav">
          <button className="soft-button" onClick={prevWeek}>‹ Prev</button>
          <span className="week-label">{weekLabel}</span>
          <button className="soft-button" onClick={goToThisWeek}>This week</button>
          <button className="soft-button" onClick={nextWeek}>Next ›</button>
        </div>

        {/* Tab bar */}
        <div className="planner-view-tabs">
          <button className={plannerViewMode === "summary" ? "soft-button active" : "soft-button"} onClick={() => setPlannerViewMode("summary")}>
            Weekly summary
          </button>
          <button className={plannerViewMode === "cards" ? "soft-button active" : "soft-button"} onClick={() => setPlannerViewMode("cards")}>
            Day cards
          </button>
          <button className={plannerViewMode === "calendar" ? "soft-button active" : "soft-button"} onClick={() => setPlannerViewMode("calendar")}>
            Calendar
          </button>
        </div>

        {/* Summary tab */}
        {plannerViewMode === "summary" && <div className="plan-section">
          <div className="analyser-table-wrap">
            <table className="analyser-table summary-grid-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 220 }}>Item</th>
                  {days.map((day) => (
                    <th key={day} className="center-cell day-col-head">
                      <span>{new Intl.DateTimeFormat("en", { weekday: "short" }).format(new Date(`${day}T00:00:00`))}</span>
                      <small>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${day}T00:00:00`))}</small>
                    </th>
                  ))}
                  <th style={{ width: 32 }}></th>
                </tr>
              </thead>
              {MEAL_SLOTS.map((slot) => {
                const slotRows = summaryRows.filter((r) => r.meal === slot.id);
                return (
                  <tbody key={slot.id} className="meal-group">
                    <tr className="meal-group-head">
                      <td colSpan={9}>{slot.label}</td>
                    </tr>
                    {slotRows.map((row) => {
                      const item = itemById.get(row.itemId);
                      const canUseGrams = !!item?.servingG;
                      const useGrams = row.unit === "g" && canUseGrams;
                      return (
                        <tr key={row.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {item && <img src={item.image} alt="" style={{ width: 26, height: 26, borderRadius: 4, objectFit: "cover", flexShrink: 0 }} />}
                              <input
                                list="plan-items-list"
                                placeholder="Search product or recipe…"
                                value={row.itemSearch}
                                style={{ minWidth: 120 }}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const found = items.find((i) => i.name === val);
                                  setSummaryRows((cur) => cur.map((r) => r.id === row.id ? { ...r, itemSearch: val, itemId: found?.id ?? "" } : r));
                                }}
                              />
                              <div className="unit-toggle">
                                <button
                                  className={!useGrams ? "unit-btn active" : "unit-btn"}
                                  onClick={() => setSummaryRows((cur) => cur.map((r) => r.id === row.id ? { ...r, unit: "servings" } : r))}
                                  title="Show in servings"
                                >srv</button>
                                <button
                                  className={useGrams ? "unit-btn active" : "unit-btn"}
                                  disabled={!canUseGrams}
                                  onClick={() => setSummaryRows((cur) => cur.map((r) => r.id === row.id ? { ...r, unit: "g" } : r))}
                                  title={canUseGrams ? "Show in grams" : "No gram weight defined for this item"}
                                >g</button>
                              </div>
                            </div>
                          </td>
                          {days.map((day) => {
                            const servings = getMealServings(row.itemId, day, slot.id);
                            const grams = item?.servingG ? servings * item.servingG : 0;
                            const displayVal = useGrams ? (grams || "") : (servings || "");
                            return (
                              <td key={day} className="center-cell servings-cell">
                                <input
                                  type="number"
                                  min="0"
                                  step={useGrams ? 10 : 0.5}
                                  value={displayVal}
                                  placeholder="—"
                                  disabled={!row.itemId}
                                  onChange={(e) => {
                                    const raw = Number(e.target.value);
                                    if (useGrams && item?.servingG) {
                                      setMealServings(row.itemId, day, slot.id, raw / item.servingG);
                                    } else {
                                      setMealServings(row.itemId, day, slot.id, raw);
                                    }
                                  }}
                                />
                                {item?.servingG && servings > 0 && (
                                  <small className="muted">
                                    {useGrams ? `${servings % 1 === 0 ? servings : servings.toFixed(1)} srv` : `${Math.round(grams)}g`}
                                  </small>
                                )}
                              </td>
                            );
                          })}
                          <td>
                            <button className="icon-button tiny" onClick={() => removeSummaryRow(row.id)}><Trash2 size={13} /></button>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="meal-group-add">
                      <td colSpan={9}>
                        <button className="slot-add-btn" onClick={() => addSummaryRow(slot.id)}>
                          <Plus size={13} /> Add {slot.label.toLowerCase()} item
                        </button>
                      </td>
                    </tr>
                  </tbody>
                );
              })}
            </table>
            <datalist id="plan-items-list">
              {items.map((i) => <option key={i.id} value={i.name} />)}
            </datalist>
          </div>
        </div>}

        {plannerViewMode === "cards" && renderDayCards()}
        {plannerViewMode === "calendar" && renderCalendarGrid()}
      </section>
    );
  }

  // ── Catalog view (All products + Recipes) ─────────────────────────────────────
  function renderCatalogView() {
    const kind: ItemKind = activeView === "products" ? "product" : "recipe";
    const filtered = visibleItems.filter((i) => i.kind === kind);
    const isListMode = activeView === "products" && productsViewMode === "list";
    const viewLabel = activeView === "products" ? "products" : "recipes";
    return (
      <section className="catalog-view">
        <div className="control-band">
          <label className="search-box">
            <Search size={17} />
            <input
              value={search}
              placeholder={`Search ${viewLabel}`}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            Diet
            <select value={dietFilter} onChange={(e) => setDietFilter(e.target.value)}>
              <option value="All">All diets</option>
              {ALL_DIET_NAMES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
            {activeView === "recipes" && (
              <button
                className={showFavorites ? "soft-button active" : "soft-button"}
                onClick={() => setShowFavorites((f) => !f)}
              >
                <Heart size={16} fill={showFavorites ? "currentColor" : "none"} />
                Favorites
              </button>
            )}
            {activeView === "products" && (
              <>
                <button
                  className={showThisWeek ? "soft-button active" : "soft-button"}
                  onClick={() => setShowThisWeek((v) => !v)}
                >
                  <Sparkles size={15} /> This week
                </button>
                <button
                  className={showNextWeek ? "soft-button active" : "soft-button"}
                  onClick={() => setShowNextWeek((v) => !v)}
                >
                  <CalendarDays size={15} /> Next week
                </button>
              </>
            )}
            <button
              className={showMine ? "soft-button active" : "soft-button"}
              onClick={() => setShowMine((m) => !m)}
            >
              Mine
            </button>
            {activeView === "products" && (
              <button
                className="soft-button"
                title={productsViewMode === "cards" ? "Switch to list view" : "Switch to cards view"}
                onClick={() => setProductsViewMode((m) => (m === "cards" ? "list" : "cards"))}
              >
                {productsViewMode === "cards" ? <LayoutList size={16} /> : <LayoutGrid size={16} />}
                {productsViewMode === "cards" ? "List" : "Cards"}
              </button>
            )}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "flex-end" }}>
            <button className="dark-button" onClick={() => openAddForm(kind)}>
              <Plus size={16} /> Add {kind}
            </button>
            {activeView === "recipes" && (
              <button className="soft-button" onClick={() => setShowImport(true)}>
                <Link size={16} /> Import
              </button>
            )}
          </div>
        </div>

        {isListMode ? (
          <div className="catalog-table-wrap">
            <table className="catalog-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Serving</th>
                  <th>Protein</th>
                  <th>Fat</th>
                  <th>Carbs</th>
                  <th>kcal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length ? (
                  filtered.map((item) => renderProductTableRow(item))
                ) : (
                  <tr>
                    <td colSpan={8} className="empty" style={{ textAlign: "center", padding: 32 }}>
                      No products match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="catalog-grid">
            {filtered.length ? (
              filtered.map((item) => renderItemCard(item))
            ) : (
              <p className="empty" style={{ gridColumn: "1/-1" }}>No {viewLabel} match your filters.</p>
            )}
          </div>
        )}
      </section>
    );
  }

  // ── Shopping list view ────────────────────────────────────────────────────────
  function renderShoppingView() {
    const inRange = assignments.filter((a) => a.day >= shopFrom && a.day <= shopTo);

    // Aggregate ingredients
    const lineMap = new Map<string, ShoppingLine>();
    inRange.forEach((a) => {
      const item = itemById.get(a.itemId);
      item?.ingredients?.forEach((ing) => {
        const key = `${ing.name}|${ing.unit}`;
        const cur = lineMap.get(key) ?? { name: ing.name, amount: 0, unit: ing.unit };
        lineMap.set(key, { ...cur, amount: cur.amount + ing.amount * a.servings });
      });
    });
    const allLines = Array.from(lineMap.values());

    // Group by category
    const grouped = new Map<string, ShoppingLine[]>();
    allLines.forEach((line) => {
      const cat = categorizeIngredient(line.name);
      grouped.set(cat, [...(grouped.get(cat) ?? []), line]);
    });
    const orderedCats = GROCERY_CATEGORY_ORDER.filter((c) => grouped.has(c));
    const extraCats = Array.from(grouped.keys()).filter((c) => !GROCERY_CATEGORY_ORDER.includes(c));
    const allCats = [...orderedCats, ...extraCats];

    // Planned items summary
    const summaryMap = new Map<string, number>();
    inRange.forEach((a) => summaryMap.set(a.itemId, (summaryMap.get(a.itemId) ?? 0) + a.servings));

    return (
      <section className="shopping-view">
        <div className="control-band">
          <label>
            From
            <input type="date" value={shopFrom} onChange={(e) => setShopFrom(e.target.value)} />
          </label>
          <label>
            To
            <input type="date" value={shopTo} min={shopFrom} onChange={(e) => setShopTo(e.target.value < shopFrom ? shopFrom : e.target.value)} />
          </label>
        </div>

        <div className="shop-sections">
          {/* Meal plan summary */}
          <section className="shop-card">
            <p className="eyebrow">Based on your meal plan</p>
            <h2>Planned items</h2>
            {summaryMap.size > 0 ? (
              <div className="shop-summary-list">
                {Array.from(summaryMap.entries()).map(([itemId, total]) => {
                  const item = itemById.get(itemId);
                  if (!item) return null;
                  return (
                    <div className="shop-summary-item" key={itemId}>
                      <img src={item.image} alt="" />
                      <span>{item.name}</span>
                      <strong>{moneyRound(total)} serving{total !== 1 ? "s" : ""}</strong>
                      <span className="muted" style={{ fontSize: "0.82rem" }}>{Math.round(item.macros.calories * total)} kcal</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="empty">No items planned for the selected period.</p>
            )}
          </section>

          {/* Grocery list */}
          <section className="shop-card">
            <p className="eyebrow">What to buy</p>
            <h2>Grocery list</h2>
            {allCats.length > 0 ? (
              <div className="grocery-grid">
                {allCats.map((cat) => (
                  <div className="grocery-category" key={cat}>
                    <h3>{cat}</h3>
                    {(grouped.get(cat) ?? []).sort((a, b) => a.name.localeCompare(b.name)).map((line) => (
                      <div className="grocery-line" key={`${line.name}|${line.unit}`}>
                        <span>{line.name}</span>
                        <strong>{moneyRound(line.amount)} {line.unit}</strong>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty">No ingredients to buy. Add items to the planner first.</p>
            )}
          </section>
        </div>
      </section>
    );
  }

  // ── Diets view ────────────────────────────────────────────────────────────────
  function renderDietsView() {
    return (
      <section className="diet-grid">
        {DIET_LIST.map((diet) => (
          <article className="diet-card" key={diet.name}>
            <span className="diet-icon"><Leaf size={21} /></span>
            <h2>{diet.name}</h2>
            <p>{diet.note}</p>
            {diet.split ? (
              <strong>{diet.split}</strong>
            ) : (
              <span className="muted" style={{ fontSize: "0.84rem" }}>Macro split varies by approach</span>
            )}
          </article>
        ))}
      </section>
    );
  }

  // ── Profile view ──────────────────────────────────────────────────────────────
  function renderProfileView() {
    const calorieProgress = Math.min(100, (todayMacro.calories / profile.calories) * 100);
    return (
      <div style={{ display: "grid", gap: 20, maxWidth: 840 }}>
        {/* Diet preferences */}
        <section className="profile-card">
          <p className="eyebrow">Personal cabinet</p>
          <h2 style={{ marginBottom: 0 }}>Diet preferences</h2>
          <div className="profile-grid">
            <label>
              Diet
              <select value={profile.diet} onChange={(e) => setProfile({ ...profile, diet: e.target.value })}>
                {DIET_LIST.map((d) => <option key={d.name}>{d.name}</option>)}
              </select>
            </label>
            <label>
              Calorie target
              <input
                type="number"
                value={profile.calories}
                onChange={(e) => setProfile({ ...profile, calories: Number(e.target.value) })}
              />
            </label>
            <label>
              Protein %
              <input type="number" value={profile.protein} onChange={(e) => setProfile({ ...profile, protein: Number(e.target.value) })} />
            </label>
            <label>
              Fat %
              <input type="number" value={profile.fat} onChange={(e) => setProfile({ ...profile, fat: Number(e.target.value) })} />
            </label>
            <label>
              Carbs %
              <input type="number" value={profile.carbs} onChange={(e) => setProfile({ ...profile, carbs: Number(e.target.value) })} />
            </label>
          </div>
          {macroTotal !== 100 && (
            <p className="warning-text">Macro % total {macroTotal}% — should sum to 100%</p>
          )}
          <div className="corridor">
            <ClipboardList size={22} />
            <div>
              <span>Calorie corridor</span>
              <strong>{profile.calories - 150} – {profile.calories + 150} kcal</strong>
            </div>
          </div>
        </section>

        {/* Personal information */}
        <section className="profile-card">
          <p className="eyebrow">Personal cabinet</p>
          <h2 style={{ marginBottom: 0 }}>Personal information</h2>
          <div className="profile-grid">
            <label>
              Language
              <select value={profile.language} onChange={(e) => setProfile({ ...profile, language: e.target.value })}>
                {["English", "Spanish", "French", "German", "Portuguese"].map((l) => <option key={l}>{l}</option>)}
              </select>
            </label>
            <label>
              Unit system
              <select value={profile.units} onChange={(e) => setProfile({ ...profile, units: e.target.value })}>
                <option>Metric</option>
                <option>Imperial</option>
              </select>
            </label>
            <label>
              Gender
              <select value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}>
                <option value="">— select —</option>
                <option>Male</option>
                <option>Female</option>
                <option>Non-binary</option>
                <option>Prefer not to say</option>
              </select>
            </label>
            <label>
              Age
              <input type="number" value={profile.age} placeholder="Years" onChange={(e) => setProfile({ ...profile, age: e.target.value })} />
            </label>
            <label>
              Weight
              <input
                type="number"
                value={profile.weight}
                placeholder={profile.units === "Metric" ? "kg" : "lbs"}
                onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
              />
            </label>
          </div>
        </section>

        {/* Meal tracking */}
        <section className="profile-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
            <div>
              <p className="eyebrow">Personal cabinet</p>
              <h2 style={{ marginBottom: 0 }}>Today&apos;s meal log</h2>
            </div>
            <span className="top-metrics" style={{ marginTop: 0 }}>
              <span><Flame size={14} /> {Math.round(todayMacro.calories)} / {profile.calories} kcal</span>
            </span>
          </div>
          {renderMacroStrip(todayMacro)}
          {profile.calories > 0 && (
            <div className="progress-wrap">
              <div className="progress-bar" style={{ width: `${calorieProgress}%` }} />
            </div>
          )}
          <div className="meal-log-add">
            <label style={{ flex: "1 1 200px" }}>
              Food
              <select value={logItemId} onChange={(e) => setLogItemId(e.target.value)}>
                <option value="">— select —</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>{i.name} ({i.macros.calories} kcal / {i.serving})</option>
                ))}
              </select>
            </label>
            <label style={{ width: 90 }}>
              Servings
              <input
                type="number"
                value={logServings}
                min="0.5"
                step="0.5"
                onChange={(e) => setLogServings(e.target.value)}
              />
            </label>
            <button className="dark-button" style={{ alignSelf: "flex-end" }} onClick={addMealLog} disabled={!logItemId}>
              <Plus size={16} /> Log
            </button>
          </div>
          {todayLog.length > 0 ? (
            <div className="meal-log">
              {todayLog.map((entry) => {
                const item = itemById.get(entry.itemId);
                if (!item) return null;
                return (
                  <div className="meal-log-entry" key={entry.id}>
                    <img src={item.image} alt="" />
                    <div style={{ flex: 1 }}>
                      <strong>{item.name}</strong>
                      <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                        {entry.servings} × {item.serving} · {Math.round(item.macros.calories * entry.servings)} kcal
                      </div>
                    </div>
                    <button className="icon-button tiny" onClick={() => setMealLog((cur) => cur.filter((e) => e.id !== entry.id))}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="empty">Nothing logged today</p>
          )}
        </section>
      </div>
    );
  }

  // ── Shell ─────────────────────────────────────────────────────────────────────
  return (
    <>
      {renderDetailModal()}
      {renderFormModal()}
      {renderImportModal()}
      <main className="app-shell">
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-mark"><Utensils size={23} /></span>
            <div>
              <strong>Meal Forge</strong>
              <small>MVP prototype</small>
            </div>
          </div>
          <nav>
            {viewConfig.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={activeView === id ? "nav-button active" : "nav-button"}
                onClick={() => switchView(id)}
              >
                <Icon size={18} /> {label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="workspace">
          <header className="topbar">
            <div>
              <p className="eyebrow">MealPlanner / Client prototype</p>
              <h1>{viewConfig.find((v) => v.id === activeView)?.label}</h1>
            </div>
            <div className="top-metrics">
              <span>{summaryRows.length} plan items</span>
              <span>{assignments.length} servings</span>
              <span><Flame size={14} /> {Math.round(plannedMacro.calories)} / {profile.calories} kcal</span>
            </div>
          </header>

          {activeView === "planner" && renderPlannerView()}
          {(activeView === "products" || activeView === "recipes") && renderCatalogView()}
          {activeView === "analyser" && renderAnalyserView()}
          {activeView === "diets" && renderDietsView()}
          {activeView === "profile" && renderProfileView()}
          {activeView === "shopping" && renderShoppingView()}
        </section>
      </main>
    </>
  );
}
