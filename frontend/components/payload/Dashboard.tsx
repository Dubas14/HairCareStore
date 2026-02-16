import React from 'react'
import './Dashboard.scss'

const collections = {
  content: [
    { slug: 'banners', label: 'Банери', icon: '🖼️', desc: 'Слайдери та промо-банери' },
    { slug: 'pages', label: 'Сторінки', icon: '📄', desc: 'Статичні сторінки сайту' },
    { slug: 'promo-blocks', label: 'Промо-блоки', icon: '🎯', desc: 'Рекламні блоки на головній' },
  ],
  catalog: [
    { slug: 'brands', label: 'Бренди', icon: '🏷️', desc: 'Бренди та виробники' },
    { slug: 'categories', label: 'Категорії', icon: '📂', desc: 'Категорії товарів' },
    { slug: 'blog-posts', label: 'Блог', icon: '✍️', desc: 'Статті та поради' },
  ],
  system: [
    { slug: 'media', label: 'Медіа', icon: '📷', desc: 'Зображення та файли' },
    { slug: 'reviews', label: 'Відгуки', icon: '⭐', desc: 'Відгуки клієнтів' },
    { slug: 'users', label: 'Користувачі', icon: '👤', desc: 'Адміністратори CMS' },
  ],
}

const Dashboard = () => {
  return (
    <div className="hairlab-dashboard">
      <div className="hairlab-dashboard__header">
        <h2>HAIR LAB CMS</h2>
        <p>Керування контентом інтернет-магазину професійної косметики для волосся</p>
      </div>

      <Section title="Контент сайту" items={collections.content} />
      <Section title="Каталог" items={collections.catalog} />
      <Section title="Система" items={collections.system} />
    </div>
  )
}

function Section({ title, items }: { title: string; items: typeof collections.content }) {
  return (
    <div className="hairlab-dashboard__section">
      <h3>{title}</h3>
      <div className="hairlab-dashboard__grid">
        {items.map((item) => (
          <a
            key={item.slug}
            href={`/admin/collections/${item.slug}`}
            className="hairlab-dashboard__card"
          >
            <div className="hairlab-dashboard__card-icon">{item.icon}</div>
            <div className="hairlab-dashboard__card-info">
              <h4>{item.label}</h4>
              <p>{item.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
