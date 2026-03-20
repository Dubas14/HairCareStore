import { NextRequest, NextResponse } from 'next/server'
import { resetPassword } from '@/lib/payload/auth-actions'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()
    if (!token || !password) {
      return NextResponse.json({ success: false, error: 'Невірні дані' }, { status: 400 })
    }

    const result = await resetPassword(token, password)
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('Reset password error:', err)
    return NextResponse.json({ success: false, error: 'Помилка сервера' }, { status: 500 })
  }
}
