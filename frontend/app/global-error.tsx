'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="uk">
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Щось пішло не так</h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>Ми вже працюємо над виправленням цієї помилки.</p>
          <button
            onClick={reset}
            style={{ padding: '12px 24px', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}
          >
            Спробувати ще раз
          </button>
        </div>
      </body>
    </html>
  )
}
