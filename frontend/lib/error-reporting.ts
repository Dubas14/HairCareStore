/**
 * Error reporting utility
 *
 * Provides centralized error capture. Currently logs to console.
 * To enable Sentry:
 * 1. npm install @sentry/nextjs
 * 2. Set NEXT_PUBLIC_SENTRY_DSN in .env.local
 * 3. Run `npx @sentry/wizard@latest -i nextjs`
 * 4. Import and use captureError() in catch blocks
 */

interface ErrorContext {
  component?: string
  action?: string
  userId?: string | number
  extra?: Record<string, unknown>
}

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

// eslint-disable-next-line @next/next/no-assign-module-variable
let sentryModule: Record<string, unknown> | null = null
let sentryChecked = false

function getSentry(): Record<string, unknown> | null {
  if (sentryChecked) return sentryModule
  sentryChecked = true
  if (!SENTRY_DSN) return null
  try {
    // Dynamic require — only resolves if @sentry/nextjs is installed
    sentryModule = require('@sentry/nextjs')
    const init = sentryModule?.init as ((config: Record<string, unknown>) => void) | undefined
    init?.({
      dsn: SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    })
  } catch {
    sentryModule = null
  }
  return sentryModule
}

/**
 * Capture an error with optional context.
 */
export function captureError(error: Error | string, context?: ErrorContext): void {
  const err = typeof error === 'string' ? new Error(error) : error

  // Always log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${context?.component || 'app'}] ${context?.action || 'error'}:`, err)
    return
  }

  // Try Sentry if DSN is configured
  const sentry = getSentry()
  const captureException = sentry?.captureException as ((e: Error) => void) | undefined
  const withScope = sentry?.withScope as ((cb: (scope: Record<string, (...args: unknown[]) => void>) => void) => void) | undefined
  if (captureException && withScope) {
    withScope((scope) => {
      if (context?.component) scope.setTag('component', context.component)
      if (context?.action) scope.setTag('action', context.action)
      if (context?.userId) scope.setUser({ id: String(context.userId) })
      if (context?.extra) scope.setExtras(context.extra)
      captureException(err)
    })
    return
  }

  console.error(`[${context?.component || 'app'}]`, err)
}

/**
 * Capture a message (non-error event).
 */
export function captureMessage(message: string, context?: ErrorContext): void {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${context?.component || 'app'}] ${message}`)
    return
  }

  const sentry = getSentry()
  const sentryCaptureMessage = sentry?.captureMessage as ((msg: string, opts?: Record<string, unknown>) => void) | undefined
  if (sentryCaptureMessage) {
    sentryCaptureMessage(message, { extra: context?.extra })
    return
  }

  console.log(`[${context?.component || 'app'}] ${message}`)
}
