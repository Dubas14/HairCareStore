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
        e.currentTarget.reset()
      } else {
        setMessage({ type: 'error', text: result.error! })
      }
    })
  }

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-gold via-gold/90 to-secondary">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6">
          <Mail className="w-10 h-10 text-white" />
        </div>

        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Отримуйте ексклюзивні пропозиції
        </h2>
        <p className="text-lg text-white/90 mb-8">
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
              className="flex-1 px-4 py-3 rounded-lg bg-white text-dark placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={isPending}
              size="lg"
              className="bg-dark hover:bg-dark/90 text-white whitespace-nowrap"
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

          <div className="flex items-start gap-2 text-left">
            <input
              type="checkbox"
              name="consent"
              id="consent"
              required
              disabled={isPending}
              className="mt-1"
            />
            <label htmlFor="consent" className="text-sm text-white/90">
              Я погоджуюсь з умовами розсилки та політикою приватності
            </label>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                message.type === 'success' ? 'bg-green-500/20 text-white' : 'bg-red-500/20 text-white'
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
