'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, GitCompareArrows, ShoppingBag, Star, ArrowLeft, Sparkles } from 'lucide-react'
import { useCompareStore } from '@/stores/compare-store'
import { useCartContext } from '@/components/providers/cart-provider'
import { ensureGsapPlugins, prefersReducedMotion } from '@/lib/gsap'

export default function ComparePage() {
  const pageRef = useRef<HTMLDivElement | null>(null)
  const { items, removeItem, clearCompare } = useCompareStore()
  const { addToCart } = useCartContext()
  const [addingId, setAddingId] = useState<number | null>(null)

  useEffect(() => {
    if (!pageRef.current || prefersReducedMotion()) return

    const { gsap } = ensureGsapPlugins()
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-compare-hero], [data-compare-actions], [data-compare-desktop], [data-compare-mobile], [data-compare-empty]',
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power2.out',
        }
      )
    }, pageRef)

    return () => ctx.revert()
  }, [items.length])

  const handleAddToCart = async (productId: number | string | undefined, variantIndex: number) => {
    if (!productId) return
    setAddingId(typeof productId === 'string' ? parseInt(productId) : (productId as number))
    try {
      await addToCart(productId, variantIndex, 1)
    } catch {
      // silently fail
    } finally {
      setAddingId(null)
    }
  }

  const rows: Array<{ label: string; getValue: (item: (typeof items)[0]) => React.ReactNode }> = [
    {
      label: 'Бренд',
      getValue: (item) => item.brand || '—',
    },
    {
      label: 'Ціна',
      getValue: (item) => (
        <div>
          <span className="text-lg font-bold text-foreground">{item.price} грн</span>
          {item.oldPrice && (
            <span className="ml-2 text-sm text-muted-foreground line-through">
              {item.oldPrice} грн
            </span>
          )}
        </div>
      ),
    },
    {
      label: 'Знижка',
      getValue: (item) =>
        item.discount ? (
          <span className="rounded-full bg-[#eef4ea] px-2.5 py-1 text-sm font-semibold text-[#3f6c44]">
            -{item.discount}%
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      label: 'Рейтинг',
      getValue: (item) => (
        <div className="flex items-center gap-1.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.floor(item.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-muted text-muted'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({item.reviewCount})</span>
        </div>
      ),
    },
  ]

  const renderProductCard = (item: (typeof items)[0]) => (
    <div
      key={item.id}
      className="relative rounded-[1.6rem] border border-black/8 bg-white/94 p-4 shadow-[0_20px_60px_rgba(16,24,40,0.08)]"
    >
      <button
        onClick={() => removeItem(item.id)}
        className="absolute right-3 top-3 rounded-full bg-muted p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        aria-label={`Видалити ${item.name}`}
      >
        <X className="h-4 w-4" />
      </button>

      <Link href={`/products/${item.slug}`} className="group block">
        <div className="relative mb-4 aspect-[4/4.4] overflow-hidden rounded-[1.25rem] bg-[#f6efe5]">
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={420}
            height={480}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/42">
          {item.brand}
        </p>
        <h2 className="mt-2 line-clamp-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
          {item.name}
        </h2>
      </Link>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold text-foreground">{item.price} грн</p>
          {item.oldPrice && (
            <p className="text-sm text-muted-foreground line-through">{item.oldPrice} грн</p>
          )}
        </div>
        {item.discount ? (
          <span className="rounded-full bg-[#1f2a20] px-3 py-1 text-xs font-medium text-white">
            -{item.discount}%
          </span>
        ) : null}
      </div>

      <button
        onClick={() => handleAddToCart(item.productId, item.variantIndex ?? 0)}
        disabled={!item.productId || addingId === item.id}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1f2a20] px-4 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
      >
        <ShoppingBag className="h-4 w-4" />
        {addingId === item.id ? 'Додаємо...' : 'У кошик'}
      </button>
    </div>
  )

  const renderEmptyState = (message: string) => (
    <div
      data-compare-empty
      className="mx-auto max-w-3xl rounded-[2rem] border border-black/8 bg-white/90 px-6 py-12 text-center shadow-[0_28px_80px_rgba(16,24,40,0.08)]"
    >
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#f7efe3]">
        <GitCompareArrows className="h-9 w-9 text-foreground/65" />
      </div>
      <h1 className="mb-2 text-3xl font-semibold tracking-[-0.05em] text-foreground">
        Порівняння товарів
      </h1>
      <p className="mx-auto max-w-xl text-muted-foreground">{message}</p>
      <Link
        href="/shop"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1f2a20] px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
      >
        <ArrowLeft className="h-4 w-4" />
        До каталогу
      </Link>
    </div>
  )

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4eee6_0%,#fbf7f2_34%,#ffffff_100%)]">
      <div ref={pageRef} className="container mx-auto px-4 py-10 md:py-14">
        <div
          data-compare-hero
          className="mx-auto max-w-6xl rounded-[2rem] border border-black/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,239,227,0.92))] px-6 py-8 shadow-[0_28px_80px_rgba(16,24,40,0.08)] md:px-10"
        >
          <p className="w-fit rounded-full border border-black/10 bg-white/75 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-foreground/48">
            Compare lab
          </p>
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(260px,0.92fr)] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold leading-[0.92] tracking-[-0.06em] text-foreground md:text-5xl">
                Порівнюйте товари без шуму, в одному чистому екрані.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Ми зібрали характеристики, ціну, рейтинг і швидкий доступ до покупки в одному місці. На мобайлі блоки читаються як окремі секції, на desktop зберігається таблична логіка.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-black/8 bg-white/80 p-4">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-foreground/45">Товарів</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{items.length}</p>
                <p className="mt-1 text-sm text-muted-foreground">можна порівнювати до 4 позицій</p>
              </div>
              <div className="rounded-[1.5rem] border border-black/8 bg-white/80 p-4">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-foreground/45">Сценарій</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">Desktop + mobile</p>
                <p className="mt-1 text-sm text-muted-foreground">адаптивний вигляд без втрати змісту</p>
              </div>
              <div className="rounded-[1.5rem] border border-black/8 bg-white/80 p-4">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-foreground/45">Фокус</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">Decision-ready</p>
                <p className="mt-1 text-sm text-muted-foreground">швидко видно різницю між товарами</p>
              </div>
            </div>
          </div>
        </div>

        {items.length === 0 && renderEmptyState('Додайте товари для порівняння, натиснувши кнопку порівняння на картці товару.')}
        {items.length === 1 && renderEmptyState('Додайте ще хоча б один товар, щоб побачити порівняння характеристик і цін.')}

        {items.length > 1 && (
          <>
            <div
              data-compare-actions
              className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm text-muted-foreground shadow-[0_10px_24px_rgba(16,24,40,0.05)]">
                <Sparkles className="h-4 w-4 text-primary" />
                Порівняння адаптується під вузькі екрани без горизонтального болю.
              </div>

              <button
                onClick={clearCompare}
                className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-foreground transition-transform hover:-translate-y-0.5"
              >
                Очистити все
              </button>
            </div>

            <div
              data-compare-mobile
              className="mt-6 grid gap-6 lg:hidden"
            >
              <div className="grid gap-4">
                {items.map(renderProductCard)}
              </div>

              <div className="space-y-4">
                {rows.map((row) => (
                  <section
                    key={row.label}
                    className="rounded-[1.75rem] border border-black/8 bg-white/92 p-5 shadow-[0_18px_50px_rgba(16,24,40,0.07)]"
                  >
                    <h2 className="text-lg font-semibold text-foreground">{row.label}</h2>
                    <div className="mt-4 space-y-3">
                      {items.map((item) => (
                        <div
                          key={`${row.label}-${item.id}`}
                          className="rounded-[1.25rem] border border-black/6 bg-[#fcf8f2] p-4"
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/42">
                            {item.name}
                          </p>
                          <div className="mt-2 text-sm text-foreground">{row.getValue(item)}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            <div
              data-compare-desktop
              className="mt-6 hidden overflow-hidden rounded-[2rem] border border-black/8 bg-white/94 shadow-[0_28px_80px_rgba(16,24,40,0.08)] lg:block"
            >
              <div className="overflow-x-auto">
                <table className="min-w-[860px] w-full border-collapse">
                  <thead className="bg-[#fcf8f2]">
                    <tr>
                      <th className="w-[180px] p-6 text-left text-xs font-semibold uppercase tracking-[0.22em] text-foreground/45">
                        Товар
                      </th>
                      {items.map((item) => (
                        <th key={item.id} className="min-w-[230px] p-6 text-left align-top">
                          <div className="relative rounded-[1.5rem] border border-black/8 bg-white p-4">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="absolute right-3 top-3 rounded-full bg-muted p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                              aria-label={`Видалити ${item.name}`}
                            >
                              <X className="h-4 w-4" />
                            </button>

                            <Link href={`/products/${item.slug}`} className="group block">
                              <div className="mb-4 aspect-[4/4.4] overflow-hidden rounded-[1.2rem] bg-[#f6efe5]">
                                <Image
                                  src={item.imageUrl}
                                  alt={item.name}
                                  width={360}
                                  height={400}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              </div>
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/42">
                                {item.brand}
                              </p>
                              <p className="mt-2 line-clamp-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                                {item.name}
                              </p>
                            </Link>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={row.label} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#fcf8f2]/70'}>
                        <td className="p-6 text-sm font-semibold text-foreground/76">{row.label}</td>
                        {items.map((item) => (
                          <td key={`${row.label}-${item.id}`} className="p-6 align-top text-sm text-foreground">
                            {row.getValue(item)}
                          </td>
                        ))}
                      </tr>
                    ))}

                    <tr>
                      <td className="p-6" />
                      {items.map((item) => (
                        <td key={`cta-${item.id}`} className="p-6 pt-2">
                          <button
                            onClick={() => handleAddToCart(item.productId, item.variantIndex ?? 0)}
                            disabled={!item.productId || addingId === item.id}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1f2a20] px-4 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                          >
                            <ShoppingBag className="h-4 w-4" />
                            {addingId === item.id ? 'Додаємо...' : 'У кошик'}
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
