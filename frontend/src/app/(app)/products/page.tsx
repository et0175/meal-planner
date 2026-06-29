'use client'

/**
 * Products page — Product Catalog UI (CARD-004).
 *
 * Two views:
 *  - "categories" (default): grid of category cards — clicking one reveals
 *    that category's products in the list view (AC-024)
 *  - "list": sortable table with filter bar (AC-025)
 *
 * Filtering and sorting are applied client-side on the full product set
 * that is loaded once on mount (category + search filters, diet tags, sort).
 *
 * Modals:
 *  - ProductDetailModal: opens on row/card click (AC-032)
 *  - ProductForm: for add (AC-033) and edit (AC-039)
 *
 * useReducer is used for async loading state so dispatch() can be called
 * synchronously inside useEffect (avoids react-hooks/set-state-in-effect rule).
 */

import { useEffect, useMemo, useReducer, useState } from 'react'
import { LayoutGrid, List, Plus } from 'lucide-react'
import { getProducts, deleteProduct, type Product } from '@/lib/api/catalog'
import { getStoredToken } from '@/lib/hooks/useAuth'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { FilterBar, type FilterState } from '@/catalog/FilterBar'
import { CategoryGrid } from '@/catalog/CategoryGrid'
import { ProductTable } from '@/catalog/ProductTable'
import { ProductDetailModal } from '@/catalog/ProductDetailModal'
import { ProductForm } from '@/catalog/ProductForm'
import { cn } from '@/lib/utils/cn'

// ── Types ──────────────────────────────────────────────────────────────────

type PageView = 'categories' | 'list'

const DEFAULT_FILTERS: FilterState = {
  search: '',
  category: '',
  dietTags: [],
  sortBy: 'name',
  sortOrder: 'asc',
}

// ── Fetch state (useReducer to allow dispatch inside useEffect) ────────────

interface FetchState {
  isLoading: boolean
  error: string | null
  products: Product[]
}

type FetchAction =
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; products: Product[] }
  | { type: 'ERROR'; error: string }

function fetchReducer(state: FetchState, action: FetchAction): FetchState {
  switch (action.type) {
    case 'LOADING':
      return { isLoading: true, error: null, products: state.products }
    case 'SUCCESS':
      return { isLoading: false, error: null, products: action.products }
    case 'ERROR':
      return { isLoading: false, error: action.error, products: state.products }
    default:
      return state
  }
}

// ── Sort helper ────────────────────────────────────────────────────────────

function sortProducts(
  products: Product[],
  sortBy: FilterState['sortBy'],
  sortOrder: FilterState['sortOrder']
): Product[] {
  return [...products].sort((a, b) => {
    let cmp: number
    switch (sortBy) {
      case 'name':
        cmp = a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        break
      case 'category':
        cmp = a.category.toLowerCase().localeCompare(b.category.toLowerCase())
        break
      case 'calories':
        cmp = a.nutrition.calories - b.nutrition.calories
        break
      case 'protein_g':
        cmp = a.nutrition.protein_g - b.nutrition.protein_g
        break
      case 'fat_g':
        cmp = a.nutrition.fat_g - b.nutrition.fat_g
        break
      case 'carbs_g':
        cmp = a.nutrition.carbs_g - b.nutrition.carbs_g
        break
      default:
        cmp = 0
    }
    return sortOrder === 'asc' ? cmp : -cmp
  })
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const { session } = useAuth()

  // Async fetch state
  const [{ isLoading, error, products: allProducts }, dispatchFetch] = useReducer(fetchReducer, {
    isLoading: true,
    error: null,
    products: [],
  })
  // Trigger counter — increment to retry the fetch
  const [fetchTrigger, setFetchTrigger] = useState(0)

  // UI state
  const [view, setView] = useState<PageView>('categories')
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // ── Derived ──────────────────────────────────────────────────────────────

  const categories = useMemo(
    () => Array.from(new Set(allProducts.map((p) => p.category))).sort(),
    [allProducts]
  )

  const dietTagOptions = useMemo(
    () => Array.from(new Set(allProducts.flatMap((p) => p.diet_tags))).sort(),
    [allProducts]
  )

  /** Products after client-side filtering and sorting. */
  const displayedProducts = useMemo(() => {
    let result = allProducts

    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q))
    }

    if (filters.category) {
      result = result.filter((p) => p.category === filters.category)
    }

    if (filters.dietTags.length > 0) {
      result = result.filter((p) => filters.dietTags.every((t) => p.diet_tags.includes(t)))
    }

    return sortProducts(result, filters.sortBy, filters.sortOrder)
  }, [allProducts, filters])

  // ── Fetch ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const token = getStoredToken()
    if (!token) return
    dispatchFetch({ type: 'LOADING' })
    getProducts(token)
      .then((products) => {
        dispatchFetch({ type: 'SUCCESS', products })
      })
      .catch(() => {
        dispatchFetch({ type: 'ERROR', error: 'Failed to load products. Please try again.' })
      })
  }, [fetchTrigger])

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleCategorySelect(category: string) {
    setFilters({ ...DEFAULT_FILTERS, category })
    setView('list')
  }

  function handleFilterChange(newFilters: FilterState) {
    setFilters(newFilters)
    if (view === 'categories') setView('list')
  }

  function handleSortChange(col: FilterState['sortBy']) {
    setFilters((prev) => ({
      ...prev,
      sortBy: col,
      sortOrder: prev.sortBy === col && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }))
  }

  function handleProductUpdated(updated: Product) {
    dispatchFetch({
      type: 'SUCCESS',
      products: allProducts.map((p) => (p.id === updated.id ? updated : p)),
    })
    setSelectedProduct(updated)
  }

  function handleFormSuccess(product: Product) {
    const isEdit = editingProduct !== undefined
    dispatchFetch({
      type: 'SUCCESS',
      products: isEdit
        ? allProducts.map((p) => (p.id === product.id ? product : p))
        : [...allProducts, product],
    })
    setShowForm(false)
    setEditingProduct(undefined)
    setSelectedProduct(product)
  }

  function handleEdit(product: Product) {
    setSelectedProduct(null)
    setEditingProduct(product)
    setShowForm(true)
  }

  function handleDelete(product: Product) {
    const token = getStoredToken()
    if (!token) return
    setDeleteError(null)
    deleteProduct(token, product.id)
      .then(() => {
        dispatchFetch({
          type: 'SUCCESS',
          products: allProducts.filter((p) => p.id !== product.id),
        })
        setSelectedProduct(null)
      })
      .catch(() => {
        setDeleteError('Failed to delete the product. Please try again.')
      })
  }

  function handleOpenAddForm() {
    setEditingProduct(undefined)
    setShowForm(true)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24" role="status" aria-live="polite">
        <span className="sr-only">Loading products…</span>
        <span
          className="h-8 w-8 animate-spin rounded-full border-4 border-teal-700 border-t-transparent"
          aria-hidden="true"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-red-600 text-sm">{error}</p>
        <Button variant="ghost" size="sm" onClick={() => setFetchTrigger((n) => n + 1)}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        {/* View toggle */}
        <div
          className="flex rounded-xl border border-gray-200 bg-white overflow-hidden"
          role="group"
          aria-label="Product view"
        >
          <button
            type="button"
            onClick={() => setView('categories')}
            aria-pressed={view === 'categories'}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500',
              view === 'categories' ? 'bg-teal-700 text-white' : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            <LayoutGrid size={15} aria-hidden="true" />
            Categories
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500',
              view === 'list' ? 'bg-teal-700 text-white' : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            <List size={15} aria-hidden="true" />
            List
          </button>
        </div>

        {/* Add product */}
        <Button onClick={handleOpenAddForm}>
          <Plus size={15} aria-hidden="true" />
          Add product
        </Button>
      </div>

      {/* Filter bar — only in list view */}
      {view === 'list' && (
        <div className="mb-5">
          <FilterBar
            filters={filters}
            categories={categories}
            dietTagOptions={dietTagOptions}
            onChange={handleFilterChange}
          />
        </div>
      )}

      {/* Delete error */}
      {deleteError && (
        <div
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
          role="alert"
        >
          {deleteError}
        </div>
      )}

      {/* Main content */}
      {view === 'categories' ? (
        <CategoryGrid products={allProducts} onCategorySelect={handleCategorySelect} />
      ) : (
        <ProductTable
          products={displayedProducts}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSortChange={handleSortChange}
          onProductClick={setSelectedProduct}
        />
      )}

      {/* Detail modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          token={session?.token ?? getStoredToken() ?? ''}
          currentAccountId={session?.accountId ?? null}
          onClose={() => setSelectedProduct(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onProductUpdated={handleProductUpdated}
        />
      )}

      {/* Add / edit form */}
      {showForm && (
        <ProductForm
          token={session?.token ?? getStoredToken() ?? ''}
          editingProduct={editingProduct}
          categories={categories}
          dietTagOptions={dietTagOptions}
          onSuccess={handleFormSuccess}
          onClose={() => {
            setShowForm(false)
            setEditingProduct(undefined)
          }}
        />
      )}
    </>
  )
}
