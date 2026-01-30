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
