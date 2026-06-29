/**
 * RTL integration tests for ProductTable.
 * Covers: renders rows, empty state, column sort, row click.
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductTable } from '@/catalog/ProductTable'
import type { Product } from '@/lib/api/catalog'

const PRODUCT_A: Product = {
  id: 1,
  name: 'Atlantic salmon',
  category: 'Fish',
  diet_tags: ['mediterranean', 'keto'],
  owner_id: null,
  is_deleted: false,
  nutrition: { calories: 208, protein_g: 20, fat_g: 13, carbs_g: 0 },
  units: [{ id: 1, unit_name: 'fillet', grams_per_unit: 120 }],
  week_flag: null,
}

const PRODUCT_B: Product = {
  id: 2,
  name: 'Greek yogurt',
  category: 'Dairy',
  diet_tags: ['protein-focused'],
  owner_id: 42,
  is_deleted: false,
  nutrition: { calories: 88, protein_g: 15, fat_g: 0.6, carbs_g: 5.4 },
  units: [],
  week_flag: { flag: 'this_week' },
}

function setup(products: Product[] = [PRODUCT_A, PRODUCT_B], overrides = {}) {
  const onSortChange = jest.fn()
  const onProductClick = jest.fn()

  render(
    <ProductTable
      products={products}
      sortBy="name"
      sortOrder="asc"
      onSortChange={onSortChange}
      onProductClick={onProductClick}
      {...overrides}
    />
  )
  return { onSortChange, onProductClick }
}

describe('ProductTable', () => {
  it('renders a row for each product', () => {
    setup()
    expect(screen.getByText('Atlantic salmon')).toBeInTheDocument()
    expect(screen.getByText('Greek yogurt')).toBeInTheDocument()
  })

  it('shows empty state when products array is empty (AC-026)', () => {
    setup([])
    expect(screen.getByText(/no products match your filters/i)).toBeInTheDocument()
  })

  it('renders nutrition columns for each row', () => {
    setup([PRODUCT_A])
    // calories, protein, fat, carbs
    expect(screen.getByText('208')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('13')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('shows diet tags (up to 3) in each row', () => {
    setup([PRODUCT_A])
    expect(screen.getByText('mediterranean')).toBeInTheDocument()
    expect(screen.getByText('keto')).toBeInTheDocument()
  })

  it('truncates diet tags beyond 3 with a "+N" label', () => {
    const manyTags: Product = {
      ...PRODUCT_A,
      diet_tags: ['a', 'b', 'c', 'd', 'e'],
    }
    setup([manyTags])
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('clicking a row calls onProductClick with that product', async () => {
    const { onProductClick } = setup()
    const user = userEvent.setup()

    const row = screen.getByRole('button', { name: /view atlantic salmon/i })
    await user.click(row)

    expect(onProductClick).toHaveBeenCalledWith(PRODUCT_A)
  })

  it('pressing Enter on a row calls onProductClick', async () => {
    const { onProductClick } = setup()
    const user = userEvent.setup()

    const row = screen.getByRole('button', { name: /view atlantic salmon/i })
    row.focus()
    await user.keyboard('{Enter}')

    expect(onProductClick).toHaveBeenCalledWith(PRODUCT_A)
  })

  it('clicking column header calls onSortChange (AC-031)', async () => {
    const { onSortChange } = setup()
    const user = userEvent.setup()

    const proteinHeader = screen.getByRole('columnheader', { name: /protein/i })
    await user.click(proteinHeader)

    expect(onSortChange).toHaveBeenCalledWith('protein_g')
  })

  it('active sort column shows ascending/descending indicator', () => {
    setup([PRODUCT_A], { sortBy: 'name' as const, sortOrder: 'asc' as const })
    const nameHeader = screen.getByRole('columnheader', { name: /^name/i })
    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending')
  })

  it('inactive sort columns have aria-sort="none"', () => {
    setup()
    const categoryHeader = screen.getByRole('columnheader', { name: /^category/i })
    expect(categoryHeader).toHaveAttribute('aria-sort', 'none')
  })
})
