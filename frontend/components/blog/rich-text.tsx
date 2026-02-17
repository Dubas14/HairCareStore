'use client'

interface RichTextProps {
  content: any
}

function renderNode(node: any, index: number): React.ReactNode {
  if (!node) return null

  if (node.type === 'text' || (!node.type && node.text !== undefined)) {
    let element: React.ReactNode = node.text || ''
    if (node.format) {
      if (node.format & 1) element = <strong key={index}>{element}</strong>
      if (node.format & 2) element = <em key={index}>{element}</em>
      if (node.format & 4) element = <s key={index}>{element}</s>
      if (node.format & 8) element = <u key={index}>{element}</u>
      if (node.format & 16) element = <code key={index}>{element}</code>
    }
    return element
  }

  const children = node.children?.map((child: any, i: number) => renderNode(child, i))

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
      if (node.listType === 'number') return <ol key={index}>{children}</ol>
      return <ul key={index}>{children}</ul>
    case 'listitem':
      return <li key={index}>{children}</li>
    case 'link':
      return (
        <a key={index} href={node.fields?.url || '#'} target={node.fields?.newTab ? '_blank' : undefined} rel={node.fields?.newTab ? 'noopener noreferrer' : undefined}>
          {children}
        </a>
      )
    case 'quote':
      return <blockquote key={index}>{children}</blockquote>
    case 'upload': {
      const url = node.value?.url || node.fields?.url
      const alt = node.value?.alt || node.fields?.alt || ''
      if (url) return <img key={index} src={url} alt={alt} className="rounded-card" />
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

  const root = content.root || content

  return (
    <div className="rich-text-content prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary prose-strong:text-foreground prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground">
      {renderNode(root, 0)}
    </div>
  )
}
