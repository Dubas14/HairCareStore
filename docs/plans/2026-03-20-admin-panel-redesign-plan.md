# Admin Panel Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure Payload CMS admin panel — unified navigation, single locale, permissions module, consistent UI, clean fields.

**Architecture:** Config-level changes to collections/globals (admin.group, localization), new permissions JSON field on Users with access control functions, UI consistency via shared SCSS variables.

**Tech Stack:** Payload CMS v3, Next.js 15, React 19, TypeScript, PostgreSQL

---

### Task 1: Remove extra locales — keep only Ukrainian

**Files:**
- Modify: `frontend/payload.config.ts:43-53`

**Step 1: Update localization config**

Replace the localization block with single locale:

```ts
localization: {
  locales: [
    { label: 'Українська', code: 'uk' },
  ],
  defaultLocale: 'uk',
  fallback: true,
},
```

**Step 2: Clean Subscribers locale options**

- Modify: `frontend/collections/Subscribers.ts`

Change the `locale` field options — remove en, pl, de, ru. Keep only:
```ts
{
  name: 'locale',
  type: 'select',
  defaultValue: 'uk',
  options: [
    { label: 'Українська', value: 'uk' },
  ],
}
```

**Step 3: Run dev server to verify**

Run: `cd frontend && npm run dev`
Expected: Server starts, admin panel loads without locale tabs on forms.

**Step 4: Commit**

```bash
git add frontend/payload.config.ts frontend/collections/Subscribers.ts
git commit -m "refactor(admin): remove extra locales, keep only Ukrainian"
```

---

### Task 2: Regroup navigation — new 5-group structure

**Files to modify (admin.group changes):**

| File | Current Group | New Group |
|------|--------------|-----------|
| `collections/Products.ts` | Магазин | Каталог |
| `collections/Categories.ts` | Каталог | Каталог |
| `collections/Brands.ts` | Каталог | Каталог |
| `collections/Ingredients.ts` | Магазин | Каталог |
| `collections/Orders.ts` | Магазин | Продажі |
| `collections/Customers.ts` | Магазин | Продажі |
| `collections/Carts.ts` | Магазин | Продажі (hidden) |
| `collections/Promotions.ts` | Маркетинг | Маркетинг (no change) |
| `collections/AutomaticDiscounts.ts` | Маркетинг | Маркетинг (no change) |
| `collections/ProductBundles.ts` | Маркетинг | Маркетинг (no change) |
| `collections/Subscribers.ts` | Маркетинг | Маркетинг (no change) |
| `collections/PromotionUsages.ts` | Маркетинг | Маркетинг (hidden, no change) |
| `collections/Banners.ts` | Контент | Контент (no change) |
| `collections/PromoBlocks.ts` | Контент | Контент (no change) |
| `collections/Pages.ts` | Контент | Контент (no change) |
| `collections/BlogPosts.ts` | Контент | Контент (no change) |
| `collections/Reviews.ts` | Контент | Контент (no change) |
| `collections/LoyaltyPoints.ts` | Лояльність | Продажі (hidden) |
| `collections/LoyaltyTransactions.ts` | Лояльність | Продажі (hidden) |
| `collections/Users.ts` | Система | Налаштування |
| `collections/Media.ts` | Система | Налаштування |
| `globals/LoyaltySettings.ts` | Лояльність | Продажі |
| `globals/ShippingConfig.ts` | Налаштування | Налаштування (no change) |
| `globals/SiteSettings.ts` | Налаштування | Налаштування (no change) |
| `globals/InventorySettings.ts` | Налаштування | Налаштування (no change) |
| `globals/EmailSettings.ts` | Налаштування | Налаштування (no change) |

**Step 1: Update all admin.group values**

For each file above where group changes, find `group: 'OldName'` and replace with `group: 'NewName'`.

Collections that change:
- Products.ts: `group: 'Магазин'` → `group: 'Каталог'`
- Ingredients.ts: `group: 'Магазин'` → `group: 'Каталог'`
- Orders.ts: `group: 'Магазин'` → `group: 'Продажі'`
- Customers.ts: `group: 'Магазин'` → `group: 'Продажі'`
- Carts.ts: `group: 'Магазин'` → `group: 'Продажі'`
- LoyaltyPoints.ts: `group: 'Лояльність'` → `group: 'Продажі'`
- LoyaltyTransactions.ts: `group: 'Лояльність'` → `group: 'Продажі'`
- Users.ts: `group: 'Система'` → `group: 'Налаштування'`
- Media.ts: `group: 'Система'` → `group: 'Налаштування'`

Globals that change:
- LoyaltySettings.ts: `group: 'Лояльність'` → `group: 'Продажі'`

**Step 2: Reorder collections array in payload.config.ts**

Reorder to match navigation order (Каталог → Продажі → Маркетинг → Контент → Налаштування):

```ts
collections: [
  // Каталог
  Products,
  Categories,
  Brands,
  Ingredients,
  // Продажі
  Orders,
  Customers,
  Carts,
  LoyaltyPoints,
  LoyaltyTransactions,
  // Маркетинг
  Promotions,
  AutomaticDiscounts,
  ProductBundles,
  Subscribers,
  PromotionUsages,
  // Контент
  Banners,
  PromoBlocks,
  Pages,
  BlogPosts,
  Reviews,
  // Налаштування
  Media,
  Users,
],
```

Reorder globals similarly:
```ts
globals: [
  // Продажі
  LoyaltySettings,
  // Налаштування
  SiteSettings,
  ShippingConfig,
  EmailSettings,
  InventorySettings,
],
```

**Step 3: Verify in browser**

Run dev server, check admin sidebar — should show 5 groups in correct order.

**Step 4: Commit**

```bash
git add frontend/collections/ frontend/globals/ frontend/payload.config.ts
git commit -m "refactor(admin): regroup navigation into 5 logical sections"
```

---

### Task 3: Add permissions module to Users collection

**Files:**
- Modify: `frontend/collections/Users.ts`
- Create: `frontend/lib/payload/access.ts`

**Step 1: Add permissions field to Users**

Add to Users.ts fields array:

```ts
{
  name: 'permissions',
  type: 'json',
  label: 'Дозволи',
  admin: {
    description: 'CRUD-дозволи по колекціях (тільки для ролі Редактор)',
    condition: (data) => data?.role === 'editor',
  },
  defaultValue: {
    products: { read: true, create: true, update: true, delete: false },
    categories: { read: true, create: true, update: true, delete: false },
    brands: { read: true, create: true, update: true, delete: false },
    ingredients: { read: true, create: true, update: true, delete: false },
    orders: { read: true, create: false, update: true, delete: false },
    customers: { read: true, create: false, update: false, delete: false },
    promotions: { read: true, create: true, update: true, delete: true },
    'automatic-discounts': { read: true, create: true, update: true, delete: true },
    'product-bundles': { read: true, create: true, update: true, delete: true },
    subscribers: { read: true, create: false, update: true, delete: false },
    banners: { read: true, create: true, update: true, delete: true },
    'promo-blocks': { read: true, create: true, update: true, delete: true },
    pages: { read: true, create: true, update: true, delete: true },
    'blog-posts': { read: true, create: true, update: true, delete: true },
    reviews: { read: true, create: false, update: true, delete: true },
    media: { read: true, create: true, update: true, delete: false },
    // Globals
    'site-settings': { read: false, update: false },
    'shipping-config': { read: false, update: false },
    'email-settings': { read: false, update: false },
    'inventory-settings': { read: false, update: false },
    'loyalty-settings': { read: false, update: false },
  },
},
```

**Step 2: Create access control helper**

Create `frontend/lib/payload/access.ts`:

```ts
import type { Access, FieldAccess } from 'payload'

type CrudAction = 'read' | 'create' | 'update' | 'delete'

interface UserPermissions {
  [slug: string]: {
    read?: boolean
    create?: boolean
    update?: boolean
    delete?: boolean
  }
}

/**
 * Creates access control function for a collection.
 * Admins always have full access. Editors use permissions from their user record.
 */
export function collectionAccess(slug: string, action: CrudAction): Access {
  return ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'admin') return true

    const permissions = user.permissions as UserPermissions | undefined
    if (!permissions || !permissions[slug]) return false

    return permissions[slug][action] === true
  }
}

/**
 * Creates access control function for a global.
 * Admins always have full access. Editors use permissions from their user record.
 */
export function globalAccess(slug: string, action: 'read' | 'update'): Access {
  return ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'admin') return true

    const permissions = user.permissions as UserPermissions | undefined
    if (!permissions || !permissions[slug]) return false

    return permissions[slug][action] === true
  }
}
```

**Step 3: Apply access control to all collections**

For each collection that needs permission-based access, add:

```ts
import { collectionAccess } from '@/lib/payload/access'

// In collection config:
access: {
  read: collectionAccess('slug-here', 'read'),
  create: collectionAccess('slug-here', 'create'),
  update: collectionAccess('slug-here', 'update'),
  delete: collectionAccess('slug-here', 'delete'),
},
```

Apply to: Products, Categories, Brands, Ingredients, Orders, Customers, Promotions, AutomaticDiscounts, ProductBundles, Subscribers, Banners, PromoBlocks, Pages, BlogPosts, Reviews, Media.

**Do NOT change access on**: Users (always admin-only), Carts (internal), LoyaltyPoints (internal), LoyaltyTransactions (internal), PromotionUsages (internal).

**Step 4: Apply access control to globals**

For each global:

```ts
import { globalAccess } from '@/lib/payload/access'

// In global config:
access: {
  read: globalAccess('slug-here', 'read'),
  update: globalAccess('slug-here', 'update'),
},
```

Apply to: SiteSettings, ShippingConfig, EmailSettings, InventorySettings, LoyaltySettings.

**Step 5: Create Permissions Editor UI component**

Create `frontend/components/payload/PermissionsEditor.tsx` — a React client component that renders a table of checkboxes for the permissions JSON field. This replaces the raw JSON editor with a user-friendly UI.

The component should:
- Read the current `permissions` JSON value
- Render a table: rows = collections/globals, columns = CRUD actions
- Checkboxes toggle individual permissions
- Only show when user role is "editor"
- Group rows by navigation section (Каталог, Продажі, etc.)
- For globals, show only "Перегляд" and "Редагування" columns

Register as custom field component in Users.ts:
```ts
{
  name: 'permissions',
  type: 'json',
  admin: {
    components: {
      Field: '/components/payload/PermissionsEditor',
    },
    condition: (data) => data?.role === 'editor',
  },
}
```

**Step 6: Verify permissions work**

1. Create an editor user in admin
2. Set custom permissions
3. Log in as editor — verify restricted sections are hidden/inaccessible

**Step 7: Commit**

```bash
git add frontend/collections/Users.ts frontend/lib/payload/access.ts frontend/components/payload/PermissionsEditor.tsx
git add frontend/collections/*.ts frontend/globals/*.ts
git commit -m "feat(admin): add CRUD permissions module for editor role"
```

---

### Task 4: Translate all field descriptions to Ukrainian

**Files to modify:**

**LoyaltySettings.ts** — translate English descriptions:
- `pointsPerUah`: "Бали за 1 грн витрат"
- `pointValue`: "1 бал = X грн знижки"
- `maxSpendPercentage`: "Макс. % замовлення оплачуваний балами (0.3 = 30%)"
- `welcomeBonus`: "Вітальний бонус при реєстрації"
- `referralBonus`: "Бонус за реферала"
- Bronze/Silver/Gold tier labels: translate to Ukrainian
- `isActive`: "Програма лояльності активна"

**ShippingConfig.ts** — verify all labels are Ukrainian (mostly done already).

**EmailSettings.ts** — verify/add Ukrainian descriptions for abandoned cart timing fields.

**All collections** — scan for any remaining English `description` or `label` values and translate.

**Step 1: Update all descriptions**

Go through each file and replace English descriptions with Ukrainian equivalents.

**Step 2: Verify in admin UI**

Check that all field labels and descriptions show in Ukrainian.

**Step 3: Commit**

```bash
git add frontend/collections/ frontend/globals/
git commit -m "i18n(admin): translate all field descriptions to Ukrainian"
```

---

### Task 5: Clean dead/duplicate fields

**Files:**

**Step 1: ShippingConfig.ts — remove legacy methods array**

Remove the top-level `methods` array field (not the one inside zones). The zones-based structure replaces it.

**Step 2: Verify shipping still works**

Check checkout flow — shipping methods should come from zones, not legacy array.

**Step 3: Commit**

```bash
git add frontend/globals/ShippingConfig.ts
git commit -m "refactor(admin): remove legacy shipping methods array"
```

---

### Task 6: Unify admin UI styles

**Files:**
- Modify: `frontend/app/(payload)/custom.scss`

**Step 1: Audit current custom views**

Review all custom view components in `frontend/components/payload/` for visual inconsistencies:
- Different button styles
- Different table layouts
- Different spacing/padding
- Different color usage

**Step 2: Create shared CSS variables**

Ensure `custom.scss` defines consistent:
- Button styles (primary teal, secondary outline, danger red)
- Table row styles (consistent card shadows, rounded corners)
- Form field styles (consistent focus states)
- Status badge colors (green=active, yellow=draft, gray=inactive, red=cancelled)
- Spacing tokens

**Step 3: Update custom view components**

Apply consistent class names and styles across all custom views. Focus on:
- `ProductsListView.tsx` — use shared table styles
- `OrderEditView.tsx` — use shared button/badge styles
- `CustomerEditView.tsx` — use shared form layout
- `BannersListView.tsx` — use shared table styles
- `MediaLibraryView.tsx` — use shared grid styles
- All Loyalty views — use shared styles

**Step 4: Verify visual consistency**

Navigate through all admin sections and verify unified look.

**Step 5: Commit**

```bash
git add frontend/app/\(payload\)/custom.scss frontend/components/payload/
git commit -m "style(admin): unify UI across all custom views"
```

---

### Task 7: Database migration

**Step 1: Run Payload migration**

After all config changes, Payload needs to update the database schema:

```bash
cd frontend && npx payload migrate:create admin-redesign
cd frontend && npx payload migrate
```

**Step 2: Verify all collections load**

Open admin panel, click through each collection and global to verify data loads correctly.

**Step 3: Commit migration**

```bash
git add frontend/migrations/
git commit -m "db: add migration for admin panel redesign"
```

---

## Execution Order

1. **Task 1** — Remove locales (isolated, safe)
2. **Task 2** — Regroup navigation (isolated, safe)
3. **Task 7** — Run migration after schema changes
4. **Task 3** — Permissions module (biggest task, needs testing)
5. **Task 4** — Translate descriptions (safe, no logic changes)
6. **Task 5** — Clean dead fields + migration
7. **Task 6** — Unify UI styles (visual, last because needs all structure in place)

## Estimated Scope

- ~20 files modified (collections + globals)
- ~3 new files (access.ts, PermissionsEditor.tsx, migration)
- No frontend (storefront) changes needed
- No breaking changes to API
