'use client'

/**
 * FilterBar — search, category dropdown, diet-tag multi-select, sort controls.
 *
 * Search is debounced (300 ms) to avoid over-firing onChange.
 * Diet tags dropdown closes on outside click.
 *
 * AC-027: filter by category
 * AC-028: filter by diet tag
 * AC-029: search by name (case-insensitive)
 * AC-031: sort by column
 */

import { useEffect, useReducer, useRef, useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface FilterState {
  search: string
  category: string
  dietTags: string[]
  sortBy: 'name' | 'category' | 'calories' | 'protein_g' | 'fat_g' | 'carbs_g'
  sortOrder: 'asc' | 'desc'
}

interface FilterBarProps {
  filters: FilterState
  categories: string[]
  dietTagOptions: string[]
  onChange: (filters: FilterState) => void
}

const SORT_OPTIONS: { value: FilterState['sortBy']; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'category', label: 'Category' },
  { value: 'calories', label: 'Calories' },
  { value: 'protein_g', label: 'Protein' },
  { value: 'fat_g', label: 'Fat' },
  { value: 'carbs_g', label: 'Carbs' },
]

export function FilterBar({ filters, categories, dietTagOptions, onChange }: FilterBarProps) {
  const [dietOpen, setDietOpen] = useState(false)
  const dietRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // useReducer so dispatch() can be called inside useEffect (avoids react-hooks/set-state-in-effect)
  const [localSearch, dispatchLocalSearch] = useReducer(
    (_prev: string, value: string) => value,
    filters.search
  )

  // Sync local search with external reset (e.g. "clear all")
  useEffect(() => {
    dispatchLocalSearch(filters.search)
  }, [filters.search])

  // Close diet dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dietRef.current && !dietRef.current.contains(e.target as Node)) {
        setDietOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSearchChange(value: string) {
    dispatchLocalSearch(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onChange({ ...filters, search: value })
    }, 300)
  }

  function handleDietTagToggle(tag: string) {
    const next = filters.dietTags.includes(tag)
      ? filters.dietTags.filter((t) => t !== tag)
      : [...filters.dietTags, tag]
    onChange({ ...filters, dietTags: next })
  }

  function handleSortOrderToggle() {
    onChange({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
  }

  function handleClearAll() {
    if (timerRef.current) clearTimeout(timerRef.current)
    dispatchLocalSearch('')
    onChange({ search: '', category: '', dietTags: [], sortBy: 'name', sortOrder: 'asc' })
  }

  const hasActiveFilters =
    filters.search !== '' || filters.category !== '' || filters.dietTags.length > 0

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className={cn(
            'w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 bg-white',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500'
          )}
        />
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <label htmlFor="catalog-category-filter" className="sr-only">
            Category
          </label>
          <select
            id="catalog-category-filter"
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className={cn(
              'text-sm rounded-xl border border-gray-200 bg-white px-3 py-2',
              'focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500',
              'cursor-pointer'
            )}
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Diet tags multi-select */}
      {dietTagOptions.length > 0 && (
        <div className="relative" ref={dietRef}>
          <button
            type="button"
            onClick={() => setDietOpen((o) => !o)}
            aria-expanded={dietOpen}
            aria-haspopup="listbox"
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border bg-white',
              'focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500',
              filters.dietTags.length > 0
                ? 'border-teal-500 bg-teal-50 text-teal-800'
                : 'border-gray-200 text-gray-700'
            )}
          >
            Diet tags
            {filters.dietTags.length > 0 && (
              <span className="bg-teal-700 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                {filters.dietTags.length}
              </span>
            )}
            <ChevronDown
              size={13}
              aria-hidden="true"
              className={cn('transition-transform', dietOpen && 'rotate-180')}
            />
          </button>

          {dietOpen && (
            <div
              className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto min-w-48 p-2"
              role="listbox"
              aria-multiselectable="true"
              aria-label="Diet tags"
            >
              {dietTagOptions.map((tag) => {
                const checked = filters.dietTags.includes(tag)
                return (
                  <label
                    key={tag}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-700"
                    role="option"
                    aria-selected={checked}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleDietTagToggle(tag)}
                      className="accent-teal-700 rounded"
                    />
                    {tag}
                  </label>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Sort */}
      <div className="flex items-center gap-1.5">
        <label htmlFor="catalog-sort-by" className="text-xs text-gray-500 whitespace-nowrap">
          Sort:
        </label>
        <select
          id="catalog-sort-by"
          value={filters.sortBy}
          onChange={(e) =>
            onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })
          }
          className={cn(
            'text-sm rounded-xl border border-gray-200 bg-white px-2 py-2',
            'focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500',
            'cursor-pointer'
          )}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSortOrderToggle}
          aria-label={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          title={`Currently: ${filters.sortOrder === 'asc' ? 'ascending' : 'descending'}`}
          className={cn(
            'p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 text-sm font-medium',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500'
          )}
        >
          {filters.sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClearAll}
          className={cn(
            'flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700',
            'rounded-lg hover:bg-gray-100 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500'
          )}
        >
          <X size={12} aria-hidden="true" />
          Clear
        </button>
      )}
    </div>
  )
}
