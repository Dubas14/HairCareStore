import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Політика конфіденційності | HAIR LAB',
  description: 'Політика конфіденційності інтернет-магазину HAIR LAB. Захист персональних даних відповідно до GDPR та законодавства України.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Політика конфіденційності</h1>

        <div className="prose prose-sm max-w-none text-foreground space-y-6">
          <p className="text-muted-foreground">
            Останнє оновлення: {new Date().toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">1. Загальні положення</h2>
            <p>
              Інтернет-магазин HAIR LAB (далі — «Магазин») поважає вашу конфіденційність та зобов&#39;язується
              захищати ваші персональні дані відповідно до Закону України «Про захист персональних даних»
              та Загального регламенту про захист даних (GDPR).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">2. Які дані ми збираємо</h2>
            <p>Ми збираємо такі категорії персональних даних:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Контактні дані:</strong> ім&#39;я, прізвище, email, телефон</li>
              <li><strong>Адреса доставки:</strong> місто, адреса, поштовий індекс</li>
              <li><strong>Дані замовлень:</strong> історія покупок, обрані товари</li>
              <li><strong>Технічні дані:</strong> IP-адреса, тип браузера, cookies</li>
              <li><strong>Дані оплати:</strong> обробляються виключно платіжним провайдером Stripe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">3. Мета обробки даних</h2>
            <p>Ваші дані використовуються для:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Обробки та доставки замовлень</li>
              <li>Зв&#39;язку з вами щодо замовлень</li>
              <li>Надсилання сповіщень про статус доставки</li>
              <li>Покращення якості обслуговування</li>
              <li>Надсилання маркетингових повідомлень (за вашою згодою)</li>
              <li>Програми лояльності та персональних знижок</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">4. Cookies</h2>
            <p>Ми використовуємо cookies для:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Необхідні:</strong> авторизація, кошик, мовні налаштування</li>
              <li><strong>Аналітичні:</strong> Google Analytics (за вашою згодою)</li>
              <li><strong>Маркетингові:</strong> Facebook Pixel (за вашою згодою)</li>
            </ul>
            <p className="mt-2">
              Ви можете змінити налаштування cookies через банер на сайті або в налаштуваннях вашого браузера.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">5. Захист даних</h2>
            <p>
              Ми застосовуємо технічні та організаційні заходи для захисту ваших даних:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>SSL/TLS шифрування всіх з&#39;єднань</li>
              <li>Безпечне зберігання паролів (хешування)</li>
              <li>Обмежений доступ до персональних даних</li>
              <li>Регулярне оновлення систем безпеки</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">6. Передача даних третім особам</h2>
            <p>Ми передаємо ваші дані лише:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Служби доставки:</strong> для виконання замовлень (Нова Пошта, Укрпошта)</li>
              <li><strong>Платіжні системи:</strong> Stripe для обробки оплат</li>
              <li><strong>Аналітичні сервіси:</strong> Google Analytics, Facebook (за вашою згодою)</li>
            </ul>
            <p className="mt-2">Ми не продаємо ваші персональні дані третім особам.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">7. Ваші права</h2>
            <p>Ви маєте право:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Доступ:</strong> отримати копію ваших персональних даних</li>
              <li><strong>Виправлення:</strong> оновити неточні дані</li>
              <li><strong>Видалення:</strong> видалити ваш обліковий запис та дані</li>
              <li><strong>Експорт:</strong> отримати ваші дані у машинночитаному форматі</li>
              <li><strong>Відкликання згоди:</strong> відмовитися від маркетингових розсилок</li>
            </ul>
            <p className="mt-2">
              Для реалізації цих прав скористайтесь відповідними функціями у вашому особистому кабінеті
              або зверніться до нас за контактними даними нижче.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">8. Зберігання даних</h2>
            <p>
              Ми зберігаємо ваші персональні дані протягом терміну, необхідного для цілей обробки.
              Дані замовлень зберігаються відповідно до вимог бухгалтерського обліку.
              Після видалення облікового запису ваші персональні дані анонімізуються.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">9. Зміни до політики</h2>
            <p>
              Ми можемо оновлювати цю політику конфіденційності. Про суттєві зміни ми повідомимо
              на сайті або електронною поштою.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">10. Контакти</h2>
            <p>
              З питань захисту персональних даних зверніться до нас:
            </p>
            <ul className="list-none space-y-1 mt-2">
              <li>Email: privacy@hairlab.store</li>
              <li>Через форму зворотного зв&#39;язку на сайті</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  )
}
