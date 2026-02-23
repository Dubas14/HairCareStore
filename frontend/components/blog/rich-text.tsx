'use client'

import Image from 'next/image'
import type { LexicalNode } from '@/lib/payload/types'

interface RichTextProps {
  content: LexicalNode | LexicalNode[] | Record<string, unknown> | string | null | undefined
}

function renderNode(node: LexicalNode, index: number): React.ReactNode {
  if (!node) return null

  if (node.type === 'text' || (!node.type && node.text !== undefined)) {
    let element: React.ReactNode = node.text || ''
    const fmt = typeof node.format === 'number' ? node.format : 0
    if (fmt) {
      if (fmt & 1) element = <strong key={index}>{element}</strong>
      if (fmt & 2) element = <em key={index}>{element}</em>
      if (fmt & 4) element = <s key={index}>{element}</s>
      if (fmt & 8) element = <u key={index}>{element}</u>
      if (fmt & 16) element = <code key={index}>{element}</code>
    }
    return element
  }

  const children = node.children?.map((child: LexicalNode, i: number) => renderNode(child, i))
  const fields = (node as { fields?: Record<string, unknown> }).fields

  switch (node.type) {
    case 'root':
      return <>{children}</>
    case 'paragraph':
      return <p key={index}>{children}</p>
    case 'heading': {
      const Tag = `h${node.tag?.replace('h', '') || '2'}` as keyof React.JSX.IntrinsicElements
      return <Tag key={index}>{children}</Tag>
    }
    case 'list':
      if ((node as { listType?: string }).listType === 'number') return <ol key={index}>{children}</ol>
      return <ul key={index}>{children}</ul>
    case 'listitem':
      return <li key={index}>{children}</li>
    case 'link':
      return (
        <a key={index} href={String(fields?.url || '#')} target={fields?.newTab ? '_blank' : undefined} rel={fields?.newTab ? 'noopener noreferrer' : undefined}>
          {children}
        </a>
      )
    case 'quote':
      return <blockquote key={index}>{children}</blockquote>
    case 'upload': {
      const url = node.value?.url || (fields?.url as string | undefined)
      const alt = node.value?.alt || (fields?.alt as string | undefined) || ''
      if (url) return <Image key={index} src={url} alt={String(alt)} width={800} height={500} className="rounded-card w-full h-auto" />
      return null
    }
    case 'linebreak':
      return <br key={index} />
    default:
      if (children) return <div key={index}>{children}</div>
      return null
  }
}

export function RichText({ content }: RichTextProps) {
  if (!content) return null
  if (typeof content === 'string') return <p>{content}</p>

  const node = (content as { root?: LexicalNode }).root || content as LexicalNode

  return (
    <div className="rich-text-content prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary prose-strong:text-foreground prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground">
      {renderNode(node, 0)}
    </div>
  )
}
