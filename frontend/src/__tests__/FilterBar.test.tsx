/**
 * RTL integration tests for FilterBar.
 * Covers: search, category, diet tags, sort, clear.
 */

import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterBar, type FilterState } from '@/catalog/FilterBar'

const BASE_FILTERS: FilterState = {
  search: '',
  category: '',
  dietTags: [],
  sortBy: 'name',
  sortOrder: 'asc',
}

const CATEGORIES = ['Dairy', 'Fish', 'Meat']
const DIET_TAGS = ['keto', 'mediterranean', 'paleo']

function setup(filters: FilterState = BASE_FILTERS, onChange = jest.fn()) {
  render(
    <FilterBar
      filters={filters}
      categories={CATEGORIES}
      dietTagOptions={DIET_TAGS}
      onChange={onChange}
    />
  )
  return { onChange }
}

describe('FilterBar', () => {
  it('renders search, category, diet tags and sort controls', () => {
    setup()
    expect(screen.getByRole('searchbox', { name: /search products/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /category/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /diet tags/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /sort/i })).toBeInTheDocument()
  })

  it('does not render clear button when no active filters', () => {
    setup()
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
  })

  it('category change fires onChange with new category', async () => {
    const onChange = jest.fn()
    setup(BASE_FILTERS, onChange)
    const user = userEvent.setup()

    const select = screen.getByRole('combobox', { name: /category/i })
    await user.selectOptions(select, 'Dairy')

    expect(onChange).toHaveBeenCalledWith({ ...BASE_FILTERS, category: 'Dairy' })
  })

  it('sort column change fires onChange', async () => {
    const onChange = jest.fn()
    setup(BASE_FILTERS, onChange)
    const user = userEvent.setup()

    const sortSelect = screen.getByRole('combobox', { name: /sort/i })
    await user.selectOptions(sortSelect, 'protein_g')

    expect(onChange).toHaveBeenCalledWith({ ...BASE_FILTERS, sortBy: 'protein_g' })
  })

  it('sort order toggle flips asc → desc', async () => {
    const onChange = jest.fn()
    setup(BASE_FILTERS, onChange)
    const user = userEvent.setup()

    const toggleBtn = screen.getByRole('button', { name: /sort descending/i })
    await user.click(toggleBtn)

    expect(onChange).toHaveBeenCalledWith({ ...BASE_FILTERS, sortOrder: 'desc' })
  })

  it('diet tag dropdown opens and toggles a tag', async () => {
    const onChange = jest.fn()
    setup(BASE_FILTERS, onChange)
    const user = userEvent.setup()

    // Open dropdown
    await user.click(screen.getByRole('button', { name: /diet tags/i }))
    expect(screen.getByRole('listbox', { name: /diet tags/i })).toBeInTheDocument()

    // Toggle "keto"
    const ketoCheckbox = screen.getByRole('checkbox', { name: /keto/i })
    await user.click(ketoCheckbox)

    expect(onChange).toHaveBeenCalledWith({ ...BASE_FILTERS, dietTags: ['keto'] })
  })

  it('shows clear button when category filter is active', () => {
    setup({ ...BASE_FILTERS, category: 'Dairy' })
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
  })

  it('clear button resets all filters', async () => {
    const onChange = jest.fn()
    setup({ ...BASE_FILTERS, category: 'Dairy', dietTags: ['keto'] }, onChange)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /clear/i }))

    expect(onChange).toHaveBeenCalledWith({
      search: '',
      category: '',
      dietTags: [],
      sortBy: 'name',
      sortOrder: 'asc',
    })
  })

  it('search input debounces onChange (fires after 300 ms)', async () => {
    jest.useFakeTimers()
    const onChange = jest.fn()
    setup(BASE_FILTERS, onChange)
    const user = userEvent.setup({ delay: null })

    const searchInput = screen.getByRole('searchbox', { name: /search products/i })
    await user.type(searchInput, 'chia')

    // Callback not yet fired
    expect(onChange).not.toHaveBeenCalled()

    // Advance timer
    act(() => jest.runAllTimers())

    expect(onChange).toHaveBeenCalledWith({ ...BASE_FILTERS, search: 'chia' })

    jest.useRealTimers()
  })

  it('shows badge count on diet tags button when tags selected', () => {
    setup({ ...BASE_FILTERS, dietTags: ['keto', 'paleo'] })
    // The button shows "2" badge
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('active diet tag appears checked when dropdown is opened', async () => {
    setup({ ...BASE_FILTERS, dietTags: ['keto'] })
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /diet tags/i }))

    await waitFor(() => {
      const ketoCheckbox = screen.getByRole('checkbox', { name: /keto/i })
      expect(ketoCheckbox).toBeChecked()
    })
  })
})
