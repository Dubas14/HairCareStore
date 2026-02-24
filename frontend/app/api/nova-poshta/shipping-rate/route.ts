import { NextRequest, NextResponse } from 'next/server'
import { calculateShippingRate, isNovaPoshtaConfigured } from '@/lib/shipping/nova-poshta'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  const configured = await isNovaPoshtaConfigured()
  if (!configured) {
    return NextResponse.json({ rate: null, fallback: true })
  }

  let body: { recipientCityRef?: string; weight?: number; declaredValue?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ rate: null, fallback: true }, { status: 400 })
  }

  if (!body.recipientCityRef) {
    return NextResponse.json({ rate: null, fallback: true }, { status: 400 })
  }

  // Get sender city ref from ShippingConfig global
  let senderCityRef = ''
  let defaultWeight = 0.5
  try {
    const payload = await getPayload({ config })
    const shippingConfig = await payload.findGlobal({ slug: 'shipping-config' })
    const sc = shippingConfig as unknown as {
      novaPoshtaSender?: { cityRef?: string }
      defaultParcelWeight?: number
    }
    senderCityRef = sc.novaPoshtaSender?.cityRef || ''
    defaultWeight = sc.defaultParcelWeight || 0.5
  } catch {
    // Ignore — will use fallback
  }

  if (!senderCityRef) {
    return NextResponse.json({ rate: null, fallback: true })
  }

  const rate = await calculateShippingRate({
    senderCityRef,
    recipientCityRef: body.recipientCityRef,
    weight: body.weight || defaultWeight,
    declaredValue: body.declaredValue,
  })

  return NextResponse.json({ rate, fallback: !rate })
}
