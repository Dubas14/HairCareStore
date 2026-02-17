import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Налаштування сайту',
  admin: {
    hidden: true,
  },
  access: {
    read: () => true,
    update: ({ req }) => req?.user?.collection === 'users',
  },
  fields: [
    // ─── Контактна інформація ───────────────────────────────────
    {
      name: 'contacts',
      type: 'group',
      label: 'Контактна інформація',
      fields: [
        { name: 'phone', type: 'text', label: 'Телефон', defaultValue: '+38 (067) 123-45-67' },
        { name: 'phoneLink', type: 'text', label: 'Телефон (посилання)', defaultValue: 'tel:+380671234567' },
        { name: 'phoneSchedule', type: 'text', label: 'Графік телефону', defaultValue: 'Пн-Пт: 9:00 - 18:00' },
        { name: 'email', type: 'text', label: 'Email', defaultValue: 'hello@hairlab.ua' },
        { name: 'emailDescription', type: 'text', label: 'Опис email', defaultValue: 'Відповідаємо протягом 2 годин' },
        { name: 'address', type: 'text', label: 'Адреса', defaultValue: 'м. Київ, вул. Хрещатик, 1' },
        { name: 'addressLink', type: 'text', label: 'Посилання на карту', defaultValue: 'https://maps.google.com' },
        { name: 'addressDescription', type: 'text', label: 'Опис адреси', defaultValue: 'Шоурум працює з 10:00 до 20:00' },
        { name: 'schedule', type: 'text', label: 'Загальний графік', defaultValue: 'Щодня з 9:00 до 21:00' },
        { name: 'scheduleDescription', type: 'text', label: 'Опис графіку', defaultValue: 'Онлайн-підтримка 24/7' },
      ],
    },

    // ─── Соціальні мережі ───────────────────────────────────────
    {
      name: 'social',
      type: 'group',
      label: 'Соціальні мережі',
      fields: [
        { name: 'instagram', type: 'text', label: 'Instagram URL', defaultValue: 'https://instagram.com/hairlab.ua' },
        { name: 'telegram', type: 'text', label: 'Telegram URL', defaultValue: 'https://t.me/hairlab_ua' },
        { name: 'facebook', type: 'text', label: 'Facebook URL', defaultValue: 'https://facebook.com/hairlab.ua' },
      ],
    },

    // ─── Сторінка "Доставка" ────────────────────────────────────
    {
      name: 'delivery',
      type: 'group',
      label: 'Сторінка "Доставка"',
      fields: [
        {
          name: 'methods',
          type: 'array',
          label: 'Способи доставки',
          labels: { singular: 'Спосіб', plural: 'Способи' },
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea' },
            { name: 'isHighlight', type: 'checkbox', defaultValue: false, label: 'Виділити' },
          ],
          defaultValue: [
            { title: 'Нова Пошта', description: 'Доставка 1-3 дні по всій Україні. Безкоштовно від 1500 грн.', isHighlight: true },
            { title: 'Укрпошта', description: 'Економна доставка 3-7 днів. Доступна для всіх населених пунктів.', isHighlight: false },
            { title: 'Кур\'єрська доставка', description: 'Доставка день в день по Києву та області. Замовлення до 14:00.', isHighlight: false },
          ],
        },
        {
          name: 'steps',
          type: 'array',
          label: 'Кроки доставки',
          labels: { singular: 'Крок', plural: 'Кроки' },
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'text' },
          ],
          defaultValue: [
            { title: 'Оформлення', description: 'Залиште заявку на сайті або зателефонуйте нам' },
            { title: 'Підтвердження', description: "Менеджер зв'яжеться для уточнення деталей" },
            { title: 'Відправка', description: 'Товар буде надісланий в день замовлення' },
            { title: 'Отримання', description: 'Заберіть замовлення у відділенні або отримайте кур\'єром' },
          ],
        },
        {
          name: 'faq',
          type: 'array',
          label: 'FAQ доставки',
          labels: { singular: 'Запитання', plural: 'FAQ' },
          fields: [
            { name: 'question', type: 'text', required: true },
            { name: 'answer', type: 'textarea', required: true },
          ],
          defaultValue: [
            { question: 'Яка вартість доставки?', answer: 'Доставка Новою Поштою безкоштовна при замовленні від 1500 грн. Для замовлень до 1500 грн вартість доставки розраховується за тарифами перевізника.' },
            { question: 'Як швидко відправляється замовлення?', answer: 'Замовлення, оформлені до 14:00, відправляються того ж дня. Замовлення після 14:00 відправляються наступного робочого дня.' },
            { question: 'Чи можна змінити адресу доставки?', answer: "Так, ви можете змінити адресу до моменту відправлення замовлення, зв'язавшись з нашим менеджером." },
            { question: 'Як відстежити моє замовлення?', answer: 'Після відправлення ви отримаєте SMS з номером ТТН для відстеження посилки на сайті перевізника.' },
          ],
        },
      ],
    },

    // ─── Сторінка "Оплата" ──────────────────────────────────────
    {
      name: 'payment',
      type: 'group',
      label: 'Сторінка "Оплата"',
      fields: [
        {
          name: 'methods',
          type: 'array',
          label: 'Способи оплати',
          labels: { singular: 'Спосіб', plural: 'Способи' },
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea' },
            { name: 'isHighlight', type: 'checkbox', defaultValue: false, label: 'Виділити' },
          ],
          defaultValue: [
            { title: 'Карткою онлайн', description: 'Visa, Mastercard, Apple Pay, Google Pay. Миттєве підтвердження платежу.', isHighlight: true },
            { title: 'Накладений платіж', description: 'Оплата при отриманні на пошті. Комісія за тарифами перевізника.', isHighlight: false },
            { title: 'Безготівковий розрахунок', description: 'Для юридичних осіб та ФОП. Виставлення рахунку протягом години.', isHighlight: false },
            { title: 'Оплата частинами', description: 'Розстрочка від ПриватБанку та Monobank до 4 платежів без переплат.', isHighlight: false },
          ],
        },
        {
          name: 'securityText',
          type: 'textarea',
          label: 'Текст про безпеку платежів',
          defaultValue: 'Всі платежі захищені технологією 3D Secure. Ми не зберігаємо дані вашої картки — всі транзакції обробляються через сертифіковані платіжні системи з найвищим рівнем захисту PCI DSS.',
        },
        {
          name: 'faq',
          type: 'array',
          label: 'FAQ оплати',
          labels: { singular: 'Запитання', plural: 'FAQ' },
          fields: [
            { name: 'question', type: 'text', required: true },
            { name: 'answer', type: 'textarea', required: true },
          ],
          defaultValue: [
            { question: 'Чи безпечно платити карткою на сайті?', answer: 'Так, абсолютно безпечно. Ми використовуємо сертифіковану платіжну систему з захистом 3D Secure та шифруванням SSL.' },
            { question: 'Коли списуються кошти при онлайн-оплаті?', answer: 'Кошти списуються одразу після підтвердження замовлення. У разі скасування — повернення протягом 1-3 банківських днів.' },
            { question: 'Чи можна оплатити частинами?', answer: 'Так, доступна оплата частинами від ПриватБанку та Monobank для замовлень від 500 грн. Оберіть цей спосіб при оформленні.' },
          ],
        },
      ],
    },

    // ─── Сторінка "Про нас" ─────────────────────────────────────
    {
      name: 'about',
      type: 'group',
      label: 'Сторінка "Про нас"',
      fields: [
        {
          name: 'intro',
          type: 'textarea',
          label: 'Вступний текст (виділений)',
          defaultValue: 'HAIR LAB — це більше ніж магазин косметики для волосся. Це лабораторія краси, де наука зустрічається з турботою про себе.',
        },
        {
          name: 'story',
          type: 'textarea',
          label: 'Історія компанії',
          defaultValue: 'Ми заснували HAIR LAB з простою місією: зробити професійний догляд за волоссям доступним кожному. Наша команда трихологів та стилістів ретельно відбирає кожен продукт, тестує його та перевіряє ефективність інгредієнтів.',
        },
        {
          name: 'features',
          type: 'array',
          label: 'Переваги',
          labels: { singular: 'Перевага', plural: 'Переваги' },
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'text' },
          ],
          defaultValue: [
            { title: 'Тільки оригінали', description: "Працюємо напряму з брендами та офіційними дистриб'юторами" },
            { title: 'Науковий підхід', description: 'Кожен продукт перевірений трихологами та дерматологами' },
            { title: 'Натуральні формули', description: 'Пріоритет інгредієнтам природного походження' },
            { title: 'Eco-friendly', description: 'Підтримуємо бренди з етичним виробництвом' },
            { title: 'Індивідуальний підбір', description: 'Безкоштовні консультації для підбору догляду' },
            { title: 'Підтримка 24/7', description: 'Завжди на зв\'язку для відповіді на ваші запитання' },
          ],
        },
        {
          name: 'stats',
          type: 'array',
          label: 'Статистика',
          labels: { singular: 'Показник', plural: 'Статистика' },
          fields: [
            { name: 'value', type: 'text', required: true },
            { name: 'label', type: 'text', required: true },
          ],
          defaultValue: [
            { value: '5+', label: 'років досвіду' },
            { value: '50K+', label: 'задоволених клієнтів' },
            { value: '200+', label: 'брендів' },
            { value: '4.9', label: 'рейтинг на Google' },
          ],
        },
      ],
    },
  ],
}
