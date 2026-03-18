'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { BlogPost } from '@/lib/payload/types'
import { getImageUrl } from '@/lib/payload/types'
import { Calendar, User, ArrowRight } from 'lucide-react'
import { ensureGsapPlugins, prefersReducedMotion } from '@/lib/gsap'

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
  const sectionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!sectionRef.current || prefersReducedMotion()) return

    const { gsap } = ensureGsapPlugins()
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-blog-card]',
        { autoAlpha: 0, y: 34, rotateX: -6 },
        {
          autoAlpha: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power2.out',
          clearProps: 'transform',
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [posts.length])

  return (
    <div
      ref={sectionRef}
      className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
    >
      {posts.map((post, index) => {
        const imageUrl = getImageUrl(post.featuredImage)
        const isLeadCard = index === 0

        return (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            data-blog-card
            className={`group relative overflow-hidden rounded-[1.8rem] border border-black/8 bg-white/92 shadow-[0_24px_70px_rgba(16,24,40,0.08)] transition-transform duration-500 hover:-translate-y-1 ${
              isLeadCard ? 'xl:col-span-2 xl:grid xl:grid-cols-[minmax(0,1.08fr)_minmax(260px,0.92fr)]' : ''
            }`}
          >
            {imageUrl && (
              <div className={`overflow-hidden ${isLeadCard ? 'aspect-[16/10] xl:aspect-auto xl:h-full' : 'aspect-[16/10]'}`}>
                <Image
                  src={imageUrl}
                  alt={post.title}
                  width={900}
                  height={620}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            )}

            <div className={`p-5 ${isLeadCard ? 'xl:flex xl:flex-col xl:justify-between xl:p-8' : ''}`}>
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

              <h2 className={`mb-2 font-bold text-foreground transition-colors duration-300 group-hover:text-primary ${
                isLeadCard ? 'text-2xl leading-tight md:text-3xl' : 'text-lg'
              }`}>
                {post.title}
              </h2>

              {post.excerpt && (
                <p className={`mb-4 text-muted-foreground ${isLeadCard ? 'line-clamp-4 text-base leading-7' : 'line-clamp-3 text-sm'}`}>
                  {post.excerpt}
                </p>
              )}

              <div className={`flex items-center justify-between text-xs text-muted-foreground ${isLeadCard ? 'mt-6 border-t border-border pt-5' : ''}`}>
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
