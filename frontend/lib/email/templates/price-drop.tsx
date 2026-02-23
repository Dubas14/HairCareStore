import { Heading, Text, Img, Link, Section } from '@react-email/components'
import { EmailLayout, EmailButton } from '../components/email-layout'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hairlab.store'

interface PriceDropItem {
  title: string
  handle: string
  imageUrl?: string
  oldPrice: number
  newPrice: number
}

interface PriceDropEmailProps {
  customerName: string
  items: PriceDropItem[]
}

export function PriceDropEmail({ customerName, items }: PriceDropEmailProps) {
  return (
    <EmailLayout preview={`Ціна знижена на ${items.length} товар${items.length > 1 ? 'ів' : ''} з вашого списку бажань`}>
      <Heading style={heading}>
        Ціна знижена!
      </Heading>
      <Text style={text}>
        Привіт, {customerName}! Гарні новини — ціна на товари з вашого списку бажань знизилась:
      </Text>

      {items.map((item) => {
        const discount = Math.round(((item.oldPrice - item.newPrice) / item.oldPrice) * 100)
        return (
          <Section key={item.handle} style={productRow}>
            <table width="100%" cellPadding={0} cellSpacing={0}>
              <tr>
                <td style={imageCell}>
                  {item.imageUrl && (
                    <Img
                      src={item.imageUrl}
                      alt={item.title}
                      width={80}
                      height={80}
                      style={productImage}
                    />
                  )}
                </td>
                <td style={infoCell}>
                  <Link href={`${baseUrl}/products/${item.handle}`} style={productTitle}>
                    {item.title}
                  </Link>
                  <Text style={priceRow}>
                    <span style={oldPrice}>{Math.round(item.oldPrice)} &#8372;</span>
                    {' '}
                    <span style={newPrice}>{Math.round(item.newPrice)} &#8372;</span>
                    {' '}
                    <span style={badge}>-{discount}%</span>
                  </Text>
                </td>
              </tr>
            </table>
          </Section>
        )
      })}

      <Section style={ctaSection}>
        <EmailButton href={`${baseUrl}/account?tab=wishlist`}>
          Переглянути список бажань
        </EmailButton>
      </Section>

      <Text style={footerNote}>
        Поспішайте — ціни можуть змінитися!
      </Text>
    </EmailLayout>
  )
}

// ─── Styles ────────────────────────────────────────────────────

const heading: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 700,
  color: '#1a1a2e',
  margin: '0 0 12px',
}

const text: React.CSSProperties = {
  fontSize: '15px',
  color: '#333333',
  lineHeight: '1.6',
  margin: '0 0 20px',
}

const productRow: React.CSSProperties = {
  padding: '12px 0',
  borderBottom: '1px solid #eeeeee',
}

const imageCell: React.CSSProperties = {
  width: '90px',
  verticalAlign: 'top',
}

const productImage: React.CSSProperties = {
  borderRadius: '8px',
  objectFit: 'cover' as const,
}

const infoCell: React.CSSProperties = {
  paddingLeft: '12px',
  verticalAlign: 'middle',
}

const productTitle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#1a1a2e',
  textDecoration: 'none',
}

const priceRow: React.CSSProperties = {
  fontSize: '14px',
  margin: '6px 0 0',
}

const oldPrice: React.CSSProperties = {
  color: '#999999',
  textDecoration: 'line-through',
}

const newPrice: React.CSSProperties = {
  color: '#c9a96e',
  fontWeight: 700,
  fontSize: '16px',
}

const badge: React.CSSProperties = {
  backgroundColor: '#c9a96e',
  color: '#ffffff',
  fontSize: '11px',
  fontWeight: 600,
  padding: '2px 6px',
  borderRadius: '4px',
}

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '24px 0 8px',
}

const footerNote: React.CSSProperties = {
  fontSize: '13px',
  color: '#999999',
  textAlign: 'center' as const,
  margin: '8px 0 0',
}
