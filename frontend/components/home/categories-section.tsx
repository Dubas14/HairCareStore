'use client'

import Link from 'next/link'
import { useInView } from 'react-intersection-observer'
import { categories } from '@/lib/constants/home-data'

export function CategoriesSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-4">
            Категорії товарів
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Оберіть те, що потрібно вашому волоссю
          </p>
        </div>

        {/* Grid */}
        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className={`group relative overflow-hidden rounded-2xl aspect-[4/3] ${
                inView ? 'animate-fadeInUp' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-gold transition-colors duration-300">
                  {category.name}
                </h3>
                <p className="text-sm text-white/80">
                  {category.productCount} товарів
                </p>
              </div>

              {/* Hover border */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold rounded-2xl transition-colors duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
