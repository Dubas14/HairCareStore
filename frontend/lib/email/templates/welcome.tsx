import {
  Heading,
  Section,
  Text,
} from '@react-email/components'
import { EmailLayout, EmailButton } from '../components/email-layout'

interface WelcomeProps {
  customerName: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hairlab.store'

export function Welcome({ customerName }: WelcomeProps) {
  return (
    <EmailLayout preview="Вітаємо в HAIR LAB!">
      <Heading style={heading}>
        Вітаємо, {customerName}!
      </Heading>

      <Text style={paragraph}>
        Дякуємо за реєстрацію в HAIR LAB. Тепер ви маєте доступ до:
      </Text>

      <Section style={features}>
        <Text style={featureItem}>Історія всіх замовлень</Text>
        <Text style={featureItem}>Програма лояльності та бонуси</Text>
        <Text style={featureItem}>Збережений список бажань</Text>
        <Text style={featureItem}>Швидке оформлення замовлень</Text>
      </Section>

      <Text style={paragraph}>
        Перегляньте наш каталог професійної косметики для волосся та знайдіть ідеальний догляд для себе.
      </Text>

      <Section style={ctaSection}>
        <EmailButton href={`${baseUrl}/shop`}>
          Перейти до каталогу
        </EmailButton>
      </Section>
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

const features: React.CSSProperties = {
  backgroundColor: '#f8f8f8',
  borderRadius: '8px',
  padding: '16px 24px',
  margin: '0 0 20px',
}

const featureItem: React.CSSProperties = {
  fontSize: '14px',
  color: '#333333',
  margin: '6px 0',
  paddingLeft: '16px',
  borderLeft: '3px solid #c9a96e',
}

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '24px 0 0',
}
