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
