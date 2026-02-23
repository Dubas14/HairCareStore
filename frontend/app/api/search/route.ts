import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { PayloadProduct } from '@/lib/payload/types'
import { getImageUrl } from '@/lib/payload/types'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const query = searchParams.get('q')?.trim()
  const limit = Math.min(Number(searchParams.get('limit')) || 8, 20)
  const locale = searchParams.get('locale') || 'uk'

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [], count: 0 })
  }

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'products',
      where: {
        and: [
          { status: { equals: 'active' } },
          {
            or: [
              { title: { contains: query } },
              { subtitle: { contains: query } },
            ],
          },
        ],
      },
      limit,
      depth: 1,
      locale: locale as 'uk' | 'en' | 'pl' | 'de' | 'ru',
    })

    const results = result.docs.map((doc: any) => {
      const product = doc as unknown as PayloadProduct
      const price = product.variants?.[0]?.price || 0
      const compareAtPrice = product.variants?.[0]?.compareAtPrice
      return {
        id: product.id,
        title: product.title,
        handle: product.handle,
        subtitle: product.subtitle || null,
        thumbnailUrl: getImageUrl(product.thumbnail),
        price: Math.round(price),
        compareAtPrice: compareAtPrice ? Math.round(compareAtPrice) : null,
      }
    })

    return NextResponse.json({
      results,
      count: result.totalDocs,
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ results: [], count: 0 }, { status: 500 })
  }
}
