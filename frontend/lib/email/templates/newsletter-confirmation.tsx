import {
  Heading,
  Section,
  Text,
} from '@react-email/components'
import { EmailLayout, EmailButton } from '../components/email-layout'

interface NewsletterConfirmationProps {
  confirmUrl: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hairlab.store'

export function NewsletterConfirmation({
  confirmUrl,
}: NewsletterConfirmationProps) {
  return (
    <EmailLayout preview="Підтвердіть підписку на розсилку HAIR LAB">
      <Heading style={heading}>
        Підтвердіть підписку
      </Heading>

      <Text style={paragraph}>
        Ви підписались на розсилку HAIR LAB. Для підтвердження підписки натисніть кнопку нижче.
      </Text>

      <Section style={ctaSection}>
        <EmailButton href={confirmUrl}>
          Підтвердити підписку
        </EmailButton>
      </Section>

      <Text style={smallText}>
        Якщо ви не підписувались на розсилку, просто проігноруйте цей лист.
      </Text>
    </EmailLayout>
  )
}

const heading: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 700,
  color: '#1a1a2e',
  margin: '0 0 16px',
}

const paragraph: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#333333',
  margin: '0 0 24px',
}

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const smallText: React.CSSProperties = {
  fontSize: '13px',
  color: '#999999',
  margin: '16px 0 0',
}
