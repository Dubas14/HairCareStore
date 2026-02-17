'use client'

import Link from 'next/link'
import { useInView } from 'react-intersection-observer'
import type { BlogPost } from '@/lib/payload/types'
import { getImageUrl } from '@/lib/payload/types'
import { Calendar, User, ArrowRight } from 'lucide-react'

interface BlogListProps {
  posts: BlogPost[]
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function BlogList({ posts }: BlogListProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {posts.map((post, index) => {
        const imageUrl = getImageUrl(post.featuredImage)

        return (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className={`group bg-card rounded-card overflow-hidden shadow-soft card-hover border border-border ${
              inView ? 'animate-fadeInUp' : 'opacity-0'
            }`}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {imageUrl && (
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}

            <div className="p-5">
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.slice(0, 3).map((t, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary"
                    >
                      {t.tag}
                    </span>
                  ))}
                </div>
              )}

              <h2 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                {post.title}
              </h2>

              {post.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  {post.author && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {post.author}
                    </span>
                  )}
                  {post.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(post.publishedAt)}
                    </span>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
