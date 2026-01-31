BRIEF: "HAIR LAB" — E-commerce для професійного догляду за волоссям
1. КОНЦЕПЦІЯ ТА ВІЗУАЛЬНА ФІЛОСОФІЯ
Настрій бренду: "Scientific Self-Care" — поєднання лабораторної чистоти (Olaplex) з теплотою натурального догляду (Briogeo). Не клінічна холодність, а "догляд, підкріплений наукою".
Ключові референси: Olaplex (структура) + Pattern Beauty (кольори) + OUAI (типографіка).
2. ДИЗАЙН-СИСТЕМА
Кольорова палітра (Tailwind-ready)

Primary: 
- Базовий білий: #FAFAFA (тло сторінок)
- Глибокий антрацит: #1A1A1A (основний текст, хедер)
- Нейтральний сірий: #717171 (другорядний текст)

Accent Colors (градієнтна система для категорій):
- "Repair" (Відновлення): Warm Sand #D4A373 + Soft Peach #E9C46A
- "Hydrate" (Зволоження): Ocean Teal #2A9D8F + Aqua #48CAE4  
- "Volume" (Об'єм): Lavender Mist #B8B8D1 + Periwinkle #9FA0C3
- "Curl" (Кучері): Golden Olive #8A9A5B + Amber #BC6C25

Signal Colors:
- Success/Loyalty: Olive Green #606C38 (для програми лояльності)
- Error: Dusty Rose #BC4749 (не яскраво-червоний, а приглушений)
- Sale/Highlight: Mustard #DDA15E

Фони:
- Секції "Science": Cool Gray #F5F5F7
- Секції "Ingredients": Warm Beige #FEFAE0
- Футер: Charcoal #264653 (глибокий зелено-сірий)

Типографіка
Заголовки: Inter або Satoshi (geometric sans-serif), weight 600-700, tracking -0.02em
Body: Inter weight 400, line-height 1.6
Accent/Quotes: Playfair Display (для цитат клієнтів, інгредієнтів)
Scientific: JetBrains Mono (для складу, молекулярних формул, кількості %)
Візуальні принципи
"Air & Structure": Багато whitespace (margin-y: 120px між секціями), але чіткі сітки 12-колонок
Soft Shadows: Тільки для інтерактивних елементів (box-shadow: 0 4px 20px rgba(0,0,0,0.04))
Border Radius:
Картки продуктів: 16px
Кнопки CTAs: 9999px (pill shape)
Input fields: 12px
Imagery: Продукти на neutral gray (#E5E5E5) тлі, 3/4 кут, "плаваючі" молекули/інгредієнти як графічні елементи поруч
3. КЛЮЧОВІ ФІЧІ ТА КОРИСТУВАЦЬКІ СЦЕНАРІЇ
A. ONBOARDING: Hair Quiz (як Function of Beauty + Olaplex)
Локація: Головна сторінка Hero Section + окремий /quiz роут.
Функціонал:
Step-by-step wizard (не форма, а слайди):
Тип волосся (візуальні іконки: пряме, хвилясте, кучеряве, coil)
Проблема (багатовибір: ламкість, сухість, без об'єму, фарбоване)
Чутливість шкіри голови (skincare-підхід)
Бюджет/частота миття
Progress bar з анімацією заповнення (top sticky bar)
Результат: Не просто список, а "Your Hair Routine" — персоналізований набор із 3 продуктів (Cleanse, Treat, Style) з економією при купівлі комплекту.
Візуально: Картки продуктів у результаті мають Micro-interaction — hover показує ключовий інгредієнт (як на Olaplex).
B. ПРОДУКТОВА СТРАНИЦЯ (PDP) — "Scientific Card"
Структура (зліва направо, desktop):
Ліва колонка (60%):
Gallery з Sticky scroll: Vertical thumbnails ліворуч, основне фото праворуч.
Zoom on hover (не клік, а hover-лупа як на OUAI).
Image hotspot: На фото продукту позначені "active zones" — при наведені спливає тултіп з інгредієнтом (Briogeo style).
Права колонка (40%):
Sticky buy box:
Назва + Badge (Vegan/Cruelty-free/Sulfate-free з іконками)
Size Selector (Pattern Beauty style): Візуальні кнопки XS/S/M/L пляшок з відображенням ціни за мл (вигідність).
Frequency Selector (Olaplex style): One-time vs Subscribe (save 15%). При виборі підписки — календар із вибором дати доставки.
Add to Cart + Add to Wishlist (серце з анімацією).
Below the fold:
Ingredient Spotlight: Горизонтальний скрол-карousel із ключовими компонентами (Biomimetic peptides, Hyaluronic, etc.) з коротким описом "для чого".
How to Use: Інтерактивні таби (Wet hair → Apply → Wait → Rinse) з іконками, не просто текст.
Before/After: Слайдер порівняння (drag to reveal) з реальними фото клієнтів + рейтингом.
Complete the Routine: Horizontal scroll з complementary продуктами (Cross-sell).
C. КАТАЛОГ ТА НАВІГАЦІЯ
Глобальний хедер:
Mega-menu при наведенні на "Shop":
Left: By Concern (іконки сітками: Відновлення, Блиск, Об'єм, Контроль жирності).
Right: Bestsellers (3 продукти з "Quick Add" кнопкою — без переходу на сторінку).
Search bar: Expandable (як OUAI), з instant results та категоріями (Products, Routines, Ingredients).
Каталог (/shop):
Filter Sidebar (left, sticky):
Hierarchy: Concern → Hair Type → Ingredients → Price.
Ingredient blacklist filter (Briogeo фіча): Toggle "Without sulfates", "Without parabens" — при активності всі такі продукти підсвічуються, інші dim.
Visual swatches: Для фільтрів "Color" (якщо маєш тони) — круглі color-pills.
Sort: Popularity, Newest, Price, "Best for [вибраний concern з квізу]".
Grid: 3 колонки (desktop), 2 (tablet), 1 (mobile).
Quick View: Модальне вікно (не Drawer) з основною інфою + Add to Cart без переходу на PDP.
D. КОШИК ТА ЧЕКАУТ (Medusa-native + Custom)
Slide-out Drawer (як OUAI, не окрема сторінка):
Cart Summary:
Thumbnails продуктів з можливістью змінити кількість (stepper +/-).
Progress bar: "Додайте ще на 500₴ для безкоштовної доставки" з візуальним заповненням.
Upsell block: "З вашим шампунем чудово працює" — 1 продукт з кнопкою "Додати" (ajax).
Notes: Textarea для коментаря до замовлення (подарункова упаковка?).
Checkout:
Step indicator: 1. Кошик → 2. Контакти → 3. Доставка → 4. Оплата (візуально з'єднана лінія).
Address autocomplete (Google Places API інтеграція).
Delivery options: Візуальні картки (Кур'єр / Нова Пошта / Самовивіз) з іконками та часом доставки.
Payment: Apple Pay / Google Pay ( prominent), потім картка.
E. КОНТЕНТ-ФІЧІ
Ingredients Glossary (/ingredients):
Окремий розділ, як бібліотека (Briogeo style).
Grid інгредієнтів з фільтрацією (A-Z, By Benefit).
Картка інгредієнта: Назва, INCI назва, що робить, у яких продуктах є (лінк на фільтрований каталог).
Routine Builder:
Інтерактивний конструктор "Мій день догляду":
Drag & drop продуктів у timeline (Morning / Evening / Weekly).
Збереження в Professional account (для майбутніх покупок).
4. ІНТЕРАКЦІЇ ТА МІКРО-АНІМАЦІЇ (Next.js 15 + Framer Motion)
Page transitions: Slide between pages (App Router compatible).
Hover effects:
Картки продуктів — підняття вгору на 8px + тінь збільшується.
Кнопки — scale(1.02) + background shift.
Loader: Не спінер, а "пульсуюча" молекула (brand mascot).
Toast notifications: При додаванні в кошик — slide from right з фото продукту та кнопкою "Оформити".
Parallax: На Hero section фото моделі з волоссям рухається повільніше за текст (scroll-linked).

5. ТЕХНІЧНІ ВИМОГИ ДО ФРОНТЕНДУ Критичні вимоги:
Server Components by default (PDP, Catalog), Client Components тільки для інтерактивності (квіз, кошик drawer).
Streaming: LoadingUI для каталогу (skeleton cards).
Metadata: Dynamic Open Graph для кожного продукту (фото + ціна + опис).
Image optimization: WebP/AVIF, blur placeholder (dominant color).
Mobile-first: Touch-friendly фільтри (bottom sheet на мобільних, не sidebar).
6. ІНТЕГРАЦІЯ З MEDUSA 2.13.1
Кастомні модулі (бекенд) необхідні:
Quiz Module: Зберігання відповідей користувача → зв'язок з Product Collection (результати квізу = динамічна колекція).
Subscription Module: Інтеграція з Medusa Payment Providers для рекурентних платежів (або зовнішній сервіс типу Recharge через API).
Ingredient Content Model: Додаткова сутність до Product з полями (Name, Description, Icon, Benefits) для Glossary.
Storefront API usage:
Поля metadata продуктів активно використовувати для "Hair Type", "Concerns", "Key Ingredients" — для фільтрації на фронті без додаткових запитів.
7. АДАПТИВНІСТЬ ТА ДОСТУПНІСТЬ
Breakoints: Mobile (<640px), Tablet (640-1024), Desktop (>1024).
Accessibility:
Focus rings visible (2px offset, primary color).
Color contrast ratio > 4.5:1 для всього тексту.
Alt text для всіх продуктових фото (генерується з назви + "on gray background").
Keyboard navigation для Hair Quiz (стрілки для вибору відповіді).

Можливість роширення СМS Strapi v5 

