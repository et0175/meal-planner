import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  rightSlot?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className, rightSlot, ...rest },
  ref
) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-xs font-medium text-gray-600">
        {label}
        {rest.required && (
          <span className="ml-0.5 text-red-500" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      <div className={rightSlot ? 'relative' : undefined}>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          aria-required={rest.required ? true : undefined}
          className={cn(
            'w-full rounded-xl border px-3 py-2 text-sm bg-white',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
              : 'border-gray-200 focus:border-teal-500 focus:ring-teal-100',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400',
            rightSlot && 'pr-10',
            className
          )}
          {...rest}
        />
        {rightSlot && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className={cn('text-xs', error ? 'sr-only' : 'text-gray-500')}>
          {hint}
        </p>
      )}
    </div>
  )
})
