import { Resend } from 'resend'
import { createLogger } from '@/lib/logger'

const log = createLogger('email')
const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'HAIR LAB <noreply@hairlab.store>'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  react: React.ReactElement
  replyTo?: string
  tags?: Array<{ name: string; value: string }>
}

export async function sendEmail(options: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    log.warn('RESEND_API_KEY not set, skipping email', options.subject)
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      react: options.react,
      replyTo: options.replyTo,
      tags: options.tags,
    })

    if (error) {
      log.error('Send failed', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    log.error('Unexpected error', err instanceof Error ? err : String(err))
    return { success: false, error: 'Unexpected email error' }
  }
}
