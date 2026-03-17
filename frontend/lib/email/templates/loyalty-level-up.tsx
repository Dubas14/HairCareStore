import {
  Heading,
  Section,
  Text,
} from '@react-email/components'
import { EmailLayout, EmailButton } from '../components/email-layout'

interface LoyaltyLevelUpProps {
  customerName: string
  newLevel: 'silver' | 'gold'
  pointsBalance: number
  multiplier: number
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hairlab.store'

const levelNames: Record<string, string> = {
  silver: 'Срібний',
  gold: 'Золотий',
}

const levelColors: Record<string, string> = {
  silver: '#C0C0C0',
  gold: '#FFD700',
}

export function LoyaltyLevelUp({
  customerName,
  newLevel,
  pointsBalance,
  multiplier,
}: LoyaltyLevelUpProps) {
  const levelName = levelNames[newLevel] || newLevel
  const levelColor = levelColors[newLevel] || '#c9a96e'

  return (
    <EmailLayout preview={`Вітаємо! Ви досягли ${levelName} рівня!`}>
      <Heading style={heading}>
        Вітаємо з підвищенням!
      </Heading>

      <Text style={paragraph}>
        Привіт, {customerName}! Ви досягли нового рівня в програмі лояльності HAIR LAB.
      </Text>

      <Section style={levelSection}>
        <Text style={{ ...levelBadge, backgroundColor: levelColor }}>
          {levelName} рівень
        </Text>
      </Section>

      <Section style={benefitsSection}>
        <Text style={benefitsTitle}>Ваші переваги:</Text>

        <Text style={benefitItem}>
          Множник нарахування балів: <strong>x{multiplier}</strong>
        </Text>
        <Text style={benefitItem}>
          Ваш баланс: <strong>{pointsBalance} балів</strong>
        </Text>
        {newLevel === 'gold' && (
          <Text style={benefitItem}>
            Максимальний множник — ви отримуєте найбільше балів за кожну покупку!
          </Text>
        )}
      </Section>

      <Section style={ctaSection}>
        <EmailButton href={`${baseUrl}/account`}>
          Переглянути бонуси
        </EmailButton>
      </Section>

      <Text style={smallText}>
        Дякуємо за довіру до HAIR LAB!
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

const levelSection: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const levelBadge: React.CSSProperties = {
  display: 'inline-block',
  fontSize: '18px',
  fontWeight: 700,
  color: '#1a1a2e',
  padding: '12px 32px',
  borderRadius: '40px',
  margin: 0,
}

const benefitsSection: React.CSSProperties = {
  backgroundColor: '#f8f8f8',
  borderRadius: '8px',
  padding: '20px 24px',
  margin: '0 0 24px',
}

const benefitsTitle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#333333',
  margin: '0 0 12px',
}

const benefitItem: React.CSSProperties = {
  fontSize: '14px',
  color: '#555555',
  margin: '0 0 8px',
  lineHeight: '22px',
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
