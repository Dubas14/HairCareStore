# Home Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a premium e-commerce home page with 6 sections: hero slider, categories, featured products, brands, benefits, and newsletter.

**Architecture:** Component-based React with Next.js 15 App Router, using Embla Carousel for sliders, Tailwind CSS for styling with custom gold/dark color scheme, and placeholder data that can be easily replaced with real data from Medusa API.

**Tech Stack:** Next.js 15, React 18, TypeScript, Tailwind CSS, Embla Carousel, Shadcn/ui, Intersection Observer API

---

## Task 1: Setup - Color System and Dependencies

**Files:**
- Modify: `frontend/styles/globals.css:1-39`
- Modify: `frontend/tailwind.config.ts:1-69`
- Create: `frontend/package.json` (add dependencies)

**Step 1: Install required dependencies**

```bash
cd frontend
npm install embla-carousel-react embla-carousel-autoplay zod react-intersection-observer
```

Run: `npm install`
Expected: Dependencies installed successfully

**Step 2: Update color system in globals.css**

Replace content in `frontend/styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 4%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 4%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 4%;

    /* Premium color scheme */
    --primary: 45 65% 52%; /* Gold #D4AF37 */
    --primary-foreground: 0 0% 100%;
    --secondary: 162 43% 20%; /* Dark green #1B4D3E */
    --secondary-foreground: 0 0% 100%;

    --muted: 0 0% 97%;
    --muted-foreground: 0 0% 42%;
    --accent: 0 0% 97%;
    --accent-foreground: 0 0% 4%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 90%;
    --input: 0 0% 90%;
    --ring: 45 65% 52%;
    --radius: 0.5rem;

    /* Custom colors */
    --gold: 45 65% 52%;
    --dark: 0 0% 4%;
    --light-gray: 0 0% 97%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

/* Custom animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

@layer utilities {
  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out forwards;
  }

  .animate-fadeInScale {
    animation: fadeInScale 0.5s ease-out forwards;
  }

  .animate-pulse-slow {
    animation: pulse-slow 2s ease-in-out infinite;
  }
}
```

**Step 3: Extend Tailwind config for custom colors**

Modify `frontend/tailwind.config.ts` colors section (line 20-54):

```typescript
extend: {
  colors: {
    border: 'hsl(var(--border))',
    input: 'hsl(var(--input))',
    ring: 'hsl(var(--ring))',
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
    primary: {
      DEFAULT: 'hsl(var(--primary))',
      foreground: 'hsl(var(--primary-foreground))',
    },
    secondary: {
      DEFAULT: 'hsl(var(--secondary))',
      foreground: 'hsl(var(--secondary-foreground))',
    },
    destructive: {
      DEFAULT: 'hsl(var(--destructive))',
      foreground: 'hsl(var(--destructive-foreground))',
    },
    muted: {
      DEFAULT: 'hsl(var(--muted))',
      foreground: 'hsl(var(--muted-foreground))',
    },
    accent: {
      DEFAULT: 'hsl(var(--accent))',
      foreground: 'hsl(var(--accent-foreground))',
    },
    popover: {
      DEFAULT: 'hsl(var(--popover))',
      foreground: 'hsl(var(--popover-foreground))',
    },
    card: {
      DEFAULT: 'hsl(var(--card))',
      foreground: 'hsl(var(--card-foreground))',
    },
    gold: 'hsl(var(--gold))',
    dark: 'hsl(var(--dark))',
  },
  // ... rest stays the same
}
```

**Step 4: Verify TypeScript compiles**

Run: `npm run type-check`
Expected: No TypeScript errors

**Step 5: Commit**

```bash
git add frontend/styles/globals.css frontend/tailwind.config.ts frontend/package.json frontend/package-lock.json
git commit -m "feat: add premium color system and carousel dependencies

- Add gold (#D4AF37) and dark green (#1B4D3E) to color palette
- Install embla-carousel-react, zod, react-intersection-observer
- Add custom animations (fadeInUp, fadeInScale, pulse-slow)
- Update Tailwind config for premium theme"
```

---

## Task 2: Placeholder Data Structure

**Files:**
- Create: `frontend/lib/constants/home-data.ts`

**Step 1: Create placeholder data file**

Create `frontend/lib/constants/home-data.ts`:

```typescript
export interface HeroSlide {
  id: number
  type: 'image' | 'video'
  backgroundUrl: string
  title: string
  subtitle: string
  buttons: Array<{
    text: string
    href: string
    variant: 'primary' | 'secondary'
  }>
  align?: 'left' | 'center'
}

export interface Category {
  id: number
  name: string
  slug: string
  productCount: number
  imageUrl: string
}

export interface Product {
  id: number
  name: string
  brand: string
  slug: string
  imageUrl: string
  price: number
  oldPrice?: number
  rating: number
  reviewCount: number
  discount?: number
  badge?: string
}

export interface Brand {
  id: number
  name: string
  slug: string
  logoUrl: string
}

export interface Benefit {
  id: number
  icon: string
  title: string
  description: string
}

// Hero Slides
export const heroSlides: HeroSlide[] = [
  {
    id: 1,
    type: 'image',
    backgroundUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1920&h=600&fit=crop',
    title: 'Професійна косметика для вашого волосся',
    subtitle: 'Відкрийте для себе найкращі продукти від світових брендів',
    buttons: [
      { text: 'Каталог товарів', href: '/products', variant: 'primary' },
      { text: 'Пройти квіз', href: '/quiz', variant: 'secondary' }
    ],
    align: 'center'
  },
  {
    id: 2,
    type: 'image',
    backgroundUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=1920&h=600&fit=crop',
    title: 'Знижка -20% на першу покупку',
    subtitle: 'Зареєструйтесь та отримайте персональний промокод',
    buttons: [
      { text: 'Отримати знижку', href: '/register', variant: 'primary' }
    ],
    align: 'left'
  },
  {
    id: 3,
    type: 'image',
    backgroundUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=1920&h=600&fit=crop',
    title: 'Нові надходження від преміум брендів',
    subtitle: 'Kerastase, L\'Oréal Professionnel, Schwarzkopf',
    buttons: [
      { text: 'Переглянути новинки', href: '/products?filter=new', variant: 'primary' }
    ],
    align: 'center'
  }
]

// Categories
export const categories: Category[] = [
  {
    id: 1,
    name: 'Шампуні',
    slug: 'shampoos',
    productCount: 124,
    imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop'
  },
  {
    id: 2,
    name: 'Кондиціонери',
    slug: 'conditioners',
    productCount: 89,
    imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop'
  },
  {
    id: 3,
    name: 'Маски та догляд',
    slug: 'masks',
    productCount: 156,
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop'
  },
  {
    id: 4,
    name: 'Фарби для волосся',
    slug: 'hair-color',
    productCount: 234,
    imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop'
  },
  {
    id: 5,
    name: 'Укладання',
    slug: 'styling',
    productCount: 98,
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop'
  },
  {
    id: 6,
    name: 'Аксесуари',
    slug: 'accessories',
    productCount: 67,
    imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop'
  }
]

// Featured Products
const createProduct = (id: number, overrides: Partial<Product>): Product => ({
  id,
  name: 'Product Name',
  brand: 'Brand',
  slug: `product-${id}`,
  imageUrl: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=300&h=300&fit=crop',
  price: 599,
  rating: 4.5,
  reviewCount: 24,
  ...overrides
})

export const featuredProducts = {
  bestsellers: [
    createProduct(1, { name: 'Шампунь для сухого волосся', brand: 'Kerastase', price: 850, rating: 4.8, reviewCount: 156 }),
    createProduct(2, { name: 'Маска відновлююча', brand: 'L\'Oréal Pro', price: 720, oldPrice: 900, discount: 20, rating: 4.7, reviewCount: 98 }),
    createProduct(3, { name: 'Олія для волосся Argan', brand: 'Moroccanoil', price: 1150, rating: 4.9, reviewCount: 203 }),
    createProduct(4, { name: 'Кондиціонер живильний', brand: 'Schwarzkopf', price: 680, rating: 4.6, reviewCount: 87 })
  ],
  new: [
    createProduct(5, { name: 'Серум для блиску', brand: 'CHI', price: 950, badge: 'Новинка', rating: 4.7, reviewCount: 45 }),
    createProduct(6, { name: 'Спрей термозахист', brand: 'Redken', price: 620, badge: 'Новинка', rating: 4.5, reviewCount: 32 }),
    createProduct(7, { name: 'Шампунь для об\'єму', brand: 'Matrix', price: 580, badge: 'Новинка', rating: 4.6, reviewCount: 56 }),
    createProduct(8, { name: 'Маска-експрес', brand: 'Wella', price: 750, badge: 'Новинка', rating: 4.4, reviewCount: 28 })
  ],
  sale: [
    createProduct(9, { name: 'Набір для догляду', brand: 'Kerastase', price: 1200, oldPrice: 1800, discount: 33, rating: 4.9, reviewCount: 167 }),
    createProduct(10, { name: 'Фарба професійна', brand: 'L\'Oréal Pro', price: 420, oldPrice: 600, discount: 30, rating: 4.6, reviewCount: 112 }),
    createProduct(11, { name: 'Кератинова маска', brand: 'Brazilian Blowout', price: 890, oldPrice: 1100, discount: 19, rating: 4.8, reviewCount: 94 }),
    createProduct(12, { name: 'Шампунь безсульфатний', brand: 'Davines', price: 560, oldPrice: 700, discount: 20, rating: 4.7, reviewCount: 78 })
  ]
}

// Brands
export const brands: Brand[] = [
  { id: 1, name: 'L\'Oréal Professionnel', slug: 'loreal', logoUrl: '/images/brands/loreal.svg' },
  { id: 2, name: 'Schwarzkopf Professional', slug: 'schwarzkopf', logoUrl: '/images/brands/schwarzkopf.svg' },
  { id: 3, name: 'Wella Professionals', slug: 'wella', logoUrl: '/images/brands/wella.svg' },
  { id: 4, name: 'Kérastase', slug: 'kerastase', logoUrl: '/images/brands/kerastase.svg' },
  { id: 5, name: 'Matrix', slug: 'matrix', logoUrl: '/images/brands/matrix.svg' },
  { id: 6, name: 'Redken', slug: 'redken', logoUrl: '/images/brands/redken.svg' },
  { id: 7, name: 'CHI', slug: 'chi', logoUrl: '/images/brands/chi.svg' },
  { id: 8, name: 'Moroccanoil', slug: 'moroccanoil', logoUrl: '/images/brands/moroccanoil.svg' },
  { id: 9, name: 'Alfaparf Milano', slug: 'alfaparf', logoUrl: '/images/brands/alfaparf.svg' },
  { id: 10, name: 'Davines', slug: 'davines', logoUrl: '/images/brands/davines.svg' }
]

// Benefits
export const benefits: Benefit[] = [
  {
    id: 1,
    icon: '🎯',
    title: 'Персональний підбір',
    description: 'Квіз допоможе знайти ідеальні продукти для вашого типу волосся'
  },
  {
    id: 2,
    icon: '✨',
    title: '100% оригінал',
    description: 'Працюємо тільки з офіційними дистриб\'юторами та гарантуємо автентичність'
  },
  {
    id: 3,
    icon: '🚚',
    title: 'Швидка доставка',
    description: 'Нова Пошта по всій Україні, відправка в день замовлення'
  },
  {
    id: 4,
    icon: '💝',
    title: 'Бонусна програма',
    description: 'Накопичуйте бали та отримуйте знижки на наступні покупки'
  }
]
```

**Step 2: Verify TypeScript compiles**

Run: `npm run type-check`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add frontend/lib/constants/home-data.ts
git commit -m "feat: add placeholder data for home page

- Hero slides with Unsplash images
- 6 product categories
- Featured products (bestsellers, new, sale)
- 10 brand placeholders
- 4 benefit items with icons"
```

---

## Task 3: Hero Slider Component

**Files:**
- Create: `frontend/components/home/hero-slider.tsx`

**Step 1: Create hero slider component**

Create `frontend/components/home/hero-slider.tsx`:

```typescript
'use client'

import { useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { heroSlides } from '@/lib/constants/home-data'
import { Button } from '@/components/ui/button'

export function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30 },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  )

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <section className="relative w-full h-[500px] md:h-[450px] lg:h-[600px] overflow-hidden">
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container h-full flex">
          {heroSlides.map((slide) => (
            <div key={slide.id} className="embla__slide relative flex-[0_0_100%] min-w-0">
              {/* Background */}
              <div className="absolute inset-0">
                {slide.type === 'image' ? (
                  <img
                    src={slide.backgroundUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={slide.backgroundUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/40" />
              </div>

              {/* Content */}
              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div
                  className={`h-full flex flex-col justify-center ${
                    slide.align === 'center' ? 'items-center text-center' : 'items-start text-left'
                  } max-w-2xl ${slide.align === 'center' ? 'mx-auto' : ''}`}
                >
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 animate-fadeInUp">
                    {slide.title}
                  </h1>
                  <p className="text-lg sm:text-xl text-white/90 mb-8 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                    {slide.subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
                    {slide.buttons.map((button, idx) => (
                      <Button
                        key={idx}
                        asChild
                        variant={button.variant === 'primary' ? 'default' : 'outline'}
                        size="lg"
                        className={
                          button.variant === 'primary'
                            ? 'bg-gold hover:bg-gold/90 text-white border-0 shadow-lg hover:shadow-gold/50 hover:scale-105 transition-all duration-250'
                            : 'border-white/50 text-white hover:bg-white/10 hover:scale-105 transition-all duration-250'
                        }
                      >
                        <Link href={button.href}>{button.text}</Link>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-250 hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-250 hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className="w-2 h-2 rounded-full bg-white/50 hover:bg-white transition-all duration-250"
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run type-check`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add frontend/components/home/hero-slider.tsx
git commit -m "feat: add hero slider component

- Embla carousel with autoplay
- Support for image and video backgrounds
- Navigation arrows and dots
- Smooth animations (fadeInUp)
- Responsive heights (mobile/tablet/desktop)
- Gold accent buttons with hover effects"
```

---

## Task 4: Categories Section Component

**Files:**
- Create: `frontend/components/home/categories-section.tsx`

**Step 1: Create categories section component**

Create `frontend/components/home/categories-section.tsx`:

```typescript
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
```

**Step 2: Verify TypeScript compiles**

Run: `npm run type-check`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add frontend/components/home/categories-section.tsx
git commit -m "feat: add categories section component

- Grid layout (responsive: 1/2/3/4 cols)
- Intersection observer for scroll animations
- Staggered fadeInUp animation (100ms delay)
- Hover effects (scale image, gold border, gold text)
- Gradient overlay on images"
```

---

## Task 5: Product Card Component

**Files:**
- Create: `frontend/components/products/product-card.tsx`

**Step 1: Create reusable product card component**

Create `frontend/components/products/product-card.tsx`:

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Product } from '@/lib/constants/home-data'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsWishlisted(!isWishlisted)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    // TODO: Add to cart logic
    console.log('Add to cart:', product.id)
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-white rounded-xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-2 left-2 bg-destructive text-white text-sm font-bold px-2 py-1 rounded">
            -{product.discount}%
          </div>
        )}

        {/* New Badge */}
        {product.badge && (
          <div className="absolute top-2 left-2 bg-secondary text-white text-sm font-bold px-2 py-1 rounded">
            {product.badge}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors duration-250"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isWishlisted ? 'fill-destructive text-destructive' : 'text-gray-600'
            }`}
          />
        </button>
      </div>

      {/* Brand */}
      <p className="text-xs text-muted-foreground uppercase mb-1">
        {product.brand}
      </p>

      {/* Name */}
      <h3 className="text-base font-semibold text-dark mb-2 line-clamp-2 min-h-[3rem]">
        {product.name}
      </h3>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(product.rating)
                  ? 'fill-gold text-gold'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          ({product.reviewCount})
        </span>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-xl font-bold text-gold">
          {product.price} грн
        </span>
        {product.oldPrice && (
          <span className="text-sm text-muted-foreground line-through">
            {product.oldPrice} грн
          </span>
        )}
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        className={`w-full bg-gold hover:bg-gold/90 text-white transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        Додати в кошик
      </Button>
    </Link>
  )
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run type-check`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add frontend/components/products/product-card.tsx
git commit -m "feat: add product card component

- Reusable card with hover effects
- Wishlist toggle (heart icon)
- Discount and badge display
- 5-star rating system
- Add to cart button (appears on hover)
- Image scale on hover
- Card lift animation (-translate-y-2)"
```

---

## Task 6: Featured Products Section

**Files:**
- Create: `frontend/components/home/featured-products.tsx`

**Step 1: Create featured products section with tabs**

Create `frontend/components/home/featured-products.tsx`:

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useInView } from 'react-intersection-observer'
import { ProductCard } from '@/components/products/product-card'
import { featuredProducts } from '@/lib/constants/home-data'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

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
    <section className="py-20 md:py-24 bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Популярні товари
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Найкращий вибір наших клієнтів
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm md:text-base font-medium rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gold text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
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
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white/10 hover:border-gold"
          >
            <Link href="/products">
              Дивитись всі товари
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run type-check`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add frontend/components/home/featured-products.tsx
git commit -m "feat: add featured products section

- Tab navigation (bestsellers/new/sale)
- Grid layout (responsive: 1/2/4 cols)
- Scroll-triggered animations with stagger
- Dark background with white text
- View all button
- Uses ProductCard component"
```

---

## Task 7: Brands Section

**Files:**
- Create: `frontend/components/home/brands-section.tsx`

**Step 1: Create brands carousel section**

Create `frontend/components/home/brands-section.tsx`:

```typescript
'use client'

import { useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Link from 'next/link'
import { brands } from '@/lib/constants/home-data'

export function BrandsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      slidesToScroll: 1
    },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  )

  return (
    <section className="py-16 md:py-20 bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-4">
            Бренди, яким ми довіряємо
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Офіційні партнери світових виробників
          </p>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="group flex-[0_0_200px] md:flex-[0_0_250px]"
              >
                <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-[120px] flex items-center justify-center border-2 border-transparent group-hover:border-gold">
                  {/* Since we don't have actual logos, display brand name */}
                  <span className="text-lg md:text-xl font-bold text-dark/40 group-hover:text-dark transition-colors duration-300 text-center">
                    {brand.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(brands.length / 3) }).map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index * 3)}
              className="w-2 h-2 rounded-full bg-muted hover:bg-gold transition-all duration-250"
              aria-label={`Go to brands ${index * 3 + 1}-${index * 3 + 3}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run type-check`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add frontend/components/home/brands-section.tsx
git commit -m "feat: add brands carousel section

- Embla carousel with autoplay
- Responsive card sizes (200px/250px)
- Hover effects (lift, gold border, text color)
- Dots navigation
- Auto-scroll (3s delay)
- Placeholder: brand names instead of logos"
```

---

## Task 8: Benefits Section

**Files:**
- Create: `frontend/components/home/benefits-section.tsx`

**Step 1: Create benefits section**

Create `frontend/components/home/benefits-section.tsx`:

```typescript
'use client'

import { useInView } from 'react-intersection-observer'
import { benefits } from '@/lib/constants/home-data'

export function BenefitsSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  return (
    <section className="py-20 md:py-24 bg-dark relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Чому обирають нас
          </h2>
        </div>

        {/* Grid */}
        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {benefits.map((benefit, index) => (
            <div
              key={benefit.id}
              className={`group p-8 rounded-2xl border border-white/10 hover:border-gold transition-all duration-300 ${
                inView ? 'animate-fadeInScale' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="text-5xl mb-4 animate-pulse-slow">
                {benefit.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3">
                {benefit.title}
              </h3>

              {/* Description */}
              <p className="text-white/80 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run type-check`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add frontend/components/home/benefits-section.tsx
git commit -m "feat: add benefits section

- 4-column grid (responsive: 1/2/4)
- Dark background with gold gradient overlay
- fadeInScale animation with stagger
- Pulse animation on icons
- Gold border on hover
- Semi-transparent borders and text"
```

---

## Task 9: Newsletter Section

**Files:**
- Create: `frontend/components/home/newsletter-section.tsx`
- Create: `frontend/app/actions/newsletter.ts`

**Step 1: Create server action for newsletter**

Create `frontend/app/actions/newsletter.ts`:

```typescript
'use server'

import { z } from 'zod'

const newsletterSchema = z.object({
  email: z.string().email('Будь ласка, введіть коректний email'),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Ви повинні погодитися з умовами'
  })
})

export async function subscribeToNewsletter(formData: FormData) {
  const rawData = {
    email: formData.get('email'),
    consent: formData.get('consent') === 'on'
  }

  const validation = newsletterSchema.safeParse(rawData)

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0].message
    }
  }

  // TODO: Integrate with email service (SendGrid/Resend)
  console.log('Newsletter subscription:', validation.data.email)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    success: true,
    message: 'Дякуємо! Перевірте вашу пошту'
  }
}
```

**Step 2: Create newsletter section component**

Create `frontend/components/home/newsletter-section.tsx`:

```typescript
'use client'

import { useState, useTransition } from 'react'
import { Mail, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { subscribeToNewsletter } from '@/app/actions/newsletter'

export function NewsletterSection() {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await subscribeToNewsletter(formData)

      if (result.success) {
        setMessage({ type: 'success', text: result.message! })
        e.currentTarget.reset()
      } else {
        setMessage({ type: 'error', text: result.error! })
      }
    })
  }

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-gold via-gold/90 to-secondary">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6">
          <Mail className="w-10 h-10 text-white" />
        </div>

        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Отримуйте ексклюзивні пропозиції
        </h2>
        <p className="text-lg text-white/90 mb-8">
          Підпішіться на розсилку та отримайте знижку -10% на першу покупку
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              name="email"
              placeholder="Ваш email"
              required
              disabled={isPending}
              className="flex-1 px-4 py-3 rounded-lg bg-white text-dark placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={isPending}
              size="lg"
              className="bg-dark hover:bg-dark/90 text-white whitespace-nowrap"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Підписуємо...
                </>
              ) : (
                'Підписатися'
              )}
            </Button>
          </div>

          <div className="flex items-start gap-2 text-left">
            <input
              type="checkbox"
              name="consent"
              id="consent"
              required
              disabled={isPending}
              className="mt-1"
            />
            <label htmlFor="consent" className="text-sm text-white/90">
              Я погоджуюсь з умовами розсилки та політикою приватності
            </label>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                message.type === 'success' ? 'bg-green-500/20 text-white' : 'bg-red-500/20 text-white'
              }`}
            >
              {message.type === 'success' && <Check className="w-5 h-5" />}
              <p className="text-sm">{message.text}</p>
            </div>
          )}
        </form>

        {/* Privacy Note */}
        <p className="text-xs text-white/70 mt-6">
          Ми поважаємо вашу приватність і не передаємо дані третім особам
        </p>
      </div>
    </section>
  )
}
```

**Step 3: Verify TypeScript compiles**

Run: `npm run type-check`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add frontend/components/home/newsletter-section.tsx frontend/app/actions/newsletter.ts
git commit -m "feat: add newsletter section with server action

- Gold to green gradient background
- Email validation with Zod
- Server action for subscription
- Loading state with spinner
- Success/error messages
- Consent checkbox required
- Privacy note at bottom"
```

---

## Task 10: Assemble Home Page

**Files:**
- Modify: `frontend/app/page.tsx:1-52`

**Step 1: Update home page to use all sections**

Replace content in `frontend/app/page.tsx`:

```typescript
import { HeroSlider } from '@/components/home/hero-slider'
import { CategoriesSection } from '@/components/home/categories-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { BrandsSection } from '@/components/home/brands-section'
import { BenefitsSection } from '@/components/home/benefits-section'
import { NewsletterSection } from '@/components/home/newsletter-section'

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <CategoriesSection />
      <FeaturedProducts />
      <BrandsSection />
      <BenefitsSection />
      <NewsletterSection />
    </>
  )
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run type-check`
Expected: No TypeScript errors

**Step 3: Test in development**

Run: `npm run dev`
Navigate to: `http://localhost:3000`
Expected: All 6 sections render without errors

**Step 4: Commit**

```bash
git add frontend/app/page.tsx
git commit -m "feat: assemble complete home page

- Import and render all 6 sections
- Hero slider at top
- Alternating light/dark sections
- Newsletter at bottom
- Clean component composition"
```

---

## Task 11: Add Missing UI Components

**Files:**
- Create: `frontend/components/ui/input.tsx` (if not exists)

**Step 1: Check if Shadcn button component exists**

Run: `cat frontend/components/ui/button.tsx`
Expected: Component exists

**Step 2: Add input component if needed**

If `frontend/components/ui/input.tsx` doesn't exist, create it:

```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

**Step 3: Verify all imports resolve**

Run: `npm run type-check`
Expected: No TypeScript errors

**Step 4: Commit if changes made**

```bash
git add frontend/components/ui/input.tsx
git commit -m "feat: add input UI component

- Shadcn/ui style input
- Forwarded ref support
- Full accessibility
- Tailwind styling"
```

---

## Task 12: Final Polish and Testing

**Files:**
- Test: Home page functionality

**Step 1: Run development server**

Run: `npm run dev`
Expected: Server starts on port 3000

**Step 2: Visual inspection checklist**

Open: `http://localhost:3000`

Check:
- [ ] Hero slider auto-plays
- [ ] Hero slider navigation works (arrows, dots)
- [ ] Categories have hover effects
- [ ] Products appear in correct tabs
- [ ] Product cards have hover states
- [ ] Brands carousel auto-scrolls
- [ ] Benefits section has animations
- [ ] Newsletter form validates
- [ ] All sections are responsive

**Step 3: Test responsive design**

Use browser DevTools to test:
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1280px)

**Step 4: Run production build**

Run: `npm run build`
Expected: Build completes successfully with no errors

**Step 5: Check accessibility**

Run Lighthouse audit in Chrome DevTools
Expected: Accessibility score > 90

**Step 6: Final commit**

```bash
git add .
git commit -m "chore: final polish and testing

- Verified all sections render correctly
- Tested responsive breakpoints
- Confirmed animations work
- Validated production build
- All accessibility checks passed"
```

---

## Implementation Complete! 🎉

**Summary:**
- ✅ Premium color system (gold + dark)
- ✅ Hero slider with autoplay and navigation
- ✅ 6 product categories with hover effects
- ✅ Featured products with tabs
- ✅ Brands carousel
- ✅ Benefits section
- ✅ Newsletter with validation
- ✅ Scroll animations
- ✅ Fully responsive
- ✅ Ready for real data integration

**Next Steps:**
1. Add real images to `/public/images`
2. Replace Unsplash URLs with local images
3. Connect to Medusa API for real products
4. Add more Shadcn/ui components as needed
5. Implement header and footer components

**Performance Notes:**
- All images should be optimized and served via Next.js Image
- Consider lazy-loading sections below the fold
- Monitor bundle size with embla-carousel

---

## Execution Instructions

Plan saved to: `docs/plans/2026-01-30-home-page-implementation.md`

**Execute this plan using:**
1. **Subagent-Driven** (this session) - @superpowers:subagent-driven-development
2. **Parallel Session** (separate) - @superpowers:executing-plans in new session
