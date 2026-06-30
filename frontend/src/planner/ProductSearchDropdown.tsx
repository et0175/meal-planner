'use client'

/**
 * ProductSearchDropdown — combobox for searching products in the planning service.
 *
 * AC-062: type "oa" → recently used first (order determined by backend GET /plan/search)
 * AC-121: no history → alphabetical (order determined by backend)
 */

import { useState, useRef, useEffect, useReducer } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { searchPlanProducts, type SearchProduct } from '@/lib/api/planning'

interface ProductSearchDropdownProps {
  token: string
  placeholder?: string
  onSelect: (product: SearchProduct) => void
  className?: string
  autoFocus?: boolean
}

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'results'; results: SearchProduct[] }
  | { status: 'empty' }

type SearchAction =
  | { type: 'SEARCH' }
  | { type: 'RESULTS'; results: SearchProduct[] }
  | { type: 'RESET' }

function searchReducer(_prev: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SEARCH':
      return { status: 'loading' }
    case 'RESULTS':
      return action.results.length > 0
        ? { status: 'results', results: action.results }
        : { status: 'empty' }
    case 'RESET':
      return { status: 'idle' }
    default:
      return _prev
  }
}

export function ProductSearchDropdown({
  token,
  placeholder = 'Search products…',
  onSelect,
  className,
  autoFocus = false,
}: ProductSearchDropdownProps) {
  const [query, setQuery] = useState('')
  const [state, dispatch] = useReducer(searchReducer, { status: 'idle' })
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!q.trim()) {
      dispatch({ type: 'RESET' })
      setOpen(false)
      return
    }

    dispatch({ type: 'SEARCH' })
    setOpen(true)

    debounceRef.current = setTimeout(() => {
      searchPlanProducts(token, q)
        .then((results) => dispatch({ type: 'RESULTS', results }))
        .catch(() => dispatch({ type: 'RESULTS', results: [] }))
    }, 300)
  }

  function handleSelect(product: SearchProduct) {
    onSelect(product)
    setQuery('')
    dispatch({ type: 'RESET' })
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
      dispatch({ type: 'RESET' })
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && state.status !== 'idle' && setOpen(true)}
          placeholder={placeholder}
          aria-label="Search for a product"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={open ? 'product-search-list' : undefined}
          role="combobox"
          className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
        />
        {state.status === 'loading' && (
          <Loader2
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
            aria-hidden="true"
          />
        )}
      </div>

      {open && (
        <ul
          id="product-search-list"
          role="listbox"
          aria-label="Product search results"
          className="absolute z-30 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto"
        >
          {state.status === 'loading' && (
            <li className="px-3 py-2.5 text-sm text-gray-400">Searching…</li>
          )}
          {state.status === 'empty' && (
            <li className="px-3 py-2.5 text-sm text-gray-400">No products found.</li>
          )}
          {state.status === 'results' &&
            state.results.map((p) => (
              <li key={p.id} role="option" aria-selected="false">
                <button
                  type="button"
                  onClick={() => handleSelect(p)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-teal-50 cursor-pointer flex items-center justify-between gap-2 focus-visible:outline-none focus-visible:bg-teal-50"
                >
                  <span className="font-medium text-gray-900 truncate">{p.name}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {Math.round(p.kcal_per_unit)} kcal/{p.unit}
                  </span>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
