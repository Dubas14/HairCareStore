'use client'

import Link from 'next/link'
import { useInView } from 'react-intersection-observer'
import type { Category } from '@/lib/payload/types'
import { getImageUrl } from '@/lib/payload/types'

const categoryGradients: Record<string, string> = {
  'shampoos': 'bg-gradient-hydrate',
  'conditioners': 'bg-gradient-hydrate',
  'masks': 'bg-gradient-repair',
  'hair-color': 'bg-gradient-curl',
  'styling': 'bg-gradient-volume',
  'accessories': 'bg-gradient-repair',
}

interface CategoriesSectionProps {
  categories: Category[]
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  if (categories.length === 0) return null

  return (
    <section className="section-spacing bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Категорії товарів
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Оберіть те, що потрібно вашому волоссю
          </p>
        </div>

        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {categories.map((category, index) => {
            const imageUrl = getImageUrl(category.banner) || getImageUrl(category.icon) || '/images/categories/cat-placeholder.jpg'

            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className={`group relative overflow-hidden rounded-card aspect-[4/3] shadow-soft card-hover ${
                  inView ? 'animate-fadeInUp' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${categoryGradients[category.slug] || 'bg-gradient-repair'}`} />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform duration-300">
                    {category.name}
                  </h3>
                  {category.shortDescription && (
                    <p className="text-sm text-white/80">
                      {category.shortDescription}
                    </p>
                  )}
                </div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 rounded-card transition-colors duration-300" />
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
