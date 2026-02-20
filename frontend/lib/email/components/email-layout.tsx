import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hairlab.store'

interface EmailLayoutProps {
  preview: string
  children: React.ReactNode
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Link href={baseUrl} style={logoLink}>
              <Heading style={logoText}>HAIR LAB</Heading>
            </Link>
          </Section>

          {/* Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              HAIR LAB — Професійна косметика для волосся
            </Text>
            <Text style={footerLinks}>
              <Link href={baseUrl} style={footerLink}>Головна</Link>
              {' | '}
              <Link href={`${baseUrl}/shop`} style={footerLink}>Каталог</Link>
              {' | '}
              <Link href={`${baseUrl}/pages/delivery`} style={footerLink}>Доставка</Link>
            </Text>
            <Text style={footerSmall}>
              Ви отримали цей лист, тому що зробили замовлення на hairlab.store
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export function EmailButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={button}>
      {children}
    </Link>
  )
}

export function ProductRow({
  name,
  variant,
  quantity,
  price,
  imageUrl,
}: {
  name: string
  variant?: string
  quantity: number
  price: number
  imageUrl?: string
}) {
  return (
    <tr>
      <td style={productCell}>
        {imageUrl && (
          <Img src={imageUrl} alt={name} width={60} height={60} style={productImage} />
        )}
      </td>
      <td style={productInfo}>
        <Text style={productName}>{name}</Text>
        {variant && <Text style={productVariant}>{variant}</Text>}
        <Text style={productQty}>x{quantity}</Text>
      </td>
      <td style={productPrice}>
        <Text style={priceText}>{Math.round(price * quantity)} ₴</Text>
      </td>
    </tr>
  )
}

// ─── Styles ────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: '#f6f6f6',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: 0,
  padding: 0,
}

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
}

const header: React.CSSProperties = {
  backgroundColor: '#1a1a2e',
  padding: '24px 32px',
  textAlign: 'center' as const,
}

const logoLink: React.CSSProperties = {
  textDecoration: 'none',
}

const logoText: React.CSSProperties = {
  color: '#c9a96e',
  fontSize: '24px',
  fontWeight: 700,
  letterSpacing: '3px',
  margin: 0,
}

const content: React.CSSProperties = {
  padding: '32px',
}

const hr: React.CSSProperties = {
  borderColor: '#e6e6e6',
  margin: '0 32px',
}

const footer: React.CSSProperties = {
  padding: '24px 32px',
  textAlign: 'center' as const,
}

const footerText: React.CSSProperties = {
  color: '#666666',
  fontSize: '14px',
  margin: '0 0 8px',
}

const footerLinks: React.CSSProperties = {
  color: '#666666',
  fontSize: '13px',
  margin: '0 0 8px',
}

const footerLink: React.CSSProperties = {
  color: '#c9a96e',
  textDecoration: 'none',
}

const footerSmall: React.CSSProperties = {
  color: '#999999',
  fontSize: '11px',
  margin: '8px 0 0',
}

const button: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#c9a96e',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 600,
  padding: '14px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  textAlign: 'center' as const,
}

const productCell: React.CSSProperties = {
  padding: '8px 0',
  verticalAlign: 'top',
  width: '70px',
}

const productImage: React.CSSProperties = {
  borderRadius: '8px',
  objectFit: 'cover' as const,
}

const productInfo: React.CSSProperties = {
  padding: '8px 12px',
  verticalAlign: 'top',
}

const productName: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  margin: '0 0 2px',
  color: '#333333',
}

const productVariant: React.CSSProperties = {
  fontSize: '12px',
  color: '#666666',
  margin: '0 0 2px',
}

const productQty: React.CSSProperties = {
  fontSize: '12px',
  color: '#999999',
  margin: 0,
}

const productPrice: React.CSSProperties = {
  padding: '8px 0',
  verticalAlign: 'top',
  textAlign: 'right' as const,
}

const priceText: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#333333',
  margin: 0,
}
