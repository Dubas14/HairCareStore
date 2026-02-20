/**
 * Helpers for generating JSON-LD structured data
 * All data comes from trusted server-side CMS — no user input
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3200'

export function buildItemListJsonLd(
  name: string,
  items: Array<{ name: string; url: string; position: number; image?: string; price?: number; currency?: string }>
): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      item: {
        '@type': 'Product',
        name: item.name,
        url: item.url,
        ...(item.image && { image: item.image }),
        ...(item.price && {
          offers: {
            '@type': 'Offer',
            price: item.price,
            priceCurrency: item.currency || 'UAH',
            availability: 'https://schema.org/InStock',
          },
        }),
      },
    })),
  })
}

export function buildBlogPostingJsonLd(post: {
  title: string
  slug: string
  excerpt?: string
  author?: string
  publishedAt?: string
  image?: string
}): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    url: `${BASE_URL}/blog/${post.slug}`,
    ...(post.excerpt && { description: post.excerpt }),
    ...(post.image && { image: post.image }),
    ...(post.author && {
      author: { '@type': 'Person', name: post.author },
    }),
    ...(post.publishedAt && { datePublished: post.publishedAt }),
    publisher: {
      '@type': 'Organization',
      name: 'HAIR LAB',
      url: BASE_URL,
    },
  })
}

export function buildFaqJsonLd(
  items: Array<{ question: string; answer: string }>
): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  })
}

export function buildSiteNavigationJsonLd(
  items: Array<{ name: string; url: string }>
): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: 'Main Navigation',
    hasPart: items.map((item) => ({
      '@type': 'SiteNavigationElement',
      name: item.name,
      url: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  })
}

export function buildWebSiteJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'HAIR LAB',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/shop?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  })
}
