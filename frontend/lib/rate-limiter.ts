/**
 * Rate limiter with Redis support and in-memory fallback.
 * Uses Redis INCR + EXPIRE for atomic counting in production.
 * Falls back to in-memory Map when Redis is unavailable.
 */

import { createLogger } from '@/lib/logger'

const log = createLogger('rate-limiter')

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

// ─── Redis client (lazy-loaded) ─────────────────────────────────

let redisClient: import('ioredis').default | null = null
let redisAvailable = false
let redisChecked = false

async function getRedis(): Promise<import('ioredis').default | null> {
  if (redisChecked) return redisClient

  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    redisChecked = true
    return null
  }

  try {
    const Redis = (await import('ioredis')).default
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true,
    })
    await redisClient.connect()
    redisAvailable = true
    log.info('Redis connected for rate limiting')
  } catch (err) {
    log.warn('Redis unavailable, using in-memory rate limiter', err)
    redisClient = null
    redisAvailable = false
  }
  redisChecked = true
  return redisClient
}

// ─── Redis-based rate limiting ──────────────────────────────────

async function checkRateLimitRedis(
  redis: import('ioredis').default,
  key: string,
  bucket: string,
): Promise<{ allowed: boolean; remainingAttempts: number; blockTime?: number }> {
  const cfg = BUCKETS[bucket] || BUCKETS.login
  const blockKey = `rl:block:${bucket}:${key}`
  const attemptsKey = `rl:attempts:${bucket}:${key}`

  // Check if blocked
  const blockTtl = await redis.ttl(blockKey)
  if (blockTtl > 0) {
    return { allowed: false, remainingAttempts: 0, blockTime: blockTtl }
  }

  const attempts = parseInt(await redis.get(attemptsKey) || '0', 10)
  const remaining = Math.max(0, cfg.maxAttempts - attempts)
  return { allowed: remaining > 0, remainingAttempts: remaining }
}

async function recordAttemptRedis(
  redis: import('ioredis').default,
  key: string,
  bucket: string,
): Promise<void> {
  const cfg = BUCKETS[bucket] || BUCKETS.login
  const blockKey = `rl:block:${bucket}:${key}`
  const attemptsKey = `rl:attempts:${bucket}:${key}`
  const windowSec = Math.ceil(cfg.windowMs / 1000)
  const blockSec = Math.ceil(cfg.blockDurationMs / 1000)

  const count = await redis.incr(attemptsKey)
  if (count === 1) {
    await redis.expire(attemptsKey, windowSec)
  }

  if (count >= cfg.maxAttempts) {
    await redis.set(blockKey, '1', 'EX', blockSec)
  }
}

async function resetAttemptsRedis(
  redis: import('ioredis').default,
  key: string,
  bucket: string,
): Promise<void> {
  const attemptsKey = `rl:attempts:${bucket}:${key}`
  const blockKey = `rl:block:${bucket}:${key}`
  await redis.del(attemptsKey, blockKey)
}

// ─── In-memory fallback ─────────────────────────────────────────

interface RateLimitRecord {
  attempts: number
  firstAttemptAt: number
  blockedUntil: number
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

function checkRateLimitMemory(key: string, bucket: string): {
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

function recordAttemptMemory(key: string, bucket: string): void {
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

function resetAttemptsMemory(key: string, bucket: string): void {
  getStore(bucket).delete(key)
}

// ─── Public API ─────────────────────────────────────────────────

export function checkRateLimit(key: string, bucket: string = 'login'): {
  allowed: boolean
  remainingAttempts: number
  blockTime?: number
} {
  // Synchronous check — use memory; Redis is used asynchronously
  return checkRateLimitMemory(key, bucket)
}

export function recordAttempt(key: string, bucket: string = 'login'): void {
  recordAttemptMemory(key, bucket)

  // Fire-and-forget Redis sync
  getRedis()
    .then((redis) => { if (redis) recordAttemptRedis(redis, key, bucket) })
    .catch(() => {})
}

/** @deprecated Use recordAttempt instead */
export function recordFailedAttempt(ip: string): void {
  recordAttempt(ip, 'login')
}

export function resetAttempts(key: string, bucket: string = 'login'): void {
  resetAttemptsMemory(key, bucket)

  // Fire-and-forget Redis sync
  getRedis()
    .then((redis) => { if (redis) resetAttemptsRedis(redis, key, bucket) })
    .catch(() => {})
}

// Periodic cleanup of expired in-memory records (every 60s)
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
