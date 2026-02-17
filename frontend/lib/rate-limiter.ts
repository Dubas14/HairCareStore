/**
 * In-memory rate limiter for login attempts.
 * Tracks failed login attempts per IP address.
 *
 * - Max 5 attempts per IP within 15-minute window
 * - After 5 failures — blocked for 30 minutes
 *
 * For production with multiple server instances, replace with Redis.
 */

interface RateLimitRecord {
  attempts: number
  firstAttemptAt: number
  blockedUntil: number
}

const store = new Map<string, RateLimitRecord>()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const BLOCK_DURATION_MS = 30 * 60 * 1000 // 30 minutes

export function checkRateLimit(ip: string): {
  allowed: boolean
  remainingAttempts: number
  blockTime?: number
} {
  const now = Date.now()
  const record = store.get(ip)

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS }
  }

  // Currently blocked
  if (record.blockedUntil > now) {
    return {
      allowed: false,
      remainingAttempts: 0,
      blockTime: Math.ceil((record.blockedUntil - now) / 1000),
    }
  }

  // Block expired — reset
  if (record.blockedUntil > 0 && record.blockedUntil <= now) {
    store.delete(ip)
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS }
  }

  // Window expired — reset
  if (now - record.firstAttemptAt > WINDOW_MS) {
    store.delete(ip)
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS }
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - record.attempts)
  return {
    allowed: remaining > 0,
    remainingAttempts: remaining,
  }
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now()
  const existing = store.get(ip)

  if (!existing || now - existing.firstAttemptAt > WINDOW_MS) {
    store.set(ip, { attempts: 1, firstAttemptAt: now, blockedUntil: 0 })
    return
  }

  existing.attempts += 1

  if (existing.attempts >= MAX_ATTEMPTS) {
    existing.blockedUntil = now + BLOCK_DURATION_MS
  }

  store.set(ip, existing)
}

export function resetAttempts(ip: string): void {
  store.delete(ip)
}

// Periodic cleanup of expired records (every 60 s)
if (typeof globalThis !== 'undefined') {
  const CLEANUP_KEY = '__rl_cleanup'
  if (!(globalThis as Record<string, unknown>)[CLEANUP_KEY]) {
    ;(globalThis as Record<string, unknown>)[CLEANUP_KEY] = true
    setInterval(() => {
      const now = Date.now()
      for (const [ip, record] of store.entries()) {
        const windowExpired = now - record.firstAttemptAt > WINDOW_MS && record.blockedUntil === 0
        const blockExpired = record.blockedUntil > 0 && record.blockedUntil <= now
        if (windowExpired || blockExpired) {
          store.delete(ip)
        }
      }
    }, 60_000)
  }
}
