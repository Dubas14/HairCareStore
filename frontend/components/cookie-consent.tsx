'use client'

import { useState, useEffect } from 'react'
import { Cookie, X } from 'lucide-react'

type ConsentPreferences = {
  necessary: true // always true
  analytics: boolean
  marketing: boolean
}

const COOKIE_NAME = 'cookie-consent'

function getStoredConsent(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = document.cookie
      .split('; ')
      .find(c => c.startsWith(`${COOKIE_NAME}=`))
    if (!stored) return null
    return JSON.parse(decodeURIComponent(stored.split('=')[1]))
  } catch {
    return null
  }
}

function setConsentCookie(prefs: ConsentPreferences) {
  const maxAge = 365 * 24 * 60 * 60 // 1 year
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(prefs))}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [prefs, setPrefs] = useState<ConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const stored = getStoredConsent()
    if (!stored) {
      setVisible(true)
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted: ConsentPreferences = { necessary: true, analytics: true, marketing: true }
    setConsentCookie(allAccepted)
    setVisible(false)
  }

  const handleAcceptSelected = () => {
    setConsentCookie(prefs)
    setVisible(false)
  }

  const handleRejectOptional = () => {
    const onlyNecessary: ConsentPreferences = { necessary: true, analytics: false, marketing: false }
    setConsentCookie(onlyNecessary)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl shadow-[0_-4px_30px_rgba(0,0,0,0.15)] p-5 sm:p-6">
        <div className="flex items-start gap-3 mb-4">
          <Cookie className="w-6 h-6 text-primary shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-base mb-1">
              Ми використовуємо cookies
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ми використовуємо файли cookie для покращення роботи сайту, аналітики та персоналізації реклами.
              Ви можете обрати, які категорії cookie дозволити.
            </p>
          </div>
          <button
            onClick={handleRejectOptional}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Закрити"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showDetails && (
          <div className="space-y-3 mb-4 pl-9">
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked disabled className="w-4 h-4 accent-primary" />
              <span className="text-foreground font-medium">Необхідні</span>
              <span className="text-muted-foreground">— завжди активні</span>
            </label>
            <label className="flex items-center gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.analytics}
                onChange={e => setPrefs(p => ({ ...p, analytics: e.target.checked }))}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-foreground font-medium">Аналітика</span>
              <span className="text-muted-foreground">— Google Analytics, статистика</span>
            </label>
            <label className="flex items-center gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.marketing}
                onChange={e => setPrefs(p => ({ ...p, marketing: e.target.checked }))}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-foreground font-medium">Маркетинг</span>
              <span className="text-muted-foreground">— Facebook Pixel, персоналізована реклама</span>
            </label>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pl-9">
          <button
            onClick={handleAcceptAll}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-input text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Прийняти всі
          </button>
          {showDetails ? (
            <button
              onClick={handleAcceptSelected}
              className="px-4 py-2 bg-muted text-foreground rounded-input text-sm font-medium hover:bg-muted/80 transition-colors border border-border"
            >
              Зберегти вибір
            </button>
          ) : (
            <button
              onClick={() => setShowDetails(true)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Налаштувати
            </button>
          )}
          <button
            onClick={handleRejectOptional}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Тільки необхідні
          </button>
        </div>
      </div>
    </div>
  )
}
