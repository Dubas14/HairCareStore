# HAIR LAB — Інтернет-магазин професійної косметики для волосся

## Архітектура

```
HairCareStore/
├── frontend/   # Next.js 15 + React 19 + Payload CMS v3 (storefront + CMS, port 3200)
└── docker-compose.yml  # PostgreSQL (5450) + Redis (6390)
```

| Сервіс | Порт | URL |
|--------|------|-----|
| PostgreSQL | 5450 | — |
| Redis | 6390 | — |
| Frontend (Next.js) | 3200 | http://localhost:3200 |
| Payload CMS Admin | 3200 | http://localhost:3200/admin |

## Швидкий старт

```bash
# 1. Запустити бази даних
docker-compose up -d postgres redis

# 2. Запустити frontend (+ Payload CMS admin)
cd frontend && npm install --legacy-peer-deps && npm run dev
```

## Технології

- **Frontend**: Next.js 15.4, React 19, Tailwind CSS 3.4, Radix UI
- **CMS**: Payload CMS v3 (вбудований в Next.js)
- **БД**: PostgreSQL 15 (database: `payload`)
- **Кеш**: Redis 7
- **Шрифти**: Inter, Playfair Display, JetBrains Mono
- **Іконки**: Lucide React

## CMS (Payload v3)

Payload CMS вбудований у Next.js frontend. Admin панель: http://localhost:3200/admin

**Колекції**: Media, Users, Banners, Pages, PromoBlocks, Brands, Categories, BlogPosts, Reviews, Products, Orders, Customers

**Кастомні views**: Loyalty Dashboard, Settings, Customers, Transactions

## Змінні оточення

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_BASE_URL=http://localhost:3200
PAYLOAD_DATABASE_URL=postgres://postgres:postgres123@localhost:5450/payload
PAYLOAD_SECRET=your-secret-key
```

## Мова

Інтерфейс магазину — українською мовою. Всі UI-тексти, описи бонусної програми та контент — українською.

## Ліцензія

MIT
