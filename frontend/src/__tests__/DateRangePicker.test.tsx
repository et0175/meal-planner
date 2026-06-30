/**
 * RTL tests for DateRangePicker.
 *
 * Covers: pre-filled default (ADR-0007), validation error on from > to (AC-073),
 * valid submit calls onGenerate, error cleared on valid range.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateRangePicker } from '@/shopping/DateRangePicker'

function setup(onGenerate = jest.fn()) {
  render(<DateRangePicker onGenerate={onGenerate} />)
  const fromInput = screen.getByLabelText(/^from$/i)
  const toInput = screen.getByLabelText(/^to$/i)
  const applyBtn = screen.getByRole('button', { name: /apply/i })
  return { fromInput, toInput, applyBtn, onGenerate }
}

describe('DateRangePicker', () => {
  describe('pre-filled defaults (ADR-0007)', () => {
    it('renders a "From" date input', () => {
      setup()
      expect(screen.getByLabelText(/^from$/i)).toBeInTheDocument()
    })

    it('renders a "To" date input', () => {
      setup()
      expect(screen.getByLabelText(/^to$/i)).toBeInTheDocument()
    })

    it('pre-fills both inputs with date values on mount', () => {
      const { fromInput, toInput } = setup()
      // Values should be non-empty ISO date strings
      expect((fromInput as HTMLInputElement).value).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect((toInput as HTMLInputElement).value).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('pre-fills "To" date one week after "From" (Mon–Sun)', () => {
      const { fromInput, toInput } = setup()
      const from = new Date((fromInput as HTMLInputElement).value + 'T00:00:00Z')
      const to = new Date((toInput as HTMLInputElement).value + 'T00:00:00Z')
      const diff = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
      expect(diff).toBe(6) // Monday to Sunday = 6 days apart
    })
  })

  describe('Apply button', () => {
    it('renders an Apply button', () => {
      setup()
      expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument()
    })

    it('calls onGenerate with from and to dates when range is valid', async () => {
      const onGenerate = jest.fn()
      const { fromInput, toInput, applyBtn } = setup(onGenerate)
      const user = userEvent.setup()

      fireEvent.change(fromInput, { target: { value: '2026-07-07' } })
      fireEvent.change(toInput, { target: { value: '2026-07-13' } })
      await user.click(applyBtn)

      expect(onGenerate).toHaveBeenCalledWith('2026-07-07', '2026-07-13')
    })

    it('calls onGenerate when from equals to (same-day range)', async () => {
      const onGenerate = jest.fn()
      const { fromInput, toInput, applyBtn } = setup(onGenerate)
      const user = userEvent.setup()

      fireEvent.change(fromInput, { target: { value: '2026-07-07' } })
      fireEvent.change(toInput, { target: { value: '2026-07-07' } })
      await user.click(applyBtn)

      expect(onGenerate).toHaveBeenCalledWith('2026-07-07', '2026-07-07')
    })
  })

  describe('validation (AC-073)', () => {
    it('shows error when from > to', async () => {
      const onGenerate = jest.fn()
      const { fromInput, toInput, applyBtn } = setup(onGenerate)
      const user = userEvent.setup()

      fireEvent.change(fromInput, { target: { value: '2026-07-10' } })
      fireEvent.change(toInput, { target: { value: '2026-07-07' } })
      await user.click(applyBtn)

      expect(screen.getByRole('alert')).toHaveTextContent(
        /"From" date must be on or before "To" date/i
      )
    })

    it('does NOT call onGenerate when from > to', async () => {
      const onGenerate = jest.fn()
      const { fromInput, toInput, applyBtn } = setup(onGenerate)
      const user = userEvent.setup()

      fireEvent.change(fromInput, { target: { value: '2026-07-10' } })
      fireEvent.change(toInput, { target: { value: '2026-07-05' } })
      await user.click(applyBtn)

      expect(onGenerate).not.toHaveBeenCalled()
    })

    it('clears the validation error when the user corrects the range', async () => {
      const onGenerate = jest.fn()
      const { fromInput, toInput, applyBtn } = setup(onGenerate)
      const user = userEvent.setup()

      // First: produce an error
      fireEvent.change(fromInput, { target: { value: '2026-07-10' } })
      fireEvent.change(toInput, { target: { value: '2026-07-05' } })
      await user.click(applyBtn)
      expect(screen.getByRole('alert')).toBeInTheDocument()

      // Fix the range by updating "To"
      fireEvent.change(toInput, { target: { value: '2026-07-14' } })
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('shows error when either field is empty', async () => {
      const onGenerate = jest.fn()
      const { fromInput, applyBtn } = setup(onGenerate)
      const user = userEvent.setup()

      // Clear the "From" field
      fireEvent.change(fromInput, { target: { value: '' } })
      await user.click(applyBtn)

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(onGenerate).not.toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('disables Apply button when isLoading is true', () => {
      render(<DateRangePicker isLoading={true} onGenerate={jest.fn()} />)
      expect(screen.getByRole('button', { name: /apply/i })).toBeDisabled()
    })
  })
})
