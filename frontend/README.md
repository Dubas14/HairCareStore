# HAIR LAB Frontend

Next.js 15 + React 19 + Payload CMS v3 — storefront та CMS для інтернет-магазину HAIR LAB.

## Запуск

```bash
npm install --legacy-peer-deps
npm run dev          # Development (port 3200)
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript check
```

## Структура

```
app/
├── layout.tsx              # Root layout
├── actions/                # Server Actions (newsletter, loyalty-admin)
├── (frontend)/             # Storefront route group
│   ├── layout.tsx          # Header + Footer + Providers
│   ├── page.tsx            # Головна
│   ├── account/            # Auth та кабінет
│   ├── brands/             # Бренди
│   ├── categories/         # Категорії
│   ├── checkout/           # Оформлення замовлення
│   ├── pages/              # CMS сторінки
│   ├── products/           # Картки товарів
│   └── shop/               # Каталог з фільтрами
└── (payload)/              # Payload CMS route group
    ├── admin/              # Admin панель
    └── api/                # Payload REST API

components/
├── ui/                     # Radix UI / shadcn
├── payload/                # Payload CMS components
│   ├── loyalty/            # Loyalty admin views (Dashboard, Settings, Customers, Transactions)
│   ├── Dashboard.tsx       # CMS dashboard
│   ├── LoyaltyNavLink.tsx  # Sidebar nav link
│   └── ...
├── home/                   # Секції головної
├── products/               # Компоненти товарів
└── ...

lib/
├── medusa/
│   ├── client.ts           # Medusa SDK (session auth)
│   ├── admin-api.ts        # Medusa Admin API proxy (server-only)
│   ├── hooks/              # React hooks для Medusa
│   └── adapters.ts         # Конвертери
├── payload/
│   ├── types.ts            # Типи (client-safe)
│   ├── client.ts           # Server-only Local API
│   └── actions.ts          # Server Actions
└── ...

stores/                     # Zustand stores
collections/                # Payload CMS collection definitions
```

## Payload CMS

Admin панель: http://localhost:3200/admin

**Колекції**: Media, Users, Banners, Pages, PromoBlocks, Brands, Categories, BlogPosts, Reviews

**Кастомні views**:
- `/admin/loyalty` — Дашборд програми лояльності
- `/admin/loyalty/settings` — Налаштування
- `/admin/loyalty/customers` — Список клієнтів
- `/admin/loyalty/customers/:id` — Деталі клієнта
- `/admin/loyalty/transactions` — Історія транзакцій

## State Management

- **Server state**: TanStack React Query v5
- **Client state**: Zustand (auth, cart, wishlist, loyalty, recently-viewed, ui)

## Змінні оточення

Див. `.env.example`.
