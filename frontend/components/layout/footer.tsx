'use client'

import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Facebook, Instagram, Youtube } from "lucide-react"

const socialLinks = [
  { name: "Instagram", href: "https://instagram.com/hairlab.ua", icon: Instagram },
  { name: "Facebook", href: "https://facebook.com/hairlab.ua", icon: Facebook },
  { name: "YouTube", href: "https://youtube.com/@hairlab", icon: Youtube },
]

export function Footer() {
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')

  const footerLinks = {
    shop: {
      title: tNav('shop'),
      links: [
        { name: tNav('shop'), href: "/shop" },
        { name: tNav('brands'), href: "/brands" },
        { name: tNav('blog'), href: "/blog" },
      ],
    },
    help: {
      title: t('support'),
      links: [
        { name: tNav('delivery'), href: "/pages/delivery" },
        { name: tNav('contacts'), href: "/pages/contacts" },
      ],
    },
    company: {
      title: t('about'),
      links: [
        { name: tNav('about'), href: "/pages/about" },
        { name: tNav('account'), href: "/account" },
        { name: t('privacy'), href: "/privacy" },
      ],
    },
  }

  return (
    <footer className="relative overflow-hidden bg-[#120f12] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(42,157,143,0.08),_transparent_24%),radial-gradient(circle_at_85%_20%,_rgba(212,163,115,0.08),_transparent_20%)]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 lg:px-8 lg:pt-16">
        <div className="grid gap-10 border-t border-white/10 pt-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-lg">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/8">
                <Image
                  src="/logo.png"
                  alt="HAIRLAB"
                  width={34}
                  height={34}
                  className="relative object-contain"
                  style={{ width: "34px", height: "34px" }}
                />
              </div>

              <div className="leading-none">
                <div className="flex items-center gap-0.5 text-[1rem] font-black tracking-[0.2em] text-white">
                  <span>HAIR</span>
                  <span className="bg-gradient-to-r from-[#f7d7b2] via-[#7bd3c8] to-[#d7e7eb] bg-clip-text text-transparent">
                    LAB
                  </span>
                </div>
                <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.28em] text-white/42">
                  professional care
                </p>
              </div>
            </Link>

            <p className="mt-7 text-3xl font-semibold leading-[1.04] tracking-[-0.04em] text-white md:text-[2.2rem]">
              Догляд, до якого хочеться повертатись.
            </p>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/60 md:text-base">
              {t('aboutText')}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon

                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2.5 text-sm font-medium text-white/78 transition-colors duration-300 hover:bg-white/[0.06] hover:text-white"
                    aria-label={social.name}
                  >
                    <Icon className="h-4 w-4" />
                    {social.name}
                  </a>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {Object.entries(footerLinks).map(([key, section]) => (
              <div
                key={key}
                className="p-1"
              >
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/50">
                  {section.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/74 transition-colors duration-300 hover:text-white"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/46 md:flex-row md:items-center md:justify-between">
          <p>© 2026 HAIR LAB. {t('rights')}.</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/pages/delivery" className="transition-colors duration-300 hover:text-white/78">
              {tNav('delivery')}
            </Link>
            <Link href="/pages/contacts" className="transition-colors duration-300 hover:text-white/78">
              {tNav('contacts')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
