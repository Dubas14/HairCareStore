'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useLogin, useCustomer } from '@/lib/hooks/use-customer'
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export function LoginForm() {
  const router = useRouter()
  const login = useLogin()
  const { refetch } = useCustomer()

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = "Обов'язкове поле"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Невірний формат email'
    }

    if (!formData.password) {
      newErrors.password = "Обов'язкове поле"
    } else if (formData.password.length < 6) {
      newErrors.password = 'Мінімум 6 символів'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setErrors({})

    try {
      await login.mutateAsync(formData)
      await refetch()
      router.push('/account')
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Помилка входу. Спробуйте ще раз.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General error */}
      {errors.general && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 animate-fadeInScale">
          <p className="text-sm text-destructive">{errors.general}</p>
        </div>
      )}

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          Email
        </label>
        <div className="relative">
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            className={`h-12 rounded-xl pl-4 pr-4 transition-all ${
              errors.email
                ? 'border-destructive focus-visible:ring-destructive'
                : 'focus-visible:ring-[#2A9D8F]'
            }`}
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive animate-fadeInUp">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          Пароль
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            placeholder="Введіть пароль"
            className={`h-12 rounded-xl pl-4 pr-12 transition-all ${
              errors.password
                ? 'border-destructive focus-visible:ring-destructive'
                : 'focus-visible:ring-[#2A9D8F]'
            }`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive animate-fadeInUp">{errors.password}</p>
        )}
      </div>

      {/* Forgot password link */}
      <div className="flex justify-end">
        <Link
          href="/account/forgot-password"
          className="text-sm text-muted-foreground hover:text-[#2A9D8F] transition-colors"
        >
          Забули пароль?
        </Link>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded-full bg-gradient-to-r from-[#2A9D8F] to-[#3AA99B] hover:from-[#238B7E] hover:to-[#2A9D8F] text-white font-medium shadow-lg hover:shadow-xl transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Входимо...
          </>
        ) : (
          'Увійти'
        )}
      </Button>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-sm text-muted-foreground">або</span>
        </div>
      </div>

      {/* Social login buttons */}
      <div className="space-y-3">
        <button
          type="button"
          className="w-full h-12 rounded-full border border-border bg-card hover:bg-muted flex items-center justify-center gap-3 font-medium transition-colors"
          disabled={isLoading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Увійти через Google
        </button>
      </div>

      {/* Register link */}
      <p className="text-center text-sm text-muted-foreground mt-8">
        Немає акаунту?{' '}
        <Link
          href="/account/register"
          className="font-medium text-[#2A9D8F] hover:text-[#238B7E] transition-colors"
        >
          Зареєструватися
        </Link>
      </p>
    </form>
  )
}
