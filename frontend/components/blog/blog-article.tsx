import Link from 'next/link'
import type { BlogPost } from '@/lib/payload/types'
import { getImageUrl } from '@/lib/payload/types'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Calendar, User, ArrowLeft } from 'lucide-react'
import { RichText } from '@/components/blog/rich-text'

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

interface BlogArticleProps {
  post: BlogPost
}

export function BlogArticle({ post }: BlogArticleProps) {
  const imageUrl = getImageUrl(post.featuredImage)

  return (
    <>
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb
          items={[
            { label: 'Блог', href: '/blog' },
            { label: post.title },
          ]}
        />
      </div>

      <article className="container mx-auto px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8">
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((t, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary"
                  >
                    {t.tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {post.author && (
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {post.author}
                </span>
              )}
              {post.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.publishedAt)}
                </span>
              )}
            </div>
          </header>

          {imageUrl && (
            <div className="aspect-[16/9] rounded-card overflow-hidden mb-8">
              <img
                src={imageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            {post.content ? (
              <RichText content={post.content} />
            ) : post.excerpt ? (
              <p className="text-muted-foreground">{post.excerpt}</p>
            ) : null}
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Повернутись до блогу
            </Link>
          </div>
        </div>
      </article>
    </>
  )
}
