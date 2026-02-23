'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, GitCompareArrows, Trash2 } from 'lucide-react'
import { useCompareStore } from '@/stores/compare-store'

export function CompareBar() {
  const { items, removeItem, clearCompare } = useCompareStore()
  const [collapsed, setCollapsed] = useState(false)

  if (items.length === 0) return null

  if (collapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
        >
          <GitCompareArrows className="w-5 h-5" />
          <span className="text-sm font-semibold">{items.length}</span>
        </button>
      </div>
    )
  }

  return (
    <div aria-label="Порівняння товарів" className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Title */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <GitCompareArrows className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Порівняння ({items.length}/4)
            </span>
          </div>

          {/* Product thumbnails */}
          <div className="flex items-center gap-2 flex-1 overflow-x-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative flex items-center gap-2 bg-muted/50 rounded-lg px-2 py-1.5 shrink-0"
              >
                <div className="w-10 h-10 rounded bg-background overflow-hidden border border-border">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-medium text-foreground max-w-[100px] truncate hidden sm:block">
                  {item.name}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Видалити ${item.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: 4 - items.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-10 h-10 rounded-lg border-2 border-dashed border-border shrink-0 hidden sm:block"
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/compare"
              className={`px-4 py-2 text-sm font-semibold rounded-input transition-colors ${
                items.length >= 2
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed pointer-events-none'
              }`}
            >
              Порівняти
            </Link>
            <button
              onClick={clearCompare}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Очистити порівняння"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCollapsed(true)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors sm:hidden"
              aria-label="Згорнути"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
