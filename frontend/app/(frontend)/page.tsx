import dynamicImport from 'next/dynamic'
import { CategoriesSection } from '@/components/home/categories-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { BrandsSection } from '@/components/home/brands-section'
import { BenefitsSection } from '@/components/home/benefits-section'
import { NewsletterSection } from '@/components/home/newsletter-section'
import { PromoBlocks } from '@/components/home/promo-blocks'
import { getBanners, getPromoBlocks, getCategories, getBrands } from '@/lib/payload/client'
import { HomePageAnimations } from '@/components/home/home-page-animations'

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
  // Завантажуємо контент з Payload CMS
  const [banners, promoBlocks, categories, brands] = await Promise.all([
    getBanners('home'),
    getPromoBlocks(),
    getCategories(),
    getBrands(),
  ])

  // Organization JSON-LD is built from trusted static server-side data only
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: organizationJsonLd }}
      />
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
