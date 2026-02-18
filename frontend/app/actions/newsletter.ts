'use server'

import { z } from 'zod'
import { headers } from 'next/headers'
import { checkRateLimit, recordAttempt } from '@/lib/rate-limiter'

const newsletterSchema = z.object({
  email: z.string().email('Будь ласка, введіть коректний email'),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Ви повинні погодитися з умовами'
  })
})

export async function subscribeToNewsletter(formData: FormData) {
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
  const rl = checkRateLimit(ip, 'newsletter')
  if (!rl.allowed) {
    return { success: false, error: 'Забагато спроб. Спробуйте пізніше.' }
  }
  recordAttempt(ip, 'newsletter')

  const rawData = {
    email: formData.get('email'),
    consent: formData.get('consent') === 'on'
  }

  const validation = newsletterSchema.safeParse(rawData)

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message
    }
  }

  // TODO: Integrate with email service (SendGrid/Resend)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    success: true,
    message: 'Дякуємо! Перевірте вашу пошту'
  }
}
