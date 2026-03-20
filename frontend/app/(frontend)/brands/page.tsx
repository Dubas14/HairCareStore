import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, ChevronRight } from 'lucide-react'
import { getBrands } from '@/lib/payload/client'
import type { Brand } from '@/lib/payload/types'
import { getImageUrl } from '@/lib/payload/types'

export const metadata: Metadata = {
  title: 'Бренди професійної косметики | HAIR LAB',
  description:
    'Офіційні партнери світових виробників професійної косметики для волосся. Купити оригінальну продукцію з доставкою по Україні.',
  openGraph: {
    title: 'Бренди професійної косметики | HAIR LAB',
    description:
      'Офіційні партнери світових виробників професійної косметики для волосся.',
  },
}

export default async function BrandsPage() {
  const brands = await getBrands()

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fbf7f2_0%,#faf7f3_36%,#ffffff_100%)]">
      <section className="relative overflow-hidden border-b border-black/6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(42,157,143,0.12),_transparent_22%),radial-gradient(circle_at_85%_10%,_rgba(212,163,115,0.12),_transparent_18%)]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-16">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              Головна
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Бренди</span>
          </nav>

          <div className="mt-8 max-w-3xl">
            <div className="inline-flex rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-foreground/58 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
              Наші бренди
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-[0.94] tracking-[-0.06em] text-foreground md:text-5xl lg:text-6xl">
              Офіційні бренди HAIR LAB
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              {brands.length > 0
                ? `${brands.map((b) => b.name).join(', ')} — професійна косметика для волосся.`
                : 'Професійна косметика для волосся.'}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        {brands.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {brands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-black/8 bg-white px-6 py-16 text-center shadow-[0_18px_44px_rgba(0,0,0,0.05)]">
            <p className="text-muted-foreground">Бренди поки не додані</p>
          </div>
        )}
      </section>
    </main>
  )
}

function BrandCard({ brand }: { brand: Brand }) {
  const logoUrl = getImageUrl(brand.logo)
  const accent = brand.accentColor || '#D4A373'

  return (
    <Link
      href={`/brands/${brand.slug}`}
      className="group relative block overflow-hidden rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_18px_44px_rgba(0,0,0,0.05)] transition-transform duration-300 hover:-translate-y-1"
    >
      <div
        className="absolute inset-x-0 top-0 h-32 opacity-80"
        style={{
          background: `linear-gradient(135deg, ${accent}22 0%, rgba(255,255,255,0) 72%)`,
        }}
      />

      <div className="relative flex min-h-[220px] flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-[1.4rem] border border-black/8 bg-[#fcfaf7]">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={brand.name}
                width={96}
                height={64}
                className="max-h-14 w-auto object-contain"
              />
            ) : (
              <span
                className="text-2xl font-bold text-white"
                style={{ color: accent }}
              >
                {brand.name.charAt(0)}
              </span>
            )}
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black/8 bg-white transition-transform duration-300 group-hover:-translate-y-0.5">
            <ArrowUpRight className="h-4 w-4 text-foreground/70" />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
            {brand.name}
          </h2>

          {brand.shortDescription && (
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {brand.shortDescription}
            </p>
          )}
        </div>

        <div className="mt-auto pt-6 text-sm text-foreground/56">
          {brand.countryOfOrigin && (
            <span>
              {brand.countryOfOrigin}
              {brand.foundedYear && ` • з ${brand.foundedYear}`}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
