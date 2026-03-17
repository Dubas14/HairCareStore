import {
  Heading,
  Section,
  Text,
  Img,
} from '@react-email/components'
import { EmailLayout, EmailButton } from '../components/email-layout'

interface ReviewRequestItem {
  title: string
  handle: string
  imageUrl?: string
}

interface ReviewRequestProps {
  customerName: string
  orderNumber: number
  items: ReviewRequestItem[]
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hairlab.store'

export function ReviewRequest({
  customerName,
  orderNumber,
  items,
}: ReviewRequestProps) {
  return (
    <EmailLayout preview={`Як вам товари із замовлення #${orderNumber}?`}>
      <Heading style={heading}>
        Поділіться враженнями!
      </Heading>

      <Text style={paragraph}>
        Привіт, {customerName}! Сподіваємось, вам сподобались товари
        із замовлення <strong>#{orderNumber}</strong>.
      </Text>

      <Text style={paragraph}>
        Ваш відгук допоможе іншим покупцям зробити правильний вибір,
        а нам — стати кращими.
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
              <EmailButton href={`${baseUrl}/products/${item.handle}#reviews`}>
                Написати відгук
              </EmailButton>
            </div>
          </div>
        ))}
      </Section>

      <Text style={smallText}>
        Дякуємо за покупку в HAIR LAB!
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
  margin: '0 0 16px',
}

const productsSection: React.CSSProperties = {
  margin: '24px 0',
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
  margin: '0 0 8px',
}

const smallText: React.CSSProperties = {
  fontSize: '13px',
  color: '#999999',
  margin: '16px 0 0',
}
