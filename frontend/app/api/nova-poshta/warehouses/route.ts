import { NextRequest, NextResponse } from 'next/server'
import { getWarehouses, isNovaPoshtaConfigured } from '@/lib/shipping/nova-poshta'

export async function GET(request: NextRequest) {
  const cityRef = request.nextUrl.searchParams.get('cityRef') || ''
  const q = request.nextUrl.searchParams.get('q') || ''

  if (!cityRef) {
    return NextResponse.json({ warehouses: [], fallback: false }, { status: 400 })
  }

  const configured = await isNovaPoshtaConfigured()
  if (!configured) {
    return NextResponse.json({ warehouses: [], fallback: true })
  }

  const warehouses = await getWarehouses(cityRef, q || undefined)
  return NextResponse.json({ warehouses, fallback: false })
}
