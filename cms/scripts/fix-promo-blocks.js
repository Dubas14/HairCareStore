/**
 * Fix promo blocks with correct UTF-8 encoding
 * Run: node scripts/fix-promo-blocks.js
 */

const STRAPI_URL = 'http://localhost:1337'
const API_TOKEN = '9b6fe52b9eb438bab05fa6711febd4608a7c2b165e4ba77575cb042b2fde6139212ae0d0f8247e6d5ccd7cd4ebb0702d4887d60064caf1b906561ed4886c6abb44d6c18438dccaefa71ad232c560782e26c3c9c848f12d0ca5aea118f3e81ae18e86520cbabd00062b2cad15972917de7750254ad5187346b7e2a74f06cbf041'

const promoBlocks = [
  {
    title: 'Безкоштовна доставка',
    description: 'При замовленні від 1500 грн доставка Новою Поштою безкоштовна!',
    buttonText: 'Замовити зараз',
    buttonLink: '/shop',
    backgroundColor: '#1a1a1a',
    isActive: true,
  },
  {
    title: '-20% на перше замовлення',
    description: 'Використовуй промокод WELCOME15 та отримай знижку на свою першу покупку!',
    buttonText: 'Отримати знижку',
    buttonLink: '/register',
    backgroundColor: '#7c3aed',
    isActive: true,
  },
  {
    title: 'Консультація стиліста',
    description: 'Не знаєш що обрати? Наші стилісти допоможуть підібрати ідеальний догляд для твого волосся.',
    buttonText: 'Замовити дзвінок',
    buttonLink: '/contacts',
    backgroundColor: '#059669',
    isActive: true,
  },
]

async function deleteAllPromoBlocks() {
  console.log('🗑️  Видаляю старі промо-блоки...')

  const res = await fetch(`${STRAPI_URL}/api/promo-blocks`, {
    headers: { 'Authorization': `Bearer ${API_TOKEN}` }
  })
  const data = await res.json()

  for (const block of data.data || []) {
    await fetch(`${STRAPI_URL}/api/promo-blocks/${block.documentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    })
    console.log(`   Видалено: ${block.id}`)
  }
}

async function createPromoBlocks() {
  console.log('\n📦 Створюю нові промо-блоки...')

  for (const block of promoBlocks) {
    const res = await fetch(`${STRAPI_URL}/api/promo-blocks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: block }),
    })

    if (res.ok) {
      console.log(`   ✅ ${block.title}`)
    } else {
      const err = await res.json()
      console.log(`   ❌ ${block.title}: ${err.error?.message}`)
    }
  }
}

async function main() {
  console.log('🚀 Виправлення промо-блоків HAIR LAB\n')

  await deleteAllPromoBlocks()
  await createPromoBlocks()

  console.log('\n✅ Готово! Перезавантаж головну сторінку.')
}

main().catch(console.error)
