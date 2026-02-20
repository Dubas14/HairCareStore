import {
  Heading,
  Section,
  Text,
} from '@react-email/components'
import { EmailLayout, EmailButton } from '../components/email-layout'

interface ShippingNotificationProps {
  customerName: string
  orderNumber: number
  trackingNumber?: string
  carrier?: string
  trackingUrl?: string
  estimatedDelivery?: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hairlab.store'

export function ShippingNotification({
  customerName,
  orderNumber,
  trackingNumber,
  carrier = 'Нова Пошта',
  trackingUrl,
  estimatedDelivery,
}: ShippingNotificationProps) {
  return (
    <EmailLayout preview={`Замовлення #${orderNumber} відправлено`}>
      <Heading style={heading}>
        Ваше замовлення відправлено!
      </Heading>

      <Text style={paragraph}>
        Привіт, {customerName}! Замовлення <strong>#{orderNumber}</strong> передано службі доставки.
      </Text>

      <Section style={trackingSection}>
        <Text style={trackingLabel}>Служба доставки</Text>
        <Text style={trackingValue}>{carrier}</Text>

        {trackingNumber && (
          <>
            <Text style={trackingLabel}>Номер ТТН</Text>
            <Text style={trackingValue}>{trackingNumber}</Text>
          </>
        )}

        {estimatedDelivery && (
          <>
            <Text style={trackingLabel}>Очікувана дата доставки</Text>
            <Text style={trackingValue}>{estimatedDelivery}</Text>
          </>
        )}
      </Section>

      {trackingUrl && (
        <Section style={ctaSection}>
          <EmailButton href={trackingUrl}>
            Відстежити посилку
          </EmailButton>
        </Section>
      )}

      {!trackingUrl && trackingNumber && (
        <Section style={ctaSection}>
          <EmailButton href={`https://novaposhta.ua/tracking/?cargo_number=${trackingNumber}`}>
            Відстежити на Новій Пошті
          </EmailButton>
        </Section>
      )}

      <Text style={smallText}>
        Якщо у вас виникли питання — напишіть нам або зателефонуйте.
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

const trackingSection: React.CSSProperties = {
  backgroundColor: '#f8f8f8',
  borderRadius: '8px',
  padding: '20px 24px',
  margin: '0 0 24px',
}

const trackingLabel: React.CSSProperties = {
  fontSize: '12px',
  color: '#999999',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '12px 0 2px',
}

const trackingValue: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: '#333333',
  margin: '0 0 4px',
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
