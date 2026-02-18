'use client'

import Link from 'next/link'

export default function FrontendError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-2">Помилка</h1>
        <p className="text-muted-foreground mb-6">
          Не вдалось завантажити сторінку. Перевірте з&apos;єднання та спробуйте знову.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Оновити
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            На головну
          </Link>
        </div>
      </div>
    </div>
  )
}
