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

function clamp(val: number, lo: number, hi: number) {
  return Math.min(Math.max(val, lo), hi)
}

function snap(val: number, step: number, min: number) {
  return Math.round((val - min) / step) * step + min
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
  const trackRef = React.useRef<HTMLDivElement>(null)
  const dragging = React.useRef<'min' | 'max' | null>(null)

  React.useEffect(() => {
    setLocalValue(value)
  }, [value])

  const positionToValue = React.useCallback(
    (clientX: number) => {
      const track = trackRef.current
      if (!track) return min
      const rect = track.getBoundingClientRect()
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
      return snap(min + ratio * (max - min), step, min)
    },
    [min, max, step],
  )

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      const val = positionToValue(e.clientX)
      // Determine which thumb is closer
      const distMin = Math.abs(val - localValue[0])
      const distMax = Math.abs(val - localValue[1])
      const target = distMin <= distMax ? 'min' : 'max'
      dragging.current = target

      const newValue: [number, number] =
        target === 'min'
          ? [clamp(val, min, localValue[1] - step), localValue[1]]
          : [localValue[0], clamp(val, localValue[0] + step, max)]
      setLocalValue(newValue)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [localValue, min, max, step, positionToValue],
  )

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return
      e.preventDefault()
      const val = positionToValue(e.clientX)
      setLocalValue((prev) => {
        if (dragging.current === 'min') {
          return [clamp(val, min, prev[1] - step), prev[1]]
        }
        return [prev[0], clamp(val, prev[0] + step, max)]
      })
    },
    [min, max, step, positionToValue],
  )

  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return
      dragging.current = null
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      setLocalValue((current) => {
        onChange(current)
        return current
      })
    },
    [onChange],
  )

  const minPercent = ((localValue[0] - min) / (max - min)) * 100
  const maxPercent = ((localValue[1] - min) / (max - min)) * 100

  return (
    <div className={cn('space-y-4', className)}>
      {/* Values display */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{formatValue(localValue[0])}</span>
        <span className="text-muted-foreground">—</span>
        <span className="font-medium">{formatValue(localValue[1])}</span>
      </div>

      {/* Track area — outer has padding so thumbs don't clip */}
      <div className="px-2.5">
        <div
          ref={trackRef}
          className="relative h-6 cursor-pointer touch-none select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Background track */}
          <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-muted" />

          {/* Active track */}
          <div
            className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary"
            style={{
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`,
            }}
          />

          {/* Min thumb */}
          <div
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
            style={{ left: `${minPercent}%` }}
          />

          {/* Max thumb */}
          <div
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
            style={{ left: `${maxPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export { Slider }
