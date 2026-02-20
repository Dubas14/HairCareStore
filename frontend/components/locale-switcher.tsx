'use client'

import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Globe } from 'lucide-react'

const SUPPORTED_LOCALES = ['uk', 'en', 'pl', 'de', 'ru'] as const
type Locale = typeof SUPPORTED_LOCALES[number]

const localeLabels: Record<Locale, { flag: string; label: string; short: string }> = {
  uk: { flag: '🇺🇦', label: 'Українська', short: 'UA' },
  en: { flag: '🇬🇧', label: 'English', short: 'EN' },
  pl: { flag: '🇵🇱', label: 'Polski', short: 'PL' },
  de: { flag: '🇩🇪', label: 'Deutsch', short: 'DE' },
  ru: { flag: '🇷🇺', label: 'Русский', short: 'RU' },
}

export function LocaleSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleChange = (newLocale: string) => {
    // Set cookie and refresh page to apply new locale
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
    startTransition(() => {
      router.refresh()
    })
  }

  const current = localeLabels[locale]

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-input"
        aria-label="Change language"
        disabled={isPending}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{current.short}</span>
      </button>

      <div className="absolute right-0 top-full mt-1 bg-card border rounded-card shadow-soft-lg py-1 min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {SUPPORTED_LOCALES.map((loc) => {
          const info = localeLabels[loc]
          const isActive = loc === locale

          return (
            <button
              key={loc}
              onClick={() => handleChange(loc)}
              disabled={isPending}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors ${
                isActive
                  ? 'bg-primary/5 text-primary font-medium'
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              <span>{info.flag}</span>
              <span>{info.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
