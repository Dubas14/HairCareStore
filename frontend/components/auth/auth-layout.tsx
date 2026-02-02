'use client'

import { ReactNode } from 'react'
import Link from 'next/link'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20">
        <div className="mx-auto w-full max-w-md animate-fadeInUp">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3 group mb-12">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#2A9D8F] to-[#48CAE4] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <span className="text-white font-bold text-lg">H</span>
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-semibold tracking-tight">HAIR LAB</span>
          </Link>

          {/* Title */}
          <div className="mb-8">
            <h1 className="font-display text-3xl lg:text-4xl font-semibold tracking-tight mb-3">
              {title}
            </h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>

          {/* Form content */}
          {children}
        </div>
      </div>

      {/* Right side - Decorative panel */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-[#2A9D8F] via-[#3AA99B] to-[#48CAE4] relative overflow-hidden">
        {/* Decorative molecules */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Keratin molecule representation */}
          <svg
            className="absolute top-20 right-20 w-32 h-32 text-white/10 animate-float"
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="20" r="8" fill="currentColor" />
            <circle cx="20" cy="50" r="6" fill="currentColor" />
            <circle cx="80" cy="50" r="6" fill="currentColor" />
            <circle cx="35" cy="80" r="7" fill="currentColor" />
            <circle cx="65" cy="80" r="7" fill="currentColor" />
            <line x1="50" y1="20" x2="20" y2="50" stroke="currentColor" strokeWidth="2" />
            <line x1="50" y1="20" x2="80" y2="50" stroke="currentColor" strokeWidth="2" />
            <line x1="20" y1="50" x2="35" y2="80" stroke="currentColor" strokeWidth="2" />
            <line x1="80" y1="50" x2="65" y2="80" stroke="currentColor" strokeWidth="2" />
            <line x1="35" y1="80" x2="65" y2="80" stroke="currentColor" strokeWidth="2" />
          </svg>

          {/* Floating atoms */}
          <div
            className="absolute top-1/3 left-10 w-4 h-4 rounded-full bg-white/20 animate-float"
            style={{ animationDelay: '0.5s' }}
          />
          <div
            className="absolute top-1/2 right-16 w-3 h-3 rounded-full bg-white/15 animate-float"
            style={{ animationDelay: '1s' }}
          />
          <div
            className="absolute bottom-1/4 left-1/4 w-5 h-5 rounded-full bg-white/10 animate-float"
            style={{ animationDelay: '1.5s' }}
          />

          {/* Chemical formula hint */}
          <div className="absolute bottom-20 right-10 font-mono text-white/20 text-sm">
            C₄₅H₇₃N₁₃O₁₀S₂
          </div>

          {/* Hexagon pattern */}
          <svg
            className="absolute bottom-1/3 left-8 w-24 h-24 text-white/5"
            viewBox="0 0 100 100"
          >
            <polygon
              points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <polygon
              points="50,20 75,35 75,65 50,80 25,65 25,35"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center items-center p-12 relative z-10">
          <div className="text-center text-white max-w-md">
            <h2 className="font-display text-3xl font-semibold mb-6">
              Наука красивого волосся
            </h2>
            <p className="text-white/80 text-lg leading-relaxed mb-8">
              Індивідуальний підбір засобів на основі діагностики вашого типу волосся.
              Професійна косметика від провідних брендів.
            </p>

            {/* Features */}
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white/90">Персональні рекомендації</span>
              </div>

              <div className="flex items-center gap-3 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white/90">Історія замовлень</span>
              </div>

              <div className="flex items-center gap-3 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white/90">Ексклюзивні знижки</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full text-background">
            <path
              fill="currentColor"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
