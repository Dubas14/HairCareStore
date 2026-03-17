'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SliderProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  step?: number
  formatValue?: (value: number) => string
  className?: string
}

function Slider({
  min,
  max,
  value,
  onChange,
  step = 1,
  formatValue = (v) => `${v}`,
  className,
}: SliderProps) {
  const [localValue, setLocalValue] = React.useState(value)

  React.useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), localValue[1] - step)
    const newValue: [number, number] = [newMin, localValue[1]]
    setLocalValue(newValue)
    onChange(newValue)
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), localValue[0] + step)
    const newValue: [number, number] = [localValue[0], newMax]
    setLocalValue(newValue)
    onChange(newValue)
  }

  const minPercent = ((localValue[0] - min) / (max - min)) * 100
  const maxPercent = ((localValue[1] - min) / (max - min)) * 100

  return (
    <div className={cn("slider-root space-y-4", className)}>
      {/* Values display */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{formatValue(localValue[0])}</span>
        <span className="text-muted-foreground">—</span>
        <span className="font-medium">{formatValue(localValue[1])}</span>
      </div>

      {/* Slider track */}
      <div className="relative h-5 px-1">
        {/* Background track */}
        <div className="absolute inset-x-1 top-1/2 h-2 -translate-y-1/2 rounded-full bg-muted" />

        {/* Active track */}
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary"
          style={{
            left: `calc(${minPercent}% + 4px)`,
            right: `calc(${100 - maxPercent}% + 4px)`,
          }}
        />

        {/* Min input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={handleMinChange}
          className="slider-range absolute inset-y-0 left-1 right-1 w-[calc(100%-8px)] bg-transparent pointer-events-none"
        />

        {/* Max input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={handleMaxChange}
          className="slider-range absolute inset-y-0 left-1 right-1 w-[calc(100%-8px)] bg-transparent pointer-events-none"
        />
      </div>

      <style jsx>{`
        .slider-root :global(.slider-range) {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          outline: none;
        }

        .slider-root :global(.slider-range::-webkit-slider-runnable-track) {
          height: 8px;
          background: transparent;
          border: 0;
        }

        .slider-root :global(.slider-range::-moz-range-track) {
          height: 8px;
          background: transparent;
          border: 0;
        }

        .slider-root :global(.slider-range::-webkit-slider-thumb) {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
          width: 20px;
          height: 20px;
          margin-top: -6px;
          border-radius: 9999px;
          border: 2px solid hsl(var(--background));
          background: hsl(var(--primary));
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }

        .slider-root :global(.slider-range::-moz-range-thumb) {
          pointer-events: auto;
          width: 20px;
          height: 20px;
          border-radius: 9999px;
          border: 2px solid hsl(var(--background));
          background: hsl(var(--primary));
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

export { Slider }
