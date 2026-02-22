/**
 * Lightweight structured logger for HAIR LAB.
 * Development: pretty prints with timestamps.
 * Production: JSON format for log aggregation.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const isDev = process.env.NODE_ENV !== 'production'
const minLevel = isDev ? LOG_LEVELS.debug : LOG_LEVELS.info

interface LogPayload {
  module: string
  message: string
  level: LogLevel
  timestamp: string
  data?: unknown
  error?: string
  stack?: string
}

function formatError(err: unknown): { error?: string; stack?: string } {
  if (err instanceof Error) {
    return { error: err.message, stack: isDev ? err.stack : undefined }
  }
  if (typeof err === 'string') {
    return { error: err }
  }
  return { error: String(err) }
}

function log(level: LogLevel, module: string, message: string, data?: unknown) {
  if (LOG_LEVELS[level] < minLevel) return

  const payload: LogPayload = {
    module,
    message,
    level,
    timestamp: new Date().toISOString(),
  }

  if (data !== undefined) {
    if (data instanceof Error || (data && typeof data === 'object' && 'message' in data && 'stack' in data)) {
      Object.assign(payload, formatError(data))
    } else {
      payload.data = data
    }
  }

  if (isDev) {
    const prefix = `[${payload.timestamp.slice(11, 19)}] [${level.toUpperCase()}] [${module}]`
    const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
    if (payload.error) {
      consoleMethod(prefix, message, `| Error: ${payload.error}`)
      if (payload.stack) consoleMethod(payload.stack)
    } else if (payload.data !== undefined) {
      consoleMethod(prefix, message, payload.data)
    } else {
      consoleMethod(prefix, message)
    }
  } else {
    // Production: structured JSON
    const output = JSON.stringify(payload)
    if (level === 'error') {
      console.error(output)
    } else if (level === 'warn') {
      console.warn(output)
    } else {
      console.log(output)
    }
  }
}

export function createLogger(module: string) {
  return {
    debug: (message: string, data?: unknown) => log('debug', module, message, data),
    info: (message: string, data?: unknown) => log('info', module, message, data),
    warn: (message: string, data?: unknown) => log('warn', module, message, data),
    error: (message: string, data?: unknown) => log('error', module, message, data),
  }
}

// Default logger
export const logger = createLogger('app')
