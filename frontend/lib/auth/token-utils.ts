import crypto from 'crypto'

const TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

function getSecret(): string {
  return process.env.PAYLOAD_SECRET || 'default-secret-change-me-in-production'
}

export function signCustomerId(customerId: string): string {
  const timestamp = Date.now().toString(36)
  const data = `${customerId}.${timestamp}`
  const hmac = crypto.createHmac('sha256', getSecret())
  hmac.update(data)
  const signature = hmac.digest('hex')
  return `${data}.${signature}`
}

export function verifyCustomerId(value: string): string | null {
  const parts = value.split('.')
  if (parts.length !== 3) return null
  const [customerId, timestamp, signature] = parts

  // Verify HMAC
  const data = `${customerId}.${timestamp}`
  const hmac = crypto.createHmac('sha256', getSecret())
  hmac.update(data)
  const expectedSignature = hmac.digest('hex')
  if (signature !== expectedSignature) return null

  // Verify token age
  const tokenTime = parseInt(timestamp, 36)
  if (isNaN(tokenTime) || Date.now() - tokenTime > TOKEN_MAX_AGE_MS) return null

  return customerId
}
