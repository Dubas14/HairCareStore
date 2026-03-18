'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Droplets, Loader2, Send, Sparkles, Trash2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useChatStore } from '@/stores/chat-store'

const AUTO_OPEN_DELAY_MS = 12000
const AUTO_OPEN_SESSION_KEY = 'hair-lab-chat-auto-opened'

/**
 * Parse markdown-style content into React elements.
 * Supports: [text](url) links, **bold**, *italic*, numbered/bulleted lists.
 * Only allows relative paths starting with "/" to prevent XSS.
 */
function renderMessageContent(content: string): ReactNode[] {
  const lines = content.split('\n')
  const result: ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    if (i > 0) result.push(<br key={`br-${i}`} />)
    const line = lines[i]

    const numberedMatch = line.match(/^(\d+)[.)]\s+(.*)/)
    const bulletMatch = line.match(/^[-•]\s+(.*)/)

    if (numberedMatch) {
      result.push(
        <span key={`li-${i}`} className="ml-1 flex gap-1.5">
          <span className="flex-shrink-0 text-muted-foreground">{numberedMatch[1]}.</span>
          <span>{renderInline(numberedMatch[2], i)}</span>
        </span>
      )
    } else if (bulletMatch) {
      result.push(
        <span key={`li-${i}`} className="ml-1 flex gap-1.5">
          <span className="flex-shrink-0 text-muted-foreground">•</span>
          <span>{renderInline(bulletMatch[1], i)}</span>
        </span>
      )
    } else {
      result.push(<span key={`line-${i}`}>{renderInline(line, i)}</span>)
    }
  }

  return result
}

function renderLinks(text: string, lineIdx: number): ReactNode[] {
  const parts: ReactNode[] = []
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  let lastIndex = 0
  let match

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const linkText = match[1]
    const href = match[2]
    if (href.startsWith('/')) {
      parts.push(
        <Link
          key={`link-${lineIdx}-${match.index}`}
          href={href}
          className="text-primary underline hover:no-underline"
        >
          {linkText}
        </Link>
      )
    } else {
      parts.push(linkText)
    }
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

function renderInline(text: string, lineIdx: number): ReactNode[] {
  const parts: ReactNode[] = []
  const inlineRegex = /\*\*(.+?)\*\*|\*(.+?)\*/g
  let lastIndex = 0
  let match

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(...renderLinks(text.slice(lastIndex, match.index), lineIdx))
    }

    if (match[1]) {
      parts.push(
        <strong key={`b-${lineIdx}-${match.index}`}>{renderLinks(match[1], lineIdx)}</strong>
      )
    } else if (match[2]) {
      parts.push(<em key={`i-${lineIdx}-${match.index}`}>{renderLinks(match[2], lineIdx)}</em>)
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(...renderLinks(text.slice(lastIndex), lineIdx))
  }

  return parts
}

export function ChatWidget() {
  const t = useTranslations('chat')
  const {
    messages,
    isOpen,
    isLoading,
    addMessage,
    setLoading,
    toggleChat,
    openChat,
    closeChat,
    clearMessages,
  } = useChatStore()

  const pathname = usePathname()
  const [input, setInput] = useState('')
  const [hasMounted, setHasMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        closeChat()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeChat])

  useEffect(() => {
    if (!hasMounted || isOpen || messages.length > 0) return

    try {
      if (window.innerWidth < 1024) return
      if (sessionStorage.getItem(AUTO_OPEN_SESSION_KEY) === '1') return
    } catch {
      return
    }

    const isHomePage = pathname === '/'
    const delay = isHomePage ? 1500 : AUTO_OPEN_DELAY_MS

    const timer = window.setTimeout(() => {
      openChat()
      try {
        sessionStorage.setItem(AUTO_OPEN_SESSION_KEY, '1')
      } catch {
        // ignore
      }
    }, delay)

    return () => window.clearTimeout(timer)
  }, [hasMounted, isOpen, messages.length, openChat, pathname])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || isLoading) return

    setInput('')
    addMessage({ role: 'user', content: text })
    setLoading(true)

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })

      const data = await res.json()

      if (!res.ok) {
        addMessage({
          role: 'assistant',
          content: data.error || t('error'),
        })
      } else {
        addMessage({ role: 'assistant', content: data.reply })
      }
    } catch {
      addMessage({ role: 'assistant', content: t('error') })
    } finally {
      setLoading(false)
    }
  }, [input, isLoading, messages, addMessage, setLoading, t])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="group fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,241,234,0.96))] px-3 py-3 text-foreground shadow-[0_18px_40px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(0,0,0,0.16)] active:scale-[0.98]"
          aria-label={t('title')}
        >
          <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#e6ddd4] bg-[linear-gradient(135deg,#f7e8da_0%,#eef7f5_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(42,157,143,0.18),transparent_45%),radial-gradient(circle_at_70%_70%,rgba(212,163,115,0.22),transparent_52%)]" />
            <Droplets className="relative h-5 w-5 text-[#2A9D8F]" />
            <Sparkles className="absolute right-2 top-2 h-3 w-3 text-[#D4A373]" />
          </span>

          <span className="hidden pr-2 text-left sm:block">
            <span className="block text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/44">
              Hair AI
            </span>
            <span className="block text-sm font-semibold tracking-[-0.02em] text-foreground">
              Підібрати догляд
            </span>
          </span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-[2rem] border border-black/8 bg-card shadow-[0_28px_80px_rgba(0,0,0,0.18)] sm:w-[400px]">
          <div className="relative overflow-hidden border-b border-black/6 bg-[linear-gradient(135deg,#f7e8da_0%,#eef7f5_100%)] px-4 py-4 text-foreground">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(42,157,143,0.16),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(212,163,115,0.16),transparent_28%)]" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/70 bg-white/65 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(42,157,143,0.18),transparent_45%),radial-gradient(circle_at_70%_70%,rgba(212,163,115,0.2),transparent_52%)]" />
                  <Droplets className="relative h-4.5 w-4.5 text-[#2A9D8F]" />
                </div>

                <div>
                  <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/44">
                    Hair AI
                  </span>
                  <span className="block text-sm font-semibold tracking-[-0.02em]">
                    {t('title')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearMessages}
                    className="rounded-full p-2 transition-colors hover:bg-black/5"
                    aria-label={t('clear')}
                    title={t('clear')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={closeChat}
                  className="rounded-full p-2 transition-colors hover:bg-black/5"
                  aria-label={t('close')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[linear-gradient(180deg,#fffdfa_0%,#faf8f5_100%)] p-4">
            {messages.length === 0 && (
              <div className="rounded-[1.6rem] border border-black/6 bg-white px-5 py-8 text-center text-sm text-muted-foreground shadow-[0_12px_28px_rgba(0,0,0,0.04)]">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f7e8da_0%,#eef7f5_100%)]">
                  <Droplets className="h-5 w-5 text-[#2A9D8F]" />
                </div>
                <p>{t('greeting')}</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-br-md bg-[#1A1A1A] text-white'
                      : 'rounded-bl-md border border-black/6 bg-white text-foreground shadow-[0_10px_24px_rgba(0,0,0,0.04)]'
                  }`}
                >
                  {msg.role === 'user' ? msg.content : renderMessageContent(msg.content)}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-black/6 bg-white px-4 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-black/6 bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('placeholder')}
                maxLength={500}
                disabled={isLoading}
                className="flex-1 rounded-[1.1rem] border border-black/8 bg-[#fcfaf7] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#2A9D8F] focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/15 disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] bg-[#1A1A1A] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={t('send')}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
