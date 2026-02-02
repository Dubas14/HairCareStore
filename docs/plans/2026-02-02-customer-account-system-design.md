# Customer Account System Design

> **Status:** ✅ Complete
> **Created:** 2026-02-02
> **Last Updated:** 2026-02-02

---

## Implementation Progress

### Phase 1: Addresses ✅ Complete
- [x] `use-addresses.ts` hook
- [x] `AddressCard` component
- [x] `AddressForm` modal component
- [x] `AddressesTab` in dashboard
- [ ] Integration tests

### Phase 2: Checkout Autofill ✅ Complete
- [x] `AddressSelect` component
- [x] ContactForm autofill integration
- [x] ShippingForm address selection
- [ ] "Save address" checkbox (deferred - can be added later)

### Phase 3: Orders History ✅ Complete
- [x] `use-orders.ts` hook
- [x] `OrderCard` component
- [x] `OrdersTab` in dashboard
- [x] `/account/orders/[id]` page
- [x] "Repeat order" functionality

### Phase 4: Wishlist ✅ Complete
- [x] `use-wishlist.ts` hook (stored in customer.metadata)
- [x] ProductCard wishlist button with toggle
- [x] `WishlistTab` in dashboard with product grid
- [x] Toast for unauthenticated users

### Phase 5: Password Management ✅ Complete
- [x] `use-password.ts` hook (requestReset, resetPassword)
- [x] Change password modal in Settings tab
- [x] `/account/forgot-password` page
- [x] `/account/reset-password` page

### Phase 6: Personal Discounts ✅ Complete
- [x] Adapter calculates discount % from calculated_price
- [x] ProductCard shows discount badge and old price
- [x] Product page BuyBox shows variant discounts
- [x] Cart drawer shows discount_total row
- [x] OrderSummary shows discount_total row

---

## Changelog

| Date | Phase | Changes |
|------|-------|---------|
| 2026-02-02 | 6 | Phase 6 complete: discount display in adapter, cart, product page |
| 2026-02-02 | 5 | Phase 5 complete: password hooks, forgot/reset pages, settings modal |
| 2026-02-02 | 4 | Phase 4 complete: wishlist hook (metadata storage), ProductCard button, WishlistTab |
| 2026-02-02 | 3 | Phase 3 complete: orders hook, OrderCard, OrdersTab, order details page, repeat order |
| 2026-02-02 | 2 | Phase 2 complete: AddressSelect, checkout autofill from customer + addresses |
| 2026-02-02 | 1 | Phase 1 complete: addresses hook, AddressCard, AddressForm, AddressesTab |
| 2026-02-02 | - | Initial design document created |

---

## Overview

Повна система особистого кабінету користувача для HAIR LAB e-commerce платформи.

**Функціонал:**
- Wishlist (улюблені товари) — тільки для залогінених
- Адреси доставки — CRUD з можливістю обрати основну
- Історія замовлень — список та деталі
- Автозаповнення checkout — дані клієнта та збережені адреси
- Персональні знижки — відображення цін з Customer Groups
- Зміна пароля та forgot password flow

## Architecture

### File Structure

```
frontend/
├── lib/medusa/hooks/
│   ├── use-customer.ts        # Існує — розширити
│   ├── use-wishlist.ts        # NEW
│   ├── use-addresses.ts       # NEW
│   └── use-orders.ts          # NEW
├── stores/
│   └── auth-store.ts          # Існує — без змін
├── components/
│   ├── auth/
│   │   ├── account-dashboard.tsx  # Переробити таби
│   │   ├── address-form.tsx       # NEW
│   │   ├── address-card.tsx       # NEW
│   │   ├── order-card.tsx         # NEW
│   │   ├── order-details.tsx      # NEW
│   │   ├── change-password-modal.tsx # NEW
│   │   └── wishlist-grid.tsx      # NEW
│   ├── checkout/
│   │   ├── contact-form.tsx       # Додати автозаповнення
│   │   ├── shipping-form.tsx      # Додати вибір адреси
│   │   └── address-select.tsx     # NEW
│   └── products/
│       └── product-card.tsx       # Додати wishlist кнопку
└── app/account/
    ├── page.tsx                   # Існує
    ├── orders/[id]/page.tsx       # NEW
    ├── forgot-password/page.tsx   # NEW
    └── reset-password/page.tsx    # NEW
```

### Medusa API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/store/customers/me` | GET | Профіль + metadata |
| `/store/customers/me` | PATCH | Оновлення профілю + wishlist |
| `/store/customers/me/addresses` | GET | Список адрес |
| `/store/customers/me/addresses` | POST | Додати адресу |
| `/store/customers/me/addresses/:id` | PATCH | Оновити адресу |
| `/store/customers/me/addresses/:id` | DELETE | Видалити адресу |
| `/store/orders` | GET | Історія замовлень |
| `/store/orders/:id` | GET | Деталі замовлення |
| `/auth/customer/emailpass/update` | POST | Зміна пароля |
| `/auth/customer/emailpass/reset-password` | POST | Forgot/reset password |

---

## Feature 1: Wishlist

### Data Storage

Зберігаємо в `customer.metadata.wishlist` як масив product IDs:
```typescript
customer.metadata = {
  wishlist: ["prod_01ABC", "prod_02DEF", ...]
}
```

**Обмеження:** максимум 50 товарів

### Hook: use-wishlist.ts

```typescript
interface UseWishlistReturn {
  items: Product[]
  productIds: string[]
  isInWishlist: (productId: string) => boolean
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isLoading: boolean
  isUpdating: boolean
}

export function useWishlist(): UseWishlistReturn
```

**Логіка:**
1. Отримуємо `customer.metadata.wishlist` при завантаженні
2. Batch-запит продуктів: `GET /store/products?id[]=...`
3. Кешування: React Query key `['wishlist', customerId]`
4. Оптимістичне оновлення при add/remove

### UI Changes

**ProductCard — wishlist button:**
```tsx
// Правий верхній кут картки
<button onClick={handleWishlistToggle}>
  <Heart
    className={cn(
      "w-5 h-5 transition-colors",
      isInWishlist ? "fill-red-500 text-red-500" : "text-muted-foreground"
    )}
  />
</button>
```

- Незалогінений клік → toast "Увійдіть щоб зберегти товар"
- Залогінений → toggle з анімацією серця

**WishlistTab:**
- Сітка ProductCard компонентів (reuse existing)
- Порожній стан: іконка + "Список бажань порожній" + CTA

---

## Feature 2: Addresses

### Hook: use-addresses.ts

```typescript
interface Address {
  id: string
  first_name: string
  last_name: string
  phone: string
  city: string
  address_1: string  // Відділення НП
  metadata?: {
    is_default?: boolean
  }
}

interface UseAddressesReturn {
  addresses: Address[]
  defaultAddress: Address | null
  addAddress: (data: AddressInput) => Promise<Address>
  updateAddress: (id: string, data: Partial<AddressInput>) => Promise<Address>
  deleteAddress: (id: string) => Promise<void>
  setDefaultAddress: (id: string) => Promise<void>
  isLoading: boolean
}

export function useAddresses(): UseAddressesReturn
```

### UI Components

**AddressCard:**
```tsx
<div className="bg-card rounded-xl p-4 border">
  <div className="flex justify-between">
    <div>
      <p className="font-medium">{firstName} {lastName}</p>
      <p className="text-sm text-muted-foreground">{phone}</p>
      <p className="text-sm">{city}, {address_1}</p>
    </div>
    {isDefault && <Badge>Основна</Badge>}
  </div>
  <div className="flex gap-2 mt-4">
    <Button variant="ghost" size="sm">Редагувати</Button>
    <Button variant="ghost" size="sm">Видалити</Button>
    {!isDefault && <Button variant="ghost" size="sm">Зробити основною</Button>}
  </div>
</div>
```

**AddressForm (modal):**
- Поля: Ім'я, Прізвище, Телефон, Місто, Відділення НП
- Валідація: всі поля обов'язкові
- Режими: create / edit

**AddressesTab:**
- Список AddressCard (максимум 5)
- Кнопка "Додати адресу" → відкриває AddressForm modal
- Порожній стан з CTA

---

## Feature 3: Orders History

### Hook: use-orders.ts

```typescript
interface OrderItem {
  id: string
  title: string
  thumbnail: string
  quantity: number
  unit_price: number
  variant: { title: string }
}

interface Order {
  id: string
  display_id: number
  status: 'pending' | 'completed' | 'canceled'
  created_at: string
  total: number
  subtotal: number
  shipping_total: number
  discount_total: number
  items: OrderItem[]
  shipping_address: Address
}

interface UseOrdersReturn {
  orders: Order[]
  isLoading: boolean
  hasMore: boolean
  loadMore: () => void
}

export function useOrders(): UseOrdersReturn
export function useOrder(id: string): { order: Order | null; isLoading: boolean }
```

### UI Components

**OrderCard:**
```tsx
<Link href={`/account/orders/${order.id}`}>
  <div className="bg-card rounded-xl p-4 hover:shadow-md transition">
    <div className="flex justify-between items-start">
      <div>
        <p className="font-medium">Замовлення #{display_id}</p>
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </div>
      <StatusBadge status={status} />
    </div>
    <div className="flex justify-between mt-4">
      <p className="text-sm">{items.length} товарів</p>
      <p className="font-semibold">{total} ₴</p>
    </div>
  </div>
</Link>
```

**StatusBadge:**
- pending → жовтий "Очікує обробки"
- completed → зелений "Виконано"
- canceled → сірий "Скасовано"

**OrderDetails page (`/account/orders/[id]`):**
```
┌─────────────────────────────────────────┐
│ ← Назад до замовлень                    │
│                                         │
│ Замовлення #1001                        │
│ 15 січня 2026                           │
│                                         │
│ [●]────[●]────[○]────[○]                │
│ Оформлено  Обробка  Відправлено  Доставлено│
│                                         │
│ ─────────────────────────────────────── │
│ Товари                                  │
│ ┌─────┬────────────────────┬─────────┐  │
│ │ IMG │ Product Name       │ 500 ₴   │  │
│ │     │ 250ml × 2          │         │  │
│ └─────┴────────────────────┴─────────┘  │
│                                         │
│ ─────────────────────────────────────── │
│ Доставка                                │
│ Іван Петренко, +380...                  │
│ Київ, Відділення №5                     │
│                                         │
│ ─────────────────────────────────────── │
│ Підсумок            1000 ₴              │
│ Знижка               -100 ₴             │
│ Доставка              50 ₴              │
│ Разом                950 ₴              │
│                                         │
│ [Повторити замовлення]                  │
└─────────────────────────────────────────┘
```

**"Повторити замовлення":**
- Додає всі items в кошик
- Redirect на `/checkout`

---

## Feature 4: Checkout Autofill

### ContactForm Integration

```tsx
// app/checkout/page.tsx
const { customer } = useCustomer()
const { defaultAddress } = useAddresses()

const contactInitialData = customer ? {
  email: customer.email,
  phone: customer.phone || defaultAddress?.phone || '',
  firstName: customer.first_name,
  lastName: customer.last_name,
} : undefined

<ContactForm initialData={contactInitialData} />
```

### ShippingForm Integration

**New component: AddressSelect**
```tsx
interface AddressSelectProps {
  addresses: Address[]
  onSelect: (address: Address) => void
}

// Dropdown над формою
<Select onValueChange={handleSelect}>
  <SelectTrigger>
    <SelectValue placeholder="Оберіть збережену адресу" />
  </SelectTrigger>
  <SelectContent>
    {addresses.map(addr => (
      <SelectItem key={addr.id} value={addr.id}>
        {addr.city}, {addr.address_1}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**ShippingForm changes:**
```tsx
const { addresses, defaultAddress } = useAddresses()
const [selectedAddress, setSelectedAddress] = useState(defaultAddress)

// Показуємо AddressSelect якщо є адреси
{isAuthenticated && addresses.length > 0 && (
  <AddressSelect addresses={addresses} onSelect={setSelectedAddress} />
)}

<ShippingForm initialData={selectedAddress} />

// Checkbox для збереження нової адреси
{isAuthenticated && (
  <Checkbox label="Зберегти адресу для майбутніх замовлень" />
)}
```

---

## Feature 5: Personal Discounts

### How It Works (Medusa)

1. Admin створює **Customer Group** (напр. "VIP", "Постійні клієнти")
2. Admin створює **Price List** з типом "sale" та прив'язує до групи
3. При запиті products API — Medusa автоматично повертає знижені ціни

### Frontend Display

**ProductCard:**
```tsx
const hasDiscount = calculated_price < original_price

{hasDiscount ? (
  <div className="flex items-center gap-2">
    <span className="text-lg font-bold text-primary">{calculated_price} ₴</span>
    <span className="text-sm text-muted-foreground line-through">{original_price} ₴</span>
    <Badge variant="sale">Ваша ціна</Badge>
  </div>
) : (
  <span className="text-lg font-bold">{original_price} ₴</span>
)}
```

**Cart / OrderSummary:**
```tsx
// Якщо є персональна знижка
{personalDiscount > 0 && (
  <div className="flex justify-between text-sm text-success">
    <span className="flex items-center gap-1">
      <Star className="w-4 h-4" />
      Персональна знижка
    </span>
    <span>-{personalDiscount} ₴</span>
  </div>
)}
```

---

## Feature 6: Password Management

### Change Password

**Hook addition to use-customer.ts:**
```typescript
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: {
      currentPassword: string
      newPassword: string
    }) => {
      await sdk.auth.updateProvider('customer', 'emailpass', {
        password: data.newPassword,
      })
    },
  })
}
```

**ChangePasswordModal:**
- Current password input
- New password input + strength indicator
- Confirm password input
- Валідація: мін 8 символів, паролі співпадають

### Forgot Password Flow

**Page: `/account/forgot-password`**
```tsx
// Step 1: Enter email
<form onSubmit={handleSubmit}>
  <Input name="email" placeholder="Введіть email" />
  <Button>Надіслати посилання</Button>
</form>

// Step 2: Success message
<div className="text-center">
  <CheckCircle className="w-16 h-16 text-success mx-auto" />
  <h2>Перевірте пошту</h2>
  <p>Ми надіслали посилання для відновлення пароля</p>
</div>
```

**Page: `/account/reset-password`**
```tsx
// URL: /account/reset-password?token=xxx&email=xxx

<form onSubmit={handleReset}>
  <Input name="password" type="password" placeholder="Новий пароль" />
  <PasswordStrength password={password} />
  <Input name="confirmPassword" type="password" placeholder="Підтвердіть пароль" />
  <Button>Змінити пароль</Button>
</form>
```

**API calls:**
```typescript
// Request reset
await sdk.auth.resetPassword('customer', 'emailpass', {
  identifier: email,
})

// Complete reset
await sdk.auth.updateProvider('customer', 'emailpass', {
  token: token,
  password: newPassword,
})
```

---

## Implementation Order

1. **Addresses** — базовий CRUD, потрібен для checkout
2. **Checkout autofill** — інтеграція з addresses
3. **Orders** — історія та деталі
4. **Wishlist** — hook + UI
5. **Password management** — change + forgot/reset
6. **Personal discounts** — UI відображення (бекенд вже підтримує)

---

## UI/UX Notes

- Всі форми використовують existing Input, Button компоненти
- Анімації: `animate-fadeInUp` для карток
- Loading states: Skeleton компоненти або Loader2 spinner
- Error states: toast notifications
- Mobile: responsive grid (1 col mobile, 2 col tablet+)

## Testing Checklist

- [ ] Wishlist add/remove працює
- [ ] Wishlist зберігається після logout/login
- [ ] Addresses CRUD працює
- [ ] Default address автозаповнює checkout
- [ ] Orders list завантажується
- [ ] Order details показує всі дані
- [ ] "Повторити замовлення" додає в кошик
- [ ] Change password працює
- [ ] Forgot password flow працює
- [ ] Personal discounts відображаються
