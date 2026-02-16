# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

Single Next.js application with embedded Payload CMS:

```
HairCareStore/
├── frontend/   # Next.js 15 + React 19 + Payload CMS v3 (storefront + CMS, port 3200)
└── docker-compose.yml  # PostgreSQL (5450) + Redis (6390) only
```

PostgreSQL at `localhost:5450`, database `payload`.

## Commands

### Starting the project

```bash
# 1. Start databases
docker-compose up -d postgres redis

# 2. Start frontend (includes Payload CMS admin at /admin)
cd frontend && npm run dev
```

### Frontend (Next.js + Payload CMS)

```bash
cd frontend
npm run dev                    # Development server (port 3200) — includes Payload admin at /admin
npm run build                  # Production build
npm run lint                   # ESLint (next/core-web-vitals)
npm run type-check             # TypeScript checking
```

## Frontend Architecture (Next.js 15 + Payload CMS v3)

### App Router Structure (Route Groups)

```
app/
├── layout.tsx              # Root layout (html/body, fonts, globals.css)
├── actions/                # Server actions (newsletter, loyalty-admin, etc.)
├── (frontend)/             # Storefront route group
│   ├── layout.tsx          # Frontend layout (Header, Footer, Providers)
│   ├── page.tsx            # Home page
│   ├── account/            # Auth & customer dashboard
│   ├── brands/             # Brand pages
│   ├── categories/         # Category pages
│   ├── checkout/           # Checkout flow
│   ├── pages/              # CMS dynamic pages
│   ├── products/           # Product detail pages
│   └── shop/               # Product catalog with filters
└── (payload)/              # Payload CMS route group
    ├── layout.tsx          # Payload admin layout
    ├── custom.scss         # Admin custom styles
    ├── admin/              # Admin panel UI
    │   ├── [[...segments]]/page.tsx
    │   └── importMap.js
    └── api/                # Payload REST API
        └── [...slug]/route.ts
```

### Payload CMS (embedded)

- **Config**: `frontend/payload.config.ts` — PostgreSQL adapter, Lexical editor, sharp
- **Database**: `postgres://localhost:5450/payload`
- **Admin panel**: `http://localhost:3200/admin`
- **Collections**: Media, Users, Banners, Pages, PromoBlocks, Brands, Categories, BlogPosts, Reviews, Products, Orders, Customers
- **Collection definitions**: `frontend/collections/` directory

#### CMS Data Layer (3 files)

- `lib/payload/types.ts` — Shared types & utilities (safe for client components)
  - Types: `Banner`, `PromoBlock`, `Page`, `Category`, `Brand`, `BenefitItem`, etc.
  - Helpers: `getImageUrl()`, `isVideoMedia()`
- `lib/payload/client.ts` — Server-only data fetching via Payload Local API
  - Functions: `getBanners()`, `getPromoBlocks()`, `getPageBySlug()`, `getPages()`, `getCategoryBySlug()`, `getCategories()`, `getBrandBySlug()`, `getBrands()`
- `lib/payload/actions.ts` — Server Actions wrapping client.ts for use in `'use client'` components

#### Import patterns:
- **Server Components**: import from `@/lib/payload/client` (types + functions + utilities)
- **Client Components** (types/utilities): import from `@/lib/payload/types`
- **Client Components** (data fetching): import from `@/lib/payload/actions`

### State Management

Two-layer approach:
1. **Server state** — TanStack React Query v5 (`lib/query-client.ts` defines query keys factory, 5min stale time)
2. **Client state** — Zustand stores with localStorage persistence:
   - `auth-store` — customer object + isAuthenticated
   - `cart-store` — cartId + local items + drawer state
   - `wishlist-store` — product IDs
   - `loyalty-store` — points summary + transactions (NOT persisted)
   - `recently-viewed-store` — browsing history
   - `ui-store` — global UI state

### Key Patterns

- **Auth flow**: Payload Customers collection with auth. `CustomerInitializer` component loads customer on app start. Auth checks are client-side in components.
- **Cart flow**: `CartProvider` context wraps app → auto-creates cart → hooks for add/update/remove/complete
- **Checkout**: Contact → Shipping Address → Shipping Method → Payment (COD) → Optional loyalty points → Complete
- **Price formatting**: Prices are in major currency units (not cents). Use `formatPrice()` from `lib/utils/format-price.ts`
- **Path aliases**: `@/*` → root, `@/components/*`, `@/lib/*`, `@/hooks/*`, `@payload-config` → `./payload.config.ts`

### UI Stack

- Tailwind CSS 3.4 with custom design tokens in `styles/globals.css` (HSL color variables)
- Radix UI primitives in `components/ui/` (shadcn/ui pattern)
- Fonts: Inter (body), Playfair Display (headings), JetBrains Mono (data)
- Icons: Lucide React
- Carousel: Embla Carousel

## Environment Variables

### Frontend (.env.local)

```
NEXT_PUBLIC_BASE_URL=http://localhost:3200
PAYLOAD_DATABASE_URL=postgres://postgres:postgres123@localhost:5450/payload
PAYLOAD_SECRET=your-secret-key-at-least-32-chars
```

## Language

The storefront is Ukrainian-language (uk locale). All user-facing text, loyalty descriptions, and content are in Ukrainian.
