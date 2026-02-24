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

/** Fire-and-forget: increment totalSent counter in email-settings global */
async function incrementEmailStats() {
  try {
    const { getPayload } = await import('payload')
    const cfg = (await import('@payload-config')).default
    const payload = await getPayload({ config: cfg })
    const current = await payload.findGlobal({ slug: 'email-settings' })
    const stats = current.stats as { totalSent?: number } | undefined
    await payload.updateGlobal({
      slug: 'email-settings',
      data: {
        stats: {
          totalSent: (stats?.totalSent || 0) + 1,
          lastSentAt: new Date().toISOString(),
        },
      },
    })
  } catch {
    // non-critical — don't block email delivery
  }
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

    // Fire-and-forget stats update
    if (data?.id) {
      incrementEmailStats()
    }

    return { success: true, id: data?.id }
  } catch (err) {
    log.error('Unexpected error', err instanceof Error ? err : String(err))
    return { success: false, error: 'Unexpected email error' }
  }
}
