import {
  Heading,
  Section,
  Text,
} from '@react-email/components'
import { EmailLayout, EmailButton } from '../components/email-layout'

interface EmailVerificationProps {
  customerName: string
  verificationUrl: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hairlab.store'

export function EmailVerification({ customerName, verificationUrl }: EmailVerificationProps) {
  return (
    <EmailLayout preview="Підтвердіть вашу email-адресу — HAIR LAB">
      <Heading style={heading}>
        Підтвердіть вашу email-адресу
      </Heading>

      <Text style={paragraph}>
        Вітаємо, {customerName}! Дякуємо за реєстрацію в HAIR LAB.
      </Text>

      <Text style={paragraph}>
        Натисніть кнопку нижче, щоб підтвердити вашу email-адресу та активувати акаунт:
      </Text>

      <Section style={ctaSection}>
        <EmailButton href={verificationUrl}>
          Підтвердити email
        </EmailButton>
      </Section>

      <Text style={note}>
        Посилання дійсне протягом 24 годин. Якщо ви не реєструвалися в HAIR LAB, просто проігноруйте цей лист.
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
  margin: '0 0 20px',
}

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const note: React.CSSProperties = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#888888',
  margin: '20px 0 0',
}
