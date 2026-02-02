# Category Pages Design

**Date:** 2026-02-02
**Status:** Approved

## Overview

Landing pages for product categories with banners, subcategories, and filtered product grids. Categories link from homepage to `/categories/[slug]`.

## Architecture

```
┌─────────────┐     ┌─────────────┐
│   Medusa    │     │   Strapi    │
│  (products) │     │  (content)  │
└──────┬──────┘     └──────┬──────┘
       │                   │
       │   categories      │   banners, descriptions,
       │   products        │   subcategories, SEO
       │                   │
       └─────────┬─────────┘
                 │
         ┌───────▼───────┐
         │   Frontend    │
         │ /categories/  │
         │   [slug]      │
         └───────────────┘
```

**Data flow:**
- Strapi stores `medusaHandle` — category handle from Medusa
- Frontend fetches content from Strapi by `slug`
- Products filtered from Medusa by `category_id`

## Categories

| Handle | Name | Medusa | Strapi |
|--------|------|--------|--------|
| `shampoos` | Шампуні | + | + |
| `conditioners` | Кондиціонери | + | + |
| `masks` | Маски | + | + |
| `serums` | Сироватки та флюїди | + | + |
| `sprays` | Спреї | + | + |
| `styling` | Стайлінг | + | + |
| `hair-color` | Фарби для волосся | + | + |
| `accessories` | Аксесуари | + | + |

## Strapi Content Type: Category

```
Category
├── name (Text) — "Шампуні"
├── slug (UID) — "shampoos"
├── medusaHandle (Text) — "shampoos"
├── description (Rich Text)
├── shortDescription (Text)
│
├── banner (Media) — image or video
├── icon (Media) — SVG/PNG
├── accentColor (Text) — HEX "#8B5CF6"
│
├── subcategories (Relation) — self-relation to Category
├── parentCategory (Relation) — parent category
│
├── promoBlock (Component)
│   ├── title (Text)
│   ├── description (Text)
│   └── image (Media)
│
└── seo (Component)
    ├── metaTitle (Text)
    ├── metaDescription (Text)
    └── ogImage (Media)
```

**API endpoint:**
```
GET /api/categories?filters[slug][$eq]=shampoos&populate=*
```

## Page Structure

**URL:** `/categories/[slug]`

```
┌─────────────────────────────────────────────────┐
│  Breadcrumbs: Головна → Каталог → Шампуні       │
├─────────────────────────────────────────────────┤
│  BANNER                                         │
│  [Icon] Category Name                           │
│  Category description                           │
├─────────────────────────────────────────────────┤
│  SUBCATEGORIES (if exist)                       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│  │Sub 1   │ │Sub 2   │ │Sub 3   │ │Sub 4   │   │
│  └────────┘ └────────┘ └────────┘ └────────┘   │
├─────────────────────────────────────────────────┤
│  POPULAR PRODUCTS (4 items, horizontal scroll)  │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐               │
│  │     │ │     │ │     │ │     │               │
│  └─────┘ └─────┘ └─────┘ └─────┘               │
├─────────────────────────────────────────────────┤
│  PROMO BLOCK (if exists in Strapi)              │
├─────────────────────────────────────────────────┤
│  ALL PRODUCTS                                   │
│  ┌──────────┐  ┌─────────────────────────────┐ │
│  │ FILTERS  │  │  Product Grid               │ │
│  │ ☐ Brand  │  │  ┌───┐ ┌───┐ ┌───┐         │ │
│  │ ☐ Price  │  │  │   │ │   │ │   │         │ │
│  │ ☐ Type   │  │  └───┘ └───┘ └───┘         │ │
│  └──────────┘  └─────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│  PAGINATION                                     │
└─────────────────────────────────────────────────┘
```

## File Structure

**New files:**

```
frontend/
├── app/
│   └── categories/
│       └── [slug]/
│           └── page.tsx
│
├── components/
│   └── categories/
│       ├── category-hero.tsx
│       ├── subcategories.tsx
│       └── popular-products.tsx
│
├── lib/
│   ├── strapi/
│   │   └── client.ts             # + getCategoryBySlug()
│   │
│   └── medusa/
│       └── hooks/
│           └── use-products.ts   # + useProductsByCategory()
│
backend/
└── src/
    └── scripts/
        └── setup-categories-collections.ts  # Update handles
```

**Updated files:**

| File | Changes |
|------|---------|
| `components/home/categories-section.tsx` | Update links to `/categories/[slug]` |
| `lib/constants/home-data.ts` | Sync slugs with Medusa |
| `lib/strapi/client.ts` | Add `getCategoryBySlug()` |

**Reused components:**
- `FilterSidebar`
- `ProductGrid`
- `ProductCard`
- `ScrollReveal`

## Implementation Plan

```
1. STRAPI (CMS)
   ├── Create Content Type "Category"
   ├── Configure permissions (Public: find, findOne)
   └── Add test data for 8 categories

2. MEDUSA (Backend)
   └── Update setup-categories-collections.ts
       ├── English handles
       └── Add hair-color, accessories

3. FRONTEND (Lib)
   ├── lib/strapi/client.ts → getCategoryBySlug()
   └── lib/medusa/hooks/use-products.ts → useProductsByCategory()

4. FRONTEND (Components)
   ├── components/categories/category-hero.tsx
   ├── components/categories/subcategories.tsx
   └── components/categories/popular-products.tsx

5. FRONTEND (Page)
   └── app/categories/[slug]/page.tsx

6. FRONTEND (Integration)
   ├── Update categories-section.tsx (links)
   └── Update home-data.ts (slugs)

7. TESTING
   ├── Verify all 8 categories
   ├── Verify filters
   └── Verify mobile version
```

## Dependencies

- Steps 3-6 depend on steps 1-2
- Components (step 4) can be built in parallel
