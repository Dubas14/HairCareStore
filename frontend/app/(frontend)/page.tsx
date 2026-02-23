import dynamicImport from 'next/dynamic'
import { CategoriesSection } from '@/components/home/categories-section'
import { BenefitsSection } from '@/components/home/benefits-section'
import { getBanners, getPromoBlocks, getCategories, getBrands } from '@/lib/payload/client'
import { HomePageAnimations } from '@/components/home/home-page-animations'
import { buildWebSiteJsonLd, buildSiteNavigationJsonLd } from '@/lib/structured-data'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3200'

// Safe: built from trusted server-side constants only (no user input)
const organizationJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'HAIR LAB',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description: 'Інтернет-магазин професійної косметики для волосся',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: 'Ukrainian',
  },
})

// LocalBusiness schema for local SEO (trusted constants only)
const localBusinessJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: 'HAIR LAB',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  image: `${BASE_URL}/logo.png`,
  description: 'Інтернет-магазин професійної косметики для волосся',
  currenciesAccepted: 'UAH',
  paymentAccepted: 'Cash, Credit Card',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'UA',
    addressLocality: 'Україна',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '09:00',
    closes: '21:00',
  },
})

const HeroSliderCMS = dynamicImport(
  () => import('@/components/home/hero-slider-cms').then(mod => ({ default: mod.HeroSliderCMS })),
  { loading: () => <div className="w-full h-[500px] md:h-[600px] bg-muted animate-pulse rounded-lg" /> }
)

const FeaturedProducts = dynamicImport(
  () => import('@/components/home/featured-products').then(mod => ({ default: mod.FeaturedProducts })),
  { loading: () => <div className="w-full h-[400px] bg-muted/50 animate-pulse rounded-lg" /> }
)

const BrandsSection = dynamicImport(
  () => import('@/components/home/brands-section').then(mod => ({ default: mod.BrandsSection })),
  { loading: () => <div className="w-full h-[300px] bg-muted/50 animate-pulse rounded-lg" /> }
)

const PromoBlocks = dynamicImport(
  () => import('@/components/home/promo-blocks').then(mod => ({ default: mod.PromoBlocks })),
  { loading: () => <div className="w-full h-[200px] bg-muted/50 animate-pulse rounded-lg" /> }
)

const NewsletterSection = dynamicImport(
  () => import('@/components/home/newsletter-section').then(mod => ({ default: mod.NewsletterSection })),
  { loading: () => <div className="w-full h-[200px] bg-muted/50 animate-pulse rounded-lg" /> }
)

function JsonLd({ json }: { json: string }) {
  // All JSON-LD is built from trusted server-side constants, not user input — safe to inject
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}

export default async function HomePage() {
  const [banners, promoBlocks, categories, brands] = await Promise.all([
    getBanners('home'),
    getPromoBlocks(),
    getCategories(),
    getBrands(),
  ])

  const webSiteJsonLd = buildWebSiteJsonLd()
  const navJsonLd = buildSiteNavigationJsonLd([
    { name: 'Каталог', url: '/shop' },
    { name: 'Категорії', url: '/categories' },
    { name: 'Бренди', url: '/brands' },
    { name: 'Блог', url: '/blog' },
  ])

  return (
    <>
      <JsonLd json={organizationJsonLd} />
      <JsonLd json={localBusinessJsonLd} />
      <JsonLd json={webSiteJsonLd} />
      <JsonLd json={navJsonLd} />
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
