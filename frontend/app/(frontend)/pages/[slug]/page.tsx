import { notFound } from 'next/navigation'
import { getPageBySlug, getPages } from '@/lib/payload/client'
import { Metadata } from 'next'
import {
  PageHero,
  InfoCard,
  InfoCardGrid,
  InfoIcons,
  ProcessTimeline,
  FAQAccordion,
  ContactCard,
  SocialLink,
  ContactIcons,
  CTASection,
  FeatureGrid,
  FeatureIcons,
  RichTextRenderer,
} from '@/components/pages'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Generate static paths for all pages
export async function generateStaticParams() {
  // Always include known page slugs
  const knownSlugs = Object.keys(pageConfig)

  // Try to get additional pages from CMS
  try {
    const pages = await getPages()
    const cmsSlugs = pages.map(page => page.slug)

    // Combine and deduplicate
    const allSlugs = [...new Set([...knownSlugs, ...cmsSlugs])]
    return allSlugs.map(slug => ({ slug }))
  } catch {
    // If CMS is unavailable, use known slugs only
    return knownSlugs.map(slug => ({ slug }))
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  const config = pageConfig[slug]

  // Use CMS data if available, otherwise use fallback
  const title = page?.metaTitle || page?.title || config?.fallbackTitle || slug

  return {
    title,
    description: page?.metaDescription || config?.subtitle || '',
  }
}

// Page configuration for different slugs
const pageConfig: Record<string, {
  icon: 'delivery' | 'payment' | 'contact' | 'about'
  gradient: 'teal' | 'warm' | 'purple' | 'olive'
  subtitle?: string
  fallbackTitle: string
}> = {
  'delivery': {
    icon: 'delivery',
    gradient: 'teal',
    subtitle: 'Швидка та надійна доставка по всій Україні',
    fallbackTitle: 'Доставка',
  },
  'dostavka': {
    icon: 'delivery',
    gradient: 'teal',
    subtitle: 'Швидка та надійна доставка по всій Україні',
    fallbackTitle: 'Доставка',
  },
  'payment': {
    icon: 'payment',
    gradient: 'warm',
    subtitle: 'Зручні способи оплати для вашого комфорту',
    fallbackTitle: 'Оплата',
  },
  'oplata': {
    icon: 'payment',
    gradient: 'warm',
    subtitle: 'Зручні способи оплати для вашого комфорту',
    fallbackTitle: 'Оплата',
  },
  'contacts': {
    icon: 'contact',
    gradient: 'purple',
    subtitle: 'Завжди на зв\'язку для вас',
    fallbackTitle: 'Контакти',
  },
  'kontakty': {
    icon: 'contact',
    gradient: 'purple',
    subtitle: 'Завжди на зв\'язку для вас',
    fallbackTitle: 'Контакти',
  },
  'about': {
    icon: 'about',
    gradient: 'olive',
    subtitle: 'Професійний догляд за волоссям з любов\'ю до науки',
    fallbackTitle: 'Про нас',
  },
  'pro-nas': {
    icon: 'about',
    gradient: 'olive',
    subtitle: 'Професійний догляд за волоссям з любов\'ю до науки',
    fallbackTitle: 'Про нас',
  },
}

// Delivery page content
function DeliveryContent() {
  return (
    <>
      {/* Info cards */}
      <section className="mb-16">
        <InfoCardGrid columns={3}>
          <InfoCard
            icon={InfoIcons.truck}
            title="Нова Пошта"
            description="Доставка 1-3 дні по всій Україні. Безкоштовно від 1500 грн."
            variant="highlight"
            delay={0}
          />
          <InfoCard
            icon={InfoIcons.mapPin}
            title="Укрпошта"
            description="Економна доставка 3-7 днів. Доступна для всіх населених пунктів."
            delay={100}
          />
          <InfoCard
            icon={InfoIcons.clock}
            title="Кур'єрська доставка"
            description="Доставка день в день по Києву та області. Замовлення до 14:00."
            delay={200}
          />
        </InfoCardGrid>
      </section>

      {/* Process timeline */}
      <section className="mb-16">
        <ProcessTimeline
          title="Як працює доставка"
          steps={[
            { number: 1, title: "Оформлення", description: "Залиште заявку на сайті або зателефонуйте нам" },
            { number: 2, title: "Підтвердження", description: "Менеджер зв'яжеться для уточнення деталей" },
            { number: 3, title: "Відправка", description: "Товар буде надісланий в день замовлення" },
            { number: 4, title: "Отримання", description: "Заберіть замовлення у відділенні або отримайте кур'єром" },
          ]}
        />
      </section>

      {/* FAQ */}
      <section className="mb-16">
        <FAQAccordion
          title="Часті запитання про доставку"
          items={[
            {
              question: "Яка вартість доставки?",
              answer: "Доставка Новою Поштою безкоштовна при замовленні від 1500 грн. Для замовлень до 1500 грн вартість доставки розраховується за тарифами перевізника.",
            },
            {
              question: "Як швидко відправляється замовлення?",
              answer: "Замовлення, оформлені до 14:00, відправляються того ж дня. Замовлення після 14:00 відправляються наступного робочого дня.",
            },
            {
              question: "Чи можна змінити адресу доставки?",
              answer: "Так, ви можете змінити адресу до моменту відправлення замовлення, зв'язавшись з нашим менеджером.",
            },
            {
              question: "Як відстежити моє замовлення?",
              answer: "Після відправлення ви отримаєте SMS з номером ТТН для відстеження посилки на сайті перевізника.",
            },
          ]}
        />
      </section>

      {/* CTA */}
      <CTASection
        title="Є питання щодо доставки?"
        description="Наші менеджери з радістю допоможуть"
        buttonText="Зв'язатися з нами"
        buttonLink="/pages/contacts"
        variant="teal"
      />
    </>
  )
}

// Payment page content
function PaymentContent() {
  return (
    <>
      {/* Payment methods */}
      <section className="mb-16">
        <ScrollReveal variant="fade-up">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            <span className="inline-block w-8 h-1 bg-gradient-to-r from-[#D4A373] to-[#E9C46A] rounded-full mr-3 align-middle" />
            Способи оплати
          </h2>
        </ScrollReveal>

        <InfoCardGrid columns={2}>
          <InfoCard
            icon={InfoIcons.creditCard}
            title="Карткою онлайн"
            description="Visa, Mastercard, Apple Pay, Google Pay. Миттєве підтвердження платежу."
            variant="highlight"
            delay={0}
          />
          <InfoCard
            icon={InfoIcons.shield}
            title="Накладений платіж"
            description="Оплата при отриманні на пошті. Комісія за тарифами перевізника."
            delay={100}
          />
          <InfoCard
            icon={InfoIcons.gift}
            title="Безготівковий розрахунок"
            description="Для юридичних осіб та ФОП. Виставлення рахунку протягом години."
            delay={200}
          />
          <InfoCard
            icon={InfoIcons.check}
            title="Оплата частинами"
            description="Розстрочка від ПриватБанку та Monobank до 4 платежів без переплат."
            delay={300}
          />
        </InfoCardGrid>
      </section>

      {/* Security section */}
      <section className="mb-16 bg-gradient-to-br from-[#2A9D8F]/5 to-[#48CAE4]/5 rounded-3xl p-8 md:p-12">
        <ScrollReveal variant="fade-up">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#2A9D8F] to-[#48CAE4] p-[2px]">
                <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                  <svg className="w-12 h-12 text-[#2A9D8F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Безпечні платежі</h3>
              <p className="text-neutral-600 leading-relaxed">
                Всі платежі захищені технологією 3D Secure. Ми не зберігаємо дані вашої картки —
                всі транзакції обробляються через сертифіковані платіжні системи з найвищим рівнем захисту PCI DSS.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* FAQ */}
      <section className="mb-16">
        <FAQAccordion
          title="Часті запитання про оплату"
          items={[
            {
              question: "Чи безпечно платити карткою на сайті?",
              answer: "Так, абсолютно безпечно. Ми використовуємо сертифіковану платіжну систему з захистом 3D Secure та шифруванням SSL.",
            },
            {
              question: "Коли списуються кошти при онлайн-оплаті?",
              answer: "Кошти списуються одразу після підтвердження замовлення. У разі скасування — повернення протягом 1-3 банківських днів.",
            },
            {
              question: "Чи можна оплатити частинами?",
              answer: "Так, доступна оплата частинами від ПриватБанку та Monobank для замовлень від 500 грн. Оберіть цей спосіб при оформленні.",
            },
          ]}
        />
      </section>

      {/* CTA */}
      <CTASection
        title="Готові зробити замовлення?"
        description="Оберіть зручний спосіб оплати та отримайте товар вже завтра"
        buttonText="Перейти до каталогу"
        buttonLink="/shop"
        variant="warm"
      />
    </>
  )
}

// Contacts page content
function ContactsContent() {
  return (
    <>
      {/* Contact cards */}
      <section className="mb-16">
        <div className="grid md:grid-cols-2 gap-6">
          <ContactCard
            icon={ContactIcons.phone}
            title="Телефон"
            value="+38 (067) 123-45-67"
            link="tel:+380671234567"
            description="Пн-Пт: 9:00 - 18:00"
            delay={0}
          />
          <ContactCard
            icon={ContactIcons.mail}
            title="Email"
            value="hello@hairlab.ua"
            link="mailto:hello@hairlab.ua"
            description="Відповідаємо протягом 2 годин"
            delay={100}
          />
          <ContactCard
            icon={ContactIcons.location}
            title="Адреса"
            value="м. Київ, вул. Хрещатик, 1"
            link="https://maps.google.com"
            description="Шоурум працює з 10:00 до 20:00"
            delay={200}
          />
          <ContactCard
            icon={ContactIcons.clock}
            title="Графік роботи"
            value="Щодня з 9:00 до 21:00"
            description="Онлайн-підтримка 24/7"
            delay={300}
          />
        </div>
      </section>

      {/* Social links */}
      <section className="mb-16">
        <ScrollReveal variant="fade-up">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            <span className="inline-block w-8 h-1 bg-gradient-to-r from-[#B8B8D1] to-[#9FA0C3] rounded-full mr-3 align-middle" />
            Ми в соцмережах
          </h2>
        </ScrollReveal>

        <div className="grid sm:grid-cols-3 gap-4">
          <ScrollReveal variant="fade-up" delay={0}>
            <SocialLink
              icon={ContactIcons.instagram}
              label="Instagram"
              href="https://instagram.com/hairlab.ua"
              color="#E4405F"
            />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={100}>
            <SocialLink
              icon={ContactIcons.telegram}
              label="Telegram"
              href="https://t.me/hairlab_ua"
              color="#0088cc"
            />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={200}>
            <SocialLink
              icon={ContactIcons.facebook}
              label="Facebook"
              href="https://facebook.com/hairlab.ua"
              color="#1877F2"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="mb-16">
        <ScrollReveal variant="fade-up">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-50 h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#2A9D8F] to-[#48CAE4] flex items-center justify-center text-white">
                {ContactIcons.location}
              </div>
              <p className="text-neutral-600">м. Київ, вул. Хрещатик, 1</p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-[#2A9D8F] hover:text-[#48CAE4] font-medium transition-colors"
              >
                Відкрити в Google Maps
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                </svg>
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <CTASection
        title="Маєте запитання?"
        description="Напишіть нам — відповімо протягом години"
        buttonText="Написати в Telegram"
        buttonLink="https://t.me/hairlab_ua"
        variant="dark"
      />
    </>
  )
}

// About page content
function AboutContent() {
  return (
    <>
      {/* Story section */}
      <section className="mb-16">
        <ScrollReveal variant="fade-up">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-neutral-600 leading-relaxed mb-6">
              <strong className="text-[#1A1A1A]">HAIR LAB</strong> — це більше ніж магазин косметики для волосся.
              Це лабораторія краси, де наука зустрічається з турботою про себе.
            </p>
            <p className="text-neutral-600 leading-relaxed">
              Ми заснували HAIR LAB з простою місією: зробити професійний догляд за волоссям доступним кожному.
              Наша команда трихологів та стилістів ретельно відбирає кожен продукт, тестує його та перевіряє
              ефективність інгредієнтів.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Features */}
      <section className="mb-16">
        <FeatureGrid
          title="Чому обирають нас"
          subtitle="Ми поєднуємо наукові дослідження з натуральними інгредієнтами"
          features={[
            {
              icon: FeatureIcons.quality,
              title: "Тільки оригінали",
              description: "Працюємо напряму з брендами та офіційними дистриб'юторами",
            },
            {
              icon: FeatureIcons.science,
              title: "Науковий підхід",
              description: "Кожен продукт перевірений трихологами та дерматологами",
            },
            {
              icon: FeatureIcons.natural,
              title: "Натуральні формули",
              description: "Пріоритет інгредієнтам природного походження",
            },
            {
              icon: FeatureIcons.eco,
              title: "Eco-friendly",
              description: "Підтримуємо бренди з етичним виробництвом",
            },
            {
              icon: FeatureIcons.heart,
              title: "Індивідуальний підбір",
              description: "Безкоштовні консультації для підбору догляду",
            },
            {
              icon: FeatureIcons.support,
              title: "Підтримка 24/7",
              description: "Завжди на зв'язку для відповіді на ваші запитання",
            },
          ]}
          columns={3}
        />
      </section>

      {/* Stats */}
      <section className="mb-16">
        <ScrollReveal variant="fade-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "5+", label: "років досвіду" },
              { value: "50K+", label: "задоволених клієнтів" },
              { value: "200+", label: "брендів" },
              { value: "4.9", label: "рейтинг на Google" },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-[#606C38]/5 to-[#8A9A5B]/5"
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#606C38] to-[#8A9A5B] bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-neutral-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <CTASection
        title="Готові до трансформації?"
        description="Знайдіть ідеальний догляд для вашого типу волосся"
        buttonText="Перейти до каталогу"
        buttonLink="/shop"
        variant="teal"
      />
    </>
  )
}

// Get page type by slug
function getPageType(slug: string): 'delivery' | 'payment' | 'contacts' | 'about' | 'generic' {
  if (slug === 'delivery' || slug === 'dostavka') return 'delivery'
  if (slug === 'payment' || slug === 'oplata') return 'payment'
  if (slug === 'contacts' || slug === 'kontakty') return 'contacts'
  if (slug === 'about' || slug === 'pro-nas') return 'about'
  return 'generic'
}

export default async function StaticPage({ params }: PageProps) {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  const config = pageConfig[slug]
  const pageType = getPageType(slug)

  // For known page types, we can render without CMS data
  // For generic pages, we need CMS content
  if (!page && pageType === 'generic') {
    notFound()
  }

  // Use CMS title if available, otherwise use fallback
  const title = page?.title || config?.fallbackTitle || slug

  const finalConfig = config || {
    icon: 'about' as const,
    gradient: 'teal' as const,
    fallbackTitle: slug,
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero section */}
      <PageHero
        title={title}
        subtitle={finalConfig.subtitle}
        icon={finalConfig.icon}
        gradient={finalConfig.gradient}
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Render page-specific content */}
        {pageType === 'delivery' && <DeliveryContent />}
        {pageType === 'payment' && <PaymentContent />}
        {pageType === 'contacts' && <ContactsContent />}
        {pageType === 'about' && <AboutContent />}

        {/* For generic pages, render CMS content */}
        {pageType === 'generic' && page?.content && (
          <RichTextRenderer content={page.content} />
        )}
      </div>
    </main>
  )
}
