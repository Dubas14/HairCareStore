'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight, Loader2 } from 'lucide-react'
import { ProductCard } from '@/components/products/product-card'
import { BorderGradientButton } from '@/components/ui/border-gradient-button'
import { useProducts, transformProducts } from '@/lib/hooks/use-products'
import { ensureGsapPlugins, prefersReducedMotion } from '@/lib/gsap'

type Tab = 'bestsellers' | 'new' | 'sale'

const tabs: Array<{ id: Tab; label: string }> = [
  { id: 'bestsellers', label: 'Хіти продажів' },
  { id: 'new', label: 'Новинки' },
  { id: 'sale', label: 'Акції' },
]

export function FeaturedProducts() {
  const t = useTranslations('home')
  const sectionRef = useRef<HTMLElement | null>(null)
  const tabsShellRef = useRef<HTMLDivElement | null>(null)
  const indicatorRef = useRef<HTMLSpanElement | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({
    bestsellers: null,
    new: null,
    sale: null,
  })

  const [activeTab, setActiveTab] = useState<Tab>('bestsellers')

  const { data: productsData, isLoading } = useProducts({ limit: 12 })

  const products = useMemo(() => {
    if (!productsData?.products) return []

    const frontendProducts = transformProducts(productsData.products)

    switch (activeTab) {
      case 'bestsellers':
        return frontendProducts.slice(0, 4)
      case 'new':
        return frontendProducts.slice(4, 8)
      case 'sale':
        return frontendProducts.filter((product) => product.discount).slice(0, 4)
      default:
        return frontendProducts.slice(0, 4)
    }
  }, [productsData, activeTab])

  useEffect(() => {
    if (!sectionRef.current || prefersReducedMotion()) return

    const { gsap } = ensureGsapPlugins()
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-featured-header]',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
          },
        }
      )

      gsap.fromTo(
        '[data-featured-tabs]',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 74%',
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const shell = tabsShellRef.current
    const indicator = indicatorRef.current
    const activeButton = tabRefs.current[activeTab]

    if (!shell || !indicator || !activeButton) return

    const updateIndicator = () => {
      const shellRect = shell.getBoundingClientRect()
      const buttonRect = activeButton.getBoundingClientRect()
      const left = buttonRect.left - shellRect.left

      if (prefersReducedMotion()) {
        indicator.style.width = `${buttonRect.width}px`
        indicator.style.transform = `translateX(${left}px)`
        return
      }

      const { gsap } = ensureGsapPlugins()
      gsap.to(indicator, {
        x: left,
        width: buttonRect.width,
        duration: 0.45,
        ease: 'power3.out',
      })
    }

    updateIndicator()
    window.addEventListener('resize', updateIndicator)

    return () => {
      window.removeEventListener('resize', updateIndicator)
    }
  }, [activeTab])

  useEffect(() => {
    const grid = gridRef.current
    if (!grid || isLoading) return

    const items = Array.from(grid.querySelectorAll<HTMLElement>('[data-product-item]'))
    if (items.length === 0) return

    if (prefersReducedMotion()) {
      items.forEach((item) => {
        item.style.opacity = '1'
        item.style.transform = 'none'
      })
      return
    }

    const { gsap } = ensureGsapPlugins()
    gsap.killTweensOf(items)
    gsap.set(items, { opacity: 0, y: 28, rotateX: -6 })
    gsap.to(items, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.75,
      stagger: 0.1,
      ease: 'power3.out',
      clearProps: 'opacity,transform',
    })
  }, [activeTab, isLoading, products])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#f3efea] py-24 md:py-28"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(42,157,143,0.1),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(212,163,115,0.16),_transparent_34%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2
              data-featured-header
              className="text-4xl font-semibold tracking-[-0.05em] text-foreground md:text-5xl lg:text-6xl"
            >
              {t('popularProducts')}
            </h2>
          </div>

          <p
            data-featured-header
            className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg"
          >
            {t('bestSelection')} Тут зібрані продукти, які найчастіше стають улюбленцями
            вже після першого замовлення.
          </p>
        </div>

        <div
          ref={tabsShellRef}
          data-featured-tabs
          className="relative mb-12 inline-flex w-full max-w-2xl flex-wrap gap-2 rounded-[2rem] border border-black/5 bg-white/75 p-2 shadow-soft backdrop-blur-xl"
        >
          <span
            ref={indicatorRef}
            className="pointer-events-none absolute inset-y-2 left-2 rounded-[1.25rem] bg-[#1A1A1A]"
            style={{ width: 0 }}
          />

          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[tab.id] = node
              }}
              onClick={() => setActiveTab(tab.id)}
              className={`relative z-10 flex min-w-[180px] flex-1 flex-col rounded-[1.25rem] px-5 py-4 text-left transition-colors duration-300 ${
                activeTab === tab.id ? 'text-white' : 'text-[#1A1A1A]'
              }`}
            >
              <span className="text-sm font-semibold md:text-base">{tab.label}</span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[1.75rem] border border-black/5 bg-white p-4 shadow-soft"
              >
                <div className="aspect-square animate-pulse rounded-[1.25rem] bg-muted" />
                <div className="mt-4 h-3 w-20 animate-pulse rounded-full bg-muted" />
                <div className="mt-3 h-5 w-3/4 animate-pulse rounded-full bg-muted" />
                <div className="mt-6 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#2A9D8F]" />
                  <span className="text-sm text-muted-foreground">Завантажуємо підбірку...</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {products.map((product) => (
              <div key={product.productId || product.id} data-product-item className="will-change-transform">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/shop">
            <BorderGradientButton variant="mono" size="lg">
              {t('viewAll')}
              <ArrowRight className="h-4 w-4" />
            </BorderGradientButton>
          </Link>
        </div>
      </div>
    </section>
  )
}
