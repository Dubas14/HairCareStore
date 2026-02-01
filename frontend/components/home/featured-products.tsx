'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useInView } from 'react-intersection-observer'
import { ProductCard } from '@/components/products/product-card'
import { featuredProducts } from '@/lib/constants/home-data'
import { BorderGradientButton } from '@/components/ui/border-gradient-button'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'bestsellers' | 'new' | 'sale'

const tabs: Array<{ id: Tab; label: string }> = [
  { id: 'bestsellers', label: 'Хіти продажів' },
  { id: 'new', label: 'Новинки' },
  { id: 'sale', label: 'Акції' }
]

export function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState<Tab>('bestsellers')
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const products = featuredProducts[activeTab]

  return (
    <section className="section-spacing bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Популярні товари
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Найкращий вибір наших клієнтів
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative px-6 py-3 text-sm md:text-base font-medium rounded-full transition-all duration-300",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                activeTab === tab.id
                  ? "bg-[#1A1A1A] text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground bg-white/50 hover:bg-white"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#2A9D8F]/20 to-[#48CAE4]/20 animate-pulse-subtle" />
              )}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {products.map((product, index) => (
            <div
              key={product.id}
              className={inView ? 'animate-fadeInUp' : 'opacity-0'}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href="/shop">
            <BorderGradientButton variant="mono" size="lg">
              Дивитись всі товари
              <ArrowRight className="w-4 h-4" />
            </BorderGradientButton>
          </Link>
        </div>
      </div>
    </section>
  )
}
