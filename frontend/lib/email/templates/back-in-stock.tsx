import {
  Heading,
  Section,
  Text,
  Img,
} from '@react-email/components'
import { EmailLayout, EmailButton } from '../components/email-layout'

interface BackInStockItem {
  title: string
  handle: string
  imageUrl?: string
  price: number
}

interface BackInStockProps {
  customerName: string
  items: BackInStockItem[]
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hairlab.store'

export function BackInStock({
  customerName,
  items,
}: BackInStockProps) {
  return (
    <EmailLayout preview={`${items[0]?.title || 'Товар'} знову в наявності!`}>
      <Heading style={heading}>
        Знову в наявності!
      </Heading>

      <Text style={paragraph}>
        Привіт, {customerName}! Чудові новини — товар{items.length > 1 ? 'и' : ''} з вашого
        списку бажань знову доступн{items.length > 1 ? 'і' : 'ий'} для замовлення.
      </Text>

      <Section style={productsSection}>
        {items.map((item, i) => (
          <div key={i} style={productRow}>
            {item.imageUrl && (
              <Img
                src={item.imageUrl}
                alt={item.title}
                width={60}
                height={60}
                style={productImage}
              />
            )}
            <div style={productInfo}>
              <Text style={productName}>{item.title}</Text>
              <Text style={productPrice}>{Math.round(item.price)} ₴</Text>
            </div>
          </div>
        ))}
      </Section>

      <Section style={ctaSection}>
        <EmailButton href={items.length === 1
          ? `${baseUrl}/products/${items[0].handle}`
          : `${baseUrl}/account?tab=wishlist`
        }>
          {items.length === 1 ? 'Переглянути товар' : 'Переглянути список бажань'}
        </EmailButton>
      </Section>

      <Text style={smallText}>
        Поспішіть — кількість обмежена!
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

const productsSection: React.CSSProperties = {
  margin: '0 0 24px',
}

const productRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 0',
  borderBottom: '1px solid #f0f0f0',
}

const productImage: React.CSSProperties = {
  borderRadius: '8px',
  objectFit: 'cover' as const,
}

const productInfo: React.CSSProperties = {
  flex: 1,
}

const productName: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#333333',
  margin: '0 0 4px',
}

const productPrice: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#2A9D8F',
  margin: 0,
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
