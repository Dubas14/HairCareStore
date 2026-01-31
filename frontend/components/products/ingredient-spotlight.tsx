'use client'

import { Droplets, Sparkles, Shield, Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Ingredient {
  id: string
  name: string
  benefit: string
  icon: 'droplets' | 'sparkles' | 'shield' | 'leaf'
}

interface IngredientSpotlightProps {
  ingredients: Ingredient[]
  className?: string
}

const iconMap = {
  droplets: Droplets,
  sparkles: Sparkles,
  shield: Shield,
  leaf: Leaf,
}

const gradientMap = {
  droplets: 'from-hydrate-start to-hydrate-end',
  sparkles: 'from-repair-start to-repair-end',
  shield: 'from-volume-start to-volume-end',
  leaf: 'from-curl-start to-curl-end',
}

export function IngredientSpotlight({
  ingredients,
  className,
}: IngredientSpotlightProps) {
  if (ingredients.length === 0) return null

  return (
    <section className={cn("py-8", className)}>
      <h2 className="text-xl font-semibold mb-6">Ключові інгредієнти</h2>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
        {ingredients.map((ingredient) => {
          const Icon = iconMap[ingredient.icon]

          return (
            <div
              key={ingredient.id}
              className="flex-shrink-0 w-48 snap-start"
            >
              <div className="bg-card rounded-card p-5 shadow-soft hover:shadow-soft-lg transition-shadow h-full">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center mb-4",
                    gradientMap[ingredient.icon]
                  )}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {ingredient.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {ingredient.benefit}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
