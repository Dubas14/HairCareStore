export const revalidate = 300 // ISR: revalidate every 5 minutes

import { getBlogPosts } from '@/lib/payload/client'
import { BlogList } from '@/components/blog/blog-list'

export const metadata = {
  title: 'Блог | HAIR LAB',
  description: 'Корисні статті про догляд за волоссям, тренди та поради від експертів',
}

export default async function BlogPage() {
  const { posts } = await getBlogPosts({ limit: 20 })

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4eee6_0%,#fbf7f2_30%,#ffffff_100%)]">
      <div className="border-b border-black/6 bg-white/60">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-black/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,239,227,0.92))] px-6 py-8 shadow-[0_28px_80px_rgba(16,24,40,0.08)] md:px-10 md:py-10">
            <p className="w-fit rounded-full border border-black/10 bg-white/75 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-foreground/48">
              Блог
            </p>
            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(260px,0.92fr)] lg:items-end">
              <div>
                <h1 className="text-4xl font-semibold tracking-[-0.06em] text-foreground md:text-5xl lg:text-6xl">
                  Блог про догляд, формули та звички, які реально працюють.
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
                  Корисні статті про догляд за волоссям, тренди, інгредієнти та поради від експертів HAIR LAB.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[1.5rem] border border-black/8 bg-white/80 p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-foreground/45">Статей</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{posts.length}</p>
                  <p className="mt-1 text-sm text-muted-foreground">підбірки, гіди та поради</p>
                </div>
                <div className="rounded-[1.5rem] border border-black/8 bg-white/80 p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-foreground/45">Теми</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">Догляд</p>
                  <p className="mt-1 text-sm text-muted-foreground">інгредієнти, формули, рутини</p>
                </div>
                <div className="rounded-[1.5rem] border border-black/8 bg-white/80 p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-foreground/45">Від експертів</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">HAIR LAB</p>
                  <p className="mt-1 text-sm text-muted-foreground">перевірені рекомендації</p>
                </div>
              </div>
            </div>
          </div>
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
