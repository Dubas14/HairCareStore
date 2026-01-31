'use client'

import { useState, useTransition } from 'react'
import { Mail, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { subscribeToNewsletter } from '@/app/actions/newsletter'

export function NewsletterSection() {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await subscribeToNewsletter(formData)

      if (result.success) {
        setMessage({ type: 'success', text: result.message! })
        ;(e.target as HTMLFormElement).reset()
      } else {
        setMessage({ type: 'error', text: result.error! })
      }
    })
  }

  return (
    <section className="py-12 md:py-14" style={{ backgroundColor: '#D4A373' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-full mb-4">
          <Mail className="w-7 h-7 text-white" />
        </div>

        {/* Header */}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
          Отримуйте ексклюзивні пропозиції
        </h2>
        <p className="text-sm text-white/90 mb-6">
          Підпішіться на розсилку та отримайте знижку -10% на першу покупку
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              name="email"
              placeholder="Ваш email"
              required
              disabled={isPending}
              className="flex-1 px-5 py-3.5 rounded-button bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 shadow-soft"
            />
            <Button
              type="submit"
              disabled={isPending}
              size="lg"
              className="bg-foreground hover:bg-foreground/90 text-background rounded-button px-8 whitespace-nowrap shadow-soft-lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Підписуємо...
                </>
              ) : (
                'Підписатися'
              )}
            </Button>
          </div>

          <div className="flex items-start gap-3 text-left justify-center">
            <input
              type="checkbox"
              name="consent"
              id="consent"
              required
              disabled={isPending}
              className="mt-1 w-4 h-4 rounded accent-white"
            />
            <label htmlFor="consent" className="text-sm text-white/90">
              Я погоджуюсь з умовами розсилки та політикою приватності
            </label>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`flex items-center justify-center gap-2 p-3 rounded-card ${
                message.type === 'success' ? 'bg-success/30 text-white' : 'bg-destructive/30 text-white'
              }`}
            >
              {message.type === 'success' && <Check className="w-5 h-5" />}
              <p className="text-sm">{message.text}</p>
            </div>
          )}
        </form>

        {/* Privacy Note */}
        <p className="text-xs text-white/70 mt-6">
          Ми поважаємо вашу приватність і не передаємо дані третім особам
        </p>
      </div>
    </section>
  )
}
