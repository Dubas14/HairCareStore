import {
  Heading,
  Section,
  Text,
} from '@react-email/components'
import { EmailLayout, EmailButton } from '../components/email-layout'

interface PasswordResetProps {
  customerName: string
  resetUrl: string
}

export function PasswordReset({ customerName, resetUrl }: PasswordResetProps) {
  return (
    <EmailLayout preview="Скидання пароля — HAIR LAB">
      <Heading style={heading}>
        Скидання пароля
      </Heading>

      <Text style={paragraph}>
        Вітаємо, {customerName}! Ми отримали запит на скидання пароля вашого акаунту в HAIR LAB.
      </Text>

      <Text style={paragraph}>
        Натисніть кнопку нижче, щоб встановити новий пароль:
      </Text>

      <Section style={ctaSection}>
        <EmailButton href={resetUrl}>
          Скинути пароль
        </EmailButton>
      </Section>

      <Text style={note}>
        Посилання дійсне протягом 1 години. Якщо ви не запитували скидання пароля, просто проігноруйте цей лист — ваш пароль залишиться без змін.
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
