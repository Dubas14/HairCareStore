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
    subtitle: 'Elgon, INEBRYA, MOOD, NEVITALY та інші',
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

// Featured Products - Real products from multicolor.ua
export const featuredProducts = {
  bestsellers: [
    {
      id: 1,
      name: 'Щоденний шампунь Yes Daily Everyday',
      brand: 'Elgon',
      slug: 'shchodennyi-shampun-elgon-yes-daily-everyday-shampoo-250-ml',
      imageUrl: 'https://multicolor.ua/image/cache/catalog/Elgon/Yes%20Daily_Shampoo_250ml-2-2-228x228.jpg',
      price: 529,
      rating: 4.8,
      reviewCount: 156
    },
    {
      id: 2,
      name: 'Шампунь регенеруючий Ultra Care Restoring',
      brand: 'MOOD',
      slug: 'shampun-reheneruiuchyi-mood-ultra-care-restoring-shampoo-400-ml',
      imageUrl: 'https://multicolor.ua/image/cache/catalog/MOOD/Ultra%20Care/Mood%20Ultra%20Care%20Shampoo%20400%20ml-228x228.png',
      price: 436,
      rating: 4.7,
      reviewCount: 98
    },
    {
      id: 3,
      name: 'Флюїд для додання блиску Crystal Beauty',
      brand: 'INEBRYA',
      slug: 'fliuid-dlia-dodannia-blysku-inebrya-crystal-beauty-100-ml',
      imageUrl: 'https://multicolor.ua/image/cache/catalog/INEBRYA/STYLING/Inebrya%20Crystal%20Beauty%20100-228x228.jpg',
      price: 644,
      rating: 4.9,
      reviewCount: 203
    },
    {
      id: 4,
      name: 'Шампунь проти випадіння Energy Shampoo',
      brand: 'INEBRYA',
      slug: 'shampun-proty-vypadinnia-volossia-inebrya-energy-shampoo-300-ml',
      imageUrl: 'https://multicolor.ua/image/cache/catalog/Inebria%202/Energy%202/Shampoo%20300%202-228x228.png',
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
      imageUrl: 'https://multicolor.ua/image/cache/catalog/NEVITALY/STYLING/flawless%20spray%20150ml-228x228.png',
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
      imageUrl: 'https://multicolor.ua/image/cache/catalog/INEBRYA/STYLING/Inebrya%20Thermo%20Spray%20250-228x228.jpg',
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
      imageUrl: 'https://multicolor.ua/image/cache/catalog/Inebria%202/Pro%20Volume%202/One%20200%202-228x228.png',
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
      imageUrl: 'https://multicolor.ua/image/cache/catalog/INEBRYA/STYLING/Inebrya%20Flossy%20Paste%20100-228x228.jpg',
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
      imageUrl: 'https://multicolor.ua/image/cache/catalog/Elgon/Yes%20Daily%202/Yes%20Daily%20Shampoo%201000ml-2-228x228.jpg',
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
      imageUrl: 'https://multicolor.ua/image/cache/catalog/Inebria%202/Grey%20By%20Day%202/Shampoo%201000%202-228x228.png',
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
      imageUrl: 'https://multicolor.ua/image/cache/catalog/Inebria%202/Cleany%202/Sampoo%201000%202-228x228.png',
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
      imageUrl: 'https://multicolor.ua/image/cache/catalog/MOOD/Ultra%20Care/Mood_Ultra%20Care%20Shampoo%201000%20ml-228x228.png',
      price: 770,
      oldPrice: 963,
      discount: 20,
      rating: 4.7,
      reviewCount: 78
    }
  ]
}

// Brands - Real brands from multicolor.ua
export const brands: Brand[] = [
  {
    id: 1,
    name: 'Elgon',
    slug: 'elgon',
    logoUrl: 'https://multicolor.ua/image/cache/catalog/%20Elgon%20Colorcare%20Delicate/Elgon-logo_black%20(1)-100x100.png'
  },
  {
    id: 2,
    name: 'INEBRYA',
    slug: 'inebrya',
    logoUrl: 'https://multicolor.ua/image/cache/catalog/INEBRYA/BALANCE/Inebrya-logo_black%20(1)-100x100.png'
  },
  {
    id: 3,
    name: 'MOOD',
    slug: 'mood',
    logoUrl: 'https://multicolor.ua/image/cache/catalog/MOOD/Activator/Mood-logo_black%20(1)-100x100.png'
  },
  {
    id: 4,
    name: 'NEVITALY',
    slug: 'nevitaly',
    logoUrl: 'https://multicolor.ua/image/cache/catalog/NEVITALY/%20Cuddles%20Hand/Nevitaly-logo-01-100x100.png'
  },
  {
    id: 5,
    name: 'LINK D',
    slug: 'link-d',
    logoUrl: 'https://multicolor.ua/image/cache/catalog/LINK%20D/LOGO%20LINK-D-100x100.png'
  },
  {
    id: 6,
    name: 'Trend Toujours',
    slug: 'trend-toujours',
    logoUrl: 'https://multicolor.ua/image/cache/catalog/TREHD%20TOUJOURS/After%20color%20care/toujours-100x100.png'
  },
  {
    id: 7,
    name: 'URBAN DOG',
    slug: 'urban-dog',
    logoUrl: 'https://multicolor.ua/image/cache/catalog/URBAN%20DOG/IMG_5295-100x100.PNG'
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
