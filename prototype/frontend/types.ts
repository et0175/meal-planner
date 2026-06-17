export type View = 'planner' | 'products' | 'analyser' | 'recipes' | 'diets' | 'shopping' | 'profile'
export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
export type Slot = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'
export type ItemKind = 'product' | 'recipe'

export interface Ingredient {
  productId: string
  productName: string
  amount: number
  unit: string
}

export interface Item {
  id: string
  kind: ItemKind
  name: string
  category: string
  kcal: number
  protein: number
  fat: number
  carbs: number
  fiber?: number
  unit?: string
  servingAmount?: number
  servingLabel?: string
  servingG?: number
  imageUrl?: string
  servings?: number
  ingredients?: Ingredient[]
  dietTags: string[]
  favorite: boolean
  isUserAdded: boolean
  userId: string | null
  weekFlags: { thisWeek: boolean; nextWeek: boolean }
}

export interface Assignment {
  id: string
  itemId: string
  day: Day
  slot: Slot
  servings: number
  weekOffset?: number
  autoAdded?: boolean
}

export interface Diet {
  id: string
  name: string
  description: string
  macroGuidance: { proteinPct: number; fatPct: number; carbsPct: number } | null
  guidanceNote?: string
}

export interface Profile {
  activeDiet: string | null
  calorieTarget: number
  macros: { protein: number; fat: number; carbs: number }
  language: string
  unitSystem: 'metric' | 'imperial'
  gender: string
  age: number | string
  weight: number | string
}

export interface MealLogEntry {
  id: string
  itemName: string
  quantity: number
  unit: string
  kcal: number
  protein: number
  fat: number
  carbs: number
}

export interface ShoppingLine {
  name: string
  amount: number
  unit: string
  category: string
}
