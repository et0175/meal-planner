'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  UtensilsCrossed, ShoppingBasket, Apple, Leaf, CalendarDays,
  User, Search, Heart, Plus, Minus, X, ChevronLeft,
  ChevronRight, LayoutGrid, List, Edit2, Trash2, Check,
  AlertTriangle, RefreshCw, Table2,
} from 'lucide-react'
import { SEED_PRODUCTS, SEED_RECIPES, SEED_DIETS, SEED_ASSIGNMENTS } from '@/data/seed'
import type { View, Day, Slot, Item, Assignment, Diet, Profile, MealLogEntry, ShoppingLine } from '@/types'

// ─── helpers ──────────────────────────────────────────────────────────────────

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

function uid(): string {
  return Math.random().toString(36).slice(2)
}

const DAYS: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SLOTS: Slot[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

function getWeekDates(offset: number): { label: string; dates: Date[] } {
  const today = new Date()
  const dow = today.getDay() === 0 ? 6 : today.getDay() - 1
  const monday = new Date(today)
  monday.setDate(today.getDate() - dow + offset * 7)
  const dates = DAYS.map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return { label: `${fmt(dates[0])} – ${fmt(dates[6])}`, dates }
}

function fmtMacro(v: number) {
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}

const DIET_LABELS: Record<string, string> = {
  mediterranean: 'Mediterranean', 'plant-based': 'Plant-based', mind: 'MIND',
  dash: 'DASH', paleo: 'Paleo', weightwatchers: 'WW',
  'intermittent-fasting': 'Int. Fasting', ketogenic: 'Keto',
  volumetrics: 'Volumetrics', 'protein-focused': 'Protein',
  'healthy-fats': 'Healthy fats', hydration: 'Hydration',
}

const CATEGORY_COLOURS: Record<string, string> = {
  Dairy: 'bg-blue-50 text-blue-700', Fish: 'bg-cyan-50 text-cyan-700',
  Grains: 'bg-yellow-50 text-yellow-700', Produce: 'bg-green-50 text-green-700',
  Meat: 'bg-red-50 text-red-700', Legumes: 'bg-purple-50 text-purple-700',
  'Nuts & Seeds': 'bg-orange-50 text-orange-700',
  Condiments: 'bg-gray-100 text-gray-600',
  Breakfasts: 'bg-amber-50 text-amber-700', Salads: 'bg-lime-50 text-lime-700',
  Soups: 'bg-teal-50 text-teal-700', 'Main courses': 'bg-rose-50 text-rose-700',
  Snacks: 'bg-violet-50 text-violet-700',
}

const SLOT_COLOURS: Record<Slot, string> = {
  Breakfast: 'bg-amber-50 border-amber-200 text-amber-800',
  Lunch: 'bg-green-50 border-green-200 text-green-800',
  Dinner: 'bg-blue-50 border-blue-200 text-blue-800',
  Snacks: 'bg-purple-50 border-purple-200 text-purple-800',
}

const RECIPE_GRADIENTS = [
  'from-teal-100 to-cyan-50', 'from-amber-100 to-orange-50',
  'from-purple-100 to-pink-50', 'from-blue-100 to-sky-50',
  'from-green-100 to-emerald-50', 'from-rose-100 to-red-50',
]

const inputCls = 'w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200'

// ─── shared components ────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
      {children}
    </div>
  )
}

function Modal({
  title, children, onClose, wide,
}: {
  title: string; children: React.ReactNode; onClose: () => void; wide?: boolean
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={cn(
        'bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] w-full',
        wide ? 'max-w-lg' : 'max-w-sm',
      )}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

function EmptyState({
  icon, message, action, actionLabel,
}: {
  icon: React.ReactNode; message: string; action?: () => void; actionLabel?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="text-gray-300">{icon}</div>
      <p className="text-sm text-gray-400 max-w-xs">{message}</p>
      {action && actionLabel && (
        <button
          onClick={action}
          className="text-sm text-teal-600 hover:text-teal-800 cursor-pointer underline-offset-2 hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// ─── sidebar ──────────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'planner',  label: 'Planner',           icon: <CalendarDays size={18} /> },
  { id: 'products', label: 'All products',        icon: <Apple size={18} /> },
  { id: 'analyser', label: 'Products analyser',  icon: <Table2 size={18} /> },
  { id: 'recipes',  label: 'Recipes',            icon: <UtensilsCrossed size={18} /> },
  { id: 'diets',    label: 'Diets',              icon: <Leaf size={18} /> },
  { id: 'shopping', label: 'Shopping list',      icon: <ShoppingBasket size={18} /> },
  { id: 'profile',  label: 'Profile',            icon: <User size={18} /> },
]

function Sidebar({ active, setActive }: { active: View; setActive: (v: View) => void }) {
  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col h-full"
      style={{ background: '#1A6B6E' }}
    >
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <UtensilsCrossed size={16} className="text-white" />
          </div>
          <span className="text-white font-semibold text-base tracking-tight">Meal Forge</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5" aria-label="Main navigation">
        {NAV_ITEMS.map(({ id, label, icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer text-left',
                isActive
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10',
              )}
            >
              <span className={isActive ? 'text-teal-600' : 'opacity-70'}>{icon}</span>
              {label}
            </button>
          )
        })}
      </nav>

      <div className="px-5 pb-5 pt-3 border-t border-white/10">
        <p className="text-white/40 text-xs">MVP Prototype · v1.0</p>
      </div>
    </aside>
  )
}

// ─── topbar ──────────────────────────────────────────────────────────────────

function Topbar({
  view, profile, assignments, items,
}: {
  view: View; profile: Profile; assignments: Assignment[]; items: Item[]
}) {
  const currentLabel = NAV_ITEMS.find(n => n.id === view)?.label ?? ''

  const totalKcal = useMemo(() =>
    assignments.reduce((sum, a) => {
      const item = items.find(i => i.id === a.itemId)
      return sum + (item ? item.kcal * a.servings : 0)
    }, 0),
  [assignments, items])

  const diet = SEED_DIETS.find(d => d.id === profile.activeDiet)

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0">
      <h1 className="text-base font-semibold text-gray-900 flex-1">{currentLabel}</h1>

      {diet && (
        <span className="text-xs font-medium bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full">
          {diet.name}
        </span>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-400">
        <span className="flex items-center gap-1.5">
          <CalendarDays size={13} />
          <strong className="text-gray-700">{assignments.length}</strong> planned
        </span>
        <span className="flex items-center gap-1.5">
          <Apple size={13} />
          <strong className="text-gray-700">{Math.round(totalKcal)}</strong> kcal
        </span>
      </div>
    </header>
  )
}

// ─── products view ────────────────────────────────────────────────────────────

function ProductCard({
  product: p, onToggleFlag, onEdit, onDelete,
}: {
  product: Item
  onToggleFlag: (id: string, flag: 'thisWeek' | 'nextWeek') => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {p.imageUrl ? (
        <img src={p.imageUrl} alt={p.name} className="w-full h-28 object-cover" />
      ) : (
        <div className={cn('w-full h-20 flex items-center justify-center text-2xl', CATEGORY_COLOURS[p.category] ?? 'bg-gray-50 text-gray-300')}>
          🥗
        </div>
      )}

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{p.name}</p>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block',
              CATEGORY_COLOURS[p.category] ?? 'bg-gray-100 text-gray-600',
            )}>
              {p.category}
            </span>
          </div>
          {p.isUserAdded && (
            <div className="flex gap-0.5 flex-shrink-0">
              <button onClick={onEdit} aria-label="Edit product" className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-teal-600 cursor-pointer"><Edit2 size={12} /></button>
              <button onClick={onDelete} aria-label="Delete product" className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"><Trash2 size={12} /></button>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400">{p.servingLabel ?? `${p.servingAmount ?? 100} ${p.unit ?? 'g'}`}</p>

        <div className="grid grid-cols-2 gap-1.5">
          {[
            ['kcal', p.kcal, 'bg-amber-50 text-amber-700', ''],
            ['protein', fmtMacro(p.protein), 'bg-blue-50 text-blue-700', 'g'],
            ['fat', fmtMacro(p.fat), 'bg-red-50 text-red-600', 'g'],
            ['carbs', fmtMacro(p.carbs), 'bg-green-50 text-green-700', 'g'],
          ].map(([label, value, colour, unit]) => (
            <div key={String(label)} className={cn('rounded-xl px-2 py-2 text-center', String(colour))}>
              <p className="text-sm font-bold">{value}<span className="text-xs opacity-60">{unit}</span></p>
              <p className="text-xs opacity-60">{label}</p>
            </div>
          ))}
        </div>
        {p.fiber !== undefined && p.fiber > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-2 py-1">
            <span className="font-medium">Fiber:</span>
            <span>{fmtMacro(p.fiber)} g</span>
          </div>
        )}

        {p.dietTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {p.dietTags.slice(0, 3).map(t => (
              <span key={t} className="text-xs bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded-full">
                {DIET_LABELS[t] ?? t}
              </span>
            ))}
            {p.dietTags.length > 3 && (
              <span className="text-xs text-gray-400">+{p.dietTags.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex gap-1.5 pt-1 border-t border-gray-100 mt-auto">
          <button
            onClick={() => onToggleFlag(p.id, 'thisWeek')}
            className={cn(
              'flex-1 text-xs py-1.5 rounded-lg font-medium cursor-pointer',
              p.weekFlags.thisWeek
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {p.weekFlags.thisWeek ? '✓ This week' : 'This week'}
          </button>
          <button
            onClick={() => onToggleFlag(p.id, 'nextWeek')}
            className={cn(
              'flex-1 text-xs py-1.5 rounded-lg font-medium cursor-pointer',
              p.weekFlags.nextWeek
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {p.weekFlags.nextWeek ? '✓ Next week' : 'Next week'}
          </button>
        </div>
      </div>
    </article>
  )
}

function ProductForm({
  item, onSave, onClose,
}: {
  item: Item | null
  onSave: (data: Partial<Item>) => void
  onClose: () => void
}) {
  const [name, setName] = useState(item?.name ?? '')
  const [category, setCategory] = useState(item?.category ?? 'Produce')
  const [unit, setUnit] = useState(item?.unit ?? 'g')
  const [servingAmount, setServingAmount] = useState(String(item?.servingAmount ?? 100))
  const [servingG, setServingG] = useState(String(item?.servingG ?? ''))
  const [kcal, setKcal] = useState(String(item?.kcal ?? ''))
  const [protein, setProtein] = useState(String(item?.protein ?? ''))
  const [fat, setFat] = useState(String(item?.fat ?? ''))
  const [carbs, setCarbs] = useState(String(item?.carbs ?? ''))
  const [fiber, setFiber] = useState(String(item?.fiber ?? ''))
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? '')
  const [dietTags, setDietTags] = useState<string[]>(item?.dietTags ?? [])
  const [error, setError] = useState('')
  const needsG = !['g', 'ml'].includes(unit)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    if ([kcal, protein, fat, carbs].some(v => Number(v) < 0)) {
      setError('Nutrition values must be non-negative')
      return
    }
    onSave({
      name: name.trim(), category, unit,
      servingAmount: Number(servingAmount),
      servingLabel: `${servingAmount} ${unit}`,
      servingG: servingG ? Number(servingG) : undefined,
      kcal: Number(kcal), protein: Number(protein),
      fat: Number(fat), carbs: Number(carbs),
      fiber: fiber ? Number(fiber) : undefined,
      imageUrl: imageUrl || undefined,
      dietTags,
    })
  }

  return (
    <Modal title={item ? 'Edit product' : 'Add product'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
        <Field label="Name *">
          <input value={name} onChange={e => setName(e.target.value)} required className={inputCls} placeholder="e.g. Oat bran" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
              {['Dairy','Fish','Grains','Produce','Meat','Legumes','Nuts & Seeds','Condiments','Other'].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Unit">
            <select value={unit} onChange={e => setUnit(e.target.value)} className={inputCls}>
              {['g','ml','pc','tbsp','tsp','serving'].map(u => <option key={u}>{u}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Serving amount">
            <input type="number" min="0" value={servingAmount} onChange={e => setServingAmount(e.target.value)} className={inputCls} />
          </Field>
          {needsG && (
            <Field label="Grams per unit (e.g. 55 g/egg)">
              <input type="number" min="0" step="0.1" value={servingG} onChange={e => setServingG(e.target.value)} placeholder="e.g. 55" className={inputCls} />
            </Field>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="kcal"><input type="number" min="0" value={kcal} onChange={e => setKcal(e.target.value)} className={inputCls} /></Field>
          <Field label="Protein (g)"><input type="number" min="0" step="0.1" value={protein} onChange={e => setProtein(e.target.value)} className={inputCls} /></Field>
          <Field label="Fat (g)"><input type="number" min="0" step="0.1" value={fat} onChange={e => setFat(e.target.value)} className={inputCls} /></Field>
          <Field label="Carbs (g)"><input type="number" min="0" step="0.1" value={carbs} onChange={e => setCarbs(e.target.value)} className={inputCls} /></Field>
          <Field label="Fiber (g)"><input type="number" min="0" step="0.1" value={fiber} onChange={e => setFiber(e.target.value)} className={inputCls} /></Field>
        </div>
        <Field label="Image URL (optional)">
          <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://…" className={inputCls} />
        </Field>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">Diet compatibility</label>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(DIET_LABELS).map(([id, name]) => {
              const active = dietTags.includes(id)
              return (
                <button key={id} type="button" onClick={() => setDietTags(prev => active ? prev.filter(t => t !== id) : [...prev, id])}
                  className={cn('text-xs px-2.5 py-1 rounded-full border cursor-pointer transition-colors',
                    active ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-500 border-gray-200 hover:border-teal-400')}>
                  {name}
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
          <button type="submit" className="flex-1 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 cursor-pointer">Save</button>
        </div>
      </form>
    </Modal>
  )
}

function ProductsView({
  items, setItems, assignments, setAssignments,
}: {
  items: Item[]
  setItems: React.Dispatch<React.SetStateAction<Item[]>>
  assignments: Assignment[]
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>
}) {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [dietFilter, setDietFilter] = useState('All')
  const [mineOnly, setMineOnly] = useState(false)
  const [weekFilter, setWeekFilter] = useState<'all' | 'this' | 'next'>('all')
  const [listView, setListView] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const products = items.filter(i => i.kind === 'product')
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category))).sort()]
  const allDiets = ['All', ...Array.from(new Set(products.flatMap(p => p.dietTags))).sort()]

  const filtered = useMemo(() => products.filter(p => {
    if (search) {
      const q = search.toLowerCase()
      if (!p.name.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q) && !p.dietTags.some(t => t.includes(q))) return false
    }
    if (catFilter !== 'All' && p.category !== catFilter) return false
    if (dietFilter !== 'All' && !p.dietTags.includes(dietFilter)) return false
    if (mineOnly && !p.isUserAdded) return false
    if (weekFilter === 'this' && !p.weekFlags.thisWeek) return false
    if (weekFilter === 'next' && !p.weekFlags.nextWeek) return false
    return true
  }), [products, search, catFilter, dietFilter, mineOnly, weekFilter])

  function toggleWeekFlag(id: string, flag: 'thisWeek' | 'nextWeek') {
    const item = items.find(i => i.id === id)!
    const isRemoving = item.weekFlags[flag]
    if (isRemoving && flag === 'thisWeek') {
      const hasA = assignments.some(a => a.itemId === id)
      if (hasA && !confirm(`"${item.name}" has planner assignments. Remove them?`)) return
      if (hasA) setAssignments(prev => prev.filter(a => a.itemId !== id))
    }
    if (!isRemoving && flag === 'thisWeek') {
      setAssignments(prev => {
        const already = prev.some(a => a.itemId === id && a.slot === 'Lunch')
        return already ? prev : [...prev, { id: uid(), itemId: id, day: 'Mon', slot: 'Lunch', servings: 1 }]
      })
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, weekFlags: { ...i.weekFlags, [flag]: !i.weekFlags[flag] } } : i))
  }

  function deleteProduct(id: string) {
    const usedIn = items.filter(i => i.kind === 'recipe' && i.ingredients?.some(ing => ing.productId === id))
    if (usedIn.length) {
      setDeleteError(`Cannot delete: used in recipe "${usedIn[0].name}"${usedIn.length > 1 ? ` and ${usedIn.length - 1} more` : ''}.`)
      return
    }
    setItems(prev => prev.filter(i => i.id !== id))
    setAssignments(prev => prev.filter(a => a.itemId !== id))
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} aria-label="Category filter" className="text-sm border border-gray-200 rounded-xl bg-white px-3 py-2 cursor-pointer focus:outline-none focus:border-teal-500">
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>

        <select value={dietFilter} onChange={e => setDietFilter(e.target.value)} aria-label="Diet filter" className="text-sm border border-gray-200 rounded-xl bg-white px-3 py-2 cursor-pointer focus:outline-none focus:border-teal-500">
          {allDiets.map(d => <option key={d} value={d}>{d === 'All' ? 'All diets' : DIET_LABELS[d] ?? d}</option>)}
        </select>

        <div className="flex rounded-xl overflow-hidden border border-gray-200 text-xs">
          {(['all', 'this', 'next'] as const).map(f => (
            <button key={f} onClick={() => setWeekFilter(f)} className={cn('px-3 py-2 font-medium cursor-pointer', weekFilter === f ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50')}>
              {f === 'all' ? 'All' : f === 'this' ? 'This week' : 'Next week'}
            </button>
          ))}
        </div>

        <button onClick={() => setMineOnly(p => !p)} className={cn('px-3 py-2 text-xs font-medium rounded-xl border cursor-pointer', mineOnly ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50')}>
          Mine
        </button>

        <div className="flex rounded-xl overflow-hidden border border-gray-200">
          <button onClick={() => setListView(false)} aria-label="Cards view" className={cn('px-2.5 py-2 cursor-pointer', !listView ? 'bg-teal-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50')}><LayoutGrid size={14} /></button>
          <button onClick={() => setListView(true)} aria-label="List view" className={cn('px-2.5 py-2 cursor-pointer', listView ? 'bg-teal-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50')}><List size={14} /></button>
        </div>

        <button
          onClick={() => { setEditId(null); setShowForm(true) }}
          className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 cursor-pointer"
        >
          <Plus size={14} /> Add product
        </button>
      </div>

      {deleteError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700">
          <AlertTriangle size={14} />
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="ml-auto cursor-pointer text-red-400 hover:text-red-600"><X size={14} /></button>
        </div>
      )}

      <p className="text-xs text-gray-400">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>

      {listView ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Name', 'Category', 'kcal', 'Protein', 'Fat', 'Carbs', 'Fiber', 'Serving', ''].map(h => (
                    <th key={h} className={cn('px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide', ['kcal','Protein','Fat','Carbs','Fiber'].includes(h) ? 'text-right' : 'text-left')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr key={p.id} className={cn('border-b border-gray-50 hover:bg-gray-50/50', idx % 2 === 0 ? '' : 'bg-gray-50/30')}>
                    <td className="px-4 py-2.5 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', CATEGORY_COLOURS[p.category] ?? 'bg-gray-100 text-gray-600')}>
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-700">{p.kcal}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-700">{fmtMacro(p.protein)}g</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-700">{fmtMacro(p.fat)}g</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-700">{fmtMacro(p.carbs)}g</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-700">{p.fiber !== undefined ? `${fmtMacro(p.fiber)}g` : '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-400">{p.servingLabel ?? `${p.servingAmount ?? 100} ${p.unit ?? 'g'}`}</td>
                    <td className="px-4 py-2.5">
                      {p.isUserAdded && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditId(p.id); setShowForm(true) }} aria-label="Edit" className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-teal-600 cursor-pointer"><Edit2 size={12} /></button>
                          <button onClick={() => deleteProduct(p.id)} aria-label="Delete" className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"><Trash2 size={12} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onToggleFlag={toggleWeekFlag}
              onEdit={() => { setEditId(p.id); setShowForm(true) }}
              onDelete={() => deleteProduct(p.id)}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <EmptyState
          icon={<Apple size={32} />}
          message="No products match your filters."
          action={() => { setSearch(''); setCatFilter('All'); setDietFilter('All'); setMineOnly(false); setWeekFilter('all') }}
          actionLabel="Clear filters"
        />
      )}

      {showForm && (
        <ProductForm
          item={editId ? items.find(i => i.id === editId) ?? null : null}
          onSave={data => {
            if (editId) {
              setItems(prev => prev.map(i => i.id === editId ? { ...i, ...data } : i))
            } else {
              setItems(prev => [...prev, {
                ...data as Item, id: `p-${uid()}`, kind: 'product',
                favorite: false, isUserAdded: true, userId: 'u-001',
                weekFlags: { thisWeek: false, nextWeek: false },
              }])
            }
            setShowForm(false); setEditId(null)
          }}
          onClose={() => { setShowForm(false); setEditId(null) }}
        />
      )}
    </div>
  )
}

// ─── recipes view ─────────────────────────────────────────────────────────────

function RecipesView({
  items, setItems, assignments, setAssignments,
}: {
  items: Item[]
  setItems: React.Dispatch<React.SetStateAction<Item[]>>
  assignments: Assignment[]
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>
}) {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [dietFilter, setDietFilter] = useState('All')
  const [favsOnly, setFavsOnly] = useState(false)
  const [mineOnly, setMineOnly] = useState(false)
  const [listView, setListView] = useState(false)
  const [detail, setDetail] = useState<Item | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const recipes = items.filter(i => i.kind === 'recipe')
  const categories = ['All', ...Array.from(new Set(recipes.map(r => r.category))).sort()]
  const allDiets = ['All', ...Array.from(new Set(recipes.flatMap(r => r.dietTags))).sort()]

  const filtered = useMemo(() => recipes.filter(r => {
    if (search) {
      const q = search.toLowerCase()
      if (!r.name.toLowerCase().includes(q) && !r.category.toLowerCase().includes(q) && !r.dietTags.some(t => t.includes(q))) return false
    }
    if (catFilter !== 'All' && r.category !== catFilter) return false
    if (dietFilter !== 'All' && !r.dietTags.includes(dietFilter)) return false
    if (favsOnly && !r.favorite) return false
    if (mineOnly && !r.isUserAdded) return false
    return true
  }), [recipes, search, catFilter, dietFilter, favsOnly, mineOnly])

  function toggleFav(id: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, favorite: !i.favorite } : i))
  }

  function toggleWeekFlag(id: string, flag: 'thisWeek' | 'nextWeek') {
    const item = items.find(i => i.id === id)!
    const isRemoving = item.weekFlags[flag]
    if (isRemoving && flag === 'thisWeek') {
      const hasA = assignments.some(a => a.itemId === id)
      if (hasA && !confirm(`"${item.name}" has planner assignments. Remove them?`)) return
      if (hasA) setAssignments(prev => prev.filter(a => a.itemId !== id))
    }
    if (!isRemoving && flag === 'thisWeek') {
      setAssignments(prev => {
        const already = prev.some(a => a.itemId === id && a.slot === 'Lunch')
        return already ? prev : [...prev, { id: uid(), itemId: id, day: 'Mon', slot: 'Lunch', servings: 1 }]
      })
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, weekFlags: { ...i.weekFlags, [flag]: !i.weekFlags[flag] } } : i))
  }

  function deleteRecipe(id: string) {
    const futureA = assignments.filter(a => a.itemId === id)
    if (futureA.length) {
      const item = items.find(i => i.id === id)!
      setDeleteError(`Cannot delete "${item.name}": it has ${futureA.length} planner assignment${futureA.length > 1 ? 's' : ''}. Remove them first.`)
      return
    }
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search recipes…" aria-label="Search recipes" className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-teal-500" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} aria-label="Category filter" className="text-sm border border-gray-200 rounded-xl bg-white px-3 py-2 cursor-pointer focus:outline-none focus:border-teal-500">
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={dietFilter} onChange={e => setDietFilter(e.target.value)} aria-label="Diet filter" className="text-sm border border-gray-200 rounded-xl bg-white px-3 py-2 cursor-pointer focus:outline-none focus:border-teal-500">
          {allDiets.map(d => <option key={d} value={d}>{d === 'All' ? 'All diets' : DIET_LABELS[d] ?? d}</option>)}
        </select>
        <button onClick={() => setFavsOnly(p => !p)} className={cn('px-3 py-2 text-xs font-medium rounded-xl border cursor-pointer flex items-center gap-1', favsOnly ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50')}>
          <Heart size={12} fill={favsOnly ? 'currentColor' : 'none'} /> Favourites
        </button>
        <button onClick={() => setMineOnly(p => !p)} className={cn('px-3 py-2 text-xs font-medium rounded-xl border cursor-pointer', mineOnly ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50')}>Mine</button>
        <div className="flex rounded-xl overflow-hidden border border-gray-200">
          <button onClick={() => setListView(false)} aria-label="Cards view" className={cn('px-2.5 py-2 cursor-pointer', !listView ? 'bg-teal-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50')}><LayoutGrid size={14} /></button>
          <button onClick={() => setListView(true)} aria-label="List view" className={cn('px-2.5 py-2 cursor-pointer', listView ? 'bg-teal-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50')}><List size={14} /></button>
        </div>
        <button onClick={() => { setEditId(null); setShowForm(true) }} className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 cursor-pointer">
          <Plus size={14} /> Add recipe
        </button>
      </div>

      {deleteError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700">
          <AlertTriangle size={14} /><span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="ml-auto cursor-pointer"><X size={14} /></button>
        </div>
      )}

      <p className="text-xs text-gray-400">{filtered.length} recipe{filtered.length !== 1 ? 's' : ''}</p>

      {listView ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Name', 'Category', 'Servings', 'kcal/srv', 'Protein', 'Fat', 'Carbs', ''].map(h => (
                    <th key={h} className={cn('px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide', ['kcal/srv','Protein','Fat','Carbs','Servings'].includes(h) ? 'text-right' : 'text-left')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => (
                  <tr key={r.id} className={cn('border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer', idx % 2 === 0 ? '' : 'bg-gray-50/30')} onClick={() => setDetail(r)}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{r.name}</p>
                        {r.favorite && <Heart size={11} fill="#ef4444" className="text-red-500 flex-shrink-0" />}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', CATEGORY_COLOURS[r.category] ?? 'bg-gray-100 text-gray-600')}>{r.category}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-700">{r.servings}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-700">{r.kcal}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-700">{fmtMacro(r.protein)}g</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-700">{fmtMacro(r.fat)}g</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-700">{fmtMacro(r.carbs)}g</td>
                    <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleFav(r.id)} aria-label={r.favorite ? 'Remove favourite' : 'Add favourite'} className="p-1 rounded hover:bg-gray-100 text-gray-300 hover:text-red-500 cursor-pointer"><Heart size={12} fill={r.favorite ? '#ef4444' : 'none'} className={r.favorite ? 'text-red-500' : ''} /></button>
                        {r.isUserAdded && (
                          <>
                            <button onClick={() => { setEditId(r.id); setShowForm(true) }} aria-label="Edit" className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-teal-600 cursor-pointer"><Edit2 size={12} /></button>
                            <button onClick={() => deleteRecipe(r.id)} aria-label="Delete" className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"><Trash2 size={12} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((r, idx) => (
            <article key={r.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col group">
              <div
                className={cn('h-28 bg-gradient-to-br flex items-end p-3 cursor-pointer', RECIPE_GRADIENTS[idx % RECIPE_GRADIENTS.length])}
                onClick={() => setDetail(r)}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium bg-white/80', CATEGORY_COLOURS[r.category] ?? 'text-gray-700')}>
                    {r.category}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); toggleFav(r.id) }}
                    aria-label={r.favorite ? 'Remove favourite' : 'Add favourite'}
                    className="p-1.5 bg-white/80 rounded-full hover:bg-white cursor-pointer"
                  >
                    <Heart size={13} fill={r.favorite ? '#ef4444' : 'none'} className={r.favorite ? 'text-red-500' : 'text-gray-400'} />
                  </button>
                </div>
              </div>

              <div className="p-3 flex flex-col gap-2 flex-1 cursor-pointer" onClick={() => setDetail(r)}>
                <p className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-teal-700">{r.name}</p>
                <p className="text-xs text-gray-400">{r.servings} serving{r.servings !== 1 ? 's' : ''} · {r.kcal} kcal</p>
                <div className="flex gap-1 text-xs">
                  {[['P', r.protein, 'bg-blue-50 text-blue-700'], ['F', r.fat, 'bg-red-50 text-red-600'], ['C', r.carbs, 'bg-green-50 text-green-700']].map(([l, v, c]) => (
                    <span key={String(l)} className={cn('px-1.5 py-0.5 rounded font-medium', String(c))}>
                      {fmtMacro(Number(v))}g {l}
                    </span>
                  ))}
                </div>
                {r.dietTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {r.dietTags.slice(0, 2).map(t => <span key={t} className="text-xs bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded-full">{DIET_LABELS[t] ?? t}</span>)}
                    {r.dietTags.length > 2 && <span className="text-xs text-gray-400">+{r.dietTags.length - 2}</span>}
                  </div>
                )}
              </div>

              <div className="px-3 pb-3 flex gap-1.5" onClick={e => e.stopPropagation()}>
                <button onClick={() => toggleWeekFlag(r.id, 'thisWeek')} className={cn('flex-1 text-xs py-1.5 rounded-lg font-medium cursor-pointer', r.weekFlags.thisWeek ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                  {r.weekFlags.thisWeek ? '✓ This week' : 'This week'}
                </button>
                <button onClick={() => toggleWeekFlag(r.id, 'nextWeek')} className={cn('flex-1 text-xs py-1.5 rounded-lg font-medium cursor-pointer', r.weekFlags.nextWeek ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                  {r.weekFlags.nextWeek ? '✓ Next week' : 'Next week'}
                </button>
                {r.isUserAdded && (
                  <>
                    <button onClick={() => { setEditId(r.id); setShowForm(true) }} aria-label="Edit recipe" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-teal-600 cursor-pointer"><Edit2 size={12} /></button>
                    <button onClick={() => deleteRecipe(r.id)} aria-label="Delete recipe" className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"><Trash2 size={12} /></button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <EmptyState
          icon={<UtensilsCrossed size={32} />}
          message="No recipes match your filters."
          action={() => { setSearch(''); setCatFilter('All'); setDietFilter('All'); setFavsOnly(false); setMineOnly(false) }}
          actionLabel="Clear filters"
        />
      )}

      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)} wide>
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn('text-sm px-3 py-1 rounded-full font-medium', CATEGORY_COLOURS[detail.category] ?? 'bg-gray-100 text-gray-600')}>{detail.category}</span>
              <span className="text-sm text-gray-400">{detail.servings} serving{detail.servings !== 1 ? 's' : ''}</span>
              {detail.isUserAdded && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Your recipe</span>}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[['kcal', detail.kcal, 'bg-amber-50 text-amber-700'], ['Protein', `${fmtMacro(detail.protein)}g`, 'bg-blue-50 text-blue-700'], ['Fat', `${fmtMacro(detail.fat)}g`, 'bg-red-50 text-red-600'], ['Carbs', `${fmtMacro(detail.carbs)}g`, 'bg-green-50 text-green-700']].map(([l, v, c]) => (
                <div key={String(l)} className={cn('rounded-xl px-2 py-3 text-center', String(c))}>
                  <p className="text-base font-bold leading-tight">{v}</p>
                  <p className="text-xs opacity-60 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
            {detail.ingredients && detail.ingredients.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Ingredients</h3>
                <ul className="space-y-1">
                  {detail.ingredients.map(ing => (
                    <li key={ing.productId} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50">
                      <span className="text-gray-700">{ing.productName}</span>
                      <span className="text-gray-400 font-mono text-xs">{ing.amount} {ing.unit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {detail.dietTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {detail.dietTags.map(t => <span key={t} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">{DIET_LABELS[t] ?? t}</span>)}
              </div>
            )}
          </div>
        </Modal>
      )}

      {showForm && (
        <RecipeForm
          item={editId ? items.find(i => i.id === editId) ?? null : null}
          products={items.filter(i => i.kind === 'product')}
          onSave={data => {
            if (editId) setItems(prev => prev.map(i => i.id === editId ? { ...i, ...data } : i))
            else setItems(prev => [...prev, {
              ...data as Item, id: `r-${uid()}`, kind: 'recipe',
              favorite: false, isUserAdded: true, userId: 'u-001',
              weekFlags: { thisWeek: false, nextWeek: false },
            }])
            setShowForm(false); setEditId(null)
          }}
          onClose={() => { setShowForm(false); setEditId(null) }}
        />
      )}
    </div>
  )
}

const MOCK_IMPORT: Partial<{ name: string; category: string; servings: number; dietTags: string[]; ingredients: { productId: string; productName: string; amount: number; unit: string }[] }> = {
  name: 'Mediterranean chicken bowl',
  category: 'Main courses',
  servings: 2,
  dietTags: ['mediterranean', 'protein-focused'],
  ingredients: [
    { productId: 'p-017', productName: 'Chicken breast', amount: 300, unit: 'g' },
    { productId: 'p-010', productName: 'Quinoa', amount: 170, unit: 'g' },
    { productId: 'p-012', productName: 'Baby spinach', amount: 60, unit: 'g' },
    { productId: 'p-014', productName: 'Cherry tomatoes', amount: 100, unit: 'g' },
    { productId: 'p-025', productName: 'Olive oil', amount: 1, unit: 'tbsp' },
  ],
}

function RecipeForm({
  item, products, onSave, onClose,
}: {
  item: Item | null; products: Item[]
  onSave: (data: Partial<Item>) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<'manual' | 'import'>('manual')
  const [importUrl, setImportUrl] = useState('')
  const [importType, setImportType] = useState<'url' | 'pdf'>('url')
  const [parsing, setParsing] = useState(false)
  const [parseDone, setParseDone] = useState(false)

  const [name, setName] = useState(item?.name ?? '')
  const [category, setCategory] = useState(item?.category ?? 'Breakfasts')
  const [servings, setServings] = useState(String(item?.servings ?? 1))
  const [ings, setIngs] = useState(item?.ingredients ?? [])
  const [recipeDietTags, setRecipeDietTags] = useState<string[]>(item?.dietTags ?? [])
  const [prodSearch, setProdSearch] = useState('')
  const [ingAmount, setIngAmount] = useState('100')
  const [ingUnit, setIngUnit] = useState('g')
  const [error, setError] = useState('')

  function mockParse() {
    if (!importUrl.trim() && importType === 'url') { setError('Paste a URL first'); return }
    setError(''); setParsing(true)
    setTimeout(() => {
      setName(MOCK_IMPORT.name ?? '')
      setCategory(MOCK_IMPORT.category ?? 'Main courses')
      setServings(String(MOCK_IMPORT.servings ?? 1))
      setIngs(MOCK_IMPORT.ingredients ?? [])
      setRecipeDietTags(MOCK_IMPORT.dietTags ?? [])
      setParsing(false); setParseDone(true); setTab('manual')
    }, 1200)
  }

  const matchedProds = products.filter(p => p.name.toLowerCase().includes(prodSearch.toLowerCase())).slice(0, 5)
  const selectedProd = products.find(p => p.name.toLowerCase() === prodSearch.toLowerCase())

  const nutrition = ings.reduce((acc, ing) => {
    const prod = products.find(p => p.id === ing.productId)
    if (!prod) return acc
    const ratio = ing.amount / (prod.servingAmount ?? 100)
    return { kcal: acc.kcal + prod.kcal * ratio, protein: acc.protein + prod.protein * ratio, fat: acc.fat + prod.fat * ratio, carbs: acc.carbs + prod.carbs * ratio }
  }, { kcal: 0, protein: 0, fat: 0, carbs: 0 })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    onSave({
      name: name.trim(), category, servings: Number(servings), ingredients: ings,
      kcal: Math.round(nutrition.kcal), protein: Math.round(nutrition.protein * 10) / 10,
      fat: Math.round(nutrition.fat * 10) / 10, carbs: Math.round(nutrition.carbs * 10) / 10,
      dietTags: recipeDietTags,
    })
  }

  return (
    <Modal title={item ? 'Edit recipe' : 'Add recipe'} onClose={onClose} wide>
      {!item && (
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-4">
          {([['manual', 'Manual'] as const, ['import', 'Import from URL / PDF'] as const]).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setTab(id)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer', tab === id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700')}>
              {label}
            </button>
          ))}
        </div>
      )}
      {tab === 'import' && (
        <div className="space-y-3 mb-4">
          <div className="flex gap-1 text-xs">
            {(['url', 'pdf'] as const).map(t => (
              <button key={t} type="button" onClick={() => setImportType(t)}
                className={cn('px-3 py-1 rounded-lg border cursor-pointer', importType === t ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50')}>
                {t === 'url' ? 'Website URL' : 'PDF upload'}
              </button>
            ))}
          </div>
          {importType === 'url' ? (
            <input value={importUrl} onChange={e => setImportUrl(e.target.value)} placeholder="https://example.com/recipe" className={inputCls} />
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 text-center text-sm text-gray-400">
              PDF upload — drag & drop or click to browse
              <br /><span className="text-xs">(not functional in prototype)</span>
            </div>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="button" onClick={mockParse} disabled={parsing}
            className="w-full py-2 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
            {parsing ? <><RefreshCw size={13} className="animate-spin" /> Parsing…</> : 'Parse recipe'}
          </button>
          <p className="text-xs text-gray-400 text-center">The prototype will generate a mocked recipe so you can see the review flow.</p>
        </div>
      )}
      {parseDone && (
        <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2 text-xs text-teal-700 mb-3">
          <Check size={13} /> Recipe parsed — review and save below.
        </div>
      )}
      <form onSubmit={submit} className="space-y-4">
        {error && tab === 'manual' && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name *"><input value={name} onChange={e => setName(e.target.value)} required className={inputCls} placeholder="Recipe name" /></Field>
          <Field label="Category">
            <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
              {['Breakfasts','Salads','Sandwiches','Soups','Main courses','Snacks','Sauces','Desserts','Drinks'].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Servings (this recipe makes)">
          <input type="number" min="1" value={servings} onChange={e => setServings(e.target.value)} className={inputCls} />
        </Field>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">Ingredients</label>
          <div className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <input value={prodSearch} onChange={e => setProdSearch(e.target.value)} placeholder="Search product…" className={inputCls} />
              {prodSearch && matchedProds.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 mt-1">
                  {matchedProds.map(p => (
                    <button key={p.id} type="button" onClick={() => setProdSearch(p.name)} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer first:rounded-t-xl last:rounded-b-xl">
                      {p.name} <span className="text-gray-400 text-xs">({p.kcal} kcal)</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input type="number" min="0" value={ingAmount} onChange={e => setIngAmount(e.target.value)} className="w-20 text-sm border border-gray-200 rounded-xl px-2 py-2 focus:outline-none focus:border-teal-500" placeholder="Amt" />
            <select value={ingUnit} onChange={e => setIngUnit(e.target.value)} className="w-20 text-sm border border-gray-200 rounded-xl px-2 py-2 cursor-pointer focus:outline-none focus:border-teal-500">
              {['g','ml','pc','tbsp','tsp'].map(u => <option key={u}>{u}</option>)}
            </select>
            <button
              type="button"
              onClick={() => {
                if (!selectedProd) return
                setIngs(prev => [...prev.filter(i => i.productId !== selectedProd.id), { productId: selectedProd.id, productName: selectedProd.name, amount: Number(ingAmount), unit: ingUnit }])
                setProdSearch(''); setIngAmount('100')
              }}
              disabled={!selectedProd}
              className="px-3 py-2 bg-teal-600 text-white rounded-xl text-sm hover:bg-teal-700 cursor-pointer disabled:opacity-40"
            >
              <Plus size={14} />
            </button>
          </div>
          {ings.map(ing => (
            <div key={ing.productId} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2 mb-1">
              <span className="text-gray-700">{ing.productName}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-mono text-xs">{ing.amount} {ing.unit}</span>
                <button type="button" onClick={() => setIngs(prev => prev.filter(i => i.productId !== ing.productId))} className="text-gray-400 hover:text-red-500 cursor-pointer"><X size={13} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2 bg-gray-50 rounded-xl p-3">
          {[['kcal', Math.round(nutrition.kcal)], ['Protein', `${fmtMacro(nutrition.protein)}g`], ['Fat', `${fmtMacro(nutrition.fat)}g`], ['Carbs', `${fmtMacro(nutrition.carbs)}g`]].map(([l, v]) => (
            <div key={String(l)} className="text-center">
              <p className="text-sm font-bold text-gray-800">{v}</p>
              <p className="text-xs text-gray-400">{l}</p>
            </div>
          ))}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">Diet compatibility</label>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(DIET_LABELS).map(([id, dname]) => {
              const active = recipeDietTags.includes(id)
              return (
                <button key={id} type="button" onClick={() => setRecipeDietTags(prev => active ? prev.filter(t => t !== id) : [...prev, id])}
                  className={cn('text-xs px-2.5 py-1 rounded-full border cursor-pointer transition-colors',
                    active ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-500 border-gray-200 hover:border-teal-400')}>
                  {dname}
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
          <button type="submit" className="flex-1 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 cursor-pointer">Save recipe</button>
        </div>
      </form>
    </Modal>
  )
}

// ─── products analyser view ───────────────────────────────────────────────────

interface AnalyserRow {
  id: string
  productId: string
  unit: string
  quantity: number
}

function calcRowMacros(row: AnalyserRow, products: Item[]) {
  const prod = products.find(p => p.id === row.productId)
  if (!prod) return { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, grams: 0 }
  const ratio = row.quantity / (prod.servingAmount ?? 100)
  const grams = row.unit === 'serving'
    ? row.quantity * (prod.servingG ?? prod.servingAmount ?? 100)
    : row.unit === 'g' || row.unit === 'ml'
      ? row.quantity
      : row.quantity * (prod.servingG ? prod.servingG / (prod.servingAmount ?? 1) : 1)
  return {
    kcal: prod.kcal * ratio,
    protein: prod.protein * ratio,
    fat: prod.fat * ratio,
    carbs: prod.carbs * ratio,
    fiber: (prod.fiber ?? 0) * ratio,
    grams,
  }
}

function ProductsAnalyserView({
  items, setItems, assignments, setAssignments,
}: {
  items: Item[]
  setItems: React.Dispatch<React.SetStateAction<Item[]>>
  assignments: Assignment[]
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>
}) {
  const [rows, setRows] = useState<AnalyserRow[]>([])
  const [searches, setSearches] = useState<Record<string, string>>({})
  const [showAddProduct, setShowAddProduct] = useState(false)

  const products = items.filter(i => i.kind === 'product')

  function addRow() {
    setRows(prev => [...prev, { id: uid(), productId: '', unit: 'g', quantity: 100 }])
  }

  function removeRow(id: string) {
    setRows(prev => prev.filter(r => r.id !== id))
    setSearches(prev => { const next = { ...prev }; delete next[id]; return next })
  }

  function updateRow(id: string, patch: Partial<AnalyserRow>) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r))
  }

  function toggleWeekFlag(productId: string, flag: 'thisWeek' | 'nextWeek') {
    const item = items.find(i => i.id === productId)!
    const isRemoving = item.weekFlags[flag]
    if (!isRemoving && flag === 'thisWeek') {
      setAssignments(prev => {
        const already = prev.some(a => a.itemId === productId && a.slot === 'Lunch')
        return already ? prev : [...prev, { id: uid(), itemId: productId, day: 'Mon', slot: 'Lunch', servings: 1 }]
      })
    }
    if (isRemoving && flag === 'thisWeek') {
      const hasA = assignments.some(a => a.itemId === productId)
      if (hasA && !confirm(`"${item.name}" has planner assignments. Remove them?`)) return
      if (hasA) setAssignments(prev => prev.filter(a => a.itemId !== productId))
    }
    setItems(prev => prev.map(i => i.id === productId ? { ...i, weekFlags: { ...i.weekFlags, [flag]: !i.weekFlags[flag] } } : i))
  }

  const totals = rows.reduce((acc, row) => {
    const m = calcRowMacros(row, products)
    return { kcal: acc.kcal + m.kcal, protein: acc.protein + m.protein, fat: acc.fat + m.fat, carbs: acc.carbs + m.carbs, fiber: acc.fiber + m.fiber, grams: acc.grams + m.grams }
  }, { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, grams: 0 })

  const per100 = totals.grams > 0 ? {
    kcal: totals.kcal / totals.grams * 100,
    protein: totals.protein / totals.grams * 100,
    fat: totals.fat / totals.grams * 100,
    carbs: totals.carbs / totals.grams * 100,
    fiber: totals.fiber / totals.grams * 100,
  } : null

  const thCls = 'px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right'
  const tdCls = 'px-3 py-2 text-xs font-mono text-gray-700 text-right'

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left min-w-44">Product</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left w-24">Unit</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right w-20">Qty</th>
                <th className={thCls}>Protein</th>
                <th className={thCls}>Fat</th>
                <th className={thCls}>Carbs</th>
                <th className={thCls}>Fiber</th>
                <th className={thCls}>kcal</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center w-28">Week</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const prod = products.find(p => p.id === row.productId)
                const m = prod ? calcRowMacros(row, products) : null
                const search = searches[row.id] ?? ''
                const matched = search ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 6) : []
                return (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                    <td className="px-3 py-2 relative">
                      <input
                        value={prod ? prod.name : search}
                        onChange={e => {
                          setSearches(prev => ({ ...prev, [row.id]: e.target.value }))
                          if (prod) updateRow(row.id, { productId: '' })
                        }}
                        placeholder="Search product…"
                        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-teal-400"
                      />
                      {!prod && search && matched.length > 0 && (
                        <div className="absolute top-full left-3 right-3 bg-white border border-gray-200 rounded-xl shadow-lg z-20 mt-0.5 max-h-40 overflow-y-auto">
                          {matched.map(p => (
                            <button key={p.id} type="button"
                              onMouseDown={() => { updateRow(row.id, { productId: p.id, unit: p.unit ?? 'g' }); setSearches(prev => ({ ...prev, [row.id]: '' })) }}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 cursor-pointer">
                              {p.name} <span className="text-gray-400">({p.kcal} kcal / {p.servingLabel})</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <select value={row.unit} onChange={e => updateRow(row.id, { unit: e.target.value })}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none focus:border-teal-400">
                        {['g','ml','pc','tbsp','tsp','serving'].map(u => <option key={u}>{u}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min="0" step="any" value={row.quantity}
                        onChange={e => updateRow(row.id, { quantity: Number(e.target.value) })}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-right focus:outline-none focus:border-teal-400" />
                    </td>
                    <td className={tdCls}>{m ? fmtMacro(m.protein) : '—'}</td>
                    <td className={tdCls}>{m ? fmtMacro(m.fat) : '—'}</td>
                    <td className={tdCls}>{m ? fmtMacro(m.carbs) : '—'}</td>
                    <td className={tdCls}>{m ? fmtMacro(m.fiber) : '—'}</td>
                    <td className={tdCls}>{m ? Math.round(m.kcal) : '—'}</td>
                    <td className="px-3 py-2 text-center">
                      {prod && (
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => toggleWeekFlag(prod.id, 'thisWeek')}
                            className={cn('text-xs px-1.5 py-0.5 rounded font-medium cursor-pointer', prod.weekFlags.thisWeek ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
                            TW
                          </button>
                          <button onClick={() => toggleWeekFlag(prod.id, 'nextWeek')}
                            className={cn('text-xs px-1.5 py-0.5 rounded font-medium cursor-pointer', prod.weekFlags.nextWeek ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
                            NW
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-2">
                      <button onClick={() => removeRow(row.id)} aria-label="Remove row" className="text-gray-300 hover:text-red-500 cursor-pointer"><X size={13} /></button>
                    </td>
                  </tr>
                )
              })}

              {rows.length > 0 && (
                <>
                  <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
                    <td className="px-3 py-2 text-xs text-gray-700" colSpan={3}>Total</td>
                    <td className={cn(tdCls, 'font-semibold')}>{fmtMacro(totals.protein)}g</td>
                    <td className={cn(tdCls, 'font-semibold')}>{fmtMacro(totals.fat)}g</td>
                    <td className={cn(tdCls, 'font-semibold')}>{fmtMacro(totals.carbs)}g</td>
                    <td className={cn(tdCls, 'font-semibold')}>{fmtMacro(totals.fiber)}g</td>
                    <td className={cn(tdCls, 'font-semibold')}>{Math.round(totals.kcal)}</td>
                    <td colSpan={2} />
                  </tr>
                  {per100 && (
                    <tr className="bg-blue-50/40 text-gray-500">
                      <td className="px-3 py-2 text-xs italic" colSpan={3}>Per 100 g ({Math.round(totals.grams)} g total)</td>
                      <td className={cn(tdCls, 'italic')}>{fmtMacro(per100.protein)}g</td>
                      <td className={cn(tdCls, 'italic')}>{fmtMacro(per100.fat)}g</td>
                      <td className={cn(tdCls, 'italic')}>{fmtMacro(per100.carbs)}g</td>
                      <td className={cn(tdCls, 'italic')}>{fmtMacro(per100.fiber)}g</td>
                      <td className={cn(tdCls, 'italic')}>{Math.round(per100.kcal)}</td>
                      <td colSpan={2} />
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <EmptyState icon={<Table2 size={32} />} message="Add products to analyse their combined nutrition." />
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={addRow} className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 cursor-pointer">
          <Plus size={14} /> Add row
        </button>
        <button onClick={() => setShowAddProduct(true)} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-50 cursor-pointer">
          <Plus size={14} /> New product
        </button>
      </div>

      {showAddProduct && (
        <ProductForm
          item={null}
          onSave={data => {
            setItems(prev => [...prev, {
              ...data as Item, id: `p-${uid()}`, kind: 'product',
              favorite: false, isUserAdded: true, userId: 'u-001',
              weekFlags: { thisWeek: false, nextWeek: false },
            }])
            setShowAddProduct(false)
          }}
          onClose={() => setShowAddProduct(false)}
        />
      )}
    </div>
  )
}

// ─── diets view ───────────────────────────────────────────────────────────────

function DietsView({ diets }: { diets: Diet[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{diets.length} nutrition patterns are supported.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {diets.map(diet => (
          <article key={diet.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold text-gray-900 text-sm">{diet.name}</h2>
              {diet.macroGuidance && (
                <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">Macros</span>
              )}
            </div>
            <p className={cn('text-xs text-gray-500 leading-relaxed', expanded !== diet.id && 'line-clamp-2')}>
              {diet.description}
            </p>
            <button onClick={() => setExpanded(expanded === diet.id ? null : diet.id)} className="text-xs text-teal-600 hover:text-teal-800 cursor-pointer text-left w-fit">
              {expanded === diet.id ? 'Show less ↑' : 'Show more ↓'}
            </button>
            {diet.macroGuidance ? (
              <div className="flex gap-2">
                {[['Protein', diet.macroGuidance.proteinPct, 'bg-blue-50 text-blue-700'], ['Fat', diet.macroGuidance.fatPct, 'bg-red-50 text-red-600'], ['Carbs', diet.macroGuidance.carbsPct, 'bg-green-50 text-green-700']].map(([l, v, c]) => (
                  <div key={String(l)} className={cn('flex-1 rounded-xl px-2 py-2 text-center', String(c))}>
                    <p className="text-sm font-bold">{v}<span className="text-xs">%</span></p>
                    <p className="text-xs opacity-70">{l}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">{diet.guidanceNote ?? 'No fixed macro split'}</p>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}

// ─── planner sub-views ────────────────────────────────────────────────────────

function DaySlot({
  day, slot, slotAssignments, items, upsertAssignment, removeAssignment,
}: {
  day: Day; slot: Slot; slotAssignments: Assignment[]; items: Item[]
  upsertAssignment: (itemId: string, day: Day, slot: Slot, servings: number) => void
  removeAssignment: (id: string) => void
}) {
  const [adding, setAdding] = useState(false)
  const [search, setSearch] = useState('')
  const matched = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5)

  return (
    <div className="px-3 py-2.5 border-t border-gray-50">
      <p className="text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">{slot}</p>
      <div className="space-y-1.5">
        {slotAssignments.map(a => {
          const item = items.find(i => i.id === a.itemId)
          if (!item) return null
          return (
            <div key={a.id} className="flex items-center gap-2 group">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-400">{Math.round(item.kcal * a.servings)} kcal</p>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button onClick={() => upsertAssignment(a.itemId, day, slot, Math.max(0.5, a.servings - 0.5))} aria-label="Decrease servings" className="w-5 h-5 rounded flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer"><Minus size={9} /></button>
                <span className="text-xs font-mono w-5 text-center">{a.servings}</span>
                <button onClick={() => upsertAssignment(a.itemId, day, slot, a.servings + 0.5)} aria-label="Increase servings" className="w-5 h-5 rounded flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer"><Plus size={9} /></button>
                <button
                  onClick={() => removeAssignment(a.id)}
                  aria-label="Remove"
                  className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 cursor-pointer ml-0.5 opacity-0 group-hover:opacity-100"
                >
                  <X size={9} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
      {adding ? (
        <div className="relative mt-1.5">
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            onBlur={() => { if (!search) { setAdding(false) } }}
            placeholder="Search…"
            className="w-full text-xs border border-teal-400 rounded-lg px-2 py-1 focus:outline-none"
          />
          {search && matched.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 mt-0.5 max-h-36 overflow-y-auto">
              {matched.map(i => (
                <button
                  key={i.id}
                  type="button"
                  onMouseDown={() => { upsertAssignment(i.id, day, slot, 1); setAdding(false); setSearch('') }}
                  className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-gray-50 cursor-pointer"
                >
                  {i.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="text-xs text-teal-600 hover:text-teal-800 flex items-center gap-0.5 mt-1.5 cursor-pointer">
          <Plus size={10} /> Add
        </button>
      )}
    </div>
  )
}

function WeeklySummary({
  items, assignments, days, dates, upsertAssignment, setAssignments,
}: {
  items: Item[]; assignments: Assignment[]; days: Day[]; dates: Date[]
  upsertAssignment: (itemId: string, day: Day, slot: Slot, servings: number) => void
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>
}) {
  const [addingSlot, setAddingSlot] = useState<Slot | null>(null)
  const [addSearch, setAddSearch] = useState('')
  const [gramsMode, setGramsMode] = useState<Record<string, boolean>>({})

  function slotItems(slot: Slot) {
    const ids = [...new Set(assignments.filter(a => a.slot === slot).map(a => a.itemId))]
    return ids.map(id => items.find(i => i.id === id)).filter(Boolean) as Item[]
  }

  function getServings(itemId: string, day: Day, slot: Slot) {
    return assignments.find(a => a.itemId === itemId && a.day === day && a.slot === slot)?.servings ?? 0
  }

  function removeSlotItem(itemId: string, slot: Slot) {
    setAssignments(prev => prev.filter(a => !(a.itemId === itemId && a.slot === slot)))
  }

  function gramsPerServing(item: Item): number | null {
    if (item.servingG != null) return item.servingG / (item.servingAmount ?? 1)
    if (item.unit === 'g' || item.unit === 'ml') return item.servingAmount ?? null
    return null
  }

  const matchedItems = items.filter(i => i.name.toLowerCase().includes(addSearch.toLowerCase())).slice(0, 6)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-44">Item</th>
              {days.map((d, i) => (
                <th key={d} className="text-center px-2 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-16">
                  <div>{d}</div>
                  <div className="font-normal text-gray-400 normal-case">{dates[i].getDate()}</div>
                </th>
              ))}
              <th className="w-8 px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {SLOTS.map(slot => {
              const si = slotItems(slot)
              return (
                <React.Fragment key={slot}>
                  <tr key={`${slot}-h`} className="bg-gray-50/60 border-t border-gray-100">
                    <td colSpan={9} className="px-4 py-2">
                      <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border', SLOT_COLOURS[slot])}>{slot}</span>
                    </td>
                  </tr>
                  {si.map(item => {
                    const gps = gramsPerServing(item)
                    const rowKey = `${item.id}-${slot}`
                    const inGrams = gramsMode[rowKey] ?? false
                    return (
                    <tr key={`${slot}-${item.id}`} className="border-b border-gray-50 hover:bg-gray-50/40">
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-gray-800 text-xs leading-tight">{item.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-gray-400 text-xs">{item.kcal} kcal/srv</p>
                          {gps != null && (
                            <button
                              onClick={() => setGramsMode(prev => ({ ...prev, [rowKey]: !prev[rowKey] }))}
                              className={cn('text-xs px-1.5 py-0 rounded border cursor-pointer', inGrams ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-400 border-gray-200 hover:border-teal-400')}
                            >
                              {inGrams ? 'g' : 'srv'}
                            </button>
                          )}
                        </div>
                      </td>
                      {days.map(day => {
                        const srv = getServings(item.id, day, slot)
                        const displayVal = inGrams && gps != null ? (srv > 0 ? Math.round(srv * gps) : '') : (srv || '')
                        return (
                          <td key={day} className="text-center px-1 py-2">
                            <input
                              type="number"
                              min="0"
                              step={inGrams ? '1' : '0.5'}
                              value={displayVal}
                              onChange={e => {
                                const v = Number(e.target.value)
                                upsertAssignment(item.id, day, slot, inGrams && gps != null ? v / gps : v)
                              }}
                              placeholder="–"
                              aria-label={`${item.name} ${day} ${inGrams ? 'grams' : 'servings'}`}
                              className="w-11 text-center text-xs border border-gray-200 rounded-lg py-1 focus:outline-none focus:border-teal-400 bg-transparent"
                            />
                          </td>
                        )
                      })}
                      <td className="px-2 py-2 text-center">
                        <button onClick={() => removeSlotItem(item.id, slot)} aria-label={`Remove ${item.name} from ${slot}`} className="p-1 text-gray-300 hover:text-red-500 cursor-pointer rounded"><X size={11} /></button>
                      </td>
                    </tr>
                    )})
                  }
                  <tr key={`${slot}-add`} className="border-b border-gray-100">
                    <td colSpan={9} className="px-4 py-1.5">
                      {addingSlot === slot ? (
                        <div className="relative">
                          <input
                            autoFocus
                            value={addSearch}
                            onChange={e => setAddSearch(e.target.value)}
                            onBlur={() => { if (!addSearch) setAddingSlot(null) }}
                            placeholder={`Add item to ${slot}…`}
                            className="w-full text-xs border border-teal-400 rounded-lg px-3 py-1.5 focus:outline-none"
                          />
                          {addSearch && matchedItems.length > 0 && (
                            <div className="absolute top-full left-0 z-10 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 w-64 max-h-40 overflow-y-auto">
                              {matchedItems.map(i => (
                                <button
                                  key={i.id}
                                  type="button"
                                  onMouseDown={() => {
                                    upsertAssignment(i.id, days[0], slot, 1)
                                    setAddSearch(''); setAddingSlot(null)
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer"
                                >
                                  {i.name} <span className="text-gray-400">· {i.kcal} kcal</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <button onClick={() => setAddingSlot(slot)} className="text-xs text-teal-600 hover:text-teal-800 flex items-center gap-1 cursor-pointer">
                          <Plus size={11} /> Add {slot.toLowerCase()} item
                        </button>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DayCardsView({
  items, assignments, days, dates, upsertAssignment, setAssignments,
}: {
  items: Item[]; assignments: Assignment[]; days: Day[]; dates: Date[]
  upsertAssignment: (itemId: string, day: Day, slot: Slot, servings: number) => void
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>
}) {
  const today = new Date()

  return (
    <div className="flex gap-3 overflow-x-auto pb-3">
      {days.map((day, i) => {
        const isToday = dates[i].toDateString() === today.toDateString()
        const dayA = assignments.filter(a => a.day === day)
        const totalKcal = dayA.reduce((s, a) => { const it = items.find(x => x.id === a.itemId); return s + (it ? it.kcal * a.servings : 0) }, 0)
        const totalProtein = dayA.reduce((s, a) => { const it = items.find(x => x.id === a.itemId); return s + (it ? it.protein * a.servings : 0) }, 0)
        const totalFat = dayA.reduce((s, a) => { const it = items.find(x => x.id === a.itemId); return s + (it ? it.fat * a.servings : 0) }, 0)
        const totalCarbs = dayA.reduce((s, a) => { const it = items.find(x => x.id === a.itemId); return s + (it ? it.carbs * a.servings : 0) }, 0)

        return (
          <article key={day} className={cn('flex-shrink-0 w-60 bg-white rounded-2xl border overflow-hidden', isToday ? 'border-teal-400 shadow-sm' : 'border-gray-200')}>
            <div className={cn('px-4 py-3 border-b', isToday ? 'bg-teal-50 border-teal-100' : 'bg-gray-50 border-gray-100')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn('text-sm font-bold', isToday ? 'text-teal-800' : 'text-gray-800')}>{day}</p>
                  <p className="text-xs text-gray-400">{dates[i].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                </div>
                {isToday && <span className="text-xs bg-teal-600 text-white px-2 py-0.5 rounded-full">Today</span>}
              </div>
              {dayA.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-1.5">
                  <span className="text-xs text-gray-700 font-semibold">{Math.round(totalKcal)} kcal</span>
                  <span className="text-xs text-blue-500">{fmtMacro(totalProtein)}g P</span>
                  <span className="text-xs text-orange-400">{fmtMacro(totalFat)}g F</span>
                  <span className="text-xs text-green-500">{fmtMacro(totalCarbs)}g C</span>
                </div>
              )}
            </div>
            <div>
              {SLOTS.map(slot => (
                <DaySlot
                  key={slot}
                  day={day}
                  slot={slot}
                  slotAssignments={dayA.filter(a => a.slot === slot)}
                  items={items}
                  upsertAssignment={upsertAssignment}
                  removeAssignment={id => setAssignments(prev => prev.filter(x => x.id !== id))}
                />
              ))}
            </div>
          </article>
        )
      })}
    </div>
  )
}

function CalendarView({
  items, assignments, days, dates, upsertAssignment, setAssignments,
}: {
  items: Item[]; assignments: Assignment[]; days: Day[]; dates: Date[]
  upsertAssignment: (itemId: string, day: Day, slot: Slot, servings: number) => void
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>
}) {
  const [subView, setSubView] = useState<'week' | 'month'>('week')
  const [monthOffset, setMonthOffset] = useState(0)
  const today = new Date()

  const ViewToggle = () => (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit ml-auto">
      <button onClick={() => setSubView('week')} className={cn('px-3 py-1 rounded-lg text-xs font-medium cursor-pointer', subView === 'week' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:bg-white')}>Week</button>
      <button onClick={() => setSubView('month')} className={cn('px-3 py-1 rounded-lg text-xs font-medium cursor-pointer', subView === 'month' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:bg-white')}>Month</button>
    </div>
  )

  if (subView === 'month') {
    const baseMonth = new Date(dates[0].getFullYear(), dates[0].getMonth() + monthOffset, 1)
    const firstDay = new Date(baseMonth.getFullYear(), baseMonth.getMonth(), 1)
    const dow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
    const gridStart = new Date(firstDay)
    gridStart.setDate(firstDay.getDate() - dow)
    const gridDays = Array.from({ length: 42 }, (_, i) => { const d = new Date(gridStart); d.setDate(gridStart.getDate() + i); return d })

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setMonthOffset(p => p - 1)} aria-label="Previous month" className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer text-gray-600">
              <ChevronLeft size={14} />
            </button>
            <h2 className="text-sm font-semibold text-gray-700 min-w-32 text-center">
              {firstDay.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={() => setMonthOffset(p => p + 1)} aria-label="Next month" className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer text-gray-600">
              <ChevronRight size={14} />
            </button>
          </div>
          <ViewToggle />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
              <div key={d} className="text-center py-2 text-xs font-semibold text-gray-500">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {gridDays.map((d, i) => {
              const isToday = d.toDateString() === today.toDateString()
              const isCurrentMonth = d.getMonth() === firstDay.getMonth()
              const dayName = DAYS[i % 7]
              const dayA = assignments.filter(a => a.day === dayName)
              return (
                <div key={i} className={cn('border-b border-r border-gray-50 p-2 min-h-24', !isCurrentMonth && 'opacity-30')}>
                  <span className={cn('inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full mb-1', isToday ? 'bg-teal-600 text-white' : 'text-gray-500')}>
                    {d.getDate()}
                  </span>
                  {dayA.slice(0, 2).map(a => {
                    const item = items.find(x => x.id === a.itemId)
                    return item ? (
                      <p key={a.id} className="text-xs text-gray-600 truncate leading-tight bg-teal-50 rounded px-1 mb-0.5">{item.name}</p>
                    ) : null
                  })}
                  {dayA.length > 2 && <p className="text-xs text-gray-400">+{dayA.length - 2} more</p>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><ViewToggle /></div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => (
          <CalendarWeekCell
            key={day}
            day={day}
            date={dates[i]}
            isToday={dates[i].toDateString() === today.toDateString()}
            assignments={assignments.filter(a => a.day === day)}
            items={items}
            onRemove={id => setAssignments(prev => prev.filter(x => x.id !== id))}
            onAdd={(itemId, slot) => upsertAssignment(itemId, day, slot, 1)}
          />
        ))}
      </div>
    </div>
  )
}

function CalendarWeekCell({
  day, date, isToday, assignments, items, onRemove, onAdd,
}: {
  day: Day; date: Date; isToday: boolean
  assignments: Assignment[]; items: Item[]
  onRemove: (id: string) => void
  onAdd: (itemId: string, slot: Slot) => void
}) {
  const [adding, setAdding] = useState(false)
  const [search, setSearch] = useState('')
  const [slot, setSlot] = useState<Slot>('Lunch')
  const matched = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5)
  const selected = items.find(i => i.name.toLowerCase() === search.toLowerCase())

  function confirm() {
    if (!selected) return
    onAdd(selected.id, slot)
    setSearch(''); setAdding(false)
  }

  return (
    <div className={cn('bg-white rounded-xl border p-2 min-h-36', isToday ? 'border-teal-400' : 'border-gray-200')}>
      <div className="flex items-center justify-between mb-2">
        <span className={cn('inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold', isToday ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700')}>
          {date.getDate()}
        </span>
        <span className="text-xs text-gray-400 font-medium">{day}</span>
      </div>
      {assignments.map(a => {
        const item = items.find(x => x.id === a.itemId)
        return item ? (
          <div key={a.id} className="flex items-start gap-1 mb-1 group">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-700 truncate leading-tight">{item.name}</p>
              <p className="text-xs text-gray-400">{a.slot} · {a.servings}×</p>
            </div>
            <button onClick={() => onRemove(a.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 cursor-pointer flex-shrink-0 mt-0.5">
              <X size={9} />
            </button>
          </div>
        ) : null
      })}
      {!adding && (
        <button onClick={() => setAdding(true)} className="mt-1 w-full text-xs text-gray-300 hover:text-teal-500 cursor-pointer text-left">
          <Plus size={10} className="inline mr-0.5" />Add
        </button>
      )}
      {adding && (
        <div className="mt-1 space-y-1">
          <div className="relative">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-teal-500"
            />
            {search && matched.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 mt-0.5">
                {matched.map(i => (
                  <button key={i.id} type="button" onClick={() => setSearch(i.name)}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg truncate">
                    {i.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <select value={slot} onChange={e => setSlot(e.target.value as Slot)}
            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1 cursor-pointer focus:outline-none focus:border-teal-500">
            {(['Breakfast','Lunch','Dinner','Snacks'] as Slot[]).map(s => <option key={s}>{s}</option>)}
          </select>
          <div className="flex gap-1">
            <button onClick={confirm} disabled={!selected}
              className="flex-1 text-xs py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer disabled:opacity-40">
              Add
            </button>
            <button onClick={() => { setAdding(false); setSearch('') }}
              className="text-xs px-2 py-1 text-gray-400 hover:text-gray-600 cursor-pointer">
              <X size={10} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── planner view ─────────────────────────────────────────────────────────────

function PlannerView({
  items, assignments, setAssignments, weekOffset, setWeekOffset,
}: {
  items: Item[]; assignments: Assignment[]
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>
  weekOffset: number; setWeekOffset: (n: number) => void
}) {
  const [tab, setTab] = useState<'summary' | 'daycards' | 'calendar'>('summary')
  const { label, dates } = getWeekDates(weekOffset)
  const { dates: currDates } = getWeekDates(0)
  const isCurrentWeek = dates[0].toDateString() === currDates[0].toDateString()

  function upsertAssignment(itemId: string, day: Day, slot: Slot, servings: number) {
    setAssignments(prev => {
      const existing = prev.find(a => a.itemId === itemId && a.day === day && a.slot === slot)
      if (servings <= 0) return prev.filter(a => !(a.itemId === itemId && a.day === day && a.slot === slot))
      if (existing) return prev.map(a => a.itemId === itemId && a.day === day && a.slot === slot ? { ...a, servings } : a)
      return [...prev, { id: uid(), itemId, day, slot, servings }]
    })
  }

  return (
    <div className="space-y-4">
      {/* Week nav */}
      <div className="flex items-center gap-2">
        <button onClick={() => setWeekOffset(weekOffset - 1)} aria-label="Previous week" className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer text-gray-600 flex-shrink-0">
          <ChevronLeft size={16} />
        </button>
        <div className="flex-1 text-center">
          <span className="text-sm font-semibold text-gray-800">{label}</span>
        </div>
        <button onClick={() => setWeekOffset(weekOffset + 1)} aria-label="Next week" className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer text-gray-600 flex-shrink-0">
          <ChevronRight size={16} />
        </button>
        {!isCurrentWeek && (
          <button onClick={() => setWeekOffset(0)} className="px-3 py-2 text-xs font-medium bg-teal-600 text-white rounded-xl hover:bg-teal-700 cursor-pointer flex-shrink-0">
            This week
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {([['summary', 'Weekly summary'], ['daycards', 'Day cards'], ['calendar', 'Calendar']] as const).map(([id, l]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn('px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer', tab === id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700')}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'summary' && (
        <WeeklySummary items={items} assignments={assignments} days={DAYS} dates={dates} upsertAssignment={upsertAssignment} setAssignments={setAssignments} />
      )}
      {tab === 'daycards' && (
        <DayCardsView items={items} assignments={assignments} days={DAYS} dates={dates} upsertAssignment={upsertAssignment} setAssignments={setAssignments} />
      )}
      {tab === 'calendar' && (
        <CalendarView items={items} assignments={assignments} days={DAYS} dates={dates} upsertAssignment={upsertAssignment} setAssignments={setAssignments} />
      )}
    </div>
  )
}

// ─── shopping list view ───────────────────────────────────────────────────────

function ShoppingListView({ assignments, items }: { assignments: Assignment[]; items: Item[] }) {
  const { dates } = getWeekDates(0)
  const fmt = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const [fromDate, setFromDate] = useState(fmt(dates[0]))
  const [toDate, setToDate] = useState(fmt(dates[6]))
  const [list, setList] = useState<ShoppingLine[] | null>(null)
  const [stale, setStale] = useState(false)
  const [dateError, setDateError] = useState('')
  const listRef = useRef(list)
  listRef.current = list
  useEffect(() => {
    if (listRef.current !== null) setStale(true)
  }, [assignments])

  const planSummary = useMemo(() =>
    assignments.reduce<{ id: string; name: string; servings: number; kcal: number }[]>((acc, a) => {
      const item = items.find(i => i.id === a.itemId)
      if (!item) return acc
      const existing = acc.find(x => x.id === a.itemId)
      if (existing) { existing.servings += a.servings; existing.kcal += item.kcal * a.servings }
      else acc.push({ id: a.itemId, name: item.name, servings: a.servings, kcal: item.kcal * a.servings })
      return acc
    }, []),
  [assignments, items])

  function generate() {
    if (fromDate > toDate) { setDateError('End date must be after start date.'); return }
    setDateError('')
    const lines: Record<string, ShoppingLine> = {}
    assignments.forEach(a => {
      const item = items.find(i => i.id === a.itemId)
      if (!item) return
      const ings = item.kind === 'recipe'
        ? (item.ingredients ?? [])
        : [{ productId: item.id, productName: item.name, amount: (item.servingAmount ?? 100) * a.servings, unit: item.unit ?? 'g' }]
      ings.forEach(ing => {
        const prod = items.find(i => i.id === ing.productId)
        const key = `${ing.productName}::${ing.unit}`
        const qty = ing.amount * (item.kind === 'recipe' ? a.servings / (item.servings ?? 1) : 1)
        if (lines[key]) lines[key].amount += qty
        else lines[key] = { name: ing.productName, amount: qty, unit: ing.unit, category: prod?.category ?? 'Other' }
      })
    })
    setList(Object.values(lines).sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)))
    setStale(false)
  }

  const categories = list ? [...new Set(list.map(l => l.category))] : []

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Date range</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <Field label="From">
            <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); if (list) setStale(true) }} className={inputCls} />
          </Field>
          <span className="text-gray-400 pb-2">→</span>
          <Field label="To">
            <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); if (list) setStale(true) }} className={inputCls} />
          </Field>
          <button onClick={generate} className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 cursor-pointer">
            {list ? <><RefreshCw size={13} /> Refresh</> : <><Plus size={13} /> Generate</>}
          </button>
        </div>
        {dateError && <p className="text-xs text-red-600">{dateError}</p>}
        {stale && (
          <p className="text-xs text-amber-600 flex items-center gap-1">
            <AlertTriangle size={12} /> List may be stale — plan changed since last generation.
          </p>
        )}
      </div>

      {planSummary.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Plan summary ({planSummary.length} items)</h2>
          <div className="space-y-1">
            {planSummary.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50">
                <span className="text-gray-800">{item.name}</span>
                <div className="flex gap-4 text-xs">
                  <span className="text-gray-400">{item.servings} srv</span>
                  <span className="font-medium text-gray-600">{Math.round(item.kcal)} kcal</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {list === null && (
        <EmptyState icon={<ShoppingBasket size={32} />} message="Set your date range and generate a grocery list from your meal plan." />
      )}

      {list !== null && list.length === 0 && (
        <EmptyState icon={<ShoppingBasket size={32} />} message="No items planned for this date range." />
      )}

      {list !== null && list.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Grocery list</h2>
            <span className="text-xs text-gray-400">{list.length} items</span>
          </div>
          {categories.map(cat => (
            <div key={cat}>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', CATEGORY_COLOURS[cat] ?? 'bg-gray-100 text-gray-600')}>
                  {cat}
                </span>
              </div>
              {list.filter(l => l.category === cat).map(line => (
                <div key={`${line.name}-${line.unit}`} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 text-sm hover:bg-gray-50/50">
                  <span className="text-gray-800">{line.name}</span>
                  <span className="font-mono text-gray-500 text-xs">
                    {Number.isInteger(line.amount) ? line.amount : line.amount.toFixed(1)} {line.unit}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── profile view ─────────────────────────────────────────────────────────────

function ProfileView({
  profile, setProfile, diets, logEntries, setLogEntries, items,
}: {
  profile: Profile
  setProfile: React.Dispatch<React.SetStateAction<Profile>>
  diets: Diet[]
  logEntries: MealLogEntry[]
  setLogEntries: React.Dispatch<React.SetStateAction<MealLogEntry[]>>
  items: Item[]
}) {
  const macroSum = profile.macros.protein + profile.macros.fat + profile.macros.carbs
  const macroOk = macroSum === 100
  const corridor = profile.calorieTarget
    ? { low: profile.calorieTarget - 150, high: profile.calorieTarget + 150 }
    : null

  const [logSearch, setLogSearch] = useState('')
  const [logQty, setLogQty] = useState('1')
  const [logUnit, setLogUnit] = useState('serving')
  const [editLogId, setEditLogId] = useState<string | null>(null)
  const [editLogQty, setEditLogQty] = useState('1')
  const matched = items.filter(i => i.name.toLowerCase().includes(logSearch.toLowerCase())).slice(0, 5)
  const selectedItem = items.find(i => i.name.toLowerCase() === logSearch.toLowerCase())
  const dailyKcal = logEntries.reduce((s, e) => s + e.kcal, 0)
  const dailyProtein = logEntries.reduce((s, e) => s + e.protein, 0)
  const dailyFat = logEntries.reduce((s, e) => s + e.fat, 0)
  const dailyCarbs = logEntries.reduce((s, e) => s + e.carbs, 0)

  function addLog() {
    if (!selectedItem) return
    const qty = Number(logQty)
    setLogEntries(prev => [...prev, {
      id: uid(), itemName: selectedItem.name,
      quantity: qty, unit: logUnit,
      kcal: Math.round(selectedItem.kcal * qty),
      protein: Math.round(selectedItem.protein * qty * 10) / 10,
      fat: Math.round(selectedItem.fat * qty * 10) / 10,
      carbs: Math.round(selectedItem.carbs * qty * 10) / 10,
    }])
    setLogSearch(''); setLogQty('1')
  }

  function saveEditLog(id: string) {
    const qty = Number(editLogQty)
    if (!qty || qty <= 0) return
    setLogEntries(prev => prev.map(e => {
      if (e.id !== id) return e
      const item = items.find(i => i.name === e.itemName)
      if (!item) return { ...e, quantity: qty }
      return {
        ...e, quantity: qty,
        kcal: Math.round(item.kcal * qty),
        protein: Math.round(item.protein * qty * 10) / 10,
        fat: Math.round(item.fat * qty * 10) / 10,
        carbs: Math.round(item.carbs * qty * 10) / 10,
      }
    }))
    setEditLogId(null)
  }

  return (
    <div className="space-y-4 max-w-xl">
      {/* Diet preferences */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800">Diet preferences</h2>

        <Field label="Active diet">
          <select value={profile.activeDiet ?? ''} onChange={e => setProfile(p => ({ ...p, activeDiet: e.target.value || null }))} className={inputCls}>
            <option value="">— None —</option>
            {diets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>

        <Field label="Daily calorie target (kcal)">
          <input type="number" min="0" value={profile.calorieTarget} onChange={e => setProfile(p => ({ ...p, calorieTarget: Number(e.target.value) }))} className={inputCls} />
        </Field>

        {corridor && (
          <div className="text-sm bg-teal-50 rounded-xl px-3 py-2 text-teal-800">
            Calorie corridor: <strong>{corridor.low} – {corridor.high} kcal</strong>
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">Macro split (%)</label>
          <div className="grid grid-cols-3 gap-2">
            {(['protein', 'fat', 'carbs'] as const).map(k => (
              <div key={k}>
                <label className="text-xs text-gray-400 mb-1 block capitalize">{k}</label>
                <input
                  type="number" min="0" max="100"
                  value={profile.macros[k]}
                  onChange={e => setProfile(p => ({ ...p, macros: { ...p.macros, [k]: Number(e.target.value) } }))}
                  className={cn(inputCls, !macroOk && macroSum > 0 && 'border-amber-400')}
                />
              </div>
            ))}
          </div>
          <p className={cn('mt-1.5 text-xs flex items-center gap-1', macroOk ? 'text-green-600' : macroSum === 0 ? 'text-gray-400' : 'text-amber-600')}>
            {macroOk ? <Check size={12} /> : <AlertTriangle size={12} />}
            Total: {macroSum}%{!macroOk && macroSum > 0 ? ' — must sum to 100%' : ''}
          </p>
        </div>
      </div>

      {/* Personal settings */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-800">Personal settings</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Language">
            <select value={profile.language} onChange={e => setProfile(p => ({ ...p, language: e.target.value }))} className={inputCls}>
              <option value="en">English</option>
              <option value="uk">Ukrainian</option>
            </select>
          </Field>
          <Field label="Unit system">
            <select value={profile.unitSystem} onChange={e => setProfile(p => ({ ...p, unitSystem: e.target.value as 'metric' | 'imperial' }))} className={inputCls}>
              <option value="metric">Metric (g, kg, ml)</option>
              <option value="imperial">US Customary (oz, lb)</option>
            </select>
          </Field>
          <Field label="Gender">
            <select value={profile.gender} onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))} className={inputCls}>
              <option value="">—</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other / prefer not to say</option>
            </select>
          </Field>
          <Field label="Age">
            <input type="number" min="1" max="120" value={profile.age} onChange={e => setProfile(p => ({ ...p, age: e.target.value }))} className={inputCls} placeholder="Years" />
          </Field>
          <Field label={`Weight (${profile.unitSystem === 'metric' ? 'kg' : 'lb'})`}>
            <input type="number" min="0" value={profile.weight} onChange={e => setProfile(p => ({ ...p, weight: e.target.value }))} className={inputCls} />
          </Field>
        </div>
      </div>

      {/* Meal log */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Meal tracking log</h2>
          {logEntries.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full font-medium">{Math.round(dailyKcal)} kcal</span>
              <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full">{fmtMacro(dailyProtein)}g P</span>
              <span className="text-xs bg-orange-50 text-orange-500 px-2.5 py-0.5 rounded-full">{fmtMacro(dailyFat)}g F</span>
              <span className="text-xs bg-green-50 text-green-600 px-2.5 py-0.5 rounded-full">{fmtMacro(dailyCarbs)}g C</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-44">
            <input value={logSearch} onChange={e => setLogSearch(e.target.value)} placeholder="Search food or recipe…" className={inputCls} />
            {logSearch && matched.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 mt-1">
                {matched.map(i => (
                  <button key={i.id} type="button" onClick={() => setLogSearch(i.name)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer first:rounded-t-xl last:rounded-b-xl">
                    {i.name} <span className="text-gray-400">({i.kcal} kcal)</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <input type="number" min="0.5" step="0.5" value={logQty} onChange={e => setLogQty(e.target.value)} className="w-16 text-sm border border-gray-200 rounded-xl px-2 py-2 focus:outline-none focus:border-teal-500" />
          <select value={logUnit} onChange={e => setLogUnit(e.target.value)} className="text-sm border border-gray-200 rounded-xl px-2 py-2 cursor-pointer focus:outline-none focus:border-teal-500">
            {['serving','g','ml'].map(u => <option key={u}>{u}</option>)}
          </select>
          <button onClick={addLog} disabled={!selectedItem} className="px-3 py-2 bg-teal-600 text-white text-xs font-medium rounded-xl hover:bg-teal-700 cursor-pointer disabled:opacity-40 flex items-center gap-1">
            <Plus size={13} /> Log
          </button>
        </div>

        {logEntries.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">No entries yet. Log what you eat today.</p>
        ) : (
          <div className="space-y-1">
            {logEntries.map(e => (
              <div key={e.id} className="py-1.5 border-b border-gray-50 group">
                {editLogId === e.id ? (
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-sm text-gray-700 truncate">{e.itemName}</span>
                    <input type="number" min="0.5" step="0.5" value={editLogQty} onChange={ev => setEditLogQty(ev.target.value)}
                      className="w-16 text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-teal-500" />
                    <button onClick={() => saveEditLog(e.id)} className="text-xs px-2 py-1 bg-teal-600 text-white rounded-lg cursor-pointer hover:bg-teal-700"><Check size={11} /></button>
                    <button onClick={() => setEditLogId(null)} className="text-xs px-2 py-1 text-gray-400 hover:text-gray-600 cursor-pointer"><X size={11} /></button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{e.itemName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{e.quantity} {e.unit}</span>
                      <span className="text-xs font-medium text-gray-600">{e.kcal} kcal</span>
                      <button onClick={() => { setEditLogId(e.id); setEditLogQty(String(e.quantity)) }} aria-label="Edit entry" className="text-gray-300 hover:text-teal-500 cursor-pointer opacity-0 group-hover:opacity-100">
                        <Edit2 size={11} />
                      </button>
                      <button onClick={() => setLogEntries(prev => prev.filter(x => x.id !== e.id))} aria-label="Remove entry" className="text-gray-300 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100">
                        <X size={11} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── root app ─────────────────────────────────────────────────────────────────

const DEFAULT_PROFILE: Profile = {
  activeDiet: 'mediterranean',
  calorieTarget: 2000,
  macros: { protein: 30, fat: 35, carbs: 35 },
  language: 'en',
  unitSystem: 'metric',
  gender: '',
  age: '',
  weight: '',
}

export default function App() {
  const [activeView, setActiveView] = useState<View>('planner')
  const [items, setItems] = useState<Item[]>([...SEED_PRODUCTS, ...SEED_RECIPES])
  const [assignments, setAssignments] = useState<Assignment[]>(SEED_ASSIGNMENTS)
  const [weekOffset, setWeekOffset] = useState(0)
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE)
  const [logEntries, setLogEntries] = useState<MealLogEntry[]>([])

  return (
    <div className="flex h-full overflow-hidden" style={{ background: '#F1F5F4' }}>
      <Sidebar active={activeView} setActive={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar view={activeView} profile={profile} assignments={assignments} items={items} />
        <main id="main-content" className="flex-1 overflow-y-auto p-6">
          {activeView === 'planner' && (
            <PlannerView items={items} assignments={assignments} setAssignments={setAssignments} weekOffset={weekOffset} setWeekOffset={setWeekOffset} />
          )}
          {activeView === 'products' && (
            <ProductsView items={items} setItems={setItems} assignments={assignments} setAssignments={setAssignments} />
          )}
          {activeView === 'analyser' && <ProductsAnalyserView items={items} setItems={setItems} assignments={assignments} setAssignments={setAssignments} />}
          {activeView === 'recipes' && (
            <RecipesView items={items} setItems={setItems} assignments={assignments} setAssignments={setAssignments} />
          )}
          {activeView === 'diets' && <DietsView diets={SEED_DIETS} />}
          {activeView === 'shopping' && <ShoppingListView assignments={assignments} items={items} />}
          {activeView === 'profile' && (
            <ProfileView profile={profile} setProfile={setProfile} diets={SEED_DIETS} logEntries={logEntries} setLogEntries={setLogEntries} items={items} />
          )}
        </main>
      </div>
    </div>
  )
}
