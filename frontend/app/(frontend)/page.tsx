import dynamic from 'next/dynamic'
import { CategoriesSection } from '@/components/home/categories-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { BrandsSection } from '@/components/home/brands-section'
import { BenefitsSection } from '@/components/home/benefits-section'
import { NewsletterSection } from '@/components/home/newsletter-section'
import { PromoBlocks } from '@/components/home/promo-blocks'
import { getBanners, getPromoBlocks, getCategories, getBrands } from '@/lib/payload/client'
import { HomePageAnimations } from '@/components/home/home-page-animations'

const HeroSliderCMS = dynamic(
  () => import('@/components/home/hero-slider-cms').then(mod => ({ default: mod.HeroSliderCMS })),
  { ssr: false, loading: () => <div className="w-full h-[500px] md:h-[600px] bg-muted animate-pulse rounded-lg" /> }
)

export default async function HomePage() {
  // Завантажуємо контент з Payload CMS
  const [banners, promoBlocks, categories, brands] = await Promise.all([
    getBanners('home'),
    getPromoBlocks(),
    getCategories(),
    getBrands(),
  ])

  return (
    <HomePageAnimations>
      <HeroSliderCMS banners={banners} />
      <CategoriesSection categories={categories} />
      <PromoBlocks blocks={promoBlocks} />
      <FeaturedProducts />
      <BrandsSection brands={brands} />
      <BenefitsSection />
      <NewsletterSection />
    </HomePageAnimations>
  )
}
