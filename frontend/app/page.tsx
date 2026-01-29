export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Професійна косметика <br />
          <span className="text-primary">для волосся</span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Відкрийте для себе найкращі продукти для догляду за волоссям від провідних світових брендів
        </p>

        <div className="flex gap-4 justify-center pt-4">
          <a
            href="/products"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8 py-2"
          >
            Переглянути каталог
          </a>
          <a
            href="/quiz"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-8 py-2"
          >
            Пройти квіз підбору
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">🎯 Персональний підбір</h3>
            <p className="text-sm text-muted-foreground">
              Квіз допоможе знайти ідеальні продукти для вашого типу волосся
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">✨ Тільки якість</h3>
            <p className="text-sm text-muted-foreground">
              Оригінальна професійна косметика від перевірених постачальників
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">🚚 Швидка доставка</h3>
            <p className="text-sm text-muted-foreground">
              Нова Пошта та Укрпошта по всій Україні
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
