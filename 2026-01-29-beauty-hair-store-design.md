# 🎯 ЗАВДАННЯ

Створи повноцінний інтернет-магазин професійної косметики для волосся "Beauty Hair Store" з нуля.

---

## 📦 ТЕХНІЧНИЙ СТЕК

| Компонент | Технологія | Версія |
|-----------|------------|--------|
| Frontend | Next.js + TypeScript + Tailwind CSS + Shadcn/ui | 15+ |
| Backend | Medusa | 2.0+ |
| База даних | PostgreSQL | 15+ |
| Кеш | Redis | 7+ |
| Контейнеризація | Docker + Docker Compose | Latest |
| Блог | MDX в Next.js | - |

---

## 🔌 ПОРТИ (КАСТОМНІ)

| Сервіс | Порт |
|--------|------|
| PostgreSQL | 5450 |
| Redis | 6390 |
| Medusa Backend | 9100 |
| Medusa Admin | 9100/app |
| Next.js Frontend | 3100 |

---

## 🏗️ СТРУКТУРА ПРОЄКТУ
```
beauty-hair-store/
├── docker-compose.yml
├── .env.example
├── README.md
│
├── backend/                    # Medusa 2.0
│   ├── Dockerfile
│   ├── package.json
│   ├── medusa-config.ts
│   ├── tsconfig.json
│   │
│   └── src/
│       ├── modules/            # Кастомні модулі
│       │   ├── hair-type/      # Тип волосся
│       │   ├── ingredients/    # Інгредієнти
│       │   └── quiz/           # Квіз підбору
│       │
│       ├── api/                # Кастомні API endpoints
│       │   ├── store/
│       │   └── admin/
│       │
│       ├── subscribers/        # Event handlers
│       └── jobs/               # Background jobs
│
├── frontend/                   # Next.js 15 Storefront
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   │
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Головна
│   │   ├── (shop)/
│   │   │   ├── products/
│   │   │   │   ├── page.tsx            # Каталог
│   │   │   │   └── [handle]/page.tsx   # Картка товару
│   │   │   ├── categories/
│   │   │   │   └── [handle]/page.tsx   # Категорія
│   │   │   ├── cart/page.tsx           # Кошик
│   │   │   └── checkout/page.tsx       # Оформлення
│   │   │
│   │   ├── (account)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── account/
│   │   │       ├── page.tsx            # Профіль
│   │   │       ├── orders/page.tsx     # Замовлення
│   │   │       └── wishlist/page.tsx   # Обране
│   │   │
│   │   ├── (content)/
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx            # Блог
│   │   │   │   └── [slug]/page.tsx     # Стаття
│   │   │   ├── brands/page.tsx         # Бренди
│   │   │   └── quiz/page.tsx           # Квіз підбору
│   │   │
│   │   └── api/                        # API Routes
│   │
│   ├── components/
│   │   ├── ui/                         # Shadcn/ui
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   └── mobile-menu.tsx
│   │   ├── products/
│   │   │   ├── product-card.tsx
│   │   │   ├── product-grid.tsx
│   │   │   ├── product-filters.tsx
│   │   │   └── product-gallery.tsx
│   │   ├── cart/
│   │   │   ├── cart-item.tsx
│   │   │   └── cart-summary.tsx
│   │   └── quiz/
│   │       ├── quiz-step.tsx
│   │       └── quiz-results.tsx
│   │
│   ├── lib/
│   │   ├── medusa/
│   │   │   ├── client.ts               # Medusa JS Client
│   │   │   └── actions.ts              # Server Actions
│   │   ├── utils.ts
│   │   └── constants.ts
│   │
│   ├── hooks/
│   │   ├── use-cart.ts
│   │   └── use-wishlist.ts
│   │
│   ├── content/                        # MDX блог
│   │   └── blog/
│   │       └── *.mdx
│   │
│   └── public/
│       └── images/
│
└── scripts/
    ├── seed.ts                         # Тестові дані
    └── backup.sh
```

---

## 🐳 DOCKER COMPOSE
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: beauty-postgres
    environment:
      POSTGRES_DB: ${DB_NAME:-medusa}
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
    ports:
      - "5450:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - beauty-network

  redis:
    image: redis:7-alpine
    container_name: beauty-redis
    ports:
      - "6390:6379"
    volumes:
      - redis_data:/data
    networks:
      - beauty-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: beauty-backend
    ports:
      - "9100:9000"
    environment:
      DATABASE_URL: postgres://${DB_USER:-postgres}:${DB_PASSWORD:-postgres}@postgres:5432/${DB_NAME:-medusa}
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      COOKIE_SECRET: ${COOKIE_SECRET}
      STORE_CORS: http://localhost:3100
      ADMIN_CORS: http://localhost:9100
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ./backend:/app
      - /app/node_modules
    networks:
      - beauty-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: beauty-frontend
    ports:
      - "3100:3000"
    environment:
      NEXT_PUBLIC_MEDUSA_BACKEND_URL: http://localhost:9100
      NEXT_PUBLIC_STORE_URL: http://localhost:3100
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    networks:
      - beauty-network

networks:
  beauty-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

---

## 🔐 .ENV.EXAMPLE
```env
# Database
DB_NAME=medusa
DB_USER=postgres
DB_PASSWORD=your-secure-password-here

# Medusa Secrets (min 32 characters)
JWT_SECRET=supersecretjwtkey1234567890abcdef
COOKIE_SECRET=supersecretcookiekey1234567890ab

# Ports (custom)
POSTGRES_PORT=5450
REDIS_PORT=6390
BACKEND_PORT=9100
FRONTEND_PORT=3100

# URLs
MEDUSA_BACKEND_URL=http://localhost:9100
STORE_URL=http://localhost:3100

# CORS
STORE_CORS=http://localhost:3100
ADMIN_CORS=http://localhost:9100

# Stripe (optional)
STRIPE_API_KEY=
STRIPE_WEBHOOK_SECRET=

# LiqPay (optional)
LIQPAY_PUBLIC_KEY=
LIQPAY_PRIVATE_KEY=
```

---

## 🛒 ФУНКЦІОНАЛЬНІ ВИМОГИ

### Каталог товарів
- Фільтри: тип волосся, проблема, бренд, ціна, об'єм, без сульфатів/парабенів
- Сортування: ціна, популярність, новизна, рейтинг
- Пагінація: 12/24/48 товарів

### Картка товару
- Галерея зображень
- Варіанти (об'єм)
- Інгредієнти з підсвічуванням алергенів
- Відгуки та рейтинг
- "Купують разом"
- Додати в кошик / обране

### Квіз підбору
- 5-6 кроків (тип волосся, проблема, бюджет)
- Персоналізовані рекомендації

### Кошик і Checkout
- Зміна кількості
- Промокоди
- Нова Пошта / Укрпошта
- Оплата: карта, готівка

### Особистий кабінет
- Історія замовлень
- Обране
- Адреси доставки

### Блог (MDX)
- Статті про догляд за волоссям
- Категорії, теги

---

## 🎨 ДИЗАЙН

- Світла тема, мінімалізм
- Акцентний колір: #8B5CF6 (фіолетовий) або #EC4899 (рожевий)
- Шрифт: Inter
- Mobile-first
- Shadcn/ui компоненти

---

## 📋 КРОКИ ВИКОНАННЯ

### Етап 1: Налаштування середовища
1. Створити структуру папок
2. Налаштувати Docker Compose
3. Ініціалізувати Medusa 2.0 backend
4. Ініціалізувати Next.js 15 frontend
5. Перевірити що все запускається

### Етап 2: Backend (Medusa)
1. Налаштувати базову конфігурацію
2. Створити кастомні поля для товарів (hairType, ingredients)
3. Налаштувати категорії для косметики
4. Створити seed дані (тестові товари)

### Етап 3: Frontend — Базові сторінки
1. Layout (header, footer)
2. Головна сторінка
3. Каталог товарів з фільтрами
4. Картка товару
5. Кошик
6. Checkout

### Етап 4: Авторизація та акаунт
1. Реєстрація / Вхід
2. Особистий кабінет
3. Історія замовлень
4. Обране

### Етап 5: Додаткові фічі
1. Квіз підбору
2. Блог (MDX)
3. Пошук
4. Відгуки

### Етап 6: Оптимізація
1. SEO (meta, sitemap, schema.org)
2. Швидкість (Lighthouse > 90)
3. PWA

---

## ⚠️ ВАЖЛИВО

1. Використовуй Medusa 2.0 (не 1.x)
2. Використовуй Next.js 15 App Router
3. Всі компоненти — TypeScript
4. Server Components де можливо
5. Server Actions для мутацій
6. Tailwind CSS для стилів
7. Shadcn/ui для UI компонентів

---

## 🚀 КОМАНДИ ЗАПУСКУ
```bash
# Клонувати і запустити
git clone <repo>
cd beauty-hair-store
cp .env.example .env
docker-compose up -d

# Перевірити
# Frontend: http://localhost:3100
# Backend API: http://localhost:9100
# Medusa Admin: http://localhost:9100/app
# PostgreSQL: localhost:5450
# Redis: localhost:6390
```

---

## 🔗 URLs ПІСЛЯ ЗАПУСКУ

| Сервіс | URL |
|--------|-----|
| Магазин (Frontend) | http://localhost:3100 |
| Medusa API | http://localhost:9100 |
| Medusa Admin | http://localhost:9100/app |
| API Health | http://localhost:9100/health |

---

Почни з Етапу 1 — створи базову структуру проєкту і Docker конфігурацію.