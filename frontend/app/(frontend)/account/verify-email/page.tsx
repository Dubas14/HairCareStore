'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { verifyEmail, resendVerificationEmail } from '@/lib/payload/auth-actions'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading')
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('no-token')
      return
    }

    verifyEmail(token).then((result) => {
      if (result.success) {
        setStatus('success')
      } else {
        setStatus('error')
        setError(result.error || 'Невідома помилка')
      }
    })
  }, [token])

  async function handleResend() {
    setResending(true)
    const result = await resendVerificationEmail()
    setResending(false)
    if (result.success) {
      setResent(true)
    } else {
      setError(result.error || 'Не вдалося відправити лист')
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
            <h1 className="text-2xl font-bold">Перевіряємо...</h1>
            <p className="text-muted-foreground">Підтверджуємо вашу email-адресу</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <h1 className="text-2xl font-bold">Email підтверджено!</h1>
            <p className="text-muted-foreground">
              Ваша email-адреса успішно підтверджена. Тепер ви маєте повний доступ до акаунту.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/account"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition"
              >
                Мій акаунт
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-full font-medium hover:bg-muted transition"
              >
                До каталогу
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 mx-auto text-destructive" />
            <h1 className="text-2xl font-bold">Помилка підтвердження</h1>
            <p className="text-muted-foreground">{error}</p>
            {!resent ? (
              <button
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {resending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                Відправити новий лист
              </button>
            ) : (
              <p className="text-green-600 font-medium">Новий лист відправлено! Перевірте пошту.</p>
            )}
          </>
        )}

        {status === 'no-token' && (
          <>
            <Mail className="w-16 h-16 mx-auto text-muted-foreground" />
            <h1 className="text-2xl font-bold">Перевірте пошту</h1>
            <p className="text-muted-foreground">
              Ми відправили лист з посиланням для підтвердження на вашу email-адресу.
              Натисніть на посилання в листі.
            </p>
            {!resent ? (
              <button
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-2 text-primary hover:underline disabled:opacity-50"
              >
                {resending && <Loader2 className="w-4 h-4 animate-spin" />}
                Не отримали лист? Відправити повторно
              </button>
            ) : (
              <p className="text-green-600 font-medium">Лист відправлено повторно!</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
