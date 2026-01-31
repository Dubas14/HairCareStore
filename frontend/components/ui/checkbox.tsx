'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  count?: number
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, count, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || generatedId

    return (
      <label
        htmlFor={inputId}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "h-5 w-5 rounded border-2 border-input transition-all duration-200",
              "peer-checked:border-primary peer-checked:bg-primary",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
              "group-hover:border-primary/50",
              className
            )}
          >
            <Check className="h-4 w-4 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity absolute top-0.5 left-0.5" />
          </div>
        </div>
        {label && (
          <span className="text-sm text-foreground group-hover:text-primary transition-colors flex-1">
            {label}
          </span>
        )}
        {count !== undefined && (
          <span className="text-xs text-muted-foreground">
            ({count})
          </span>
        )}
      </label>
    )
  }
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
