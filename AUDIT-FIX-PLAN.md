# HAIR LAB — План виправлень аудиту
**Дата:** 2026-02-18

---

## ФАЗА 1: КРИТИЧНІ (Безпека)

- [x] **1.1** Access control на всіх колекціях (Products, Categories, Brands, Pages, BlogPosts, Reviews, PromoBlocks, Banners, Media)
- [x] **1.2** Access control на Carts — delete тільки для адмінів
- [x] **1.3** Серверна валідація цін у completeCart() — перевірка цін з БД перед створенням замовлення
- [x] **1.4** Авторизація в server actions (admin-views.ts, loyalty-admin.ts) — requireAdmin() перевірка
- [x] **1.5** Захист від подвійного оформлення замовлення — перевірка cart.status === 'completed'
- [x] **1.6** Валідація quantity у addToCart() — тільки додатні цілі числа 1-10

## ФАЗА 2: ВИСОКИЙ ПРІОРИТЕТ (Стабільність + Продуктивність)

- [x] **2.1** Security headers у next.config.ts (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- [x] **2.2** Серверна валідація форм checkout (email, phone, name, city length)
- [x] **2.3** Timestamp в токені сесії + перевірка терміну дії (30 днів)
- [x] **2.4** Error boundary — app/error.tsx + app/(frontend)/error.tsx
- [x] **2.5** Loading files — app/(frontend)/loading.tsx (shop/loading.tsx вже існував)
- [x] **2.6** Замінити img на Image + видалити unoptimized (product-card, product-gallery, hero-slider, brands, cart-drawer, brand-hero)
- [x] **2.7** Видалити дублювання шрифтів з globals.css
- [x] **2.8** Видалити console.log з newsletter.ts

## ФАЗА 3: СЕРЕДНІЙ ПРІОРИТЕТ (Оптимізація)

- [x] **3.1** Race condition displayId — додано req для transaction safety
- [x] **3.2** Dynamic import для Embla Carousel (hero-slider-cms)
- [x] **3.3** Throttle на mousemove в header (~60fps)
- [x] **3.4** refetchOnWindowFocus: true для useCustomer (+ staleTime 2 хв)
- [x] **3.5** Замінити небезпечний HTML-рендеринг на JSX SVG в навігації (3 файли)

## ФАЗА 4: НИЗЬКИЙ ПРІОРИТЕТ (Покращення)

- [x] **4.1** React.memo на ProductCard
- [x] **4.2** localStorage quota error handling (safeStorage в cart-store та auth-store)
- [ ] **4.3** Rate limiting на реєстрацію та newsletter (потребує Redis для production)

---

## Прогрес

| Фаза | Всього | Виконано | Статус |
|------|--------|---------|--------|
| 1. Критичні | 6 | 6 | Готово |
| 2. Високі | 8 | 8 | Готово |
| 3. Середні | 5 | 5 | Готово |
| 4. Низькі | 3 | 2 | Майже готово |
| **Разом** | **22** | **21** | **Готово** |

---

## Залишилось

- **4.3** Rate limiting на реєстрацію/newsletter — потребує Redis (in-memory не масштабується). Рекомендація: впровадити при деплої на production.
