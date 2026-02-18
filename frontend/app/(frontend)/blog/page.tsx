export const dynamic = 'force-dynamic'

import { getBlogPosts } from '@/lib/payload/client'
import { BlogList } from '@/components/blog/blog-list'

export const metadata = {
  title: 'Блог | HAIR LAB',
  description: 'Корисні статті про догляд за волоссям, тренди та поради від експертів',
}

export default async function BlogPage() {
  const { posts } = await getBlogPosts({ limit: 20 })

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-muted/50 border-b">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 tracking-tight">
            Блог
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Корисні статті про догляд за волоссям, тренди та поради від експертів
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">Статті скоро з&apos;являться</p>
          </div>
        ) : (
          <BlogList posts={posts} />
        )}
      </div>
    </main>
  )
}
