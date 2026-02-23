export const revalidate = 600 // ISR: revalidate every 10 minutes

import { notFound } from 'next/navigation'
import { getPageBySlug, getPages, getSiteSettings } from '@/lib/payload/client'
import type { SiteSettingsData } from '@/lib/payload/client'
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

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  const config = pageConfig[slug]

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

// Icon map for delivery methods
const deliveryIcons = [InfoIcons.truck, InfoIcons.mapPin, InfoIcons.clock, InfoIcons.gift]
const paymentIcons = [InfoIcons.creditCard, InfoIcons.shield, InfoIcons.gift, InfoIcons.check]

// ─── Delivery page ──────────────────────────────────────────────

function DeliveryContent({ settings }: { settings: SiteSettingsData | null }) {
  const methods = settings?.delivery?.methods || [
    { title: 'Нова Пошта', description: 'Доставка 1-3 дні по всій Україні. Безкоштовно від 1500 грн.', isHighlight: true },
    { title: 'Укрпошта', description: 'Економна доставка 3-7 днів. Доступна для всіх населених пунктів.', isHighlight: false },
    { title: "Кур'єрська доставка", description: 'Доставка день в день по Києву та області. Замовлення до 14:00.', isHighlight: false },
  ]
  const steps = settings?.delivery?.steps || [
    { title: 'Оформлення', description: 'Залиште заявку на сайті або зателефонуйте нам' },
    { title: 'Підтвердження', description: "Менеджер зв'яжеться для уточнення деталей" },
    { title: 'Відправка', description: 'Товар буде надісланий в день замовлення' },
    { title: 'Отримання', description: "Заберіть замовлення у відділенні або отримайте кур'єром" },
  ]
  const faq = settings?.delivery?.faq || [
    { question: 'Яка вартість доставки?', answer: 'Доставка Новою Поштою безкоштовна при замовленні від 1500 грн. Для замовлень до 1500 грн вартість доставки розраховується за тарифами перевізника.' },
    { question: 'Як швидко відправляється замовлення?', answer: 'Замовлення, оформлені до 14:00, відправляються того ж дня. Замовлення після 14:00 відправляються наступного робочого дня.' },
    { question: 'Чи можна змінити адресу доставки?', answer: "Так, ви можете змінити адресу до моменту відправлення замовлення, зв'язавшись з нашим менеджером." },
    { question: 'Як відстежити моє замовлення?', answer: 'Після відправлення ви отримаєте SMS з номером ТТН для відстеження посилки на сайті перевізника.' },
  ]

  return (
    <>
      <section className="mb-16">
        <InfoCardGrid columns={3}>
          {methods.map((method, i) => (
            <InfoCard
              key={i}
              icon={deliveryIcons[i] || InfoIcons.truck}
              title={method.title}
              description={method.description}
              variant={method.isHighlight ? 'highlight' : undefined}
              delay={i * 100}
            />
          ))}
        </InfoCardGrid>
      </section>

      <section className="mb-16">
        <ProcessTimeline
          title="Як працює доставка"
          steps={steps.map((step, i) => ({
            number: i + 1,
            title: step.title,
            description: step.description,
          }))}
        />
      </section>

      <section className="mb-16">
        <FAQAccordion title="Часті запитання про доставку" items={faq} />
      </section>

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

// ─── Payment page ───────────────────────────────────────────────

function PaymentContent({ settings }: { settings: SiteSettingsData | null }) {
  const methods = settings?.payment?.methods || [
    { title: 'Карткою онлайн', description: 'Visa, Mastercard, Apple Pay, Google Pay. Миттєве підтвердження платежу.', isHighlight: true },
    { title: 'Накладений платіж', description: 'Оплата при отриманні на пошті. Комісія за тарифами перевізника.', isHighlight: false },
    { title: 'Безготівковий розрахунок', description: 'Для юридичних осіб та ФОП. Виставлення рахунку протягом години.', isHighlight: false },
    { title: 'Оплата частинами', description: 'Розстрочка від ПриватБанку та Monobank до 4 платежів без переплат.', isHighlight: false },
  ]
  const securityText = settings?.payment?.securityText ||
    'Всі платежі захищені технологією 3D Secure. Ми не зберігаємо дані вашої картки — всі транзакції обробляються через сертифіковані платіжні системи з найвищим рівнем захисту PCI DSS.'
  const faq = settings?.payment?.faq || [
    { question: 'Чи безпечно платити карткою на сайті?', answer: 'Так, абсолютно безпечно. Ми використовуємо сертифіковану платіжну систему з захистом 3D Secure та шифруванням SSL.' },
    { question: 'Коли списуються кошти при онлайн-оплаті?', answer: 'Кошти списуються одразу після підтвердження замовлення. У разі скасування — повернення протягом 1-3 банківських днів.' },
    { question: 'Чи можна оплатити частинами?', answer: 'Так, доступна оплата частинами від ПриватБанку та Monobank для замовлень від 500 грн. Оберіть цей спосіб при оформленні.' },
  ]

  return (
    <>
      <section className="mb-16">
        <ScrollReveal variant="fade-up">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            <span className="inline-block w-8 h-1 bg-gradient-to-r from-[#D4A373] to-[#E9C46A] rounded-full mr-3 align-middle" />
            Способи оплати
          </h2>
        </ScrollReveal>

        <InfoCardGrid columns={2}>
          {methods.map((method, i) => (
            <InfoCard
              key={i}
              icon={paymentIcons[i] || InfoIcons.creditCard}
              title={method.title}
              description={method.description}
              variant={method.isHighlight ? 'highlight' : undefined}
              delay={i * 100}
            />
          ))}
        </InfoCardGrid>
      </section>

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
              <p className="text-neutral-600 leading-relaxed">{securityText}</p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="mb-16">
        <FAQAccordion title="Часті запитання про оплату" items={faq} />
      </section>

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

// ─── Contacts page ──────────────────────────────────────────────

function ContactsContent({ settings }: { settings: SiteSettingsData | null }) {
  const c = settings?.contacts
  const s = settings?.social

  return (
    <>
      <section className="mb-16">
        <div className="grid md:grid-cols-2 gap-6">
          <ContactCard
            icon={ContactIcons.phone}
            title="Телефон"
            value={c?.phone || '+38 (067) 123-45-67'}
            link={c?.phoneLink || 'tel:+380671234567'}
            description={c?.phoneSchedule || 'Пн-Пт: 9:00 - 18:00'}
            delay={0}
          />
          <ContactCard
            icon={ContactIcons.mail}
            title="Email"
            value={c?.email || 'hello@hairlab.ua'}
            link={`mailto:${c?.email || 'hello@hairlab.ua'}`}
            description={c?.emailDescription || 'Відповідаємо протягом 2 годин'}
            delay={100}
          />
          <ContactCard
            icon={ContactIcons.location}
            title="Адреса"
            value={c?.address || 'м. Київ, вул. Хрещатик, 1'}
            link={c?.addressLink || 'https://maps.google.com'}
            description={c?.addressDescription || 'Шоурум працює з 10:00 до 20:00'}
            delay={200}
          />
          <ContactCard
            icon={ContactIcons.clock}
            title="Графік роботи"
            value={c?.schedule || 'Щодня з 9:00 до 21:00'}
            description={c?.scheduleDescription || 'Онлайн-підтримка 24/7'}
            delay={300}
          />
        </div>
      </section>

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
              href={s?.instagram || 'https://instagram.com/hairlab.ua'}
              color="#E4405F"
            />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={100}>
            <SocialLink
              icon={ContactIcons.telegram}
              label="Telegram"
              href={s?.telegram || 'https://t.me/hairlab_ua'}
              color="#0088cc"
            />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={200}>
            <SocialLink
              icon={ContactIcons.facebook}
              label="Facebook"
              href={s?.facebook || 'https://facebook.com/hairlab.ua'}
              color="#1877F2"
            />
          </ScrollReveal>
        </div>
      </section>

      <section className="mb-16">
        <ScrollReveal variant="fade-up">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-50 h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#2A9D8F] to-[#48CAE4] flex items-center justify-center text-white">
                {ContactIcons.location}
              </div>
              <p className="text-neutral-600">{c?.address || 'м. Київ, вул. Хрещатик, 1'}</p>
              <a
                href={c?.addressLink || 'https://maps.google.com'}
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

      <CTASection
        title="Маєте запитання?"
        description="Напишіть нам — відповімо протягом години"
        buttonText="Написати в Telegram"
        buttonLink={s?.telegram || 'https://t.me/hairlab_ua'}
        variant="dark"
      />
    </>
  )
}

// ─── About page ─────────────────────────────────────────────────

function AboutContent({ settings }: { settings: SiteSettingsData | null }) {
  const a = settings?.about

  const intro = a?.intro || 'HAIR LAB — це більше ніж магазин косметики для волосся. Це лабораторія краси, де наука зустрічається з турботою про себе.'
  const story = a?.story || 'Ми заснували HAIR LAB з простою місією: зробити професійний догляд за волоссям доступним кожному. Наша команда трихологів та стилістів ретельно відбирає кожен продукт, тестує його та перевіряє ефективність інгредієнтів.'
  const features = a?.features || [
    { title: 'Тільки оригінали', description: "Працюємо напряму з брендами та офіційними дистриб'юторами" },
    { title: 'Науковий підхід', description: 'Кожен продукт перевірений трихологами та дерматологами' },
    { title: 'Натуральні формули', description: 'Пріоритет інгредієнтам природного походження' },
    { title: 'Eco-friendly', description: 'Підтримуємо бренди з етичним виробництвом' },
    { title: 'Індивідуальний підбір', description: 'Безкоштовні консультації для підбору догляду' },
    { title: 'Підтримка 24/7', description: "Завжди на зв'язку для відповіді на ваші запитання" },
  ]
  const stats = a?.stats || [
    { value: '5+', label: 'років досвіду' },
    { value: '50K+', label: 'задоволених клієнтів' },
    { value: '200+', label: 'брендів' },
    { value: '4.9', label: 'рейтинг на Google' },
  ]

  // Map CMS features to FeatureGrid format with icons
  const featureIconList = [FeatureIcons.quality, FeatureIcons.science, FeatureIcons.natural, FeatureIcons.eco, FeatureIcons.heart, FeatureIcons.support]

  return (
    <>
      <section className="mb-16">
        <ScrollReveal variant="fade-up">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-neutral-600 leading-relaxed mb-6">
              <strong className="text-[#1A1A1A]">{intro}</strong>
            </p>
            <p className="text-neutral-600 leading-relaxed">
              {story}
            </p>
          </div>
        </ScrollReveal>
      </section>

      <section className="mb-16">
        <FeatureGrid
          title="Чому обирають нас"
          subtitle="Ми поєднуємо наукові дослідження з натуральними інгредієнтами"
          features={features.map((f, i) => ({
            icon: featureIconList[i] || FeatureIcons.quality,
            title: f.title,
            description: f.description,
          }))}
          columns={3}
        />
      </section>

      <section className="mb-16">
        <ScrollReveal variant="fade-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
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
  const pageType = getPageType(slug)

  // Fetch CMS data and site settings in parallel
  const [page, settings] = await Promise.all([
    getPageBySlug(slug),
    pageType !== 'generic' ? getSiteSettings() : Promise.resolve(null),
  ])

  const config = pageConfig[slug]

  // For generic pages, we need CMS content
  if (!page && pageType === 'generic') {
    notFound()
  }

  const title = page?.title || config?.fallbackTitle || slug

  const finalConfig = config || {
    icon: 'about' as const,
    gradient: 'teal' as const,
    fallbackTitle: slug,
  }

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        title={title}
        subtitle={finalConfig.subtitle}
        icon={finalConfig.icon}
        gradient={finalConfig.gradient}
      />

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        {pageType === 'delivery' && <DeliveryContent settings={settings} />}
        {pageType === 'payment' && <PaymentContent settings={settings} />}
        {pageType === 'contacts' && <ContactsContent settings={settings} />}
        {pageType === 'about' && <AboutContent settings={settings} />}

        {pageType === 'generic' && page?.content && Array.isArray(page.content) && (
          <RichTextRenderer content={page.content as Parameters<typeof RichTextRenderer>[0]['content']} />
        )}
      </div>
    </main>
  )
}
