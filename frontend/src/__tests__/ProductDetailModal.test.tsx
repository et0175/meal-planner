/**
 * RTL integration tests for ProductDetailModal.
 * Covers: rendering, ownership gating, close, week flag, edit/delete.
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductDetailModal } from '@/catalog/ProductDetailModal'
import type { Product } from '@/lib/api/catalog'

// Mock the catalog API so tests don't make real HTTP calls
const mockSetWeekFlag = jest.fn()
jest.mock('@/lib/api/catalog', () => ({
  setWeekFlag: (...args: unknown[]) => mockSetWeekFlag(...args),
}))

const GLOBAL_PRODUCT: Product = {
  id: 10,
  name: 'Atlantic salmon',
  category: 'Fish',
  diet_tags: ['mediterranean', 'keto', 'paleo'],
  owner_id: null,
  is_deleted: false,
  nutrition: { calories: 208, protein_g: 20, fat_g: 13, carbs_g: 0 },
  units: [{ id: 1, unit_name: 'fillet', grams_per_unit: 120 }],
  week_flag: null,
}

const OWN_PRODUCT: Product = {
  id: 20,
  name: 'Hemp seeds',
  category: 'Nuts & Seeds',
  diet_tags: ['plant-based'],
  owner_id: 42,
  is_deleted: false,
  nutrition: { calories: 166, protein_g: 9.5, fat_g: 14.6, carbs_g: 2.6 },
  units: [],
  week_flag: { flag: 'this_week' },
}

const OTHER_PRODUCT: Product = {
  ...OWN_PRODUCT,
  id: 30,
  owner_id: 99, // belongs to a different user
}

function setup(
  product: Product,
  currentAccountId: number | null = 42,
  overrides: {
    onClose?: () => void
    onEdit?: (p: Product) => void
    onDelete?: (p: Product) => void
    onProductUpdated?: (p: Product) => void
  } = {}
) {
  const onClose = overrides.onClose ?? jest.fn()
  const onEdit = overrides.onEdit ?? jest.fn()
  const onDelete = overrides.onDelete ?? jest.fn()
  const onProductUpdated = overrides.onProductUpdated ?? jest.fn()

  render(
    <ProductDetailModal
      product={product}
      token="test-token"
      currentAccountId={currentAccountId}
      onClose={onClose}
      onEdit={onEdit}
      onDelete={onDelete}
      onProductUpdated={onProductUpdated}
    />
  )

  return { onClose, onEdit, onDelete, onProductUpdated }
}

describe('ProductDetailModal', () => {
  beforeEach(() => {
    mockSetWeekFlag.mockReset()
  })

  it('renders product name and category', () => {
    setup(GLOBAL_PRODUCT)
    expect(screen.getByRole('heading', { name: /atlantic salmon/i })).toBeInTheDocument()
    expect(screen.getByText('Fish')).toBeInTheDocument()
  })

  it('renders diet tags', () => {
    setup(GLOBAL_PRODUCT)
    expect(screen.getByText('mediterranean')).toBeInTheDocument()
    expect(screen.getByText('keto')).toBeInTheDocument()
    expect(screen.getByText('paleo')).toBeInTheDocument()
  })

  it('renders macro chart aria label (AC-032)', () => {
    setup(GLOBAL_PRODUCT)
    expect(screen.getByRole('img', { name: /macro distribution/i })).toBeInTheDocument()
  })

  it('renders unit conversion table with base row (AC-032, AC-111)', () => {
    setup(GLOBAL_PRODUCT)
    // Base 100 g row is always present
    expect(screen.getByText('100 g')).toBeInTheDocument()
    // Alternative unit
    expect(screen.getByText('1 fillet')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
  })

  it('AC-111: single-unit product renders one-row table (just 100 g base row)', () => {
    const noAltUnits: Product = { ...GLOBAL_PRODUCT, units: [] }
    setup(noAltUnits)
    expect(screen.getByText('100 g')).toBeInTheDocument()
    // No alternative unit rows
    expect(screen.queryByText('1 fillet')).not.toBeInTheDocument()
  })

  it('renders week flag toggle with three options', () => {
    setup(GLOBAL_PRODUCT)
    const group = screen.getByRole('group', { name: /week flag/i })
    expect(group).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^none$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /this week/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next week/i })).toBeInTheDocument()
  })

  it('active week flag button has aria-pressed=true', () => {
    setup(OWN_PRODUCT) // week_flag: this_week
    expect(screen.getByRole('button', { name: /this week/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: /^none$/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking week flag calls setWeekFlag API (AC-043/044)', async () => {
    const onProductUpdated = jest.fn()
    const updatedProduct = { ...GLOBAL_PRODUCT, week_flag: { flag: 'this_week' as const } }
    mockSetWeekFlag.mockResolvedValue(updatedProduct)

    setup(GLOBAL_PRODUCT, 42, { onProductUpdated })
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /this week/i }))

    await waitFor(() => expect(onProductUpdated).toHaveBeenCalledWith(updatedProduct))
    expect(mockSetWeekFlag).toHaveBeenCalledWith('test-token', GLOBAL_PRODUCT.id, 'this_week')
  })

  it('week flag error is shown when API call fails', async () => {
    mockSetWeekFlag.mockRejectedValue({ status: 500, detail: 'Server error' })

    setup(GLOBAL_PRODUCT)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /this week/i }))

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.getByRole('alert')).toHaveTextContent(/failed to update/i)
  })

  it('shows global product notice (no edit/delete for global products)', () => {
    setup(GLOBAL_PRODUCT, 42)
    expect(screen.getByText(/global product/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('shows edit and delete buttons for own product (AC-039, AC-040/042)', () => {
    setup(OWN_PRODUCT, 42) // owner_id matches currentAccountId
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('hides edit and delete buttons for another user product (AC-040/042)', () => {
    setup(OTHER_PRODUCT, 42) // owner_id 99 ≠ 42
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('clicking Edit calls onEdit with the product', async () => {
    const onEdit = jest.fn()
    setup(OWN_PRODUCT, 42, { onEdit })
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /edit/i }))

    expect(onEdit).toHaveBeenCalledWith(OWN_PRODUCT)
  })

  it('clicking Delete calls onDelete with the product', async () => {
    const onDelete = jest.fn()
    setup(OWN_PRODUCT, 42, { onDelete })
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(onDelete).toHaveBeenCalledWith(OWN_PRODUCT)
  })

  it('close button calls onClose', async () => {
    const onClose = jest.fn()
    setup(GLOBAL_PRODUCT, null, { onClose })
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /close product details/i }))

    expect(onClose).toHaveBeenCalled()
  })

  it('clicking backdrop calls onClose', async () => {
    const onClose = jest.fn()
    setup(GLOBAL_PRODUCT, null, { onClose })
    const user = userEvent.setup()

    // Backdrop is the element with aria-hidden="true" behind the panel
    const backdrop = document.querySelector('[aria-hidden="true"]') as HTMLElement
    await user.click(backdrop)

    expect(onClose).toHaveBeenCalled()
  })
})
