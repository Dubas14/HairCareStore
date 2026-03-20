import { NextRequest, NextResponse } from 'next/server'
import { requestPasswordReset } from '@/lib/payload/auth-actions'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email обовʼязковий' }, { status: 400 })
    }

    const result = await requestPasswordReset(email)
    return NextResponse.json(result)
  } catch {
    // Always return success to not reveal errors
    return NextResponse.json({ success: true })
  }
}
