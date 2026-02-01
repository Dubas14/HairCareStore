/**
 * Fix pages with correct UTF-8 encoding
 * Run: node scripts/fix-pages.js
 */

const STRAPI_URL = 'http://localhost:1337'
const API_TOKEN = '9b6fe52b9eb438bab05fa6711febd4608a7c2b165e4ba77575cb042b2fde6139212ae0d0f8247e6d5ccd7cd4ebb0702d4887d60064caf1b906561ed4886c6abb44d6c18438dccaefa71ad232c560782e26c3c9c848f12d0ca5aea118f3e81ae18e86520cbabd00062b2cad15972917de7750254ad5187346b7e2a74f06cbf041'

const pages = [
  {
    title: 'Про нас',
    slug: 'about',
    content: [
      { type: 'heading', level: 2, children: [{ type: 'text', text: 'HAIR LAB — професійна косметика для волосся' }] },
      { type: 'paragraph', children: [{ type: 'text', text: 'Ми — команда професіоналів, яка понад 10 років працює у сфері догляду за волоссям. Наша місія — зробити професійну косметику доступною для кожного.' }] },
      { type: 'heading', level: 3, children: [{ type: 'text', text: 'Чому обирають нас?' }] },
      { type: 'paragraph', children: [{ type: 'text', text: '✓ 100% оригінальна продукція від офіційних дистриб\'юторів' }] },
      { type: 'paragraph', children: [{ type: 'text', text: '✓ Понад 500 товарів від провідних брендів: Elgon, INEBRYA, MOOD, NEVITALY' }] },
      { type: 'paragraph', children: [{ type: 'text', text: '✓ Безкоштовна консультація від професійних стилістів' }] },
      { type: 'paragraph', children: [{ type: 'text', text: '✓ Швидка доставка по всій Україні' }] },
      { type: 'heading', level: 3, children: [{ type: 'text', text: 'Наші цінності' }] },
      { type: 'paragraph', children: [{ type: 'text', text: 'Якість понад усе. Ми ретельно відбираємо кожен продукт і працюємо тільки з перевіреними брендами, які використовують салони краси по всьому світу.' }] },
    ],
    metaTitle: 'Про нас | HAIR LAB — професійна косметика для волосся',
    metaDescription: 'HAIR LAB — інтернет-магазин професійної косметики для волосся. Оригінальна продукція від Elgon, INEBRYA, MOOD, NEVITALY. Доставка по Україні.',
    isPublished: true,
  },
  {
    title: 'Доставка та оплата',
    slug: 'delivery',
    content: [
      { type: 'heading', level: 2, children: [{ type: 'text', text: 'Доставка' }] },
      { type: 'paragraph', children: [{ type: 'text', text: 'Ми доставляємо замовлення по всій Україні через Нову Пошту.' }] },
      { type: 'heading', level: 3, children: [{ type: 'text', text: 'Терміни доставки' }] },
      { type: 'paragraph', children: [{ type: 'text', text: '• Київ та обласні центри: 1-2 дні' }] },
      { type: 'paragraph', children: [{ type: 'text', text: '• Інші міста: 2-3 дні' }] },
      { type: 'paragraph', children: [{ type: 'text', text: '• Відправка в день замовлення при оформленні до 14:00' }] },
      { type: 'heading', level: 3, children: [{ type: 'text', text: 'Вартість доставки' }] },
      { type: 'paragraph', children: [{ type: 'text', text: '• Безкоштовно при замовленні від 1500 грн' }] },
      { type: 'paragraph', children: [{ type: 'text', text: '• За тарифами Нової Пошти при замовленні до 1500 грн' }] },
      { type: 'heading', level: 2, children: [{ type: 'text', text: 'Оплата' }] },
      { type: 'paragraph', children: [{ type: 'text', text: 'Ми приймаємо наступні способи оплати:' }] },
      { type: 'paragraph', children: [{ type: 'text', text: '• Оплата при отриманні (накладений платіж)' }] },
      { type: 'paragraph', children: [{ type: 'text', text: '• Онлайн оплата карткою Visa/Mastercard' }] },
      { type: 'paragraph', children: [{ type: 'text', text: '• Безготівковий розрахунок для юридичних осіб' }] },
    ],
    metaTitle: 'Доставка та оплата | HAIR LAB',
    metaDescription: 'Безкоштовна доставка від 1500 грн. Нова Пошта по всій Україні. Оплата при отриманні або онлайн.',
    isPublished: true,
  },
  {
    title: 'Контакти',
    slug: 'contacts',
    content: [
      { type: 'heading', level: 2, children: [{ type: 'text', text: 'Зв\'яжіться з нами' }] },
      { type: 'paragraph', children: [{ type: 'text', text: 'Ми завжди раді допомогти вам з вибором продукції та відповісти на будь-які питання.' }] },
      { type: 'heading', level: 3, children: [{ type: 'text', text: 'Телефони' }] },
      { type: 'paragraph', children: [{ type: 'text', text: '+38 (067) 123-45-67 — Viber, Telegram' }] },
      { type: 'paragraph', children: [{ type: 'text', text: '+38 (050) 123-45-67 — гаряча лінія' }] },
      { type: 'heading', level: 3, children: [{ type: 'text', text: 'Email' }] },
      { type: 'paragraph', children: [{ type: 'text', text: 'info@hairlab.ua — загальні питання' }] },
      { type: 'paragraph', children: [{ type: 'text', text: 'orders@hairlab.ua — питання по замовленням' }] },
      { type: 'heading', level: 3, children: [{ type: 'text', text: 'Графік роботи' }] },
      { type: 'paragraph', children: [{ type: 'text', text: 'Пн-Пт: 9:00 - 18:00' }] },
      { type: 'paragraph', children: [{ type: 'text', text: 'Сб: 10:00 - 15:00' }] },
      { type: 'paragraph', children: [{ type: 'text', text: 'Нд: вихідний' }] },
      { type: 'heading', level: 3, children: [{ type: 'text', text: 'Соціальні мережі' }] },
      { type: 'paragraph', children: [{ type: 'text', text: 'Instagram: @hairlab.ua' }] },
      { type: 'paragraph', children: [{ type: 'text', text: 'Facebook: facebook.com/hairlab.ua' }] },
      { type: 'paragraph', children: [{ type: 'text', text: 'Telegram: t.me/hairlab_ua' }] },
    ],
    metaTitle: 'Контакти | HAIR LAB',
    metaDescription: 'Зв\'яжіться з HAIR LAB. Телефони, email, графік роботи. Консультації по вибору косметики для волосся.',
    isPublished: true,
  },
]

async function deleteAllPages() {
  console.log('🗑️  Видаляю старі сторінки...')

  const res = await fetch(`${STRAPI_URL}/api/pages`, {
    headers: { 'Authorization': `Bearer ${API_TOKEN}` }
  })
  const data = await res.json()

  for (const page of data.data || []) {
    await fetch(`${STRAPI_URL}/api/pages/${page.documentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    })
    console.log(`   Видалено: ${page.slug}`)
  }
}

async function createPages() {
  console.log('\n📄 Створюю нові сторінки...')

  for (const page of pages) {
    const res = await fetch(`${STRAPI_URL}/api/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: page }),
    })

    if (res.ok) {
      console.log(`   ✅ ${page.title} (/${page.slug})`)
    } else {
      const err = await res.json()
      console.log(`   ❌ ${page.title}: ${err.error?.message}`)
    }
  }
}

async function main() {
  console.log('🚀 Виправлення сторінок HAIR LAB\n')

  await deleteAllPages()
  await createPages()

  console.log('\n✅ Готово! Перевір: http://localhost:3100/pages/about')
}

main().catch(console.error)
