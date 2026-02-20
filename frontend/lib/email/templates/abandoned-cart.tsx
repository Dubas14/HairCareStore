import {
  Heading,
  Section,
  Text,
} from '@react-email/components'
import { EmailLayout, EmailButton, ProductRow } from '../components/email-layout'

interface CartItem {
  name: string
  variant?: string
  quantity: number
  price: number
  imageUrl?: string
}

interface AbandonedCartProps {
  customerName?: string
  items: CartItem[]
  total: number
  currency?: string
  promoCode?: string
  promoDiscount?: number
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hairlab.store'

export function AbandonedCart({
  customerName,
  items,
  total,
  currency = 'UAH',
  promoCode,
  promoDiscount,
}: AbandonedCartProps) {
  const currencySymbol = currency === 'UAH' ? '₴' : currency === 'EUR' ? '€' : currency === 'PLN' ? 'zł' : '$'
  const greeting = customerName ? `Привіт, ${customerName}!` : 'Привіт!'

  return (
    <EmailLayout preview="Ви забули завершити замовлення">
      <Heading style={heading}>
        Ви забули дещо в кошику
      </Heading>

      <Text style={paragraph}>
        {greeting} Схоже, ви не завершили замовлення. Ваші товари все ще чекають на вас:
      </Text>

      {/* Cart Items */}
      <Section style={cartSection}>
        <table style={table} cellPadding={0} cellSpacing={0}>
          <tbody>
            {items.map((item, i) => (
              <ProductRow
                key={i}
                name={item.name}
                variant={item.variant}
                quantity={item.quantity}
                price={item.price}
                imageUrl={item.imageUrl}
              />
            ))}
          </tbody>
        </table>

        <Text style={totalText}>
          Разом: <strong>{Math.round(total)} {currencySymbol}</strong>
        </Text>
      </Section>

      {/* Promo Code */}
      {promoCode && (
        <Section style={promoSection}>
          <Text style={promoTitle}>Спеціальна пропозиція для вас!</Text>
          <Text style={promoCode_style}>
            Використайте код <strong>{promoCode}</strong> та отримайте знижку {promoDiscount}%
          </Text>
        </Section>
      )}

      <Section style={ctaSection}>
        <EmailButton href={`${baseUrl}/checkout`}>
          Завершити замовлення
        </EmailButton>
      </Section>

      <Text style={smallText}>
        Кількість товарів обмежена. Не зволікайте!
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

const cartSection: React.CSSProperties = {
  backgroundColor: '#f8f8f8',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 0 24px',
}

const table: React.CSSProperties = {
  width: '100%',
}

const totalText: React.CSSProperties = {
  fontSize: '16px',
  color: '#333333',
  margin: '16px 0 0',
  textAlign: 'right' as const,
  borderTop: '1px solid #e6e6e6',
  paddingTop: '12px',
}

const promoSection: React.CSSProperties = {
  backgroundColor: '#fff9e6',
  border: '1px dashed #c9a96e',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const promoTitle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#c9a96e',
  margin: '0 0 4px',
}

const promoCode_style: React.CSSProperties = {
  fontSize: '14px',
  color: '#333333',
  margin: 0,
}

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const smallText: React.CSSProperties = {
  fontSize: '13px',
  color: '#999999',
  textAlign: 'center' as const,
  margin: 0,
}
