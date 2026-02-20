import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['uk', 'en', 'pl', 'de', 'ru'],
  defaultLocale: 'uk',
  localePrefix: 'as-needed', // /uk is default — no prefix; /en/shop, /pl/shop etc.
})

export type Locale = (typeof routing.locales)[number]
