import { describe, it, expect, beforeEach } from 'vitest'
import { checkRateLimit, recordAttempt, resetAttempts } from './rate-limiter'

describe('rate-limiter', () => {
  beforeEach(() => {
    // Reset all attempts before each test
    resetAttempts('test-ip', 'login')
    resetAttempts('test-ip', 'register')
    resetAttempts('test-ip', 'newsletter')
  })

  describe('checkRateLimit', () => {
    it('allows first request', () => {
      const result = checkRateLimit('test-ip', 'login')
      expect(result.allowed).toBe(true)
      expect(result.remainingAttempts).toBe(5)
    })

    it('allows requests within limit', () => {
      recordAttempt('test-ip', 'login')
      recordAttempt('test-ip', 'login')
      const result = checkRateLimit('test-ip', 'login')
      expect(result.allowed).toBe(true)
      expect(result.remainingAttempts).toBe(3)
    })

    it('blocks after max attempts', () => {
      for (let i = 0; i < 5; i++) {
        recordAttempt('test-ip', 'login')
      }
      const result = checkRateLimit('test-ip', 'login')
      expect(result.allowed).toBe(false)
      expect(result.remainingAttempts).toBe(0)
      expect(result.blockTime).toBeGreaterThan(0)
    })
  })

  describe('recordAttempt', () => {
    it('increments attempt count', () => {
      recordAttempt('test-ip', 'login')
      const result = checkRateLimit('test-ip', 'login')
      expect(result.remainingAttempts).toBe(4)
    })
  })

  describe('resetAttempts', () => {
    it('resets attempt count', () => {
      recordAttempt('test-ip', 'login')
      recordAttempt('test-ip', 'login')
      resetAttempts('test-ip', 'login')
      const result = checkRateLimit('test-ip', 'login')
      expect(result.allowed).toBe(true)
      expect(result.remainingAttempts).toBe(5)
    })
  })

  describe('register bucket', () => {
    it('has lower limit (3 attempts)', () => {
      for (let i = 0; i < 3; i++) {
        recordAttempt('test-ip', 'register')
      }
      const result = checkRateLimit('test-ip', 'register')
      expect(result.allowed).toBe(false)
    })
  })

  describe('different IPs are independent', () => {
    it('does not share state between IPs', () => {
      for (let i = 0; i < 5; i++) {
        recordAttempt('ip-1', 'login')
      }
      const blocked = checkRateLimit('ip-1', 'login')
      const allowed = checkRateLimit('ip-2', 'login')
      expect(blocked.allowed).toBe(false)
      expect(allowed.allowed).toBe(true)

      // Cleanup
      resetAttempts('ip-1', 'login')
      resetAttempts('ip-2', 'login')
    })
  })
})
