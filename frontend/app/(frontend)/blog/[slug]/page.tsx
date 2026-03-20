import { notFound } from 'next/navigation'
import { getBlogPostBySlug, getBlogPosts } from '@/lib/payload/client'
import { BlogArticle } from '@/components/blog/blog-article'
import { buildBlogPostingJsonLd } from '@/lib/structured-data'
import { getImageUrl } from '@/lib/payload/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const { posts } = await getBlogPosts({ limit: 50 })
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) return { title: 'Стаття не знайдена' }
  const title = `${post.title} | Блог HAIR LAB`
  const description = post.excerpt || ''
  const imageUrl = getImageUrl(post.featuredImage) || undefined
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      ...(imageUrl && { images: [{ url: imageUrl }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

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
