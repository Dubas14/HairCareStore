import { HeroSliderCMS } from '@/components/home/hero-slider-cms'
import { CategoriesSection } from '@/components/home/categories-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { BrandsSection } from '@/components/home/brands-section'
import { BenefitsSection } from '@/components/home/benefits-section'
import { NewsletterSection } from '@/components/home/newsletter-section'
import { PromoBlocks } from '@/components/home/promo-blocks'
import { getBanners, getPromoBlocks } from '@/lib/payload/client'
import { HomePageAnimations } from '@/components/home/home-page-animations'

export default async function HomePage() {
  // Завантажуємо контент з Payload CMS
  const [banners, promoBlocks] = await Promise.all([
    getBanners('home'),
    getPromoBlocks(),
  ])

  return (
    <HomePageAnimations>
      <HeroSliderCMS banners={banners} />
      <CategoriesSection />
      <PromoBlocks blocks={promoBlocks} />
      <FeaturedProducts />
      <BrandsSection />
      <BenefitsSection />
      <NewsletterSection />
    </HomePageAnimations>
  )
}
