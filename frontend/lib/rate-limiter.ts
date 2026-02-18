/**
 * In-memory rate limiter for auth and public form actions.
 * Supports multiple buckets with configurable limits.
 *
 * For production with multiple server instances, replace with Redis.
 */

interface RateLimitRecord {
  attempts: number
  firstAttemptAt: number
  blockedUntil: number
}

interface BucketConfig {
  maxAttempts: number
  windowMs: number
  blockDurationMs: number
}

const BUCKETS: Record<string, BucketConfig> = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000, blockDurationMs: 30 * 60 * 1000 },
  register: { maxAttempts: 3, windowMs: 60 * 60 * 1000, blockDurationMs: 60 * 60 * 1000 },
  newsletter: { maxAttempts: 3, windowMs: 60 * 60 * 1000, blockDurationMs: 60 * 60 * 1000 },
}

const stores = new Map<string, Map<string, RateLimitRecord>>()

function getStore(bucket: string): Map<string, RateLimitRecord> {
  let store = stores.get(bucket)
  if (!store) {
    store = new Map()
    stores.set(bucket, store)
  }
  return store
}

export function checkRateLimit(key: string, bucket: string = 'login'): {
  allowed: boolean
  remainingAttempts: number
  blockTime?: number
} {
  const cfg = BUCKETS[bucket] || BUCKETS.login
  const store = getStore(bucket)
  const now = Date.now()
  const record = store.get(key)

  if (!record) {
    return { allowed: true, remainingAttempts: cfg.maxAttempts }
  }

  if (record.blockedUntil > now) {
    return {
      allowed: false,
      remainingAttempts: 0,
      blockTime: Math.ceil((record.blockedUntil - now) / 1000),
    }
  }

  if (record.blockedUntil > 0 && record.blockedUntil <= now) {
    store.delete(key)
    return { allowed: true, remainingAttempts: cfg.maxAttempts }
  }

  if (now - record.firstAttemptAt > cfg.windowMs) {
    store.delete(key)
    return { allowed: true, remainingAttempts: cfg.maxAttempts }
  }

  const remaining = Math.max(0, cfg.maxAttempts - record.attempts)
  return { allowed: remaining > 0, remainingAttempts: remaining }
}

export function recordAttempt(key: string, bucket: string = 'login'): void {
  const cfg = BUCKETS[bucket] || BUCKETS.login
  const store = getStore(bucket)
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || now - existing.firstAttemptAt > cfg.windowMs) {
    store.set(key, { attempts: 1, firstAttemptAt: now, blockedUntil: 0 })
    return
  }

  existing.attempts += 1
  if (existing.attempts >= cfg.maxAttempts) {
    existing.blockedUntil = now + cfg.blockDurationMs
  }
  store.set(key, existing)
}

/** @deprecated Use recordAttempt instead */
export function recordFailedAttempt(ip: string): void {
  recordAttempt(ip, 'login')
}

export function resetAttempts(key: string, bucket: string = 'login'): void {
  getStore(bucket).delete(key)
}

// Periodic cleanup of expired records (every 60 s)
if (typeof globalThis !== 'undefined') {
  const CLEANUP_KEY = '__rl_cleanup'
  if (!(globalThis as Record<string, unknown>)[CLEANUP_KEY]) {
    ;(globalThis as Record<string, unknown>)[CLEANUP_KEY] = true
    setInterval(() => {
      const now = Date.now()
      for (const [bucket, bucketStore] of stores.entries()) {
        const cfg = BUCKETS[bucket] || BUCKETS.login
        for (const [ip, record] of bucketStore.entries()) {
          const windowExpired = now - record.firstAttemptAt > cfg.windowMs && record.blockedUntil === 0
          const blockExpired = record.blockedUntil > 0 && record.blockedUntil <= now
          if (windowExpired || blockExpired) {
            bucketStore.delete(ip)
          }
        }
      }
    }, 60_000)
  }
}
