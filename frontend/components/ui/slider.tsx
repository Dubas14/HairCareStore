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
    <div className={cn("space-y-4", className)}>
      {/* Values display */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{formatValue(localValue[0])}</span>
        <span className="text-muted-foreground">—</span>
        <span className="font-medium">{formatValue(localValue[1])}</span>
      </div>

      {/* Slider track */}
      <div className="relative h-2">
        {/* Background track */}
        <div className="absolute inset-0 rounded-full bg-muted" />

        {/* Active track */}
        <div
          className="absolute h-full rounded-full bg-primary"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
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
          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
        />

        {/* Max input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={handleMaxChange}
          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
        />
      </div>
    </div>
  )
}

export { Slider }
