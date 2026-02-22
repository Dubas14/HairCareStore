import Link from 'next/link'

export default function NotFound() {
  return (
    <html lang="uk">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-4 bg-background text-foreground">
          <div className="text-center max-w-lg">
            <div className="mb-6">
              <span className="text-7xl font-bold tracking-tighter text-primary">404</span>
            </div>
            <h1 className="text-2xl font-bold mb-3">Сторінку не знайдено</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Сторінка, яку ви шукаєте, не існує або була переміщена. Перевірте адресу або поверніться на головну.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                На головну
              </Link>
              <Link
                href="/shop"
                className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors font-medium"
              >
                До каталогу
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
