import { notFound } from 'next/navigation'
import { getBlogPostBySlug } from '@/lib/payload/client'
import { BlogArticle } from '@/components/blog/blog-article'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) return { title: 'Стаття не знайдена' }
  return {
    title: `${post.title} | Блог HAIR LAB`,
    description: post.excerpt || '',
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) notFound()

  return (
    <main className="min-h-screen bg-background">
      <BlogArticle post={post} />
    </main>
  )
}
