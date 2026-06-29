'use client'

/**
 * ProductForm — modal form for adding or editing a product.
 *
 * Client-side validation:
 * - Name is required
 * - Category is required
 * - Nutrition values must be ≥ 0
 * - Up to 10 alternative units (11th is blocked with an error)
 *
 * On submit: POST /products (add) or PUT /products/:id (edit).
 * On success: calls onSuccess(product) and closes.
 *
 * AC-033: valid form → product appears in catalog
 * AC-039: edit own product → changes reflected
 */

import { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import type { Product, CreateProductBody } from '@/lib/api/catalog'
import { createProduct, updateProduct } from '@/lib/api/catalog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

interface ProductFormProps {
  token: string
  editingProduct?: Product
  categories: string[]
  dietTagOptions: string[]
  onSuccess: (product: Product) => void
  onClose: () => void
}

interface FormErrors {
  name?: string
  category?: string
  calories?: string
  protein_g?: string
  fat_g?: string
  carbs_g?: string
  units?: string
  general?: string
}

// Hardcoded well-known diet tags + any tags from the loaded product list
const WELL_KNOWN_DIET_TAGS = [
  'dash',
  'healthy-fats',
  'keto',
  'mediterranean',
  'mind',
  'paleo',
  'plant-based',
  'protein-focused',
  'volumetrics',
]

interface UnitRow {
  unit_name: string
  grams_per_unit: string
}

function validateNonNegative(raw: string, label: string): string | undefined {
  if (raw === '') return `${label} is required.`
  const n = Number(raw)
  if (isNaN(n) || n < 0) return `${label} must be 0 or greater.`
  return undefined
}

export function ProductForm({
  token,
  editingProduct,
  categories,
  dietTagOptions,
  onSuccess,
  onClose,
}: ProductFormProps) {
  const isEditing = editingProduct !== undefined

  const [name, setName] = useState(editingProduct?.name ?? '')
  const [categoryInput, setCategoryInput] = useState(editingProduct?.category ?? '')
  const [selectedDietTags, setSelectedDietTags] = useState<string[]>(
    editingProduct?.diet_tags ?? []
  )
  const [calories, setCalories] = useState(
    editingProduct ? String(editingProduct.nutrition.calories) : ''
  )
  const [proteinG, setProteinG] = useState(
    editingProduct ? String(editingProduct.nutrition.protein_g) : ''
  )
  const [fatG, setFatG] = useState(editingProduct ? String(editingProduct.nutrition.fat_g) : '')
  const [carbsG, setCarbsG] = useState(
    editingProduct ? String(editingProduct.nutrition.carbs_g) : ''
  )
  const [unitRows, setUnitRows] = useState<UnitRow[]>(
    editingProduct?.units.map((u) => ({
      unit_name: u.unit_name,
      grams_per_unit: String(u.grams_per_unit),
    })) ?? []
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Merge well-known tags with any diet tags from existing products
  const allDietTags = Array.from(new Set([...WELL_KNOWN_DIET_TAGS, ...dietTagOptions])).sort()

  function handleDietTagToggle(tag: string) {
    setSelectedDietTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function handleAddUnit() {
    if (unitRows.length >= 10) return
    setUnitRows((prev) => [...prev, { unit_name: '', grams_per_unit: '' }])
  }

  function handleRemoveUnit(index: number) {
    setUnitRows((prev) => prev.filter((_, i) => i !== index))
  }

  function handleUnitChange(index: number, field: keyof UnitRow, value: string) {
    setUnitRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!name.trim()) errs.name = 'Name is required.'
    if (!categoryInput.trim()) errs.category = 'Category is required.'
    errs.calories = validateNonNegative(calories, 'Calories')
    errs.protein_g = validateNonNegative(proteinG, 'Protein')
    errs.fat_g = validateNonNegative(fatG, 'Fat')
    errs.carbs_g = validateNonNegative(carbsG, 'Carbs')
    if (unitRows.length > 10) {
      errs.units = 'Maximum 10 alternative units allowed.'
    } else {
      for (const row of unitRows) {
        if (!row.unit_name.trim()) {
          errs.units = 'Each unit must have a name.'
          break
        }
        const g = Number(row.grams_per_unit)
        if (row.grams_per_unit === '' || isNaN(g) || g <= 0) {
          errs.units = 'Each unit must have a positive gram value.'
          break
        }
      }
    }
    // Remove undefined entries
    return Object.fromEntries(Object.entries(errs).filter(([, v]) => v !== undefined)) as FormErrors
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setIsSubmitting(true)

    const body: CreateProductBody = {
      name: name.trim(),
      category: categoryInput.trim(),
      diet_tags: selectedDietTags,
      nutrition: {
        calories: Number(calories),
        protein_g: Number(proteinG),
        fat_g: Number(fatG),
        carbs_g: Number(carbsG),
      },
      units: unitRows.map((row) => ({
        unit_name: row.unit_name.trim(),
        grams_per_unit: Number(row.grams_per_unit),
      })),
    }

    const request = isEditing
      ? updateProduct(token, editingProduct.id, body)
      : createProduct(token, body)

    request
      .then((product) => {
        setIsSubmitting(false)
        onSuccess(product)
      })
      .catch((err: unknown) => {
        setIsSubmitting(false)
        const detail =
          typeof err === 'object' && err !== null && 'detail' in err
            ? String((err as { detail: string }).detail)
            : 'An error occurred. Please try again.'
        setErrors({ general: detail })
      })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <h2 id="product-form-title" className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit product' : 'Add product'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className={cn(
              'p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500'
            )}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Form — scrollable */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-6 space-y-5">
            {errors.general && (
              <div
                className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
                role="alert"
              >
                {errors.general}
              </div>
            )}

            {/* Name */}
            <Input
              label="Product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              required
              placeholder="e.g. Greek yogurt"
            />

            {/* Category — datalist input for autocomplete from existing categories */}
            <div className="flex flex-col gap-1">
              <label htmlFor="product-form-category" className="text-xs font-medium text-gray-600">
                Category{' '}
                <span className="text-red-500" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="product-form-category"
                list="product-form-category-list"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                required
                aria-required="true"
                aria-invalid={errors.category ? true : undefined}
                placeholder="e.g. Dairy"
                className={cn(
                  'w-full rounded-xl border px-3 py-2 text-sm bg-white placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-offset-0',
                  errors.category
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                    : 'border-gray-200 focus:border-teal-500 focus:ring-teal-100'
                )}
              />
              <datalist id="product-form-category-list">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              {errors.category && (
                <p role="alert" className="text-xs text-red-600">
                  {errors.category}
                </p>
              )}
            </div>

            {/* Nutrition */}
            <fieldset>
              <legend className="text-xs font-medium text-gray-600 mb-2">
                Nutrition per 100 g
              </legend>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Calories"
                  type="number"
                  min="0"
                  step="0.1"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  error={errors.calories}
                  required
                />
                <Input
                  label="Protein (g)"
                  type="number"
                  min="0"
                  step="0.1"
                  value={proteinG}
                  onChange={(e) => setProteinG(e.target.value)}
                  error={errors.protein_g}
                  required
                />
                <Input
                  label="Fat (g)"
                  type="number"
                  min="0"
                  step="0.1"
                  value={fatG}
                  onChange={(e) => setFatG(e.target.value)}
                  error={errors.fat_g}
                  required
                />
                <Input
                  label="Carbs (g)"
                  type="number"
                  min="0"
                  step="0.1"
                  value={carbsG}
                  onChange={(e) => setCarbsG(e.target.value)}
                  error={errors.carbs_g}
                  required
                />
              </div>
            </fieldset>

            {/* Diet tags */}
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">Diet tags</p>
              <div className="flex flex-wrap gap-1.5">
                {allDietTags.map((tag) => {
                  const selected = selectedDietTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleDietTagToggle(tag)}
                      aria-pressed={selected}
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
                        selected
                          ? 'bg-teal-700 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Alternative units */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-600">
                  Alternative units{' '}
                  <span className="text-gray-400 font-normal">(optional, max 10)</span>
                </p>
                {unitRows.length < 10 && (
                  <button
                    type="button"
                    onClick={handleAddUnit}
                    className={cn(
                      'flex items-center gap-1 text-xs text-teal-700 hover:text-teal-900 font-medium',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded'
                    )}
                  >
                    <Plus size={12} aria-hidden="true" />
                    Add unit
                  </button>
                )}
              </div>
              {errors.units && (
                <p role="alert" className="text-xs text-red-600 mb-2">
                  {errors.units}
                </p>
              )}
              {unitRows.length > 0 && (
                <div className="space-y-2">
                  {unitRows.map((row, i) => (
                    <div key={i} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label
                          htmlFor={`unit-name-${i}`}
                          className="text-xs text-gray-500 block mb-1"
                        >
                          Unit name
                        </label>
                        <input
                          id={`unit-name-${i}`}
                          type="text"
                          value={row.unit_name}
                          onChange={(e) => handleUnitChange(i, 'unit_name', e.target.value)}
                          placeholder="e.g. cup"
                          className={cn(
                            'w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white',
                            'focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500'
                          )}
                        />
                      </div>
                      <div className="w-28">
                        <label
                          htmlFor={`unit-grams-${i}`}
                          className="text-xs text-gray-500 block mb-1"
                        >
                          Grams
                        </label>
                        <input
                          id={`unit-grams-${i}`}
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={row.grams_per_unit}
                          onChange={(e) => handleUnitChange(i, 'grams_per_unit', e.target.value)}
                          placeholder="240"
                          className={cn(
                            'w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white',
                            'focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500'
                          )}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveUnit(i)}
                        aria-label={`Remove unit ${row.unit_name || i + 1}`}
                        className={cn(
                          'p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500'
                        )}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isEditing ? 'Save changes' : 'Add product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
