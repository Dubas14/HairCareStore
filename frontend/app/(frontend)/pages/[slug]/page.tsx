export const revalidate = 600 // ISR: revalidate every 10 minutes

import Link from 'next/link'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getPageBySlug, getSiteSettings } from '@/lib/payload/client'
import type { SiteSettingsData } from '@/lib/payload/client'
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
  FeatureGrid,
  FeatureIcons,
  RichTextRenderer,
} from '@/components/pages'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

interface PageProps {
  params: Promise<{ slug: string }>
}

const pageConfig: Record<
  string,
  {
    icon: 'delivery' | 'payment' | 'contact' | 'about'
    gradient: 'teal' | 'warm' | 'purple' | 'olive'
    fallbackTitle: string
  }
> = {
  delivery: {
    icon: 'delivery',
    gradient: 'teal',
    fallbackTitle: 'Доставка',
  },
  dostavka: {
    icon: 'delivery',
    gradient: 'teal',
    fallbackTitle: 'Доставка',
  },
  payment: {
    icon: 'payment',
    gradient: 'warm',
    fallbackTitle: 'Оплата',
  },
  oplata: {
    icon: 'payment',
    gradient: 'warm',
    fallbackTitle: 'Оплата',
  },
  contacts: {
    icon: 'contact',
    gradient: 'purple',
    fallbackTitle: 'Контакти',
  },
  kontakty: {
    icon: 'contact',
    gradient: 'purple',
    fallbackTitle: 'Контакти',
  },
  about: {
    icon: 'about',
    gradient: 'olive',
    fallbackTitle: 'Про нас',
  },
  'pro-nas': {
    icon: 'about',
    gradient: 'olive',
    fallbackTitle: 'Про нас',
  },
}

const deliveryIcons = [InfoIcons.truck, InfoIcons.mapPin, InfoIcons.clock, InfoIcons.gift]
const paymentIcons = [InfoIcons.creditCard, InfoIcons.shield, InfoIcons.gift, InfoIcons.check]
const featureIconList = [
  FeatureIcons.quality,
  FeatureIcons.science,
  FeatureIcons.natural,
  FeatureIcons.eco,
  FeatureIcons.heart,
  FeatureIcons.support,
]

function getPageType(slug: string): 'delivery' | 'payment' | 'contacts' | 'about' | 'generic' {
  if (slug === 'delivery' || slug === 'dostavka') return 'delivery'
  if (slug === 'payment' || slug === 'oplata') return 'payment'
  if (slug === 'contacts' || slug === 'kontakty') return 'contacts'
  if (slug === 'about' || slug === 'pro-nas') return 'about'
  return 'generic'
}

function buildMetadataDescription(
  slug: string,
  page: Awaited<ReturnType<typeof getPageBySlug>>,
  settings: SiteSettingsData | null,
): string {
  if (page?.metaDescription) return page.metaDescription

  const pageType = getPageType(slug)

  switch (pageType) {
    case 'delivery':
      return settings?.delivery?.methods?.[0]?.description || ''
    case 'payment':
      return settings?.payment?.securityText || ''
    case 'contacts':
      return [settings?.contacts?.phone, settings?.contacts?.email].filter(Boolean).join(' • ')
    case 'about':
      return settings?.about?.intro || ''
    default:
      return ''
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const pageType = getPageType(slug)
  const [page, settings] = await Promise.all([
    getPageBySlug(slug),
    pageType !== 'generic' ? getSiteSettings() : Promise.resolve(null),
  ])
  const config = pageConfig[slug]
  const title = page?.metaTitle || page?.title || config?.fallbackTitle || slug

  return {
    title,
    description: buildMetadataDescription(slug, page, settings),
  }
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: string
  description?: string
}) {
  return (
    <ScrollReveal variant="fade-up" className="mb-8">
      {eyebrow ? (
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-foreground/42">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </ScrollReveal>
  )
}

function UtilityLinks({
  links,
}: {
  links: Array<{ href: string; label: string; external?: boolean }>
}) {
  const validLinks = links.filter((link) => Boolean(link.href))

  if (validLinks.length === 0) return null

  return (
    <ScrollReveal variant="fade-up">
      <div className="mt-10 flex flex-wrap gap-3">
        {validLinks.map((link) => {
          const external = link.external || link.href.startsWith('http')

          return external ? (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-foreground shadow-[0_10px_24px_rgba(16,24,40,0.05)] transition-transform hover:-translate-y-0.5"
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.label}
              href={link.href}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-foreground shadow-[0_10px_24px_rgba(16,24,40,0.05)] transition-transform hover:-translate-y-0.5"
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </ScrollReveal>
  )
}

function DeliveryContent({ settings }: { settings: SiteSettingsData | null }) {
  const methods = settings?.delivery?.methods ?? []
  const steps = settings?.delivery?.steps ?? []
  const faq = settings?.delivery?.faq ?? []

  return (
    <>
      {methods.length > 0 && (
        <section className="mb-16">
          <SectionTitle
            title="Способи доставки"
          />

          <InfoCardGrid columns={methods.length >= 3 ? 3 : 2}>
            {methods.map((method, i) => (
              <InfoCard
                key={method.title}
                icon={deliveryIcons[i] || InfoIcons.truck}
                title={method.title}
                description={method.description}
                variant={method.isHighlight ? 'highlight' : undefined}
                delay={i * 80}
              />
            ))}
          </InfoCardGrid>
        </section>
      )}

      {steps.length > 0 && (
        <section className="mb-16">
          <SectionTitle
            title="Етапи доставки"
          />

          <ProcessTimeline
            steps={steps.map((step, i) => ({
              number: i + 1,
              title: step.title,
              description: step.description,
            }))}
          />
        </section>
      )}

      {faq.length > 0 && (
        <section className="mb-16">
          <FAQAccordion title="Питання та відповіді" items={faq} />
        </section>
      )}

      <UtilityLinks
        links={[
          { href: '/pages/contacts', label: 'Контакти' },
          { href: '/tracking', label: 'Відстежити замовлення' },
        ]}
      />
    </>
  )
}

function PaymentContent({ settings }: { settings: SiteSettingsData | null }) {
  const methods = settings?.payment?.methods ?? []
  const securityText = settings?.payment?.securityText
  const faq = settings?.payment?.faq ?? []

  return (
    <>
      {methods.length > 0 && (
        <section className="mb-16">
          <SectionTitle
            title="Способи оплати"
          />

          <InfoCardGrid columns={methods.length >= 4 ? 2 : 2}>
            {methods.map((method, i) => (
              <InfoCard
                key={method.title}
                icon={paymentIcons[i] || InfoIcons.creditCard}
                title={method.title}
                description={method.description}
                variant={method.isHighlight ? 'highlight' : undefined}
                delay={i * 80}
              />
            ))}
          </InfoCardGrid>
        </section>
      )}

      {securityText ? (
        <section className="mb-16">
          <ScrollReveal variant="fade-up">
            <div className="rounded-[2rem] border border-black/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,239,227,0.88))] p-6 shadow-[0_24px_70px_rgba(16,24,40,0.07)] md:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-start">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1efe7] text-[#1f2a20]">
                  {InfoIcons.shield}
                </div>
                <div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                    Безпека платежів
                  </h2>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                    {securityText}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>
      ) : null}

      {faq.length > 0 && (
        <section className="mb-16">
          <FAQAccordion title="Питання та відповіді" items={faq} />
        </section>
      )}

      <UtilityLinks
        links={[
          { href: '/checkout', label: 'Перейти до оформлення' },
          { href: '/pages/contacts', label: 'Поставити запитання' },
        ]}
      />
    </>
  )
}

function ContactsContent({ settings }: { settings: SiteSettingsData | null }) {
  const contacts = settings?.contacts
  const social = settings?.social

  const cards = [
    contacts?.phone
      ? {
          title: 'Телефон',
          value: contacts.phone,
          link: contacts.phoneLink,
          description: contacts.phoneSchedule,
          icon: ContactIcons.phone,
        }
      : null,
    contacts?.email
      ? {
          title: 'Email',
          value: contacts.email,
          link: `mailto:${contacts.email}`,
          description: contacts.emailDescription,
          icon: ContactIcons.mail,
        }
      : null,
    contacts?.address
      ? {
          title: 'Адреса',
          value: contacts.address,
          link: contacts.addressLink,
          description: contacts.addressDescription,
          icon: ContactIcons.location,
        }
      : null,
    contacts?.schedule
      ? {
          title: 'Графік роботи',
          value: contacts.schedule,
          link: undefined,
          description: contacts.scheduleDescription,
          icon: ContactIcons.clock,
        }
      : null,
  ].filter(Boolean) as Array<{
    title: string
    value: string
    link?: string
    description?: string
    icon: ReactNode
  }>

  const socialLinks = [
    social?.instagram
      ? { href: social.instagram, label: 'Instagram', icon: ContactIcons.instagram, color: '#E4405F' }
      : null,
    social?.telegram
      ? { href: social.telegram, label: 'Telegram', icon: ContactIcons.telegram, color: '#0088cc' }
      : null,
    social?.facebook
      ? { href: social.facebook, label: 'Facebook', icon: ContactIcons.facebook, color: '#1877F2' }
      : null,
  ].filter(Boolean) as Array<{
    href: string
    label: string
    icon: ReactNode
    color: string
  }>

  return (
    <>
      {cards.length > 0 && (
        <section className="mb-16">
          <SectionTitle
            title="Як з нами зв’язатися"
          />

          <div className="grid gap-6 md:grid-cols-2">
            {cards.map((card, index) => (
              <ContactCard
                key={card.title}
                icon={card.icon}
                title={card.title}
                value={card.value}
                link={card.link}
                description={card.description}
                delay={index * 80}
              />
            ))}
          </div>
        </section>
      )}

      {socialLinks.length > 0 && (
        <section className="mb-16">
          <SectionTitle
            title="Соцмережі"
          />

          <div className="grid gap-4 sm:grid-cols-3">
            {socialLinks.map((item) => (
              <ScrollReveal key={item.label} variant="fade-up">
                <SocialLink
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  color={item.color}
                />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {contacts?.address ? (
        <section className="mb-16">
          <ScrollReveal variant="fade-up">
            <div className="rounded-[2rem] border border-black/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(247,239,227,0.88))] p-6 shadow-[0_24px_70px_rgba(16,24,40,0.07)] md:p-8">
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                Адреса
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                {contacts.address}
              </p>
              {contacts.addressDescription ? (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {contacts.addressDescription}
                </p>
              ) : null}
              {contacts.addressLink ? (
                <a
                  href={contacts.addressLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-foreground shadow-[0_10px_24px_rgba(16,24,40,0.05)] transition-transform hover:-translate-y-0.5"
                >
                  Відкрити на карті
                </a>
              ) : null}
            </div>
          </ScrollReveal>
        </section>
      ) : null}

      <UtilityLinks
        links={[
          { href: contacts?.phoneLink || '', label: 'Подзвонити' },
          { href: social?.telegram || '', label: 'Telegram', external: true },
        ]}
      />
    </>
  )
}

function AboutContent({ settings }: { settings: SiteSettingsData | null }) {
  const about = settings?.about
  const intro = about?.intro
  const story = about?.story
  const features = about?.features ?? []
  const stats = about?.stats ?? []

  return (
    <>
      {(intro || story) && (
        <section className="mb-16">
          <ScrollReveal variant="fade-up">
            <div className="rounded-[2rem] border border-black/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(247,239,227,0.88))] p-6 shadow-[0_24px_70px_rgba(16,24,40,0.07)] md:p-8">
              {intro ? (
                <p className="text-lg leading-8 text-foreground md:text-xl">
                  {intro}
                </p>
              ) : null}
              {story ? (
                <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
                  {story}
                </p>
              ) : null}
            </div>
          </ScrollReveal>
        </section>
      )}

      {features.length > 0 && (
        <section className="mb-16">
          <FeatureGrid
            title="Що є основою HAIR LAB"
            features={features.map((feature, index) => ({
              icon: featureIconList[index] || FeatureIcons.quality,
              title: feature.title,
              description: feature.description,
            }))}
            columns={3}
          />
        </section>
      )}

      {stats.length > 0 && (
        <section className="mb-16">
          <SectionTitle
            title="Факти та показники"
          />

          <ScrollReveal variant="fade-up">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={`${stat.value}-${stat.label}`}
                  className="rounded-[1.6rem] border border-black/8 bg-white/94 p-6 text-center shadow-[0_18px_50px_rgba(16,24,40,0.06)]"
                >
                  <p className="text-3xl font-semibold tracking-[-0.05em] text-foreground md:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>
      )}

      <UtilityLinks
        links={[
          { href: '/shop', label: 'Каталог' },
          { href: '/pages/contacts', label: 'Контакти' },
        ]}
      />
    </>
  )
}

export default async function StaticPage({ params }: PageProps) {
  const { slug } = await params
  const pageType = getPageType(slug)

  const [page, settings] = await Promise.all([
    getPageBySlug(slug),
    pageType !== 'generic' ? getSiteSettings() : Promise.resolve(null),
  ])

  const config = pageConfig[slug]

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
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4eee6_0%,#fbf7f2_30%,#ffffff_100%)]">
      <PageHero
        title={title}
        icon={finalConfig.icon}
        gradient={finalConfig.gradient}
      />

      <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        {pageType === 'delivery' && <DeliveryContent settings={settings} />}
        {pageType === 'payment' && <PaymentContent settings={settings} />}
        {pageType === 'contacts' && <ContactsContent settings={settings} />}
        {pageType === 'about' && <AboutContent settings={settings} />}

        {pageType === 'generic' && page?.content && Array.isArray(page.content) && (
          <RichTextRenderer
            content={page.content as Parameters<typeof RichTextRenderer>[0]['content']}
          />
        )}
      </div>
    </main>
  )
}
