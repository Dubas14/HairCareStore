import {
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components'
import { EmailLayout, EmailButton, ProductRow } from '../components/email-layout'

interface OrderItem {
  name: string
  variant?: string
  quantity: number
  price: number
  imageUrl?: string
}

interface OrderConfirmationProps {
  customerName: string
  orderNumber: number
  items: OrderItem[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  currency?: string
  shippingCity?: string
  shippingWarehouse?: string
  paymentMethod: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hairlab.store'

export function OrderConfirmation({
  customerName,
  orderNumber,
  items,
  subtotal,
  shipping,
  discount,
  total,
  currency = 'UAH',
  shippingCity,
  shippingWarehouse,
  paymentMethod,
}: OrderConfirmationProps) {
  const currencySymbol = currency === 'UAH' ? '₴' : currency === 'EUR' ? '€' : currency === 'PLN' ? 'zł' : '$'

  return (
    <EmailLayout preview={`Замовлення #${orderNumber} підтверджено`}>
      <Heading style={heading}>
        Дякуємо за замовлення!
      </Heading>

      <Text style={paragraph}>
        Привіт, {customerName}! Ваше замовлення <strong>#{orderNumber}</strong> успішно оформлено.
        Очікуйте дзвінок від менеджера для підтвердження.
      </Text>

      {/* Order Items */}
      <Section style={orderSection}>
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
      </Section>

      <Hr style={hr} />

      {/* Totals */}
      <Section style={totals}>
        <table style={totalsTable} cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td style={totalLabel}>Підсумок</td>
              <td style={totalValue}>{Math.round(subtotal)} {currencySymbol}</td>
            </tr>
            <tr>
              <td style={totalLabel}>Доставка</td>
              <td style={totalValue}>{shipping > 0 ? `${Math.round(shipping)} ${currencySymbol}` : 'Безкоштовно'}</td>
            </tr>
            {discount > 0 && (
              <tr>
                <td style={totalLabel}>Знижка</td>
                <td style={{ ...totalValue, color: '#22c55e' }}>-{Math.round(discount)} {currencySymbol}</td>
              </tr>
            )}
            <tr>
              <td style={totalLabelBold}>Разом</td>
              <td style={totalValueBold}>{Math.round(total)} {currencySymbol}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Hr style={hr} />

      {/* Shipping & Payment Info */}
      <Section>
        {shippingCity && (
          <Text style={infoRow}>
            <span style={infoLabel}>Місто:</span> {shippingCity}
          </Text>
        )}
        {shippingWarehouse && (
          <Text style={infoRow}>
            <span style={infoLabel}>Відділення:</span> {shippingWarehouse}
          </Text>
        )}
        <Text style={infoRow}>
          <span style={infoLabel}>Оплата:</span> {paymentMethod}
        </Text>
      </Section>

      {/* CTA */}
      <Section style={ctaSection}>
        <EmailButton href={`${baseUrl}/shop`}>
          Продовжити покупки
        </EmailButton>
      </Section>
    </EmailLayout>
  )
}

// Styles
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

const orderSection: React.CSSProperties = {
  margin: '0 0 16px',
}

const table: React.CSSProperties = {
  width: '100%',
}

const hr: React.CSSProperties = {
  borderColor: '#e6e6e6',
  margin: '16px 0',
}

const totals: React.CSSProperties = {
  margin: '0',
}

const totalsTable: React.CSSProperties = {
  width: '100%',
}

const totalLabel: React.CSSProperties = {
  fontSize: '14px',
  color: '#666666',
  padding: '4px 0',
}

const totalValue: React.CSSProperties = {
  fontSize: '14px',
  color: '#333333',
  textAlign: 'right' as const,
  padding: '4px 0',
}

const totalLabelBold: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#1a1a2e',
  padding: '8px 0 4px',
  borderTop: '1px solid #e6e6e6',
}

const totalValueBold: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#1a1a2e',
  textAlign: 'right' as const,
  padding: '8px 0 4px',
  borderTop: '1px solid #e6e6e6',
}

const infoRow: React.CSSProperties = {
  fontSize: '14px',
  color: '#333333',
  margin: '4px 0',
}

const infoLabel: React.CSSProperties = {
  color: '#666666',
}

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '32px 0 0',
}
