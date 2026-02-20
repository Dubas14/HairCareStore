import dynamicImport from 'next/dynamic'
import { getLocale } from 'next-intl/server'
import { CategoriesSection } from '@/components/home/categories-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { BrandsSection } from '@/components/home/brands-section'
import { BenefitsSection } from '@/components/home/benefits-section'
import { NewsletterSection } from '@/components/home/newsletter-section'
import { PromoBlocks } from '@/components/home/promo-blocks'
import { getBanners, getPromoBlocks, getCategories, getBrands } from '@/lib/payload/client'
import { HomePageAnimations } from '@/components/home/home-page-animations'
import { buildWebSiteJsonLd, buildSiteNavigationJsonLd } from '@/lib/structured-data'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3200'

const organizationJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'HAIR LAB',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description: 'Інтернет-магазин професійної косметики для волосся',
  sameAs: [
    'https://www.instagram.com/hairlab.ua',
    'https://www.facebook.com/hairlab.ua',
    'https://www.youtube.com/@hairlab.ua',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: 'Ukrainian',
  },
})

const HeroSliderCMS = dynamicImport(
  () => import('@/components/home/hero-slider-cms').then(mod => ({ default: mod.HeroSliderCMS })),
  { loading: () => <div className="w-full h-[500px] md:h-[600px] bg-muted animate-pulse rounded-lg" /> }
)

export default async function HomePage() {
  const locale = await getLocale()
  // Завантажуємо контент з Payload CMS
  const [banners, promoBlocks, categories, brands] = await Promise.all([
    getBanners('home', locale),
    getPromoBlocks(locale),
    getCategories(locale),
    getBrands(locale),
  ])

  // WebSite + SiteNavigation JSON-LD for Google Search/Sitelinks
  const webSiteJsonLd = buildWebSiteJsonLd()
  const navJsonLd = buildSiteNavigationJsonLd([
    { name: 'Каталог', url: '/shop' },
    { name: 'Категорії', url: '/categories' },
    { name: 'Бренди', url: '/brands' },
    { name: 'Блог', url: '/blog' },
  ])

  // All JSON-LD below is built from trusted static server-side data only (no user input)
  return (
    <>
      {/* Safe: all JSON-LD built from trusted server-side constants, not user input */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationJsonLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: webSiteJsonLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: navJsonLd }} />
      <HomePageAnimations>
        <HeroSliderCMS banners={banners} />
        <CategoriesSection categories={categories} />
        <PromoBlocks blocks={promoBlocks} />
        <FeaturedProducts />
        <BrandsSection brands={brands} />
        <BenefitsSection />
        <NewsletterSection />
      </HomePageAnimations>
    </>
  )
}
