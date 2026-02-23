'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
  targetDate: string
  className?: string
  onExpired?: () => void
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-lg font-bold leading-none tabular-nums">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] text-white/60 mt-1">{label}</span>
    </div>
  )
}

export function CountdownTimer({ targetDate, className, onExpired }: CountdownTimerProps) {
  const target = new Date(targetDate)
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calculateTimeLeft(target))
  const [expired, setExpired] = useState(false)

  const handleExpired = useCallback(() => {
    setExpired(true)
    onExpired?.()
  }, [onExpired])

  useEffect(() => {
    const timer = setInterval(() => {
      const tl = calculateTimeLeft(target)
      if (!tl) {
        clearInterval(timer)
        handleExpired()
        return
      }
      setTimeLeft(tl)
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate, handleExpired]) // eslint-disable-line react-hooks/exhaustive-deps

  if (expired || !timeLeft) {
    return (
      <div className={cn('text-sm text-white/60 font-medium', className)}>
        Акція завершена
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <TimeUnit value={timeLeft.days} label="дн" />
      <span className="text-white/40 font-bold text-lg leading-none mb-3">:</span>
      <TimeUnit value={timeLeft.hours} label="год" />
      <span className="text-white/40 font-bold text-lg leading-none mb-3">:</span>
      <TimeUnit value={timeLeft.minutes} label="хв" />
      <span className="text-white/40 font-bold text-lg leading-none mb-3">:</span>
      <TimeUnit value={timeLeft.seconds} label="сек" />
    </div>
  )
}
