'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  UtensilsCrossed, ShoppingBasket, Apple, Leaf, CalendarDays,
  User, Search, Heart, Plus, Minus, X, ChevronLeft,
  ChevronRight, LayoutGrid, List, Edit2, Trash2, Check,
  AlertTriangle, RefreshCw, Table2, Download, SlidersHorizontal,
  Sunrise, Salad, Soup, Sandwich, ChefHat, Cake, Coffee, BookOpen,
  Milk, Fish, Wheat, Carrot, Drumstick, Bean, Nut, Droplet,
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

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
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

const PRODUCT_CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Dairy: <Milk size={20} />, Fish: <Fish size={20} />, Grains: <Wheat size={20} />,
  Produce: <Carrot size={20} />, Meat: <Drumstick size={20} />, Legumes: <Bean size={20} />,
  'Nuts & Seeds': <Nut size={20} />, Condiments: <Droplet size={20} />,
}

const RECIPE_CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Breakfasts: <Sunrise size={20} />, Salads: <Salad size={20} />, Soups: <Soup size={20} />,
  'Main courses': <UtensilsCrossed size={20} />, Snacks: <Apple size={20} />,
  Sandwiches: <Sandwich size={20} />, Sauces: <ChefHat size={20} />,
  Desserts: <Cake size={20} />, Drinks: <Coffee size={20} />,
}

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
  { id: 'profile',  label: 'Personal cabinet',    icon: <User size={18} /> },
  { id: 'search',   label: 'Advanced search',     icon: <SlidersHorizontal size={18} /> },
]

function Sidebar({
  active, setActive,
}: {
  active: View; setActive: (v: View) => void
}) {
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

      <div className="px-4 pb-5 pt-3 border-t border-white/10">
        <p className="text-white/30 text-xs px-1">MVP Prototype · v1.0</p>
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

function ProductDetailModal({ product: p, onClose }: { product: Item; onClose: () => void }) {
  const protKcal = p.protein * 4
  const fatKcal = p.fat * 9
  const carbKcal = p.carbs * 4
  const totalMacroKcal = protKcal + fatKcal + carbKcal || 1
  const pPct = Math.round((protKcal / totalMacroKcal) * 100)
  const fPct = Math.round((fatKcal / totalMacroKcal) * 100)
  const cPct = 100 - pPct - fPct

  const pieGradient = `conic-gradient(#3b82f6 0% ${pPct}%, #ef4444 ${pPct}% ${pPct + fPct}%, #22c55e ${pPct + fPct}% 100%)`

  const baseG = p.unit === 'g' || p.unit === 'ml' ? (p.servingAmount ?? 100) : (p.servingG ?? p.servingAmount ?? 100)
  const scale = (n: number, g: number) => fmtMacro((n / baseG) * g)
  const convUnits = [
    { label: `100 ${p.unit === 'ml' ? 'ml' : 'g'}`, g: 100 },
    { label: `${p.servingAmount ?? 100} ${p.unit ?? 'g'} (1 serving)`, g: baseG },
    ...(p.servingG && p.unit !== 'g' && p.unit !== 'ml' ? [{ label: `1 ${p.unit}`, g: p.servingG }] : []),
    ...(p.altUnits ?? []).map(au => ({ label: `1 ${au.unit}`, g: au.gramsPerUnit })),
  ]

  return (
    <Modal title={p.name} onClose={onClose} wide>
      <div className="space-y-5">
        <div className="flex items-center gap-5">
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: pieGradient, flexShrink: 0 }} />
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /><span className="text-gray-600">Protein: {fmtMacro(p.protein)} g ({pPct}%)</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /><span className="text-gray-600">Fat: {fmtMacro(p.fat)} g ({fPct}%)</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /><span className="text-gray-600">Carbs: {fmtMacro(p.carbs)} g ({cPct}%)</span></div>
            {p.fiber !== undefined && <div className="text-xs text-gray-400">Fiber: {fmtMacro(p.fiber)} g</div>}
            <div className="font-semibold text-gray-900">{p.kcal} kcal per {p.servingLabel ?? `${p.servingAmount ?? 100} ${p.unit ?? 'g'}`}</div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Units conversion</h3>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500">
                <th className="text-left px-3 py-2 font-medium">Amount</th>
                <th className="text-right px-3 py-2 font-medium">kcal</th>
                <th className="text-right px-3 py-2 font-medium">Protein</th>
                <th className="text-right px-3 py-2 font-medium">Fat</th>
                <th className="text-right px-3 py-2 font-medium">Carbs</th>
              </tr>
            </thead>
            <tbody>
              {convUnits.map(({ label, g }) => (
                <tr key={label} className="border-t border-gray-100">
                  <td className="px-3 py-2 text-gray-700">{label}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{Math.round((p.kcal / baseG) * g)}</td>
                  <td className="px-3 py-2 text-right text-gray-600">{scale(p.protein, g)} g</td>
                  <td className="px-3 py-2 text-right text-gray-600">{scale(p.fat, g)} g</td>
                  <td className="px-3 py-2 text-right text-gray-600">{scale(p.carbs, g)} g</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {p.dietTags.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Diet compatibility</h3>
            <div className="flex flex-wrap gap-1">
              {p.dietTags.map(t => <span key={t} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{DIET_LABELS[t] ?? t}</span>)}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

function ProductCard({
  product: p, onToggleFlag, onEdit, onDelete, onDetail,
}: {
  product: Item
  onToggleFlag: (id: string, flag: 'thisWeek' | 'nextWeek') => void
  onEdit: () => void
  onDelete: () => void
  onDetail: () => void
}) {
  return (
    <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer" onClick={onDetail}>
      {p.imageUrl ? (
        <img src={p.imageUrl} alt={p.name} className="w-full h-28 object-cover" />
      ) : (
        <div className={cn('w-full h-20 flex items-center justify-center', CATEGORY_COLOURS[p.category] ?? 'bg-gray-50 text-gray-300')}>
          {PRODUCT_CATEGORY_ICONS[p.category] ?? <UtensilsCrossed size={20} />}
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
            <div className="flex gap-0.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
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

        <div className="flex gap-1.5 pt-1 border-t border-gray-100 mt-auto" onClick={e => e.stopPropagation()}>
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
  const [altUnits, setAltUnits] = useState<{unit: string; gramsPerUnit: number}[]>(item?.altUnits ?? [])
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
      altUnits: altUnits.filter(au => au.unit && au.gramsPerUnit > 0),
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
            <Field label={`Grams per ${unit}`}>
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
        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">Alternative units</label>
          <div className="space-y-1.5">
            {altUnits.map((au, i) => (
              <div key={i} className="flex items-center gap-2">
                <select value={au.unit} onChange={e => setAltUnits(prev => prev.map((x, j) => j === i ? { ...x, unit: e.target.value } : x))}
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-teal-500 cursor-pointer bg-white">
                  <option value="">— unit —</option>
                  {['g','kg','ml','l','oz','lb','fl oz','cup','tbsp','tsp','pc','serving'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <input type="number" min="0" step="0.1" value={au.gramsPerUnit || ''} onChange={e => setAltUnits(prev => prev.map((x, j) => j === i ? { ...x, gramsPerUnit: Number(e.target.value) } : x))}
                  placeholder={`grams per ${au.unit || 'unit'}`} className="w-32 text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-teal-500" />
                <button type="button" onClick={() => setAltUnits(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 cursor-pointer"><X size={14} /></button>
              </div>
            ))}
            <button type="button" onClick={() => setAltUnits(prev => [...prev, { unit: '', gramsPerUnit: 0 }])}
              className="text-xs text-teal-600 hover:text-teal-800 flex items-center gap-1 cursor-pointer mt-1">
              <Plus size={11} /> Add unit
            </button>
          </div>
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
  const [browseMode, setBrowseMode] = useState<'list' | 'categories'>('categories')
  const [sortBy, setSortBy] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [detailProduct, setDetailProduct] = useState<Item | null>(null)

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

  const sortedFiltered = useMemo(() => {
    if (!sortBy) return filtered
    const dir = sortDir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      const va = (a as unknown as Record<string, unknown>)[sortBy]
      const vb = (b as unknown as Record<string, unknown>)[sortBy]
      if (typeof va === 'string' && typeof vb === 'string') return va.localeCompare(vb) * dir
      return (Number(va) - Number(vb)) * dir
    })
  }, [filtered, sortBy, sortDir])

  function sortCol(col: string) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  function toggleWeekFlag(id: string, flag: 'thisWeek' | 'nextWeek') {
    const item = items.find(i => i.id === id)!
    const isRemoving = item.weekFlags[flag]
    if (isRemoving && flag === 'thisWeek') {
      const hasManual = assignments.some(a => a.itemId === id && !a.autoAdded)
      if (hasManual && !confirm(`"${item.name}" has planner assignments. Remove them?`)) return
      setAssignments(prev => prev.filter(a => a.itemId !== id))
    }
    if (!isRemoving && flag === 'thisWeek') {
      setAssignments(prev => {
        const already = prev.some(a => a.itemId === id && a.slot === 'Lunch')
        return already ? prev : [...prev, { id: uid(), itemId: id, day: 'Mon', slot: 'Lunch', servings: 1, weekOffset: 0, autoAdded: true }]
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
        {browseMode === 'list' && (
          <>
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
          </>
        )}
        <div className="flex rounded-xl overflow-hidden border border-gray-200">
          <button onClick={() => setBrowseMode('list')} aria-label="List view" className={cn('px-2.5 py-2 cursor-pointer', browseMode === 'list' ? 'bg-teal-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50')}><List size={14} /></button>
          <button onClick={() => setBrowseMode('categories')} aria-label="Category cards view" title="Browse by category" className={cn('px-2.5 py-2 cursor-pointer text-xs font-bold', browseMode === 'categories' ? 'bg-teal-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50')}>CAT</button>
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

      {browseMode !== 'categories' && (
        <p className="text-xs text-gray-400">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
      )}

      {browseMode === 'categories' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from(new Set(products.map(p => p.category))).sort().map(cat => {
            const count = products.filter(p => p.category === cat).length
            return (
              <button key={cat} onClick={() => { setCatFilter(cat); setBrowseMode('list') }}
                className="bg-white border border-gray-200 rounded-2xl p-5 text-left hover:shadow-md transition-shadow cursor-pointer">
                <div className={cn('mb-3 w-10 h-10 rounded-xl flex items-center justify-center', CATEGORY_COLOURS[cat] ?? 'bg-gray-100')}>
                  {PRODUCT_CATEGORY_ICONS[cat] ?? <UtensilsCrossed size={20} />}
                </div>
                <p className="font-semibold text-gray-900 text-sm">{cat}</p>
                <p className="text-xs text-gray-400 mt-0.5">{count} item{count !== 1 ? 's' : ''}</p>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {[['Name','name'],['Category','category'],['kcal','kcal'],['Protein','protein'],['Fat','fat'],['Carbs','carbs'],['Fiber','fiber'],['Serving',''],['','']].map(([h, key]) => (
                    <th key={h} onClick={() => key && sortCol(key)}
                      className={cn('px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide select-none', ['kcal','Protein','Fat','Carbs','Fiber'].includes(h) ? 'text-right' : 'text-left', key ? 'cursor-pointer hover:text-gray-700' : '')}>
                      {h}{key && sortBy === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedFiltered.map((p, idx) => (
                  <tr key={p.id} onClick={() => setDetailProduct(p)}
                    className={cn('border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer', idx % 2 === 0 ? '' : 'bg-gray-50/30')}>
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
                    <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleWeekFlag(p.id, 'thisWeek')} className={cn('text-xs px-1.5 py-0.5 rounded font-medium cursor-pointer', p.weekFlags.thisWeek ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>TW</button>
                        <button onClick={() => toggleWeekFlag(p.id, 'nextWeek')} className={cn('text-xs px-1.5 py-0.5 rounded font-medium cursor-pointer', p.weekFlags.nextWeek ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>NW</button>
                        {p.isUserAdded && (
                          <>
                            <button onClick={() => { setEditId(p.id); setShowForm(true) }} aria-label="Edit" className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-teal-600 cursor-pointer"><Edit2 size={12} /></button>
                            <button onClick={() => deleteProduct(p.id)} aria-label="Delete" className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"><Trash2 size={12} /></button>
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
      )}

      {browseMode !== 'categories' && filtered.length === 0 && (
        <EmptyState
          icon={<Apple size={32} />}
          message="No products match your filters."
          action={() => { setSearch(''); setCatFilter('All'); setDietFilter('All'); setMineOnly(false); setWeekFilter('all') }}
          actionLabel="Clear filters"
        />
      )}

      {detailProduct && (
        <ProductDetailModal product={detailProduct} onClose={() => setDetailProduct(null)} />
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
  const [browseMode, setBrowseMode] = useState<'list' | 'categories'>('categories')
  const listView = browseMode === 'list'
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

  function deleteRecipe(id: string) {
    const currentFutureA = assignments.filter(a => a.itemId === id && (a.weekOffset ?? 0) >= 0)
    if (currentFutureA.length) {
      const item = items.find(i => i.id === id)!
      setDeleteError(`Cannot delete "${item.name}": it has ${currentFutureA.length} planner assignment${currentFutureA.length > 1 ? 's' : ''}. Remove them first.`)
      return
    }
    setItems(prev => prev.filter(i => i.id !== id))
    setAssignments(prev => prev.filter(a => a.itemId !== id))
  }

  function toggleWeekFlag(id: string, flag: 'thisWeek' | 'nextWeek') {
    const item = items.find(i => i.id === id)!
    const isRemoving = item.weekFlags[flag]
    if (isRemoving && flag === 'thisWeek') {
      const hasManual = assignments.some(a => a.itemId === id && !a.autoAdded)
      if (hasManual && !confirm(`"${item.name}" has planner assignments. Remove them?`)) return
      setAssignments(prev => prev.filter(a => a.itemId !== id))
    }
    if (!isRemoving && flag === 'thisWeek') {
      setAssignments(prev => {
        const already = prev.some(a => a.itemId === id && a.slot === 'Lunch')
        return already ? prev : [...prev, { id: uid(), itemId: id, day: 'Mon', slot: 'Lunch', servings: 1, weekOffset: 0, autoAdded: true }]
      })
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, weekFlags: { ...i.weekFlags, [flag]: !i.weekFlags[flag] } } : i))
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
          <button onClick={() => setBrowseMode('list')} aria-label="List view" className={cn('px-2.5 py-2 cursor-pointer', listView ? 'bg-teal-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50')}><List size={14} /></button>
          <button onClick={() => setBrowseMode('categories')} aria-label="Category cards view" title="Browse by category" className={cn('px-2.5 py-2 cursor-pointer text-xs font-bold', !listView ? 'bg-teal-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50')}>CAT</button>
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

      {listView && <p className="text-xs text-gray-400">{filtered.length} recipe{filtered.length !== 1 ? 's' : ''}</p>}

      {browseMode === 'categories' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from(new Set(recipes.map(r => r.category))).sort().map(cat => {
            const count = recipes.filter(r => r.category === cat).length
            return (
              <button key={cat} onClick={() => { setCatFilter(cat); setBrowseMode('list') }}
                className="bg-white border border-gray-200 rounded-2xl p-5 text-left hover:shadow-md transition-shadow cursor-pointer">
                <div className={cn('mb-3 w-10 h-10 rounded-xl flex items-center justify-center', CATEGORY_COLOURS[cat] ?? 'bg-gray-100')}>
                  {RECIPE_CATEGORY_ICONS[cat] ?? <BookOpen size={20} />}
                </div>
                <p className="font-semibold text-gray-900 text-sm">{cat}</p>
                <p className="text-xs text-gray-400 mt-0.5">{count} recipe{count !== 1 ? 's' : ''}</p>
              </button>
            )
          })}
        </div>
      ) : listView ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Name', 'Category', 'Servings', 'kcal', 'Protein', 'Fat', 'Carbs', 'Fiber', ''].map(h => (
                    <th key={h} className={cn('px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide', ['kcal','Protein','Fat','Carbs','Servings','Fiber'].includes(h) ? 'text-right' : 'text-left')}>
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
                    <td className="px-4 py-2.5 text-right">
                      <span className="font-mono text-gray-700">{r.kcal}</span>
                      {r.servingG && <div className="text-xs text-gray-400 font-mono">{Math.round(r.kcal * 100 / r.servingG)}/100g</div>}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-700">{fmtMacro(r.protein)}g</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-700">{fmtMacro(r.fat)}g</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-700">{fmtMacro(r.carbs)}g</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-700">{r.fiber !== undefined ? `${fmtMacro(r.fiber)}g` : '—'}</td>
                    <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleWeekFlag(r.id, 'thisWeek')} className={cn('text-xs px-1.5 py-0.5 rounded font-medium cursor-pointer', r.weekFlags.thisWeek ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>TW</button>
                        <button onClick={() => toggleWeekFlag(r.id, 'nextWeek')} className={cn('text-xs px-1.5 py-0.5 rounded font-medium cursor-pointer', r.weekFlags.nextWeek ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>NW</button>
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
      ) : null}

      {browseMode !== 'categories' && filtered.length === 0 && (
        <EmptyState
          icon={<UtensilsCrossed size={32} />}
          message="No recipes match your filters."
          action={() => { setSearch(''); setCatFilter('All'); setDietFilter('All'); setFavsOnly(false); setMineOnly(false) }}
          actionLabel="Clear filters"
        />
      )}

      {detail && (() => {
        const protKcal = detail.protein * 4
        const fatKcal = detail.fat * 9
        const carbKcal = detail.carbs * 4
        const totalMacroKcal = protKcal + fatKcal + carbKcal || 1
        const pPct = Math.round((protKcal / totalMacroKcal) * 100)
        const fPct = Math.round((fatKcal / totalMacroKcal) * 100)
        const cPct = 100 - pPct - fPct
        const pieGradient = `conic-gradient(#3b82f6 0% ${pPct}%, #ef4444 ${pPct}% ${pPct + fPct}%, #22c55e ${pPct + fPct}% 100%)`

        // Per-100g: Case 2 (servingG) or Case 1 (auto-sum from ingredient weights)
        const dServings = detail.servings ?? 1
        let perServingG: number | null = detail.servingG ?? null
        let isEstimated = false
        if (!perServingG && detail.ingredients?.length) {
          const totalG = detail.ingredients.reduce<number>((sum, ing) => {
            if (!isFinite(sum)) return NaN
            const prod = items.find(i => i.id === ing.productId)
            if (!prod) return NaN
            if (ing.unit === 'g' || ing.unit === 'ml') return sum + ing.amount
            const altU = prod.altUnits?.find(a => a.unit === ing.unit)
            if (altU) return sum + ing.amount * altU.gramsPerUnit
            if (prod.servingG != null && prod.servingAmount) return sum + ing.amount * (prod.servingG / prod.servingAmount)
            return NaN
          }, 0)
          if (isFinite(totalG) && totalG > 0) { perServingG = totalG / dServings; isEstimated = true }
        }
        const factor100g = perServingG ? 100 / perServingG : null

        return (
          <Modal title={detail.name} onClose={() => setDetail(null)} wide>
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn('text-sm px-3 py-1 rounded-full font-medium', CATEGORY_COLOURS[detail.category] ?? 'bg-gray-100 text-gray-600')}>{detail.category}</span>
                <span className="text-sm text-gray-400">{dServings} serving{dServings !== 1 ? 's' : ''}</span>
                {detail.prepTime && <span className="text-sm text-gray-400">· {detail.prepTime}</span>}
                {detail.isUserAdded && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Your recipe</span>}
              </div>
              <div className="flex items-center gap-5">
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: pieGradient, flexShrink: 0 }} />
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /><span className="text-gray-600">Protein: {fmtMacro(detail.protein)} g ({pPct}%)</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /><span className="text-gray-600">Fat: {fmtMacro(detail.fat)} g ({fPct}%)</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /><span className="text-gray-600">Carbs: {fmtMacro(detail.carbs)} g ({cPct}%)</span></div>
                  {detail.fiber !== undefined && <div className="text-xs text-gray-400">Fiber: {fmtMacro(detail.fiber)} g</div>}
                  <div className="font-semibold text-gray-900">
                    {detail.kcal} kcal / serving
                    {factor100g !== null && (
                      <span className="ml-2 text-xs font-normal text-gray-400">
                        · {Math.round(detail.kcal * factor100g)} kcal / 100 g{isEstimated ? ' (est.)' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {factor100g !== null && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Nutrition reference{isEstimated ? ' · weight estimated from ingredients' : ''}
                  </h3>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500">
                        <th className="text-left px-3 py-2 font-medium">Amount</th>
                        <th className="text-right px-3 py-2 font-medium">kcal</th>
                        <th className="text-right px-3 py-2 font-medium">Protein</th>
                        <th className="text-right px-3 py-2 font-medium">Fat</th>
                        <th className="text-right px-3 py-2 font-medium">Carbs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[{ label: '1 serving', f: 1 }, { label: '100 g', f: factor100g }].map(({ label, f }) => (
                        <tr key={label} className="border-t border-gray-100">
                          <td className="px-3 py-2 text-gray-700">{label}</td>
                          <td className="px-3 py-2 text-right text-gray-700">{Math.round(detail.kcal * f)}</td>
                          <td className="px-3 py-2 text-right text-gray-600">{fmtMacro(detail.protein * f)} g</td>
                          <td className="px-3 py-2 text-right text-gray-600">{fmtMacro(detail.fat * f)} g</td>
                          <td className="px-3 py-2 text-right text-gray-600">{fmtMacro(detail.carbs * f)} g</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
              {detail.instructions && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Instructions</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{detail.instructions}</p>
                </div>
              )}
              {detail.dietTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {detail.dietTags.map(t => <span key={t} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">{DIET_LABELS[t] ?? t}</span>)}
                </div>
              )}
            </div>
          </Modal>
        )
      })()}

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
  const [prepTime, setPrepTime] = useState(item?.prepTime ?? '')
  const [recipeServingG, setRecipeServingG] = useState(String(item?.servingG ?? ''))
  const [instructions, setInstructions] = useState(item?.instructions ?? '')
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
      prepTime: prepTime || undefined,
      instructions: instructions || undefined,
      servingG: recipeServingG ? Number(recipeServingG) : undefined,
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
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prep time (optional)">
            <input value={prepTime} onChange={e => setPrepTime(e.target.value)} placeholder="e.g. 30 min" className={inputCls} />
          </Field>
          <Field label="Grams per serving (optional)">
            <input type="number" min="0" value={recipeServingG} onChange={e => setRecipeServingG(e.target.value)} placeholder="e.g. 250" className={inputCls} />
          </Field>
        </div>
        <Field label="Instructions (optional)">
          <textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={3} placeholder="Step-by-step instructions…" className={cn(inputCls, 'resize-y')} />
        </Field>

        <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 space-y-2">
          <div className="grid grid-cols-4 gap-2">
            {[['kcal', Math.round(nutrition.kcal)], ['Protein', `${fmtMacro(nutrition.protein)}g`], ['Fat', `${fmtMacro(nutrition.fat)}g`], ['Carbs', `${fmtMacro(nutrition.carbs)}g`]].map(([l, v]) => (
              <div key={String(l)} className="text-center">
                <p className="text-sm font-bold text-gray-800">{v}</p>
                <p className="text-xs text-gray-400">{l} / recipe</p>
              </div>
            ))}
          </div>
          {recipeServingG && Number(recipeServingG) > 0 && Number(servings) > 0 && (() => {
            const totalG = Number(recipeServingG) * Number(servings)
            return (
              <div className="border-t border-teal-200 pt-2 grid grid-cols-4 gap-2">
                {[
                  ['kcal', Math.round(nutrition.kcal / totalG * 100)],
                  ['Protein', `${fmtMacro(nutrition.protein / totalG * 100)}g`],
                  ['Fat', `${fmtMacro(nutrition.fat / totalG * 100)}g`],
                  ['Carbs', `${fmtMacro(nutrition.carbs / totalG * 100)}g`],
                ].map(([l, v]) => (
                  <div key={String(l)} className="text-center">
                    <p className="text-sm font-bold text-teal-700">{v}</p>
                    <p className="text-xs text-gray-400">{l} / 100 g</p>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>

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

function calcRowMacros(row: AnalyserRow, allItems: Item[]) {
  const item = allItems.find(p => p.id === row.productId)
  if (!item) return { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, grams: 0 }
  if (item.kind === 'recipe') {
    const servings = item.servings ?? 1
    const ratio = row.quantity / servings
    return {
      kcal: item.kcal * ratio,
      protein: item.protein * ratio,
      fat: item.fat * ratio,
      carbs: item.carbs * ratio,
      fiber: 0,
      grams: row.quantity * (item.servingG ?? 100),
    }
  }
  const altUnit = item.altUnits?.find(a => a.unit === row.unit)
  const ratio = row.unit === 'serving'
    ? row.quantity
    : altUnit
      ? row.quantity * altUnit.gramsPerUnit / (item.servingAmount ?? 100)
      : row.quantity / (item.servingAmount ?? 100)
  const grams = row.unit === 'serving'
    ? row.quantity * (item.servingG ?? item.servingAmount ?? 100)
    : row.unit === 'g' || row.unit === 'ml'
      ? row.quantity
      : altUnit
        ? row.quantity * altUnit.gramsPerUnit
        : row.quantity * (item.servingG ? item.servingG / (item.servingAmount ?? 1) : 1)
  return {
    kcal: item.kcal * ratio,
    protein: item.protein * ratio,
    fat: item.fat * ratio,
    carbs: item.carbs * ratio,
    fiber: (item.fiber ?? 0) * ratio,
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
  const allSearchableItems = items

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
        return already ? prev : [...prev, { id: uid(), itemId: productId, day: 'Mon', slot: 'Lunch', servings: 1, weekOffset: 0, autoAdded: true }]
      })
    }
    if (isRemoving && flag === 'thisWeek') {
      const hasManual = assignments.some(a => a.itemId === productId && !a.autoAdded)
      if (hasManual && !confirm(`"${item.name}" has planner assignments. Remove them?`)) return
      setAssignments(prev => prev.filter(a => a.itemId !== productId))
    }
    setItems(prev => prev.map(i => i.id === productId ? { ...i, weekFlags: { ...i.weekFlags, [flag]: !i.weekFlags[flag] } } : i))
  }

  const totals = rows.reduce((acc, row) => {
    const m = calcRowMacros(row, allSearchableItems)
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
                const selItem = allSearchableItems.find(p => p.id === row.productId)
                const isRecipe = selItem?.kind === 'recipe'
                const m = selItem ? calcRowMacros(row, allSearchableItems) : null
                const search = searches[row.id] ?? ''
                const matched = search ? allSearchableItems.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8) : []
                return (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                    <td className="px-3 py-2 relative">
                      <div className="flex items-center gap-1">
                        {isRecipe && <span className="text-xs bg-purple-100 text-purple-700 px-1 rounded flex-shrink-0">recipe</span>}
                        <input
                          value={selItem ? selItem.name : search}
                          onChange={e => {
                            setSearches(prev => ({ ...prev, [row.id]: e.target.value }))
                            if (selItem) updateRow(row.id, { productId: '' })
                          }}
                          placeholder="Search product or recipe…"
                          className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-teal-400"
                        />
                      </div>
                      {!selItem && search && matched.length > 0 && (
                        <div className="absolute top-full left-3 right-3 bg-white border border-gray-200 rounded-xl shadow-lg z-20 mt-0.5 max-h-40 overflow-y-auto">
                          {matched.map(p => (
                            <button key={p.id} type="button"
                              onMouseDown={() => {
                                const unit = p.kind === 'recipe' ? 'serving' : (p.unit ?? 'g')
                                const qty = p.kind === 'recipe' ? 1 : 100
                                updateRow(row.id, { productId: p.id, unit, quantity: qty })
                                setSearches(prev => ({ ...prev, [row.id]: '' }))
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 cursor-pointer flex items-center gap-2">
                              {p.kind === 'recipe' && <span className="text-xs bg-purple-100 text-purple-600 px-1 rounded flex-shrink-0">recipe</span>}
                              <span>{p.name}</span>
                              <span className="text-gray-400 ml-auto">{p.kcal} kcal / {p.kind === 'recipe' ? `1 srv` : p.servingLabel}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isRecipe ? (
                        <select value={row.unit} onChange={e => updateRow(row.id, { unit: e.target.value })}
                          className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none focus:border-teal-400">
                          {['serving','g'].map(u => <option key={u}>{u}</option>)}
                        </select>
                      ) : (
                        <select value={row.unit} onChange={e => updateRow(row.id, { unit: e.target.value })}
                          className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none focus:border-teal-400">
                          {selItem
                            ? [...new Set([selItem.unit ?? 'g', ...(selItem.altUnits?.map(a => a.unit) ?? []), 'serving'])].map(u => <option key={u}>{u}</option>)
                            : ['g','ml','pc','tbsp','tsp','serving'].map(u => <option key={u}>{u}</option>)
                          }
                        </select>
                      )}
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
                      {selItem && (
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => toggleWeekFlag(selItem.id, 'thisWeek')}
                            className={cn('text-xs px-1.5 py-0.5 rounded font-medium cursor-pointer', selItem.weekFlags.thisWeek ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
                            TW
                          </button>
                          <button onClick={() => toggleWeekFlag(selItem.id, 'nextWeek')}
                            className={cn('text-xs px-1.5 py-0.5 rounded font-medium cursor-pointer', selItem.weekFlags.nextWeek ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
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

function DietsView({ diets, items }: { diets: Diet[]; items: Item[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [selectedDietId, setSelectedDietId] = useState<string | null>(null)

  if (selectedDietId) {
    const diet = diets.find(d => d.id === selectedDietId)!
    const dietProducts = items.filter(i => i.kind === 'product' && i.dietTags.includes(selectedDietId))
    const dietRecipes = items.filter(i => i.kind === 'recipe' && i.dietTags.includes(selectedDietId))
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedDietId(null)} className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-800 cursor-pointer font-medium">
          <ChevronLeft size={14} /> Back to diets
        </button>
        <h2 className="text-base font-semibold text-gray-900">{diet.name}</h2>
        {dietProducts.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Products ({dietProducts.length})</h3>
            <div className="space-y-1">
              {dietProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-800">{p.name}</span>
                  <span className="text-xs text-gray-400">{p.kcal} kcal / {p.servingLabel ?? '100g'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {dietRecipes.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Recipes ({dietRecipes.length})</h3>
            <div className="space-y-1">
              {dietRecipes.map(r => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-800">{r.name}</span>
                  <span className="text-xs text-gray-400">{r.kcal} kcal / srv</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {dietProducts.length === 0 && dietRecipes.length === 0 && (
          <EmptyState icon={<Leaf size={32} />} message={`No products or recipes tagged with ${diet.name}`} />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{diets.length} nutrition patterns are supported. Click a card to explore products and recipes.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {diets.map(diet => (
          <article
            key={diet.id}
            className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedDietId(diet.id)}
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold text-gray-900 text-sm">{diet.name}</h2>
              {diet.macroGuidance && (
                <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">Macros</span>
              )}
            </div>
            <p className={cn('text-xs text-gray-500 leading-relaxed', expanded !== diet.id && 'line-clamp-2')}>
              {diet.description}
            </p>
            <button onClick={e => { e.stopPropagation(); setExpanded(expanded === diet.id ? null : diet.id) }} className="text-xs text-teal-600 hover:text-teal-800 cursor-pointer text-left w-fit">
              {expanded === diet.id ? 'Show less ↑' : 'Show more ↓'}
            </button>
            {diet.macroGuidance ? (
              <div className="space-y-2">
                <MacroPiePct proteinPct={diet.macroGuidance.proteinPct} fatPct={diet.macroGuidance.fatPct} carbsPct={diet.macroGuidance.carbsPct} />
                <div className="flex gap-2">
                  {[['Protein', diet.macroGuidance.proteinPct, 'bg-blue-50 text-blue-700'], ['Fat', diet.macroGuidance.fatPct, 'bg-red-50 text-red-600'], ['Carbs', diet.macroGuidance.carbsPct, 'bg-green-50 text-green-700']].map(([l, v, c]) => (
                    <div key={String(l)} className={cn('flex-1 rounded-xl px-2 py-2 text-center', String(c))}>
                      <p className="text-sm font-bold">{v}<span className="text-xs">%</span></p>
                      <p className="text-xs opacity-70">{l}</p>
                    </div>
                  ))}
                </div>
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
  day, slot, slotAssignments, items, upsertAssignment, removeAssignment, onLog, date,
}: {
  day: Day; slot: Slot; slotAssignments: Assignment[]; items: Item[]
  upsertAssignment: (itemId: string, day: Day, slot: Slot, servings: number) => void
  removeAssignment: (id: string) => void
  onLog?: (item: Item, servings: number, slot: Slot, date: string) => void
  date?: string
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
                {onLog && (() => { const it = items.find(i => i.id === a.itemId); return it ? (
                  <button onClick={() => onLog(it, a.servings, slot, date ?? '')} className="text-xs text-teal-600 hover:text-teal-800 cursor-pointer ml-1 opacity-0 group-hover:opacity-100" title="Log to tracking">+Log</button>
                ) : null })()}
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
            className="w-full text-xs border border-teal-400 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-300"
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
              <th className="text-center px-2 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-14">Unit</th>
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
                    <td colSpan={10} className="px-4 py-2">
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
                        <p className="text-gray-400 text-xs mt-0.5">{item.kcal} kcal/srv</p>
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        {gps != null ? (
                          <button
                            onClick={() => setGramsMode(prev => ({ ...prev, [rowKey]: !prev[rowKey] }))}
                            className={cn('text-xs px-1.5 py-0.5 rounded border cursor-pointer', inGrams ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-400 border-gray-200 hover:border-teal-400')}
                          >
                            {inGrams ? 'g' : 'srv'}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300">srv</span>
                        )}
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
                    <td colSpan={10} className="px-4 py-1.5">
                      {addingSlot === slot ? (
                        <div className="relative">
                          <input
                            autoFocus
                            value={addSearch}
                            onChange={e => setAddSearch(e.target.value)}
                            onBlur={() => { if (!addSearch) setAddingSlot(null) }}
                            placeholder={`Add item to ${slot}…`}
                            className="w-full text-xs border border-teal-400 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-300"
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
  items, assignments, days, dates, upsertAssignment, setAssignments, onLog, calorieTarget, onLogDay,
}: {
  items: Item[]; assignments: Assignment[]; days: Day[]; dates: Date[]
  upsertAssignment: (itemId: string, day: Day, slot: Slot, servings: number) => void
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>
  onLog?: (item: Item, servings: number, slot: Slot, date: string) => void
  calorieTarget?: number
  onLogDay?: (day: Day, date: Date) => void
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
                <div className="flex items-center gap-1.5">
                  {isToday && <span className="text-xs bg-teal-600 text-white px-2 py-0.5 rounded-full">Today</span>}
                  {onLogDay && dayA.length > 0 && (
                    <button onClick={() => onLogDay(day, dates[i])} className="text-xs text-teal-600 hover:text-teal-700 cursor-pointer border border-teal-200 rounded-full px-2 py-0.5 hover:bg-teal-50">
                      Log day
                    </button>
                  )}
                </div>
              </div>
              {dayA.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-1.5 items-center">
                  <span className="text-xs text-gray-700 font-semibold">{Math.round(totalKcal)} kcal</span>
                  {(calorieTarget ?? 0) > 0 && (
                    <span className="text-xs text-teal-600 font-medium">{Math.round(totalKcal / calorieTarget! * 100)}%</span>
                  )}
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
                  onLog={onLog}
                  date={isoDate(dates[i])}
                />
              ))}
            </div>
          </article>
        )
      })}
    </div>
  )
}

function CalorieMacroRing({
  kcal, target, protein, fat, carbs, size = 64,
}: {
  kcal: number; target?: number; protein: number; fat: number; carbs: number; size?: number
}) {
  const corridor = target ? { low: target - 150, high: target + 150 } : null
  const pct = target ? Math.min(100, Math.round(kcal / target * 100)) : 0
  const ringColor = !corridor ? '#d1d5db'
    : kcal > corridor.high ? '#ef4444'
    : kcal >= corridor.low ? '#22c55e'
    : '#f59e0b'
  const ringGradient = target
    ? `conic-gradient(${ringColor} 0% ${pct}%, #e5e7eb ${pct}% 100%)`
    : '#e5e7eb'

  const pKcal = protein * 4, fKcal = fat * 9, cKcal = carbs * 4
  const macroTotal = pKcal + fKcal + cKcal
  const pPct = macroTotal > 0 ? pKcal / macroTotal * 100 : 0
  const fPct = macroTotal > 0 ? fKcal / macroTotal * 100 : 0
  const macroGradient = macroTotal > 0
    ? `conic-gradient(#3b82f6 0% ${pPct.toFixed(1)}%, #f97316 ${pPct.toFixed(1)}% ${(pPct + fPct).toFixed(1)}%, #22c55e ${(pPct + fPct).toFixed(1)}% 100%)`
    : '#e5e7eb'

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }} title={target ? `${pct}% of ${target} kcal target` : undefined}>
      <div className="absolute inset-0 rounded-full" style={{ background: ringGradient }} />
      <div className="absolute rounded-full bg-white" style={{ inset: `${size * 0.06}px` }} />
      <div className="absolute rounded-full" style={{ inset: `${size * 0.11}px`, background: macroGradient }} />
      <div className="absolute rounded-full bg-white flex items-center justify-center" style={{ inset: `${size * 0.24}px` }}>
        <span className="text-[9px] font-bold text-gray-700 leading-none">{target ? `${pct}%` : '—'}</span>
      </div>
    </div>
  )
}

function DateScroller({
  days, dates, selectedIdx, rangeSize, onSelect, today,
}: {
  days: Day[]; dates: Date[]; selectedIdx: number; rangeSize: number
  onSelect: (idx: number) => void; today: Date
}) {
  const maxIdx = days.length - rangeSize
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5" role="tablist" aria-label="Select date range">
      {days.map((day, i) => {
        const isToday = dates[i].toDateString() === today.toDateString()
        const isSelected = i >= selectedIdx && i < selectedIdx + rangeSize
        return (
          <button
            key={day}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect(Math.min(i, maxIdx))}
            className={cn(
              'flex-shrink-0 flex flex-col items-center justify-center w-14 py-1.5 rounded-xl border text-xs cursor-pointer transition-colors',
              isSelected ? 'bg-teal-600 border-teal-600 text-white'
                : isToday ? 'border-teal-300 text-teal-700 bg-teal-50 hover:bg-teal-100'
                : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50',
            )}
          >
            <span className="font-medium">{day}</span>
            <span className={cn('text-sm font-bold', isSelected ? 'text-white' : 'text-gray-800')}>{dates[i].getDate()}</span>
          </button>
        )
      })}
    </div>
  )
}

function GridSlotCell({
  day, date, slot, isToday, assignments, items, onRemove, onAdd, onMove,
}: {
  day: Day; date: Date; slot: Slot; isToday: boolean
  assignments: Assignment[]; items: Item[]
  onRemove: (id: string) => void
  onAdd: (itemId: string) => void
  onMove: (assignmentId: string) => void
}) {
  const [adding, setAdding] = useState(false)
  const [search, setSearch] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const matched = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const type = e.dataTransfer.getData('drag-type')
    if (type === 'summary') {
      const name = e.dataTransfer.getData('item-name')
      if (name) { setSearch(name); setAdding(true) }
    } else if (type === 'cell') {
      const aid = e.dataTransfer.getData('assignment-id')
      if (aid) onMove(aid)
    }
  }

  return (
    <div
      className={cn('relative border-r border-gray-50 last:border-r-0 p-1.5 min-h-16 group transition-colors', isToday && 'bg-teal-50/40', dragOver && 'bg-teal-50 ring-1 ring-inset ring-teal-400')}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {assignments.map(a => {
        const item = items.find(x => x.id === a.itemId)
        if (!item) return null
        return (
          <div
            key={a.id}
            draggable
            onDragStart={e => {
              e.dataTransfer.setData('drag-type', 'cell')
              e.dataTransfer.setData('assignment-id', a.id)
              e.dataTransfer.effectAllowed = 'move'
            }}
            className="flex items-center gap-1 mb-1 bg-teal-50 border border-teal-100 rounded-lg px-1.5 py-1 cursor-grab active:cursor-grabbing group/chip"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-700 truncate leading-tight">{item.name}</p>
              <p className="text-xs text-gray-400">{a.servings} srv · {Math.round(item.kcal * a.servings)} kcal</p>
            </div>
            <button onClick={() => onRemove(a.id)} aria-label="Remove" className="text-gray-300 hover:text-red-500 cursor-pointer opacity-0 group-hover/chip:opacity-100 flex-shrink-0"><X size={9} /></button>
          </div>
        )
      })}
      {adding ? (
        <div className="relative">
          <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
            onBlur={() => { if (!search) setAdding(false) }}
            placeholder="Search…"
            className="w-full text-xs border border-teal-400 rounded-lg px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-teal-300" />
          {search && matched.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 mt-0.5 max-h-32 overflow-y-auto min-w-32">
              {matched.map(i => (
                <button key={i.id} type="button"
                  onMouseDown={() => { onAdd(i.id); setSearch(''); setAdding(false) }}
                  className="w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 cursor-pointer">
                  {i.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button onClick={() => setAdding(true)} aria-label={`Add item to ${day} ${slot}`} className="text-xs text-gray-300 hover:text-teal-500 cursor-pointer opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
          <Plus size={9} /> Add
        </button>
      )}
    </div>
  )
}

function CalendarView({
  items, assignments, days, dates, upsertAssignment, setAssignments, onLog, profile, subView,
}: {
  items: Item[]; assignments: Assignment[]; days: Day[]; dates: Date[]
  upsertAssignment: (itemId: string, day: Day, slot: Slot, servings: number) => void
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>
  onLog?: (item: Item, servings: number, slot: Slot, date: string) => void
  profile?: Profile
  subView: '2days' | 'grid' | 'month'
}) {
  const [monthOffset, setMonthOffset] = useState(0)
  const [selectedDayIdx, setSelectedDayIdx] = useState(0)
  const [summaryAddSlot, setSummaryAddSlot] = useState<Slot | null>(null)
  const [summaryAddQuery, setSummaryAddQuery] = useState('')
  const today = new Date()

  // Plan summary for visible date range
  const visibleDays = subView === '2days' ? days.slice(selectedDayIdx, selectedDayIdx + 2)
    : days

  const calPlanSummary = useMemo(() => {
    const visible = subView === 'month' ? assignments : assignments.filter(a => visibleDays.includes(a.day))
    const grouped: Record<Slot, { id: string; name: string; servings: number; kcal: number }[]> = {
      Breakfast: [], Lunch: [], Dinner: [], Snacks: [],
    }
    visible.forEach(a => {
      const item = items.find(i => i.id === a.itemId)
      if (!item) return
      const slot = a.slot ?? 'Lunch'
      const ex = grouped[slot].find(x => x.id === a.itemId)
      if (ex) { ex.servings += a.servings; ex.kcal += item.kcal * a.servings }
      else grouped[slot].push({ id: a.itemId, name: item.name, servings: a.servings, kcal: item.kcal * a.servings })
    })
    return grouped
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignments, items, subView, selectedDayIdx])

  const PlanSummaryBar = () => {
    const totalItems = SLOTS.reduce((s, slot) => s + calPlanSummary[slot].length, 0)
    const summaryItems = summaryAddQuery.length > 0
      ? items.filter(i => i.name.toLowerCase().includes(summaryAddQuery.toLowerCase())).slice(0, 8)
      : []
    if (totalItems === 0 && summaryAddSlot === null) return null
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Plan summary</h3>
        <div className="grid grid-cols-4 gap-2">
          {SLOTS.map(slot => (
            <div key={slot}>
              <div className="flex items-center justify-between mb-1.5">
                <p className={`text-xs font-semibold ${SLOT_COLOURS[slot].split(' ')[1]}`}>{slot}</p>
                <button
                  onClick={() => { setSummaryAddSlot(summaryAddSlot === slot ? null : slot); setSummaryAddQuery('') }}
                  className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-teal-600 cursor-pointer"
                  aria-label={`Add item to ${slot}`}
                >
                  <Plus size={12} />
                </button>
              </div>
              {summaryAddSlot === slot && (
                <div className="mb-1.5 relative">
                  <input
                    autoFocus
                    type="text"
                    value={summaryAddQuery}
                    onChange={e => setSummaryAddQuery(e.target.value)}
                    placeholder="Search…"
                    className="w-full text-xs border border-teal-300 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-teal-400"
                  />
                  {summaryItems.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-0.5 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {summaryItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => {
                            const targetDay = visibleDays[0] as Day
                            upsertAssignment(item.id, targetDay, slot, 1)
                            setSummaryAddSlot(null)
                            setSummaryAddQuery('')
                          }}
                          className="w-full text-left px-2 py-1.5 text-xs hover:bg-teal-50 border-b border-gray-50 last:border-0 cursor-pointer"
                        >
                          <span className="font-medium text-gray-800">{item.name}</span>
                          <span className="text-gray-400 ml-1">{item.kcal} kcal</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-1">
                {calPlanSummary[slot].length === 0 ? (
                  <p className="text-xs text-gray-300 italic">—</p>
                ) : calPlanSummary[slot].map(s => (
                  <div
                    key={s.id}
                    draggable
                    onDragStart={e => {
                      e.dataTransfer.setData('drag-type', 'summary')
                      e.dataTransfer.setData('item-id', s.id)
                      e.dataTransfer.setData('item-name', s.name)
                      e.dataTransfer.effectAllowed = 'copy'
                    }}
                    className="text-xs bg-teal-50 text-teal-700 border border-teal-100 rounded-lg px-2 py-1.5 cursor-grab active:cursor-grabbing select-none"
                  >
                    <p className="font-medium truncate">{s.name}</p>
                    <p className="text-teal-500 mt-0.5">{s.servings} srv · {Math.round(s.kcal)} kcal</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (subView === 'month') {
    const baseMonth = new Date(dates[0].getFullYear(), dates[0].getMonth() + monthOffset, 1)
    const firstDay = new Date(baseMonth.getFullYear(), baseMonth.getMonth(), 1)
    const dow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
    const gridStart = new Date(firstDay)
    gridStart.setDate(firstDay.getDate() - dow)
    const gridDays = Array.from({ length: 42 }, (_, i) => { const d = new Date(gridStart); d.setDate(gridStart.getDate() + i); return d })

    return (
      <div className="space-y-3">
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
          <span className="text-xs text-gray-400 ml-1">Read-only overview — switch to Grid or 2 Days to edit a day</span>
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

  if (subView === '2days') {
    const maxIdx = days.length - 2
    const visIdx = [selectedDayIdx, Math.min(selectedDayIdx + 1, days.length - 1)]
    return (
      <div className="space-y-3">
        <PlanSummaryBar />
        <DateScroller days={days} dates={dates} selectedIdx={selectedDayIdx} rangeSize={2}
          onSelect={i => setSelectedDayIdx(Math.min(i, maxIdx))} today={today} />
        <div className="grid grid-cols-2 gap-3">
          {visIdx.map(idx => {
            const d = days[idx]
            const dt = dates[idx]
            return (
              <CalendarWeekCell key={d} day={d} date={dt}
                isToday={dt.toDateString() === today.toDateString()}
                assignments={assignments.filter(a => a.day === d)} items={items}
                onRemove={id => setAssignments(prev => prev.filter(x => x.id !== id))}
                onAdd={(itemId, slot) => upsertAssignment(itemId, d, slot, 1)}
                onUpsert={(itemId, slot, servings) => upsertAssignment(itemId, d, slot, servings)}
                onMove={aid => setAssignments(prev => prev.map(a => a.id === aid ? { ...a, day: d } : a))}
                onLog={onLog}
                profile={profile}
                wide
              />
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <PlanSummaryBar />
      <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[88px_repeat(7,1fr)] border-b border-gray-100 bg-gray-50">
            <div className="py-2 px-2 text-xs font-semibold text-gray-400 self-center">Meal</div>
            {days.map((day, i) => {
              const isToday = dates[i].toDateString() === today.toDateString()
              const dayA = assignments.filter(a => a.day === day)
              const dayTotals = dayA.reduce((acc, a) => {
                const it = items.find(x => x.id === a.itemId)
                if (!it) return acc
                acc.kcal += it.kcal * a.servings
                acc.protein += it.protein * a.servings
                acc.fat += it.fat * a.servings
                acc.carbs += it.carbs * a.servings
                return acc
              }, { kcal: 0, protein: 0, fat: 0, carbs: 0 })
              const dayCorridor = profile?.calorieTarget ? { low: profile.calorieTarget - 150, high: profile.calorieTarget + 150 } : null
              const dayKcalCls = dayCorridor
                ? (dayTotals.kcal < dayCorridor.low ? 'text-amber-600' : dayTotals.kcal > dayCorridor.high ? 'text-red-600' : 'text-green-600')
                : 'text-gray-600'
              return (
                <div key={day} className="py-1.5 px-1 flex flex-col items-center gap-1">
                  <span className={cn('text-xs font-semibold', isToday ? 'text-teal-700' : 'text-gray-500')}>
                    {day} <span className="text-gray-400 font-normal">{dates[i].getDate()}</span>
                  </span>
                  {dayTotals.kcal > 0 && (
                    <div className="flex items-center gap-1.5">
                      <CalorieMacroRing kcal={dayTotals.kcal} target={profile?.calorieTarget} protein={dayTotals.protein} fat={dayTotals.fat} carbs={dayTotals.carbs} size={40} />
                      <span className={cn('text-xs font-semibold', dayKcalCls)}>{Math.round(dayTotals.kcal)}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {SLOTS.map(slot => (
            <div key={slot} className="grid grid-cols-[88px_repeat(7,1fr)] border-b border-gray-50 last:border-b-0">
              <div className={cn('flex items-center px-2 py-1.5 text-xs font-semibold uppercase tracking-wide border-r border-gray-50', SLOT_COLOURS[slot].split(' ')[2])}>
                {slot}
              </div>
              {days.map((day, i) => (
                <GridSlotCell
                  key={day}
                  day={day} date={dates[i]} slot={slot}
                  isToday={dates[i].toDateString() === today.toDateString()}
                  assignments={assignments.filter(a => a.day === day && a.slot === slot)}
                  items={items}
                  onRemove={id => setAssignments(prev => prev.filter(x => x.id !== id))}
                  onAdd={itemId => upsertAssignment(itemId, day, slot, 1)}
                  onMove={aid => setAssignments(prev => prev.map(a => a.id === aid ? { ...a, day, slot } : a))}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CalendarWeekCell({
  day, date, isToday, assignments, items, onRemove, onAdd, onUpsert, onMove, onLog, profile, wide,
}: {
  day: Day; date: Date; isToday: boolean
  assignments: Assignment[]; items: Item[]
  onRemove: (id: string) => void
  onAdd: (itemId: string, slot: Slot) => void
  onUpsert?: (itemId: string, slot: Slot, servings: number) => void
  onMove?: (assignmentId: string) => void
  onLog?: (item: Item, servings: number, slot: Slot, date: string) => void
  profile?: Profile
  wide?: boolean
}) {
  const [addingSlot, setAddingSlot] = useState<Slot | null>(null)
  const [search, setSearch] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const matched = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5)

  const totalKcal = assignments.reduce((s, a) => { const it = items.find(x => x.id === a.itemId); return s + (it ? it.kcal * a.servings : 0) }, 0)
  const totalProtein = assignments.reduce((s, a) => { const it = items.find(x => x.id === a.itemId); return s + (it ? it.protein * a.servings : 0) }, 0)
  const totalFat = assignments.reduce((s, a) => { const it = items.find(x => x.id === a.itemId); return s + (it ? it.fat * a.servings : 0) }, 0)
  const totalCarbs = assignments.reduce((s, a) => { const it = items.find(x => x.id === a.itemId); return s + (it ? it.carbs * a.servings : 0) }, 0)
  const corridor = profile?.calorieTarget ? { low: profile.calorieTarget - 150, high: profile.calorieTarget + 150 } : null
  const kcalCls = corridor
    ? (totalKcal < corridor.low ? 'font-semibold text-amber-600' : totalKcal > corridor.high ? 'font-semibold text-red-600' : 'font-semibold text-green-600')
    : 'font-semibold text-gray-700'

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const type = e.dataTransfer.getData('drag-type')
    if (type === 'summary') {
      const name = e.dataTransfer.getData('item-name')
      if (name) { setSearch(name); setAddingSlot('Lunch') }
    } else if (type === 'cell') {
      const aid = e.dataTransfer.getData('assignment-id')
      if (aid && onMove) onMove(aid)
    }
  }

  return (
    <div
      className={cn('bg-white rounded-xl border overflow-hidden transition-colors', isToday ? 'border-teal-400' : 'border-gray-200', dragOver && 'bg-teal-50 border-teal-500')}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Day header */}
      <div className={cn('flex items-center justify-between px-2 py-1.5 border-b', isToday ? 'bg-teal-50 border-teal-100' : 'bg-gray-50 border-gray-100')}>
        <span className={cn('inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold', isToday ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700')}>
          {date.getDate()}
        </span>
        <span className="text-xs text-gray-400 font-medium">{day}</span>
      </div>
      {/* Nutrition strip */}
      {assignments.length > 0 && (wide ? (
        <div className="px-3 py-2.5 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
          <CalorieMacroRing kcal={totalKcal} target={profile?.calorieTarget} protein={totalProtein} fat={totalFat} carbs={totalCarbs} size={56} />
          <div className="text-xs space-y-1 flex-1 min-w-0">
            <p className={kcalCls}>{Math.round(totalKcal)} kcal{corridor ? ` of ${profile!.calorieTarget}` : ''}</p>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block flex-shrink-0" /><span className="text-gray-600">{fmtMacro(totalProtein)}g protein</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block flex-shrink-0" /><span className="text-gray-600">{fmtMacro(totalFat)}g fat</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block flex-shrink-0" /><span className="text-gray-600">{fmtMacro(totalCarbs)}g carbs</span></div>
          </div>
        </div>
      ) : (
        <div className="px-2 py-1.5 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2">
          <CalorieMacroRing kcal={totalKcal} target={profile?.calorieTarget} protein={totalProtein} fat={totalFat} carbs={totalCarbs} size={32} />
          <div className="text-[11px] leading-tight min-w-0">
            <p className={kcalCls}>{Math.round(totalKcal)} kcal</p>
            <div className="flex gap-1.5">
              <span className="text-blue-500">{fmtMacro(totalProtein)}P</span>
              <span className="text-orange-400">{fmtMacro(totalFat)}F</span>
              <span className="text-green-500">{fmtMacro(totalCarbs)}C</span>
            </div>
          </div>
        </div>
      ))}
      {/* Slots */}
      <div>
        {SLOTS.map(slot => {
          const slotA = assignments.filter(a => a.slot === slot)
          const isAddingHere = addingSlot === slot
          return (
            <div key={slot} className="border-b border-gray-50 last:border-b-0 px-2 pt-1.5 pb-1">
              <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${SLOT_COLOURS[slot].split(' ')[1]}`}>{slot}</p>
              {slotA.map(a => {
                const item = items.find(x => x.id === a.itemId)
                return item ? (
                  <div
                    key={a.id}
                    draggable
                    onDragStart={e => {
                      e.dataTransfer.setData('drag-type', 'cell')
                      e.dataTransfer.setData('assignment-id', a.id)
                      e.dataTransfer.effectAllowed = 'move'
                      e.stopPropagation()
                    }}
                    className="flex items-center gap-1 mb-1 group cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 truncate leading-tight">{item.name}</p>
                      <p className="text-xs text-gray-400">{Math.round(item.kcal * a.servings)} kcal</p>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100">
                      {onUpsert && <>
                        <button onClick={() => onUpsert(item.id, slot, Math.max(0.5, a.servings - 0.5))} aria-label="Decrease servings" className="w-4 h-4 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer flex items-center justify-center"><Minus size={7} /></button>
                        <span className="text-xs font-mono w-4 text-center">{a.servings}</span>
                        <button onClick={() => onUpsert(item.id, slot, a.servings + 0.5)} aria-label="Increase servings" className="w-4 h-4 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer flex items-center justify-center"><Plus size={7} /></button>
                      </>}
                      {onLog && <button onClick={e => { e.stopPropagation(); onLog(item, a.servings, slot, isoDate(date)) }} className="text-xs text-teal-600 hover:text-teal-800 cursor-pointer" title="Log to tracking">+Log</button>}
                      <button onClick={() => onRemove(a.id)} className="text-gray-300 hover:text-red-500 cursor-pointer"><X size={9} /></button>
                    </div>
                  </div>
                ) : null
              })}
              {isAddingHere ? (
                <div className="relative mb-1">
                  <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                    onBlur={() => { if (!search) setAddingSlot(null) }}
                    placeholder="Search…"
                    className="w-full text-xs border border-teal-400 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-teal-300" />
                  {search && matched.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 mt-0.5 max-h-32 overflow-y-auto">
                      {matched.map(i => (
                        <button key={i.id} type="button"
                          onMouseDown={() => { onAdd(i.id, slot); setSearch(''); setAddingSlot(null) }}
                          className="w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 cursor-pointer">
                          {i.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => setAddingSlot(slot)} className="text-xs text-gray-300 hover:text-teal-500 cursor-pointer flex items-center gap-0.5">
                  <Plus size={9} /> Add
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── planner view ─────────────────────────────────────────────────────────────

type PlannerTab = 'summary' | 'grid' | '2days' | 'month'
const PLANNER_TAB_LABELS: Record<PlannerTab, string> = {
  summary: 'Week summary', grid: 'Grid view', '2days': '2 Days', month: 'Month',
}

function PlannerView({
  items, assignments, setAssignments, weekOffset, setWeekOffset, setLogEntries, profile,
}: {
  items: Item[]; assignments: Assignment[]
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>
  weekOffset: number; setWeekOffset: (n: number) => void
  setLogEntries: React.Dispatch<React.SetStateAction<MealLogEntry[]>>
  profile: Profile
}) {
  const [tab, setTab] = useState<PlannerTab>('summary')
  const [tabOrder, setTabOrder] = useState<PlannerTab[]>(['summary', 'grid', '2days', 'month'])
  const [draggedTab, setDraggedTab] = useState<PlannerTab | null>(null)

  function swapTabs(a: PlannerTab, b: PlannerTab) {
    if (a === b) return
    setTabOrder(prev => {
      const next = [...prev]
      const i = next.indexOf(a), j = next.indexOf(b)
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }
  const { label, dates } = getWeekDates(weekOffset)
  const { dates: currDates } = getWeekDates(0)
  const isCurrentWeek = dates[0].toDateString() === currDates[0].toDateString()

  function logItem(item: Item, servings: number, slot?: Slot, date?: string) {
    setLogEntries(prev => {
      const ex = prev.find(e => e.itemName === item.name && e.date === date)
      if (ex) return prev.map(e => e.itemName === item.name && e.date === date ? {
        ...e, quantity: e.quantity + servings,
        kcal: e.kcal + Math.round(item.kcal * servings),
        protein: Math.round((e.protein + item.protein * servings) * 10) / 10,
        fat: Math.round((e.fat + item.fat * servings) * 10) / 10,
        carbs: Math.round((e.carbs + item.carbs * servings) * 10) / 10,
      } : e)
      return [...prev, {
        id: uid(), itemName: item.name, quantity: servings, unit: 'serving',
        kcal: Math.round(item.kcal * servings),
        protein: Math.round(item.protein * servings * 10) / 10,
        fat: Math.round(item.fat * servings * 10) / 10,
        carbs: Math.round(item.carbs * servings * 10) / 10,
        date,
        slot,
      }]
    })
  }

  function logDay(day: Day, date: Date) {
    const ds = isoDate(date)
    assignments.filter(a => (a.weekOffset ?? 0) === weekOffset && a.day === day).forEach(a => {
      const item = items.find(x => x.id === a.itemId)
      if (item) logItem(item, a.servings, a.slot, ds)
    })
  }

  function logWeek() {
    assignments.filter(a => (a.weekOffset ?? 0) === weekOffset).forEach(a => {
      const item = items.find(x => x.id === a.itemId)
      if (item) logItem(item, a.servings, a.slot, isoDate(dates[DAYS.indexOf(a.day)]))
    })
  }

  function upsertAssignment(itemId: string, day: Day, slot: Slot, servings: number) {
    setAssignments(prev => {
      const existing = prev.find(a => a.itemId === itemId && a.day === day && a.slot === slot && (a.weekOffset ?? 0) === weekOffset)
      if (servings <= 0) return prev.filter(a => !(a.itemId === itemId && a.day === day && a.slot === slot && (a.weekOffset ?? 0) === weekOffset))
      if (existing) return prev.map(a => a.itemId === itemId && a.day === day && a.slot === slot && (a.weekOffset ?? 0) === weekOffset ? { ...a, servings } : a)
      return [...prev, { id: uid(), itemId, day, slot, servings, weekOffset }]
    })
  }

  function downloadPlanPdf() {
    const weekA = assignments.filter(a => (a.weekOffset ?? 0) === weekOffset)
    if (weekA.length === 0) return
    const win = window.open('', '_blank')
    if (!win) return
    const dayRows = DAYS.map((day, i) => {
      const dayA = weekA.filter(a => a.day === day)
      if (dayA.length === 0) return ''
      const totalKcal = dayA.reduce((s, a) => { const it = items.find(x => x.id === a.itemId); return s + (it ? it.kcal * a.servings : 0) }, 0)
      const slotRows = SLOTS.map(slot => {
        const slotA = dayA.filter(a => a.slot === slot)
        if (slotA.length === 0) return ''
        const lines = slotA.map(a => { const it = items.find(x => x.id === a.itemId); return it ? `<p style="margin:2px 0;font-size:12px;padding-left:8px">${it.name} × ${a.servings} srv (${Math.round(it.kcal * a.servings)} kcal)</p>` : '' }).join('')
        return `<p style="font-size:11px;font-weight:600;margin:6px 0 2px;text-transform:uppercase;color:#6b7280">${slot}</p>${lines}`
      }).join('')
      return `<div style="margin-bottom:14px;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px"><div style="display:flex;justify-content:space-between;margin-bottom:6px"><strong style="font-size:13px">${day} · ${dates[i].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</strong><span style="font-size:12px;color:#374151">${Math.round(totalKcal)} kcal</span></div>${slotRows}</div>`
    }).join('')
    win.document.write(`<!DOCTYPE html><html><head><title>Meal Plan</title></head><body style="font-family:sans-serif;padding:24px;max-width:680px"><h1 style="font-size:18px;margin-bottom:4px">Meal Plan</h1><p style="font-size:12px;color:#6b7280;margin-bottom:16px">${label}</p>${dayRows}</body></html>`)
    win.document.close()
    win.print()
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
        {assignments.filter(a => (a.weekOffset ?? 0) === weekOffset).length > 0 && (
          <button onClick={logWeek} className="px-3 py-2 text-xs font-medium bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 cursor-pointer flex-shrink-0">
            Log week
          </button>
        )}
        <button onClick={downloadPlanPdf} aria-label="Download PDF" className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer text-gray-600 flex-shrink-0 flex items-center gap-1">
          <Download size={13} /><span className="text-xs">PDF</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabOrder.map(id => (
          <button
            key={id}
            draggable
            onDragStart={() => setDraggedTab(id)}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); if (draggedTab) swapTabs(draggedTab, id); setDraggedTab(null) }}
            onDragEnd={() => setDraggedTab(null)}
            onClick={() => setTab(id)}
            title="Drag to reorder tabs"
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer select-none transition-opacity',
              tab === id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700',
              draggedTab === id && 'opacity-40',
            )}
          >
            {PLANNER_TAB_LABELS[id]}
          </button>
        ))}
      </div>

      {tab === 'summary' && (
        <WeeklySummary items={items} assignments={assignments.filter(a => (a.weekOffset ?? 0) === weekOffset)} days={DAYS} dates={dates} upsertAssignment={upsertAssignment} setAssignments={setAssignments} />
      )}
      {tab !== 'summary' && (
        <CalendarView subView={tab} items={items} assignments={assignments.filter(a => (a.weekOffset ?? 0) === weekOffset)} days={DAYS} dates={dates} upsertAssignment={upsertAssignment} setAssignments={setAssignments} onLog={logItem} profile={profile} />
      )}
    </div>
  )
}

// ─── shopping list view ───────────────────────────────────────────────────────

function ShoppingListView({ assignments, items, list, setList, stale, setStale }: {
  assignments: Assignment[]; items: Item[]
  list: ShoppingLine[] | null; setList: React.Dispatch<React.SetStateAction<ShoppingLine[] | null>>
  stale: boolean; setStale: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const { dates } = getWeekDates(0)
  const fmt = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const [fromDate, setFromDate] = useState(fmt(dates[0]))
  const [toDate, setToDate] = useState(fmt(dates[6]))
  const [dateError, setDateError] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { generate() }, [fromDate, toDate])

  function inRange(a: Assignment) {
    const d = getWeekDates(a.weekOffset ?? 0).dates[DAYS.indexOf(a.day)]
    const ds = fmt(d)
    return ds >= fromDate && ds <= toDate
  }

  const planSummary = useMemo(() =>
    assignments.filter(a => {
      const d = getWeekDates(a.weekOffset ?? 0).dates[DAYS.indexOf(a.day)]
      const ds = fmt(d)
      return ds >= fromDate && ds <= toDate
    }).reduce<{ id: string; name: string; servings: number; kcal: number }[]>((acc, a) => {
      const item = items.find(i => i.id === a.itemId)
      if (!item) return acc
      const existing = acc.find(x => x.id === a.itemId)
      if (existing) { existing.servings += a.servings; existing.kcal += item.kcal * a.servings }
      else acc.push({ id: a.itemId, name: item.name, servings: a.servings, kcal: item.kcal * a.servings })
      return acc
    }, []),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [assignments, items, fromDate, toDate])

  function generate() {
    if (fromDate > toDate) { setDateError('End date must be after start date.'); return }
    setDateError('')
    const lines: Record<string, ShoppingLine> = {}
    assignments.filter(inRange).forEach(a => {
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

  function downloadPdf() {
    if (!list || list.length === 0) return
    const win = window.open('', '_blank')
    if (!win) return
    const rows = categories.map(cat => {
      const lines = list.filter(l => l.category === cat).map(line =>
        `<p style="margin:4px 0;font-size:13px">${line.name}<span style="float:right;font-family:monospace">${Number.isInteger(line.amount) ? line.amount : line.amount.toFixed(1)} ${line.unit}</span></p>`
      ).join('')
      return `<h3 style="font-size:13px;margin:14px 0 4px;padding:3px 8px;background:#f3f4f6;border-radius:4px">${cat}</h3>${lines}`
    }).join('')
    win.document.write(`<!DOCTYPE html><html><head><title>Grocery List</title></head><body style="font-family:sans-serif;padding:24px;max-width:580px"><h1 style="font-size:18px;margin-bottom:4px">Grocery List</h1><p style="font-size:12px;color:#6b7280;margin-bottom:16px">${fromDate} – ${toDate}</p>${rows}</body></html>`)
    win.document.close()
    win.print()
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Date range</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <Field label="From">
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className={inputCls} />
          </Field>
          <span className="text-gray-400 pb-2">→</span>
          <Field label="To">
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className={inputCls} />
          </Field>
          {stale && (
            <button onClick={generate} className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-xl hover:bg-amber-700 cursor-pointer">
              <RefreshCw size={13} /> Refresh
            </button>
          )}
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
                <span className="text-xs text-gray-400">{item.servings} srv</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {list === null && (
        <EmptyState icon={<ShoppingBasket size={32} />} message="Generating grocery list from your meal plan…" />
      )}

      {list !== null && list.length === 0 && (
        <EmptyState icon={<ShoppingBasket size={32} />} message="No items planned for this date range." />
      )}

      {list !== null && list.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Grocery list</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{list.length} items</span>
              <button onClick={downloadPdf} className="flex items-center gap-1 text-xs text-gray-600 hover:text-teal-600 border border-gray-200 rounded-lg px-2 py-1 cursor-pointer hover:border-teal-400 transition-colors">
                <Download size={11} /> PDF
              </button>
            </div>
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

function MacroPiePct({ proteinPct, fatPct, carbsPct }: { proteinPct: number; fatPct: number; carbsPct: number }) {
  const gradient = `conic-gradient(#3b82f6 0% ${proteinPct.toFixed(1)}%, #f97316 ${proteinPct.toFixed(1)}% ${(proteinPct + fatPct).toFixed(1)}%, #22c55e ${(proteinPct + fatPct).toFixed(1)}% 100%)`
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ background: gradient }} />
      <div className="text-xs space-y-0.5">
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block flex-shrink-0" /><span className="text-gray-600">P {proteinPct}%</span></div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block flex-shrink-0" /><span className="text-gray-600">F {fatPct}%</span></div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block flex-shrink-0" /><span className="text-gray-600">C {carbsPct}%</span></div>
      </div>
    </div>
  )
}

function NutritionPie({ protein, fat, carbs }: { protein: number; fat: number; carbs: number }) {
  const pKcal = protein * 4
  const fKcal = fat * 9
  const cKcal = carbs * 4
  const total = pKcal + fKcal + cKcal || 1
  const pPct = pKcal / total * 100
  const fPct = fKcal / total * 100
  const cPct = 100 - pPct - fPct
  const gradient = `conic-gradient(#3b82f6 0% ${pPct.toFixed(1)}%, #f97316 ${pPct.toFixed(1)}% ${(pPct + fPct).toFixed(1)}%, #22c55e ${(pPct + fPct).toFixed(1)}% 100%)`
  return (
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 rounded-full flex-shrink-0" style={{ background: gradient }} />
      <div className="text-xs space-y-0.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block flex-shrink-0" />
          <span className="text-gray-600">Protein: {fmtMacro(protein)}g ({Math.round(pPct)}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-500 inline-block flex-shrink-0" />
          <span className="text-gray-600">Fat: {fmtMacro(fat)}g ({Math.round(fPct)}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block flex-shrink-0" />
          <span className="text-gray-600">Carbs: {fmtMacro(carbs)}g ({Math.round(cPct)}%)</span>
        </div>
      </div>
    </div>
  )
}

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
  const [profileTab, setProfileTab] = useState<'profile' | 'tracking'>('profile')
  const [trackView, setTrackView] = useState<'today' | 'week' | 'month'>('today')
  const [trackWeekOffset, setTrackWeekOffset] = useState(0)
  const matched = items.filter(i => i.name.toLowerCase().includes(logSearch.toLowerCase())).slice(0, 5)
  const selectedItem = items.find(i => i.name.toLowerCase() === logSearch.toLowerCase())
  const dailyKcal = logEntries.reduce((s, e) => s + e.kcal, 0)
  const dailyProtein = logEntries.reduce((s, e) => s + e.protein, 0)
  const dailyFat = logEntries.reduce((s, e) => s + e.fat, 0)
  const dailyCarbs = logEntries.reduce((s, e) => s + e.carbs, 0)
  const proteinTargetG = profile.calorieTarget > 0 && profile.macros.protein > 0
    ? Math.round(profile.calorieTarget * profile.macros.protein / 100 / 4) : 0
  const fatTargetG = profile.calorieTarget > 0 && profile.macros.fat > 0
    ? Math.round(profile.calorieTarget * profile.macros.fat / 100 / 9) : 0
  const carbsTargetG = profile.calorieTarget > 0 && profile.macros.carbs > 0
    ? Math.round(profile.calorieTarget * profile.macros.carbs / 100 / 4) : 0
  const corridorStatus = corridor && logEntries.length > 0
    ? (dailyKcal < corridor.low ? 'below' : dailyKcal > corridor.high ? 'above' : 'within') as 'below' | 'above' | 'within'
    : null
  const { dates: trackDates, label: trackLabel } = getWeekDates(trackWeekOffset)
  const entriesByDate = logEntries.reduce<Record<string, { kcal: number }>>((acc, e) => {
    if (!e.date) return acc
    acc[e.date] = { kcal: (acc[e.date]?.kcal ?? 0) + e.kcal }
    return acc
  }, {})
  const weekDaysOnTarget = corridor ? trackDates.filter(d => {
    const ds = isoDate(d)
    const dk = entriesByDate[ds]?.kcal ?? 0
    return dk > 0 && dk >= corridor.low && dk <= corridor.high
  }).length : 0

  const todayStr = isoDate(new Date())
  const todayEntries = logEntries.filter(e => e.date === todayStr)
  const todayKcal = todayEntries.reduce((s, e) => s + e.kcal, 0)
  const todayProtein = todayEntries.reduce((s, e) => s + e.protein, 0)
  const todayFat = todayEntries.reduce((s, e) => s + e.fat, 0)
  const todayCarbs = todayEntries.reduce((s, e) => s + e.carbs, 0)
  const weekEntries = logEntries.filter(e => trackDates.some(d => isoDate(d) === e.date))
  const weekProtein = weekEntries.reduce((s, e) => s + e.protein, 0)
  const weekFat = weekEntries.reduce((s, e) => s + e.fat, 0)
  const weekCarbs = weekEntries.reduce((s, e) => s + e.carbs, 0)

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
      date: isoDate(new Date()),
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
      {/* Top-level tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {([['profile', 'Profile'], ['tracking', 'Meal tracking']] as const).map(([t, l]) => (
          <button key={t} onClick={() => setProfileTab(t)}
            className={cn('px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer',
              profileTab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700')}>
            {l}
          </button>
        ))}
      </div>

      {profileTab === 'profile' && (
        <>
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
        </>
      )}

      {profileTab === 'tracking' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
          {/* Tracking header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Meal tracking</h2>
              {corridor && (
                <p className="text-xs text-gray-500 mt-0.5"><span className="font-medium text-gray-700">{weekDaysOnTarget} / 7</span> days on target</p>
              )}
            </div>
            <div className="flex gap-0.5 bg-gray-100 p-0.5 rounded-lg">
              {(['today', 'week', 'month'] as const).map(v => (
                <button key={v} onClick={() => setTrackView(v)}
                  className={cn('px-2 py-1 rounded-md text-xs font-medium cursor-pointer',
                    trackView === v ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:bg-white')}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {corridorStatus && (
            <div className={cn('rounded-xl px-3 py-2 text-sm flex items-center justify-between',
              corridorStatus === 'within' ? 'bg-green-50 text-green-800' :
              corridorStatus === 'below' ? 'bg-amber-50 text-amber-800' :
              'bg-red-50 text-red-700')}>
              <span className="font-medium">
                {corridorStatus === 'within' ? 'Within goal' : corridorStatus === 'below' ? 'Below target' : 'Above target'}
              </span>
              <span className="text-xs">{Math.round(dailyKcal)} / {corridor!.low}–{corridor!.high} kcal</span>
            </div>
          )}

          {/* Add log form */}
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

          {/* Today view */}
          {trackView === 'today' && (
            <>
              {todayEntries.length > 0 && (
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Today's nutrition</p>
                    <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">{Math.round(todayKcal)} kcal</span>
                  </div>
                  <NutritionPie protein={todayProtein} fat={todayFat} carbs={todayCarbs} />
                </div>
              )}
              {todayEntries.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">No entries yet for today. Log what you eat.</p>
              ) : (
                <div className="space-y-1">
                  {todayEntries.map(e => (
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
            </>
          )}

          {/* Week view */}
          {trackView === 'week' && (
            <div className="space-y-3">
              {weekEntries.length > 0 && (
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Weekly nutrition</p>
                  <NutritionPie protein={weekProtein} fat={weekFat} carbs={weekCarbs} />
                </div>
              )}
              <div className="flex items-center justify-between">
                <button onClick={() => setTrackWeekOffset(p => p - 1)} aria-label="Previous week" className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer text-gray-600">
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs font-medium text-gray-600">{trackLabel}</span>
                <button onClick={() => setTrackWeekOffset(p => p + 1)} aria-label="Next week" className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer text-gray-600">
                  <ChevronRight size={14} />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {DAYS.map((day, i) => {
                  const ds = isoDate(trackDates[i])
                  const dayKcal = entriesByDate[ds]?.kcal ?? 0
                  const isToday = ds === isoDate(new Date())
                  const inCorridor = corridor && dayKcal > 0 && dayKcal >= corridor.low && dayKcal <= corridor.high
                  const belowCorridor = corridor && dayKcal > 0 && dayKcal < corridor.low
                  const aboveCorridor = corridor && dayKcal > 0 && dayKcal > corridor.high
                  return (
                    <div key={day} className={cn(
                      'rounded-xl border p-2 text-center',
                      isToday ? 'border-teal-400 bg-teal-50' : 'border-gray-100 bg-gray-50',
                    )}>
                      <p className={cn('text-xs font-semibold', isToday ? 'text-teal-700' : 'text-gray-500')}>{day}</p>
                      <p className="text-xs text-gray-400">{trackDates[i].getDate()}</p>
                      {dayKcal > 0 ? (
                        <p className={cn('text-xs font-medium mt-1',
                          inCorridor ? 'text-green-600' : belowCorridor ? 'text-amber-600' : aboveCorridor ? 'text-red-600' : 'text-gray-600'
                        )}>{dayKcal}</p>
                      ) : (
                        <p className="text-xs text-gray-300 mt-1">—</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Month view */}
          {trackView === 'month' && (() => {
            const baseMonth = new Date(trackDates[0].getFullYear(), trackDates[0].getMonth() + trackWeekOffset, 1)
            const firstDay = new Date(baseMonth.getFullYear(), baseMonth.getMonth(), 1)
            const dow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
            const gridStart = new Date(firstDay)
            gridStart.setDate(firstDay.getDate() - dow)
            const gridDays = Array.from({ length: 42 }, (_, i) => { const d = new Date(gridStart); d.setDate(gridStart.getDate() + i); return d })
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <button onClick={() => setTrackWeekOffset(p => p - 1)} aria-label="Previous month" className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer text-gray-600">
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-xs font-medium text-gray-600">
                    {firstDay.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={() => setTrackWeekOffset(p => p + 1)} aria-label="Next month" className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer text-gray-600">
                    <ChevronRight size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-7 border border-gray-100 rounded-xl overflow-hidden text-center">
                  {['M','T','W','T','F','S','S'].map((d, i) => (
                    <div key={i} className="text-xs font-semibold text-gray-400 py-1.5 bg-gray-50">{d}</div>
                  ))}
                  {gridDays.map((d, i) => {
                    const ds = isoDate(d)
                    const dayKcal = entriesByDate[ds]?.kcal ?? 0
                    const isToday = ds === isoDate(new Date())
                    const isCurrentMonth = d.getMonth() === firstDay.getMonth()
                    const inCorridor = corridor && dayKcal > 0 && dayKcal >= corridor.low && dayKcal <= corridor.high
                    const belowCorridor = corridor && dayKcal > 0 && dayKcal < corridor.low
                    const aboveCorridor = corridor && dayKcal > 0 && dayKcal > corridor.high
                    return (
                      <div key={i} className={cn('border-t border-r border-gray-50 p-1.5 min-h-12', !isCurrentMonth && 'opacity-30')}>
                        <span className={cn('inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full',
                          isToday ? 'bg-teal-600 text-white' : 'text-gray-500')}>
                          {d.getDate()}
                        </span>
                        {dayKcal > 0 && (
                          <p className={cn('text-xs mt-0.5',
                            inCorridor ? 'text-green-600' : belowCorridor ? 'text-amber-500' : aboveCorridor ? 'text-red-500' : 'text-gray-500'
                          )}>{dayKcal}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

// ─── advanced search view ────────────────────────────────────────────────────

function SearchView({ items, setItems, assignments, setAssignments }: {
  items: Item[]
  setItems: React.Dispatch<React.SetStateAction<Item[]>>
  assignments: Assignment[]
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>
}) {
  const [query, setQuery] = useState('')
  const [dietFilter, setDietFilter] = useState('')
  const [kcalMin, setKcalMin] = useState('')
  const [kcalMax, setKcalMax] = useState('')
  const [proteinMin, setProteinMin] = useState('')
  const [proteinMax, setProteinMax] = useState('')
  const [fatMin, setFatMin] = useState('')
  const [fatMax, setFatMax] = useState('')
  const [carbsMin, setCarbsMin] = useState('')
  const [carbsMax, setCarbsMax] = useState('')
  const [catFilter, setCatFilter] = useState<string[]>([])
  const [ingredient, setIngredient] = useState('')
  const [activeTab, setActiveTab] = useState<'products' | 'recipes'>('products')
  const [detailProduct, setDetailProduct] = useState<Item | null>(null)
  const [detailRecipe, setDetailRecipe] = useState<Item | null>(null)
  const [pSortBy, setPSortBy] = useState('name')
  const [pSortDir, setPSortDir] = useState<'asc' | 'desc'>('asc')
  const [rSortBy, setRSortBy] = useState('name')
  const [rSortDir, setRSortDir] = useState<'asc' | 'desc'>('asc')

  const products = items.filter(i => i.kind === 'product')
  const recipes  = items.filter(i => i.kind === 'recipe')

  const productCategories = Array.from(new Set(products.map(p => p.category))).sort()
  const recipeCategories  = Array.from(new Set(recipes.map(r => r.category))).sort()

  const hasFilters = !!(query || dietFilter || kcalMin || kcalMax || proteinMin || proteinMax
    || fatMin || fatMax || carbsMin || carbsMax || catFilter.length || ingredient)

  function sortItems(arr: Item[], by: string, dir: 'asc' | 'desc') {
    return [...arr].sort((a, b) => {
      const va = (a as unknown as Record<string, unknown>)[by] ?? ''
      const vb = (b as unknown as Record<string, unknown>)[by] ?? ''
      const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb))
      return dir === 'asc' ? cmp : -cmp
    })
  }

  function toggleWeekFlag(id: string, flag: 'thisWeek' | 'nextWeek') {
    const item = items.find(i => i.id === id)!
    const isRemoving = item.weekFlags[flag]
    if (isRemoving && flag === 'thisWeek') {
      const hasManual = assignments.some(a => a.itemId === id && !a.autoAdded)
      if (hasManual && !confirm(`"${item.name}" has planner assignments. Remove them?`)) return
      setAssignments(prev => prev.filter(a => a.itemId !== id))
    }
    if (!isRemoving && flag === 'thisWeek') {
      setAssignments(prev => {
        const already = prev.some(a => a.itemId === id && a.slot === 'Lunch')
        return already ? prev : [...prev, { id: uid(), itemId: id, day: 'Mon', slot: 'Lunch', servings: 1, weekOffset: 0, autoAdded: true }]
      })
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, weekFlags: { ...i.weekFlags, [flag]: !i.weekFlags[flag] } } : i))
  }

  const productResults = useMemo(() => {
    const filtered = products.filter(item => {
      if (query && !item.name.toLowerCase().includes(query.toLowerCase())) return false
      if (dietFilter && !item.dietTags.includes(dietFilter)) return false
      if (kcalMin && item.kcal < Number(kcalMin)) return false
      if (kcalMax && item.kcal > Number(kcalMax)) return false
      if (proteinMin && item.protein < Number(proteinMin)) return false
      if (proteinMax && item.protein > Number(proteinMax)) return false
      if (fatMin && item.fat < Number(fatMin)) return false
      if (fatMax && item.fat > Number(fatMax)) return false
      if (carbsMin && item.carbs < Number(carbsMin)) return false
      if (carbsMax && item.carbs > Number(carbsMax)) return false
      if (catFilter.length > 0 && !catFilter.includes(item.category)) return false
      return true
    })
    return sortItems(filtered, pSortBy, pSortDir)
  }, [products, query, dietFilter, kcalMin, kcalMax, proteinMin, proteinMax, fatMin, fatMax, carbsMin, carbsMax, catFilter, pSortBy, pSortDir])

  const recipeResults = useMemo(() => {
    const filtered = recipes.filter(item => {
      if (query && !item.name.toLowerCase().includes(query.toLowerCase())) return false
      if (dietFilter && !item.dietTags.includes(dietFilter)) return false
      if (kcalMin && item.kcal < Number(kcalMin)) return false
      if (kcalMax && item.kcal > Number(kcalMax)) return false
      if (proteinMin && item.protein < Number(proteinMin)) return false
      if (proteinMax && item.protein > Number(proteinMax)) return false
      if (fatMin && item.fat < Number(fatMin)) return false
      if (fatMax && item.fat > Number(fatMax)) return false
      if (carbsMin && item.carbs < Number(carbsMin)) return false
      if (carbsMax && item.carbs > Number(carbsMax)) return false
      if (catFilter.length > 0 && !catFilter.includes(item.category)) return false
      if (ingredient && !item.ingredients?.some(ing => ing.productName.toLowerCase().includes(ingredient.toLowerCase()))) return false
      return true
    })
    return sortItems(filtered, rSortBy, rSortDir)
  }, [recipes, query, dietFilter, kcalMin, kcalMax, proteinMin, proteinMax, fatMin, fatMax, carbsMin, carbsMax, catFilter, ingredient, rSortBy, rSortDir])

  const activeChips = [
    ...(query         ? [{ key: 'q',    label: `"${query}"`,                           clear: () => setQuery('') }] : []),
    ...(dietFilter    ? [{ key: 'diet', label: `Diet: ${DIET_LABELS[dietFilter] ?? dietFilter}`, clear: () => setDietFilter('') }] : []),
    ...(kcalMin || kcalMax     ? [{ key: 'kcal',    label: `kcal ${kcalMin || '0'}–${kcalMax || '∞'}`,       clear: () => { setKcalMin(''); setKcalMax('') } }] : []),
    ...(proteinMin || proteinMax ? [{ key: 'protein', label: `Protein ${proteinMin || '0'}–${proteinMax || '∞'} g`, clear: () => { setProteinMin(''); setProteinMax('') } }] : []),
    ...(fatMin || fatMax         ? [{ key: 'fat',     label: `Fat ${fatMin || '0'}–${fatMax || '∞'} g`,           clear: () => { setFatMin(''); setFatMax('') } }] : []),
    ...(carbsMin || carbsMax     ? [{ key: 'carbs',   label: `Carbs ${carbsMin || '0'}–${carbsMax || '∞'} g`,     clear: () => { setCarbsMin(''); setCarbsMax('') } }] : []),
    ...catFilter.map(cat => ({ key: `cat-${cat}`, label: cat, clear: () => setCatFilter(prev => prev.filter(c => c !== cat)) })),
    ...(ingredient ? [{ key: 'ing', label: `Contains: ${ingredient}`, clear: () => setIngredient('') }] : []),
  ]

  function clearAll() {
    setQuery(''); setDietFilter('')
    setKcalMin(''); setKcalMax('')
    setProteinMin(''); setProteinMax('')
    setFatMin(''); setFatMax('')
    setCarbsMin(''); setCarbsMax('')
    setCatFilter([]); setIngredient('')
  }

  const numCls = 'w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200'

  const macroRows = [
    { label: 'Protein (g / serving)', min: proteinMin, setMin: setProteinMin, max: proteinMax, setMax: setProteinMax },
    { label: 'Fat (g / serving)',     min: fatMin,     setMin: setFatMin,     max: fatMax,     setMax: setFatMax },
    { label: 'Carbs (g / serving)',   min: carbsMin,   setMin: setCarbsMin,   max: carbsMax,   setMax: setCarbsMax },
  ]

  return (
    <div className="flex -m-6" style={{ minHeight: 'calc(100vh - 64px)' }}>

      {/* ── Filter panel ─────────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-y-auto">

        {/* Header */}
        <div className="px-4 pt-5 pb-4 border-b border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Filters</h2>
            {hasFilters && (
              <button onClick={clearAll} className="text-xs text-teal-600 hover:text-teal-800 cursor-pointer transition-colors">
                Clear all
              </button>
            )}
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name…"
              aria-label="Search products and recipes by name"
              className="w-full text-sm border border-gray-200 rounded-xl pl-8 pr-3 py-2 bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
            />
          </div>
        </div>

        {/* Filter body */}
        <div className="px-4 py-4 space-y-5 flex-1 overflow-y-auto">

          {/* Diet */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Diet</label>
            <select
              value={dietFilter}
              onChange={e => setDietFilter(e.target.value)}
              aria-label="Filter by diet"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="">Any diet</option>
              {Object.entries(DIET_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {/* Calorie range */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Calories (kcal / serving)</label>
            <div className="flex items-center gap-2">
              <input type="number" min="0" value={kcalMin} onChange={e => setKcalMin(e.target.value)} placeholder="From" aria-label="Minimum calories" className={numCls} />
              <span className="text-xs text-gray-400 flex-shrink-0">–</span>
              <input type="number" min="0" value={kcalMax} onChange={e => setKcalMax(e.target.value)} placeholder="To"   aria-label="Maximum calories" className={numCls} />
            </div>
          </div>

          {/* Macro ranges */}
          {macroRows.map(({ label, min, setMin, max, setMax }) => (
            <div key={label}>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">{label}</label>
              <div className="flex items-center gap-2">
                <input type="number" min="0" value={min} onChange={e => setMin(e.target.value)} placeholder="From" aria-label={`Minimum ${label}`} className={numCls} />
                <span className="text-xs text-gray-400 flex-shrink-0">–</span>
                <input type="number" min="0" value={max} onChange={e => setMax(e.target.value)} placeholder="To"   aria-label={`Maximum ${label}`} className={numCls} />
              </div>
            </div>
          ))}

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</label>
              {catFilter.length > 0 && (
                <button onClick={() => setCatFilter([])} className="text-xs text-teal-600 hover:text-teal-800 cursor-pointer">Clear</button>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-1.5 font-medium">Products</p>
                <div className="space-y-1.5">
                  {productCategories.map(cat => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={catFilter.includes(cat)}
                        onChange={() => setCatFilter(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                        className="rounded border-gray-300 text-teal-600 cursor-pointer focus:ring-teal-500"
                      />
                      <span className="text-xs text-gray-700 group-hover:text-gray-900 transition-colors">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1.5 font-medium">Recipes</p>
                <div className="space-y-1.5">
                  {recipeCategories.map(cat => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={catFilter.includes(cat)}
                        onChange={() => setCatFilter(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                        className="rounded border-gray-300 text-teal-600 cursor-pointer focus:ring-teal-500"
                      />
                      <span className="text-xs text-gray-700 group-hover:text-gray-900 transition-colors">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Ingredient include (recipes only) */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Contains ingredient</label>
            <p className="text-xs text-gray-400 mb-2">Applies to the Recipes tab only</p>
            <input
              type="text"
              value={ingredient}
              onChange={e => setIngredient(e.target.value)}
              placeholder="e.g. chicken"
              aria-label="Filter recipes by ingredient"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
            />
          </div>
        </div>
      </aside>

      {/* ── Results area ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 p-6">

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4" role="list" aria-label="Active filters">
            {activeChips.map(chip => (
              <span
                key={chip.key}
                role="listitem"
                className="inline-flex items-center gap-1 text-xs bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-2.5 py-1 font-medium"
              >
                {chip.label}
                <button
                  onClick={chip.clear}
                  aria-label={`Remove filter: ${chip.label}`}
                  className="ml-0.5 text-teal-500 hover:text-teal-800 cursor-pointer rounded-full"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Tab bar */}
        <div className="flex items-center gap-0 border-b border-gray-200 mb-4" role="tablist">
          {(['products', 'recipes'] as const).map(tab => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer',
                activeTab === tab
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              )}
            >
              {tab === 'products' ? 'Products' : 'Recipes'}
              <span className={cn(
                'text-xs font-semibold px-1.5 py-0.5 rounded-full',
                activeTab === tab ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500',
              )}>
                {tab === 'products' ? productResults.length : recipeResults.length}
              </span>
            </button>
          ))}
        </div>

        {/* Initial empty state */}
        {!hasFilters && (
          <EmptyState
            icon={<SlidersHorizontal size={32} />}
            message="Enter a search term or apply a filter to find products and recipes across the full catalogue."
          />
        )}

        {/* Products tab */}
        {hasFilters && activeTab === 'products' && (
          productResults.length === 0 ? (
            <EmptyState icon={<Apple size={32} />} message="No products match your filters." />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" role="grid">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {([['Name','name'],['Category','category'],['kcal','kcal'],['Protein','protein'],['Fat','fat'],['Carbs','carbs'],['Fiber','fiber'],['Serving',''],['Week','']] as [string,string][]).map(([h, key]) => (
                        <th key={h} onClick={() => { if (!key) return; if (pSortBy === key) setPSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setPSortBy(key); setPSortDir('asc') } }}
                          className={cn('px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide select-none', ['kcal','Protein','Fat','Carbs','Fiber'].includes(h) ? 'text-right' : 'text-left', key ? 'cursor-pointer hover:text-gray-700' : '')}>
                          {h}{key && pSortBy === key ? (pSortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {productResults.map((p, idx) => (
                      <tr
                        key={p.id}
                        onClick={() => setDetailProduct(p)}
                        className={cn('border-b border-gray-50 hover:bg-teal-50/30 cursor-pointer transition-colors', idx % 2 !== 0 && 'bg-gray-50/30')}
                      >
                        <td className="px-4 py-2.5 font-medium text-gray-900">{p.name}</td>
                        <td className="px-4 py-2.5">
                          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', CATEGORY_COLOURS[p.category] ?? 'bg-gray-100 text-gray-600')}>{p.category}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-gray-700">{p.kcal}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-gray-700">{fmtMacro(p.protein)}g</td>
                        <td className="px-4 py-2.5 text-right font-mono text-gray-700">{fmtMacro(p.fat)}g</td>
                        <td className="px-4 py-2.5 text-right font-mono text-gray-700">{fmtMacro(p.carbs)}g</td>
                        <td className="px-4 py-2.5 text-right font-mono text-gray-700">{p.fiber !== undefined ? `${fmtMacro(p.fiber)}g` : '—'}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-400">{p.servingLabel ?? `${p.servingAmount ?? 100} ${p.unit ?? 'g'}`}</td>
                        <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button onClick={() => toggleWeekFlag(p.id, 'thisWeek')} className={cn('text-xs px-1.5 py-0.5 rounded font-medium cursor-pointer', p.weekFlags.thisWeek ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>TW</button>
                            <button onClick={() => toggleWeekFlag(p.id, 'nextWeek')} className={cn('text-xs px-1.5 py-0.5 rounded font-medium cursor-pointer', p.weekFlags.nextWeek ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>NW</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* Recipes tab */}
        {hasFilters && activeTab === 'recipes' && (
          recipeResults.length === 0 ? (
            <EmptyState icon={<UtensilsCrossed size={32} />} message="No recipes match your filters." />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" role="grid">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {([['Name','name'],['Category','category'],['Servings','servings'],['kcal','kcal'],['Protein','protein'],['Fat','fat'],['Carbs','carbs'],['Fiber','fiber'],['Week','']] as [string,string][]).map(([h, key]) => (
                        <th key={h} onClick={() => { if (!key) return; if (rSortBy === key) setRSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setRSortBy(key); setRSortDir('asc') } }}
                          className={cn('px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide select-none', ['kcal','Protein','Fat','Carbs','Servings','Fiber'].includes(h) ? 'text-right' : 'text-left', key ? 'cursor-pointer hover:text-gray-700' : '')}>
                          {h}{key && rSortBy === key ? (rSortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recipeResults.map((r, idx) => (
                      <tr
                        key={r.id}
                        onClick={() => setDetailRecipe(r)}
                        className={cn('border-b border-gray-50 hover:bg-teal-50/30 cursor-pointer transition-colors', idx % 2 !== 0 && 'bg-gray-50/30')}
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{r.name}</span>
                            {r.favorite && <Heart size={11} fill="#ef4444" className="text-red-500 flex-shrink-0" />}
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', CATEGORY_COLOURS[r.category] ?? 'bg-gray-100 text-gray-600')}>{r.category}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-gray-700">{r.servings}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="font-mono text-gray-700">{r.kcal}</span>
                          {r.servingG && <div className="text-xs text-gray-400 font-mono">{Math.round(r.kcal * 100 / r.servingG)}/100g</div>}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-gray-700">{fmtMacro(r.protein)}g</td>
                        <td className="px-4 py-2.5 text-right font-mono text-gray-700">{fmtMacro(r.fat)}g</td>
                        <td className="px-4 py-2.5 text-right font-mono text-gray-700">{fmtMacro(r.carbs)}g</td>
                        <td className="px-4 py-2.5 text-right font-mono text-gray-700">{r.fiber !== undefined ? `${fmtMacro(r.fiber)}g` : '—'}</td>
                        <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button onClick={() => toggleWeekFlag(r.id, 'thisWeek')} className={cn('text-xs px-1.5 py-0.5 rounded font-medium cursor-pointer', r.weekFlags.thisWeek ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>TW</button>
                            <button onClick={() => toggleWeekFlag(r.id, 'nextWeek')} className={cn('text-xs px-1.5 py-0.5 rounded font-medium cursor-pointer', r.weekFlags.nextWeek ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>NW</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>

      {/* Product detail modal */}
      {detailProduct && <ProductDetailModal product={detailProduct} onClose={() => setDetailProduct(null)} />}

      {/* Recipe detail modal */}
      {detailRecipe && (() => {
        const d = detailRecipe
        const protKcal = d.protein * 4; const fatKcal = d.fat * 9; const carbKcal = d.carbs * 4
        const totalMK = protKcal + fatKcal + carbKcal || 1
        const pPct = Math.round((protKcal / totalMK) * 100)
        const fPct = Math.round((fatKcal / totalMK) * 100)
        const cPct = 100 - pPct - fPct
        const pieGradient = `conic-gradient(#3b82f6 0% ${pPct}%, #ef4444 ${pPct}% ${pPct + fPct}%, #22c55e ${pPct + fPct}% 100%)`
        const dServings = d.servings ?? 1
        let perServingG: number | null = d.servingG ?? null
        let isEst = false
        if (!perServingG && d.ingredients?.length) {
          const totalG = d.ingredients.reduce<number>((sum, ing) => {
            if (!isFinite(sum)) return NaN
            const prod = items.find(i => i.id === ing.productId)
            if (!prod) return NaN
            if (ing.unit === 'g' || ing.unit === 'ml') return sum + ing.amount
            const altU = prod.altUnits?.find(a => a.unit === ing.unit)
            if (altU) return sum + ing.amount * altU.gramsPerUnit
            if (prod.servingG != null && prod.servingAmount) return sum + ing.amount * (prod.servingG / prod.servingAmount)
            return NaN
          }, 0)
          if (isFinite(totalG) && totalG > 0) { perServingG = totalG / dServings; isEst = true }
        }
        const f100 = perServingG ? 100 / perServingG : null
        return (
          <Modal title={d.name} onClose={() => setDetailRecipe(null)} wide>
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn('text-sm px-3 py-1 rounded-full font-medium', CATEGORY_COLOURS[d.category] ?? 'bg-gray-100 text-gray-600')}>{d.category}</span>
                <span className="text-sm text-gray-400">{dServings} serving{dServings !== 1 ? 's' : ''}</span>
                {d.prepTime && <span className="text-sm text-gray-400">· {d.prepTime}</span>}
              </div>
              <div className="flex items-center gap-5">
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: pieGradient, flexShrink: 0 }} />
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /><span className="text-gray-600">Protein: {fmtMacro(d.protein)} g ({pPct}%)</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /><span className="text-gray-600">Fat: {fmtMacro(d.fat)} g ({fPct}%)</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /><span className="text-gray-600">Carbs: {fmtMacro(d.carbs)} g ({cPct}%)</span></div>
                  {d.fiber !== undefined && <div className="text-xs text-gray-400">Fiber: {fmtMacro(d.fiber)} g</div>}
                  <div className="font-semibold text-gray-900">
                    {d.kcal} kcal / serving
                    {f100 !== null && <span className="ml-2 text-xs font-normal text-gray-400">· {Math.round(d.kcal * f100)} kcal / 100 g{isEst ? ' (est.)' : ''}</span>}
                  </div>
                </div>
              </div>
              {d.ingredients && d.ingredients.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Ingredients</h3>
                  <ul className="space-y-1">
                    {d.ingredients.map(ing => (
                      <li key={ing.productId} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50">
                        <span className="text-gray-700">{ing.productName}</span>
                        <span className="text-gray-400 font-mono text-xs">{ing.amount} {ing.unit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {d.instructions && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Instructions</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{d.instructions}</p>
                </div>
              )}
              {d.dietTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {d.dietTags.map(t => <span key={t} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">{DIET_LABELS[t] ?? t}</span>)}
                </div>
              )}
            </div>
          </Modal>
        )
      })()}
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
  const [shoppingList, setShoppingList] = useState<ShoppingLine[] | null>(null)
  const [shoppingStale, setShoppingStale] = useState(false)

  const shoppingListRef = useRef(shoppingList)
  shoppingListRef.current = shoppingList
  useEffect(() => {
    if (shoppingListRef.current !== null) setShoppingStale(true)
  }, [assignments])

  return (
    <div className="flex h-full overflow-hidden" style={{ background: '#F1F5F4' }}>
      <Sidebar active={activeView} setActive={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar view={activeView} profile={profile} assignments={assignments} items={items} />
        <main id="main-content" className="flex-1 overflow-y-auto p-6">
          {activeView === 'planner' && (
            <PlannerView items={items} assignments={assignments} setAssignments={setAssignments} weekOffset={weekOffset} setWeekOffset={setWeekOffset} setLogEntries={setLogEntries} profile={profile} />
          )}
          {activeView === 'products' && (
            <ProductsView items={items} setItems={setItems} assignments={assignments} setAssignments={setAssignments} />
          )}
          {activeView === 'analyser' && <ProductsAnalyserView items={items} setItems={setItems} assignments={assignments} setAssignments={setAssignments} />}
          {activeView === 'recipes' && (
            <RecipesView items={items} setItems={setItems} assignments={assignments} setAssignments={setAssignments} />
          )}
          {activeView === 'diets' && <DietsView diets={SEED_DIETS} items={items} />}
          {activeView === 'shopping' && <ShoppingListView assignments={assignments} items={items} list={shoppingList} setList={setShoppingList} stale={shoppingStale} setStale={setShoppingStale} />}
          {activeView === 'profile' && (
            <ProfileView profile={profile} setProfile={setProfile} diets={SEED_DIETS} logEntries={logEntries} setLogEntries={setLogEntries} items={items} />
          )}
          {activeView === 'search' && <SearchView items={items} setItems={setItems} assignments={assignments} setAssignments={setAssignments} />}
        </main>
      </div>
    </div>
  )
}
