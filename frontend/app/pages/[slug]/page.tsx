import { notFound } from 'next/navigation'
import { getPageBySlug, getPages } from '@/lib/strapi/client'
import { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Generate static paths for all pages
export async function generateStaticParams() {
  const pages = await getPages()
  return pages.map((page) => ({
    slug: page.slug,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)

  if (!page) {
    return { title: 'Сторінка не знайдена' }
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || '',
  }
}

// Render rich text content from Strapi
function RichTextBlock({ block }: { block: any }) {
  if (block.type === 'heading') {
    const Tag = `h${block.level}` as keyof JSX.IntrinsicElements
    const text = block.children?.map((c: any) => c.text).join('') || ''
    const className = block.level === 2
      ? 'text-3xl font-bold mt-8 mb-4'
      : 'text-xl font-semibold mt-6 mb-3'
    return <Tag className={className}>{text}</Tag>
  }

  if (block.type === 'paragraph') {
    const text = block.children?.map((c: any) => c.text).join('') || ''
    return <p className="mb-4 text-neutral-700 leading-relaxed">{text}</p>
  }

  return null
}

export default async function StaticPage({ params }: PageProps) {
  const { slug } = await params
  const page = await getPageBySlug(slug)

  if (!page) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">{page.title}</h1>

        <div className="prose prose-lg max-w-none">
          {page.content?.map((block: any, index: number) => (
            <RichTextBlock key={index} block={block} />
          ))}
        </div>
      </div>
    </main>
  )
}
