'use server'

import { z } from 'zod'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { checkRateLimit, recordAttempt } from '@/lib/rate-limiter'
import crypto from 'crypto'

const newsletterSchema = z.object({
  email: z.string().email('Будь ласка, введіть коректний email'),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Ви повинні погодитися з умовами'
  })
})

function generateConfirmToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

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

  try {
    const payload = await getPayload({ config })
    const email = validation.data.email

    // Check if already subscribed
    const existing = await payload.find({
      collection: 'subscribers',
      where: { email: { equals: email } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      const sub = existing.docs[0] as unknown as { id: string | number; status?: string }
      if (sub.status === 'unsubscribed') {
        // Re-subscribe with new confirmation
        const token = generateConfirmToken()
        await payload.update({
          collection: 'subscribers',
          id: sub.id,
          data: { status: 'pending', confirmToken: token },
        })
        // Send confirmation email
        const { sendNewsletterConfirmationEmail } = await import('@/lib/email/email-actions')
        sendNewsletterConfirmationEmail(email, token).catch(() => {})
        return { success: true, message: 'Перевірте вашу пошту для підтвердження підписки' }
      }
      if (sub.status === 'pending') {
        return { success: true, message: 'Ми вже надіслали лист з підтвердженням. Перевірте вашу пошту.' }
      }
      return { success: true, message: 'Ви вже підписані на розсилку' }
    }

    // Create new subscriber with pending status
    const token = generateConfirmToken()
    await payload.create({
      collection: 'subscribers',
      data: {
        email,
        status: 'pending',
        source: 'website',
        confirmToken: token,
      },
    })

    // Send confirmation email
    const { sendNewsletterConfirmationEmail } = await import('@/lib/email/email-actions')
    sendNewsletterConfirmationEmail(email, token).catch(() => {})

    return {
      success: true,
      message: 'Перевірте вашу пошту для підтвердження підписки'
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return {
      success: false,
      error: 'Помилка підписки. Спробуйте пізніше.'
    }
  }
}
