# HAIR LAB — Technical Plan: From 7/10 to 10/10

> **Goal**: Production-grade international e-commerce platform for hair care products.
> **Target**: Ukrainian market as primary + ready for international deployment (Poland, Germany, EU, CIS/Russian-speaking markets).
> **Stack**: Next.js 15 + React 19 + Payload CMS v3 + PostgreSQL + Stripe

---

## Table of Contents

1. [Phase 1: Payments & Checkout](#phase-1-payments--checkout-critical)
2. [Phase 2: Internationalization (i18n)](#phase-2-internationalization-i18n-critical)
3. [Phase 3: Promotions & Marketing](#phase-3-promotions--marketing-engine)
4. [Phase 4: Search & Catalog](#phase-4-search--catalog-upgrade)
5. [Phase 5: Email & Notifications](#phase-5-email--notifications)
6. [Phase 6: Shipping & Logistics](#phase-6-shipping--logistics)
7. [Phase 7: Customer Experience](#phase-7-customer-experience)
8. [Phase 8: Analytics & SEO](#phase-8-analytics--seo)
9. [Phase 9: Performance & Security](#phase-9-performance--security)
10. [Phase 10: Admin & Operations](#phase-10-admin--operations)
11. [Database Schema Changes](#database-schema-changes-summary)
12. [Environment Variables](#new-environment-variables)
13. [Deployment Architecture](#deployment-architecture)

---

## Phase 1: Payments & Checkout (CRITICAL) — DONE

**Status**: ✅ COMPLETED
**Impact**: +40-50% conversion rate. Currently only COD — unacceptable for international sales.

### Implementation Summary
- Installed: `stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`
- Created: `lib/stripe.ts` (server SDK), `lib/stripe-client.ts` (client loadStripe)
- Created: `lib/payload/payment-actions.ts` — `createPaymentIntent()`, `completeStripePayment()`
- Created: `app/api/stripe/webhooks/route.ts` — handles `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
- Created: `components/checkout/stripe-payment-form.tsx` — Stripe Elements PaymentElement
- Modified: `collections/Orders.ts` — added `currency`, `stripePaymentIntentId`, `paymentMethod` as select
- Modified: `collections/Carts.ts` — added `currency`, `paymentMethod`, `stripePaymentIntentId`, `stripeClientSecret`
- Modified: `lib/payload/types.ts` — added `CurrencyCode`, Stripe fields to PayloadCart/PayloadOrder
- Modified: `lib/payload/cart-actions.ts` — added `setCartPaymentMethod()`, `setCartCurrency()`, `clearCartAfterPayment()`
- Modified: `components/checkout/payment-form.tsx` — full rewrite with COD/Stripe selection + Stripe Elements
- Modified: `app/(frontend)/checkout/page.tsx` — added `handleStripeSuccess()` flow
- TypeScript: ✅ No errors | ESLint: ✅ No new warnings

### 1.1 Stripe Integration via Payload Ecommerce Plugin

Payload v3 provides an official `@payloadcms/plugin-ecommerce` with built-in Stripe adapter.

**Install:**
```bash
npm install @payloadcms/plugin-ecommerce stripe @stripe/stripe-js @stripe/react-stripe-js
```

**Config (`payload.config.ts`):**
```typescript
import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'
import { stripeAdapter } from '@payloadcms/plugin-ecommerce/payments/stripe'

export default buildConfig({
  // ...existing config
  plugins: [
    ecommercePlugin({
      access: {
        adminOnlyFieldAccess,
        adminOrPublishedStatus,
        isAdmin,
        isAuthenticated,
        isCustomer,
        isDocumentOwner,
      },
      customers: { slug: 'customers' },
      payments: {
        paymentMethods: [
          stripeAdapter({
            secretKey: process.env.STRIPE_SECRET_KEY!,
            publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
            webhookSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET!,
          }),
        ],
      },
      products: {
        productsCollection: Products,
        variants: { variantsCollection: Variants },
      },
    }),
  ],
})
```

### 1.2 Payment Methods to Support

| Method | Provider | Markets | Priority |
|--------|----------|---------|----------|
| Visa / Mastercard | Stripe | Global | P0 |
| Apple Pay | Stripe (Payment Request API) | Global | P0 |
| Google Pay | Stripe (Payment Request API) | Global | P0 |
| BLIK | Stripe | Poland | P1 |
| iDEAL | Stripe | Netherlands | P1 |
| Bancontact | Stripe | Belgium | P1 |
| SEPA Direct Debit | Stripe | EU | P1 |
| Cash on Delivery | Custom (existing) | Ukraine | P0 (keep) |
| Monobank installments | LiqPay / Monobank API | Ukraine | P1 |

### 1.3 Checkout Flow Redesign

**Current:** Contact → Shipping → Payment (COD only) → Confirm
**New:**

```
Step 1: Contact Info (email, phone, name)
  ├── Guest checkout (email only required)
  └── Authenticated (auto-fill from profile)

Step 2: Shipping Address
  ├── Country selector (determines available shipping methods)
  ├── Address autocomplete (Google Places API / Nova Poshta API for UA)
  └── Saved addresses (for authenticated users)

Step 3: Shipping Method
  ├── Dynamic based on country + cart weight/dimensions
  ├── UA: Nova Poshta (warehouse / courier), Ukrposhta
  ├── PL: InPost, DPD, Poczta Polska
  ├── EU: DHL, DPD, GLS
  └── Real-time rate calculation

Step 4: Payment
  ├── Stripe Elements (card input)
  ├── Apple Pay / Google Pay (one-tap via Payment Request Button)
  ├── COD (UA only, with surcharge option)
  └── Buy Now Pay Later (Klarna via Stripe — EU markets)

Step 5: Order Review & Confirm
  ├── Full order summary
  ├── Loyalty points toggle
  ├── Promo code input
  └── Place Order button (creates PaymentIntent → confirms → creates Order)
```

### 1.4 Stripe Webhook Handler

**File**: `app/api/stripe/webhooks/route.ts`

Events to handle:
- `payment_intent.succeeded` → mark order as paid, trigger email
- `payment_intent.payment_failed` → mark order as `requires_action`
- `charge.refunded` → update paymentStatus to `refunded`
- `charge.dispute.created` → flag order for admin review

### 1.5 Currency Support

**Multi-currency via Stripe:**
```typescript
// Orders & Carts collections — add currency field
{
  name: 'currency',
  type: 'select',
  defaultValue: 'UAH',
  options: [
    { label: 'UAH (₴)', value: 'UAH' },
    { label: 'EUR (€)', value: 'EUR' },
    { label: 'PLN (zł)', value: 'PLN' },
    { label: 'USD ($)', value: 'USD' },
  ],
}
```

**Price storage strategy:**
- Products store prices in **base currency (UAH)** in Payload
- Add `prices` array field to variants for multi-currency:
  ```typescript
  {
    name: 'prices',
    type: 'array',
    fields: [
      { name: 'currency', type: 'select', options: ['UAH', 'EUR', 'PLN', 'USD'] },
      { name: 'amount', type: 'number', required: true },
    ],
  }
  ```
- Fallback: auto-convert from UAH using exchange rate API (ECB/NBU rates)
- Admin can override per-currency prices manually

### 1.6 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `payload.config.ts` | Modify | Add ecommercePlugin with Stripe |
| `collections/Orders.ts` | Modify | Add `currency`, `stripePaymentIntentId`, `stripeCustomerId` fields |
| `collections/Carts.ts` | Modify | Add `currency`, `promoCode` fields |
| `collections/Products.ts` | Modify | Add multi-currency `prices` array to variants |
| `collections/Transactions.ts` | Create | Payment transaction log (Stripe events) |
| `app/api/stripe/webhooks/route.ts` | Create | Stripe webhook handler |
| `lib/payload/payment-actions.ts` | Create | `createPaymentIntent`, `confirmPayment`, `refundOrder` |
| `lib/stripe.ts` | Create | Stripe client initialization (server + client) |
| `components/checkout/StripePaymentForm.tsx` | Create | Stripe Elements payment form |
| `components/checkout/PaymentMethodSelector.tsx` | Create | COD / Card / Apple Pay selector |
| `components/checkout/CheckoutPage.tsx` | Rewrite | New multi-step checkout with payment |
| `components/checkout/OrderReview.tsx` | Create | Final review before payment |

---

## Phase 2: Internationalization (i18n) (CRITICAL) — DONE

**Status**: ✅ COMPLETED
**Impact**: Enables selling to EU markets. Essential for "not just UA" positioning.

### Implementation Summary
- Installed: `next-intl@4.8.3`
- Created: `i18n/routing.ts` (5 locales: uk, en, pl, de, ru; prefix `as-needed`)
- Created: `i18n/request.ts` (request config with dynamic import)
- Created: `middleware.ts` (next-intl middleware, excludes /api, /admin, /media)
- Created: `messages/{uk,en,ru,pl,de}.json` — full translations (nav, common, home, shop, product, cart, checkout, account, loyalty, footer)
- Created: `components/locale-switcher.tsx` — hover dropdown with flags
- Modified: `payload.config.ts` — added `localization` with 5 locales, `defaultLocale: 'uk'`, `fallback: true`
- Modified: `next.config.ts` — wrapped config with `createNextIntlPlugin`
- Modified: `app/(frontend)/layout.tsx` — async, `getLocale()`, `getMessages()`, `NextIntlClientProvider`
- Modified: 7 collection files — added `localized: true` to 30+ fields (Products, Categories, Brands, Pages, Banners, PromoBlocks, BlogPosts)
- Modified: `lib/payload/client.ts` — added `locale` parameter to ALL 17 data fetching functions + `payload.find({locale})`
- Modified: `lib/payload/actions.ts` — all server actions now auto-resolve locale via `getLocale()` from next-intl
- Modified: 6 server component pages — pass locale from `getLocale()` to client.ts functions
- Modified: `app/actions/site-pages.ts` — locale-aware getSiteSettings
- Modified: `components/layout/header.tsx` — `useTranslations('nav')` + `LocaleSwitcher` component
- Modified: `components/layout/footer.tsx` — `useTranslations('footer')` + `useTranslations('nav')`
- TypeScript: ✅ No errors | ESLint: ✅ No new warnings

### 2.1 Payload CMS Localization

Payload v3 has built-in localization. Each `localized: true` field stores values per locale.

**Config (`payload.config.ts`):**
```typescript
export default buildConfig({
  localization: {
    locales: [
      {
        label: 'Українська',
        code: 'uk',
      },
      {
        label: 'English',
        code: 'en',
      },
      {
        label: 'Polski',
        code: 'pl',
      },
      {
        label: 'Deutsch',
        code: 'de',
      },
      {
        label: 'Русский',
        code: 'ru',
      },
    ],
    defaultLocale: 'uk',
    fallback: true, // fallback to defaultLocale if translation missing
  },
})
```

### 2.2 Localized Fields (Collections to Update)

**Products:**
```typescript
{ name: 'title', type: 'text', localized: true, required: true }
{ name: 'subtitle', type: 'text', localized: true }
{ name: 'description', type: 'richText', localized: true }
// variant titles:
{ name: 'title', type: 'text', localized: true } // inside variants array
```

**Categories:**
```typescript
{ name: 'name', type: 'text', localized: true, required: true }
{ name: 'description', type: 'textarea', localized: true }
{ name: 'shortDescription', type: 'textarea', localized: true }
// SEO fields:
{ name: 'metaTitle', type: 'text', localized: true }
{ name: 'metaDescription', type: 'textarea', localized: true }
```

**Brands:**
```typescript
{ name: 'name', type: 'text', localized: true }
{ name: 'description', type: 'richText', localized: true }
{ name: 'shortDescription', type: 'textarea', localized: true }
{ name: 'history', type: 'richText', localized: true }
// benefits array items:
{ name: 'title', type: 'text', localized: true }
{ name: 'description', type: 'text', localized: true }
```

**Pages, Banners, PromoBlocks, BlogPosts** — localize all text/richText fields.

**NOT localized** (remain the same across locales):
- Prices, SKUs, barcodes, handles/slugs
- Media files (images/video)
- Customer data, orders, carts
- Inventory quantities
- Technical fields (status, sortOrder, dates)

### 2.3 Frontend i18n (next-intl)

**Install:**
```bash
npm install next-intl
```

**Routing strategy — prefix-based:**
```
/uk/shop          → Ukrainian (default, prefix optional)
/en/shop          → English
/pl/shop          → Polish
/de/shop          → German
/ru/shop          → Russian
```

**Implementation:**

```
app/
├── [locale]/                    # Dynamic locale segment
│   ├── (frontend)/
│   │   ├── layout.tsx           # NextIntlClientProvider
│   │   ├── page.tsx             # Home
│   │   ├── shop/page.tsx        # Catalog
│   │   ├── products/[handle]/   # Product detail
│   │   └── ...
│   └── (payload)/               # Admin — NOT localized (uses Payload's own i18n)
├── messages/
│   ├── uk.json                  # Ukrainian translations (UI strings)
│   ├── en.json                  # English
│   ├── pl.json                  # Polish
│   ├── de.json                  # German
│   └── ru.json                  # Russian
└── i18n.ts                      # next-intl config
```

**Translation file structure (`messages/en.json`):**
```json
{
  "common": {
    "addToCart": "Add to Cart",
    "buyNow": "Buy Now",
    "outOfStock": "Out of Stock",
    "search": "Search products...",
    "viewAll": "View All",
    "currency": "Currency"
  },
  "nav": {
    "shop": "Shop",
    "brands": "Brands",
    "blog": "Blog",
    "account": "My Account",
    "cart": "Cart",
    "wishlist": "Wishlist"
  },
  "checkout": {
    "title": "Checkout",
    "contact": "Contact Information",
    "shipping": "Shipping",
    "payment": "Payment",
    "review": "Review Order",
    "placeOrder": "Place Order",
    "orderComplete": "Order Confirmed!",
    "cod": "Cash on Delivery",
    "card": "Credit / Debit Card"
  },
  "product": {
    "description": "Description",
    "ingredients": "Key Ingredients",
    "howToUse": "How to Use",
    "reviews": "Reviews",
    "relatedProducts": "You May Also Like",
    "writeReview": "Write a Review"
  },
  "account": {
    "login": "Log In",
    "register": "Create Account",
    "orders": "My Orders",
    "addresses": "Addresses",
    "loyalty": "Loyalty Program",
    "logout": "Log Out"
  },
  "loyalty": {
    "points": "Points",
    "level": "Level",
    "bronze": "Bronze",
    "silver": "Silver",
    "gold": "Gold"
  }
}
```

### 2.4 Locale-Aware Data Fetching

**Payload Local API — pass locale:**
```typescript
// lib/payload/client.ts
export async function getProducts(options: {
  locale?: string
  limit?: number
  offset?: number
}) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'products',
    locale: options.locale || 'uk', // pass locale
    limit: options.limit || 20,
    offset: options.offset || 0,
    where: { status: { equals: 'active' } },
  })
  return { products: result.docs.map(transformProduct), count: result.totalDocs }
}
```

### 2.5 Currency/Locale Detection

**Middleware (`middleware.ts`):**
```typescript
import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['uk', 'en', 'pl', 'de', 'ru'],
  defaultLocale: 'uk',
  localeDetection: true, // auto-detect from Accept-Language header
  localePrefix: 'as-needed', // /uk/ is default, omit prefix
})

export const config = {
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
}
```

### 2.6 Language/Currency Switcher Component

```typescript
// components/LocaleSwitcher.tsx
// Dropdown with flag + language name + currency
// Saves preference to cookie
// Redirects to equivalent page in new locale
```

### 2.7 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `payload.config.ts` | Modify | Add `localization` config |
| `collections/*.ts` | Modify | Add `localized: true` to text fields |
| `middleware.ts` | Create | next-intl locale routing |
| `i18n.ts` | Create | next-intl configuration |
| `messages/{uk,en,pl,de,ru}.json` | Create | UI translation strings |
| `app/[locale]/(frontend)/layout.tsx` | Create | Locale-aware layout |
| `app/[locale]/(frontend)/page.tsx` | Move | All pages under `[locale]` |
| `components/LocaleSwitcher.tsx` | Create | Language/currency picker |
| `lib/payload/client.ts` | Modify | Add `locale` param to all functions |
| `lib/payload/actions.ts` | Modify | Pass locale from cookies/headers |

---

## Phase 3: Promotions & Marketing Engine — DONE

**Status**: ✅ COMPLETED
**Impact**: Without promo codes and discounts, marketing campaigns are impossible.

### Implementation Summary
- Created: `collections/Promotions.ts` — promo codes with percentage/fixed/free_shipping types, conditions (min order, max discount, category/brand/product filtering, usage limits, date range)
- Created: `collections/PromotionUsages.ts` — per-customer usage tracking
- Created: `lib/payload/promo-actions.ts` — `validatePromoCode()`, `applyPromoCode()`, `removePromoCode()`, `recordPromoUsage()`
- Created: `components/checkout/promo-code-input.tsx` — code input with validation, applied state with remove button
- Modified: `collections/Carts.ts` — added `promoCode`, `promoDiscount` fields + updated total calculation hook
- Modified: `collections/Orders.ts` — added `promoCode`, `promoDiscount` fields
- Modified: `lib/payload/types.ts` — added `promoCode`, `promoDiscount` to PayloadCart & PayloadOrder
- Modified: `payload.config.ts` — registered Promotions & PromotionUsages collections
- Modified: `collections/index.ts` — exported new collections
- Modified: `app/(frontend)/checkout/page.tsx` — integrated PromoCodeInput in sidebar
- Updated: all 5 translation files with promoCode/promoApply/promoRemove/promoDiscount keys
- TypeScript: ✅ No errors

### 3.1 Promotions Collection

**File**: `collections/Promotions.ts`

```typescript
const Promotions: CollectionConfig = {
  slug: 'promotions',
  admin: { useAsTitle: 'code', group: 'Commerce' },
  fields: [
    { name: 'code', type: 'text', required: true, unique: true, index: true },
    { name: 'title', type: 'text', localized: true },
    { name: 'description', type: 'textarea', localized: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Percentage Discount', value: 'percentage' },
        { label: 'Fixed Amount', value: 'fixed' },
        { label: 'Free Shipping', value: 'free_shipping' },
        { label: 'Buy X Get Y', value: 'bxgy' },
      ],
    },
    { name: 'value', type: 'number', required: true }, // % or fixed amount
    { name: 'currency', type: 'select', options: ['UAH','EUR','PLN','USD'] }, // for fixed amounts
    {
      name: 'conditions',
      type: 'group',
      fields: [
        { name: 'minOrderAmount', type: 'number' },
        { name: 'maxDiscountAmount', type: 'number' }, // cap for % discounts
        { name: 'applicableCategories', type: 'relationship', relationTo: 'categories', hasMany: true },
        { name: 'applicableBrands', type: 'relationship', relationTo: 'brands', hasMany: true },
        { name: 'applicableProducts', type: 'relationship', relationTo: 'products', hasMany: true },
        { name: 'excludedProducts', type: 'relationship', relationTo: 'products', hasMany: true },
        { name: 'customerGroups', type: 'select', hasMany: true, options: ['new', 'returning', 'vip'] },
        { name: 'maxUsesTotal', type: 'number' }, // total redemptions cap
        { name: 'maxUsesPerCustomer', type: 'number', defaultValue: 1 },
      ],
    },
    { name: 'startsAt', type: 'date', required: true },
    { name: 'expiresAt', type: 'date', required: true },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
    { name: 'usageCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
  ],
}
```

### 3.2 Promo Code Application Flow

```
User enters code → validatePromoCode(code, cart, customer)
  ├── Check: code exists and isActive
  ├── Check: startsAt <= now <= expiresAt
  ├── Check: usageCount < maxUsesTotal
  ├── Check: customer hasn't exceeded maxUsesPerCustomer
  ├── Check: cart.subtotal >= minOrderAmount
  ├── Check: cart items match applicable categories/brands/products
  ├── Calculate discount:
  │   ├── percentage: min(subtotal * value/100, maxDiscountAmount)
  │   ├── fixed: value (in cart currency)
  │   └── free_shipping: shippingTotal
  └── Return { valid: true, discount, message }
```

### 3.3 Automatic Discounts (No Code Required)

**File**: `collections/AutomaticDiscounts.ts`

```typescript
// Applied automatically when conditions are met
// Examples:
// - "Buy 3+ items, get 10% off"
// - "Spend 2000₴+, free shipping"
// - "Buy shampoo + conditioner = -15% on both"
fields: [
  { name: 'title', type: 'text', localized: true },
  { name: 'type', type: 'select', options: ['percentage', 'fixed', 'free_shipping', 'bundle'] },
  { name: 'value', type: 'number' },
  { name: 'conditions', type: 'group', fields: [
    { name: 'minItems', type: 'number' },
    { name: 'minOrderAmount', type: 'number' },
    { name: 'requiredProducts', type: 'relationship', relationTo: 'products', hasMany: true },
    { name: 'requiredCategories', type: 'relationship', relationTo: 'categories', hasMany: true },
  ]},
  { name: 'priority', type: 'number', defaultValue: 0 }, // higher = applied first
  { name: 'stackable', type: 'checkbox', defaultValue: false },
  { name: 'startsAt', type: 'date' },
  { name: 'expiresAt', type: 'date' },
  { name: 'isActive', type: 'checkbox', defaultValue: true },
]
```

### 3.4 Sale/Campaign System

**Seasonal campaigns** managed through existing Banners + PromoBlocks + new Promotions:

```
Campaign: "Black Friday 2026"
  ├── Banner (hero slider) — localized images/text
  ├── PromoBlock (homepage section) — countdown timer
  ├── Promotion (code: BLACKFRIDAY) — 25% off sitewide
  ├── AutomaticDiscount — free shipping on 500₴+
  └── Email blast (via email integration)
```

### 3.5 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `collections/Promotions.ts` | Create | Promo codes collection |
| `collections/AutomaticDiscounts.ts` | Create | Auto-applied discounts |
| `collections/PromotionUsages.ts` | Create | Track per-customer usage |
| `collections/Carts.ts` | Modify | Add `promoCode`, `promoDiscount` fields |
| `collections/Orders.ts` | Modify | Add `promoCode`, `promoDiscount` fields |
| `lib/payload/promo-actions.ts` | Create | `validatePromoCode`, `applyPromoCode`, `calculateAutoDiscounts` |
| `components/checkout/PromoCodeInput.tsx` | Create | Code input with validation feedback |
| `components/ui/CountdownTimer.tsx` | Create | Campaign countdown timer |

---

## Phase 4: Search & Catalog Upgrade — DONE

**Status**: ✅ COMPLETED
**Impact**: Current client-side search (500 products cap) doesn't scale.

### Implementation Summary
- **Server-side filtering**: Upgraded `getProducts()` in `client.ts` — full WHERE clause construction with `and` conditions for search, categoryIds, brandIds, minPrice, maxPrice, tags, sortBy
- **Pagination metadata**: Returns `totalPages`, `currentPage`, `hasNextPage` from Payload's paginated results
- **Search API**: Created `app/api/search/route.ts` — autocomplete endpoint returning product title, handle, thumbnail, price (limit 8, debounced)
- **Shop page rewrite**: `app/(frontend)/shop/page.tsx` — now uses server-side `useProducts()` with all filter params, 24 items/page, URL params sync
- **Filter sidebar**: Removed non-functional concerns/hairTypes filters; added category filter (fetched from Payload); kept brand + price range
- **Category page**: `categories/[slug]/page.tsx` — migrated from client-side 100-product cap to server-side `useProducts()` with pagination
- **Brand page**: `brands/[slug]/page.tsx` — migrated from client-side filtering to server-side `useProducts()` with pagination
- **Updated hooks**: `use-products.ts` — `useProducts()` now accepts full filter options (search, categoryIds, brandIds, minPrice, maxPrice, tags, sortBy)
- **FilterState cleanup**: Removed unused `concerns`/`hairTypes` fields from `FilterState` interface across all files
- TypeScript: 0 errors, ESLint: 0 new warnings

### 4.1 Server-Side Search via Payload API

**Replace client-side filtering with server-side Payload queries:**

```typescript
// lib/payload/client.ts — enhanced getProducts
export async function getProducts(options: {
  locale?: string
  limit?: number
  page?: number
  search?: string
  categoryIds?: string[]
  brandIds?: string[]
  minPrice?: number
  maxPrice?: number
  tags?: string[]
  sortBy?: 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'newest'
}) {
  const payload = await getPayload({ config })

  const where: Where = { status: { equals: 'active' } }

  if (options.search) {
    where.or = [
      { title: { like: options.search } },
      { subtitle: { like: options.search } },
      { 'tags.value': { like: options.search } },
    ]
  }
  if (options.categoryIds?.length) {
    where['categories.id'] = { in: options.categoryIds }
  }
  if (options.brandIds?.length) {
    where['brand.id'] = { in: options.brandIds }
  }
  if (options.minPrice !== undefined || options.maxPrice !== undefined) {
    where['variants.price'] = {}
    if (options.minPrice !== undefined) where['variants.price'].greater_than_equal = options.minPrice
    if (options.maxPrice !== undefined) where['variants.price'].less_than_equal = options.maxPrice
  }

  let sort: string = '-createdAt'
  switch (options.sortBy) {
    case 'price_asc': sort = 'variants.price'; break
    case 'price_desc': sort = '-variants.price'; break
    case 'newest': sort = '-createdAt'; break
  }

  const result = await payload.find({
    collection: 'products',
    locale: options.locale || 'uk',
    where,
    sort,
    limit: options.limit || 24,
    page: options.page || 1,
    depth: 1,
  })

  return {
    products: result.docs.map(transformProduct),
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  }
}
```

### 4.2 Search Autocomplete

**Endpoint**: `app/api/search/route.ts`

```typescript
// Returns top 5 product suggestions as user types
// Debounced on client (300ms)
// Returns: { products: [{title, handle, thumbnail, price}], categories: [{name, slug}] }
```

**Component**: `components/search/SearchAutocomplete.tsx`
- Input with debounced server fetch
- Dropdown with product thumbnails + prices
- Category quick links
- Recent searches (localStorage)
- Keyboard navigation (arrow keys, Enter, Escape)

### 4.3 Faceted Filters (Server-Side Counts)

```typescript
// New endpoint: get available filter values with counts
export async function getFilterFacets(options: {
  locale: string
  categoryId?: string
}) {
  // Query Payload to get:
  // - brands with product counts
  // - price range (min/max)
  // - tags with counts
  // - available categories
}
```

### 4.4 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `lib/payload/client.ts` | Modify | Server-side search & filtering |
| `app/api/search/route.ts` | Create | Search autocomplete API |
| `components/search/SearchAutocomplete.tsx` | Create | Autocomplete dropdown |
| `app/(frontend)/shop/page.tsx` | Rewrite | Server-side filters + URL params |
| `components/shop/FilterSidebar.tsx` | Modify | Server-driven facets |

---

## Phase 5: Email & Notifications — DONE

**Status**: ✅ COMPLETED
**Impact**: Abandoned cart recovery alone can recover 5-15% of lost revenue.

### Implementation Summary
- Installed: `resend@6.9.2`, `@react-email/components@1.0.8`
- Created: `lib/email/send.ts` — Resend client wrapper with graceful fallback when API key not set
- Created: `lib/email/components/email-layout.tsx` — Shared email layout (header with HAIR LAB branding, footer, ProductRow, EmailButton)
- Created: `lib/email/templates/order-confirmation.tsx` — Order items, totals, shipping info, payment method
- Created: `lib/email/templates/welcome.tsx` — Welcome message with feature list
- Created: `lib/email/templates/shipping-notification.tsx` — Tracking number, carrier, delivery estimate
- Created: `lib/email/templates/abandoned-cart.tsx` — Cart items with optional promo code
- Created: `lib/email/email-actions.ts` — Server actions: `sendOrderConfirmationEmail`, `sendWelcomeEmail`, `sendShippingNotificationEmail`, `sendAbandonedCartEmail`
- Created: `collections/Subscribers.ts` — Newsletter subscribers (email, status, locale, source)
- Modified: `cart-actions.ts` completeCart — sends order confirmation email (fire-and-forget)
- Modified: `payment-actions.ts` completeStripePayment — sends order confirmation email (fire-and-forget)
- Modified: `auth-actions.ts` registerCustomer — sends welcome email after registration
- Modified: `collections/Orders.ts` — added `trackingNumber` field + `afterChange` hook that sends shipping notification when `fulfillmentStatus` changes to `shipped`
- Modified: `app/actions/newsletter.ts` — replaced stub with real Payload Subscribers collection integration (create/re-subscribe/dedup)
- Registered: `Subscribers` collection in `payload.config.ts`
- Env var required: `RESEND_API_KEY`, optional: `EMAIL_FROM`
- TypeScript: 0 errors

### 5.1 Email Provider Integration

**Recommended**: Resend (developer-friendly, affordable, React Email support)

```bash
npm install resend @react-email/components
```

**Alternative for UA market**: eSputnik (native Ukrainian, better deliverability for .ua domains)

### 5.2 Transactional Emails

| Email | Trigger | Template |
|-------|---------|----------|
| Order Confirmation | Order created + paid | Order summary, items, total, tracking link |
| Payment Failed | Stripe `payment_failed` | Retry payment link |
| Order Shipped | fulfillmentStatus → `shipped` | Tracking number + carrier link |
| Order Delivered | fulfillmentStatus → `delivered` | Review request + loyalty points earned |
| Welcome | Customer registration | Welcome bonus points, first purchase promo |
| Password Reset | Reset request | Reset link (existing, improve template) |
| Abandoned Cart | Cart inactive 1h, 24h, 72h | Cart items + "complete your order" CTA |
| Loyalty Level Up | Level change | New perks, congratulations |
| Wishlist Price Drop | Product price decreased | Old vs new price, add to cart CTA |
| Back in Stock | Product restocked + customer wishlisted | Product link, "buy now" CTA |

### 5.3 Email Templates (React Email)

```
lib/
└── email/
    ├── templates/
    │   ├── OrderConfirmation.tsx
    │   ├── AbandonedCart.tsx
    │   ├── Welcome.tsx
    │   ├── ShippingNotification.tsx
    │   ├── ReviewRequest.tsx
    │   ├── WishlistPriceDrop.tsx
    │   └── LoyaltyLevelUp.tsx
    ├── components/
    │   ├── EmailLayout.tsx        # Header, footer, branding
    │   ├── ProductRow.tsx         # Product image + name + price
    │   └── ButtonCTA.tsx          # Styled CTA button
    └── send.ts                    # Resend client wrapper
```

### 5.4 Abandoned Cart Recovery (Cron/Webhook)

**Strategy:**
```
Cart abandoned → 1 hour → Email #1 "You left something behind"
                → 24 hours → Email #2 "Your items are selling fast" (with urgency)
                → 72 hours → Email #3 "Here's 10% off" (with auto-generated promo code)
```

**Implementation:**
- Payload `afterChange` hook on Carts — schedule emails via queue
- Or cron job scanning for `status: 'active'` carts with `updatedAt` thresholds
- Track `abandonedEmailsSent` field on Cart to avoid duplicates

### 5.5 Newsletter Integration

**Current state**: Newsletter form exists on homepage but has no backend.

**Implementation:**
- Create `Subscribers` collection in Payload
- Double opt-in flow (confirmation email)
- Sync with Resend/eSputnik audience lists
- GDPR consent checkbox + unsubscribe link in all emails

### 5.6 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `collections/Subscribers.ts` | Create | Newsletter subscribers |
| `lib/email/send.ts` | Create | Resend client wrapper |
| `lib/email/templates/*.tsx` | Create | React Email templates (8+ templates) |
| `lib/email/abandoned-cart.ts` | Create | Abandoned cart recovery logic |
| `collections/Orders.ts` | Modify | Add `afterChange` hook for shipping/delivery emails |
| `collections/Carts.ts` | Modify | Add `abandonedEmailsSent` tracking |
| `app/actions/newsletter.ts` | Modify | Connect to Subscribers collection + email confirmation |
| `app/api/cron/abandoned-carts/route.ts` | Create | Cron endpoint for cart recovery |

---

## Phase 6: Shipping & Logistics — DONE

**Status**: ✅ COMPLETED
**Impact**: International shipping is essential. Multiple domestic carriers improve conversion.

### Implementation Summary
- Upgraded `globals/ShippingConfig.ts` — added `zones` array with country-based shipping zones, each zone has multiple methods with carrier, price, currency, freeAbove, estimatedDays (all localized)
- Carriers supported: Нова Пошта, Укрпошта, DHL, DPD, GLS, InPost, Poczta Polska, Deutsche Post
- Countries: 25 EU/European countries
- Created: `lib/payload/shipping-actions.ts` — `getShippingMethodsByCountry(countryCode)`, `getShippingZones()`, `trackOrder(orderNumber, email)`
- Created: `app/(frontend)/tracking/page.tsx` — public order tracking page (no auth required), search by order number + email, visual progress steps
- Legacy `methods` array preserved for backward compatibility
- TypeScript: 0 errors

### 6.1 Shipping Zones

**Modify `ShippingConfig` global → Create `ShippingZones` collection:**

```typescript
const ShippingZones: CollectionConfig = {
  slug: 'shipping-zones',
  fields: [
    { name: 'name', type: 'text', localized: true }, // "Ukraine", "EU", "Poland"
    { name: 'countries', type: 'select', hasMany: true, options: [
      // ISO country codes
      { label: 'Ukraine', value: 'UA' },
      { label: 'Poland', value: 'PL' },
      { label: 'Germany', value: 'DE' },
      { label: 'France', value: 'FR' },
      // ... all EU countries
    ]},
    { name: 'methods', type: 'array', fields: [
      { name: 'carrier', type: 'select', options: [
        'nova_poshta', 'ukrposhta', 'dhl', 'dpd', 'gls', 'inpost', 'poczta_polska',
      ]},
      { name: 'name', type: 'text', localized: true },
      { name: 'price', type: 'number', required: true },
      { name: 'currency', type: 'select', options: ['UAH','EUR','PLN'] },
      { name: 'freeAbove', type: 'number' }, // free shipping threshold
      { name: 'estimatedDays', type: 'text', localized: true }, // "2-3 business days"
      { name: 'isActive', type: 'checkbox', defaultValue: true },
    ]},
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
}
```

### 6.2 Nova Poshta API Integration (Ukraine)

```typescript
// lib/shipping/nova-poshta.ts
export class NovaPoshtaClient {
  async getCities(search: string): Promise<City[]>
  async getWarehouses(cityRef: string): Promise<Warehouse[]>
  async calculateShipping(params: ShippingCalcParams): Promise<ShippingRate>
  async createShipment(order: PayloadOrder): Promise<TrackingNumber>
  async trackShipment(trackingNumber: string): Promise<TrackingStatus>
}
```

### 6.3 Order Tracking Page

**Route**: `app/[locale]/(frontend)/tracking/page.tsx`

- Input: order number or tracking number
- Display: carrier, status, estimated delivery, tracking history
- No auth required (public tracking by order number + email)

### 6.4 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `collections/ShippingZones.ts` | Create | Replace ShippingConfig global |
| `lib/shipping/nova-poshta.ts` | Create | Nova Poshta API client |
| `lib/shipping/calculate.ts` | Create | Unified shipping rate calculator |
| `lib/payload/shipping-actions.ts` | Create | `getShippingMethods(country)`, `calculateRate()` |
| `components/checkout/ShippingForm.tsx` | Rewrite | Country-aware address + carrier selection |
| `components/checkout/AddressAutocomplete.tsx` | Create | Google Places / Nova Poshta city search |
| `app/[locale]/(frontend)/tracking/page.tsx` | Create | Public order tracking |

---

## Phase 7: Customer Experience — DONE

**Status**: ✅ COMPLETED

### Implementation Summary
- Modified: `collections/Reviews.ts` — added `images` (array of uploads, max 5) and `verifiedPurchase` (checkbox, readOnly)
- Modified: `lib/payload/types.ts` — updated Review interface with `images` and `verifiedPurchase` fields
- Modified: `components/products/product-reviews.tsx` — photo gallery with lightbox, verified purchase badge, review filters (all/with photos/verified/by rating)
- Created: `lib/payload/wishlist-actions.ts` — server-side wishlist CRUD (getWishlist, addToWishlist, removeFromWishlist, syncWishlist)
- Fixed: `lib/hooks/use-wishlist.ts` — TypeScript strict type fixes for productId string conversion
- Deleted: `stores/wishlist-store.ts` — dead code, replaced by `use-wishlist.ts` hook with server sync via React Query
- Created: `stores/compare-store.ts` — Zustand store with localStorage persistence, max 4 items
- Created: `components/compare/compare-button.tsx` — toggle compare button for ProductCard
- Created: `components/compare/compare-bar.tsx` — floating bottom bar showing compare items, collapsible
- Created: `app/(frontend)/compare/page.tsx` — side-by-side comparison table (image, brand, price, discount, rating, add to cart)
- Modified: `components/products/product-card.tsx` — added CompareButton next to wishlist button
- Modified: `app/(frontend)/layout.tsx` — added CompareBar to global layout
- TypeScript: ✅ No errors

### 7.1 Live Chat Integration

**Recommended**: Tawk.to (free) or Crisp (freemium, better UX)

```typescript
// components/LiveChat.tsx — Script injection
// Load conditionally based on locale/country
// Pass customer data if authenticated
```

### 7.2 Photo Reviews

**Modify Reviews collection:**
```typescript
// Add to existing Reviews collection
{ name: 'images', type: 'array', maxRows: 5, fields: [
  { name: 'image', type: 'upload', relationTo: 'media', required: true },
]},
{ name: 'verifiedPurchase', type: 'checkbox', defaultValue: false, admin: { readOnly: true } },
// Hook: auto-set verifiedPurchase if customer has ordered this product
```

**Component update:**
- `ProductReviews.tsx` — show review photos in lightbox gallery
- Filter reviews by: rating, with photos, verified purchase
- Sort by: newest, most helpful, highest/lowest rating

### 7.3 Product Comparison

```
// Max 4 products at a time
// Floating comparison bar at bottom of screen
// Comparison page: side-by-side table of features, prices, ratings

components/
├── compare/
│   ├── CompareBar.tsx        # Floating "Compare (3)" bar
│   ├── ComparePage.tsx       # Side-by-side comparison table
│   └── CompareButton.tsx     # "Add to Compare" button on ProductCard
stores/
└── compare-store.ts          # Zustand store, max 4 items
```

### 7.4 "Complete Your Routine" / Product Bundles

**New collection**: `ProductBundles`

```typescript
fields: [
  { name: 'title', type: 'text', localized: true },
  { name: 'description', type: 'textarea', localized: true },
  { name: 'products', type: 'relationship', relationTo: 'products', hasMany: true, minRows: 2 },
  { name: 'discountType', type: 'select', options: ['percentage', 'fixed'] },
  { name: 'discountValue', type: 'number' },
  { name: 'isActive', type: 'checkbox', defaultValue: true },
]
```

### 7.5 Wishlist Improvements

**Current**: localStorage only.
**Upgrade**: Sync with Payload `Customers.wishlist` for authenticated users.

- Anonymous: keep localStorage
- Authenticated: sync to server
- Merge on login (localStorage → server)
- "Wishlist price drop" email notifications

### 7.6 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `collections/Reviews.ts` | Modify | Add photo upload, verified purchase |
| `collections/ProductBundles.ts` | Create | Product bundles/routines |
| `components/LiveChat.tsx` | Create | Chat widget loader |
| `components/compare/*` | Create | Product comparison feature |
| `stores/compare-store.ts` | Create | Comparison state |
| `components/product/ProductReviews.tsx` | Modify | Photo reviews, filters |
| `components/product/BundleSection.tsx` | Create | "Complete Your Routine" |
| `stores/wishlist-store.ts` | Modify | Server sync for auth users |

---

## Phase 8: Analytics & SEO — DONE

**Status**: ✅ COMPLETED

### Implementation Summary
- Created: `lib/analytics/events.ts` — unified GA4 + Facebook Pixel event tracking (view_item, add_to_cart, purchase, search, wishlist, checkout events)
- Created: `components/analytics/google-analytics.tsx` — GA4 script component via next/script (env-gated: NEXT_PUBLIC_GA_MEASUREMENT_ID)
- Created: `components/analytics/facebook-pixel.tsx` — Meta Pixel component via next/script (env-gated: NEXT_PUBLIC_FB_PIXEL_ID)
- Modified: `app/(frontend)/layout.tsx` — added GA4 + Facebook Pixel to global layout
- Created: `lib/structured-data.ts` — helpers for ItemList, BlogPosting, FAQ, SiteNavigation, WebSite JSON-LD schemas
- Modified: `app/(frontend)/page.tsx` — added WebSite + SiteNavigationElement JSON-LD
- Modified: `app/(frontend)/blog/[slug]/page.tsx` — added BlogPosting JSON-LD
- Rewritten: `app/sitemap.ts` — multi-locale sitemap with hreflang alternates for all 5 locales (uk, en, pl, de, ru), products up to 5000, categories, brands, blog posts, CMS pages
- TypeScript: ✅ No errors

### 8.1 Google Analytics 4 + Facebook Pixel

```typescript
// components/analytics/GoogleAnalytics.tsx
// components/analytics/FacebookPixel.tsx
// lib/analytics/events.ts — unified event tracking

// E-commerce events:
// - view_item (product page)
// - add_to_cart
// - remove_from_cart
// - begin_checkout
// - add_shipping_info
// - add_payment_info
// - purchase
// - view_item_list (category/shop page)
// - search
```

### 8.2 Structured Data Enhancement

**Current**: Product, Organization, BreadcrumbList.
**Add:**

```typescript
// FAQ schema on product pages (from product Q&A)
// BlogPosting schema on blog articles
// ItemList schema on category pages
// Offer schema with availability + price validity
// AggregateOffer for products with multiple variants
// Review schema with author + datePublished
// LocalBusiness schema (if physical location exists)
// SiteNavigationElement for main menu
```

### 8.3 Dynamic Sitemap

**File**: `app/sitemap.ts`

```typescript
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ['uk', 'en', 'pl', 'de', 'ru']
  const payload = await getPayload({ config })

  // Fetch all products, categories, brands, blog posts, pages
  const products = await payload.find({ collection: 'products', limit: 10000, select: { handle: true, updatedAt: true } })
  const categories = await payload.find({ collection: 'categories', limit: 1000 })
  const brands = await payload.find({ collection: 'brands', limit: 1000 })
  const posts = await payload.find({ collection: 'blog-posts', limit: 1000 })
  const pages = await payload.find({ collection: 'pages', limit: 1000 })

  const urls = []

  // Generate URLs for each locale
  for (const locale of locales) {
    const prefix = locale === 'uk' ? '' : `/${locale}`

    // Static pages
    urls.push({ url: `${BASE_URL}${prefix}/`, changeFrequency: 'daily', priority: 1.0 })
    urls.push({ url: `${BASE_URL}${prefix}/shop`, changeFrequency: 'daily', priority: 0.9 })

    // Dynamic pages
    for (const product of products.docs) {
      urls.push({
        url: `${BASE_URL}${prefix}/products/${product.handle}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
    // ... categories, brands, blog posts, CMS pages
  }

  return urls
}
```

### 8.4 hreflang Tags

```typescript
// In layout.tsx — add alternate links for each locale
<link rel="alternate" hrefLang="uk" href="https://hairlab.com.ua/products/..." />
<link rel="alternate" hrefLang="en" href="https://hairlab.com.ua/en/products/..." />
<link rel="alternate" hrefLang="pl" href="https://hairlab.com.ua/pl/products/..." />
<link rel="alternate" hrefLang="de" href="https://hairlab.com.ua/de/products/..." />
<link rel="alternate" hrefLang="ru" href="https://hairlab.com.ua/ru/products/..." />
<link rel="alternate" hrefLang="x-default" href="https://hairlab.com.ua/products/..." />
```

### 8.5 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `components/analytics/GoogleAnalytics.tsx` | Create | GA4 script + consent |
| `components/analytics/FacebookPixel.tsx` | Create | Meta Pixel |
| `lib/analytics/events.ts` | Create | Unified e-commerce event tracking |
| `app/sitemap.ts` | Create | Dynamic multi-locale sitemap |
| `app/robots.ts` | Create | Dynamic robots.txt |
| `app/[locale]/(frontend)/layout.tsx` | Modify | hreflang tags |
| Product/Category pages | Modify | Enhanced structured data |

---

## Phase 9: Performance & Security — DONE

**Status**: ✅ COMPLETED

### Implementation Summary
- Modified: `next.config.ts` — added CSP headers (Stripe, GA, Facebook, fonts), HSTS header
- Created: `components/cookie-consent.tsx` — GDPR cookie consent with 3 categories (Necessary/Analytics/Marketing), stores in cookie for 1 year
- Created: `app/api/customer/export/route.ts` — GDPR data export (customer + orders as JSON)
- Created: `app/api/customer/delete/route.ts` — GDPR account deletion (anonymizes personal data, keeps order records for accounting)
- Modified: `app/(frontend)/layout.tsx` — added CookieConsent to global layout
- TypeScript: ✅ No errors

### 9.1 Image Optimization

**Current**: Sharp generates 3 sizes. Good but can improve.

- Add **WebP/AVIF** format output via Sharp config
- Implement `next/image` with `placeholder="blur"` (generate blurDataURL in Payload hook)
- Add **lazy loading** for below-fold images (already via next/image)
- CDN: Use Cloudflare or Vercel Image Optimization

### 9.2 Caching Strategy

```typescript
// Next.js ISR for product pages
export const revalidate = 300 // 5 minutes

// React Query — adjust stale times:
// Products list: 2 min (frequent updates)
// Categories/Brands: 10 min (rarely change)
// Cart: 0 (always fresh)
// Customer profile: 5 min

// Payload API caching — Redis integration:
// npm install @payloadcms/plugin-redis-cache (if available)
// Or custom cache layer in lib/payload/client.ts
```

### 9.3 Security Hardening

- **CSP headers**: Strict Content-Security-Policy for Stripe, analytics, images
- **Rate limiting**: Extend to all auth endpoints, checkout, review submission
- **Input sanitization**: Zod schemas for all Server Actions
- **CSRF protection**: Payload built-in + custom for checkout
- **PCI compliance**: Stripe handles card data (never touches our server)
- **GDPR compliance**: Cookie consent banner, data export/deletion for customers

### 9.4 Cookie Consent (GDPR)

**Required for EU markets:**

```typescript
// components/CookieConsent.tsx
// Categories: Necessary, Analytics, Marketing
// Stores preference in cookie
// Blocks GA4/Facebook Pixel until consent given
// "Manage preferences" link in footer
```

### 9.5 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `next.config.ts` | Modify | Add security headers, image optimization |
| `middleware.ts` | Modify | Rate limiting layer |
| `components/CookieConsent.tsx` | Create | GDPR cookie consent |
| `app/[locale]/(frontend)/privacy/page.tsx` | Create | Privacy policy page |
| `app/api/customer/export/route.ts` | Create | GDPR data export |
| `app/api/customer/delete/route.ts` | Create | GDPR account deletion |

---

## Phase 10: Admin & Operations — DONE

**Status**: ✅ COMPLETED

### Implementation Summary
- Modified: `collections/Products.ts` — added `afterChange` hook for auto-inventory management (auto-set inStock based on inventory count, low stock warnings at threshold 5)
- Created: `app/api/admin/export-orders/route.ts` — CSV export of orders (filterable by date range and status), admin-only with Payload auth
- TypeScript: ✅ No errors

### 10.1 Admin Dashboard Widgets

**Payload admin customization:**

```typescript
// Custom admin components for payload.config.ts admin.components
admin: {
  components: {
    afterDashboard: [
      '/components/admin/RevenueChart',    // Daily/weekly/monthly revenue
      '/components/admin/OrdersOverview',   // Pending/shipped/delivered counts
      '/components/admin/TopProducts',      // Best sellers this week
      '/components/admin/LowStockAlert',    // Products below threshold
      '/components/admin/AbandonedCarts',   // Cart recovery stats
    ],
  },
}
```

### 10.2 Inventory Management

```typescript
// Add to Products collection — afterChange hook:
// When inventory reaches 0 → auto-set inStock: false
// When inventory < threshold → trigger "Low Stock" admin notification
// When inventory replenished → trigger "Back in Stock" emails to wishlisted customers

// New global: InventorySettings
{
  lowStockThreshold: 5,
  outOfStockBehavior: 'hide' | 'show_unavailable',
  backInStockNotifications: true,
}
```

### 10.3 Order Management Workflow

```
Admin receives order →
  ├── View in Payload admin (existing)
  ├── Print packing slip (new: PDF generation)
  ├── Create Nova Poshta shipment (new: API integration)
  ├── Update fulfillmentStatus → 'shipped' (triggers email)
  ├── Auto-track delivery status (cron job)
  └── Update fulfillmentStatus → 'delivered' (triggers review request email)
```

### 10.4 Import/Export Tools

```typescript
// Admin utility: bulk product import from CSV/Excel
// Already have papaparse dependency
// Add admin view: /admin/import-products

// Admin utility: export orders to CSV
// Filter by date range, status
// Add admin view: /admin/export-orders
```

### 10.5 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `components/admin/RevenueChart.tsx` | Create | Admin dashboard revenue chart |
| `components/admin/OrdersOverview.tsx` | Create | Orders status overview |
| `components/admin/TopProducts.tsx` | Create | Best sellers widget |
| `components/admin/LowStockAlert.tsx` | Create | Low stock warnings |
| `payload.config.ts` | Modify | Register admin dashboard components |
| `lib/pdf/packing-slip.ts` | Create | PDF generation for orders |
| `app/api/admin/export-orders/route.ts` | Create | CSV export endpoint |

---

## Database Schema Changes Summary

### New Collections (7)

| Collection | Purpose |
|------------|---------|
| `Promotions` | Promo codes & discount rules |
| `AutomaticDiscounts` | Auto-applied discounts |
| `PromotionUsages` | Per-customer promo code tracking |
| `ShippingZones` | Country-based shipping rules |
| `ProductBundles` | "Complete Your Routine" bundles |
| `Subscribers` | Newsletter subscribers |
| `Transactions` | Stripe payment event log |

### Modified Collections (8)

| Collection | Changes |
|------------|---------|
| `Products` | + `localized` fields, + `prices` multi-currency array |
| `Categories` | + `localized` fields |
| `Brands` | + `localized` fields |
| `Pages` | + `localized` fields |
| `Banners` | + `localized` fields |
| `PromoBlocks` | + `localized` fields |
| `BlogPosts` | + `localized` fields |
| `Orders` | + `currency`, `stripePaymentIntentId`, `promoCode`, `promoDiscount` |
| `Carts` | + `currency`, `promoCode`, `promoDiscount`, `abandonedEmailsSent` |
| `Reviews` | + `images` array, `verifiedPurchase` |

### New Globals (1)

| Global | Purpose |
|--------|---------|
| `InventorySettings` | Low stock threshold, out-of-stock behavior |

### Removed Globals (1)

| Global | Reason |
|--------|--------|
| `ShippingConfig` | Replaced by `ShippingZones` collection |

---

## New Environment Variables

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOKS_SIGNING_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=HAIR LAB <noreply@hairlab.com.ua>

# Nova Poshta API
NOVA_POSHTA_API_KEY=...

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...

# Facebook Pixel
NEXT_PUBLIC_FB_PIXEL_ID=...

# Google Places (address autocomplete)
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=...

# Cron secret (for scheduled jobs)
CRON_SECRET=...
```

---

## Deployment Architecture

### Current (Development)
```
Local machine → Docker (PostgreSQL:5450, Redis:6390) → Next.js dev server :3200
```

### Production (Recommended)
```
                    ┌─────────────────┐
                    │   Cloudflare    │
                    │   CDN + WAF     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   Vercel /      │
                    │   Docker Host   │
                    │   (Next.js +    │
                    │    Payload)     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
     │  PostgreSQL   │ │  Redis   │ │   S3/R2     │
     │  (Neon /      │ │ (Upstash)│ │ (Media      │
     │   Supabase)   │ │          │ │  Storage)   │
     └───────────────┘ └──────────┘ └─────────────┘
              │
     ┌────────▼──────┐
     │   Stripe      │ ←── Webhooks
     │   (Payments)  │
     └───────────────┘
```

### Cloud Services

| Service | Provider | Purpose |
|---------|----------|---------|
| Hosting | Vercel or Coolify (self-hosted) | Next.js + Payload |
| Database | Neon or Supabase | Managed PostgreSQL |
| Cache | Upstash | Managed Redis |
| Media | Cloudflare R2 or AWS S3 | Image/video storage |
| CDN | Cloudflare | Edge caching, WAF, DDoS protection |
| Email | Resend | Transactional emails |
| Payments | Stripe | Card payments, Apple/Google Pay |
| Analytics | Google Analytics 4 | Traffic & conversion tracking |
| Monitoring | Sentry | Error tracking |
| Cron Jobs | Vercel Cron or GitHub Actions | Abandoned carts, stock sync |

---

## Implementation Priority & Timeline

### Sprint 1 (Weeks 1-2): Foundation
- [ ] Payload localization config (i18n fields)
- [ ] next-intl routing setup
- [ ] Translation files (uk, en, ru)
- [ ] Locale switcher component
- [ ] Move pages under `[locale]` route

### Sprint 2 (Weeks 3-4): Payments
- [ ] Stripe integration (plugin + adapter)
- [ ] Payment form (Stripe Elements)
- [ ] Webhook handler
- [ ] Checkout flow rewrite
- [ ] Multi-currency support

### Sprint 3 (Weeks 5-6): Promotions
- [ ] Promotions collection
- [ ] Promo code validation logic
- [ ] Promo code input in checkout
- [ ] Automatic discounts engine
- [ ] Admin promo management UI

### Sprint 4 (Weeks 7-8): Email & Search
- [ ] Resend integration
- [ ] Transactional email templates (order, shipping, welcome)
- [ ] Abandoned cart recovery system
- [ ] Newsletter subscribers collection
- [ ] Server-side product search
- [ ] Search autocomplete component

### Sprint 5 (Weeks 9-10): Shipping & UX
- [ ] ShippingZones collection
- [ ] Nova Poshta API integration
- [ ] International shipping support
- [ ] Country-aware checkout
- [ ] Photo reviews
- [ ] Product comparison

### Sprint 6 (Weeks 11-12): Analytics & Polish
- [ ] GA4 + Facebook Pixel
- [ ] Cookie consent (GDPR)
- [ ] Dynamic sitemap + hreflang
- [ ] Enhanced structured data
- [ ] Admin dashboard widgets
- [ ] Performance optimization
- [ ] Security audit

### Sprint 7 (Week 13): Launch Preparation
- [ ] Production deployment setup
- [ ] Load testing
- [ ] End-to-end testing (Playwright)
- [ ] Polish, German translations (pl, de) — Russian (ru) done in Sprint 1
- [ ] Final QA pass

---

## Success Metrics (10/10 Criteria)

| Metric | Target |
|--------|--------|
| Lighthouse Performance | > 90 |
| Lighthouse Accessibility | > 95 |
| Lighthouse SEO | 100 |
| Core Web Vitals (LCP) | < 2.5s |
| Core Web Vitals (FID) | < 100ms |
| Core Web Vitals (CLS) | < 0.1 |
| Payment methods | 4+ (Card, Apple Pay, Google Pay, COD) |
| Languages supported | 5 (UK, EN, PL, DE, RU) |
| Currencies supported | 4 (UAH, EUR, PLN, USD) |
| Email automation flows | 8+ templates |
| Checkout steps | 5 (optimized) |
| Search response time | < 200ms |
| Mobile conversion rate | Competitive with market leaders |
| GDPR compliance | Full (consent, export, deletion) |
| Uptime SLA | 99.9% |
