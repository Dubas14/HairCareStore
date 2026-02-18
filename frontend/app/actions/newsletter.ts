'use server'

import { z } from 'zod'

const newsletterSchema = z.object({
  email: z.string().email('Будь ласка, введіть коректний email'),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Ви повинні погодитися з умовами'
  })
})

export async function subscribeToNewsletter(formData: FormData) {
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
