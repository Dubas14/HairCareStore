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
  medusaId?: string // Medusa product ID (required for wishlist)
  variantId?: string // Medusa variant ID (required for cart)
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
    backgroundUrl: '/images/heroes/hero-1.jpg',
    title: 'Професійна косметика для вашого волосся',
    subtitle: 'Відкрийте для себе найкращі продукти від світових брендів',
    buttons: [
      { text: 'Каталог товарів', href: '/shop', variant: 'primary' },
      { text: 'Пройти квіз', href: '/quiz', variant: 'secondary' }
    ],
    align: 'center'
  },
  {
    id: 2,
    type: 'image',
    backgroundUrl: '/images/heroes/hero-2.jpg',
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
    backgroundUrl: '/images/heroes/hero-3.jpg',
    title: 'Нові надходження від преміум брендів',
    subtitle: 'Elgon, INEBRYA, MOOD, NEVITALY та інші',
    buttons: [
      { text: 'Переглянути новинки', href: '/shop?filter=new', variant: 'primary' }
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
    imageUrl: '/images/categories/cat-shampoos.jpg'
  },
  {
    id: 2,
    name: 'Кондиціонери',
    slug: 'conditioners',
    productCount: 89,
    imageUrl: '/images/categories/cat-conditioners.jpg'
  },
  {
    id: 3,
    name: 'Маски та догляд',
    slug: 'masks',
    productCount: 156,
    imageUrl: '/images/categories/cat-masks.jpg'
  },
  {
    id: 4,
    name: 'Фарби для волосся',
    slug: 'hair-color',
    productCount: 234,
    imageUrl: '/images/categories/cat-hair-color.jpg'
  },
  {
    id: 5,
    name: 'Укладання',
    slug: 'styling',
    productCount: 98,
    imageUrl: '/images/categories/cat-masks.jpg'
  },
  {
    id: 6,
    name: 'Аксесуари',
    slug: 'accessories',
    productCount: 67,
    imageUrl: '/images/categories/cat-hair-color.jpg'
  }
]

// Featured Products (DEPRECATED - використовуйте useProducts() з Medusa)
// Залишено для зворотної сумісності, але компоненти мають завантажувати
// реальні товари з Medusa API через хук useProducts()
export const featuredProducts = {
  bestsellers: [
    {
      id: 1,
      name: 'Щоденний шампунь Yes Daily Everyday',
      brand: 'Elgon',
      slug: 'shchodennyi-shampun-elgon-yes-daily-everyday-shampoo-250-ml',
      imageUrl: '/images/products/product-1.jpg',
      price: 529,
      rating: 4.8,
      reviewCount: 156
    },
    {
      id: 2,
      name: 'Шампунь регенеруючий Ultra Care Restoring',
      brand: 'MOOD',
      slug: 'shampun-reheneruiuchyi-mood-ultra-care-restoring-shampoo-400-ml',
      imageUrl: '/images/products/product-2.png',
      price: 436,
      rating: 4.7,
      reviewCount: 98
    },
    {
      id: 3,
      name: 'Флюїд для додання блиску Crystal Beauty',
      brand: 'INEBRYA',
      slug: 'fliuid-dlia-dodannia-blysku-inebrya-crystal-beauty-100-ml',
      imageUrl: '/images/products/product-3.jpg',
      price: 644,
      rating: 4.9,
      reviewCount: 203
    },
    {
      id: 4,
      name: 'Шампунь проти випадіння Energy Shampoo',
      brand: 'INEBRYA',
      slug: 'shampun-proty-vypadinnia-volossia-inebrya-energy-shampoo-300-ml',
      imageUrl: '/images/products/product-4.png',
      price: 313,
      rating: 4.6,
      reviewCount: 87
    }
  ],
  new: [
    {
      id: 5,
      name: 'Термоспрей для укладання Flawless Spray',
      brand: 'NEVITALY',
      slug: 'termosprei-dlia-ukladannia-volossia-nevitaly-flawless-spray-150-ml',
      imageUrl: '/images/products/product-5.png',
      price: 1185,
      badge: 'Новинка',
      rating: 4.7,
      reviewCount: 45
    },
    {
      id: 6,
      name: 'Термозахисний спрей Thermo Spray',
      brand: 'INEBRYA',
      slug: 'termozakhysnyi-sprei-inebrya-thermo-spray-250-ml',
      imageUrl: '/images/products/product-6.jpg',
      price: 644,
      badge: 'Новинка',
      rating: 4.5,
      reviewCount: 32
    },
    {
      id: 7,
      name: 'Спрей для додання об\'єму Volume One 15в1',
      brand: 'INEBRYA',
      slug: 'sprei-dlia-dodannia-obiemu-15v1-inebrya-volume-one-spray-200-ml',
      imageUrl: '/images/products/product-7.png',
      price: 696,
      badge: 'Новинка',
      rating: 4.6,
      reviewCount: 56
    },
    {
      id: 8,
      name: 'Паста для моделювання Flossy Paste',
      brand: 'INEBRYA',
      slug: 'pasta-dlia-modeliuvannia-inebrya-flossy-paste-100-ml',
      imageUrl: '/images/products/product-8.jpg',
      price: 791,
      badge: 'Новинка',
      rating: 4.4,
      reviewCount: 28
    }
  ],
  sale: [
    {
      id: 9,
      name: 'Шампунь щоденний Yes Daily Everyday 1000 мл',
      brand: 'Elgon',
      slug: 'shchodennyi-shampun-elgon-yes-daily-everyday-shampoo-1000-ml',
      imageUrl: '/images/products/product-9.jpg',
      price: 1116,
      oldPrice: 1395,
      discount: 20,
      rating: 4.9,
      reviewCount: 167
    },
    {
      id: 10,
      name: 'Шампунь тонуючий Grey By Day 1000 мл',
      brand: 'INEBRYA',
      slug: 'shampun-tonuiuchyi-inebrya-grey-by-day-shampoo-1000-ml',
      imageUrl: '/images/products/product-10.png',
      price: 876,
      oldPrice: 1095,
      discount: 20,
      rating: 4.6,
      reviewCount: 112
    },
    {
      id: 11,
      name: 'Шампунь проти лупи Cleany Shampoo 1000 мл',
      brand: 'INEBRYA',
      slug: 'shampun-proty-lupy-inebrya-cleany-shampoo-1000-ml',
      imageUrl: '/images/products/product-11.png',
      price: 495,
      oldPrice: 619,
      discount: 20,
      rating: 4.8,
      reviewCount: 94
    },
    {
      id: 12,
      name: 'Шампунь регенеруючий Ultra Care 1000 мл',
      brand: 'MOOD',
      slug: 'shampun-reheneruiuchyi-mood-ultra-care-restoring-shampoo-1000-ml',
      imageUrl: '/images/products/product-12.png',
      price: 770,
      oldPrice: 963,
      discount: 20,
      rating: 4.7,
      reviewCount: 78
    }
  ]
}

// Brands
export const brands: Brand[] = [
  {
    id: 1,
    name: 'Elgon',
    slug: 'elgon',
    logoUrl: '/images/brands/brand-elgon.png'
  },
  {
    id: 2,
    name: 'INEBRYA',
    slug: 'inebrya',
    logoUrl: '/images/brands/brand-inebrya.png'
  },
  {
    id: 3,
    name: 'MOOD',
    slug: 'mood',
    logoUrl: '/images/brands/brand-mood.png'
  },
  {
    id: 4,
    name: 'NEVITALY',
    slug: 'nevitaly',
    logoUrl: '/images/brands/brand-nevitaly.png'
  },
  {
    id: 5,
    name: 'LINK D',
    slug: 'link-d',
    logoUrl: '/images/brands/brand-linkd.png'
  },
  {
    id: 6,
    name: 'Trend Toujours',
    slug: 'trend-toujours',
    logoUrl: '/images/brands/brand-toujours.png'
  },
  {
    id: 7,
    name: 'URBAN DOG',
    slug: 'urban-dog',
    logoUrl: '/images/brands/brand-urbandog.png'
  }
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
