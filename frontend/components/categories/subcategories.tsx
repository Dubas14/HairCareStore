'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Category, getStrapiImageUrl } from '@/lib/strapi/client'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

interface SubcategoriesProps {
  subcategories: Category[]
  parentColor?: string
}

export function Subcategories({ subcategories, parentColor }: SubcategoriesProps) {
  if (!subcategories || subcategories.length === 0) {
    return null
  }

  return (
    <section className="py-8 md:py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal variant="fade-up" duration={500}>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
            Підкатегорії
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {subcategories.map((subcategory, index) => {
            const iconUrl = getStrapiImageUrl(subcategory.icon)

            return (
              <ScrollReveal
                key={subcategory.id}
                variant="fade-up"
                delay={index * 50}
                duration={400}
              >
                <Link
                  href={`/categories/${subcategory.slug}`}
                  className="group flex flex-col items-center p-4 bg-card rounded-card shadow-soft card-hover text-center"
                >
                  {/* Icon */}
                  <div
                    className="w-16 h-16 mb-3 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: subcategory.accentColor
                        ? `${subcategory.accentColor}20`
                        : parentColor
                        ? `${parentColor}20`
                        : 'hsl(var(--muted))'
                    }}
                  >
                    {iconUrl ? (
                      <Image
                        src={iconUrl}
                        alt=""
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    ) : (
                      <span
                        className="text-2xl font-bold"
                        style={{ color: subcategory.accentColor || parentColor || 'hsl(var(--primary))' }}
                      >
                        {subcategory.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {subcategory.name}
                  </h3>
                </Link>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
