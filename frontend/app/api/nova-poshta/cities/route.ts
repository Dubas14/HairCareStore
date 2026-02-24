import { NextRequest, NextResponse } from 'next/server'
import { searchCities, isNovaPoshtaConfigured } from '@/lib/shipping/nova-poshta'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') || ''

  if (q.length < 2) {
    return NextResponse.json({ cities: [], fallback: false })
  }

  const configured = await isNovaPoshtaConfigured()
  if (!configured) {
    return NextResponse.json({ cities: [], fallback: true })
  }

  const cities = await searchCities(q)
  return NextResponse.json({ cities, fallback: false })
}
