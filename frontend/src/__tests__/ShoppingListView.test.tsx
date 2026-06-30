/**
 * RTL tests for ShoppingListView.
 *
 * Covers: empty state (AC-071, AC-119), category grouping (AC-074),
 * alphabetical category order, item display (name + quantity + unit).
 */

import { render, screen, within } from '@testing-library/react'
import { ShoppingListView } from '@/shopping/ShoppingListView'
import type { ShoppingItem } from '@/lib/api/shopping'

const MILK: ShoppingItem = {
  product_id: 1,
  product_name: 'Whole milk',
  category: 'Dairy',
  total_quantity: 500,
  unit: 'ml',
}

const OATS: ShoppingItem = {
  product_id: 2,
  product_name: 'Oats',
  category: 'Grains',
  total_quantity: 150,
  unit: 'g',
}

const YOGURT: ShoppingItem = {
  product_id: 3,
  product_name: 'Greek yogurt',
  category: 'Dairy',
  total_quantity: 200,
  unit: 'g',
}

const APPLE: ShoppingItem = {
  product_id: 4,
  product_name: 'Apple',
  category: 'Fruit',
  total_quantity: 3,
  unit: 'piece',
}

describe('ShoppingListView', () => {
  describe('empty state', () => {
    it('shows empty state message when items array is empty (AC-071, AC-119)', () => {
      render(<ShoppingListView items={[]} />)
      expect(screen.getByText(/no items in your shopping list/i)).toBeInTheDocument()
    })

    it('shows a helpful hint in empty state', () => {
      render(<ShoppingListView items={[]} />)
      expect(screen.getByText(/add meals to your plan/i)).toBeInTheDocument()
    })

    it('does not render a list when empty', () => {
      render(<ShoppingListView items={[]} />)
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })
  })

  describe('category grouping (AC-074)', () => {
    it('renders a section heading for each category', () => {
      render(<ShoppingListView items={[MILK, OATS]} />)
      expect(screen.getByRole('heading', { name: /dairy/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /grains/i })).toBeInTheDocument()
    })

    it('groups multiple items under the same category', () => {
      render(<ShoppingListView items={[MILK, YOGURT]} />)
      // Only one Dairy heading
      const dairyHeadings = screen.getAllByRole('heading', { name: /dairy/i })
      expect(dairyHeadings).toHaveLength(1)
      // Both items appear
      expect(screen.getByText('Whole milk')).toBeInTheDocument()
      expect(screen.getByText('Greek yogurt')).toBeInTheDocument()
    })

    it('sorts categories alphabetically', () => {
      render(<ShoppingListView items={[OATS, APPLE, MILK]} />)
      const headings = screen.getAllByRole('heading').map((h) => h.textContent?.trim())
      expect(headings).toEqual(['Dairy', 'Fruit', 'Grains'])
    })

    it('omits empty categories (only shows categories with items)', () => {
      render(<ShoppingListView items={[MILK]} />)
      expect(screen.queryByRole('heading', { name: /grains/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: /fruit/i })).not.toBeInTheDocument()
    })
  })

  describe('item display', () => {
    it('shows product name for each item', () => {
      render(<ShoppingListView items={[MILK, OATS]} />)
      expect(screen.getByText('Whole milk')).toBeInTheDocument()
      expect(screen.getByText('Oats')).toBeInTheDocument()
    })

    it('shows total quantity and unit for each item', () => {
      render(<ShoppingListView items={[MILK]} />)
      expect(screen.getByText('500 ml')).toBeInTheDocument()
    })

    it('shows correct quantity and unit for all items', () => {
      render(<ShoppingListView items={[MILK, OATS, APPLE]} />)
      expect(screen.getByText('500 ml')).toBeInTheDocument()
      expect(screen.getByText('150 g')).toBeInTheDocument()
      expect(screen.getByText('3 piece')).toBeInTheDocument()
    })

    it('renders items within the correct category section', () => {
      render(<ShoppingListView items={[MILK, YOGURT, OATS]} />)

      const dairySection = screen.getByRole('region', { name: /dairy/i })
      expect(within(dairySection).getByText('Whole milk')).toBeInTheDocument()
      expect(within(dairySection).getByText('Greek yogurt')).toBeInTheDocument()

      const grainsSection = screen.getByRole('region', { name: /grains/i })
      expect(within(grainsSection).getByText('Oats')).toBeInTheDocument()
      // Oats should NOT appear in Dairy section
      expect(within(dairySection).queryByText('Oats')).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has aria-label on the container when items are present', () => {
      render(<ShoppingListView items={[MILK]} />)
      expect(screen.getByRole('region', { name: /shopping list/i })).toBeInTheDocument()
    })

    it('each category section is labelled by its heading', () => {
      render(<ShoppingListView items={[MILK]} />)
      // Section has aria-labelledby pointing to the heading
      const region = screen.getByRole('region', { name: /dairy/i })
      expect(region).toBeInTheDocument()
    })
  })
})
