import type { GlobalConfig } from 'payload'
import { globalAccess } from '@/lib/payload/access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Налаштування сайту',
  admin: {
    group: 'Налаштування',
    components: {
      views: {
        edit: {
          root: {
            Component: '/components/payload/site-settings/SiteSettingsView',
          },
        },
      },
    },
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return true
      return globalAccess('site-settings', 'read')({ req: { user } } as any)
    },
    update: globalAccess('site-settings', 'update'),
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ─── Контакти ──────────────────────────────────────────
        {
          label: 'Контакти',
          fields: [
            {
              name: 'contacts',
              type: 'group',
              label: ' ',
              admin: { hideGutter: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'phone', type: 'text', label: 'Телефон', defaultValue: '+38 (067) 123-45-67', admin: { width: '50%' } },
                    { name: 'phoneLink', type: 'text', label: 'Телефон (посилання)', defaultValue: 'tel:+380671234567', admin: { width: '50%', description: 'Формат: tel:+380XXXXXXXXX' } },
                  ],
                },
                { name: 'phoneSchedule', type: 'text', label: 'Графік телефону', defaultValue: 'Пн-Пт: 9:00 - 18:00' },
                {
                  type: 'row',
                  fields: [
                    { name: 'email', type: 'text', label: 'Email', defaultValue: 'hello@hairlab.ua', admin: { width: '50%' } },
                    { name: 'emailDescription', type: 'text', label: 'Опис email', defaultValue: 'Відповідаємо протягом 2 годин', admin: { width: '50%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'address', type: 'text', label: 'Адреса', admin: { width: '50%' }, defaultValue: 'м. Київ, вул. Хрещатик, 1' },
                    { name: 'addressLink', type: 'text', label: 'Посилання на карту', admin: { width: '50%' }, defaultValue: 'https://maps.google.com' },
                  ],
                },
                { name: 'addressDescription', type: 'text', label: 'Опис адреси', defaultValue: 'Шоурум працює з 10:00 до 20:00' },
                {
                  type: 'row',
                  fields: [
                    { name: 'schedule', type: 'text', label: 'Загальний графік', admin: { width: '50%' }, defaultValue: 'Щодня з 9:00 до 21:00' },
                    { name: 'scheduleDescription', type: 'text', label: 'Опис графіку', admin: { width: '50%' }, defaultValue: 'Онлайн-підтримка 24/7' },
                  ],
                },
              ],
            },
          ],
        },

        // ─── Соцмережі ────────────────────────────────────────
        {
          label: 'Соцмережі',
          fields: [
            {
              name: 'social',
              type: 'group',
              label: ' ',
              admin: { hideGutter: true },
              fields: [
                { name: 'instagram', type: 'text', label: 'Instagram', defaultValue: 'https://instagram.com/hairlab.ua', admin: { description: 'Повне посилання на профіль' } },
                { name: 'telegram', type: 'text', label: 'Telegram', defaultValue: 'https://t.me/hairlab_ua', admin: { description: 'Повне посилання на канал або бот' } },
                { name: 'facebook', type: 'text', label: 'Facebook', defaultValue: 'https://facebook.com/hairlab.ua', admin: { description: 'Повне посилання на сторінку' } },
              ],
            },
          ],
        },

        // ─── Доставка ──────────────────────────────────────────
        {
          label: 'Доставка',
          description: 'Інформація про доставку на сторінці "Доставка і оплата"',
          fields: [
            {
              name: 'delivery',
              type: 'group',
              label: ' ',
              admin: { hideGutter: true },
              fields: [
                {
                  name: 'methods',
                  type: 'array',
                  label: 'Способи доставки',
                  labels: { singular: 'Спосіб', plural: 'Способи' },
                  admin: { initCollapsed: true },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'title', type: 'text', label: 'Назва', required: true, admin: { width: '40%' } },
                        { name: 'isHighlight', type: 'checkbox', defaultValue: false, label: 'Виділити', admin: { width: '20%' } },
                      ],
                    },
                    { name: 'description', type: 'textarea', label: 'Опис' },
                  ],
                  defaultValue: [
                    { title: 'Нова Пошта', description: 'Доставка 1-3 дні по всій Україні. Безкоштовно від 1500 грн.', isHighlight: true },
                    { title: 'Укрпошта', description: 'Економна доставка 3-7 днів. Доступна для всіх населених пунктів.', isHighlight: false },
                  ],
                },
                {
                  name: 'steps',
                  type: 'array',
                  label: 'Етапи доставки',
                  labels: { singular: 'Крок', plural: 'Кроки' },
                  admin: { initCollapsed: true },
                  fields: [
                    { name: 'title', type: 'text', label: 'Назва кроку', required: true },
                    { name: 'description', type: 'text', label: 'Опис' },
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
                  label: 'Часті запитання',
                  labels: { singular: 'Запитання', plural: 'Запитання' },
                  admin: { initCollapsed: true },
                  fields: [
                    { name: 'question', type: 'text', label: 'Запитання', required: true },
                    { name: 'answer', type: 'textarea', label: 'Відповідь', required: true },
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
          ],
        },

        // ─── Оплата ────────────────────────────────────────────
        {
          label: 'Оплата',
          description: 'Інформація про оплату на сторінці "Доставка і оплата"',
          fields: [
            {
              name: 'payment',
              type: 'group',
              label: ' ',
              admin: { hideGutter: true },
              fields: [
                {
                  name: 'methods',
                  type: 'array',
                  label: 'Способи оплати',
                  labels: { singular: 'Спосіб', plural: 'Способи' },
                  admin: { initCollapsed: true },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'title', type: 'text', label: 'Назва', required: true, admin: { width: '40%' } },
                        { name: 'isHighlight', type: 'checkbox', defaultValue: false, label: 'Виділити', admin: { width: '20%' } },
                      ],
                    },
                    { name: 'description', type: 'textarea', label: 'Опис' },
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
                  admin: { description: 'Показується внизу секції оплати на сайті' },
                  defaultValue: 'Всі платежі захищені технологією 3D Secure. Ми не зберігаємо дані вашої картки — всі транзакції обробляються через сертифіковані платіжні системи з найвищим рівнем захисту PCI DSS.',
                },
                {
                  name: 'faq',
                  type: 'array',
                  label: 'Часті запитання',
                  labels: { singular: 'Запитання', plural: 'Запитання' },
                  admin: { initCollapsed: true },
                  fields: [
                    { name: 'question', type: 'text', label: 'Запитання', required: true },
                    { name: 'answer', type: 'textarea', label: 'Відповідь', required: true },
                  ],
                  defaultValue: [
                    { question: 'Чи безпечно платити карткою на сайті?', answer: 'Так, абсолютно безпечно. Ми використовуємо сертифіковану платіжну систему з захистом 3D Secure та шифруванням SSL.' },
                    { question: 'Коли списуються кошти при онлайн-оплаті?', answer: 'Кошти списуються одразу після підтвердження замовлення. У разі скасування — повернення протягом 1-3 банківських днів.' },
                    { question: 'Чи можна оплатити частинами?', answer: 'Так, доступна оплата частинами від ПриватБанку та Monobank для замовлень від 500 грн. Оберіть цей спосіб при оформленні.' },
                  ],
                },
              ],
            },
          ],
        },

        // ─── Про нас ───────────────────────────────────────────
        {
          label: 'Про нас',
          description: 'Інформація на сторінці "Про нас"',
          fields: [
            {
              name: 'about',
              type: 'group',
              label: ' ',
              admin: { hideGutter: true },
              fields: [
                {
                  name: 'intro',
                  type: 'textarea',
                  label: 'Вступний текст',
                  admin: { description: 'Перший абзац на сторінці "Про нас"' },
                  defaultValue: 'HAIR LAB — це більше ніж магазин косметики для волосся. Це лабораторія краси, де наука зустрічається з турботою про себе.',
                },
                {
                  name: 'story',
                  type: 'textarea',
                  label: 'Історія компанії',
                  admin: { description: 'Другий абзац — розповідь про компанію' },
                  defaultValue: 'Ми заснували HAIR LAB з простою місією: зробити професійний догляд за волоссям доступним кожному. Наша команда трихологів та стилістів ретельно відбирає кожен продукт, тестує його та перевіряє ефективність інгредієнтів.',
                },
                {
                  name: 'features',
                  type: 'array',
                  label: 'Переваги',
                  labels: { singular: 'Перевага', plural: 'Переваги' },
                  admin: { initCollapsed: true, description: 'Блок переваг на сторінці "Про нас" — іконки з описами' },
                  fields: [
                    { name: 'title', type: 'text', label: 'Назва', required: true },
                    { name: 'description', type: 'text', label: 'Опис' },
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
                  labels: { singular: 'Показник', plural: 'Показники' },
                  admin: { initCollapsed: true, description: 'Цифри в секції "Про нас" — наприклад "5+ років досвіду"' },
                  fields: [
                    { name: 'value', type: 'text', label: 'Значення', admin: { description: 'Напр. "5+", "50K+", "4.9"' } },
                    { name: 'label', type: 'text', label: 'Підпис', admin: { description: 'Напр. "років досвіду", "задоволених клієнтів"' } },
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
        },
      ],
    },
  ],
}
