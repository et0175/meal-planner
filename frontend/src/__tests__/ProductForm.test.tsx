/**
 * RTL integration tests for ProductForm.
 * Covers: add mode, edit mode, validation, submit, cancel, unit management.
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductForm } from '@/catalog/ProductForm'
import type { Product } from '@/lib/api/catalog'

// Mock catalog API
const mockCreateProduct = jest.fn()
const mockUpdateProduct = jest.fn()

jest.mock('@/lib/api/catalog', () => ({
  createProduct: (...args: unknown[]) => mockCreateProduct(...args),
  updateProduct: (...args: unknown[]) => mockUpdateProduct(...args),
}))

const EXISTING_PRODUCT: Product = {
  id: 42,
  name: 'Greek yogurt',
  category: 'Dairy',
  diet_tags: ['mediterranean', 'keto'],
  owner_id: 1,
  is_deleted: false,
  nutrition: { calories: 88, protein_g: 15, fat_g: 0.6, carbs_g: 5.4 },
  units: [{ id: 1, unit_name: 'cup', grams_per_unit: 245 }],
  week_flag: null,
}

const CREATED_PRODUCT: Product = {
  id: 99,
  name: 'Hemp seeds',
  category: 'Nuts',
  diet_tags: ['plant-based'],
  owner_id: 1,
  is_deleted: false,
  nutrition: { calories: 166, protein_g: 9.5, fat_g: 14.6, carbs_g: 2.6 },
  units: [],
  week_flag: null,
}

function setup(
  editingProduct?: Product,
  overrides: { onSuccess?: jest.Mock; onClose?: jest.Mock } = {}
) {
  const onSuccess = overrides.onSuccess ?? jest.fn()
  const onClose = overrides.onClose ?? jest.fn()

  render(
    <ProductForm
      token="test-token"
      editingProduct={editingProduct}
      categories={['Dairy', 'Fish', 'Meat']}
      dietTagOptions={['keto', 'mediterranean']}
      onSuccess={onSuccess}
      onClose={onClose}
    />
  )

  return { onSuccess, onClose }
}

describe('ProductForm', () => {
  beforeEach(() => {
    mockCreateProduct.mockReset()
    mockUpdateProduct.mockReset()
  })

  // ── Add mode ──────────────────────────────────────────────────────────────

  it('renders "Add product" title in add mode', () => {
    setup()
    expect(screen.getByRole('heading', { name: /add product/i })).toBeInTheDocument()
  })

  it('renders empty fields in add mode', () => {
    setup()
    expect(screen.getByLabelText(/product name/i)).toHaveValue('')
    expect(screen.getByLabelText(/calories/i)).toHaveValue(null)
  })

  // ── Edit mode ─────────────────────────────────────────────────────────────

  it('renders "Edit product" title in edit mode', () => {
    setup(EXISTING_PRODUCT)
    expect(screen.getByRole('heading', { name: /edit product/i })).toBeInTheDocument()
  })

  it('pre-fills fields with existing product data', () => {
    setup(EXISTING_PRODUCT)
    expect(screen.getByLabelText(/product name/i)).toHaveValue('Greek yogurt')
    expect(screen.getByLabelText(/calories/i)).toHaveValue(88)
    expect(screen.getByLabelText(/protein/i)).toHaveValue(15)
  })

  it('pre-fills alternative unit row', () => {
    setup(EXISTING_PRODUCT)
    expect(screen.getByDisplayValue('cup')).toBeInTheDocument()
    expect(screen.getByDisplayValue('245')).toBeInTheDocument()
  })

  // ── Validation ────────────────────────────────────────────────────────────

  it('shows error for empty name on submit', async () => {
    setup()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /add product/i }))

    await waitFor(() => expect(screen.getByText(/name is required/i)).toBeInTheDocument())
    expect(mockCreateProduct).not.toHaveBeenCalled()
  })

  it('shows error for missing category on submit', async () => {
    setup()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/product name/i), 'Hemp seeds')
    await user.click(screen.getByRole('button', { name: /add product/i }))

    await waitFor(() => expect(screen.getByText(/category is required/i)).toBeInTheDocument())
  })

  it('shows error for negative calories', async () => {
    setup()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/product name/i), 'Test')
    await user.type(screen.getByPlaceholderText(/e.g. Dairy/i), 'Meat')
    await user.type(screen.getByLabelText(/calories/i), '-5')
    await user.click(screen.getByRole('button', { name: /add product/i }))

    await waitFor(() =>
      expect(screen.getAllByText(/must be 0 or greater/i).length).toBeGreaterThan(0)
    )
  })

  // ── Submit (add) ──────────────────────────────────────────────────────────

  it('calls createProduct and onSuccess on valid add submission (AC-033)', async () => {
    mockCreateProduct.mockResolvedValue(CREATED_PRODUCT)
    const { onSuccess } = setup()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/product name/i), 'Hemp seeds')
    await user.type(screen.getByPlaceholderText(/e.g. Dairy/i), 'Nuts')
    await user.type(screen.getByLabelText(/calories/i), '166')
    await user.type(screen.getByLabelText(/protein/i), '9.5')
    await user.type(screen.getByLabelText(/fat/i), '14.6')
    await user.type(screen.getByLabelText(/carbs/i), '2.6')

    await user.click(screen.getByRole('button', { name: /add product/i }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(CREATED_PRODUCT))
    expect(mockCreateProduct).toHaveBeenCalledWith(
      'test-token',
      expect.objectContaining({
        name: 'Hemp seeds',
        category: 'Nuts',
        nutrition: { calories: 166, protein_g: 9.5, fat_g: 14.6, carbs_g: 2.6 },
      })
    )
  })

  // ── Submit (edit) ─────────────────────────────────────────────────────────

  it('calls updateProduct on valid edit submission (AC-039)', async () => {
    const updated = { ...EXISTING_PRODUCT, name: 'Skyr' }
    mockUpdateProduct.mockResolvedValue(updated)
    const { onSuccess } = setup(EXISTING_PRODUCT)
    const user = userEvent.setup()

    const nameInput = screen.getByLabelText(/product name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Skyr')

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(updated))
    expect(mockUpdateProduct).toHaveBeenCalledWith(
      'test-token',
      EXISTING_PRODUCT.id,
      expect.objectContaining({ name: 'Skyr' })
    )
  })

  // ── Error from API ────────────────────────────────────────────────────────

  it('shows general error when API call fails', async () => {
    mockCreateProduct.mockRejectedValue({ status: 409, detail: 'Product limit reached' })
    setup()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/product name/i), 'Test')
    await user.type(screen.getByPlaceholderText(/e.g. Dairy/i), 'Meat')
    await user.type(screen.getByLabelText(/calories/i), '100')
    await user.type(screen.getByLabelText(/protein/i), '10')
    await user.type(screen.getByLabelText(/fat/i), '5')
    await user.type(screen.getByLabelText(/carbs/i), '10')

    await user.click(screen.getByRole('button', { name: /add product/i }))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/product limit reached/i)
    )
  })

  // ── Unit management ───────────────────────────────────────────────────────

  it('add unit button inserts a new unit row', async () => {
    setup()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /add unit/i }))

    expect(screen.getByLabelText(/unit name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/grams/i)).toBeInTheDocument()
  })

  it('remove unit button deletes the row', async () => {
    setup(EXISTING_PRODUCT)
    const user = userEvent.setup()

    // There is 1 unit row (cup)
    expect(screen.getByDisplayValue('cup')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /remove unit/i }))

    expect(screen.queryByDisplayValue('cup')).not.toBeInTheDocument()
  })

  // ── Cancel ────────────────────────────────────────────────────────────────

  it('Cancel button calls onClose', async () => {
    const { onClose } = setup()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onClose).toHaveBeenCalled()
  })

  it('close (×) button calls onClose', async () => {
    const { onClose } = setup()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /close form/i }))

    expect(onClose).toHaveBeenCalled()
  })

  // ── Diet tags ─────────────────────────────────────────────────────────────

  it('clicking a diet tag toggles it on', async () => {
    setup()
    const user = userEvent.setup()

    const ketoBtn = screen.getByRole('button', { name: /^keto$/i })
    expect(ketoBtn).toHaveAttribute('aria-pressed', 'false')

    await user.click(ketoBtn)

    expect(ketoBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('pre-selected diet tags are shown as pressed in edit mode', () => {
    setup(EXISTING_PRODUCT)
    expect(screen.getByRole('button', { name: /^keto$/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /^mediterranean$/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })
})
