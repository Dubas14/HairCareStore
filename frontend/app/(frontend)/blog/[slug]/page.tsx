import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { getBlogPostBySlug } from '@/lib/payload/client'
import { BlogArticle } from '@/components/blog/blog-article'
import { buildBlogPostingJsonLd } from '@/lib/structured-data'
import { getImageUrl } from '@/lib/payload/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const locale = await getLocale()
  const post = await getBlogPostBySlug(slug, locale)
  if (!post) return { title: 'Стаття не знайдена' }
  return {
    title: `${post.title} | Блог HAIR LAB`,
    description: post.excerpt || '',
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const locale = await getLocale()
  const post = await getBlogPostBySlug(slug, locale)

  if (!post) notFound()

  // BlogPosting schema — data is from trusted CMS (not user input), safe for JSON-LD
  const blogJsonLd = buildBlogPostingJsonLd({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    author: post.author,
    publishedAt: post.publishedAt,
    image: getImageUrl(post.featuredImage) || undefined,
  })

  return (
    <main className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: blogJsonLd }} />
      <BlogArticle post={post} />
    </main>
  )
}
