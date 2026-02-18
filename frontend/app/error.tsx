'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-2">Щось пішло не так</h1>
        <p className="text-muted-foreground mb-6">
          Виникла непередбачена помилка. Спробуйте оновити сторінку.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          Спробувати знову
        </button>
      </div>
    </div>
  )
}
