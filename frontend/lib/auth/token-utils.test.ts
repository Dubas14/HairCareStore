import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { signCustomerId, verifyCustomerId } from './token-utils'

describe('token-utils', () => {
  const originalEnv = process.env.PAYLOAD_SECRET

  beforeEach(() => {
    process.env.PAYLOAD_SECRET = 'test-secret-key-for-testing-32chars!'
  })

  afterEach(() => {
    process.env.PAYLOAD_SECRET = originalEnv
  })

  describe('signCustomerId', () => {
    it('returns a signed token string', () => {
      const token = signCustomerId('123')
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
    })

    it('contains the customer ID in the token', () => {
      const token = signCustomerId('456')
      expect(token.startsWith('456.')).toBe(true)
    })

    it('produces tokens with 3 parts (id.timestamp.signature)', () => {
      const token = signCustomerId('789')
      const parts = token.split('.')
      expect(parts).toHaveLength(3)
    })

    it('produces different tokens for different customer IDs', () => {
      const token1 = signCustomerId('100')
      const token2 = signCustomerId('200')
      expect(token1).not.toBe(token2)
    })
  })

  describe('verifyCustomerId', () => {
    it('verifies a valid token and returns customer ID', () => {
      const token = signCustomerId('123')
      const result = verifyCustomerId(token)
      expect(result).toBe('123')
    })

    it('returns null for invalid format (no dots)', () => {
      expect(verifyCustomerId('invalid-token')).toBeNull()
    })

    it('returns null for token with wrong number of parts', () => {
      expect(verifyCustomerId('a.b')).toBeNull()
      expect(verifyCustomerId('a.b.c.d')).toBeNull()
    })

    it('returns null for tampered signature', () => {
      const token = signCustomerId('123')
      const parts = token.split('.')
      parts[2] = 'tampered-signature'
      expect(verifyCustomerId(parts.join('.'))).toBeNull()
    })

    it('returns null for tampered customer ID', () => {
      const token = signCustomerId('123')
      const parts = token.split('.')
      parts[0] = '999'
      expect(verifyCustomerId(parts.join('.'))).toBeNull()
    })

    it('returns null for expired token (>30 days)', () => {
      // Create a token, then modify the timestamp to be old
      const token = signCustomerId('123')
      const parts = token.split('.')
      // Set timestamp to 31 days ago
      const oldTimestamp = (Date.now() - 31 * 24 * 60 * 60 * 1000).toString(36)
      // Re-sign with old timestamp — but since we can't easily re-sign,
      // we verify that a manually constructed old token fails
      const oldData = `123.${oldTimestamp}`
      const crypto = require('crypto')
      const hmac = crypto.createHmac('sha256', process.env.PAYLOAD_SECRET)
      hmac.update(oldData)
      const sig = hmac.digest('hex')
      expect(verifyCustomerId(`123.${oldTimestamp}.${sig}`)).toBeNull()
    })

    it('handles different secrets (token signed with different secret fails)', () => {
      const token = signCustomerId('123')
      process.env.PAYLOAD_SECRET = 'different-secret-key-for-testing!'
      expect(verifyCustomerId(token)).toBeNull()
    })
  })
})
