'use client'

import Link from 'next/link'
import { useInView } from 'react-intersection-observer'
import { categories } from '@/lib/constants/home-data'

// Map categories to gradient classes
const categoryGradients: Record<string, string> = {
  'shampoos': 'bg-gradient-hydrate',
  'conditioners': 'bg-gradient-hydrate',
  'masks': 'bg-gradient-repair',
  'hair-color': 'bg-gradient-curl',
  'styling': 'bg-gradient-volume',
  'accessories': 'bg-gradient-repair',
}

export function CategoriesSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  return (
    <section className="section-spacing bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Категорії товарів
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Оберіть те, що потрібно вашому волоссю
          </p>
        </div>

        {/* Grid */}
        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className={`group relative overflow-hidden rounded-card aspect-[4/3] shadow-soft card-hover ${
                inView ? 'animate-fadeInUp' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              {/* Accent gradient on hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${categoryGradients[category.slug] || 'bg-gradient-repair'}`} />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform duration-300">
                  {category.name}
                </h3>
                <p className="text-sm text-white/80">
                  {category.productCount} товарів
                </p>
              </div>

              {/* Hover border accent */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 rounded-card transition-colors duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
