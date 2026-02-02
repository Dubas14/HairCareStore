import Link from "next/link"
import Image from "next/image"
import { Instagram, Facebook, Youtube } from "lucide-react"

const footerLinks = {
  shop: {
    title: "Магазин",
    links: [
      { name: "Каталог", href: "/shop" },
      { name: "Новинки", href: "/shop" },
      { name: "Акції", href: "/shop" },
    ],
  },
  help: {
    title: "Допомога",
    links: [
      { name: "Доставка", href: "/pages/delivery" },
      { name: "Оплата", href: "/pages/payment" },
      { name: "Контакти", href: "/pages/contacts" },
    ],
  },
  company: {
    title: "Компанія",
    links: [
      { name: "Про нас", href: "/pages/about" },
    ],
  },
}

const socialLinks = [
  { name: "Instagram", href: "https://instagram.com", icon: Instagram },
  { name: "Facebook", href: "https://facebook.com", icon: Facebook },
  { name: "YouTube", href: "https://youtube.com", icon: Youtube },
]

export function Footer() {
  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="HAIRLAB"
                width={44}
                height={44}
                className="object-contain flex-shrink-0"
                style={{ width: "auto", height: "auto" }}
              />
              <div className="flex flex-col">
                <div className="flex items-baseline gap-0">
                  <span className="text-xl font-black text-white tracking-wide">HAIR</span>
                  <span
                    className="text-xl font-black tracking-wide"
                    style={{
                      background: 'linear-gradient(135deg, #2A9D8F, #48CAE4)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >LAB</span>
                </div>
                <span className="text-[9px] font-semibold text-white/50 tracking-[0.15em] uppercase">
                  Professional Care
                </span>
              </div>
            </Link>
            <p className="text-footer-foreground/70 leading-relaxed max-w-sm">
              Професійна косметика для волосся з науково підтвердженими інгредієнтами.
              Знайдіть ідеальний догляд для вашого волосся.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-footer-foreground/70 hover:text-footer-foreground transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-footer-foreground/60 text-sm">
            © 2026 HAIR LAB. Всі права захищені.
          </p>
          <div className="flex gap-6 text-sm text-footer-foreground/60">
            <Link href="/pages/delivery" className="hover:text-footer-foreground transition-colors">
              Доставка та оплата
            </Link>
            <Link href="/pages/contacts" className="hover:text-footer-foreground transition-colors">
              Контакти
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
