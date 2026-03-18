'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { BlogPost } from '@/lib/payload/types'
import { getImageUrl } from '@/lib/payload/types'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Calendar, User, ArrowLeft } from 'lucide-react'
import { RichText } from '@/components/blog/rich-text'
import { ensureGsapPlugins, prefersReducedMotion } from '@/lib/gsap'

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
  const articleRef = useRef<HTMLElement | null>(null)
  const imageUrl = getImageUrl(post.featuredImage)

  useEffect(() => {
    if (!articleRef.current || prefersReducedMotion()) return

    const { gsap, ScrollTrigger } = ensureGsapPlugins()
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-blog-article-intro], [data-blog-image], [data-blog-content], [data-blog-back]',
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.82,
          ease: 'power2.out',
          stagger: 0.1,
        }
      )

      const image = articleRef.current?.querySelector('[data-blog-image-media]')
      if (image) {
        gsap.to(image, {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: image,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      }

      ScrollTrigger.create({
        trigger: articleRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          gsap.to('[data-reading-progress]', {
            scaleX: self.progress,
            duration: 0.12,
            overwrite: 'auto',
            transformOrigin: 'left center',
          })
        },
      })
    }, articleRef)

    return () => ctx.revert()
  }, [post.id])

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 h-1 bg-transparent">
        <div
          data-reading-progress
          className="h-full origin-left scale-x-0 bg-[linear-gradient(90deg,#1f2a20,#8aa17f)]"
        />
      </div>

      <div className="container mx-auto px-4 py-4">
        <Breadcrumb
          items={[
            { label: 'Блог', href: '/blog' },
            { label: post.title },
          ]}
        />
      </div>

      <article
        ref={articleRef}
        className="container mx-auto px-4 pb-16"
      >
        <div className="mx-auto max-w-4xl">
          <header
            data-blog-article-intro
            className="rounded-[2rem] border border-black/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,239,227,0.92))] px-6 py-8 shadow-[0_28px_80px_rgba(16,24,40,0.08)] md:px-10"
          >
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

            <h1 className="text-3xl font-semibold leading-[0.94] tracking-[-0.06em] text-foreground md:text-5xl">
              {post.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
            <div
              data-blog-image
              className="mt-8 overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_26px_70px_rgba(16,24,40,0.08)]"
            >
              <Image
                data-blog-image-media
                src={imageUrl}
                alt={post.title}
                width={1600}
                height={900}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          )}

          <div
            data-blog-content
            className="mt-8 rounded-[2rem] border border-black/8 bg-white/95 px-6 py-8 shadow-[0_28px_80px_rgba(16,24,40,0.08)] md:px-10"
          >
            <div className="prose prose-lg max-w-none">
            {post.content ? (
              <RichText content={post.content} />
            ) : post.excerpt ? (
              <p className="text-muted-foreground">{post.excerpt}</p>
            ) : null}
            </div>
          </div>

          <div data-blog-back className="mt-12 pt-2">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-primary shadow-[0_10px_24px_rgba(16,24,40,0.06)] transition-transform hover:-translate-y-0.5"
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
